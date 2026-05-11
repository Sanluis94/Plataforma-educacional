/**
 * Class Repository — Persistência de turmas no Firestore.
 * Gerencia CRUD de turmas do professor e matrícula de alunos.
 */
import {
  collection, addDoc, query, where, getDocs,
  doc, deleteDoc, updateDoc, arrayUnion, increment, orderBy
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { getLocalEtlClassesByProfessor } from '../services/localEtlClient';
import type { ClassData } from '../types';

// Manter a interface Turma para compatibilidade com o front-end existente
export interface Turma {
  id: string;
  name: string;
  studentsCount: number;
}

const COLLECTION = 'classes';

/**
 * Busca turmas de um professor específico.
 */
export const getProfessorClasses = async (professorId?: string): Promise<Turma[]> => {
  if (!db || !professorId) {
    console.warn('[ClassRepository] Firestore não inicializado ou sem professorId.');
    return getLocalEtlClassesByProfessor(professorId);
  }

  try {
    const q = query(
      collection(db, COLLECTION),
      where('professorId', '==', professorId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      name: docSnap.data().name,
      studentsCount: docSnap.data().studentsCount || 0,
    }));
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar turmas:', error);
    return getLocalEtlClassesByProfessor(professorId);
  }
};

/**
 * Cria uma nova turma no Firestore.
 */
export const saveClass = async (
  name: string,
  professorId?: string,
  professorName?: string
): Promise<Turma> => {
  if (!db || !professorId) {
    console.warn('[ClassRepository] Firestore não inicializado. Turma salva localmente.');
    return { id: `local-${Date.now()}`, name, studentsCount: 0 };
  }

  const classData: Omit<ClassData, 'id'> = {
    name,
    professorId,
    professorName: professorName || 'Professor',
    studentsCount: 0,
    studentIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, COLLECTION), classData);
  return { id: docRef.id, name, studentsCount: 0 };
};

/**
 * Remove uma turma do Firestore.
 */
export const deleteClass = async (classId: string): Promise<void> => {
  if (!db) return;
  await deleteDoc(doc(db, COLLECTION, classId));
};

/**
 * Matricula um estudante em uma turma (adiciona no array + incrementa counter).
 */
export const enrollStudent = async (classId: string, studentId: string): Promise<void> => {
  if (!db) return;

  const classDoc = doc(db, COLLECTION, classId);
  await updateDoc(classDoc, {
    studentIds: arrayUnion(studentId),
    studentsCount: increment(1),
    updatedAt: new Date().toISOString(),
  });
};
