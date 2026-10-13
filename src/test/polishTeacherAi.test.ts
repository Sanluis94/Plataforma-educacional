import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateCompleteLessonWithAI } from '../modules/core/services/geminiService';

const request = { topic: 'Fotossíntese', subject: 'Biologia', activityType: 'quiz' };
const payload = { title: 'Luz e produção de glicose', description: 'Investigar o papel da luz na fotossíntese.', theoryContent: 'As plantas convertem energia luminosa em energia química.', questions: [{ q: 'Qual processo utiliza a luz para produzir glicose?', options: ['Fotossíntese', 'Fermentação', 'Respiração'], answer: 0, explanation: 'A fotossíntese utiliza energia luminosa.' }] };
const response = (data: unknown) => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(data) }] } }] }) });
beforeEach(() => { vi.stubEnv('VITE_DISABLE_AI', 'false'); localStorage.setItem('gemini_api_key', 'unit-test-placeholder'); });
afterEach(() => { localStorage.removeItem('gemini_api_key'); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('geração pedagógica confirmada pelo serviço', () => {
  it('entrega o conteúdo recebido sem criar habilidades curriculares ou prêmios', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response(payload)));
    const lesson = await generateCompleteLessonWithAI(request);
    expect(lesson.theoryContent).toBe(payload.theoryContent);
    expect(lesson.questions).toEqual(payload.questions);
    expect(lesson.xpReward).toBe(0); expect(lesson.coinReward).toBe(0);
  });
  it('informa ausência de configuração e não faz requisição', async () => {
    vi.stubEnv('VITE_DISABLE_AI', 'true'); const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(generateCompleteLessonWithAI(request)).rejects.toThrow(/não está configurada/);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('expõe limite de serviço sem retornar conteúdo genérico', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 429 })));
    await expect(generateCompleteLessonWithAI(request)).rejects.toThrow(/limite do Gemini/);
  });
  it.each([
    { ...payload, questions: [] },
    { ...payload, questions: [{ ...payload.questions[0], answer: 7 }] },
    { ...payload, questions: [{ ...payload.questions[0], options: ['Igual', 'igual', 'Outra'] }] },
    { ...payload, questions: [{ ...payload.questions[0], explanation: '' }] },
  ])('recusa resultado incompleto ou gabarito impossível', async invalid => {
    vi.stubGlobal('fetch', vi.fn(async () => response(invalid)));
    await expect(generateCompleteLessonWithAI(request)).rejects.toThrow(/incompleto|inválid/);
  });
});
