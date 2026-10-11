import { describe, it, expect } from 'vitest';
import {
  MASTER_LABS_CATALOG,
  getAllLabsCatalog,
  getLabsByLevel,
  getLabsBySubject,
  searchLabsCatalog,
  resolveUniversalLab
} from '../modules/core/constants/masterLabsCatalog';
import { NEW_ADVANCED_LABS } from '../modules/core/constants/advancedLabsRegistry';

describe('Kortex Master Laboratories Catalog (500+ Labs)', () => {
  it('deve conter no mínimo 500 laboratórios no catálogo geral', () => {
    const all = getAllLabsCatalog();
    expect(all.length).toBeGreaterThanOrEqual(500);
    expect(MASTER_LABS_CATALOG.length).toBeGreaterThanOrEqual(500);
  });

  it('deve distribuir os laboratórios corretamente pelos 5 níveis acadêmicos', () => {
    const fund1 = getLabsByLevel('fundamental_1');
    const fund2 = getLabsByLevel('fundamental_2');
    const medio = getLabsByLevel('medio');
    const graduacao = getLabsByLevel('graduacao');
    const pos = getLabsByLevel('pos_graduacao');

    expect(fund1.length).toBe(20);
    expect(fund2.length).toBe(60);
    expect(medio.length).toBe(100);
    expect(graduacao.length).toBe(160);
    expect(pos.length).toBe(170);

    const soma = fund1.length + fund2.length + medio.length + graduacao.length + pos.length;
    expect(soma).toBe(510);
    expect(soma).toBeGreaterThanOrEqual(500);
  });

  it('cada laboratório deve ter metadados e alinhamento curricular (BNCC / DCN)', () => {
    MASTER_LABS_CATALOG.forEach(lab => {
      expect(lab.id).toBeDefined();
      expect(lab.title).toBeTruthy();
      expect(lab.subject).toBeTruthy();
      expect(lab.topic).toBeTruthy();
      expect(lab.objective).toBeTruthy();
      expect(lab.curriculumCode).toBeTruthy();
      expect(lab.simulatedHours).toBeGreaterThan(0);
      expect(lab.defaultParams.length).toBeGreaterThan(0);
      expect(lab.diagnosticQuestion).toBeDefined();
      expect(lab.diagnosticQuestion.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('deve filtrar laboratórios por termo de busca e disciplina', () => {
    const pitagoras = searchLabsCatalog('Pitágoras');
    expect(pitagoras.length).toBeGreaterThan(0);
    expect(pitagoras[0].title).toContain('Pitágoras');

    const arrhenius = searchLabsCatalog('Arrhenius');
    expect(arrhenius.length).toBeGreaterThan(0);

    const brayton = searchLabsCatalog('Brayton');
    expect(brayton.length).toBeGreaterThan(0);

    const labsFisica = getLabsBySubject('Física');
    expect(labsFisica.length).toBeGreaterThanOrEqual(20);
  });

  it('mantém a identidade do catálogo ao abrir os motores avançados', () => {
    for (const id of Object.keys(NEW_ADVANCED_LABS)) {
      const item = MASTER_LABS_CATALOG.find(lab => lab.id === id)!;
      const config = resolveUniversalLab(id);
      expect(config).toMatchObject({ id, title: item.title, subject: item.subject,
        topic: item.topic, objective: item.objective, academicLevel: item.academicLevel });
      expect(config.physicsStep).toBe(NEW_ADVANCED_LABS[id].physicsStep);
    }
  });

  it('resolveUniversalLab deve instanciar qualquer laboratório do catálogo em um motor funcional', () => {
    const testIds = [
      'fund1_mat_01',
      'fund2_bio_03',
      'em_fis_04',
      'sup_calc_02',
      'pos_deep_01',
      'pos_termo_01'
    ];

    testIds.forEach(id => {
      const config = resolveUniversalLab(id);
      expect(config).toBeDefined();
      expect(config.id).toBe(id);
      expect(typeof config.physicsStep).toBe('function');
      expect(typeof config.renderCanvas).toBe('function');
      if (config.presentation === 'guided_activity') {
        expect(config.learningContent?.scenarios.length).toBeGreaterThanOrEqual(3);
        expect(config.questions?.length).toBeGreaterThanOrEqual(2);
        expect(config.parameters).toEqual([]);
      } else {
        expect(config.parameters.length).toBeGreaterThan(0);
      }

      // Simulação de um passo de física
      const initialParams: Record<string, number> = {};
      config.parameters.forEach(p => { initialParams[p.id] = p.defaultValue; });
      const step = config.physicsStep(initialParams, { t: 0 }, 0.05);

      expect(step.nextState).toBeDefined();
      expect(step.telemetry).toBeDefined();
    });
  });
});
