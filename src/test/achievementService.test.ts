/**
 * Testes do Achievement Service — Sistema de conquistas dinâmicas.
 * Valida a lógica de avaliação de conquistas baseada no progresso.
 */
import { describe, it, expect } from 'vitest';
import { evaluateAchievements, detectNewAchievements } from '../modules/core/services/achievementService';
import type { ProgressData } from '../modules/data/types';

const makeProgress = (overrides: Partial<ProgressData> = {}): ProgressData => ({
  level: 1,
  xp: 0,
  coins: 0,
  completedModules: [],
  purchasedItems: [],
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('evaluateAchievements', () => {
  it('should return all achievements as locked for a new student', () => {
    const achievements = evaluateAchievements(makeProgress());
    const unlocked = achievements.filter(a => a.unlocked);
    expect(unlocked).toHaveLength(0);
  });

  it('should unlock "Pioneiro" when 1 module is completed', () => {
    const achievements = evaluateAchievements(makeProgress({
      completedModules: ['matematica'],
    }));
    const pioneer = achievements.find(a => a.id === 'pioneer');
    expect(pioneer?.unlocked).toBe(true);
  });

  it('should unlock "Matemático Célere" when matematica is completed', () => {
    const achievements = evaluateAchievements(makeProgress({
      completedModules: ['matematica'],
    }));
    const math = achievements.find(a => a.id === 'math_whiz');
    expect(math?.unlocked).toBe(true);
  });

  it('should unlock "Cientista Iniciante" when quimica is completed', () => {
    const achievements = evaluateAchievements(makeProgress({
      completedModules: ['quimica'],
    }));
    const scientist = achievements.find(a => a.id === 'scientist');
    expect(scientist?.unlocked).toBe(true);
  });

  it('should unlock "Desbravador" when level >= 5', () => {
    const achievements = evaluateAchievements(makeProgress({
      level: 5,
    }));
    const level5 = achievements.find(a => a.id === 'level5');
    expect(level5?.unlocked).toBe(true);
  });

  it('should unlock "Milhar de XP" when xp >= 1000', () => {
    const achievements = evaluateAchievements(makeProgress({
      xp: 1000,
    }));
    const xp1000 = achievements.find(a => a.id === 'xp1000');
    expect(xp1000?.unlocked).toBe(true);
  });

  it('should NOT unlock "Milhar de XP" when xp < 1000', () => {
    const achievements = evaluateAchievements(makeProgress({
      xp: 999,
    }));
    const xp1000 = achievements.find(a => a.id === 'xp1000');
    expect(xp1000?.unlocked).toBe(false);
  });

  it('should unlock "Colecionador" when 3+ items are purchased', () => {
    const achievements = evaluateAchievements(makeProgress({
      purchasedItems: ['item1', 'item2', 'item3'],
    }));
    const collector = achievements.find(a => a.id === 'collector');
    expect(collector?.unlocked).toBe(true);
  });

  it('should unlock multiple achievements simultaneously', () => {
    const achievements = evaluateAchievements(makeProgress({
      level: 10,
      xp: 2000,
      completedModules: ['matematica', 'quimica', 'historia', 'idiomas', 'portugues', 'biologia', 'redacao'],
      purchasedItems: ['a', 'b', 'c'],
    }));
    const unlocked = achievements.filter(a => a.unlocked);
    // Should unlock: pioneer, math_whiz, scientist, time_traveler, polyglot, literary, biologist, writer, level5, level10, collector, xp1000
    expect(unlocked).toHaveLength(12);
  });
});

describe('detectNewAchievements', () => {
  it('should detect newly unlocked achievements', () => {
    const prev = makeProgress({ level: 4 });
    const curr = makeProgress({ level: 5 });

    const newAchievements = detectNewAchievements(prev, curr);
    const ids = newAchievements.map(a => a.id);
    expect(ids).toContain('level5');
  });

  it('should return empty array when no new achievements', () => {
    const prev = makeProgress({ level: 5 });
    const curr = makeProgress({ level: 5 });

    const newAchievements = detectNewAchievements(prev, curr);
    expect(newAchievements).toHaveLength(0);
  });

  it('should not re-detect already unlocked achievements', () => {
    const prev = makeProgress({ completedModules: ['matematica'] });
    const curr = makeProgress({ completedModules: ['matematica', 'quimica'] });

    const newAchievements = detectNewAchievements(prev, curr);
    const ids = newAchievements.map(a => a.id);
    expect(ids).not.toContain('pioneer'); // was already unlocked
    expect(ids).not.toContain('math_whiz'); // was already unlocked
    expect(ids).toContain('scientist'); // newly unlocked
  });
});
