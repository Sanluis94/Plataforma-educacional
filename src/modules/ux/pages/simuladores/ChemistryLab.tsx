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
  if (ph < 4) return 'Ácido Forte';
  if (ph < 6) return 'Ácido Fraco';
  if (ph < 7.5) return 'Neutro';
  if (ph < 10) return 'Base Fraca';
  return 'Base Forte';
}

interface Tube {
  id: number;
  reagents: Reagent[];
  mixed: boolean;
}

export function ChemistryLab() {
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
      const avgPh = t.reagents.reduce((s, r) => s + r.ph, 0) / t.reagents.length;
      const reaction = avgPh < 7 
        ? 'Reação Ácida — observe a mudança de cor!'
        : avgPh > 7.5 
          ? 'Reação Básica — a solução fica alcalina.'
          : 'Reação Neutra — equilíbrio químico alcançado!';
      setInfo(`Tubo ${tubeId}: pH médio = ${avgPh.toFixed(1)}. ${reaction}`);
      return { ...t, mixed: true };
    }));
  };

  const resetTube = (tubeId: number) => {
    setTubes(prev => prev.map(t => t.id === tubeId ? { ...t, reagents: [], mixed: false } : t));
    setInfo(`Tubo ${tubeId} limpo.`);
  };

  const getTubePh = (tube: Tube): number => {
    if (!tube.reagents.length) return 7;
    return tube.reagents.reduce((s, r) => s + r.ph, 0) / tube.reagents.length;
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🧪 Laboratório de Química Virtual</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Selecione reagentes e misture-os nos tubos de ensaio para observar reações e variações de pH.
      </p>

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

      {/* Tubos de Ensaio */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {tubes.map(tube => {
          const ph = getTubePh(tube);
          const color = tube.mixed ? phToColor(ph) : (tube.reagents[tube.reagents.length - 1]?.color || '#888');
          return (
            <div key={tube.id}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                width: '140px',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tubo {tube.id}</span>

              {/* Visual tubo */}
              <div
                onClick={() => addToTube(tube.id)}
                style={{
                  width: '52px', height: '160px', cursor: 'pointer',
                  borderRadius: '0 0 30px 30px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.05)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
                title="Clique para adicionar reagente"
              >
                {tube.reagents.length > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: `${(tube.reagents.length / 3) * 100}%`,
                    background: tube.mixed
                      ? `linear-gradient(180deg, ${color}88, ${color})`
                      : `linear-gradient(180deg, ${color}55, ${color}cc)`,
                    transition: 'all 0.6s ease',
                    borderRadius: '0 0 28px 28px',
                  }} />
                )}
              </div>

              {/* pH badge */}
              {tube.reagents.length > 0 && (
                <div style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  background: phToColor(ph) + '33',
                  border: `1px solid ${phToColor(ph)}66`,
                  color: phToColor(ph),
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                  pH {ph.toFixed(1)}<br/>
                  <span style={{ fontWeight: 'normal' }}>{phLabel(ph)}</span>
                </div>
              )}

              {/* Reagentes listados */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {tube.reagents.map((r, i) => <div key={i}>{r.formula}</div>)}
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => mixTube(tube.id)} disabled={tube.reagents.length < 2}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: tube.reagents.length >= 2 ? 'pointer' : 'not-allowed',
                    background: 'var(--color-primary)', border: 'none', color: 'white', opacity: tube.reagents.length < 2 ? 0.4 : 1 }}>
                  Misturar
                </button>
                <button onClick={() => resetTube(tube.id)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-secondary)' }}>
                  Limpar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de Info */}
      <div style={{
        padding: '1rem 1.25rem', borderRadius: '10px',
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
      }}>
        ℹ️ {info}
      </div>
    </div>
  );
}
