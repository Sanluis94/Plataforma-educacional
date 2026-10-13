import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyCertificate, type PublicCertificate } from '../../core/services/certificateService';
import { db } from '../../core/services/firebaseConfig';

export function VerifyCertificate() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('codigo') ?? params.get('id') ?? '';
  return <CertificateLookup key={requested} requested={requested} onSearch={code=>setParams({codigo:code})} />;
}
function CertificateLookup({requested,onSearch}:{requested:string;onSearch:(code:string)=>void}) {
  const [code, setCode] = useState(requested);
  const [result, setResult] = useState<PublicCertificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(Boolean(requested));
  const [error, setError] = useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(() => {
    let active = true;
    if (!requested) return;
    void verifyCertificate(requested).then(record => { if (active) { setResult(record); setSearched(true); } }).catch(() => { if (active) setError('Não foi possível consultar o registro. Verifique a conexão e tente novamente.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [requested,attempt]);
  return <section style={{ maxWidth: '48rem', padding: '2rem 1rem', margin: '0 auto', color: 'var(--text-main)' }}>
    <h1>Verificar certificado ou comprovante</h1>
    <p>Digite o código do documento. A consulta mostra o registro e sua validade sem divulgar nome, e-mail ou matrícula do estudante.</p>
    {!db && <p>Modo local: esta consulta verifica somente registros deste navegador. A validação em outro dispositivo exige um registro publicado no servidor.</p>}
    <form onSubmit={event => { event.preventDefault(); if (code.trim()===requested) {setLoading(true);setError('');setSearched(false);setResult(null);setAttempt(value=>value+1);} else if (code.trim()) onSearch(code.trim()); }} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '1.5rem 0' }}>
      <label style={{ flex: '1 1 20rem', minWidth: 0 }}>Código de verificação<input aria-label="Código de verificação" value={code} onChange={event => setCode(event.target.value)} maxLength={120} style={{ boxSizing: 'border-box', display: 'block', width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} /></label>
      <button type="submit" className="btn-gradient" disabled={loading || !code.trim()}>{loading ? 'Consultando…' : 'Verificar documento'}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    {searched && !result && <p role="status">Código não encontrado. Confira o código completo; documentos antigos guardados somente no navegador não possuem validação pública.</p>}
    {result && <article className="glass-card" style={{ padding: '1.5rem' }}>
      <h2>{result.status === 'revoked' ? 'Documento revogado' : 'Registro válido'}</h2>
      <p role="status">{result.status === 'revoked' ? 'Este documento foi revogado pelo responsável e não comprova uma certificação vigente.' : 'O documento corresponde a um registro ativo da plataforma.'}</p>
      <dl>
        <dt>Documento</dt><dd>{result.title}</dd>
        <dt>Natureza</dt><dd>{result.kind === 'course' ? 'Certificado emitido pelo professor responsável pela turma' : 'Comprovante de atividades de aprendizagem; não é certificação institucional'}</dd>
        <dt>Responsável</dt><dd>{result.issuerLabel}</dd>
        <dt>Emissão</dt><dd>{new Date(result.issuedAt).toLocaleString('pt-BR')}</dd>
        <dt>Requisitos registrados</dt><dd>{result.requirementsSummary} {result.completedCount} atividades verificadas.</dd>
        <dt>Carga horária do curso</dt><dd>{result.authorizedCourseHours === null ? 'Não atribuída a este comprovante' : `${result.authorizedCourseHours} horas declaradas e autorizadas pelo professor; não representam tempo medido no site`}</dd>
        <dt>Tempo de uso observado</dt><dd>{result.observedSeconds === null ? 'Medição incompleta; nenhuma duração foi estimada' : `${Math.round(result.observedSeconds / 60)} minutos medidos nas atividades verificadas; não equivale à carga horária do curso`}</dd>
        {result.revokedAt && <><dt>Revogação</dt><dd>{new Date(result.revokedAt).toLocaleString('pt-BR')}</dd></>}
      </dl>
      <p style={{ overflowWrap: 'anywhere' }}>Código: {result.id}</p>
    </article>}
    <p><Link to="/">Voltar à página inicial</Link></p>
  </section>;
}
export default VerifyCertificate;
