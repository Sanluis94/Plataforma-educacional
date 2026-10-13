import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { createPrivacyRequest, getMyPrivacyRequests, newPrivacyRequestId, PRIVACY_REQUEST_LIST_LIMIT } from '../../data/repositories/privacyRequestRepository';
import type { PrivacyRequest, PrivacyRequestKind } from '../../data/repositories/privacyRequestRepository';
import { PrivacyRequestCard } from '../components/privacy/PrivacyRequestCards';
import { REQUEST_KIND_LABELS } from '../components/privacy/privacyRequestLabels';

function RequestWorkspace({ uid, local }: { uid: string; local: boolean }) {
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);
  const [kind, setKind] = useState<PrivacyRequestKind>('access');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true), [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(''), [sendError, setSendError] = useState(''), [message, setMessage] = useState('');
  const alive = useRef(true), generation = useRef(0), busy = useRef(false);
  const pending = useRef<{ fingerprint: string; id: string } | null>(null);
  const load = useCallback(async () => {
    const requestGeneration = ++generation.current;
    setLoading(true); setLoadError('');
    try { const data = await getMyPrivacyRequests(); if (alive.current && requestGeneration === generation.current) setRequests(data); }
    catch { if (alive.current && requestGeneration === generation.current) setLoadError('Não foi possível consultar seus pedidos. Tente novamente.'); }
    finally { if (alive.current && requestGeneration === generation.current) setLoading(false); }
  }, []);
  useEffect(() => { alive.current = true; void load(); return () => { alive.current = false; }; }, [load]);
  async function submit() {
    if (busy.current || details.trim().length < 10) return;
    busy.current = true; setSending(true); setSendError(''); setMessage('');
    try {
      const fingerprint = `${kind}\0${details.trim()}`;
      if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, id: newPrivacyRequestId(uid) };
      const requestId = pending.current.id;
      const saved = await createPrivacyRequest({ requestId, kind, details: details.trim() });
      if (alive.current) {
        setRequests(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
        setDetails(''); pending.current = null;
        setMessage(`Pedido registrado. Protocolo: ${saved.protocol}. Você pode acompanhar a resposta nesta página.`);
      }
    } catch { if (alive.current) setSendError('O registro não foi confirmado. Seu texto continua nesta tela; tente novamente.'); }
    finally { busy.current = false; if (alive.current) setSending(false); }
  }
  return <>
    {local && <p role="status">Modo local de demonstração: os pedidos ficam neste navegador e não são enviados a uma equipe real.</p>}
    <section className="card" style={{ padding: '1.2rem', margin: '1.5rem 0' }}>
      <h2 style={{ fontSize: '1.2rem' }}>Registrar uma solicitação</h2>
      <p>O pedido será disponibilizado à administração desta instalação. Ele não exclui sua conta nem altera seus registros automaticamente. A resposta e eventuais medidas devem ser conferidas no atendimento.</p>
      <form onSubmit={event => { event.preventDefault(); void submit(); }}>
        <label htmlFor="privacy-kind">O que você precisa?</label>
        <select id="privacy-kind" value={kind} disabled={sending} onChange={event => setKind(event.target.value as PrivacyRequestKind)} style={{ display: 'block', width: '100%', margin: '0.4rem 0 1rem' }}>{Object.entries(REQUEST_KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <label htmlFor="privacy-details">Descreva o pedido</label>
        <textarea id="privacy-details" rows={5} minLength={10} maxLength={4000} required value={details} disabled={sending} onChange={event => setDetails(event.target.value)} aria-describedby="privacy-description" style={{ display: 'block', width: '100%', boxSizing: 'border-box', margin: '0.4rem 0' }} />
        <p id="privacy-description">Use de 10 a 4.000 caracteres. Não envie senhas, documentos de identidade ou informações de outras pessoas. O texto ainda não enviado fica apenas nesta tela e será perdido ao sair.</p>
        {kind === 'deletion' && <p>Você está solicitando análise de exclusão. A administração deverá informar o que pode ser excluído e eventual obrigação de conservação.</p>}
        <button className="btn-primary" type="submit" disabled={sending || details.trim().length < 10}>{sending ? 'Registrando…' : 'Registrar pedido'}</button>
      </form>
      {sendError && <p role="alert">{sendError}</p>}{message && <p role="status">{message}</p>}
    </section>
    <section aria-labelledby="privacy-history">
      <h2 id="privacy-history" style={{ fontSize: '1.2rem' }}>Meus protocolos</h2>
      <button className="btn-outline" disabled={loading || sending} onClick={() => void load()}>Atualizar solicitações</button>
      {loading && <p role="status">Consultando seus pedidos…</p>}{loadError && <p role="alert">{loadError}</p>}
      {!loading && !loadError && !requests.length && <p>Você ainda não registrou pedidos nesta instalação.</p>}
      {requests.length >= PRIVACY_REQUEST_LIST_LIMIT && <p>Esta consulta apresenta até {PRIVACY_REQUEST_LIST_LIMIT} pedidos. A lista pode não conter todo o histórico; solicite o histórico completo à administração.</p>}
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>{requests.map(request => <PrivacyRequestCard key={request.id} request={request} />)}</div>
    </section>
  </>;
}

export default function MyData() {
  const { currentUser, isLocalAuthMode } = useAuth();
  return <div style={{ maxWidth: '52rem', margin: 'auto', padding: '2rem 1rem 3rem', lineHeight: 1.6, overflowWrap: 'anywhere' }}>
    <Link to="/privacidade" className="btn-outline">Consultar informações de privacidade</Link>
    <h1 style={{ marginTop: '1rem' }}>Meus dados e solicitações</h1>
    <p>Registre e acompanhe pedidos sobre os seus próprios dados. Um responsável que solicite dados de outra pessoa precisa ter sua representação verificada pela equipe antes do atendimento.</p>
    {currentUser && <RequestWorkspace key={currentUser.uid} uid={currentUser.uid} local={isLocalAuthMode} />}
  </div>;
}
