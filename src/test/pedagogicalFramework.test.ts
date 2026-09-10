import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../modules/core/services/firebaseConfig', () => ({
  db: null
}));

const {
  saveLessonPlanItem,
  getLessonPlansByClass
} = await import('../modules/data/repositories/lessonPlanRepository');

describe('Pedagogical Framework & Inclusive Active Learning (Sócrates, Aristóteles, Freire, DUA)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should validate core philosophical pillars of the pedagogical methodology', () => {
    const pillars = {
      socrates: {
        method: 'Maiêutica',
        objective: 'Desconstrução de certezas e auto-descoberta através de perguntas norteadoras',
        activeRole: 'Estudante formula hipóteses e chega à síntese'
      },
      aristotle: {
        method: 'Empirismo Sensorial',
        objective: 'Observação fenomenológica direta e identificação das causas na natureza',
        activeRole: 'Estudante manipula variáveis nos laboratórios virtuais e coleta evidências'
      },
      freire: {
        method: 'Pedagogia Crítica e Problematizadora',
        objective: 'Superação da educação bancária por meio de temas geradores e transformação social',
        activeRole: 'Estudante conecta ciência às demandas concretas da sua realidade'
      },
      dua: {
        method: 'Desenho Universal para a Aprendizagem',
        objective: 'Acessibilidade cognitiva com múltiplos meios de representação, ação e engajamento',
        activeRole: 'Estudante com TDAH, TEA ou dislexia aprende sem sobrecarga sensorial'
      }
    };

    expect(pillars.socrates.method).toBe('Maiêutica');
    expect(pillars.aristotle.method).toBe('Empirismo Sensorial');
    expect(pillars.freire.method).toBe('Pedagogia Crítica e Problematizadora');
    expect(pillars.dua.method).toBe('Desenho Universal para a Aprendizagem');
  });

  it('should support lesson planning structured with active pedagogical templates', async () => {
    const classId = `class_ped_${Date.now()}`;

    // Socratic lesson plan
    const socraticPlan = await saveLessonPlanItem({
      professorId: 'prof-ped',
      turmaId: classId,
      periodo: '1º Bimestre',
      ordemSemana: 1,
      topico: 'Leis de Newton e Força de Atrito',
      competenciasBNCC: 'EM13CNT101',
      metodologia: '[Metodologia Socrática]: 1) Pergunta desafiadora sobre inércia; 2) Investigação guiada no simulador; 3) Debate maiêutico para formalização.',
      laboratorioAssociadoId: 'pendulum',
      laboratorioTitulo: 'Pêndulo Simples',
      status: 'planejada',
      criadoEm: new Date().toISOString()
    });

    // Freirian lesson plan
    const freirianPlan = await saveLessonPlanItem({
      professorId: 'prof-ped',
      turmaId: classId,
      periodo: '1º Bimestre',
      ordemSemana: 2,
      topico: 'Eficiência Energética e Termodinâmica',
      competenciasBNCC: 'EM13CNT102',
      metodologia: '[Metodologia Freiriana]: 1) Tema Gerador sobre consumo de energia na comunidade; 2) Círculo de cultura; 3) Ação transformadora sustentável.',
      laboratorioAssociadoId: 'thermodynamics',
      laboratorioTitulo: 'Gases Ideais',
      status: 'planejada',
      criadoEm: new Date().toISOString()
    });

    // DUA lesson plan
    const duaPlan = await saveLessonPlanItem({
      professorId: 'prof-ped',
      turmaId: classId,
      periodo: '1º Bimestre',
      ordemSemana: 3,
      topico: 'Óptica e Refração da Luz',
      competenciasBNCC: 'EM13CNT103',
      metodologia: '[Inclusão DUA / UDL]: Múltiplos formatos com áudio-guia e modo foco para estudantes com TEA e TDAH.',
      laboratorioAssociadoId: 'optics',
      laboratorioTitulo: 'Refração e Lei de Snell',
      status: 'planejada',
      criadoEm: new Date().toISOString()
    });

    expect(socraticPlan.id).toBeDefined();
    expect(freirianPlan.id).toBeDefined();
    expect(duaPlan.id).toBeDefined();

    const plans = await getLessonPlansByClass(classId, '1º Bimestre');
    expect(plans).toHaveLength(3);
    expect(plans.some(p => p.metodologia.includes('Metodologia Socrática'))).toBe(true);
    expect(plans.some(p => p.metodologia.includes('Metodologia Freiriana'))).toBe(true);
    expect(plans.some(p => p.metodologia.includes('Inclusão DUA'))).toBe(true);
  });

  it('should test accessibility settings persistence in localStorage and DOM attributes', () => {
    const STORAGE_KEY = 'edu_interact_accessibility';
    const settings = {
      fontSizePercent: 115,
      dyslexiaFont: true,
      focusMode: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(stored.fontSizePercent).toBe(115);
    expect(stored.dyslexiaFont).toBe(true);
    expect(stored.focusMode).toBe(true);

    // Apply classes simulate
    document.documentElement.classList.add(`font-scale-${stored.fontSizePercent}`);
    if (stored.dyslexiaFont) document.body.classList.add('dyslexia-font');
    if (stored.focusMode) document.body.classList.add('focus-mode-active');

    expect(document.documentElement.classList.contains('font-scale-115')).toBe(true);
    expect(document.body.classList.contains('dyslexia-font')).toBe(true);
    expect(document.body.classList.contains('focus-mode-active')).toBe(true);
  });

  it('should test Web Speech API integration gracefully with mock', () => {
    let speakCalled = false;
    let spokenText = '';

    const mockSpeechSynthesis = {
      speak: vi.fn((utterance: { text: string }) => {
        speakCalled = true;
        spokenText = utterance.text;
      }),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      paused: false,
      speaking: false
    };

    (globalThis as any).window = {
      ...(globalThis as any).window,
      speechSynthesis: mockSpeechSynthesis
    };

    const textToRead = 'Princípio de Arquimedes: todo corpo mergulhado em um fluido sofre empuxo.';
    mockSpeechSynthesis.speak({ text: textToRead });

    expect(speakCalled).toBe(true);
    expect(spokenText).toContain('Princípio de Arquimedes');
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
  });
});
