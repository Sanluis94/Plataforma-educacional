/**
 * Activity Repository — Persistência de atividades educacionais no Firestore.
 * Criadas pelo professor via Construtor de Experiências.
 */
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { getLocalEtlActivitiesByClass, getLocalEtlActivitiesByProfessor, saveLocalActivity, updateLocalActivity, deleteLocalActivity } from '../services/localEtlClient';
import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import type { ActivityData } from '../types';

const COLLECTION = 'activities';

/**
 * Salva uma nova atividade no Firestore.
 */
export const saveActivity = async (activity: Omit<ActivityData, 'id'>): Promise<ActivityData> => {
  if (!db) {
    return saveLocalActivity(activity);
  }

  const docRef = await addDoc(collection(db, COLLECTION), sanitizeForFirestore(activity));
  return { ...activity, id: docRef.id };
};

/**
 * Busca atividades de um professor.
 */
export const getActivitiesByProfessor = async (professorId: string): Promise<ActivityData[]> => {
  if (!db) return getLocalEtlActivitiesByProfessor(professorId);

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
  if (!db) return getLocalEtlActivitiesByClass(classId);

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

/**
 * Escuta em tempo real as atividades publicadas para uma turma.
 */
export const subscribeActivitiesByClass = (
  classId: string,
  callback: (activities: ActivityData[]) => void,
  onError?: (error: unknown) => void
): (() => void) => {
  if (!db) {
    getLocalEtlActivitiesByClass(classId).then(callback).catch(error => onError?.(error));
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where('classId', '==', classId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ActivityData[];
    callback(data);
  }, (error) => {
    console.error('[ActivityRepository] Erro no listener de atividades:', error);
    onError?.(error);
  });
};

/**
 * Atualiza uma atividade existente.
 */
export const updateActivity = async (id: string, data: Partial<Omit<ActivityData, 'id'>>): Promise<void> => {
  if (!db) {
    return updateLocalActivity(id, data);
  }
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, sanitizeForFirestore(data));
};

/**
 * Deleta uma atividade pelo ID.
 */
export const deleteActivity = async (id: string): Promise<void> => {
  if (!db) {
    return deleteLocalActivity(id);
  }
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};
