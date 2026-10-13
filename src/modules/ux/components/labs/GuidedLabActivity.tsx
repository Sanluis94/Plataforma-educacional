import { useRef, useState, useEffect } from 'react';
import {useAuth} from '../../../core/contexts/AuthContext';
import {draftFingerprint,isDraftEvidence,isDraftObject,useActivityDraft} from '../../hooks/useActivityDraft';
import { useLearningCapture } from '../../hooks/useLearningCapture';
import type { LabCompletionHandler, LabCompletionReport } from '../../../data/services/learningCapture';
import type { LabLearningContent } from '../../../core/content/labLearningContent';
import { getLearningLab } from '../../../core/constants/learningCatalog';
import { learningLevelLabel, type LearningLevel } from '../../../core/constants/learningLevels';
import './GuidedLabActivity.css';

interface GuidedLabActivityProps {
  labId: string;
  title: string;
  subject: string;
  objective: string;
  academicLevel?: LearningLevel;
  content: LabLearningContent;
  onComplete?: LabCompletionHandler;
}
interface GuidedActivityDraft{
  hypotheses:Record<number,string>;notes:string;answers:Record<number,number>;revealedScenarios:number[];
  submitted:boolean;report:LabCompletionReport|null;saveError:boolean;activeSeconds:number;
}
function isGuidedActivityDraft(value:unknown,content:LabLearningContent):value is GuidedActivityDraft{
  if(!isDraftObject(value)||!isDraftObject(value.hypotheses)||!isDraftObject(value.answers)||typeof value.notes!=='string'||value.notes.length>10000||typeof value.submitted!=='boolean'||typeof value.saveError!=='boolean'||typeof value.activeSeconds!=='number'||!Number.isFinite(value.activeSeconds)||value.activeSeconds<0||!Array.isArray(value.revealedScenarios))return false;
  if(!Object.entries(value.hypotheses).every(([key,hypothesis])=>/^\d+$/.test(key)&&Number(key)<content.scenarios.length&&typeof hypothesis==='string'&&hypothesis.length<=5000))return false;
  if(!Object.entries(value.answers).every(([key,answer])=>/^\d+$/.test(key)&&Number(key)<content.questions.length&&typeof answer==='number'&&Number.isInteger(answer)&&answer>=0&&answer<content.questions[Number(key)].options.length))return false;
  if(!value.revealedScenarios.every(index=>typeof index==='number'&&Number.isInteger(index)&&index>=0&&index<content.scenarios.length))return false;
  if(value.report!==null&&(!isDraftObject(value.report)||typeof value.report.score!=='number'||!Number.isFinite(value.report.score)||value.report.score<0||value.report.score>100||typeof value.report.telemetryRows!=='number'||!Number.isInteger(value.report.telemetryRows)||value.report.telemetryRows<0||!isDraftEvidence(value.report.evidence)||value.report.evidence.source!=='lab'||(value.report.handlesDeliveryFeedback!==undefined&&typeof value.report.handlesDeliveryFeedback!=='boolean')))return false;
  if(value.submitted){
    const answers=value.answers;
    return value.report!==null&&content.questions.length>0&&content.questions.every((_,index)=>answers[index]!==undefined);
  }
  return value.report===null&&!value.saveError;
}

export function GuidedLabActivity(props:GuidedLabActivityProps){
  const {currentUser}=useAuth();const params=new URLSearchParams(window.location.search);
  const draftKey=`edu_guided_draft_v1:${currentUser?.uid??'visitor'}:${params.get('class')??''}:${params.get('lessonPlan')??''}:${props.labId}:${draftFingerprint(props.content)}`;
  return <ScopedGuidedLabActivity key={draftKey} {...props} draftKey={draftKey} />;
}
function ScopedGuidedLabActivity({ labId, title, subject, objective, academicLevel, content, onComplete,draftKey }: GuidedLabActivityProps&{draftKey:string}) {
  const {restored,persist,storageError}=useActivityDraft<GuidedActivityDraft>(draftKey,{hypotheses:{},notes:'',answers:{},revealedScenarios:[],submitted:false,report:null,saveError:false,activeSeconds:0},(value):value is GuidedActivityDraft=>isGuidedActivityDraft(value,content));
  const level = academicLevel ?? getLearningLab(labId)?.academicLevel;
  const [activeTab, setActiveTab] = useState<'activity' | 'theory' | 'assessment'>('activity');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [revealedScenarios, setRevealedScenarios] = useState<number[]>(restored.revealedScenarios);
  const [hypotheses, setHypotheses] = useState<Record<number, string>>(restored.hypotheses);
  const [notes, setNotes] = useState(restored.notes);
  const [answers, setAnswers] = useState<Record<number, number>>(restored.answers);
  const [submitted, setSubmitted] = useState(restored.submitted);
  const [showEvidence, setShowEvidence] = useState(false);
  const capture = useLearningCapture({activeSeconds:restored.activeSeconds});
  const submittedReport = useRef<LabCompletionReport | null>(restored.report);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(restored.saveError);
  useEffect(()=>{const save=()=>persist({hypotheses,notes,answers,revealedScenarios,submitted,report:submittedReport.current,saveError:saveError||saving,activeSeconds:capture.current.activeSeconds});save();window.addEventListener('pagehide',save);return()=>window.removeEventListener('pagehide',save);},[hypotheses,notes,answers,revealedScenarios,submitted,saveError,saving,persist,capture]);
  const scenario = content.scenarios[scenarioIndex];
  const revealed = revealedScenarios.includes(scenarioIndex);
  const canSubmit = content.questions.length > 0 && content.questions.every((_, index) => answers[index] !== undefined);
  const correctCount = content.questions.filter((question, index) => question.options[answers[index]]?.correct).length;

  async function submit(retry = false) {
    if (!canSubmit || saving || (submitted && !retry)) return;
    if (!retry) submittedReport.current = {
      handlesDeliveryFeedback: true,
      score: Math.round(correctCount / content.questions.length * 100), telemetryRows: 0,
      evidence: capture.current.evidence('lab', {
        labId, subject, stage: 'assessment', reflection: notes,
        observations: content.scenarios.flatMap((scenario, index) => revealedScenarios.includes(index) || hypotheses[index]?.trim() ? [{ scenarioId: scenario.id, scenarioLabel: scenario.label, hypothesis: hypotheses[index] ?? '', observed: revealedScenarios.includes(index) }] : []),
        questions: content.questions.map((question, index) => ({ questionId: `${labId}-q${index + 1}`, question: question.question, selectedOption: answers[index] ?? null, selectedText: question.options[answers[index]]?.text, expectedText: question.options.find(option => option.correct)?.text, explanation: question.options[answers[index]]?.explanation, correct: question.options[answers[index]]?.correct ?? false, topic: subject })),
      }),
    };
    setSubmitted(true);
    setSaveError(false);
    setSaving(true);
    try { if (onComplete && await onComplete(submittedReport.current!) === false) setSaveError(true); }
    catch { setSaveError(true); }
    finally { setSaving(false); }
  }

  function downloadNotes() {
    const text = [
      `# ${title}`, `Laboratório: ${labId}`, ...(level ? [`Nível: ${learningLevelLabel(level)}`] : []), `Objetivo: ${objective}`,
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
      {storageError&&<p role="alert">{storageError}</p>}
      <header>
        <p className="guided-lab-subject">{level && `${learningLevelLabel(level)} · `}{subject} · Exploração de cenários</p>
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
            <textarea id={`${labId}-prediction`} disabled={submitted} maxLength={5000} value={hypotheses[scenarioIndex] || ''} onChange={event => setHypotheses(previous => ({ ...previous, [scenarioIndex]: event.target.value }))} rows={3} />
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
            <textarea id={`${labId}-notes`} disabled={submitted} maxLength={10000} value={notes} onChange={event => setNotes(event.target.value)} rows={5} />
            <div className="guided-lab-actions">
              <button type="button" aria-expanded={showEvidence} onClick={() => setShowEvidence(previous => !previous)}>Conferir critérios de uma boa resposta</button>
              <button type="button" onClick={downloadNotes}>Baixar minhas anotações</button>
            </div>
            {showEvidence && <p className="guided-lab-observation">{content.expectedEvidence}</p>}
            <p className="guided-lab-hint">O rascunho fica neste navegador, separado por conta e atividade, por até 30 dias. Baixe suas anotações para guardar uma cópia.</p>
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
          <p>Escolha uma resposta para cada questão. A correção explica também os equívocos das outras alternativas. Ao corrigir, suas respostas e anotações são registradas; em uma aula de turma, o professor pode consultá-las.</p>
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
            <button type="button" disabled={!canSubmit || saving} onClick={() => void submit()}>Corrigir respostas</button>
            {!canSubmit && <p className="guided-lab-hint">Responda todas as questões para conferir a correção.</p>}
          </> : <div role="status">
            <p>Você acertou {correctCount} de {content.questions.length} questões.</p>
            {saving && <p>Guardando a tentativa…</p>}
            {saveError && <p role="alert">Não foi possível guardar a tentativa. Mantenha a atividade aberta e <button type="button" onClick={() => void submit(true)}>tente salvar novamente</button>.</p>}
            <button type="button" disabled={saving || saveError} onClick={() => { capture.current.reset(); submittedReport.current = null; setSubmitted(false); setAnswers({}); }}>Tentar novamente</button>
          </div>}
        </article>
      )}
    </section>
  );
}
