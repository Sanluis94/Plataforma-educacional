import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildPedagogicalSummary, generatePedagogicalDiagnosis, type PedagogicalReportData } from '../modules/core/services/geminiService';

const input: PedagogicalReportData = { className: 'Turma Identificável', studentsCount: 2, studentsWithEvidence: 1, scoredRecordsCount: 1, averageScore: 0, completionRate: 50, completedActivitiesCount: 1, expectedCompletions: 2, atRiskStudents: ['Nome Privado'], topModules: [{ module: 'Atividade Identificável', averageScore: 0, count: 1 }] };
beforeEach(() => { localStorage.clear(); vi.stubEnv('VITE_DISABLE_AI', 'true'); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { localStorage.clear(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('resumo pedagógico ligado às evidências', () => {
  it('preserva nota zero, denominadores e não inventa pontualidade ou referência externa', () => {
    const diagnosis = buildPedagogicalSummary(input);
    expect(diagnosis.source).toBe('rules'); expect(diagnosis.summary).toContain('0%'); expect(diagnosis.summary).toContain('1 de 2');
    expect(diagnosis.strengths.join(' ')).not.toMatch(/pontualidade|acima da média|gamificação|excelente/i);
    expect(diagnosis.recommendations.join(' ')).toContain('1 aluno indicado');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('explica ausência de evidências sem chamar média nula de zero', () => {
    const diagnosis = buildPedagogicalSummary({ ...input, studentsWithEvidence: 0, averageScore: null, completionRate: null, scoredRecordsCount: 0, atRiskStudents: [] });
    expect(diagnosis.summary).toContain('Ainda não há evidências');
    expect(diagnosis.strengths.join(' ')).toContain('Ainda não há notas válidas');
    expect(diagnosis.strengths.join(' ')).not.toContain('média é 0%');
  });

  it('envia apenas números agregados e aceita uma resposta com todas as listas válidas', async () => {
    vi.stubEnv('VITE_DISABLE_AI', 'false'); localStorage.setItem('gemini_api_key', 'unit-test-only');
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ summary: 'Conferir uma entrega.', strengths: ['Uma entrega.'], recommendations: ['Retomar o conceito.'], priorityActions: [] }) }] } }] })));
    const diagnosis = await generatePedagogicalDiagnosis(input);
    const body = String(vi.mocked(fetch).mock.calls[0][1]?.body);
    expect(body).not.toContain(input.className); expect(body).not.toContain('Nome Privado'); expect(body).not.toContain('Atividade Identificável');
    expect(body).toContain('alunosIndicadosParaApoio'); expect(diagnosis.source).toBe('gemini');
  });

  it('recusa respostas incompletas ou listas com valores não textuais', async () => {
    vi.stubEnv('VITE_DISABLE_AI', 'false'); localStorage.setItem('gemini_api_key', 'unit-test-only');
    for (const result of [{ summary: 'Texto', recommendations: [] }, { summary: 'Texto', strengths: [42], recommendations: [], priorityActions: [] }]) {
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(result) }] } }] })));
      const diagnosis = await generatePedagogicalDiagnosis(input);
      expect(diagnosis.source).toBe('rules'); expect(diagnosis.notice).toContain('resumo válido'); expect(diagnosis.summary).toContain('0%');
    }
  });

  it('declara indisponibilidade da IA e mantém um resumo útil', async () => {
    const diagnosis = await generatePedagogicalDiagnosis(input);
    expect(diagnosis.source).toBe('rules'); expect(diagnosis.notice).toContain('não está configurada'); expect(fetch).not.toHaveBeenCalled();
  });
});
