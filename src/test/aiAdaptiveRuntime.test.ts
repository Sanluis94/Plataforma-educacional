import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ construct: vi.fn(), model: vi.fn(), generate: vi.fn() }));
vi.mock('@google/generative-ai', () => ({ GoogleGenerativeAI: class {
  constructor(key: string) { sdk.construct(key); }
  getGenerativeModel(options: unknown) { sdk.model(options); return { generateContent: sdk.generate }; }
} }));

const context = { xp: 0, level: 1, enrolledClasses: ['class'], completedModules: [] };
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_DISABLE_AI', 'false');
  vi.stubEnv('VITE_GEMINI_API_KEY', '');
  localStorage.clear();
  sdk.construct.mockClear(); sdk.model.mockClear(); sdk.generate.mockReset();
  sdk.generate.mockResolvedValue({ response: { text: () => JSON.stringify({ message: 'Conselho da IA', actionType: 'none' }) } });
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); localStorage.clear(); });

describe('Chave de IA no motor adaptativo', () => {
  it('ativa a chave informada após uma recomendação offline já estar em cache', async () => {
    const engine = await import('../modules/data/services/aiAdaptiveEngine');
    expect((await engine.getAdaptiveRecommendation(context)).message).not.toBe('Conselho da IA');
    localStorage.setItem('gemini_api_key', 'fixture-runtime-key');
    expect((await engine.getAdaptiveRecommendation(context)).message).toBe('Conselho da IA');
    expect(sdk.construct).toHaveBeenCalledExactlyOnceWith('fixture-runtime-key');
    expect(sdk.model).toHaveBeenCalledWith({ model: 'gemini-3.5-flash-lite' });
    await engine.getAdaptiveRecommendation(context);
    expect(sdk.generate).toHaveBeenCalledTimes(1);
  });

  it('troca e remove a chave sem reutilizar respostas da configuração anterior', async () => {
    const engine = await import('../modules/data/services/aiAdaptiveEngine');
    localStorage.setItem('gemini_api_key', 'fixture-first');
    await engine.getAdaptiveRecommendation(context);
    localStorage.setItem('gemini_api_key', 'fixture-second');
    await engine.getAdaptiveRecommendation(context);
    localStorage.removeItem('gemini_api_key');
    expect((await engine.getAdaptiveRecommendation(context)).message).not.toBe('Conselho da IA');
    expect(engine.genAI).toBeNull();
    expect(sdk.construct.mock.calls).toEqual([['fixture-first'], ['fixture-second']]);
    expect(sdk.generate).toHaveBeenCalledTimes(2);
  });

  it('respeita IA desativada mesmo quando há chave local e de ambiente', async () => {
    vi.stubEnv('VITE_DISABLE_AI', 'true');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'fixture-env');
    localStorage.setItem('gemini_api_key', 'fixture-local');
    const engine = await import('../modules/data/services/aiAdaptiveEngine');
    await engine.getAdaptiveRecommendation(context);
    expect(sdk.construct).not.toHaveBeenCalled();
    expect(sdk.generate).not.toHaveBeenCalled();
  });

  it('recalcula a recomendação ao mudar o módulo recente e mantém fallback em falha', async () => {
    localStorage.setItem('gemini_api_key', 'fixture-key');
    const engine = await import('../modules/data/services/aiAdaptiveEngine');
    await engine.getAdaptiveRecommendation({ ...context, recentModules: ['matematica'] });
    sdk.generate.mockRejectedValueOnce(new Error('falha simulada'));
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const next = { ...context, recentModules: ['fisica'] };
    expect(await engine.getAdaptiveRecommendation(next)).toEqual(engine.getOfflineRecommendation(next));
    expect(sdk.generate).toHaveBeenCalledTimes(2);
  });
});
