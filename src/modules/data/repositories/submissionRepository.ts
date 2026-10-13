/**
 * Submission Repository — Persistência de submissões de atividades no Firestore.
 * Conecta o trabalho do aluno com a visão do professor.
 */
import {
  collection, addDoc, query, where, getDocs, doc, setDoc, getDoc, runTransaction
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { SubmissionData } from '../types';
import { learningDocumentId } from '../services/learningCapture';
import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import {
  saveLocalSubmission,
  getLocalSubmissionsByStudent,
  getLocalSubmissionsByClass
} from '../services/localEtlClient';

const COLLECTION = 'submissions';

/**
 * Salva uma nova submissão de atividade pelo aluno.
 */
export const saveSubmission = async (
  submission: Omit<SubmissionData, 'id'>
): Promise<SubmissionData> => {
  if (!submission.studentId || !submission.activityId || !Number.isFinite(submission.score) || submission.score < 0 || submission.score > 100) {
    throw new Error('Aluno, atividade ou pontuação inválidos.');
  }
  if (!db) {
    return saveLocalSubmission(submission);
  }

  if (submission.evidence?.sessionId) {
    const id = learningDocumentId(submission.studentId, submission.evidence.sessionId, `${submission.classId}-${submission.evidence.stage ?? 'assessment'}`);
    const reference = doc(db, COLLECTION, id);
    try { await setDoc(reference, sanitizeForFirestore(submission)); }
    catch (error) {
      // Current rules allow creation and forbid updates. A confirmed existing
      // attempt is an acknowledgement of a retried delivery, not another grade.
      const existing = await getDoc(reference).catch(() => null);
      const data = existing?.exists() ? existing.data() as Omit<SubmissionData, 'id'> : null;
      if (data?.studentId === submission.studentId && data.classId === submission.classId && data.activityId === submission.activityId && data.evidence?.sessionId === submission.evidence.sessionId) return { ...data, id };
      throw error;
    }
    return { ...submission, id };
  }
  const docRef = await addDoc(collection(db, COLLECTION), submission);
  return { ...submission, id: docRef.id };
};

/**
 * Busca submissões de uma atividade específica (visão do professor).
 */
export const getSubmissionsByActivity = async (
  activityId: string
): Promise<SubmissionData[]> => {
  if (!db) return (await getLocalSubmissionsByStudent('')).filter(entry => entry.activityId === activityId);

  const q = query(
    collection(db, COLLECTION),
    where('activityId', '==', activityId)
  );

  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as SubmissionData[];

  docs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return docs;
};

/**
 * Busca submissões de um aluno em uma turma (visão do professor — relatório).
 */
export const getSubmissionsByStudentInClass = async (
  studentId: string,
  classId: string
): Promise<SubmissionData[]> => {
  if (!db) return (await getLocalSubmissionsByStudent(studentId)).filter(entry => entry.classId === classId);

  const q = query(
    collection(db, COLLECTION),
    where('studentId', '==', studentId),
    where('classId', '==', classId)
  );

  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as SubmissionData[];

  docs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return docs;
};

/**
 * Busca todas as submissões de um aluno (visão do aluno).
 */
export const getSubmissionsByStudent = async (
  studentId: string
): Promise<SubmissionData[]> => {
  if (!db) {
    return getLocalSubmissionsByStudent(studentId);
  }

  const q = query(
    collection(db, COLLECTION),
    where('studentId', '==', studentId)
  );

  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as SubmissionData[];

  docs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return docs;
};

/**
 * Busca todas as submissões de uma turma (visão do professor — resumo geral).
 */
export const getSubmissionsByClass = async (
  classId: string
): Promise<SubmissionData[]> => {
  if (!db) {
    return getLocalSubmissionsByClass(classId);
  }

  const q = query(
    collection(db, COLLECTION),
    where('classId', '==', classId)
  );

  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as SubmissionData[];

  docs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return docs;
};

/**
 * Verifica se o aluno já submeteu uma atividade específica.
 */
export const hasStudentSubmitted = async (
  studentId: string,
  activityId: string
): Promise<boolean> => {
  if (!db) return (await getLocalSubmissionsByStudent(studentId)).some(entry => entry.activityId === activityId);

  const q = query(
    collection(db, COLLECTION),
    where('studentId', '==', studentId),
    where('activityId', '==', activityId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

const REVIEWS_COLLECTION = 'submission_reviews';
const LOCAL_REVIEWS_KEY = 'edu_local_submission_reviews';
export interface SubmissionReviewSnapshot {
  version: number; gradedAt: string; rubricScores: Record<string, number>; totalScore: number; generalFeedback: string;
}
export interface SubmissionReview extends SubmissionReviewSnapshot {
  id: string; submissionId: string; classId: string; studentId: string; professorId: string;
  status: 'draft' | 'published'; updatedAt: string; history: SubmissionReviewSnapshot[];
}
export type SubmissionReviewInput = Omit<SubmissionReview, 'id' | 'version' | 'history' | 'updatedAt'> & { expectedVersion?: number };

function localReviews(): SubmissionReview[] {
  const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
  if (!raw) return [];
  const values = JSON.parse(raw);
  if (!Array.isArray(values)) throw new Error('Não foi possível ler os pareceres salvos neste dispositivo.');
  return values;
}
function nextReview(input: SubmissionReviewInput, previous: SubmissionReview | null): SubmissionReview {
  if (!input.submissionId || !input.classId || !input.studentId || !input.professorId || !['draft', 'published'].includes(input.status)) throw new Error('Parecer sem entrega, turma, aluno ou professor válido.');
  if (!Number.isFinite(input.totalScore) || input.totalScore < 0 || input.totalScore > 10 || !Number.isFinite(Date.parse(input.gradedAt))) throw new Error('Nota ou data do parecer inválida.');
  if (input.generalFeedback.length > 10000) throw new Error('O parecer deve ter até 10.000 caracteres.');
  const maximum: Record<string, number> = { crit_1: 4, crit_2: 3, crit_3: 3 };
  if (Object.entries(input.rubricScores).some(([key, value]) => !Object.hasOwn(maximum, key) || !Number.isFinite(value) || value < 0 || value > maximum[key])) throw new Error('Pontuação dos critérios inválida.');
  const total = Math.round(Object.values(input.rubricScores).reduce((sum, value) => sum + value, 0) * 10) / 10;
  if (total !== input.totalScore) throw new Error('A soma dos critérios não corresponde à nota do parecer.');
  if (input.status === 'published' && (Object.keys(input.rubricScores).length !== 3 || !input.generalFeedback.trim())) throw new Error('Preencha os três critérios e uma orientação antes de publicar para o aluno.');
  if (previous && (previous.classId !== input.classId || previous.studentId !== input.studentId || previous.professorId !== input.professorId)) throw new Error('Este parecer pertence a outra turma ou responsável.');
  if (input.expectedVersion !== undefined && input.expectedVersion !== (previous?.version ?? 0)) throw new Error('O parecer foi alterado em outra sessão. Recarregue antes de publicar; seu rascunho foi preservado.');
  if (previous?.status === 'published' && input.status === 'draft') throw new Error('Guarde a nova edição como rascunho neste dispositivo; o parecer publicado só será atualizado ao publicar novamente.');
  const history = previous?.status === 'published' ? previous.history ?? [] : [];
  const snapshot = previous?.status === 'published' ? [{ version: previous.version, gradedAt: previous.gradedAt, rubricScores: previous.rubricScores, totalScore: previous.totalScore, generalFeedback: previous.generalFeedback }] : [];
  return { id: input.submissionId, submissionId: input.submissionId, classId: input.classId, studentId: input.studentId, professorId: input.professorId, status: input.status, gradedAt: input.gradedAt, rubricScores: input.rubricScores, totalScore: input.totalScore, generalFeedback: input.generalFeedback.trim(), version: (previous?.version ?? 0) + 1, updatedAt: new Date().toISOString(), history: [...history, ...snapshot].slice(-20) };
}

/**
 * Salva a avaliação da rubrica e parecer docente (SpeedGrader Kortex).
 */
export const saveSubmissionReview = async (review: SubmissionReviewInput): Promise<SubmissionReview> => {
  if (!db) {
    const list = localReviews();
    const saved = nextReview(review, list.find(item => item.submissionId === review.submissionId) ?? null);
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify([...list.filter(item => item.submissionId !== review.submissionId), saved]));
    return saved;
  }
  const reference = doc(db, REVIEWS_COLLECTION, review.submissionId);
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference);
    const saved = nextReview(review, snapshot.exists() ? snapshot.data() as SubmissionReview : null);
    transaction.set(reference, saved);
    return saved;
  });
};

/**
 * Obtém a avaliação gravada pelo professor para uma submissão.
 */
export const getSubmissionReview = async (submissionId: string): Promise<SubmissionReview | null> => {
  if (!db) return localReviews().find(item => item.submissionId === submissionId) ?? null;
  const snapshot = await getDoc(doc(db, REVIEWS_COLLECTION, submissionId));
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as SubmissionReview : null;
};

export async function getSubmissionReviewsByClass(classId: string): Promise<SubmissionReview[]> {
  if (!db) return localReviews().filter(item => item.classId === classId);
  const snapshot = await getDocs(query(collection(db, REVIEWS_COLLECTION), where('classId', '==', classId)));
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id } as SubmissionReview));
}
export async function getPublishedSubmissionReviewsByStudent(studentId: string, classId: string): Promise<SubmissionReview[]> {
  if (!db) return localReviews().filter(item => item.studentId === studentId && item.classId === classId && item.status === 'published');
  const snapshot = await getDocs(query(collection(db, REVIEWS_COLLECTION), where('classId', '==', classId), where('studentId', '==', studentId), where('status', '==', 'published')));
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id } as SubmissionReview));
}

