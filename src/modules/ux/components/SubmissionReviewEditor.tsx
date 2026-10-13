import { useEffect, useState } from 'react';
import type { SubmissionData } from '../../data/types';
import { db } from '../../core/services/firebaseConfig';
import { getSubmissionReview, saveSubmissionReview, type SubmissionReview } from '../../data/repositories/submissionRepository';
import './ProfessorWorkflow.css';

interface Props { submission: SubmissionData; professorId: string; onSaved?: (review: SubmissionReview) => void }
interface Draft { rubricScores: Record<string, number>; feedback: string; baseVersion: number }
const criteria = [{ id: 'crit_1', label: 'Coleta e interpretação dos dados', max: 4 }, { id: 'crit_2', label: 'Explicação dos conceitos', max: 3 }, { id: 'crit_3', label: 'Conclusão e uso de evidências', max: 3 }];

export function SubmissionReviewEditor({ submission, professorId, onSaved }: Props) {
  const draftKey = `edu_review_draft_${professorId}_${submission.id}`;
  const [initial] = useState(() => { try { const raw = localStorage.getItem(draftKey); return { draft: raw ? JSON.parse(raw) as Draft : null, error: '' }; } catch { return { draft: null, error: 'Não foi possível ler o rascunho deste dispositivo. O registro anterior foi preservado.' }; } });
  const [scores, setScores] = useState<Record<string, number>>(initial.draft?.rubricScores ?? {});
  const [feedback, setFeedback] = useState(initial.draft?.feedback ?? '');
  const [review, setReview] = useState<SubmissionReview | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [error, setError] = useState(initial.error), [message, setMessage] = useState(initial.draft ? 'Rascunho recuperado deste dispositivo.' : '');
  const total = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) * 10) / 10;
  const complete = criteria.every(criterion => Number.isFinite(scores[criterion.id])) && feedback.trim().length > 0;

  useEffect(() => {
    let alive = true;
    void getSubmissionReview(submission.id!).then(saved => {
      if (!alive) return;
      setReview(saved);
      if (!initial.draft && saved) { setScores(saved.rubricScores); setFeedback(saved.generalFeedback); setMessage(saved.status === 'published' ? `Parecer publicado recuperado, versão ${saved.version}.` : 'Rascunho recuperado da plataforma.'); }
    }).catch(() => { if (alive) setError('Não foi possível recuperar o parecer da plataforma. Seu rascunho local continua disponível. Reabra esta entrega para tentar novamente.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [submission.id, initial.draft]);

  function update(nextScores: Record<string, number>, nextFeedback: string) {
    setScores(nextScores); setFeedback(nextFeedback);
    try { localStorage.setItem(draftKey, JSON.stringify({ rubricScores: nextScores, feedback: nextFeedback, baseVersion: review?.version ?? initial.draft?.baseVersion ?? 0 } satisfies Draft)); setMessage('Rascunho salvo neste dispositivo. Ainda não está disponível para o aluno.'); setError(''); }
    catch { setError('Não foi possível guardar o rascunho neste dispositivo. Mantenha esta entrega aberta até confirmar o salvamento.'); }
  }
  async function save(status: 'draft' | 'published') {
    if (loading || saving || !submission.id || !submission.classId || !professorId || (status === 'published' && !complete)) return;
    setSaving(true); setError('');
    try {
      const saved = await saveSubmissionReview({ submissionId: submission.id, classId: submission.classId, studentId: submission.studentId, professorId, status, rubricScores: scores, totalScore: total, generalFeedback: feedback, gradedAt: new Date().toISOString(), expectedVersion: review?.version ?? initial.draft?.baseVersion ?? 0 });
      setReview(saved); onSaved?.(saved);
      try { localStorage.removeItem(draftKey); } catch { /* The acknowledged server result remains authoritative. */ }
      setMessage(!db ? status === 'published' ? 'Parecer publicado no modo local deste navegador. Para compartilhar entre computadores, use o ambiente conectado.' : 'Rascunho salvo no modo local deste navegador.' : status === 'published' ? `Parecer publicado para o aluno. Versão ${saved.version}.` : 'Rascunho salvo na plataforma, visível apenas ao professor.');
    } catch (failure) { setError(failure instanceof Error && /outra sessão|alterado|critérios|orientação/.test(failure.message) ? failure.message : 'O salvamento não foi confirmado pela plataforma. Seu rascunho continua neste dispositivo; tente novamente.'); }
    finally { setSaving(false); }
  }
  return <section className="professor-workflow review-editor" aria-label={`Parecer da entrega de ${submission.studentName}`}>
    <h3>Parecer e orientação ao aluno</h3><p>O rascunho fica separado do parecer publicado. A nota da rubrica é de 0 a 10; sua inclusão no boletim depende dos critérios salvos da turma.</p>
    {loading && <p role="status">Recuperando o parecer desta entrega…</p>}
    {error && <p role="alert" className="workflow-error">{error}</p>}
    {message && <p role="status" className="workflow-notice">{message}</p>}
    <div className="workflow-grid">{criteria.map(criterion => <label key={criterion.id}>{criterion.label} (até {criterion.max} pontos)<input type="number" min="0" max={criterion.max} step="0.5" disabled={saving || loading} value={scores[criterion.id] ?? ''} onChange={event => { const next = { ...scores }; if (event.target.value === '') delete next[criterion.id]; else next[criterion.id] = Number(event.target.value); update(next, feedback); }} /></label>)}</div>
    <p><strong>{criteria.every(criterion => Number.isFinite(scores[criterion.id])) ? `Nota do parecer: ${total.toLocaleString('pt-BR')} de 10` : 'Preencha os três critérios para calcular a nota do parecer.'}</strong></p>
    <label>Orientação para o aluno<textarea rows={5} maxLength={10000} value={feedback} disabled={saving || loading} onChange={event => update(scores, event.target.value)} placeholder="Explique o que o aluno já fez bem, o conceito a retomar e qual deve ser o próximo passo." /></label>
    <div className="workflow-actions">{review?.status !== 'published' && <button type="button" className="btn-outline" disabled={saving || loading} onClick={() => void save('draft')}>Salvar rascunho na plataforma</button>}<button type="button" className="btn-gradient" disabled={!complete || saving || loading} onClick={() => void save('published')}>{saving ? 'Confirmando salvamento…' : review?.status === 'published' ? 'Publicar revisão para o aluno' : 'Publicar parecer para o aluno'}</button></div>
    {review?.status === 'published' && <p>A versão publicada permanece disponível ao aluno enquanto você prepara uma nova edição.</p>}
    {review?.history.length ? <details><summary>Ver versões anteriores publicadas ({review.history.length})</summary>{[...review.history].reverse().map(item => <article key={item.version}><h4>Versão {item.version} · {new Date(item.gradedAt).toLocaleString('pt-BR')}</h4><p>Nota: {item.totalScore} de 10</p><p style={{ whiteSpace: 'pre-wrap' }}>{item.generalFeedback}</p></article>)}</details> : null}
  </section>;
}
