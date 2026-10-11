import { useState } from 'react';
import { getLabLearningContent } from '../../../core/content/labLearningContent';
import '../../components/labs/GuidedLabActivity.css';

interface PhilosophySimulatorProps {
  mode?: string;
  labTitle?: string;
  labId?: string;
  onComplete?: (score: number) => void;
}

const MODES: Record<string, { id: string; title: string }> = {
  ethics: { id: 'fil_1', title: 'Dilemas Éticos' },
  cave_myth: { id: 'fil_2', title: 'O Mito da Caverna' },
  contractualism: { id: 'fil_3', title: 'Contratualismo' },
  logic: { id: 'fil_4', title: 'Lógica e Argumentação' },
  political_philosophy: { id: 'fil_5', title: 'Filosofia Política' },
  epistemology: { id: 'fil_6', title: 'Ciência e Método' },
};

interface ArgumentDraft {
  claim: string;
  reason: string;
  objection: string;
  response: string;
}
const EMPTY_ARGUMENT: ArgumentDraft = { claim: '', reason: '', objection: '', response: '' };

export function PhilosophySimulator({ mode = 'ethics', labTitle, onComplete }: PhilosophySimulatorProps) {
  const entry = MODES[mode];
  const content = entry && getLabLearningContent(entry.id);
  const [caseIndex, setCaseIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, ArgumentDraft>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);

  if (!content) return <p role="alert">Atividade de argumentação indisponível para este modo.</p>;
  const scenario = content.scenarios[caseIndex];
  const draft = drafts[scenario.id] ?? EMPTY_ARGUMENT;
  const update = (key: keyof ArgumentDraft, value: string) => {
    setDrafts(previous => ({ ...previous, [scenario.id]: { ...(previous[scenario.id] ?? EMPTY_ARGUMENT), [key]: value } }));
  };
  const explored = content.scenarios.filter(item => {
    const answer = drafts[item.id];
    return answer && Object.values(answer).every(value => value.trim().length >= 10);
  }).length;

  return <section className="guided-lab" aria-label={`Bancada de argumentação: ${labTitle ?? entry.title}`}>
    <h2>{labTitle ?? entry.title} — construção de argumentos</h2>
    <p>Construa uma posição, examine uma objeção e revise sua justificativa em cada caso. O comentário de referência apoia a discussão; as respostas escritas precisam ser examinadas com o professor.</p>
    <div className="guided-lab-scenarios" aria-label="Casos para argumentação">
      {content.scenarios.map((item, index) => <button type="button" key={item.id} aria-pressed={index === caseIndex} onClick={() => setCaseIndex(index)}>{item.label}</button>)}
    </div>
    <div className="guided-lab-card">
      <h3>{scenario.label}</h3>
      <p>{scenario.situation}</p>
      <label htmlFor={`${entry.id}-claim`}>Minha posição sobre o caso</label>
      <textarea id={`${entry.id}-claim`} rows={3} value={draft.claim} onChange={event => update('claim', event.target.value)} />
      <label htmlFor={`${entry.id}-reason`}>Razão ou premissa que sustenta minha posição</label>
      <textarea id={`${entry.id}-reason`} rows={3} value={draft.reason} onChange={event => update('reason', event.target.value)} />
      <label htmlFor={`${entry.id}-objection`}>Uma objeção que minha posição precisa enfrentar</label>
      <textarea id={`${entry.id}-objection`} rows={3} value={draft.objection} onChange={event => update('objection', event.target.value)} />
      <label htmlFor={`${entry.id}-response`}>Minha resposta à objeção ou revisão da posição</label>
      <textarea id={`${entry.id}-response`} rows={3} value={draft.response} onChange={event => update('response', event.target.value)} />
      <button type="button" onClick={() => setRevealed(previous => ({ ...previous, [scenario.id]: true }))}>Consultar comentário de referência</button>
      {revealed[scenario.id] && <div className="guided-lab-observation"><p>{scenario.observation}</p><p>{scenario.explanation}</p></div>}
    </div>
    <p className="guided-lab-hint">Anotações mantidas enquanto esta bancada estiver aberta. Registre cada campo com pelo menos 10 caracteres para marcar a exploração do caso; esse registro não atribui uma nota à qualidade do argumento.</p>
    <p role="status">Casos com argumento registrado: {explored} de {content.scenarios.length}.</p>
    {onComplete && <button type="button" disabled={explored !== content.scenarios.length || completed} onClick={() => { setCompleted(true); onComplete(100); }}>{completed ? 'Exploração registrada' : 'Registrar exploração dos casos'}</button>}
  </section>;
}
