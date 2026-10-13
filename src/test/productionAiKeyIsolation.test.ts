import { afterEach, expect, it, vi } from 'vitest';
import { getEffectiveGeminiApiKey } from '../modules/core/services/geminiService';
afterEach(() => { localStorage.clear(); vi.unstubAllEnvs(); });
it('publicação ignora chave de IA do ambiente, mesmo sem usar o compilador protegido', () => {
  localStorage.clear(); vi.stubEnv('DEV', false); vi.stubEnv('PROD', true);
  vi.stubEnv('VITE_DISABLE_AI', 'false'); vi.stubEnv('VITE_GEMINI_API_KEY', 'example-only-private-key');
  expect(getEffectiveGeminiApiKey()).toBeNull();
  localStorage.setItem('gemini_api_key', 'example-only-personal-key');
  expect(getEffectiveGeminiApiKey()).toBe('example-only-personal-key');
  vi.stubEnv('VITE_DISABLE_AI', 'true');
  expect(getEffectiveGeminiApiKey()).toBeNull();
});
