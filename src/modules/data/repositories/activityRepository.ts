/**
 * Activity Repository — Persistência de atividades educacionais no Firestore.
 * Criadas pelo professor via Construtor de Experiências.
 */
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { ActivityData } from '../types';

const COLLECTION = 'activities';

/**
 * Salva uma nova atividade no Firestore.
 */
export const saveActivity = async (activity: Omit<ActivityData, 'id'>): Promise<ActivityData> => {
  if (!db) {
    throw new Error('Firestore não inicializado.');
  }

  const docRef = await addDoc(collection(db, COLLECTION), activity);
  return { ...activity, id: docRef.id };
};

/**
 * Busca atividades de um professor.
 */
export const getActivitiesByProfessor = async (professorId: string): Promise<ActivityData[]> => {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('professorId', '==', professorId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityData[];
};

/**
 * Busca atividades de uma turma específica.
 */
export const getActivitiesByClass = async (classId: string): Promise<ActivityData[]> => {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    where('classId', '==', classId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ActivityData[];
};
