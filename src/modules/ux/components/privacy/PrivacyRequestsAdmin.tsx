import { useCallback, useEffect, useRef, useState } from 'react';
import { getPrivacyRequestsForAdmin, updatePrivacyRequest, PRIVACY_REQUEST_LIST_LIMIT } from '../../../data/repositories/privacyRequestRepository';
import type { PrivacyRequest } from '../../../data/repositories/privacyRequestRepository';
import { PrivacyRequestCard } from './PrivacyRequestCards';

function RequestManagement({ request, onUpdated }: { request: PrivacyRequest; onUpdated: (saved: PrivacyRequest) => void }) {
  const [status, setStatus] = useState<'processing' | 'completed' | 'declined'>('processing');
  const [resolution, setResolution] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const inFlight = useRef(false), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const terminal = request.status === 'completed' || request.status === 'declined';
  async function save() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      const saved = await updatePrivacyRequest({ requestId: request.id, status, resolution: resolution.trim(), expectedVersion: request.version });
      if (alive.current) { onUpdated(saved); setResolution(''); }
    } catch { if (alive.current) setError('A atualização não foi confirmada. Atualize a lista para conferir a versão atual antes de tentar novamente.'); }
    finally { inFlight.current = false; if (alive.current) setBusy(false); }
  }
  return <section style={{ border: '1px solid var(--border-color)', borderRadius: '1rem', padding: '1rem', minWidth: 0 }}>
    <PrivacyRequestCard request={request} />
    {!terminal && <form style={{ marginTop: '1rem' }} onSubmit={event => { event.preventDefault(); void save(); }}>
      <label htmlFor={`status-${request.id}`}>Atualizar atendimento</label>
      <select id={`status-${request.id}`} value={status} disabled={busy} onChange={event => setStatus(event.target.value as typeof status)} style={{ width: '100%', display: 'block' }}><option value="processing">Em análise</option><option value="completed">Respondida</option><option value="declined">Pedido não atendido</option></select>
      <label htmlFor={`resolution-${request.id}`}>Nota de acompanhamento ou resposta ao solicitante</label>
      <textarea id={`resolution-${request.id}`} rows={4} maxLength={4000} value={resolution} required={status !== 'processing'} disabled={busy} onChange={event => setResolution(event.target.value)} style={{ width: '100%', display: 'block', boxSizing: 'border-box' }} />
      <p>Registrar uma resposta não executa exclusão nem exportação. Descreva as medidas realmente realizadas, o escopo e eventual justificativa de conservação ou não atendimento. Não inclua dados de terceiros na resposta.</p>
      <button className="btn-primary" disabled={busy || (status !== 'processing' && resolution.trim().length < 10) || (status === request.status && resolution.trim() === request.resolution)}>{busy ? 'Salvando…' : 'Salvar atendimento'}</button>
    </form>}
    {error && <p role="alert">{error}</p>}
  </section>;
}

export function PrivacyRequestsAdmin() {
  const [requests, setRequests] = useState<PrivacyRequest[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [message, setMessage] = useState('');
  const alive = useRef(true), generation = useRef(0);
  const load = useCallback(async () => {
    const token = ++generation.current; setLoading(true); setError('');
    try { const data = await getPrivacyRequestsForAdmin(); if (alive.current && token === generation.current) setRequests(data); }
    catch { if (alive.current && token === generation.current) setError('Não foi possível consultar os pedidos desta instalação.'); }
    finally { if (alive.current && token === generation.current) setLoading(false); }
  }, []);
  useEffect(() => { alive.current = true; void load(); return () => { alive.current = false; }; }, [load]);
  const updated = (saved: PrivacyRequest) => { setRequests(previous => previous.map(item => item.id === saved.id ? saved : item)); setMessage(`Atendimento salvo para o protocolo ${saved.protocol}.`); };
  return <div style={{ lineHeight: 1.6, overflowWrap: 'anywhere' }}>
    <h2>Atendimento de privacidade</h2><p>Pedidos privados dos titulares desta instalação. Confira identidade, representação legal, finalidade e prazo aplicável antes de atender. Não peça documentos desnecessários nem use este painel como armazenamento de cópias de identidade.</p>
    <button className="btn-outline" disabled={loading} onClick={() => void load()}>Atualizar pedidos</button>
    {loading && <p role="status">Consultando pedidos…</p>}{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {!loading && !error && !requests.length && <p>Nenhum pedido disponível nesta consulta.</p>}
    {requests.length >= PRIVACY_REQUEST_LIST_LIMIT && <p>Esta consulta apresenta até {PRIVACY_REQUEST_LIST_LIMIT} pedidos e pode não conter todo o histórico. A equipe deve conferir a fila completa por processo administrativo.</p>}
    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>{requests.map(request => <RequestManagement key={`${request.id}:${request.version}`} request={request} onUpdated={updated} />)}</div>
  </div>;
}
