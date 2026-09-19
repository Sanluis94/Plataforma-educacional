/**
 * Lesson Plan Repository — Planejamento de Aulas e Cronograma Bimestral/Semestral.
 * Permite ao professor organizar as aulas, habilidades BNCC, laboratórios e avaliações.
 */
import {
  collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import type { LessonPlanItem, BimesterPeriod } from '../types';

const COLLECTION = 'lesson_plans';
const LOCAL_LESSON_PLANS_KEY = 'edu_local_lesson_plans';

function getLocalLessonPlans(): LessonPlanItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_LESSON_PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLessonPlans(items: LessonPlanItem[]) {
  try {
    localStorage.setItem(LOCAL_LESSON_PLANS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Erro ao salvar planos de aula locais:', err);
  }
}

/**
 * Deduplica itens do plano de aula garantindo unicidade por ID e chave composta (turma, período, tópico, semana).
 */
export function deduplicateLessonPlans(plans: LessonPlanItem[]): LessonPlanItem[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const result: LessonPlanItem[] = [];

  for (const p of plans) {
    if (!p) continue;
    const id = p.id ? String(p.id).trim() : '';
    const key = `${p.turmaId || ''}|${p.periodo || ''}|${(p.topico || '').trim().toLowerCase()}|${p.ordemSemana || 0}`;

    if (id && seenIds.has(id)) continue;
    if (key && key !== '|||0' && seenKeys.has(key)) continue;

    if (id) seenIds.add(id);
    if (key && key !== '|||0') seenKeys.add(key);
    result.push(p);
  }
  return result;
}

/**
 * Salva um novo item no plano de aulas da turma.
 */
export const saveLessonPlanItem = async (
  item: Omit<LessonPlanItem, 'id'>
): Promise<LessonPlanItem> => {
  const sanitized = sanitizeForFirestore(item);
  let savedPlan: LessonPlanItem | null = null;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), sanitized);
      savedPlan = { id: docRef.id, ...sanitized } as LessonPlanItem;
    } catch (err) {
      console.warn('[LessonPlanRepository] Falha ao salvar no Firestore, usando fallback local:', err);
    }
  }

  if (!savedPlan) {
    savedPlan = { id: `lp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`, ...sanitized } as LessonPlanItem;
  }

  // Atualiza cache local com o ID consistente
  const plans = getLocalLessonPlans();
  const filtered = plans.filter(
    p => p.id !== savedPlan!.id &&
         !(p.turmaId === savedPlan!.turmaId &&
           p.periodo === savedPlan!.periodo &&
           p.topico?.trim().toLowerCase() === savedPlan!.topico?.trim().toLowerCase() &&
           p.ordemSemana === savedPlan!.ordemSemana)
  );
  filtered.push(savedPlan);
  saveLocalLessonPlans(deduplicateLessonPlans(filtered));

  return savedPlan;
};

/**
 * Atualiza um item do plano de aulas (ex: alterar status para 'concluida').
 */
export const updateLessonPlanItem = async (
  id: string,
  updates: Partial<LessonPlanItem>
): Promise<void> => {
  if (!db) {
    const plans = getLocalLessonPlans();
    const idx = plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      plans[idx] = { ...plans[idx], ...updates };
      saveLocalLessonPlans(plans);
    }
    return;
  }

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, updates);
};

/**
 * Deleta um item do plano de aula.
 */
export const deleteLessonPlanItem = async (id: string): Promise<void> => {
  if (!db) {
    const plans = getLocalLessonPlans().filter(p => p.id !== id);
    saveLocalLessonPlans(plans);
    return;
  }

  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Busca todos os planos de aula de uma turma (opcionalmente filtrado por bimestre).
 */
export const getLessonPlansByClass = async (
  classId: string,
  periodo?: BimesterPeriod
): Promise<LessonPlanItem[]> => {
  if (!db) {
    const plans = deduplicateLessonPlans(getLocalLessonPlans().filter(p => p.turmaId === classId));
    if (periodo) return plans.filter(p => p.periodo === periodo);
    return plans.sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0));
  }

  try {
    let q = query(
      collection(db, COLLECTION),
      where('turmaId', '==', classId)
    );
    if (periodo) {
      q = query(
        collection(db, COLLECTION),
        where('turmaId', '==', classId),
        where('periodo', '==', periodo)
      );
    }
    const snap = await getDocs(q);
    const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlanItem));
    const localPlans = getLocalLessonPlans().filter(p => p.turmaId === classId);
    const merged = deduplicateLessonPlans([...remoteList, ...localPlans]);
    const filtered = periodo ? merged.filter(p => p.periodo === periodo) : merged;
    filtered.sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0));
    return filtered;
  } catch (err) {
    console.error('[lessonPlanRepository] Erro ao buscar planos de aula:', err);
    const plans = deduplicateLessonPlans(getLocalLessonPlans().filter(p => p.turmaId === classId));
    return periodo ? plans.filter(p => p.periodo === periodo) : plans;
  }
};

/**
 * Escuta em tempo real o plano de aulas de uma turma.
 */
export const subscribeLessonPlansByClass = (
  classId: string,
  callback: (items: LessonPlanItem[]) => void
): (() => void) => {
  if (!db) {
    callback(deduplicateLessonPlans(getLocalLessonPlans().filter(p => p.turmaId === classId)));
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where('turmaId', '==', classId)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlanItem));
    data.sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0));
    callback(deduplicateLessonPlans(data));
  }, (error) => {
    console.error('[lessonPlanRepository] Erro no listener de planos de aula:', error);
  });
};

