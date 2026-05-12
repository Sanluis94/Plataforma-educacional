/**
 * Student Repository — Persistência do progresso do estudante no Firestore.
 * Coleção: progress/{uid}
 * Gerencia XP, nível, moedas, módulos completados e itens comprados (gamificação).
 */
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { DEFAULT_PROGRESS } from '../types';
import type { ProgressData } from '../types';

// Manter interface legada para compatibilidade com UI
export interface StudentProgress {
  level: number;
  xp: number;
  coins: number;
}

const COLLECTION = 'progress';

/**
 * Busca o progresso do estudante. Cria documento default se não existir.
 */
export const getStudentProgress = async (uid?: string): Promise<ProgressData> => {
  if (!db || !uid) {
    console.warn('[StudentRepository] Firestore não inicializado ou sem UID.');
    return { ...DEFAULT_PROGRESS };
  }

  try {
    const docRef = doc(db, COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ProgressData;
    }

    // Primeiro acesso: cria progresso default
    const defaultData: ProgressData = {
      ...DEFAULT_PROGRESS,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, defaultData);
    return defaultData;
  } catch (error) {
    console.error('[StudentRepository] Erro ao buscar progresso:', error);
    return { ...DEFAULT_PROGRESS };
  }
};

/**
 * Salva/atualiza o progresso parcial do estudante (merge).
 */
export const saveStudentProgress = async (
  uid: string,
  progress: Partial<ProgressData>
): Promise<void> => {
  if (!db || !uid) {
    console.warn('[StudentRepository] Firestore não inicializado. Progresso não salvo.');
    return;
  }

  try {
    const docRef = doc(db, COLLECTION, uid);
    await setDoc(docRef, {
      ...progress,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('[StudentRepository] Erro ao salvar progresso:', error);
  }
};

/**
 * Registra um módulo como completado pelo estudante.
 */
export const addCompletedModule = async (uid: string, moduleId: string): Promise<void> => {
  if (!db || !uid) return;

  try {
    const docRef = doc(db, COLLECTION, uid);
    await updateDoc(docRef, {
      completedModules: arrayUnion(moduleId),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[StudentRepository] Erro ao registrar módulo:', error);
  }
};

/**
 * Registra um item comprado na loja de gamificação.
 */
export const addPurchasedItem = async (uid: string, itemId: string): Promise<void> => {
  if (!db || !uid) return;

  try {
    const docRef = doc(db, COLLECTION, uid);
    await updateDoc(docRef, {
      purchasedItems: arrayUnion(itemId),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[StudentRepository] Erro ao registrar compra:', error);
  }
};
