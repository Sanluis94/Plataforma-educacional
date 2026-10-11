import { afterEach, describe, expect, it, vi } from 'vitest';
import { callGeminiWithKey, getEffectiveGeminiApiKey } from '../modules/core/services/geminiService';

afterEach(() => {
  localStorage.removeItem('gemini_api_key');
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('Isolamento da IA nos ambientes locais', () => {
  it('ignora chaves do ambiente e do navegador quando IA externa está desativada', () => {
    vi.stubEnv('VITE_DISABLE_AI', 'true');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-environment-key');
    localStorage.setItem('gemini_api_key', 'test-browser-key');
    expect(getEffectiveGeminiApiKey()).toBeNull();
  });

  it('bloqueia também chamadas diretas do tutor sem fazer requisições', async () => {
    vi.stubEnv('VITE_DISABLE_AI', 'true');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await expect(callGeminiWithKey('test-browser-key', 'Hipótese')).rejects.toThrow('IA externa desativada');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('não inicializa o SDK adaptativo com uma chave em modo local', async () => {
    vi.stubEnv('VITE_DISABLE_AI', 'true');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-environment-key');
    const { genAI } = await import('../modules/data/services/aiAdaptiveEngine');
    expect(genAI).toBeNull();
  });

  it('preserva a prioridade da chave do navegador quando IA está habilitada', () => {
    vi.stubEnv('VITE_DISABLE_AI', 'false');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-environment-key');
    localStorage.setItem('gemini_api_key', ' test-browser-key ');
    expect(getEffectiveGeminiApiKey()).toBe('test-browser-key');
  });
});
