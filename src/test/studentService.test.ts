/**
 * Testes do Student Service — Lógica de negócio de gamificação.
 * Valida cálculos de XP, level-up, e moedas.
 */
import { describe, it, expect, vi } from 'vitest';
import { completeStudentLabProgress } from '../modules/data/repositories/studentRepository';

// Mock the repositories since they depend on Firebase
vi.mock('../modules/data/repositories/studentRepository', () => ({
  saveStudentProgress: vi.fn().mockResolvedValue(undefined),
  completeStudentLabProgress: vi.fn().mockResolvedValue({ alreadyCompleted: false, progress: { xp: 80, coins: 30, level: 1 } }),
  addPurchasedItem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../modules/data/repositories/logRepository', () => ({
  writeLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../modules/data/services/aiAdaptiveEngine', () => ({
  getAdaptiveRecommendation: vi.fn().mockResolvedValue({
    message: 'Mock recommendation',
    actionType: 'none',
    actionLabel: ''
  }),
}));

// Import after mocks
const { processModuleCompletion, processItemPurchase, getAIRecommendation } = await import('../modules/core/services/studentService');

describe('processModuleCompletion', () => {
  it('returns the stored progress from the atomic completion', async () => {
    const result = await processModuleCompletion('uid-1', 'matematica', 100, 0, 1, 0);
    expect(result.xp).toBe(80); // 100 * 0.8
  });

  it('returns the stored coins without recalculating stale UI progress', async () => {
    const result = await processModuleCompletion('uid-1', 'matematica', 100, 0, 1, 0);
    expect(result.coins).toBe(30); // 100 * 0.3
  });

  it('delegates the real score and identity to the idempotent repository', async () => {
    await processModuleCompletion('uid-2', 'matematica', 67, 9999, 30, 500);
    expect(completeStudentLabProgress).toHaveBeenLastCalledWith('uid-2', 'matematica', 67);
  });

  it('should NOT level up when XP is below threshold', async () => {
    const result = await processModuleCompletion('uid-1', 'matematica', 100, 0, 1, 0);
    // XP = 0 + 80 = 80 < 1*500 → no level up
    expect(result.level).toBe(1);
  });

  it('propagates failed persistence instead of returning invented progress', async () => {
    vi.mocked(completeStudentLabProgress).mockRejectedValueOnce(new Error('permission-denied'));
    await expect(processModuleCompletion('uid-1', 'matematica', 100, 0, 1, 100)).rejects.toThrow('permission-denied');
  });
});

describe('processItemPurchase', () => {
  const mockItems = [
    { id: 'item1', name: 'Test Item', price: 50, icon: '🎮', owned: false },
    { id: 'item2', name: 'Another Item', price: 100, icon: '🎯', owned: false },
    { id: 'item3', name: 'Owned Item', price: 75, icon: '✨', owned: true },
  ];

  it('should deduct the correct price from coins', async () => {
    const result = await processItemPurchase('uid-1', 'item1', 200, mockItems);
    expect(result?.newCoins).toBe(150); // 200 - 50
  });

  it('should mark the purchased item as owned', async () => {
    const result = await processItemPurchase('uid-1', 'item1', 200, mockItems);
    const purchasedItem = result?.newItems.find(i => i.id === 'item1');
    expect(purchasedItem?.owned).toBe(true);
  });

  it('should return null if item is already owned', async () => {
    const result = await processItemPurchase('uid-1', 'item3', 200, mockItems);
    expect(result).toBeNull();
  });

  it('should return null if not enough coins', async () => {
    const result = await processItemPurchase('uid-1', 'item2', 50, mockItems);
    expect(result).toBeNull();
  });

  it('should return null if item does not exist', async () => {
    const result = await processItemPurchase('uid-1', 'nonexistent', 200, mockItems);
    expect(result).toBeNull();
  });
});

describe('getAIRecommendation', () => {
  it('should return a recommendation object with message', async () => {
    const result = await getAIRecommendation({ level: 1, xp: 0 });
    expect(typeof result.message).toBe('string');
    expect(result.message.length).toBeGreaterThan(0);
  });
});
