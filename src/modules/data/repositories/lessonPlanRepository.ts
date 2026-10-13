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
    throw new Error('Não foi possível guardar o plano neste dispositivo. Tente novamente.');
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
    const key = lessonPlanContentKey(p);

    if (id && seenIds.has(id)) continue;
    if (seenKeys.has(key)) continue;

    if (id) seenIds.add(id);
    seenKeys.add(key);
    result.push(p);
  }
  return result;
}

function lessonPlanContentKey(item: Omit<LessonPlanItem, 'id'>): string {
  return JSON.stringify([item.turmaId, item.periodo, (item.topico ?? '').trim().toLowerCase(), item.ordemSemana ?? 0, item.dataPrevista ?? '', (item.metodologia ?? '').trim(), item.competenciasBNCC ?? '', item.laboratorioAssociadoId ?? '', item.avaliacaoAssociadaId ?? '']);
}

/**
 * Salva um novo item no plano de aulas da turma.
 */
export const saveLessonPlanItem = async (
  item: Omit<LessonPlanItem, 'id'>
): Promise<LessonPlanItem> => {
  const sanitized = sanitizeForFirestore(item);
  if (!item.turmaId || !item.professorId || !item.topico.trim()) throw new Error('Selecione uma turma e informe o tópico da aula.');
  if (db) {
    const docRef = await addDoc(collection(db, COLLECTION), sanitized);
    return { ...sanitized, id: docRef.id } as LessonPlanItem;
  }
  const plans = getLocalLessonPlans();
  const existing = plans.find(plan => lessonPlanContentKey(plan) === lessonPlanContentKey(item));
  if (existing) return existing;
  const savedPlan: LessonPlanItem = { ...sanitized, id: `lp_${crypto.randomUUID()}` } as LessonPlanItem;
  saveLocalLessonPlans([...plans, savedPlan]);

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
    if (idx === -1) throw new Error('A aula não está mais disponível. Atualize o planejamento.');
    plans[idx] = { ...plans[idx], ...sanitizeForFirestore(updates), id };
    saveLocalLessonPlans(plans);
    return;
  }

  const docRef = doc(db, COLLECTION, id);
  const data = { ...updates };
  delete data.id;
  await updateDoc(docRef, sanitizeForFirestore(data));
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
    return (periodo ? plans.filter(p => p.periodo === periodo) : plans).sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0));
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
    const filtered = deduplicateLessonPlans(remoteList);
    filtered.sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0));
    return filtered;
  } catch (err) {
    console.error('[lessonPlanRepository] Erro ao buscar planos de aula:', err);
    throw err;
  }
};

/**
 * Escuta em tempo real o plano de aulas de uma turma.
 */
export const subscribeLessonPlansByClass = (
  classId: string,
  callback: (items: LessonPlanItem[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!db) {
    callback(deduplicateLessonPlans(getLocalLessonPlans().filter(p => p.turmaId === classId)).sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0)));
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
    onError?.(error);
  });
};

