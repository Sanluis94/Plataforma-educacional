/**
 * Submission Repository — Persistência de submissões de atividades no Firestore.
 * Conecta o trabalho do aluno com a visão do professor.
 */
import {
  collection, addDoc, query, where, getDocs
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { SubmissionData } from '../types';

const COLLECTION = 'submissions';

/**
 * Salva uma nova submissão de atividade pelo aluno.
 */
export const saveSubmission = async (
  submission: Omit<SubmissionData, 'id'>
): Promise<SubmissionData> => {
  if (!db) {
    console.warn('[SubmissionRepository] Firestore não inicializado.');
    return { ...submission, id: `local-${Date.now()}` };
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
  if (!db) return [];

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
  if (!db) return [];

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
