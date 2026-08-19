/**
 * Class Repository — Persistência de turmas no Firestore.
 * Gerencia CRUD de turmas do professor e matrícula de alunos.
 */
import {
  collection, addDoc, query, where, getDocs, onSnapshot,
  doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { 
  getLocalEtlClassesByProfessor, 
  getLocalStudentClasses, 
  saveLocalClass, 
  enrollLocalStudent, 
  unenrollLocalStudent,
  getLocalComplementaryMaterials,
  saveLocalComplementaryMaterial,
  getLocalStudentMessages,
  saveLocalStudentMessage,
  replyLocalStudentMessage
} from '../services/localEtlClient';
import type { ClassData } from '../types';

// Manter a interface Turma para compatibilidade com o front-end existente
export interface Turma {
  id: string;
  name: string;
  studentsCount: number;
  professorName?: string;
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
      where('professorId', '==', professorId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      name: docSnap.data().name,
      studentsCount: docSnap.data().studentsCount || 0,
      createdAt: docSnap.data().createdAt || '',
    }));
    
    // Sort locally to avoid Firestore missing index issues
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar turmas:', error);
    return getLocalEtlClassesByProfessor(professorId);
  }
};

/**
 * Busca turmas nas quais um estudante está matriculado.
 */
export const getStudentClasses = async (studentId: string): Promise<Turma[]> => {
  if (!db || !studentId) {
    return getLocalStudentClasses(studentId);
  }

  try {
    const q = query(
      collection(db, COLLECTION),
      where('studentIds', 'array-contains', studentId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      name: docSnap.data().name,
      studentsCount: docSnap.data().studentsCount || 0,
      professorName: docSnap.data().professorName || 'Professor',
      createdAt: docSnap.data().createdAt || '',
    }));
    
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar turmas do estudante:', error);
    return [];
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
    console.warn('[ClassRepository] Firestore não inicializado. Turma salva localmente no LocalStorage.');
    const newClass = await saveLocalClass(name, professorId, professorName);
    return { id: newClass.id!, name: newClass.name, studentsCount: 0 };
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
  if (!db) {
    await enrollLocalStudent(classId, studentId);
    return;
  }

  const classDocRef = doc(db, COLLECTION, classId);
  const classSnap = await getDoc(classDocRef);
  
  if (!classSnap.exists()) {
    throw new Error('Turma não encontrada.');
  }

  const currentStudentIds = classSnap.data().studentIds || [];
  
  // Só adiciona se o aluno ainda não estiver na turma
  if (!currentStudentIds.includes(studentId)) {
    await updateDoc(classDocRef, {
      studentIds: arrayUnion(studentId),
      studentsCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  }
};

/**
 * Remove um estudante de uma turma (remove do array + decrementa counter).
 */
export const unenrollStudent = async (classId: string, studentId: string): Promise<void> => {
  if (!db) {
    await unenrollLocalStudent(classId, studentId);
    return;
  }

  const classDoc = doc(db, COLLECTION, classId);
  await updateDoc(classDoc, {
    studentIds: arrayRemove(studentId),
    studentsCount: increment(-1),
    updatedAt: new Date().toISOString(),
  });
};

export interface ComplementaryMaterial {
  id?: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
}

export interface StudentMessage {
  id?: string;
  studentId: string;
  studentName: string;
  message: string;
  replied: boolean;
  replyText?: string;
  createdAt: string;
  repliedAt?: string;
}

/**
 * Busca materiais complementares de uma turma.
 */
export const getComplementaryMaterials = async (classId: string): Promise<ComplementaryMaterial[]> => {
  if (!db) {
    return getLocalComplementaryMaterials(classId);
  }
  try {
    const q = collection(db, COLLECTION, classId, 'materials');
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplementaryMaterial));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar materiais:', error);
    return getLocalComplementaryMaterials(classId);
  }
};

/**
 * Publica um novo material complementar.
 */
export const addComplementaryMaterial = async (
  classId: string,
  title: string,
  description: string,
  link: string
): Promise<ComplementaryMaterial> => {
  if (!db) {
    return saveLocalComplementaryMaterial(classId, { title, description, link });
  }
  const newMaterial: Omit<ComplementaryMaterial, 'id'> = {
    title,
    description,
    link,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, COLLECTION, classId, 'materials'), newMaterial);
  return { id: docRef.id, ...newMaterial };
};

/**
 * Busca mensagens/dúvidas dos alunos enviadas para a turma.
 */
export const getStudentMessages = async (classId: string): Promise<StudentMessage[]> => {
  if (!db) {
    return getLocalStudentMessages(classId);
  }
  try {
    const q = collection(db, COLLECTION, classId, 'messages');
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentMessage));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar mensagens:', error);
    return getLocalStudentMessages(classId);
  }
};

/**
 * Envia uma pergunta/dúvida ao professor de uma turma.
 */
export const sendStudentMessage = async (
  classId: string,
  studentId: string,
  studentName: string,
  message: string
): Promise<StudentMessage> => {
  if (!db) {
    return saveLocalStudentMessage(classId, { studentId, studentName, message });
  }
  const newMsg: Omit<StudentMessage, 'id'> = {
    studentId,
    studentName,
    message,
    replied: false,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, COLLECTION, classId, 'messages'), newMsg);
  return { id: docRef.id, ...newMsg };
};

/**
 * Professor responde a uma dúvida e pode conceder XP/Moedas adicionais.
 */
export const replyStudentMessage = async (
  classId: string,
  messageId: string,
  replyText: string,
  bonusCoins = 0,
  bonusXp = 0,
  studentId?: string
): Promise<void> => {
  if (!db) {
    await replyLocalStudentMessage(classId, messageId, replyText, bonusCoins, bonusXp, studentId);
    return;
  }
  try {
    const msgDocRef = doc(db, COLLECTION, classId, 'messages', messageId);
    await updateDoc(msgDocRef, {
      replied: true,
      replyText,
      repliedAt: new Date().toISOString()
    });

    // Se houver recompensa e o ID do aluno, adiciona no progresso dele
    if (studentId && (bonusCoins > 0 || bonusXp > 0)) {
      const studentDocRef = doc(db, 'progress', studentId);
      const studentSnap = await getDoc(studentDocRef);
      if (studentSnap.exists()) {
        const data = studentSnap.data();
        const currentXp = data.xp || 0;
        const currentCoins = data.coins || 0;
        const newXp = currentXp + bonusXp;
        const newCoins = currentCoins + bonusCoins;
        const newLevel = Math.floor(newXp / 500) + 1;
        await updateDoc(studentDocRef, {
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('[ClassRepository] Erro ao responder dúvida:', error);
  }
};

/**
 * Escuta reativa em tempo real de materiais complementares da turma.
 */
export const subscribeComplementaryMaterials = (
  classId: string,
  callback: (materials: ComplementaryMaterial[]) => void
): () => void => {
  if (!db) {
    getLocalComplementaryMaterials(classId).then(callback);
    return () => {};
  }
  const q = collection(db, COLLECTION, classId, 'materials');
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplementaryMaterial));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(docs);
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de materiais:', err);
    getLocalComplementaryMaterials(classId).then(callback);
  });
};

/**
 * Escuta reativa em tempo real de mensagens de alunos na turma.
 */
export const subscribeStudentMessages = (
  classId: string,
  callback: (messages: StudentMessage[]) => void
): () => void => {
  if (!db) {
    getLocalStudentMessages(classId).then(callback);
    return () => {};
  }
  const q = collection(db, COLLECTION, classId, 'messages');
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentMessage));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(docs);
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de mensagens:', err);
    getLocalStudentMessages(classId).then(callback);
  });
};
