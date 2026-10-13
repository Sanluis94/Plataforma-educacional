import { expect, it, vi } from 'vitest';

it('carrega apenas o pacote escolhido, preserva o conteúdo e reutiliza a requisição', async () => {
  vi.resetModules();
  const loader = await import('../modules/core/content/labLearningContent');
  expect(Object.keys(loader.LAB_LEARNING_CONTENT)).toHaveLength(0);
  const [first, second] = await Promise.all([loader.loadLabLearningContent('fund1_mat_01'), loader.loadLabLearningContent('fund1_mat_01')]);
  expect(first).toBe(second);
  expect(first.questions.length).toBeGreaterThan(0);
  expect(loader.getLabLearningContent('fund1_mat_01')).toBe(first);
  expect(Object.keys(loader.LAB_LEARNING_CONTENT).length).toBeLessThan(582);
  await expect(loader.loadLabLearningContent('inexistente')).rejects.toThrow('Laboratório não encontrado');
});
