import { collection, doc, getDoc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { GradebookWeights, SubmissionData } from '../types';
import type { SubmissionReview } from './submissionRepository';
import { getRepositoryActor } from './repositoryActor';

export const GRADE_PERIODS = ['atual', '1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre', '1º Semestre', '2º Semestre'] as const;
export type GradePeriod = typeof GRADE_PERIODS[number];
export interface UniversityPolicyWeights { p1: number; p2: number; labs: number; minPassDireta: number; minExameFinal: number }
export interface GradePolicyValues {
  classId: string; period: GradePeriod; professorId: string; weights: GradebookWeights;
  mode: 'school' | 'university'; universityWeights: UniversityPolicyWeights;
  p1ExamId: string | null; p2ExamId: string | null; participationScores: Record<string, number>;
  explanation: string; reviewMode: 'feedback-only' | 'replace-submission-score'; startDate: string | null; endDate: string | null;
}
export interface GradePolicy extends GradePolicyValues {
  id: string; version: number; updatedAt: string;
  history: (GradePolicyValues & { version: number; updatedAt: string })[];
}
const COLLECTION = 'grade_policies', LOCAL_KEY = 'edu_local_grade_policies';
function localPolicies(): GradePolicy[] { const raw = localStorage.getItem(LOCAL_KEY); const list: unknown = raw ? JSON.parse(raw) : []; if (!Array.isArray(list)) throw new Error('Os critérios salvos neste dispositivo não puderam ser lidos.'); return list; }
export function gradePolicyDocumentId(classId: string, period: GradePeriod): string { if (!classId || classId.includes('/') || !GRADE_PERIODS.includes(period)) throw new Error('Turma ou período inválido.'); return `${classId}__${period}`; }
export function validateGradePolicy(values: GradePolicyValues): void {
  gradePolicyDocumentId(values.classId, values.period);
  if (!values.professorId || values.weights.turmaId !== values.classId || !['school', 'university'].includes(values.mode) || !['feedback-only', 'replace-submission-score'].includes(values.reviewMode)) throw new Error('Critérios sem turma ou professor válido.');
  const school = [values.weights.pesoProvas, values.weights.pesoLabs, values.weights.pesoAtividades, values.weights.pesoParticipacao];
  const university = [values.universityWeights.p1, values.universityWeights.p2, values.universityWeights.labs];
  if ([...school, ...university].some(value => !Number.isFinite(value) || value < 0 || value > 100) || Math.abs(school.reduce((a, b) => a + b, 0) - 100) > 0.001 || Math.abs(university.reduce((a, b) => a + b, 0) - 100) > 0.001) throw new Error('Cada modelo de avaliação deve ter pesos entre 0 e 100, somando 100%.');
  if ([values.universityWeights.minPassDireta, values.universityWeights.minExameFinal, ...Object.values(values.participationScores)].some(value => !Number.isFinite(value) || value < 0 || value > 10)) throw new Error('Notas e critérios de aprovação devem ficar entre 0 e 10.');
  if (values.universityWeights.minExameFinal > values.universityWeights.minPassDireta) throw new Error('A nota para exame final não pode superar a aprovação direta.');
  if (values.p1ExamId && values.p1ExamId === values.p2ExamId) throw new Error('Selecione provas diferentes para P1 e P2.');
  if ((values.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.startDate)) || (values.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.endDate)) || (values.period !== 'atual' && (!values.startDate || !values.endDate)) || Boolean(values.startDate) !== Boolean(values.endDate) || (values.startDate && values.endDate && values.startDate > values.endDate)) throw new Error('Defina o início e o fim do período em ordem cronológica.');
  if (!values.explanation.trim() || values.explanation.length > 3000) throw new Error('Explique os critérios para os alunos em até 3.000 caracteres.');
}
export async function getGradePolicy(classId: string, period: GradePeriod = 'atual'): Promise<GradePolicy | null> {
  const id = gradePolicyDocumentId(classId, period);
  if (!db) return localPolicies().find(item => item.id === id) ?? null;
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  if(!snapshot.exists())return null;
  const policy={...snapshot.data(),id:snapshot.id} as GradePolicy;
  const actor=await getRepositoryActor();
  if(actor.role==='admin'||actor.uid===policy.professorId||actor.role==='coordenador'){
    const scores=await getDocs(collection(db,COLLECTION,id,'student_scores'));
    policy.participationScores=Object.fromEntries(scores.docs.map(value=>[value.id,value.data().score]));
  }else{
    const score=await getDoc(doc(db,COLLECTION,id,'student_scores',actor.uid));
    policy.participationScores=score.exists()?{[actor.uid]:score.data().score}:{};
  }
  return policy;
}
export async function listGradePolicies(classId: string): Promise<GradePolicy[]> {
  if (!db) return localPolicies().filter(item => item.classId === classId);
  const snapshot = await getDocs(query(collection(db, COLLECTION), where('classId', '==', classId)));
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id } as GradePolicy));
}
export async function saveGradePolicy(values: GradePolicyValues & { expectedVersion?: number }): Promise<GradePolicy> {
  validateGradePolicy(values);
  const id = gradePolicyDocumentId(values.classId, values.period);
  function next(previous: GradePolicy | null): GradePolicy {
    if (previous && previous.professorId !== values.professorId) throw new Error('Os critérios pertencem a outro professor.');
    if (values.expectedVersion !== undefined && values.expectedVersion !== (previous?.version ?? 0)) throw new Error('Os critérios foram alterados em outra sessão. Recarregue antes de salvar.');
    const clean: GradePolicyValues & {expectedVersion?:number} = {...values};
    delete clean.expectedVersion;
    const prior = previous ? [{ classId: previous.classId, period: previous.period, professorId: previous.professorId, weights: previous.weights, mode: previous.mode, universityWeights: previous.universityWeights, p1ExamId: previous.p1ExamId, p2ExamId: previous.p2ExamId, participationScores: previous.participationScores, explanation: previous.explanation, reviewMode: previous.reviewMode, startDate: previous.startDate ?? null, endDate: previous.endDate ?? null, version: previous.version, updatedAt: previous.updatedAt }] : [];
    return { ...clean, explanation: clean.explanation.trim(), id, version: (previous?.version ?? 0) + 1, updatedAt: new Date().toISOString(), history: [...(previous?.history ?? []), ...prior].slice(-20) };
  }
  if (!db) { const list = localPolicies(); const saved = next(list.find(item => item.id === id) ?? null); localStorage.setItem(LOCAL_KEY, JSON.stringify([...list.filter(item => item.id !== id), saved])); return saved; }
  const database=db,reference = doc(database, COLLECTION, id);
  const priorScores=await getDocs(collection(database,COLLECTION,id,'student_scores'));
  return runTransaction(database, async transaction => {
    const snapshot = await transaction.get(reference); const saved = next(snapshot.exists() ? snapshot.data() as GradePolicy : null);
    // Shared criteria never disclose a classmate's participation grade.
    transaction.set(reference,{...saved,participationScores:{},history:saved.history.map(value=>({...value,participationScores:{}}))});
    for(const prior of priorScores.docs)if(!Object.hasOwn(saved.participationScores,prior.id))transaction.delete(prior.ref);
    for(const [studentId,score] of Object.entries(saved.participationScores))transaction.set(doc(database,COLLECTION,id,'student_scores',studentId),{classId:saved.classId,period:saved.period,studentId,professorId:saved.professorId,score,version:saved.version,updatedAt:saved.updatedAt});
    return saved;
  });
}
/** The explicit class policy can apply a published teacher review to this consultation, preserving the original evidence. */
export function applyPublishedReviews(submissions: SubmissionData[], reviews: SubmissionReview[], policy: Pick<GradePolicy, 'classId' | 'reviewMode'> | null): SubmissionData[] {
  if (!policy || policy.reviewMode !== 'replace-submission-score') return submissions;
  const published = new Map(reviews.filter(review => review.status === 'published' && review.classId === policy.classId).map(review => [review.submissionId, review]));
  return submissions.map(submission => { const review = submission.id ? published.get(submission.id) : null; if (!review || submission.classId !== policy.classId || review.studentId !== submission.studentId || submission.evidence?.source === 'enem') return submission;
    return { ...submission, score: review.totalScore * 10, status: 'completed', evidence: submission.evidence ? { ...submission.evidence, stage: 'assessment' } : undefined };
  });
}
