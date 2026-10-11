export interface LearningQuestion {
  question: string;
  options: { text: string; correct: boolean; explanation: string }[];
}

export interface LearningScenario {
  id: string;
  label: string;
  situation: string;
  observation: string;
  explanation: string;
}

export interface LabLearningContent {
  context: string;
  theory: string;
  workedExample: string;
  investigation: string[];
  expectedEvidence: string;
  reflection: string;
  scenarios: LearningScenario[];
  questions: LearningQuestion[];
  sources?: { title: string; url: string }[];
}

// Content packs contain authored lessons, not title substitutions. Keeping the
// registry independent of the catalog also permits content for legacy labs.
const packs = import.meta.glob<Record<string, LabLearningContent>>('./*.json', {
  eager: true,
  import: 'default',
});

export const LAB_LEARNING_CONTENT: Record<string, LabLearningContent> = {};
for (const [path, pack] of Object.entries(packs)) {
  for (const [id, content] of Object.entries(pack)) {
    if (LAB_LEARNING_CONTENT[id]) throw new Error(`Conteúdo de laboratório duplicado: ${id} em ${path}`);
    LAB_LEARNING_CONTENT[id] = content;
  }
}

export function getLabLearningContent(id: string): LabLearningContent | undefined {
  return LAB_LEARNING_CONTENT[id];
}
