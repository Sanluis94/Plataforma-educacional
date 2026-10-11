import { useState } from 'react';

interface Reagent {
  id: string;
  name: string;
  formula: string;
  ph: number;
  color: string;
}

const REAGENTS: Reagent[] = [
  { id: 'hcl', name: 'Ácido Clorídrico', formula: 'HCl', ph: 1, color: '#ff6b35' },
  { id: 'hac', name: 'Ácido Acético', formula: 'CH₃COOH', ph: 3, color: '#ffa726' },
  { id: 'h2o', name: 'Água Pura', formula: 'H₂O', ph: 7, color: '#42a5f5' },
  { id: 'naoh', name: 'Hidróxido de Sódio', formula: 'NaOH', ph: 13, color: '#7c4dff' },
  { id: 'nh3', name: 'Amônia', formula: 'NH₃', ph: 11, color: '#66bb6a' },
  { id: 'h2so4', name: 'Ácido Sulfúrico', formula: 'H₂SO₄', ph: 0.5, color: '#ef5350' },
];

// Determina cor do indicador pH (escala simplificada)
function phToColor(ph: number): string {
  if (ph <= 3) return '#e53935';
  if (ph <= 5) return '#f4511e';
  if (ph <= 6) return '#f9a825';
  if (ph <= 7.5) return '#66bb6a';
  if (ph <= 9) return '#42a5f5';
  if (ph <= 11) return '#7c4dff';
  return '#4a148c';
}

function phLabel(ph: number): string {
  if (ph < 7) return 'Solução ácida';
  if (ph > 7) return 'Solução básica';
  return 'Solução neutra a 25 °C';
}

interface Tube {
  id: number;
  reagents: Reagent[];
  mixed: boolean;
}

interface ChemistryLabProps {
  mode?: string;
  labTitle?: string;
  labId?: string;
  onComplete?: (score: number) => void;
}

export function ChemistryLab({ mode: _mode = 'ph_scale', labTitle, onComplete }: ChemistryLabProps) {
  const [tubes, setTubes] = useState<Tube[]>([
    { id: 1, reagents: [], mixed: false },
    { id: 2, reagents: [], mixed: false },
    { id: 3, reagents: [], mixed: false },
  ]);
  const [selectedReagent, setSelectedReagent] = useState<Reagent | null>(null);
  const [info, setInfo] = useState<string>('Selecione um reagente e clique em um tubo de ensaio para adicionar.');

  const addToTube = (tubeId: number) => {
    if (!selectedReagent) {
      setInfo('Selecione um reagente primeiro!');
      return;
    }
    setTubes(prev => prev.map(t => {
      if (t.id !== tubeId) return t;
      if (t.reagents.length >= 3) {
        setInfo('Tubo cheio! Misture ou reinicie.');
        return t;
      }
      return { ...t, reagents: [...t.reagents, selectedReagent], mixed: false };
    }));
    setInfo(`${selectedReagent.name} adicionado ao Tubo ${tubeId}.`);
  };

  const mixTube = (tubeId: number) => {
    setTubes(prev => prev.map(t => {
      if (t.id !== tubeId || t.reagents.length < 2) return t;
      setInfo(`Tubo ${tubeId}: pH da mistura indeterminado neste modelo. Faltam volumes, concentrações e dados de equilíbrio; a média dos pHs não determina o pH final.`);
      return { ...t, mixed: true };
    }));
  };

  const resetTube = (tubeId: number) => {
    setTubes(prev => prev.map(t => t.id === tubeId ? { ...t, reagents: [], mixed: false } : t));
    setInfo(`Tubo ${tubeId} limpo.`);
  };

  const getTubePh = (tube: Tube): number | undefined => tube.reagents.length === 1 ? tube.reagents[0].ph : undefined;

  const renderTubeLiquid = (tube: Tube, color: string) => {
    const count = tube.reagents.length;
    if (count === 0) return null;
    const heightPx = Math.floor((count / 3) * 135); // Max filled height

    return (
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: `${heightPx}px`,
        overflow: 'hidden',
        borderRadius: '0 0 28px 28px',
        transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Liquid Body */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, ${color}99 0%, ${color}ee 100%)`,
          boxShadow: `inset 0 0 10px rgba(255,255,255,0.2)`,
          transition: 'background 0.5s ease',
        }} />

        {/* Waves SVG */}
        <svg
          viewBox="0 0 120 28"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: '-5px',
            left: 0,
            width: '240px',
            height: '10px',
            fill: color,
            opacity: 0.5,
            transform: 'translateX(0)',
            animation: 'chem-wave-1 3.5s linear infinite',
            transition: 'fill 0.5s ease',
          }}
        >
          <path d="M 0,10 Q 30,4 60,10 T 120,10 T 180,10 T 240,10 L 240,28 L 0,28 Z" />
        </svg>

        <svg
          viewBox="0 0 120 28"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: '-7px',
            left: '-120px',
            width: '240px',
            height: '12px',
            fill: color,
            opacity: 0.7,
            animation: 'chem-wave-2 2.5s linear infinite',
            transition: 'fill 0.5s ease',
          }}
        >
          <path d="M 0,10 Q 30,14 60,10 T 120,10 T 180,10 T 240,10 L 240,28 L 0,28 Z" />
        </svg>

      </div>
    );
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <style>{`
        @keyframes chem-wave-1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-120px); }
        }
        @keyframes chem-wave-2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(120px); }
        }
        @keyframes chem-bubble {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translateY(-110px) scale(0.5); opacity: 0; }
        }
      `}</style>
      
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🧪 {labTitle || 'Laboratório de Química Virtual'}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {_mode === 'ph_scale' ? 'Compare valores exemplificativos de pH de soluções individuais a 25 °C. Cores são símbolos didáticos; misturas sem dados suficientes não recebem pH calculado.' :
         _mode === 'titration' ? 'Exemplo calculado de titulação entre ácido forte e base forte a 25 °C.' :
         _mode === 'stoichiometry' ? 'Cálculos Estequiométricos e Conservação das Massas.' :
         _mode === 'organic' ? 'Construção de Cadeias Carbônicas e Grupos Funcionais.' :
         _mode === 'electrochemistry' ? 'Simulador de Pilhas Eletroquímicas e DDP.' :
         'Comportamento de Gases Ideais e Transformações Gasosas.'}
      </p>

      {_mode === 'titration' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>🫙 Titulação Ácido-Base</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Exemplo ideal: 12,5 mL de HCl 0,10 mol/L recebem 12,5 mL de NaOH 0,10 mol/L. As quantidades de H⁺ e OH⁻ são iguais: 1,25 mmol de cada. A equivalência ocorre em pH 7 a 25 °C; a viragem da fenolftaleína em faixa básica não é a definição de equivalência.</p>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-accessible, #B8441F)', marginBottom: '0.25rem', fontWeight: 700 }}>Bureta Graduada</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-accessible, #B8441F)' }}>NaOH 0.10 M</div>
              <div style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>Volume Adicionado: 12.5 mL</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-verde-700, #293E24)', marginBottom: '0.25rem', fontWeight: 700 }}>Erlenmeyer (Indicador)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-verde-700, #293E24)' }}>pH = 7,0 (fenolftaleína incolor)</div>
              <div style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.78rem' }}>Ponto de Equivalência Atingido</div>
            </div>
          </div>
        </div>
      )}

      {_mode === 'stoichiometry' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>⚖️ Estequiometria e Balancemento de Reações</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Ajuste os coeficientes estequiométricos para satisfazer a Lei de Lavoisier (Conservação das Massas):</p>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-verde-700, #293E24)', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)', textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>1</span> N₂ + <span style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>3</span> H₂  →  <span style={{ color: 'var(--color-verde-700, #293E24)' }}>2</span> NH₃
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>Massa dos Reagentes: 28g (N₂) + 6g (H₂) = 34g | Massa dos Produtos: 34g (NH₃)</div>
        </div>
      )}

      {_mode === 'organic' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>🧬 Química Orgânica — Construtor de Cadeias</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Montagem de hidrocarbonetos e identificação de funções orgânicas oxigenadas e nitrogenadas.</p>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-verde-700, #293E24)', marginBottom: '0.5rem' }}>Etanol (Álcool): CH₃ — CH₂ — OH</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Grupo Funcional: Hidroxila (—OH) ligada a carbono saturado | Fórmula Molecular: C₂H₆O</div>
          </div>
        </div>
      )}

      {_mode === 'electrochemistry' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>🔋 Eletroquímica — Pilha de Daniell</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Simulação de transferência de elétrons do Ânodo (Oxidação do Zinco) para o Cátodo (Redução do Cobre).</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <div style={{ padding: '1rem', background: 'rgba(188,57,31,0.1)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--color-danger, #BC391F)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-danger, #BC391F)' }}>Ânodo (−): oxidação — Zn é o agente redutor</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Zn(s) → Zn²⁺(aq) + 2e⁻</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-verde-light, rgba(41,62,36,0.12))', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-verde-700, #293E24)' }}>Cátodo (+): redução — Cu²⁺ é o agente oxidante</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Cu²⁺(aq) + 2e⁻ → Cu(s)</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-primary-accessible, #B8441F)' }}>DDP da Pilha (E⁰) = +1.10 Volts</div>
        </div>
      )}

      {_mode === 'gases' && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>🎈 Gases Ideais — Lei dos Gases</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Comportamento de partículas gasosas sob variação de Pressão (P), Volume (V) e Temperatura (T).</p>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div><span style={{ color: 'var(--color-verde-700, #293E24)' }}>Pressão:</span> <strong>2.0 atm</strong></div>
            <div><span style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>Volume:</span> <strong>5.0 L</strong></div>
            <div><span style={{ color: 'var(--color-danger, #BC391F)' }}>Temperatura:</span> <strong>350 K</strong></div>
          </div>
        </div>
      )}

      {/* Painel de Reagentes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
          Reagentes Disponíveis — Clique para selecionar:
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {REAGENTS.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedReagent(r); setInfo(`${r.name} (${r.formula}) selecionado. Clique em um tubo para adicionar.`); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: selectedReagent?.id === r.id ? `2px solid ${r.color}` : '1px solid rgba(255,255,255,0.15)',
                background: selectedReagent?.id === r.id ? `${r.color}22` : 'var(--bg-secondary)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: selectedReagent?.id === r.id ? 'bold' : 'normal',
                transition: 'all 0.2s',
              }}
            >
              {r.formula} — {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tubos de Ensaio sobre Bancada de Laboratório Clara */}
      <div className="lab-canvas-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem', padding: '2rem 1.5rem', background: '#FAF7EE', borderRadius: '14px', border: '1px solid #E2D7C3' }}>
        {tubes.map(tube => {
          const ph = getTubePh(tube);
          const color = ph !== undefined ? phToColor(ph) : tube.mixed ? '#868c8c' : (tube.reagents[tube.reagents.length - 1]?.color || '#888');
          const hasLiquid = tube.reagents.length > 0;

          return (
            <div key={tube.id}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                width: '140px',
              }}
            >
              <span style={{ color: '#172314', fontSize: '0.85rem', fontWeight: 700 }}>Tubo {tube.id}</span>

              {/* Visual tubo */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`Adicionar reagente ao tubo ${tube.id}`}
                onClick={() => addToTube(tube.id)}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); addToTube(tube.id); } }}
                style={{
                  width: '52px', height: '160px', cursor: 'pointer',
                  borderRadius: '0 0 30px 30px',
                  border: `2px solid ${hasLiquid ? `${color}` : '#293E24'}`,
                  background: 'rgba(255, 255, 255, 0.75)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.4s ease',
                  boxShadow: hasLiquid 
                    ? `0 0 18px ${color}33, inset 0 0 10px rgba(255,255,255,0.4)`
                    : 'none',
                }}
                title="Clique para adicionar reagente"
              >
                {renderTubeLiquid(tube, color)}
              </div>

              {/* pH badge */}
              {tube.reagents.length > 0 && (
                <div style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  background: color + '22',
                  border: `1px solid ${color}66`,
                  color,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  boxShadow: `0 0 10px ${color}33`,
                  transition: 'all 0.4s ease',
                }}>
                  {ph === undefined ? 'pH indeterminado' : `pH ${ph.toFixed(1)}`}<br/>
                  <span style={{ fontWeight: 'normal' }}>{ph === undefined ? 'Dados da mistura insuficientes' : phLabel(ph)}</span>
                </div>
              )}

              {/* Reagentes listados */}
              <div style={{ fontSize: '0.75rem', color: '#172314', fontWeight: 600, textAlign: 'center', minHeight: '34px' }}>
                {tube.reagents.map((r, i) => <div key={i}>{r.formula}</div>)}
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => mixTube(tube.id)} disabled={tube.reagents.length < 2}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: tube.reagents.length >= 2 ? 'pointer' : 'not-allowed',
                    background: '#E4683F', border: 'none', color: 'white', fontWeight: 700, opacity: tube.reagents.length < 2 ? 0.4 : 1 }}>
                  Misturar
                </button>
                <button onClick={() => resetTube(tube.id)}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                    background: 'transparent', border: '1px solid #293E24', color: '#293E24', fontWeight: 600 }}>
                  Limpar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de Info e IA Adaptativa */}
      <div style={{
        padding: '1.25rem', borderRadius: 'var(--radius-sm, 10px)',
        background: 'var(--color-bg-subtle, #FAF7EE)',
        border: '1px solid var(--border-color, #E2D7C3)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.4rem' }}>
          <span>Observações da bancada</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
          💡 {info}
        </p>
      </div>
      {onComplete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => onComplete(100)}
            className="btn-gradient"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.3)', fontWeight: 'bold' }}
          >
            🏆 Concluir Laboratório (+50 XP & +10 Moedas)
          </button>
        </div>
      )}
    </div>
  );
}
