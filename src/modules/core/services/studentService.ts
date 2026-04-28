/**
 * Student Service — Lógica de negócio para operações do estudante.
 * Processa gamificação (XP, nível, moedas), compras na loja e IA adaptativa.
 */
import type { StudentContext } from '../../data/services/aiAdaptiveEngine';
import { getAdaptiveRecommendation } from '../../data/services/aiAdaptiveEngine';
import {
  saveStudentProgress,
  addCompletedModule,
  addPurchasedItem,
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
  currentXP: number,
  currentLevel: number,
  currentCoins: number
) => {
  const earnedXP = Math.floor(score * 0.8);
  const earnedCoins = Math.floor(score * 0.3);

  let newXP = currentXP + earnedXP;
  let newLevel = currentLevel;
  const newCoins = currentCoins + earnedCoins;

  // Level up a cada 500 XP por nível
  if (newXP >= newLevel * 500) {
    newLevel += 1;
  }

  const updatedProgress = { xp: newXP, level: newLevel, coins: newCoins };

  // Persistir no Firestore
  await saveStudentProgress(uid, updatedProgress);
  await addCompletedModule(uid, moduleId);

  // Log do sistema
  await writeLog(
    'activity',
    `Módulo completado: "${moduleId}" — Score: ${score}, +${earnedXP} XP, +${earnedCoins} moedas`,
    uid
  );

  return updatedProgress;
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
