import { useState } from 'react';
import {
  Sparkles, Check, Building2, User, Globe, Calculator, X
} from 'lucide-react';
import { Logo } from './Logo';

interface PricingModalProps {
  onClose: () => void;
}

export function PricingModal({ onClose }: PricingModalProps) {
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('anual');
  const [numAlunosROI, setNumAlunosROI] = useState(300);

  // Cálculos de ROI
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
        className="card slide-down"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '2rem',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Logo symbolSize={26} />
              <span className="badge badge-primary">
                <Sparkles style={{ width: '0.8rem', height: '0.8rem' }} /> Planos comerciais e assinatura
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.35rem' }}>
              Transforme o ensino de ciências na sua escola
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Planos desenhados para estudantes individuais, colégios privados e redes públicas de ensino.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
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

        {/* Seletor Mensal / Anual */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', background: 'rgba(41, 62, 36, 0.05)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setBillingCycle('mensal')}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                background: billingCycle === 'mensal' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'mensal' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Faturamento mensal
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                background: billingCycle === 'anual' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'anual' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
            >
              Faturamento anual <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '6px', background: 'var(--color-verde-700)', color: '#FAF7EE' }}>20% OFF</span>
            </button>
          </div>
        </div>

        {/* Grid de 3 Planos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Plano 1: Aluno Pro (B2C) */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-verde-700)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <User style={{ width: '0.95rem', height: '0.95rem' }} /> B2C • Estudante
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                Aluno Pro
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                  {billingCycle === 'anual' ? 'R$ 23,90' : 'R$ 29,90'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / mês</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Acesso a todos os 72 laboratórios
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Simulados ENEM com cálculo TRI
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Tutor Socrático e Freiriano
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Relatório de desempenho familiar
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Redirecionando para o checkout com Pix e Cartão...')}
              className="btn-outline"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Assinar Aluno Pro
            </button>
          </div>

          {/* Plano 2: Escola Inovadora (B2B) - DESTAQUE */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'rgba(228, 104, 63, 0.05)',
            border: '2px solid var(--color-primary)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              padding: '0.2rem 0.65rem',
              borderRadius: '8px',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.72rem'
            }}>
              Mais popular
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <Building2 style={{ width: '0.95rem', height: '0.95rem' }} /> B2B • Colégios
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                Escola Inovadora
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                  {billingCycle === 'anual' ? 'R$ 7,90' : 'R$ 9,90'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / aluno / mês</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary)' }} /> Painel da coordenação e direção
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary)' }} /> Importação em massa de alunos
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary)' }} /> Radar preventivo de evasão
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary)' }} /> Relatórios oficiais em PDF
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-primary)' }} /> Provas, LMS e Gradebook ponderado
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Iniciando contratação institucional para o Colégio...')}
              className="btn-primary"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Contratar para a escola
            </button>
          </div>

          {/* Plano 3: Redes Públicas & Secretarias (B2G) */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-verde-700)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <Globe style={{ width: '0.95rem', height: '0.95rem' }} /> B2G • Governo e redes
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                Redes e Secretarias
              </h3>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                  Sob medida
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> (escala municipal ou estadual)</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Licenciamento para redes inteiras
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Alinhamento com índices educacionais
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Formação pedagógica docente oficial
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-verde-700)' }} /> Integração com portais governamentais
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Entraremos em contato com a equipe pedagógica da rede!')}
              className="btn-secondary"
              style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Falar com consultor B2G
            </button>
          </div>
        </div>

        {/* Calculadora de ROI para Diretores de Escola */}
        <div style={{
          padding: '1.5rem',
          borderRadius: '14px',
          background: 'rgba(41, 62, 36, 0.04)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-verde-700)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <Calculator style={{ width: '1.1rem', height: '1.1rem' }} />
            Calculadora de retorno sobre investimento (ROI) da escola
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Compare o custo de montar e manter um laboratório físico tradicional de ciências versus a assinatura da plataforma Edu-Interact:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Número de alunos na escola: <strong>{numAlunosROI} alunos</strong>
              </label>
              <input
                type="range"
                min={50}
                max={2000}
                step={50}
                value={numAlunosROI}
                onChange={e => setNumAlunosROI(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Investimento anual Edu-Interact:</span>
              <strong style={{ fontSize: '1.15rem', color: 'var(--color-primary-accessible, #B8441F)', display: 'block' }}>
                {formatarMoeda(custoPlataformaAno)}
              </strong>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(41, 62, 36, 0.08)', border: '1px solid rgba(41, 62, 36, 0.25)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700)' }}>Economia anual estimada:</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--color-verde-900)', display: 'block' }}>
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
