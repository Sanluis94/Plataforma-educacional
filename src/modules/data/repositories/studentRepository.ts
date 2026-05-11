/**
 * Student Repository — Persistência do progresso do estudante no Firestore.
 * Coleção: progress/{uid}
 * Gerencia XP, nível, moedas, módulos completados e itens comprados (gamificação).
 */
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { getLocalEtlProgress } from '../services/localEtlClient';
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
    return await getLocalEtlProgress(uid) ?? { ...DEFAULT_PROGRESS };
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
    return await getLocalEtlProgress(uid) ?? { ...DEFAULT_PROGRESS };
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
    });
  } catch (error) {
    console.error('[StudentRepository] Erro ao registrar compra:', error);
  }
};

/**
 * Gera um relatório de desempenho para o estudante.
 */
export const getStudentPerformanceReport = async (uid: string) => {
  if (!db || !uid) return null;

  try {
    const progress = await getStudentProgress(uid);
    // Para simplificar, o relatório de desempenho é derivado dos dados de progressão
    // e de logs ou submissões, caso existissem em uma sub-coleção separada.
    const performance = {
      level: progress.level,
      xp: progress.xp,
      completedModulesCount: progress.completedModules.length,
      purchasedItemsCount: progress.purchasedItems.length,
      lastActive: progress.updatedAt,
      // Uma nota simulada baseada nos módulos completados vs total (assumindo 10 como base).
      averageScore: Math.min(10, progress.completedModules.length * 2.5), 
    };

    return performance;
  } catch (error) {
    console.error('[StudentRepository] Erro ao gerar relatório de desempenho:', error);
    return null;
  }
};
