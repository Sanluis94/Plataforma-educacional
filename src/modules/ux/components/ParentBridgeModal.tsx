import { useState } from 'react';
import {
  Sparkles, X, Smartphone
} from 'lucide-react';
import { Logo } from './Logo';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';

interface ParentBridgeModalProps {
  studentName?: string;
  onClose: () => void;
}

export function ParentBridgeModal({ studentName = 'Estudante', onClose }: ParentBridgeModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [showBulletinPreview, setShowBulletinPreview] = useState(false);
  const [mensagemProfessor, setMensagemProfessor] = useState('');
  const [messagePreview, setMessagePreview] = useState('');
  const dialogRef = useDialogAccessibility(true, onClose);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--bg-overlay)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-bridge-title"
        aria-describedby="parent-bridge-demo"
        className="card slide-down"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: 'clamp(1rem, 4vw, 1.75rem)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
            <Logo variant="symbol-only" symbolSize={26} />
            <div style={{ minWidth: 0 }}>
              <h3 id="parent-bridge-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Portal da família e responsáveis — demonstração
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Acompanhando o desenvolvimento científico de <strong>{studentName}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar portal da família"
            style={{
              background: 'none',
              flexShrink: 0,
              minWidth: '44px',
              minHeight: '44px',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '1.2rem', height: '1.2rem' }} />
          </button>
        </div>

        <p id="parent-bridge-demo" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Os indicadores e o elogio abaixo são exemplos. Esta demonstração permite visualizar boletins e recados; não envia mensagens nem ativa notificações. Os campos ficam apenas nesta janela.
        </p>

        {/* Resumo Rápido de Frequência & Conquistas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(228, 104, 63, 0.06)', border: '1px solid rgba(184, 68, 31, 0.25)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Laboratórios</span>
            <strong style={{ fontSize: '1.3rem', color: 'var(--color-primary-accessible, #B8441F)' }}>14 / 16</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-verde-700)', display: 'block', fontWeight: 600 }}>87% conclusão</span>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(41, 62, 36, 0.06)', border: '1px solid rgba(41, 62, 36, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Média geral</span>
            <strong style={{ fontSize: '1.3rem', color: 'var(--color-verde-900)' }}>8.6</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-verde-700)', display: 'block', fontWeight: 600 }}>Excelente</span>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(41, 62, 36, 0.06)', border: '1px solid rgba(41, 62, 36, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Medalhas</span>
            <strong style={{ fontSize: '1.3rem', color: 'var(--color-verde-900)' }}>6</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-verde-700)', display: 'block', fontWeight: 600 }}>Nível avançado</span>
          </div>
        </div>

        {/* Elogio Pedagógico Recente */}
        <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(41, 62, 36, 0.06)', border: '1px solid rgba(41, 62, 36, 0.2)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-verde-700)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>
            <Sparkles style={{ width: '1rem', height: '1rem', color: 'var(--color-primary)' }} /> Exemplo de destaque do professor
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.45' }}>
            "{studentName} destacou-se na resolução socrática de termodinâmica e auxiliou colegas na formulação de hipóteses experimentais. Parabéns pelo empenho!"
          </p>
        </div>

        {/* Notificações Semanais no WhatsApp */}
        <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            <Smartphone style={{ width: '1rem', height: '1rem', color: 'var(--color-verde-700)' }} />
            Prévia de boletim semanal no WhatsApp
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
            Veja como seria um resumo das atividades entregues e dos próximos prazos.
          </p>

          <label htmlFor="parent-demo-whatsapp" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>WhatsApp de exemplo</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              id="parent-demo-whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              style={{
                flex: '1 1 180px',
                minWidth: 0,
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
            <button
              onClick={() => setShowBulletinPreview(true)}
              className="btn-primary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
            >
              Ver exemplo de boletim
            </button>
          </div>
          {showBulletinPreview && (
            <p role="status" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Exemplo: {studentName} concluiu uma atividade nesta semana. Próximo passo: revisar suas anotações. Nenhum boletim foi enviado.
            </p>
          )}
        </div>

        {/* Contatar a Coordenação / Professor */}
        <div>
          <label htmlFor="parent-demo-message" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Escrever um recado de exemplo para a coordenação:
          </label>
          <textarea
            id="parent-demo-message"
            rows={2}
            value={mensagemProfessor}
            onChange={e => setMensagemProfessor(e.target.value)}
            placeholder="Alguma dúvida sobre o rendimento ou apoio específico necessário?"
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              resize: 'vertical',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setMessagePreview(mensagemProfessor.trim())}
              disabled={!mensagemProfessor.trim()}
              className="btn-outline"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
            >
              Visualizar recado
            </button>
          </div>
          {messagePreview && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>Prévia do recado: {messagePreview}<br />Este recado não foi enviado.</p>}
        </div>
      </div>
    </div>
  );
}

export default ParentBridgeModal;
