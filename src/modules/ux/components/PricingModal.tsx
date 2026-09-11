import { useState } from 'react';
import {
  Sparkles, Check, Building2, User, Globe, Calculator, X
} from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
}

export function PricingModal({ onClose }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('anual');
  const [numAlunosROI, setNumAlunosROI] = useState(300);

  // Cálculos de ROI
  // Custo médio de montagem e manutenção anual de laboratório físico tradicional: ~R$ 120.000 / ano
  // Custo Edu-Interact: R$ 9,90/aluno/mês (no anual com desconto: R$ 7,90/mês = R$ 94,80/aluno/ano)
  const custoPlataformaAno = numAlunosROI * (billingCycle === 'anual' ? 7.9 * 12 : 9.9 * 12);
  const custoLabFisicoAno = 120000;
  const economiaEstimada = Math.max(0, custoLabFisicoAno - custoPlataformaAno);

  const formatarMoeda = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '850px',
          borderRadius: '1.25rem',
          background: 'var(--bg-card, #0f172a)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          padding: '2rem',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
              <Sparkles style={{ width: '1rem', height: '1rem' }} /> PLANOS COMERCIAIS & ASSINATURA SAAS
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
              Transforme o Ensino de Ciências na sua Escola
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Planos desenhados para estudantes individuais, colégios privados e secretarias públicas.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
            <X style={{ width: '1.4rem', height: '1.4rem' }} />
          </button>
        </div>

        {/* Seletor Mensal / Anual */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setBillingCycle('mensal')}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                background: billingCycle === 'mensal' ? '#06b6d4' : 'transparent',
                color: billingCycle === 'mensal' ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Faturamento Mensal
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                background: billingCycle === 'anual' ? '#06b6d4' : 'transparent',
                color: billingCycle === 'anual' ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              Faturamento Anual <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '9999px', background: '#10b981', color: '#fff' }}>20% OFF</span>
            </button>
          </div>
        </div>

        {/* Grid de 3 Planos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Plano 1: Aluno Pro (B2C) */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                <User style={{ width: '1rem', height: '1rem' }} /> B2C • ESTUDANTE
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                Aluno Pro
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {billingCycle === 'anual' ? 'R$ 23,90' : 'R$ 29,90'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / mês</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Acesso a todos os 72 laboratórios
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Simulados ENEM com cálculo TRI ilimitados
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Tutor Socrático & Freiriano IA
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Relatório de desempenho para os pais
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Redirecionando para o checkout transparente com Pix e Cartão...')}
              className="btn-outline-cyan"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Assinar Aluno Pro
            </button>
          </div>

          {/* Plano 2: Escola Inovadora (B2B) - DESTAQUE */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.15) 100%)',
            border: '2px solid #06b6d4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: '#06b6d4',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.7rem'
            }}>
              MAIS POPULAR
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                <Building2 style={{ width: '1rem', height: '1rem' }} /> B2B • COLÉGIOS
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                Escola Inovadora
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {billingCycle === 'anual' ? 'R$ 7,90' : 'R$ 9,90'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / aluno / mês</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#06b6d4' }} /> Painel da Coordenação & Direção
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#06b6d4' }} /> Importação em massa via CSV de alunos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#06b6d4' }} /> Radar preditivo de evasão / desengajamento
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#06b6d4' }} /> Relatórios Oficiais White-Label em PDF
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#06b6d4' }} /> Moodle LMS, Provas e Gradebook Ponderado
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Iniciando contratação institucional para o Colégio com emissão de contrato e nota fiscal...')}
              className="btn-gradient"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 800 }}
            >
              Contratar para a Escola
            </button>
          </div>

          {/* Plano 3: Redes Públicas & Secretarias (B2G) */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                <Globe style={{ width: '1rem', height: '1rem' }} /> B2G • GOVERNO / REDES
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                Redes & Secretarias
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  Sob Medida
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> (escala municipal/estadual)</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Licenciamento para milhares de alunos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Alinhamento métrico com índice IDEB
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Capacitação pedagógica docente oficial
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} /> Integração LTI 1.3 com portais governamentais
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Entraremos em contato com a equipe de compras públicas e secretaria de educação!')}
              className="btn-outline-cyan"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Falar com Consultor B2G
            </button>
          </div>
        </div>

        {/* Calculadora de ROI para Diretores de Escola */}
        <div style={{
          padding: '1.5rem',
          borderRadius: '1rem',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Calculator style={{ width: '1.1rem', height: '1.1rem' }} />
            Calculadora de Retorno sobre Investimento (ROI) da Escola
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Compare o custo de montar e manter um laboratório físico tradicional de ciências versus a assinatura da plataforma Edu-Interact:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Número de Alunos na Escola: <strong>{numAlunosROI} alunos</strong>
              </label>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={numAlunosROI}
                onChange={e => setNumAlunosROI(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Investimento Anual Edu-Interact:</span>
              <strong style={{ fontSize: '1.15rem', color: '#06b6d4', display: 'block' }}>
                {formatarMoeda(custoPlataformaAno)}
              </strong>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#34d399' }}>Economia Anual Estimada:</span>
              <strong style={{ fontSize: '1.3rem', color: '#10b981', display: 'block' }}>
                {formatarMoeda(economiaEstimada)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PricingModal;
