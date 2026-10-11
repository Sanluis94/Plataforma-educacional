/** Academic entry points, plus a complementary professional learning track. */
export const LEARNING_LEVELS = [
  { id: 'fundamental_1', label: 'Fundamental I', description: 'Anos iniciais: leitura, escrita, números e exploração de situações concretas.' },
  { id: 'fundamental_2', label: 'Fundamental II', description: 'Anos finais: relações entre conceitos, interpretação de evidências e raciocínio progressivamente abstrato.' },
  { id: 'medio', label: 'Ensino Médio', description: 'Aprofundamento da educação básica, argumentação e aplicação de modelos nas diferentes disciplinas.' },
  { id: 'graduacao', label: 'Graduação', description: 'Fundamentos universitários e aplicações que pressupõem conhecimentos da educação básica.' },
  { id: 'pos_graduacao', label: 'Pós-Graduação', description: 'Estudos avançados, análise de hipóteses e modelagem em áreas especializadas.' },
  { id: 'profissional', label: 'Formação Profissional', description: 'Trilha complementar de competências técnicas e de trabalho; não representa uma turma ou titulação.' },
] as const;

export type LearningLevel = typeof LEARNING_LEVELS[number]['id'];

const levelIds = new Set<string>(LEARNING_LEVELS.map(level => level.id));

export function isLearningLevel(value: unknown): value is LearningLevel {
  return typeof value === 'string' && levelIds.has(value);
}

function normalizeLabel(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
    .replace(/[_\s]+/g, ' ').trim();
}

// Preserve labels already used by stored profiles without inventing enrolments.
const aliases: Record<string, LearningLevel> = {
  'ensino fundamental i': 'fundamental_1',
  'fundamental i': 'fundamental_1',
  'fundamental 1': 'fundamental_1',
  'ensino fundamental i (1º ao 5º ano)': 'fundamental_1',
  'ensino fundamental ii': 'fundamental_2',
  'fundamental ii': 'fundamental_2',
  'fundamental 2': 'fundamental_2',
  'ensino fundamental ii (6º ao 9º ano)': 'fundamental_2',
  'medio': 'medio',
  'ensino medio': 'medio',
  'ensino medio (1º ao 3º ano)': 'medio',
  'ensino medio & enem': 'medio',
  'ensino medio / enem': 'medio',
  'graduacao': 'graduacao',
  'ensino superior': 'graduacao',
  'ensino superior (graduacao)': 'graduacao',
  'graduacao / engenharias': 'graduacao',
  'pos graduacao': 'pos_graduacao',
  'pos-graduacao': 'pos_graduacao',
  'pos-graduacao & pesquisa': 'pos_graduacao',
  'pos-graduacao & doutorado': 'pos_graduacao',
  'pos-graduacao & stricto sensu': 'pos_graduacao',
  'pos-graduacao & mestrado/doutorado': 'pos_graduacao',
  'profissional': 'profissional',
  'formacao profissional': 'profissional',
  'capacitacao profissional': 'profissional',
  'capacitacao profissional / tecnico': 'profissional',
  'tecnico': 'profissional',
};

export function normalizeLearningLevel(value: unknown, fallback: LearningLevel = 'medio'): LearningLevel {
  if (isLearningLevel(value)) return value;
  if (typeof value !== 'string') return fallback;
  const label = normalizeLabel(value);
  return Object.hasOwn(aliases, label) ? aliases[label] : fallback;
}

export function learningLevelLabel(value: unknown): string {
  const id = normalizeLearningLevel(value);
  return LEARNING_LEVELS.find(level => level.id === id)!.label;
}
