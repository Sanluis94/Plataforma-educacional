import { useEffect, useRef, useState } from 'react';
import type { ActivityData, SubmissionData } from '../../data/types';
import type { LearningEvidence } from '../../data/learningAnalyticsTypes';
import { useLearningCapture } from '../hooks/useLearningCapture';
import { offlineSyncService } from '../../core/services/offlineSyncService';

interface Props {
  activity: ActivityData;
  onSubmit: (activity: ActivityData, score: number, evidence: LearningEvidence) => Promise<{ queued: boolean }>;
  previousSubmission?: SubmissionData;
  previousQueued?: boolean;
  studentId?: string;
}

export function StudentClassActivity({ activity, onSubmit, previousSubmission, previousQueued, studentId }: Props) {
  const activityArea = useRef<HTMLElement | null>(null);
  const capture = useLearningCapture({ scope: activityArea });
  const [answers, setAnswers] = useState<Record<number, number>>(() => Object.fromEntries(previousSubmission?.evidence?.questions?.flatMap((question, index) => question.selectedOption === null ? [] : [[index, question.selectedOption]]) ?? []));
  const [reflection, setReflection] = useState(previousSubmission?.evidence?.reflection ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [delivered, setDelivered] = useState<'saved' | 'queued' | null>(previousSubmission ? previousQueued ? 'queued' : 'saved' : null);
  const frozen = useRef<{ score: number; evidence: LearningEvidence } | null>(previousSubmission?.evidence ? { score: previousSubmission.score, evidence: previousSubmission.evidence } : null);
  const questions = activity.questions ?? [];
  const recordedQuestions = frozen.current?.evidence.questions ?? previousSubmission?.evidence?.questions ?? [];
  const complete = questions.length > 0 ? questions.every((_, index) => answers[index] !== undefined) : reflection.trim().length > 0;

  useEffect(() => offlineSyncService.subscribeStatus(() => {
    if (delivered !== 'queued' || !studentId || !frozen.current) return;
    try {
      const pending = offlineSyncService.getPendingSubmissions(studentId).some(item => item.kind === 'submission' && item.submission.classId === activity.classId && item.submission.evidence?.sessionId === frozen.current?.evidence.sessionId);
      if (!pending) setDelivered('saved');
    } catch { /* Keep the pending status until it can be confirmed. */ }
  }), [delivered, studentId, activity.classId]);

  async function submit() {
    if (!complete || saving || delivered) return;
    if (!frozen.current) {
      const correct = questions.filter((question, index) => answers[index] === question.answer).length;
      frozen.current = {
        score: questions.length ? Math.round(correct / questions.length * 100) : 0,
        evidence: capture.current.evidence('activity', { stage: questions.length ? 'assessment' : 'response', subject: activity.subject ?? String(activity.config.module ?? ''), reflection,
          questions: questions.map((question, index) => ({ questionId: `${activity.id}-q${index + 1}`, question: question.q, selectedOption: answers[index] ?? null, selectedText: question.options[answers[index]], expectedText: question.options[question.answer], explanation: question.explanation, correct: answers[index] === question.answer, topic: activity.subject })),
        }),
      };
    }
    setSaving(true); setError('');
    try { const result = await onSubmit(activity, frozen.current.score, frozen.current.evidence); setDelivered(result.queued ? 'queued' : 'saved'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível guardar sua entrega. Tente novamente.'); }
    finally { setSaving(false); }
  }

  return <article ref={activityArea} className="glass-card" style={{ padding: '1.25rem', minWidth: 0, color: 'var(--text-main)' }}>
    <h3>{delivered ? previousSubmission?.activityTitle ?? activity.title : activity.title}</h3>
    {(frozen.current?.evidence.subject || activity.subject) && <p>{delivered ? frozen.current?.evidence.subject || activity.subject : activity.subject}</p>}
    {previousSubmission && delivered && <p>Esta é sua entrega registrada. Uma nova tentativa utiliza a versão atual da atividade.</p>}
    {!delivered && activity.description && <p style={{ whiteSpace: 'pre-wrap' }}>{activity.description}</p>}
    {activity.dueDate && <p>Prazo: {new Date(activity.dueDate).toLocaleDateString('pt-BR')}</p>}
    {activity.theoryContent && <details><summary>Material de estudo desta atividade</summary><p style={{ whiteSpace: 'pre-wrap' }}>{activity.theoryContent.replace(/<[^>]*>/g, '')}</p></details>}
    <p>Ao entregar, seu professor recebe suas respostas, conclusões e o tempo de uso desta atividade. A entrega pertence à turma selecionada.</p>
    {delivered && recordedQuestions.length > 0 ? <div aria-label="Respostas da entrega registrada">{recordedQuestions.map((question, index) => <section key={question.questionId} style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)' }}>
      <h4>{index + 1}. {question.question}</h4>
      <p><strong>Resposta registrada:</strong> {question.selectedText || (question.selectedOption === null ? 'Não respondida' : `${question.selectedOption + 1}ª alternativa`)}</p>
      <p>{question.correct === null ? 'Sem correção automática registrada.' : question.correct ? 'Resposta correta.' : 'Resposta incorreta: revise o conceito antes de tentar novamente.'}</p>
      {question.expectedText && <p><strong>Resposta esperada na entrega:</strong> {question.expectedText}</p>}
      {question.explanation && <p>{question.explanation}</p>}
    </section>)}</div> : questions.map((question, index) => <fieldset key={index} disabled={saving || Boolean(delivered) || Boolean(frozen.current)} style={{ margin: '1rem 0', border: '1px solid var(--border-color)', borderRadius: '8px', minWidth: 0, color: 'var(--text-main)' }}>
      <legend>{index + 1}. {question.q}</legend>
      {question.options.map((option, optionIndex) => <label key={optionIndex} style={{ display: 'flex', gap: '0.6rem', padding: '0.65rem 0' }}><input type="radio" name={`${activity.id}-question-${index}`} checked={answers[index] === optionIndex} onChange={() => setAnswers(previous => ({ ...previous, [index]: optionIndex }))} /><span>{option}</span></label>)}
      {delivered && <p><strong>Resposta esperada:</strong> {question.options[question.answer]}. {question.explanation}</p>}
    </fieldset>)}
    <label htmlFor={`${activity.id}-reflection`}>Minha resposta e conclusões{questions.length === 0 ? ' (obrigatória)' : ' (opcional)'}</label>
    <textarea id={`${activity.id}-reflection`} rows={5} maxLength={10000} disabled={saving || Boolean(delivered) || Boolean(frozen.current)} value={reflection} onChange={event => setReflection(event.target.value)} style={{ display: 'block', width: '100%', boxSizing: 'border-box', margin: '0.5rem 0 1rem', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
    {error && <p role="alert">{error} Suas respostas continuam aqui.</p>}
    {!delivered && <button type="button" className="btn-gradient" disabled={!complete || saving} onClick={() => void submit()}>{saving ? 'Guardando entrega…' : frozen.current ? 'Tentar entregar novamente' : 'Entregar atividade'}</button>}
    {delivered && <p role="status">{delivered === 'queued' ? 'Entrega guardada neste dispositivo, aguardando confirmação de envio. Reconecte com este mesmo perfil.' : frozen.current?.evidence.stage === 'response' ? 'Resposta entregue para leitura do professor, sem nota automática.' : `Entrega salva. Aproveitamento: ${frozen.current?.score ?? previousSubmission?.score}%.`}</p>}
    {delivered === 'saved' && <button type="button" className="btn-outline" onClick={() => { capture.current.reset(); frozen.current = null; setAnswers({}); setReflection(''); setDelivered(null); }}>Fazer nova tentativa</button>}
  </article>;
}
