import type { PrivacyRequest } from '../../../data/repositories/privacyRequestRepository';
import { REQUEST_KIND_LABELS, REQUEST_STATUS_LABELS } from './privacyRequestLabels';
export function RequestDate({ value }: { value: string }) {
  const date = new Date(value);
  return <time dateTime={value}>{Number.isFinite(date.getTime()) ? date.toLocaleString('pt-BR') : 'Data indisponível'}</time>;
}
export function PrivacyRequestCard({ request }: { request: PrivacyRequest }) {
  return <article className="card" style={{ padding: '1rem', overflowWrap: 'anywhere' }}>
    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem' }}>{REQUEST_KIND_LABELS[request.kind]}</h3>
    <p><strong>Protocolo: {request.protocol}</strong><br />Situação: {REQUEST_STATUS_LABELS[request.status]} · <RequestDate value={request.createdAt} /></p>
    <p style={{ whiteSpace: 'pre-wrap' }}>{request.details}</p>
    {request.resolution && <div><strong>Resposta da administração</strong><p style={{ whiteSpace: 'pre-wrap' }}>{request.resolution}</p></div>}
    {request.history.length > 0 && <details><summary>Histórico do atendimento ({request.history.length})</summary><ol>{request.history.map((event, index) => <li key={index}>{REQUEST_STATUS_LABELS[event.status]} · <RequestDate value={event.at} />{event.resolution && <p style={{ whiteSpace: 'pre-wrap' }}>{event.resolution}</p>}</li>)}</ol></details>}
  </article>;
}
