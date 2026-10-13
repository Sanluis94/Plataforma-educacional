import { useRef, useState } from 'react';

interface Props {
  onComplete?: (score: number) => unknown | Promise<unknown>;
  ready: boolean;
}

/** Legacy bench exploration is separate from the authored lesson's assessment. */
export function LabExplorationCompletion({ onComplete, ready }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  if (!onComplete) return null;
  const complete = async () => {
    if (!ready || busy.current || saved) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      if (await onComplete(0) === false) throw new Error('Entrega não confirmada.');
      setSaved(true);
    } catch {
      setError('Não foi possível registrar a exploração. Sua prática continua nesta tela; tente novamente.');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 8 }}>
    <p>Este registro descreve a exploração da bancada. Para verificar seu aprendizado e concluir a atividade, responda à avaliação em Roteiro e avaliação.</p>
    <button className="btn-primary" disabled={!ready || saving || saved} onClick={() => { void complete(); }}>{saving ? 'Registrando exploração…' : saved ? 'Exploração registrada' : 'Registrar exploração'}</button>
    {!ready && <p>Complete as etapas de prática acima antes de registrar.</p>}
    {saved && <p role="status">Exploração registrada. Confira o status de envio da plataforma e continue a avaliação do roteiro.</p>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
