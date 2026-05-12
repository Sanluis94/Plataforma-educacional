import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { ActivityData, ClassData, ProgressData, UserData } from '../types';

type ReportStatus = 'precisa_apoio' | 'regular' | 'em_destaque';

type ActivitySubmission = {
  studentId?: string;
  score?: number;
  status?: string;
  timeSpentMinutes?: number;
  completedAt?: string;
};

type ActivityWithReportData = ActivityData & {
  module?: string;
  submissions?: ActivitySubmission[];
};

type LearningEvent = {
  studentId: string;
  activityId: string;
  module: string;
  score: number;
  status: string;
  timeSpentMinutes: number;
};

export type ClassReport = {
  classId: string;
  className: string;
  professorName: string;
  studentsCount: number;
  activitiesCount: number;
  averageScore: number;
  completionRate: number;
  topModule: string;
  averageTimeSpentMinutes: number;
  atRiskStudents: string[];
  students: Array<{
    studentId: string;
    studentName: string;
    level: number;
    xp: number;
    coins: number;
    completedModulesCount: number;
    averageScore: number;
    status: ReportStatus;
  }>;
  modules: Array<{
    module: string;
    eventsCount: number;
    averageScore: number;
  }>;
};

export const getClassReport = async (classId: string): Promise<ClassReport | null> => {
  if (!db || !classId) return null;

  const classSnap = await getDoc(doc(db, 'classes', classId));
  if (!classSnap.exists()) return null;

  const classData = {
    id: classSnap.id,
    ...classSnap.data(),
  } as ClassData;

  const studentIds = uniqueStrings(classData.studentIds ?? []);
  const activitiesSnap = await getDocs(query(
    collection(db, 'activities'),
    where('classId', '==', classId),
  ));
  const activities = activitiesSnap.docs.map(activityDoc => ({
    id: activityDoc.id,
    ...activityDoc.data(),
  })) as ActivityWithReportData[];

  const [studentSnaps, progressSnaps] = await Promise.all([
    Promise.all(studentIds.map(studentId => getDoc(doc(db!, 'users', studentId)))),
    Promise.all(studentIds.map(studentId => getDoc(doc(db!, 'progress', studentId)))),
  ]);

  const usersById = new Map(
    studentSnaps
      .filter(studentSnap => studentSnap.exists())
      .map(studentSnap => [studentSnap.id, studentSnap.data() as UserData]),
  );
  const progressById = new Map(
    progressSnaps
      .filter(progressSnap => progressSnap.exists())
      .map(progressSnap => [progressSnap.id, progressSnap.data() as ProgressData]),
  );
  const studentIdSet = new Set(studentIds);
  const learningEvents = buildLearningEvents(activities, studentIdSet);
  const completedEvents = learningEvents.filter(event => event.status === 'completed');
  const publishedActivities = activities.filter(activity => activity.status === 'published');
  const expectedCompletions = studentIds.length * publishedActivities.length;
  const students = studentIds.map(studentId => {
    const user = usersById.get(studentId);
    const progress = progressById.get(studentId);
    const studentEvents = learningEvents.filter(event => event.studentId === studentId);
    const averageScore = average(studentEvents.map(event => event.score));
    const completedModulesCount = progress?.completedModules.length ?? 0;
    const status = classifyStudent(averageScore, completedModulesCount, studentEvents.length);

    return {
      studentId,
      studentName: user?.name ?? 'Aluno sem cadastro',
      level: progress?.level ?? 1,
      xp: progress?.xp ?? 0,
      coins: progress?.coins ?? 0,
      completedModulesCount,
      averageScore,
      status,
    };
  });
  const modules = buildModuleMetrics(activities, learningEvents);

  return {
    classId,
    className: classData.name,
    professorName: classData.professorName ?? 'Professor',
    studentsCount: studentIds.length || classData.studentsCount || 0,
    activitiesCount: activities.length,
    averageScore: average(learningEvents.map(event => event.score)),
    completionRate: expectedCompletions ? round((completedEvents.length / expectedCompletions) * 100) : 0,
    topModule: modules[0]?.module ?? 'Sem atividades',
    averageTimeSpentMinutes: average(learningEvents.map(event => event.timeSpentMinutes)),
    atRiskStudents: students.filter(student => student.status === 'precisa_apoio').map(student => student.studentName),
    students,
    modules,
  };
};

function buildLearningEvents(activities: ActivityWithReportData[], studentIds: Set<string>): LearningEvent[] {
  return activities.flatMap(activity => {
    const submissions = Array.isArray(activity.submissions) ? activity.submissions : [];
    const moduleName = moduleFromActivity(activity);

    return submissions
      .filter(submission => submission.studentId && studentIds.has(submission.studentId))
      .map(submission => ({
        studentId: submission.studentId!,
        activityId: activity.id ?? '',
        module: moduleName,
        score: numberValue(submission.score, 0),
        status: submission.status ?? 'completed',
        timeSpentMinutes: numberValue(submission.timeSpentMinutes, 0),
      }));
  });
}

function buildModuleMetrics(activities: ActivityWithReportData[], events: LearningEvent[]) {
  const grouped = new Map<string, LearningEvent[]>();
  for (const event of events) {
    grouped.set(event.module, [...(grouped.get(event.module) ?? []), event]);
  }

  if (grouped.size === 0) {
    return uniqueStrings(activities.map(moduleFromActivity))
      .map(module => ({
        module,
        eventsCount: 0,
        averageScore: 0,
      }))
      .sort((a, b) => a.module.localeCompare(b.module));
  }

  return [...grouped.entries()]
    .map(([module, moduleEvents]) => ({
      module,
      eventsCount: moduleEvents.length,
      averageScore: average(moduleEvents.map(event => event.score)),
    }))
    .sort((a, b) => b.eventsCount - a.eventsCount);
}

function classifyStudent(averageScore: number, completedModulesCount: number, eventsCount: number): ReportStatus {
  if (eventsCount === 0 && completedModulesCount === 0) return 'regular';
  if (averageScore > 0 && averageScore < 60) return 'precisa_apoio';
  if (averageScore >= 85 || completedModulesCount >= 3) return 'em_destaque';
  return 'regular';
}

function moduleFromActivity(activity: ActivityWithReportData) {
  const configModule = typeof activity.config?.module === 'string' ? activity.config.module : undefined;
  return activity.module ?? configModule ?? activity.type ?? 'geral';
}

function uniqueStrings(values: unknown[]) {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0))];
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function average(values: number[]) {
  const validValues = values.filter(value => Number.isFinite(value));
  if (validValues.length === 0) return 0;
  return round(validValues.reduce((total, value) => total + value, 0) / validValues.length);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
