import { describe, it, expect, beforeEach } from 'vitest';
import { NEW_ADVANCED_LABS } from '../modules/core/constants/advancedLabsRegistry';
import { saveSubmissionReview, getSubmissionReview } from '../modules/data/repositories/submissionRepository';

describe('Higher Education (Ensino Superior) Laboratories & Engine', () => {
  it('deve conter todos os laboratórios universitários fundamentais registrados', () => {
    const requiredLabs = [
      'sup_fis_01',
      'sup_calc_01',
      'sup_comp_01',
      'sup_qui_01',
      'sup_eletr_03',
      'sup_resmat_01',
      'sup_bioq_01'
    ];

    requiredLabs.forEach(labId => {
      const currentLab = NEW_ADVANCED_LABS[labId];
      expect(currentLab).toBeDefined();
      if (!currentLab) return;
      expect(currentLab.academicLevel).toBe('graduacao');
      expect(typeof currentLab.physicsStep).toBe('function');
      expect(typeof currentLab.renderCanvas).toBe('function');
      expect(currentLab.questions).toBeDefined();
      expect(currentLab.questions?.length).toBeGreaterThan(0);
    });
  });

  it('sup_qui_01: deve calcular a Equação de Arrhenius e cinética química de 1ª ordem', () => {
    const lab = NEW_ADVANCED_LABS['sup_qui_01'];
    const params = {
      temperatura: 320, // K
      concInicial: 2.0, // mol/L
      energiaAtiv: 50,  // kJ/mol
      catalisador: 0
    };

    const initial = { t: 0, concA: 2.0, concB: 0, history: [] };
    const step1 = lab.physicsStep(params, initial, 1.0);

    expect(step1.telemetry.constante_k).toBeGreaterThan(0);
    expect(step1.telemetry.conc_reagente_A).toBeLessThanOrEqual(2.0);
    expect(step1.telemetry.conc_produto_B).toBeGreaterThanOrEqual(0);
    expect(step1.nextState.concA + step1.nextState.concB).toBeCloseTo(2.0, 1);
  });

  it('sup_eletr_03: deve modelar circuito RLC e classificar amortecimento', () => {
    const lab = NEW_ADVANCED_LABS['sup_eletr_03'];
    const params = {
      R: 100, // ohms
      L: 200, // mH
      C: 50,  // uF
      V0: 12  // V
    };

    const initial = { vc: 12, iL: 0, t: 0, history: [] };
    const step = lab.physicsStep(params, initial, 0.001);

    expect(step.telemetry.tensao_Vc).toBeDefined();
    expect(step.telemetry.omega_0_rad_s).toBeGreaterThan(0);
    expect(step.telemetry.alpha_neper).toBeGreaterThan(0);
    expect(step.nextState.regime).toBeDefined();
  });

  it('sup_resmat_01: deve calcular tensão normal, deformação e detectar regime elástico/plástico', () => {
    const lab = NEW_ADVANCED_LABS['sup_resmat_01'];
    const params = {
      material: 1, // Aço 1020
      diametro: 10, // mm
      forcaTracao: 15 // kN
    };

    const initial = { tensao: 0, deformacao: 0, regime: 'Elástico Linear', rompido: false };
    const step = lab.physicsStep(params, initial, 0);

    expect(step.telemetry.tensao_MPa).toBeGreaterThan(0);
    expect(step.telemetry.deformacao_pct).toBeGreaterThan(0);
    expect(step.telemetry.modulo_Young_GPa).toBe(205);
    expect(step.nextState.regime).toContain('Elástico');
  });

  it('sup_bioq_01: deve calcular cinética enzimática de Michaelis-Menten e Lineweaver-Burk', () => {
    const lab = NEW_ADVANCED_LABS['sup_bioq_01'];
    const params = {
      substrato: 10, // mM
      vmax: 80,      // umol/min
      km: 10,        // mM
      inibidor: 0
    };

    const initial = { v0: 0, history: [] };
    const step = lab.physicsStep(params, initial, 0);

    // Quando [S] = Km, V0 deve ser exatamente Vmax / 2 = 40
    expect(step.telemetry.velocidade_V0).toBeCloseTo(40, 1);
    expect(step.telemetry.inv_S_mM).toBeCloseTo(0.1, 2);
    expect(step.telemetry.inv_V0).toBeCloseTo(0.025, 3);
  });
});

describe('SpeedGrader Kortex Submissions & Rubric Evaluation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve salvar e recuperar a avaliação com rubricas e parecer docente via SpeedGrader', async () => {
    const reviewData = {
      submissionId: 'sub_test_univ_01',
      professorId: 'prof_test_01',
      rubricScores: {
        crit_1: 4.0,
        crit_2: 3.0,
        crit_3: 2.5
      },
      totalScore: 9.5,
      generalFeedback: 'Excelente dedução analítica dos modos de vibração do oscilador.',
      gradedAt: new Date().toISOString()
    };

    const saved = await saveSubmissionReview(reviewData);
    expect(saved).toBeDefined();
    expect(saved.submissionId).toBe('sub_test_univ_01');
    expect(saved.totalScore).toBe(9.5);

    const retrieved = await getSubmissionReview('sub_test_univ_01');
    expect(retrieved).toBeDefined();
    expect(retrieved.rubricScores.crit_1).toBe(4.0);
    expect(retrieved.totalScore).toBe(9.5);
    expect(retrieved.generalFeedback).toBe('Excelente dedução analítica dos modos de vibração do oscilador.');
  });
});
