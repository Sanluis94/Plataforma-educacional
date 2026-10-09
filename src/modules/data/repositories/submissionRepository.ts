/**
 * Submission Repository — Persistência de submissões de atividades no Firestore.
 * Conecta o trabalho do aluno com a visão do professor.
 */
import {
  collection, addDoc, query, where, getDocs
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { SubmissionData } from '../types';
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
  if (!db) {
    console.warn('[SubmissionRepository] Firestore não inicializado. Salvando no LocalStorage.');
    return saveLocalSubmission(submission);
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
  if (!db) return [];

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
  if (!db) return [];

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
  if (!db) return false;

  const q = query(
    collection(db, COLLECTION),
    where('studentId', '==', studentId),
    where('activityId', '==', activityId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

const REVIEWS_COLLECTION = 'submission_reviews';

/**
 * Salva a avaliação da rubrica e parecer docente (SpeedGrader Kortex).
 */
export const saveSubmissionReview = async (
  review: {
    submissionId: string;
    professorId: string;
    rubricScores: Record<string, number>;
    totalScore: number;
    generalFeedback: string;
    gradedAt: string;
  }
): Promise<{ id: string } & typeof review> => {
  try {
    if (!db) {
      const storageKey = `kortex_review_${review.submissionId}`;
      const savedReview = { ...review, id: 'rev_' + Date.now() };
      localStorage.setItem(storageKey, JSON.stringify(savedReview));
      return savedReview;
    }

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review);
    return { ...review, id: docRef.id };
  } catch (err) {
    console.warn('[submissionRepository] Erro ao salvar review no Firestore. Salvando localmente:', err);
    const storageKey = `kortex_review_${review.submissionId}`;
    const savedReview = { ...review, id: 'rev_' + Date.now() };
    localStorage.setItem(storageKey, JSON.stringify(savedReview));
    return savedReview;
  }
};

/**
 * Obtém a avaliação gravada pelo professor para uma submissão.
 */
export const getSubmissionReview = async (
  submissionId: string
): Promise<any | null> => {
  try {
    if (!db) {
      const raw = localStorage.getItem(`kortex_review_${submissionId}`);
      return raw ? JSON.parse(raw) : null;
    }

    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('submissionId', '==', submissionId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      const raw = localStorage.getItem(`kortex_review_${submissionId}`);
      return raw ? JSON.parse(raw) : null;
    }
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (err) {
    console.warn('[submissionRepository] Erro ao buscar review:', err);
    const raw = localStorage.getItem(`kortex_review_${submissionId}`);
    return raw ? JSON.parse(raw) : null;
  }
};

