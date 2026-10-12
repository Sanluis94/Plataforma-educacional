import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../core/services/firebaseConfig';
import { getLocalEtlClassReport } from '../services/localEtlClient';
import { buildClassLearningReport } from '../services/learningAnalytics';
import type { ClassLearningReport } from '../learningAnalyticsTypes';
import type { ActivityData, SubmissionData, ClassData, ProgressData, UserData, ExamData, ExamAttempt, LessonPlanItem } from '../types';

/** Fetch all sources for one class, then apply the same transformation as the batch/local ETL. */
export const getLiveClassReport = async (classId: string): Promise<ClassLearningReport | null> => {
  if (!db) return getLocalEtlClassReport(classId);
  const database = db;
  const classDoc = await getDoc(doc(database, 'classes', classId));
  if (!classDoc.exists()) return null;
  const classData = { ...classDoc.data(), id: classDoc.id } as ClassData & { id: string };
  const actor = auth?.currentUser?.uid;
  if (!actor) throw new Error('Entre novamente para consultar o relatório.');
  if (actor !== classData.professorId) {
    const profile = await getDoc(doc(database, 'users', actor));
    if (!profile.exists() || profile.data().role !== 'admin') throw new Error('Esta turma não pertence ao seu perfil de professor.');
  }
  async function rows<T>(name: string, field: string): Promise<T[]> {
    const snapshot = await getDocs(query(collection(database, name), where(field, '==', classId)));
    return snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id })) as T[];
  }
  const [activities, submissions, exams, examAttempts, lessonPlans, profiles] = await Promise.all([
    rows<ActivityData>('activities', 'classId'),
    rows<SubmissionData>('submissions', 'classId'),
    rows<ExamData>('exams', 'turmaId'),
    rows<ExamAttempt>('exam_attempts', 'turmaId'),
    rows<LessonPlanItem>('lesson_plans', 'turmaId'),
    Promise.all([...new Set(classData.studentIds ?? [])].map(async studentId => {
      const [user, progress] = await Promise.all([
        getDoc(doc(database, 'users', studentId)),
        getDoc(doc(database, 'progress', studentId)),
      ]);
      return {
        studentId,
        user: user.exists() ? { ...user.data(), id: studentId } as UserData : null,
        progress: progress.exists() ? progress.data() as ProgressData : undefined,
      };
    })),
  ]);
  // Permission/network errors reach the screen; partial data must not look like
  // a class without learning evidence.
  return buildClassLearningReport({
    classData, activities, submissions, exams, examAttempts, lessonPlans,
    users: profiles.flatMap(profile => profile.user ? [profile.user] : []),
    progress: Object.fromEntries(profiles.flatMap(profile => profile.progress ? [[profile.studentId, profile.progress]] : [])),
    source: 'firestore',
  });
};

export async function getProfessorLearningOverview(classIds: string[]) {
  const reports = await Promise.all([...new Set(classIds)].map(getLiveClassReport));
  if (reports.some(report => report === null)) throw new Error('Uma turma não está disponível para o relatório.');
  const available = reports.filter((report): report is ClassLearningReport => report !== null);
  const expected = available.reduce((sum, report) => sum + report.expectedCompletions, 0);
  const completed = available.reduce((sum, report) => sum + report.completedActivitiesCount, 0);
  const enrolled = available.reduce((sum, report) => sum + report.studentsCount, 0);
  const participated = available.reduce((sum, report) => sum + report.studentsWithEvidence, 0);
  return { completionRate: expected ? Math.round(completed / expected * 100) : null, engagement: enrolled ? Math.round(participated / enrolled * 100) : null };
}
