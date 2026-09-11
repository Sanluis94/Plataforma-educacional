import { useState } from 'react';
import {
  Heart, Sparkles, X, Smartphone
} from 'lucide-react';

interface ParentBridgeModalProps {
  studentName?: string;
  onClose: () => void;
}

export function ParentBridgeModal({ studentName = 'Estudante', onClose }: ParentBridgeModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [mensagemProfessor, setMensagemProfessor] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSalvarWhatsapp = () => {
    if (whatsapp.trim().length >= 10) {
      setSalvo(true);
    }
  };

  const handleEnviarMensagem = () => {
    if (mensagemProfessor.trim()) {
      setEnviado(true);
      setMensagemProfessor('');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        className="glass-card slide-down"
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '1rem',
          background: 'var(--bg-card, #111827)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          padding: '1.75rem',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart style={{ width: '1.2rem', height: '1.2rem' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Portal da Família & Responsáveis
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Acompanhando o desenvolvimento científico de <strong>{studentName}</strong>
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
            <X style={{ width: '1.2rem', height: '1.2rem' }} />
          </button>
        </div>

        {/* Resumo Rápido de Frequência & Conquistas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: '0.5rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Laboratórios</span>
            <strong style={{ fontSize: '1.3rem', color: '#06b6d4' }}>14 / 16</strong>
            <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'block' }}>87% conclusão</span>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '0.5rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Média Geral</span>
            <strong style={{ fontSize: '1.3rem', color: '#a78bfa' }}>8.6</strong>
            <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'block' }}>Excelente</span>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Medalhas</span>
            <strong style={{ fontSize: '1.3rem', color: '#34d399' }}>6</strong>
            <span style={{ fontSize: '0.68rem', color: '#10b981', display: 'block' }}>Nível Avançado</span>
          </div>
        </div>

        {/* Elogio Pedagógico Recente */}
        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.25rem' }}>
            <Sparkles style={{ width: '1rem', height: '1rem' }} /> Destaque da Semana do Professor
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
            "{studentName} destacou-se na resolução socrática de termodinâmica e auxiliou colegas na formulação de hipóteses experimentais. Parabéns pelo empenho!"
          </p>
        </div>

        {/* Notificações Semanais no WhatsApp */}
        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-card)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            <Smartphone style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
            Receber Boletim Semanal no WhatsApp
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
            Enviamos aos domingos um resumo direto e sem burocracia das atividades entregues e dos próximos prazos.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem 0.75rem',
                borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
            <button
              onClick={handleSalvarWhatsapp}
              className="btn-gradient"
              style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
            >
              {salvo ? 'Salvo!' : 'Ativar Alertas'}
            </button>
          </div>
          {salvo && (
            <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'block', marginTop: '0.35rem' }}>
              ✓ Notificações automáticas vinculadas com sucesso!
            </span>
          )}
        </div>

        {/* Contatar a Coordenação / Professor */}
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Deixar um Recado para a Coordenação Pedagógica:
          </label>
          <textarea
            rows={2}
            value={mensagemProfessor}
            onChange={e => setMensagemProfessor(e.target.value)}
            placeholder="Alguma dúvida sobre o rendimento ou apoio específico necessário?"
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '0.5rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              resize: 'vertical',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleEnviarMensagem}
              disabled={!mensagemProfessor.trim()}
              className="btn-outline-cyan"
              style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
            >
              {enviado ? 'Mensagem Enviada!' : 'Enviar Mensagem'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
