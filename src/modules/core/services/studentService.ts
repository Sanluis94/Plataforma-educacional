import type { StudentContext } from '../../data/services/aiAdaptiveEngine';
import { getAdaptiveRecommendation } from '../../data/services/aiAdaptiveEngine';
import type { StudentProgress } from '../../data/repositories/studentRepository';
import { saveStudentProgress } from '../../data/repositories/studentRepository';

export const getAIRecommendation = async (context: StudentContext) => {
  return await getAdaptiveRecommendation(context);
};

export const processModuleCompletion = (
  score: number, 
  currentXP: number, 
  currentLevel: number, 
  currentCoins: number
) => {
  const earnedXP = Math.floor(score * 0.8);
  const earnedCoins = Math.floor(score * 0.3);
  
  let newXP = currentXP + earnedXP;
  let newLevel = currentLevel;
  let newCoins = currentCoins + earnedCoins;

  if (newXP >= newLevel * 500) {
    newLevel += 1;
  }

  const updatedProgress: StudentProgress = { xp: newXP, level: newLevel, coins: newCoins };
  saveStudentProgress(updatedProgress);

  return updatedProgress;
};

export const processItemPurchase = (
  itemId: string, 
  coins: number, 
  items: any[]
) => {
  const item = items.find(i => i.id === itemId);
  if (!item || item.owned || coins < item.price) return null;

  const newCoins = coins - item.price;
  const newItems = items.map(i => i.id === itemId ? { ...i, owned: true } : i);

  saveStudentProgress({ xp: 0, level: 0, coins: newCoins }); // Simplificado para o exemplo

  return { newCoins, newItems };
};
