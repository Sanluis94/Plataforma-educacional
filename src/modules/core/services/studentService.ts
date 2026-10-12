/**
 * Student Service — Lógica de negócio para operações do estudante.
 * Processa gamificação (XP, nível, moedas), compras na loja e IA adaptativa.
 */
import type { StudentContext } from '../../data/services/aiAdaptiveEngine';
import { getAdaptiveRecommendation } from '../../data/services/aiAdaptiveEngine';
import {
  saveStudentProgress,
  addPurchasedItem,
  completeStudentLabProgress,
} from '../../data/repositories/studentRepository';
import { writeLog } from '../../data/repositories/logRepository';

/**
 * Solicita recomendação adaptativa da IA (Gemini).
 */
export const getAIRecommendation = async (context: StudentContext) => {
  return await getAdaptiveRecommendation(context);
};

/**
 * Processa a conclusão de um módulo educacional.
 * Calcula XP, verifica level-up e persiste no Firestore.
 */
export const processModuleCompletion = async (
  uid: string,
  moduleId: string,
  score: number,
  _currentXP: number,
  _currentLevel: number,
  _currentCoins: number
) => {
  // Legacy callers still pass a screen snapshot; the transaction uses stored
  // progress so retries and simultaneous deliveries cannot overwrite it.
  void _currentXP;
  void _currentLevel;
  void _currentCoins;
  const completion = await completeStudentLabProgress(uid, moduleId, score);
  if (!completion.alreadyCompleted) await writeLog('activity', `Módulo completado: "${moduleId}" — Score: ${score}`, uid);
  const { xp, level, coins } = completion.progress;
  return { xp, level, coins };
};

/**
 * Processa compra de um item na loja de gamificação.
 */
export const processItemPurchase = async (
  uid: string,
  itemId: string,
  coins: number,
  items: { id: string; name: string; price: number; icon: string; owned: boolean }[]
) => {
  const item = items.find(i => i.id === itemId);
  if (!item || item.owned || coins < item.price) return null;

  const newCoins = coins - item.price;
  const newItems = items.map(i => i.id === itemId ? { ...i, owned: true } : i);

  // Persistir no Firestore
  await saveStudentProgress(uid, { coins: newCoins });
  await addPurchasedItem(uid, itemId);

  // Log
  await writeLog(
    'activity',
    `Item comprado: "${item.name}" por ${item.price} moedas`,
    uid
  );

  return { newCoins, newItems };
};
