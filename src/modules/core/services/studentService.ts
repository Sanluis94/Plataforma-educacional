/**
 * Student Service — Lógica de negócio para operações do estudante.
 * Processa gamificação (XP, nível, moedas), compras na loja e IA adaptativa.
 */
import type { StudentContext } from '../../data/services/aiAdaptiveEngine';
import { getAdaptiveRecommendation } from '../../data/services/aiAdaptiveEngine';
import {
  purchaseStudentItem,
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
export const processItemPurchase = async <T extends { id: string; name: string; price: number; icon: string; owned: boolean }>(
  uid: string,
  itemId: string,
  coins: number,
  items: T[]
) => {
  const item = items.find(i => i.id === itemId);
  if (!item || item.owned || coins < item.price) return null;

  const progress=await purchaseStudentItem(uid,itemId);
  const newCoins=progress.coins;
  const newItems=items.map(item=>({...item,owned:progress.purchasedItems.includes(item.id)}));

  // Log
  await writeLog(
    'activity',
    `Item comprado: "${item.name}" por ${item.price} moedas`,
    uid
  );

  return { newCoins, newItems, purchasedItems:progress.purchasedItems };
};
