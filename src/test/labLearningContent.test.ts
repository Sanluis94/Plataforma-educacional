import { describe, expect, it } from 'vitest';
import { LAB_LEARNING_CONTENT } from '../modules/core/content/labLearningContent';
import { findRepeatedContent, normalizeContentText, validateLearningContent } from '../modules/core/content/contentQuality';
import { MASTER_LABS_CATALOG, resolveUniversalLab } from '../modules/core/constants/masterLabsCatalog';
import { ALL_MODULES } from '../modules/core/constants/dashboardConstants';

describe('Conteúdo individual dos laboratórios', () => {
  it('mantém inventário completo e não usa IDs inventados para aparentar cobertura', () => {
    const ids = [...MASTER_LABS_CATALOG.map(lab => lab.id), ...ALL_MODULES.flatMap(module => module.labs.map(lab => lab.id))];
    expect(ids).toHaveLength(582);
    expect(new Set(ids).size).toBe(582);
    expect(Object.keys(LAB_LEARNING_CONTENT)).toHaveLength(582);
    for (const id of Object.keys(LAB_LEARNING_CONTENT)) expect(ids, id).toContain(id);
  });

  it('cobre cada tópico do Fundamental I e II com roteiro, casos e avaliação próprios', () => {
    const fundamental = MASTER_LABS_CATALOG.filter(lab => ['fundamental_1', 'fundamental_2'].includes(lab.academicLevel));
    expect(fundamental).toHaveLength(80);
    for (const lab of fundamental) {
      expect(LAB_LEARNING_CONTENT[lab.id], lab.id).toBeDefined();
      expect(validateLearningContent(lab.id, LAB_LEARNING_CONTENT[lab.id]), lab.id).toEqual([]);
    }
  });

  it('cobre os cem laboratórios do Ensino Médio com conteúdo individual completo', () => {
    const medium = MASTER_LABS_CATALOG.filter(lab => lab.academicLevel === 'medio');
    expect(medium).toHaveLength(100);
    for (const lab of medium) {
      expect(LAB_LEARNING_CONTENT[lab.id], lab.id).toBeDefined();
      expect(validateLearningContent(lab.id, LAB_LEARNING_CONTENT[lab.id]), lab.id).toEqual([]);
    }
    expect(LAB_LEARNING_CONTENT.em_ing_10.questions).toHaveLength(5);
  });

  it('rejeita trechos inteiros reutilizados e dá feedback em todas as alternativas', () => {
    expect(findRepeatedContent(LAB_LEARNING_CONTENT)).toEqual([]);
    const positions = new Set<number>();
    for (const [id, content] of Object.entries(LAB_LEARNING_CONTENT)) {
      expect(validateLearningContent(id, content), id).toEqual([]);
      content.questions.forEach(question => positions.add(question.options.findIndex(option => option.correct)));
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  it('cobre os 72 modos da biblioteca inicial, incluindo filosofia e competências', () => {
    const legacy = ALL_MODULES.flatMap(module => module.labs.map(lab => ({ id: lab.id })));
    expect(legacy).toHaveLength(72);
    for (const lab of legacy) {
      expect(LAB_LEARNING_CONTENT[lab.id], lab.id).toBeDefined();
      expect(validateLearningContent(lab.id, LAB_LEARNING_CONTENT[lab.id]), lab.id).toEqual([]);
    }
  });

  it('liga todo roteiro do catálogo ao seu laboratório e não fabrica gráficos para os casos', () => {
    for (const lab of MASTER_LABS_CATALOG.filter(item => LAB_LEARNING_CONTENT[item.id])) {
      const content = LAB_LEARNING_CONTENT[lab.id];
      const config = resolveUniversalLab(lab.id);
      expect(config.id).toBe(lab.id);
      expect(config.learningContent).toBe(content);
      expect(config.questions).toEqual(content.questions);
      expect(lab.theoreticalBackground).toContain(content.theory);
      expect(lab.theoreticalBackground).toContain(content.workedExample);
      if (config.presentation === 'guided_activity') {
        expect(config.parameters).toEqual([]);
        expect(config.physicsStep({}, {}, 1).telemetry).toEqual({});
      }
    }
    expect(() => resolveUniversalLab('laboratorio-inexistente')).toThrow('Laboratório não encontrado');
  });

  it('a auditoria reconhece respostas numéricas e detecta o molde antigo', () => {
    expect(normalizeContentText('+3')).not.toBe(normalizeContentText('-3'));
    expect(normalizeContentText('0,2')).not.toBe(normalizeContentText('02'));
    const content = structuredClone(LAB_LEARNING_CONTENT.fund1_mat_01);
    content.theory = 'Ao realizar a modelagem experimental no laboratório fictício, a resposta do sistema valida o modelo teórico. '.repeat(3);
    expect(validateLearningContent('teste', content).some(error => error.includes('molde genérico'))).toBe(true);
    const duplicate = structuredClone(LAB_LEARNING_CONTENT.fund1_mat_01);
    duplicate.scenarios[1].situation = duplicate.scenarios[0].situation;
    expect(validateLearningContent('teste', duplicate)).toContain('teste: cenários repetidos');
  });
});
