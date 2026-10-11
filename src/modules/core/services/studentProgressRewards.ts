/** Shared reward calculation for activities and laboratory completions. */
export function calculateModuleRewards(score: number, currentXP: number, currentLevel: number, currentCoins: number) {
  const earnedXP = Math.floor(score * 0.8);
  const earnedCoins = Math.floor(score * 0.3);
  const xp = currentXP + earnedXP;
  const level = xp >= currentLevel * 500 ? currentLevel + 1 : currentLevel;
  return { xp, level, coins: currentCoins + earnedCoins, earnedXP, earnedCoins };
}
