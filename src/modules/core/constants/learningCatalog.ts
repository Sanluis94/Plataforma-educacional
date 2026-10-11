import { MASTER_LABS_CATALOG } from './masterLabsCatalog';
import { LEGACY_LABS_CATALOG } from './legacyLabsCatalog';
import { LEARNING_LEVELS, learningLevelLabel, type LearningLevel } from './learningLevels';

export interface LearningLab {
  id: string;
  title: string;
  subject: string;
  subjectId: string;
  academicLevel: LearningLevel;
  academicLevelLabel: string;
  topic: string;
  objective: string;
  source: 'catalog' | 'legacy';
  icon: string;
}

function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ').trim();
}

const subjectIcons: Record<string, string> = {
  matematica: '📐', fisica: '⚛️', quimica: '🧪', biologia: '🔬', portugues: '📖', redacao: '✍️',
  historia: '🌍', idiomas: '🌐', softskills: '💼', hardskills: '🖥️', geografia: '🌋', filosofia: '🏛️',
};

export const LEARNING_LABS_CATALOG: LearningLab[] = [
  ...MASTER_LABS_CATALOG.map(lab => ({
    ...lab,
    subjectId: normalizeText(lab.subject).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
    academicLevelLabel: learningLevelLabel(lab.academicLevel),
    source: 'catalog' as const,
  })),
  ...LEGACY_LABS_CATALOG.map(lab => ({
    ...lab,
    academicLevelLabel: learningLevelLabel(lab.academicLevel),
    topic: lab.title,
    icon: subjectIcons[lab.subjectId] ?? '📚',
  })),
];

const labsById = new Map<string, LearningLab>();
for (const lab of LEARNING_LABS_CATALOG) {
  if (labsById.has(lab.id)) throw new Error(`Laboratório duplicado no catálogo de aprendizagem: ${lab.id}`);
  labsById.set(lab.id, lab);
}

export function getLearningLab(id: string): LearningLab | undefined {
  return labsById.get(id);
}

export interface LearningLabSearch {
  query?: string;
  academicLevel?: LearningLevel;
  /** Exact discipline label or subjectId; accents and letter case are ignored. */
  subject?: string;
}

export function searchLearningLabs({ query = '', academicLevel, subject }: LearningLabSearch = {}): LearningLab[] {
  const term = normalizeText(query);
  const discipline = subject === undefined ? undefined : normalizeText(subject);
  return LEARNING_LABS_CATALOG.filter(lab => {
    if (academicLevel && lab.academicLevel !== academicLevel) return false;
    if (discipline !== undefined && normalizeText(lab.subject) !== discipline && normalizeText(lab.subjectId) !== discipline) return false;
    return !term || normalizeText(`${lab.id} ${lab.title} ${lab.subject} ${lab.topic} ${lab.objective}`).includes(term);
  });
}

export function getLearningLabCounts(): Record<LearningLevel, number> {
  const counts = Object.fromEntries(LEARNING_LEVELS.map(level => [level.id, 0])) as Record<LearningLevel, number>;
  for (const lab of LEARNING_LABS_CATALOG) counts[lab.academicLevel]++;
  return counts;
}
