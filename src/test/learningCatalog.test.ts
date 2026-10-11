import { describe, expect, it } from 'vitest';
import { ALL_MODULES } from '../modules/core/constants/dashboardConstants';
import { MASTER_LABS_CATALOG } from '../modules/core/constants/masterLabsCatalog';
import { LEGACY_LABS_CATALOG } from '../modules/core/constants/legacyLabsCatalog';
import legacyCatalogSource from '../modules/core/constants/legacyLabsCatalog.ts?raw';
import learningCatalogSource from '../modules/core/constants/learningCatalog.ts?raw';
import {
  LEARNING_LEVELS,
  isLearningLevel,
  learningLevelLabel,
  normalizeLearningLevel,
  type LearningLevel,
} from '../modules/core/constants/learningLevels';
import {
  LEARNING_LABS_CATALOG,
  getLearningLab,
  getLearningLabCounts,
  searchLearningLabs,
} from '../modules/core/constants/learningCatalog';

const ids = (labs: ReadonlyArray<{ id: string }>) => labs.map(lab => lab.id).sort();
const canonicalLevels: LearningLevel[] = [
  'fundamental_1', 'fundamental_2', 'medio', 'graduacao', 'pos_graduacao', 'profissional',
];

describe('Níveis compartilhados de aprendizagem', () => {
  it('expõe cinco níveis acadêmicos e uma trilha profissional complementar identificados', () => {
    expect(LEARNING_LEVELS).toHaveLength(6);
    expect(LEARNING_LEVELS.map(level => level.id).sort()).toEqual([...canonicalLevels].sort());
    for (const level of LEARNING_LEVELS) {
      expect(level.label.trim()).not.toBe('');
      expect(level.description.trim()).not.toBe('');
      expect(learningLevelLabel(level.id)).toBe(level.label);
    }
  });

  it.each(canonicalLevels)('preserva o nível canônico %s na normalização', level => {
    expect(isLearningLevel(level)).toBe(true);
    expect(normalizeLearningLevel(level)).toBe(level);
  });

  it.each([
    ['Ensino Fundamental I', 'fundamental_1'],
    ['Ensino Fundamental I (1º ao 5º ano)', 'fundamental_1'],
    ['Ensino Fundamental II', 'fundamental_2'],
    ['Ensino Fundamental II (6º ao 9º ano)', 'fundamental_2'],
    ['Ensino Médio (1º ao 3º ano)', 'medio'],
    ['Ensino Médio & ENEM', 'medio'],
    ['  ensino   MÉDIO / ENEM  ', 'medio'],
    ['Ensino Superior (Graduação)', 'graduacao'],
    ['Graduação / Engenharias', 'graduacao'],
    ['Pós-Graduação & Pesquisa', 'pos_graduacao'],
    ['Pós-Graduação & Doutorado', 'pos_graduacao'],
    ['Pós-Graduação & Stricto Sensu', 'pos_graduacao'],
    ['  PÓS-GRADUAÇÃO & MESTRADO/DOUTORADO  ', 'pos_graduacao'],
    ['Capacitação Profissional / Técnico', 'profissional'],
    ['Formação Profissional', 'profissional'],
  ] as const)('preserva o significado do rótulo legado %s', (value, expected) => {
    expect(isLearningLevel(value)).toBe(false);
    expect(normalizeLearningLevel(value, 'fundamental_1')).toBe(expected);
    expect(learningLevelLabel(value)).toBe(learningLevelLabel(expected));
  });

  it.each([undefined, null, '', 'nivel_inexistente', 'constructor', 'toString', 1, {}, []])(
    'rejeita valores não canônicos e aplica o fallback explicitamente: %j', value => {
      expect(isLearningLevel(value)).toBe(false);
      expect(normalizeLearningLevel(value)).toBe('medio');
      expect(normalizeLearningLevel(value, 'fundamental_1')).toBe('fundamental_1');
      expect(normalizeLearningLevel(value, 'profissional')).toBe('profissional');
    },
  );
});

describe('Inventário unificado de laboratórios', () => {
  it('preserva exatamente os 510 itens master e os 72 modos existentes, sem colisões', () => {
    expect(MASTER_LABS_CATALOG).toHaveLength(510);
    expect(LEGACY_LABS_CATALOG).toHaveLength(72);
    expect(LEARNING_LABS_CATALOG).toHaveLength(582);
    const masterIds = new Set(MASTER_LABS_CATALOG.map(lab => lab.id));
    const legacyIds = new Set(LEGACY_LABS_CATALOG.map(lab => lab.id));
    expect(masterIds.size).toBe(510);
    expect(legacyIds.size).toBe(72);
    expect([...legacyIds].filter(id => masterIds.has(id))).toEqual([]);
    expect(new Set(LEARNING_LABS_CATALOG.map(lab => lab.id)).size).toBe(582);
    expect(ids(LEARNING_LABS_CATALOG.filter(lab => lab.source === 'catalog')))
      .toEqual(ids(MASTER_LABS_CATALOG));
    expect(ids(LEARNING_LABS_CATALOG.filter(lab => lab.source === 'legacy')))
      .toEqual(ids(LEGACY_LABS_CATALOG));
  });

  it('mantém IDs, títulos e disciplinas de todos os modos configurados em ALL_MODULES', () => {
    const existingLabs = ALL_MODULES.flatMap(module => module.labs.map(lab => ({
      id: lab.id,
      title: lab.title,
      subject: module.label,
      subjectId: module.id,
    })));
    expect(ids(LEGACY_LABS_CATALOG)).toEqual(ids(existingLabs));
    for (const existing of existingLabs) {
      const legacy = LEGACY_LABS_CATALOG.find(lab => lab.id === existing.id);
      expect(legacy, existing.id).toMatchObject({ ...existing, source: 'legacy' });
      expect(getLearningLab(existing.id), existing.id).toMatchObject({ ...existing, source: 'legacy' });
    }
  });

  it('preserva os metadados pedagógicos de cada item master no catálogo unificado', () => {
    for (const lab of MASTER_LABS_CATALOG) {
      expect(getLearningLab(lab.id), lab.id).toMatchObject({
        id: lab.id,
        title: lab.title,
        subject: lab.subject,
        academicLevel: lab.academicLevel,
        academicLevelLabel: learningLevelLabel(lab.academicLevel),
        topic: lab.topic,
        objective: lab.objective,
        icon: lab.icon,
        source: 'catalog',
      });
    }
  });

  it('atribui um nível válido a cada item e mantém a classificação autorada dos modos', () => {
    for (const lab of LEARNING_LABS_CATALOG) {
      expect(isLearningLevel(lab.academicLevel), lab.id).toBe(true);
      expect(lab.academicLevelLabel, lab.id).toBe(learningLevelLabel(lab.academicLevel));
      expect(lab.subjectId.trim(), lab.id).not.toBe('');
      expect(lab.objective.trim(), lab.id).not.toBe('');
    }
    for (const lab of LEGACY_LABS_CATALOG) {
      expect(getLearningLab(lab.id), lab.id).toMatchObject({
        academicLevel: lab.academicLevel,
        objective: lab.objective,
      });
    }
    expect(getLearningLab('lab_inexistente')).toBeUndefined();
  });

  it('calcula contagens que particionam o inventário, incluindo a trilha profissional', () => {
    const counts = getLearningLabCounts();
    expect(Object.keys(counts).sort()).toEqual([...canonicalLevels].sort());
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(582);
    for (const level of canonicalLevels) {
      expect(counts[level]).toBe(searchLearningLabs({ academicLevel: level }).length);
    }
    const professional = searchLearningLabs({ academicLevel: 'profissional' });
    expect(professional.length).toBeGreaterThan(0);
    expect(professional.every(lab => lab.source === 'legacy')).toBe(true);
    expect(professional.some(lab => lab.subjectId === 'softskills' || lab.subjectId === 'hardskills'))
      .toBe(true);
  });
});

describe('Busca e filtros do catálogo', () => {
  it('retorna o inventário completo quando nenhum filtro é informado', () => {
    expect(ids(searchLearningLabs({}))).toEqual(ids(LEARNING_LABS_CATALOG));
    expect(ids(searchLearningLabs({ query: '   ' }))).toEqual(ids(LEARNING_LABS_CATALOG));
  });

  it('encontra IDs de ambas as origens sem depender de caixa ou espaços externos', () => {
    expect(ids(searchLearningLabs({ query: '  FUND1_MAT_01  ' }))).toEqual(['fund1_mat_01']);
    expect(ids(searchLearningLabs({ query: '  MATH_6  ' }))).toEqual(['math_6']);
    expect(searchLearningLabs({ query: 'termo_que_nao_existe_no_catalogo' })).toEqual([]);
  });

  it('normaliza acentos e caixa na busca textual', () => {
    const accented = searchLearningLabs({ query: 'Ábaco' });
    expect(accented.some(lab => lab.id === 'fund1_mat_01')).toBe(true);
    expect(ids(searchLearningLabs({ query: 'ABACO' }))).toEqual(ids(accented));
  });

  it('aceita o rótulo completo ou o ID da disciplina sem aceitar prefixos de rótulos', () => {
    const mathSubject = ALL_MODULES.find(module => module.id === 'matematica')!;
    expect(ids(searchLearningLabs({ subject: mathSubject.label })))
      .toEqual(ids(searchLearningLabs({ subject: mathSubject.id })));
    expect(searchLearningLabs({ subject: mathSubject.id }).some(lab => lab.id === 'math_1'))
      .toBe(true);
    const playfulMath = searchLearningLabs({ subject: 'Matemática Lúdica' });
    expect(ids(playfulMath)).toEqual(ids(MASTER_LABS_CATALOG.filter(lab => lab.subject === 'Matemática Lúdica')));
    expect(searchLearningLabs({ subject: 'Matemática Lú' })).toEqual([]);
  });

  it('aplica busca, nível e disciplina como interseção dos três filtros', () => {
    const target = getLearningLab('em_fis_03')!;
    const queryResults = searchLearningLabs({ query: 'ENERGIA' });
    const subjectResults = searchLearningLabs({ subject: target.subject });
    const allowedSubjectIds = new Set(subjectResults.map(lab => lab.id));
    const expected = queryResults.filter(lab =>
      lab.academicLevel === target.academicLevel && allowedSubjectIds.has(lab.id));
    const filtered = searchLearningLabs({
      query: 'ENERGIA', academicLevel: target.academicLevel, subject: target.subject,
    });
    expect(expected.some(lab => lab.id === target.id)).toBe(true);
    expect(filtered.length).toBeLessThan(queryResults.length);
    expect(ids(filtered)).toEqual(ids(expected));
    expect(searchLearningLabs({ query: target.id, academicLevel: 'fundamental_1', subject: target.subject }))
      .toEqual([]);
    expect(searchLearningLabs({ query: target.id, academicLevel: target.academicLevel, subject: 'quimica' }))
      .toEqual([]);
  });

  it('filtrar e ordenar um resultado não remove itens do inventário compartilhado', () => {
    const before = LEARNING_LABS_CATALOG.map(lab => lab.id);
    searchLearningLabs({ academicLevel: 'medio' }).sort((a, b) => b.id.localeCompare(a.id));
    searchLearningLabs({}).reverse();
    expect(LEARNING_LABS_CATALOG.map(lab => lab.id)).toEqual(before);
  });
});

describe('Separação dos dados e da interface', () => {
  it.each([
    ['legacyLabsCatalog.ts', legacyCatalogSource],
    ['learningCatalog.ts', learningCatalogSource],
  ])(
    '%s não importa React, componentes ou o registro de telas do dashboard', (_filename, source) => {
      const imports = [...source.matchAll(/\b(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)]
        .map(match => match[1]);
      expect(imports.filter(path =>
        /^(?:react|react-dom)(?:[/-]|$)/.test(path)
        || /dashboardConstants|(?:^|\/)(?:ux|pages|components|contexts)(?:\/|$)|\.tsx$/.test(path)))
        .toEqual([]);
    },
  );
});
