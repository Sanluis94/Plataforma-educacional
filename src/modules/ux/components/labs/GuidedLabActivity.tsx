import { useState } from 'react';
import type { LabLearningContent } from '../../../core/content/labLearningContent';
import './GuidedLabActivity.css';

interface GuidedLabActivityProps {
  labId: string;
  title: string;
  subject: string;
  objective: string;
  content: LabLearningContent;
  onComplete?: (report: { score: number; telemetryRows: number }) => void;
}

export function GuidedLabActivity({ labId, title, subject, objective, content, onComplete }: GuidedLabActivityProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'theory' | 'assessment'>('activity');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [revealedScenarios, setRevealedScenarios] = useState<number[]>([]);
  const [hypotheses, setHypotheses] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const scenario = content.scenarios[scenarioIndex];
  const revealed = revealedScenarios.includes(scenarioIndex);
  const canSubmit = content.questions.length > 0 && content.questions.every((_, index) => answers[index] !== undefined);
  const correctCount = content.questions.filter((question, index) => question.options[answers[index]]?.correct).length;

  function submit() {
    if (!canSubmit || submitted) return;
    setSubmitted(true);
    onComplete?.({ score: Math.round(correctCount / content.questions.length * 10), telemetryRows: 0 });
  }

  function downloadNotes() {
    const text = [
      `# ${title}`, `Laboratório: ${labId}`, `Objetivo: ${objective}`,
      ...content.scenarios.flatMap((item, index) => [
        `## ${item.label}`, item.situation,
        `Minha previsão: ${hypotheses[index] || '(não registrada)'}`,
        ...(revealedScenarios.includes(index) ? [`Observação do cenário: ${item.observation}`, item.explanation] : []),
      ]),
      '## Minhas conclusões', notes,
      ...(submitted ? [`Avaliação: ${correctCount} de ${content.questions.length} questões corretas.`] : []),
    ].join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${labId}-atividade.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="guided-lab" aria-label={`Laboratório: ${title}`}>
      <header>
        <p className="guided-lab-subject">{subject} · Exploração de cenários</p>
        <h2>{title}</h2>
        <p>{objective}</p>
      </header>
      <nav className="guided-lab-tabs" aria-label="Etapas do laboratório">
        {([
          ['activity', 'Investigar'], ['theory', 'Compreender'], ['assessment', 'Avaliar'],
        ] as const).map(([tab, label]) => (
          <button key={tab} type="button" aria-pressed={activeTab === tab} onClick={() => setActiveTab(tab)}>{label}</button>
        ))}
      </nav>

      {activeTab === 'activity' && (
        <div className="guided-lab-stack">
          <article className="guided-lab-card">
            <h3>O problema</h3>
            <p>{content.context}</p>
            <h3>Roteiro de investigação</h3>
            <ol>{content.investigation.map(step => <li key={step}>{step}</li>)}</ol>
          </article>
          <article className="guided-lab-card">
            <h3>Compare os cenários</h3>
            <p>Escolha um caso, registre sua previsão e confira a observação. Depois, compare com outro caso.</p>
            <div className="guided-lab-scenarios" aria-label="Cenários disponíveis">
              {content.scenarios.map((item, index) => (
                <button key={item.id} type="button" aria-pressed={scenarioIndex === index} onClick={() => setScenarioIndex(index)}>
                  {item.label}{revealedScenarios.includes(index) ? ' ✓' : ''}
                </button>
              ))}
            </div>
            <h4>{scenario.label}</h4>
            <p>{scenario.situation}</p>
            <label htmlFor={`${labId}-prediction`}>Minha previsão e justificativa</label>
            <textarea id={`${labId}-prediction`} value={hypotheses[scenarioIndex] || ''} onChange={event => setHypotheses(previous => ({ ...previous, [scenarioIndex]: event.target.value }))} rows={3} />
            <button type="button" onClick={() => setRevealedScenarios(previous => previous.includes(scenarioIndex) ? previous : [...previous, scenarioIndex])}>
              Conferir observação
            </button>
            {revealed && (
              <div className="guided-lab-observation" aria-live="polite">
                <h4>O que o caso mostra</h4>
                <p>{scenario.observation}</p>
                <p>{scenario.explanation}</p>
              </div>
            )}
          </article>
          <article className="guided-lab-card">
            <h3>Registre suas conclusões</h3>
            <p>{content.reflection}</p>
            <label htmlFor={`${labId}-notes`}>Minha resposta com evidências dos cenários</label>
            <textarea id={`${labId}-notes`} value={notes} onChange={event => setNotes(event.target.value)} rows={5} />
            <div className="guided-lab-actions">
              <button type="button" aria-expanded={showEvidence} onClick={() => setShowEvidence(previous => !previous)}>Conferir critérios de uma boa resposta</button>
              <button type="button" onClick={downloadNotes}>Baixar minhas anotações</button>
            </div>
            {showEvidence && <p className="guided-lab-observation">{content.expectedEvidence}</p>}
            <p className="guided-lab-hint">As anotações ficam nesta atividade enquanto ela estiver aberta. Baixe-as antes de sair.</p>
          </article>
        </div>
      )}

      {activeTab === 'theory' && (
        <article className="guided-lab-card">
          <h3>Como o conceito funciona</h3>
          <p className="guided-lab-text">{content.theory}</p>
          <h3>Exemplo explicado</h3>
          <p className="guided-lab-text">{content.workedExample}</p>
          {content.sources && content.sources.length > 0 && <>
            <h3>Para consultar</h3>
            <ul>{content.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
          </>}
        </article>
      )}

      {activeTab === 'assessment' && (
        <article className="guided-lab-card">
          <h3>Aplique o que aprendeu</h3>
          <p>Escolha uma resposta para cada questão. A correção explica também os equívocos das outras alternativas.</p>
          {content.questions.map((question, questionIndex) => (
            <fieldset key={question.question} disabled={submitted}>
              <legend>{questionIndex + 1}. {question.question}</legend>
              {question.options.map((option, optionIndex) => (
                <label className="guided-lab-option" key={option.text}>
                  <input type="radio" name={`${labId}-question-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers(previous => ({ ...previous, [questionIndex]: optionIndex }))} />
                  <span>{option.text}</span>
                </label>
              ))}
              {submitted && <div className="guided-lab-feedback">
                {question.options.map((option, index) => <p key={option.text}>
                  <strong>{option.correct ? 'Resposta correta' : `Alternativa ${index + 1}`}: {option.text}</strong><br />{option.explanation}
                </p>)}
              </div>}
            </fieldset>
          ))}
          {!submitted ? <>
            <button type="button" disabled={!canSubmit} onClick={submit}>Corrigir respostas</button>
            {!canSubmit && <p className="guided-lab-hint">Responda todas as questões para conferir a correção.</p>}
          </> : <div role="status">
            <p>Você acertou {correctCount} de {content.questions.length} questões.</p>
            <button type="button" onClick={() => { setSubmitted(false); setAnswers({}); }}>Tentar novamente</button>
          </div>}
        </article>
      )}
    </section>
  );
}
