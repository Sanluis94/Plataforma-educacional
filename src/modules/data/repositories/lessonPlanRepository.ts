/**
 * Lesson Plan Repository — Planejamento de Aulas e Cronograma Bimestral/Semestral.
 * Permite ao professor organizar as aulas, habilidades BNCC, laboratórios e avaliações.
 */
import {
  collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
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
 * Salva um novo item no plano de aulas da turma.
 */
export const saveLessonPlanItem = async (
  item: Omit<LessonPlanItem, 'id'>
): Promise<LessonPlanItem> => {
  if (!db) {
    const plans = getLocalLessonPlans();
    const newPlan: LessonPlanItem = { id: `lp_${Date.now()}`, ...item };
    plans.push(newPlan);
    saveLocalLessonPlans(plans);
    return newPlan;
  }

  const docRef = await addDoc(collection(db, COLLECTION), item);
  return { id: docRef.id, ...item };
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
    const plans = getLocalLessonPlans().filter(p => p.turmaId === classId);
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
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlanItem));
    list.sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0));
    return list;
  } catch (err) {
    console.error('[lessonPlanRepository] Erro ao buscar planos de aula:', err);
    const plans = getLocalLessonPlans().filter(p => p.turmaId === classId);
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
    callback(getLocalLessonPlans().filter(p => p.turmaId === classId));
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION),
    where('turmaId', '==', classId)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlanItem));
    data.sort((a, b) => (a.ordemSemana || 0) - (b.ordemSemana || 0));
    callback(data);
  }, (error) => {
    console.error('[lessonPlanRepository] Erro no listener de planos de aula:', error);
  });
};
