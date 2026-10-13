import type { SubmissionReview } from '../../data/repositories/submissionRepository';

export function StudentReviewCard({ review, participatesInGrade }: { review: SubmissionReview | undefined; participatesInGrade: boolean }) {
  if (!review || review.status !== 'published') return null;
  return <section className="glass-card" style={{ padding: '1.25rem', color: 'var(--text-main)', border: '1px solid var(--color-primary)' }} aria-label="Parecer publicado pelo professor">
    <h3>Orientação do professor</h3>
    <p>{review.generalFeedback || 'O professor publicou os critérios desta avaliação.'}</p>
    <p>Resultado da rubrica: <strong>{review.totalScore.toFixed(1)} de 10</strong>. {participatesInGrade ? 'Este parecer compõe a nota segundo os critérios publicados da turma.' : 'Este parecer orienta seu estudo e continua separado da nota automática.'}</p>
    <dl>{Object.entries(review.rubricScores).map(([criterion, score]) => <div key={criterion}><dt>{({ crit_1: 'Compreensão e raciocínio', crit_2: 'Uso de evidências', crit_3: 'Clareza da resposta' } as Record<string, string>)[criterion] ?? criterion}</dt><dd>{score} pontos</dd></div>)}</dl>
    <p>Publicado em {new Date(review.gradedAt).toLocaleString('pt-BR')} · versão {review.version}</p>
  </section>;
}
