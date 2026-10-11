import type { CatalogLabItem } from '../constants/masterLabsCatalog';
import { LAB_LEARNING_CONTENT, type LabLearningContent } from '../content/labLearningContent';
import { findRepeatedContent, validateLearningContent } from '../content/contentQuality';

export interface StudioLab extends CatalogLabItem {
  learningContent: LabLearningContent;
}

export interface StudioLabDraft {
  title: string;
  subject: string;
  academicLevel: CatalogLabItem['academicLevel'];
  topic: string;
  objective: string;
  estimatedHours: number;
  content: LabLearningContent;
}

export function emptyLearningContent(): LabLearningContent {
  return {
    context: '', theory: '', workedExample: '', investigation: ['', '', ''], expectedEvidence: '', reflection: '',
    scenarios: Array.from({ length: 3 }, (_, index) => ({ id: `caso-${index + 1}`, label: '', situation: '', observation: '', explanation: '' })),
    questions: Array.from({ length: 2 }, () => ({ question: '', options: Array.from({ length: 3 }, (_, index) => ({ text: '', correct: index === 0, explanation: '' })) })),
  };
}

const levels = {
  fundamental_1: 'Ensino Fundamental I', fundamental_2: 'Ensino Fundamental II', medio: 'Ensino Médio',
  graduacao: 'Ensino Superior', pos_graduacao: 'Pós-Graduação',
};

export function createStudioLab(draft: StudioLabDraft, existing: StudioLab[] = []): StudioLab {
  const errors: string[] = [];
  for (const [label, value, minimum] of [
    ['Título', draft.title, 5], ['Disciplina', draft.subject, 3], ['Tópico', draft.topic, 3], ['Objetivo', draft.objective, 30],
  ] as const) if (typeof value !== 'string' || value.trim().length < minimum) errors.push(`${label}: informe pelo menos ${minimum} caracteres.`);
  if (!Object.hasOwn(levels, draft.academicLevel)) errors.push('Escolha um nível acadêmico válido.');
  if (!Number.isFinite(draft.estimatedHours) || draft.estimatedHours <= 0 || draft.estimatedHours > 40) errors.push('Informe uma estimativa de estudo entre 0 e 40 horas, maior que zero.');
  errors.push(...validateLearningContent('Novo laboratório', draft.content));
  if (errors.length) throw new Error(errors.join('\n'));

  const id = `custom_${crypto.randomUUID()}`;
  const known = { ...LAB_LEARNING_CONTENT, ...Object.fromEntries(existing.map(lab => [lab.id, lab.learningContent])) };
  const duplicateErrors = findRepeatedContent({ ...known, [id]: draft.content }).filter(error => error.startsWith(`${id}:`));
  if (duplicateErrors.length) throw new Error('O roteiro repete trechos completos de outro laboratório. Reescreva os casos, explicações e questões para esta atividade.');

  return {
    id, title: draft.title.trim(), subject: draft.subject.trim(), academicLevel: draft.academicLevel,
    academicLevelLabel: levels[draft.academicLevel], subjectCategory: 'Personalizados', topic: draft.topic.trim(),
    objective: draft.objective.trim(), theoreticalBackground: `${draft.content.theory}\n\nExemplo explicado\n${draft.content.workedExample}`,
    curriculumCode: 'CUSTOM-LAB', simulatedHours: draft.estimatedHours, icon: '🛠️', solverType: 'guided_activity',
    defaultParams: [], diagnosticQuestion: structuredClone(draft.content.questions[0]), learningContent: structuredClone(draft.content),
  };
}
