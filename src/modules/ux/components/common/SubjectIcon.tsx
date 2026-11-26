import { createElement } from 'react';
import {
  Atom, Beaker, BookOpen, Brain, Calculator, Code2, Dna, FlaskConical, Globe2,
  Landmark, Languages, PenLine, Users, type LucideIcon,
} from 'lucide-react';

/** Ícones de traço da marca por disciplina (manual v1.1, seção 06) — substituem emojis. */
const RULES: [RegExp, LucideIcon][] = [
  [/fisic/, Atom],
  [/quimic/, FlaskConical],
  [/biolog|genetic|ciencias/, Dna],
  [/matemat|calculo|estatist|algebra|geometr/, Calculator],
  [/redac|escrita/, PenLine],
  [/portugu|literat|gramat|alfabetiz|leitura/, BookOpen],
  [/histor/, Landmark],
  [/geograf/, Globe2],
  [/ingles|idioma|lingua|espanhol/, Languages],
  [/filosof|sociolog/, Brain],
  [/program|comput|hard ?skill|dados|software|tecnolog/, Code2],
  [/soft ?skill|lideran|comunica|carreira/, Users],
];

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function subjectIconFor(subject: string): LucideIcon {
  const key = normalize(subject);
  return RULES.find(([pattern]) => pattern.test(key))?.[1] ?? Beaker;
}

interface SubjectIconProps {
  subject: string;
  size?: number;
  className?: string;
}

/** Sempre decorativo: o nome da disciplina ou do laboratório já está no texto ao lado. */
export function SubjectIcon({ subject, size = 18, className }: SubjectIconProps) {
  return createElement(subjectIconFor(subject), { size, className, 'aria-hidden': true });
}
