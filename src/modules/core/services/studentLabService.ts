import { getStudentProgress } from '../../data/repositories/studentRepository';
import { offlineSyncService } from './offlineSyncService';
import { getStudentClasses } from '../../data/repositories/classRepository';
import { getLessonPlansByClass } from '../../data/repositories/lessonPlanRepository';
import type { UserRole } from '../../data/types';
import type { LearningEvidence } from '../../data/learningAnalyticsTypes';

export interface CompletedLearningLab {
  id: string;
  title: string;
  classId?: string;
  lessonPlanId?: string;
}

/** Free practice stays in the student's history; assigned work goes only to its class. */
export async function completeStudentLab(studentId: string | undefined, role: UserRole | undefined, lab: CompletedLearningLab, score: number, evidence: LearningEvidence, studentName = 'Estudante') {
  if (!studentId || role !== 'estudante') return null;
  if (!evidence?.sessionId || evidence.source !== 'lab' || !Number.isFinite(score) || score < 0 || score > 100) throw new Error('Evidência do laboratório inválida.');
  if (lab.classId || lab.lessonPlanId) {
    if (!lab.classId || !lab.lessonPlanId) throw new Error('A atividade precisa identificar a turma e a aula.');
    const classes = await getStudentClasses(studentId);
    if (!classes.some(item => item.id === lab.classId)) throw new Error('Você não está matriculado na turma desta atividade.');
    const plans = await getLessonPlansByClass(lab.classId);
    if (!plans.some(plan => plan.id === lab.lessonPlanId && plan.laboratorioAssociadoId === lab.id)) throw new Error('O laboratório não corresponde à aula selecionada.');
  }
  const { queued } = await offlineSyncService.deliver({
    kind: 'submission', studentId,
    ...(evidence.stage === 'assessment' ? { rewardId: lab.id } : {}),
    submission: {
      activityId: lab.id, activityTitle: lab.title, classId: lab.classId ?? '', studentId, studentName,
      score: evidence.stage === 'assessment' ? score : 0, submittedAt: new Date().toISOString(), status: 'completed',
      evidence: { ...evidence, labId: lab.id, ...(lab.lessonPlanId ? { lessonPlanId: lab.lessonPlanId } : {}) },
    },
  });
  return { progress: queued ? null : await getStudentProgress(studentId), alreadyCompleted: false, queued };
}
