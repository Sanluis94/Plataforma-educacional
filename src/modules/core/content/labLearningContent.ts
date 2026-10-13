import { LAB_PACK_INDEX } from './labPackIndex';

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
  import: 'default',
});

export const LAB_LEARNING_CONTENT: Record<string, LabLearningContent> = {};
const pending = new Map<string, Promise<void>>();

async function loadPack(path: string): Promise<void> {
  let request = pending.get(path);
  if (!request) {
    const loader = packs[path];
    if (!loader) throw new Error('Roteiro de aprendizagem indisponível.');
    request = loader().then(pack => {
      for (const [id, content] of Object.entries(pack)) {
        if (LAB_PACK_INDEX[id] !== path) throw new Error(`Índice de conteúdo inconsistente: ${id}`);
        LAB_LEARNING_CONTENT[id] = content;
      }
    }).catch(error => { pending.delete(path); throw error; });
    pending.set(path, request);
  }
  await request;
}

/** Only the selected discipline pack is downloaded. Failed loads can be retried. */
export async function loadLabLearningContent(id: string): Promise<LabLearningContent> {
  if (!LAB_LEARNING_CONTENT[id]) {
    const path = LAB_PACK_INDEX[id];
    if (!path) throw new Error(`Laboratório não encontrado: ${id}`);
    await loadPack(path);
  }
  const content = LAB_LEARNING_CONTENT[id];
  if (!content) throw new Error(`Roteiro de aprendizagem ausente: ${id}`);
  return content;
}

/** Used by content audit and authoring validation, never by the initial page. */
export async function loadAllLearningContent(): Promise<void> {
  await Promise.all(Object.keys(packs).map(loadPack));
}

export function getLabLearningContent(id: string): LabLearningContent | undefined {
  return LAB_LEARNING_CONTENT[id];
}
