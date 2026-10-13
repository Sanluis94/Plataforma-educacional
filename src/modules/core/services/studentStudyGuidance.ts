import { getLearningLab } from '../constants/learningCatalog';
import { normalizeLearningEvidence, learningTimestamp } from '../../data/services/learningAnalytics';
import type { ActivityData, SubmissionData } from '../../data/types';
import type { LearningLevel } from '../constants/learningLevels';

export interface StudentStudySuggestion { title: string; message: string; href: string; actionLabel: string; evidenceCount: number }
export function buildStudentStudySuggestion(input: { classIds: string[]; activities: ActivityData[]; submissions: SubmissionData[]; level: LearningLevel }): StudentStudySuggestion {
  if (!input.classIds.length) return { title: 'Seu primeiro passo', message: 'Entre na turma com o código do professor para receber atividades e orientações.', href: '/estudante?tab=classes', actionLabel: 'Entrar na turma', evidenceCount: 0 };
  const records = input.submissions.filter(entry => entry.status === 'completed' && learningTimestamp(entry.submittedAt)).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const pending = input.activities.find(activity => activity.status === 'published' && activity.classId && input.classIds.includes(activity.classId) && !records.some(record => record.activityId === activity.id && record.classId === activity.classId));
  if (pending) return { title: 'Próxima atividade da turma', message: `“${pending.title}” ainda não tem entrega registrada. Comece pela proposta do professor.`, href: `/estudante?tab=activities&class=${encodeURIComponent(pending.classId!)}`, actionLabel: 'Ver atividade da turma', evidenceCount: 0 };
  const latest = new Map<string, SubmissionData>();
  for (const record of records) { const evidence = normalizeLearningEvidence(record.evidence); if (evidence?.stage === 'assessment' && !latest.has(`${record.classId}:${record.activityId}`)) latest.set(`${record.classId}:${record.activityId}`, { ...record, evidence }); }
  for (const record of latest.values()) {
    const incorrect = record.evidence?.questions?.filter(question => question.correct === false && question.selectedOption !== null) ?? [];
    if (!incorrect.length) continue;
    const lab = getLearningLab(record.evidence?.labId ?? record.activityId);
    if (lab && lab.academicLevel === input.level) return { title: 'Uma revisão que pode ajudar', message: `Na última tentativa de “${record.activityTitle}”, ${incorrect.length} de ${record.evidence!.questions!.length} respostas precisam de revisão. Reveja o conceito e compare os cenários; este registro não é um diagnóstico.`, href: `/simulacao?lab=${encodeURIComponent(lab.id)}&level=${lab.academicLevel}${input.classIds.includes(record.classId)&&record.evidence?.lessonPlanId?`&class=${encodeURIComponent(record.classId)}&lessonPlan=${encodeURIComponent(record.evidence.lessonPlanId)}`:''}`, actionLabel: 'Revisar este laboratório', evidenceCount: record.evidence!.questions!.length };
    if (record.classId && input.classIds.includes(record.classId)) return { title: 'Revise uma entrega da turma', message: `Há ${incorrect.length} resposta(s) incorreta(s) na última tentativa de “${record.activityTitle}”. Consulte a explicação e o parecer do professor antes de tentar novamente.`, href: `/estudante?tab=activities&class=${encodeURIComponent(record.classId)}`, actionLabel: 'Rever minhas respostas', evidenceCount: record.evidence!.questions!.length };
  }
  return { title: 'Escolha seu próximo estudo', message: latest.size ? 'Não há uma dificuldade específica demonstrada pelas respostas disponíveis. Você pode seguir as propostas da turma ou explorar outra atividade do seu nível.' : 'Ainda não há respostas avaliadas suficientes para indicar uma revisão específica. Comece pelas atividades da turma; suas respostas ajudarão a orientar os próximos passos.', href: `/estudante?tab=activities&class=${encodeURIComponent(input.classIds[0])}`, actionLabel: 'Ver atividades da turma', evidenceCount: latest.size };
}

export interface LastLearningLab { labId: string; classId?: string; lessonPlanId?: string }
const storageKey = (uid: string) => `kortex-last-learning-lab:${encodeURIComponent(uid)}`;
export function readLastLearningLab(uid: string): LastLearningLab | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(uid)) ?? 'null');
    if (!value || typeof value.labId !== 'string' || !getLearningLab(value.labId)) return null;
    const cleanId = (id: unknown): id is string => typeof id === 'string' && /^[\w.-]{1,180}$/.test(id);
    return { labId: value.labId, ...(cleanId(value.classId) && cleanId(value.lessonPlanId) ? { classId: value.classId, lessonPlanId: value.lessonPlanId } : {}) };
  } catch { return null; }
}
export function saveLastLearningLab(uid: string, lab: LastLearningLab) { try { localStorage.setItem(storageKey(uid), JSON.stringify(lab)); } catch { /* A shortcut must not block the learning activity. */ } }
export function lastLearningLabHref(last: LastLearningLab) { const lab = getLearningLab(last.labId); return `/simulacao?lab=${encodeURIComponent(last.labId)}${lab ? `&level=${lab.academicLevel}` : ''}${last.classId && last.lessonPlanId ? `&class=${encodeURIComponent(last.classId)}&lessonPlan=${encodeURIComponent(last.lessonPlanId)}` : ''}`; }
