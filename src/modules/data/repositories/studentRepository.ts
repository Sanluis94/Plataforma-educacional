/**
 * Student Repository — Persistência do progresso do estudante no Firestore.
 * Coleção: progress/{uid}
 * Gerencia XP, nível, moedas, módulos completados e itens comprados (gamificação).
 */
import { doc, getDoc, setDoc, updateDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { getLocalEtlProgress, saveLocalProgress } from '../services/localEtlClient';
import { DEFAULT_PROGRESS } from '../types';
import type { ProgressData } from '../types';
import { calculateModuleRewards } from '../../core/services/studentProgressRewards';
import { SHOP_ITEMS } from '../../core/constants/shopItems';

// Manter interface legada para compatibilidade com UI
export interface StudentProgress {
  level: number;
  xp: number;
  coins: number;
}

const COLLECTION = 'progress';

export interface StudentLabCompletion {
  progress: ProgressData;
  alreadyCompleted: boolean;
}

// Serialize local writes for the same student, including different labs. Remote
// writes additionally use Firestore transactions to protect other tabs/devices.
const laboratoryWrites = new Map<string, Promise<unknown>>();

/** Debit and ownership share one write, using stored balance across tabs. */
export async function purchaseStudentItem(uid:string,itemId:string):Promise<ProgressData>{
  const item=SHOP_ITEMS.find(item=>item.id===itemId);
  if(!uid||!item)throw new Error('Este item não está disponível.');
  const product=item;
  const previous=laboratoryWrites.get(uid)??Promise.resolve();
  const operation=previous.catch(()=>undefined).then(async()=>{
    function purchase(current:ProgressData):ProgressData{
      if(current.purchasedItems.includes(itemId))return current;
      if(current.coins<product.price)throw new Error('Você ainda não tem moedas suficientes para este item.');
      return {...current,coins:current.coins-product.price,purchasedItems:[...current.purchasedItems,itemId],updatedAt:new Date().toISOString()};
    }
    if(!db){const current=await getLocalEtlProgress(uid)??{...DEFAULT_PROGRESS,completedModules:[],purchasedItems:[]};const updated=purchase(current);if(updated!==current)await saveLocalProgress(uid,updated);return updated;}
    const reference=doc(db,COLLECTION,uid);
    return runTransaction(db,async transaction=>{const snapshot=await transaction.get(reference);const current={...DEFAULT_PROGRESS,...(snapshot.exists()?snapshot.data():{})} as ProgressData;const updated=purchase(current);if(updated!==current)transaction.set(reference,updated,{merge:true});return updated;});
  });
  laboratoryWrites.set(uid,operation);
  try{return await operation;}finally{if(laboratoryWrites.get(uid)===operation)laboratoryWrites.delete(uid);}
}

/** Records the completion and its reward together; failures reach the caller. */
export async function completeStudentLabProgress(uid: string, labId: string, score: number): Promise<StudentLabCompletion> {
  if (!uid || !labId || !Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error('Estudante, laboratório ou pontuação inválidos.');
  }
  const previousWrite = laboratoryWrites.get(uid) ?? Promise.resolve();
  const operation = previousWrite.catch(() => undefined).then(async () => {
    function update(current: ProgressData): StudentLabCompletion {
      if (current.completedModules?.includes(labId)) return { progress: current, alreadyCompleted: true };
      const { xp, level, coins } = calculateModuleRewards(score, current.xp, current.level, current.coins);
      return {
        progress: { ...current, xp, level, coins, completedModules: [...(current.completedModules ?? []), labId], updatedAt: new Date().toISOString() },
        alreadyCompleted: false,
      };
    }

    if (!db) {
      const current = await getLocalEtlProgress(uid) ?? { ...DEFAULT_PROGRESS, completedModules: [], purchasedItems: [] };
      const completion = update(current);
      if (!completion.alreadyCompleted) await saveLocalProgress(uid, completion.progress);
      return completion;
    }

    const progressRef = doc(db, COLLECTION, uid);
    return runTransaction(db, async transaction => {
      const snapshot = await transaction.get(progressRef);
      const current = snapshot.exists()
        ? { ...DEFAULT_PROGRESS, ...snapshot.data() } as ProgressData
        : { ...DEFAULT_PROGRESS, completedModules: [], purchasedItems: [] };
      const completion = update(current);
      if (!completion.alreadyCompleted) transaction.set(progressRef, completion.progress, { merge: true });
      return completion;
    });
  });
  laboratoryWrites.set(uid, operation);
  try {
    return await operation;
  } finally {
    if (laboratoryWrites.get(uid) === operation) laboratoryWrites.delete(uid);
  }
}

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
    throw error;
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
    console.warn('[StudentRepository] Firestore não inicializado. Salvando no LocalStorage.');
    if (uid) {
      await saveLocalProgress(uid, progress);
    }
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
    throw error;
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
    throw error;
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
    throw error;
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
