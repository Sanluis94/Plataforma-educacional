import { useState, useRef, useEffect, useMemo } from 'react';

interface MathSimulatorProps {
  mode?: string;
  functionType?: 'linear' | 'quadratic' | 'trigonometric' | 'spatial' | 'statistics' | 'matrices' | 'generic' | string;
  title?: string;
  labTitle?: string;
  labId?: string;
  onComplete?: (score: number) => void;
}

export function MathSimulator({ mode, functionType = 'linear', title, labTitle, onComplete }: MathSimulatorProps) {
  const initialMode = mode || (functionType !== 'generic' ? functionType : 'linear');
  const [activeTab, setActiveTab] = useState<string>(initialMode);

  useEffect(() => {
    if (mode) setActiveTab(mode);
    else if (functionType && functionType !== 'generic') setActiveTab(functionType);
  }, [mode, functionType]);

  const displayTitle = labTitle || title;

  const handleFinish = () => {
    if (onComplete) onComplete(100);
  };

  return (
    <div className="math-simulator mt-4 p-4" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)' }}>
      {/* Header com identificação do laboratório */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#06b6d4' }}>
            Laboratório Especializado de Matemática
          </span>
          <h2 style={{ color: 'var(--text-main)', margin: '0.25rem 0 0 0', fontSize: '1.35rem' }}>
            {displayTitle || (
              activeTab === 'linear' ? 'Função de 1º Grau (Reta Afim)' :
              activeTab === 'quadratic' ? 'Função de 2º Grau (Parábola & Bhaskara)' :
              activeTab === 'trigonometric' ? 'Funções Trigonométricas & Círculo Unitário' :
              activeTab === 'spatial' ? 'Geometria Espacial (Sólidos 3D, Volume & Área)' :
              activeTab === 'statistics' ? 'Estatística Descritiva (Amostragem, Histograma & Boxplot)' :
              'Matrizes & Sistemas Lineares (Determinantes & Cramer)'
            )}
          </h2>
        </div>

        {/* Seletor rápido de módulo matemático */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.25)', padding: '0.35rem', borderRadius: '8px' }}>
          {[
            { id: 'linear', label: '1º Grau' },
            { id: 'quadratic', label: '2º Grau' },
            { id: 'trigonometric', label: 'Trigonometria' },
            { id: 'spatial', label: 'Geom. Espacial' },
            { id: 'statistics', label: 'Estatística' },
            { id: 'matrices', label: 'Matrizes & Sistemas' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 700 : 500,
                background: activeTab === tab.id ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Renderização condicional do laboratório especializado */}
      {activeTab === 'linear' && <LinearLab onFinish={handleFinish} />}
      {activeTab === 'quadratic' && <QuadraticLab onFinish={handleFinish} />}
      {activeTab === 'trigonometric' && <TrigonometricLab onFinish={handleFinish} />}
      {activeTab === 'spatial' && <SpatialLab onFinish={handleFinish} />}
      {activeTab === 'statistics' && <StatisticsLab onFinish={handleFinish} />}
      {activeTab === 'matrices' && <MatricesLab onFinish={handleFinish} />}
    </div>
  );
}

// ============================================================================
// 1. LABORATÓRIO: FUNÇÃO DE 1º GRAU (RETA AFIM)
// ============================================================================
function LinearLab({ onFinish }: { onFinish: () => void }) {
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(-1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ px: number; py: number; mx: number; my: number } | null>(null);

  const root = a !== 0 ? -b / a : null;

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 35; // px por unidade

    ctx.clearRect(0, 0, width, height);

    // Grid cartesiano
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += scale) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += scale) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Eixos X e Y
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Rótulos dos eixos
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let x = scale; x < width; x += scale) {
      const val = Math.round((x - width / 2) / scale);
      if (val !== 0) ctx.fillText(val.toString(), x - 4, height / 2 + 13);
    }
    for (let y = scale; y < height; y += scale) {
      const val = Math.round((height / 2 - y) / scale);
      if (val !== 0) ctx.fillText(val.toString(), width / 2 + 6, y + 3.5);
    }

    // Triângulo de inclinação Delta Y / Delta X entre x=0 e x=1
    const x0 = 0;
    const y0 = b;
    const x1 = 1;
    const y1 = a * x1 + b;
    const px0 = width / 2 + x0 * scale;
    const py0 = height / 2 - y0 * scale;
    const px1 = width / 2 + x1 * scale;
    const py1 = height / 2 - y1 * scale;

    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px1, py0);
    ctx.lineTo(px1, py1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reta da Função
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    const minX = (0 - width / 2) / scale;
    const maxX = (width - width / 2) / scale;
    ctx.moveTo(0, height / 2 - (a * minX + b) * scale);
    ctx.lineTo(width, height / 2 - (a * maxX + b) * scale);
    ctx.stroke();

    // Ponto de Intercepto Y (0, b)
    ctx.beginPath();
    ctx.fillStyle = '#f59e0b';
    ctx.arc(px0, py0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(`(0, ${b.toFixed(1)})`, px0 + 8, py0 - 4);

    // Ponto da Raiz (x, 0)
    if (root !== null) {
      const prx = width / 2 + root * scale;
      const pry = height / 2;
      ctx.beginPath();
      ctx.fillStyle = '#10b981';
      ctx.arc(prx, pry, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`Raiz (${root.toFixed(2)}, 0)`, prx + 6, pry + 15);
    }

    // Posição do Mouse
    if (mousePos.current) {
      const { px, py, mx, my } = mousePos.current;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(px, 0); ctx.lineTo(px, height);
      ctx.moveTo(0, py); ctx.lineTo(width, py);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`P(${mx.toFixed(1)}, ${my.toFixed(1)})`, px + 8, py - 8);
    }
  };

  useEffect(() => {
    draw();
  }, [a, b]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const scale = 35;
    const mx = (px - canvas.width / 2) / scale;
    const my = (canvas.height / 2 - py) / scale;
    mousePos.current = { px, py, mx, my };
    draw();
  };

  const handleMouseLeave = () => {
    mousePos.current = null;
    draw();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
      {/* Canvas */}
      <div style={{ background: '#0e131b', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas
          ref={canvasRef}
          width={420}
          height={380}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: '100%', maxWidth: '420px', aspectRatio: '420/380', cursor: 'crosshair' }}
        />
        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
          <span style={{ color: '#06b6d4' }}>● Reta f(x) = {a}x + {b}</span>
          <span style={{ color: '#f59e0b' }}>● Intercepto Y (0, {b})</span>
          <span style={{ color: '#10b981' }}>● Raiz {root !== null ? `(${root.toFixed(2)}, 0)` : 'Inexistente'}</span>
        </div>
      </div>

      {/* Painel de Controles e Análise */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Parâmetros da Reta Afim: f(x) = ax + b</h4>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Coeficiente Angular (a - Inclinação):</span>
              <strong style={{ color: '#06b6d4' }}>{a.toFixed(1)}</strong>
            </div>
            <input
              type="range" min="-4" max="4" step="0.2" value={a}
              onChange={e => setA(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#06b6d4' }}
            />
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Coeficiente Linear (b - Intercepto Y):</span>
              <strong style={{ color: '#f59e0b' }}>{b.toFixed(1)}</strong>
            </div>
            <input
              type="range" min="-5" max="5" step="0.5" value={b}
              onChange={e => setB(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b' }}
            />
          </div>
        </div>

        {/* Tabela de Propriedades Matemáticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Classificação</span>
            <strong style={{ color: a > 0 ? '#10b981' : a < 0 ? '#ef4444' : '#f59e0b', fontSize: '0.85rem' }}>
              {a > 0 ? '📈 Estritamente Crescente' : a < 0 ? '📉 Estritamente Decrescente' : '⏸️ Função Constante'}
            </strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Taxa de Variação (Δy/Δx)</span>
            <strong style={{ color: '#06b6d4', fontSize: '0.85rem' }}>{a} por unidade de x</strong>
          </div>
        </div>

        {/* Diagnóstico de IA */}
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span>🤖 IA ADAPTATIVA (ANÁLISE AFIM)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
            {a > 0
              ? `Com a inclinação positiva a = ${a}, para cada avanço de 1 unidade em x, o valor de y sobe ${a} unidades. A raiz cruza o eixo horizontal em x = ${root?.toFixed(2)}.`
              : a < 0
                ? `Como a = ${a} é negativo, a reta decai. Valores maiores de x produzem valores menores de f(x). Intercepto em y = ${b}.`
                : `Com a = 0, a reta é horizontal (f(x) = ${b}). Não existe dependência linear em relação a x.`}
          </p>
        </div>

        <button
          onClick={onFinish}
          className="premium-btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 'bold', padding: '0.75rem' }}
        >
          🏆 Concluir Laboratório de 1º Grau (+50 XP)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 2. LABORATÓRIO: FUNÇÃO DE 2º GRAU (PARÁBOLA & BHASKARA)
// ============================================================================
function QuadraticLab({ onFinish }: { onFinish: () => void }) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-3);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cálculos de Bhaskara
  const delta = b * b - 4 * a * c;
  const xv = -b / (2 * a);
  const yv = -delta / (4 * a);

  let roots: number[] = [];
  if (delta > 0) {
    roots = [(-b + Math.sqrt(delta)) / (2 * a), (-b - Math.sqrt(delta)) / (2 * a)].sort((x, y) => x - y);
  } else if (delta === 0) {
    roots = [-b / (2 * a)];
  }

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 30;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += scale) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += scale) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Eixos
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Eixo de Simetria x = xv
    const pxv = width / 2 + xv * scale;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.moveTo(pxv, 0); ctx.lineTo(pxv, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Parábola
    ctx.beginPath();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    let first = true;
    for (let px = 0; px <= width; px += 2) {
      const x = (px - width / 2) / scale;
      const y = a * x * x + b * x + c;
      const py = height / 2 - y * scale;
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Vértice V(xv, yv)
    const pyv = height / 2 - yv * scale;
    ctx.beginPath();
    ctx.fillStyle = '#ec4899';
    ctx.arc(pxv, pyv, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`V(${xv.toFixed(1)}, ${yv.toFixed(1)})`, pxv + 8, pyv - 6);

    // Raízes Reais
    roots.forEach((r, idx) => {
      const prx = width / 2 + r * scale;
      const pry = height / 2;
      ctx.beginPath();
      ctx.fillStyle = '#10b981';
      ctx.arc(prx, pry, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.fillText(`x${idx + 1}=${r.toFixed(2)}`, prx - 12, pry + 16);
    });

    // Intercepto Y (0, c)
    const pyc = height / 2 - c * scale;
    ctx.beginPath();
    ctx.fillStyle = '#f59e0b';
    ctx.arc(width / 2, pyc, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`(0, ${c.toFixed(1)})`, width / 2 + 8, pyc + 4);
  };

  useEffect(() => {
    draw();
  }, [a, b, c]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
      {/* Canvas */}
      <div style={{ background: '#0e131b', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={canvasRef} width={420} height={380} style={{ width: '100%', maxWidth: '420px', aspectRatio: '420/380' }} />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#a855f7' }}>● Parábola f(x) = {a}x² + {b}x + {c}</span>
          <span style={{ color: '#ec4899' }}>● Vértice V({xv.toFixed(1)}, {yv.toFixed(1)})</span>
          <span style={{ color: '#10b981' }}>● Raízes ({roots.length})</span>
        </div>
      </div>

      {/* Controles e Bhaskara */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Coeficientes: ax² + bx + c</h4>

          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>a (Abertura/Concavidade):</span>
              <strong style={{ color: '#a855f7' }}>{a.toFixed(1)}</strong>
            </div>
            <input
              type="range" min="-3" max="3" step="0.2" value={a}
              onChange={e => {
                const val = parseFloat(e.target.value);
                setA(val === 0 ? 0.2 : val);
              }}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7' }}
            />
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>b (Deslocamento linear):</span>
              <strong style={{ color: '#06b6d4' }}>{b.toFixed(1)}</strong>
            </div>
            <input
              type="range" min="-5" max="5" step="0.5" value={b}
              onChange={e => setB(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#06b6d4' }}
            />
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>c (Intercepto vertical):</span>
              <strong style={{ color: '#f59e0b' }}>{c.toFixed(1)}</strong>
            </div>
            <input
              type="range" min="-5" max="5" step="0.5" value={c}
              onChange={e => setC(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b' }}
            />
          </div>
        </div>

        {/* Análise de Bhaskara */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Discriminante (Δ = b² - 4ac):</span>
            <span style={{ fontWeight: 700, color: delta > 0 ? '#10b981' : delta === 0 ? '#f59e0b' : '#ef4444' }}>
              Δ = {delta.toFixed(2)} ({delta > 0 ? '2 raízes reais' : delta === 0 ? '1 raiz dupla' : 'Sem raízes reais'})
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div><strong>Vértice V:</strong> ({xv.toFixed(2)}, {yv.toFixed(2)}) — {a > 0 ? 'Ponto de Mínimo' : 'Ponto de Máximo'}</div>
            <div><strong>Concavidade:</strong> {a > 0 ? 'Voltada para cima (∪)' : 'Voltada para baixo (∩)'}</div>
            {roots.length > 0 ? (
              <div><strong>Raízes:</strong> {roots.map(r => r.toFixed(2)).join(' e ')}</div>
            ) : (
              <div style={{ color: '#ef4444' }}><strong>Raízes:</strong> Não intercepta o eixo X no plano real (Δ &lt; 0)</div>
            )}
          </div>
        </div>

        {/* Diagnóstico IA */}
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a855f7', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span>🤖 IA ADAPTATIVA (ANÁLISE QUADRÁTICA)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
            {delta > 0
              ? `A parábola corta o eixo X em dois pontos distintos. Seu vértice atinge o valor extremo y = ${yv.toFixed(2)}.`
              : delta === 0
                ? `Como o discriminante Δ é zero, a parábola apenas tangencia o eixo X no vértice (${xv.toFixed(2)}, 0).`
                : `Com Δ = ${delta.toFixed(1)} < 0, a parábola flutua completamente ${a > 0 ? 'acima' : 'abaixo'} do eixo X.`}
          </p>
        </div>

        <button
          onClick={onFinish}
          className="premium-btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', fontWeight: 'bold', padding: '0.75rem' }}
        >
          🏆 Concluir Laboratório de 2º Grau (+50 XP)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 3. LABORATÓRIO: FUNÇÕES TRIGONOMÉTRICAS & CÍRCULO UNITÁRIO
// ============================================================================
function TrigonometricLab({ onFinish }: { onFinish: () => void }) {
  const [func, setFunc] = useState<'sin' | 'cos' | 'tan'>('sin');
  const [angleDeg, setAngleDeg] = useState(45);
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const circleCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);

  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad);
  const cosVal = Math.cos(angleRad);
  const tanVal = Math.cos(angleRad) !== 0 ? Math.tan(angleRad) : null;

  // Desenhar Círculo Trigonométrico
  const drawCircle = () => {
    const canvas = circleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 90;

    ctx.clearRect(0, 0, width, height);

    // Eixos
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.moveTo(cx, 15); ctx.lineTo(cx, height - 15);
    ctx.moveTo(15, cy); ctx.lineTo(width - 15, cy);
    ctx.stroke();

    // Círculo Unitário R = 1
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Ponto no círculo
    const px = cx + cosVal * radius;
    const py = cy - sinVal * radius;

    // Projeção Cosseno (eixo X)
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, cy);
    ctx.stroke();

    // Projeção Seno (eixo Y)
    ctx.beginPath();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Raio Vetor Hipotenusa
    ctx.beginPath();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Ponto de Ângulo
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();

    // Arco de ângulo
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
    ctx.arc(cx, cy, 25, 0, -angleRad, true);
    ctx.stroke();

    // Rótulos
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`cos = ${cosVal.toFixed(2)}`, cx + 6, cy + 18);
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`sen = ${sinVal.toFixed(2)}`, px + 6, cy - (sinVal * radius) / 2);
  };

  // Desenhar Onda Contínua
  const drawWave = () => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Eixo central
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.stroke();

    // Traçado da função periódica
    ctx.beginPath();
    ctx.strokeStyle = func === 'sin' ? '#ec4899' : func === 'cos' ? '#06b6d4' : '#f59e0b';
    ctx.lineWidth = 2.5;

    const pxPerRad = 35;
    for (let xPx = 0; xPx <= width; xPx += 2) {
      const rad = (xPx / pxPerRad) * frequency;
      let yVal = 0;
      if (func === 'sin') yVal = amplitude * Math.sin(rad);
      else if (func === 'cos') yVal = amplitude * Math.cos(rad);
      else yVal = Math.tan(rad);

      const yPx = cy - yVal * 40;
      if (xPx === 0) ctx.moveTo(xPx, yPx);
      else if (Math.abs(yVal) < 4) ctx.lineTo(xPx, yPx);
      else ctx.moveTo(xPx, yPx);
    }
    ctx.stroke();

    // Marcador do ângulo atual
    const markerX = (angleRad / frequency) * pxPerRad;
    if (markerX <= width) {
      const curY = func === 'sin' ? sinVal : func === 'cos' ? cosVal : (tanVal || 0);
      const markerY = cy - curY * amplitude * 40;

      ctx.beginPath();
      ctx.fillStyle = '#facc15';
      ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    drawCircle();
    drawWave();
  }, [angleDeg, func, amplitude, frequency]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
      {/* Canvas Duplo: Círculo Unitário & Gráfico de Onda */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: '#0e131b', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
            Círculo Trigonométrico Unitário (R = 1)
          </span>
          <canvas ref={circleCanvasRef} width={260} height={240} style={{ maxWidth: '100%' }} />
        </div>

        <div style={{ background: '#0e131b', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
            Função Periódica: f(x) = {amplitude} · {func}({frequency}x)
          </span>
          <canvas ref={waveCanvasRef} width={420} height={130} style={{ width: '100%', maxWidth: '420px' }} />
        </div>
      </div>

      {/* Controles e Valores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {(['sin', 'cos', 'tan'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFunc(type)}
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: func === type ? '#ec4899' : 'rgba(255,255,255,0.08)',
                  color: func === type ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {type === 'sin' ? 'Seno (sen)' : type === 'cos' ? 'Cosseno (cos)' : 'Tangente (tg)'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Ângulo θ:</span>
              <strong style={{ color: '#facc15' }}>{angleDeg}° ({(angleRad / Math.PI).toFixed(2)}π rad)</strong>
            </div>
            <input
              type="range" min="0" max="360" step="5" value={angleDeg}
              onChange={e => setAngleDeg(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#facc15' }}
            />
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Amplitude (A):</span>
              <strong style={{ color: '#ec4899' }}>{amplitude.toFixed(1)}</strong>
            </div>
            <input
              type="range" min="0.5" max="3" step="0.5" value={amplitude}
              onChange={e => setAmplitude(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#ec4899' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Frequência Angular (B):</span>
              <strong style={{ color: '#06b6d4' }}>{frequency.toFixed(1)}</strong>
            </div>
            <input
              type="range" min="0.5" max="3" step="0.5" value={frequency}
              onChange={e => setFrequency(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#06b6d4' }}
            />
          </div>
        </div>

        {/* Valores Trigonométricos Exatos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>sen(θ)</span>
            <strong style={{ color: '#ec4899', fontSize: '0.85rem' }}>{sinVal.toFixed(3)}</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>cos(θ)</span>
            <strong style={{ color: '#06b6d4', fontSize: '0.85rem' }}>{cosVal.toFixed(3)}</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>tg(θ)</span>
            <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>{tanVal !== null ? tanVal.toFixed(3) : 'Indefinida'}</strong>
          </div>
        </div>

        {/* Diagnóstico IA */}
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ec4899', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span>🤖 IA ADAPTATIVA (TRIGONOMETRIA)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
            No ângulo de {angleDeg}°, o ponto está no {angleDeg < 90 ? '1º quadrante (sen > 0, cos > 0)' : angleDeg < 180 ? '2º quadrante (sen > 0, cos < 0)' : angleDeg < 270 ? '3º quadrante (sen < 0, cos < 0)' : '4º quadrante (sen < 0, cos > 0)'}.
            A relação fundamental sen²(θ) + cos²(θ) = {(sinVal * sinVal + cosVal * cosVal).toFixed(2)} se mantém constante.
          </p>
        </div>

        <button
          onClick={onFinish}
          className="premium-btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #ec4899, #f59e0b)', fontWeight: 'bold', padding: '0.75rem' }}
        >
          🏆 Concluir Laboratório de Trigonometria (+50 XP)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 4. LABORATÓRIO: GEOMETRIA ESPACIAL (SÓLIDOS 3D, VOLUME & ÁREA)
// ============================================================================
type SolidType = 'cylinder' | 'cone' | 'sphere' | 'cuboid' | 'pyramid';

function SpatialLab({ onFinish }: { onFinish: () => void }) {
  const [solid, setSolid] = useState<SolidType>('cylinder');
  const [radius, setRadius] = useState(4);
  const [height, setHeight] = useState(8);
  const [length, setLength] = useState(6);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cálculos geométricos precisos
  const metrics = useMemo(() => {
    const pi = Math.PI;
    if (solid === 'cylinder') {
      const baseArea = pi * radius * radius;
      const lateralArea = 2 * pi * radius * height;
      const totalArea = 2 * baseArea + lateralArea;
      const volume = baseArea * height;
      return { baseArea, lateralArea, totalArea, volume, formulaVol: 'V = π·r²·h', formulaArea: 'A = 2πr(r + h)' };
    } else if (solid === 'cone') {
      const slantHeight = Math.sqrt(radius * radius + height * height);
      const baseArea = pi * radius * radius;
      const lateralArea = pi * radius * slantHeight;
      const totalArea = baseArea + lateralArea;
      const volume = (1 / 3) * baseArea * height;
      return { baseArea, lateralArea, totalArea, volume, formulaVol: 'V = (1/3)π·r²·h', formulaArea: 'A = πr(r + g)' };
    } else if (solid === 'sphere') {
      const totalArea = 4 * pi * radius * radius;
      const volume = (4 / 3) * pi * Math.pow(radius, 3);
      return { baseArea: 0, lateralArea: totalArea, totalArea, volume, formulaVol: 'V = (4/3)π·r³', formulaArea: 'A = 4π·r²' };
    } else if (solid === 'cuboid') {
      const baseArea = length * radius; // largura x profundidade
      const totalArea = 2 * (length * radius + length * height + radius * height);
      const volume = length * radius * height;
      return { baseArea, lateralArea: totalArea - 2 * baseArea, totalArea, volume, formulaVol: 'V = a·b·c', formulaArea: 'A = 2(ab + bc + ac)' };
    } else {
      // Pirâmide de base quadrangular
      const baseArea = length * length;
      const slantHeight = Math.sqrt(Math.pow(length / 2, 2) + height * height);
      const lateralArea = 2 * length * slantHeight;
      const totalArea = baseArea + lateralArea;
      const volume = (1 / 3) * baseArea * height;
      return { baseArea, lateralArea, totalArea, volume, formulaVol: 'V = (1/3)L²·h', formulaArea: 'A = L² + 2Lg' };
    }
  }, [solid, radius, height, length]);

  // Renderização do Wireframe Isométrico 3D com iluminação
  const draw3D = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const heightCanvas = canvas.height;
    const cx = width / 2;
    const cy = heightCanvas / 2 + 20;

    ctx.clearRect(0, 0, width, heightCanvas);

    // Eixos do espaço isométrico
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 140); // Eixo Z (altura)
    ctx.moveTo(cx, cy); ctx.lineTo(cx - 120, cy + 70); // Eixo X
    ctx.moveTo(cx, cy); ctx.lineTo(cx + 120, cy + 70); // Eixo Y
    ctx.stroke();

    const radScale = radius * 12;
    const hScale = height * 14;
    const lScale = length * 12;

    if (solid === 'cylinder') {
      // Base inferior
      ctx.beginPath();
      ctx.ellipse(cx, cy + hScale / 2, radScale, radScale * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Paredes laterais
      ctx.beginPath();
      ctx.moveTo(cx - radScale, cy + hScale / 2);
      ctx.lineTo(cx - radScale, cy - hScale / 2);
      ctx.moveTo(cx + radScale, cy + hScale / 2);
      ctx.lineTo(cx + radScale, cy - hScale / 2);
      ctx.stroke();

      // Base superior
      ctx.beginPath();
      ctx.ellipse(cx, cy - hScale / 2, radScale, radScale * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.fill();
      ctx.stroke();

      // Linhas de cota
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - hScale / 2); ctx.lineTo(cx + radScale, cy - hScale / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`r=${radius}cm`, cx + radScale / 2 - 10, cy - hScale / 2 - 6);
      ctx.fillText(`h=${height}cm`, cx + radScale + 6, cy);
    } else if (solid === 'cone') {
      // Base
      ctx.beginPath();
      ctx.ellipse(cx, cy + hScale / 2, radScale, radScale * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Geratrizes
      ctx.beginPath();
      ctx.moveTo(cx - radScale, cy + hScale / 2);
      ctx.lineTo(cx, cy - hScale / 2);
      ctx.lineTo(cx + radScale, cy + hScale / 2);
      ctx.stroke();

      // Vértice do Cone
      ctx.beginPath();
      ctx.fillStyle = '#10b981';
      ctx.arc(cx, cy - hScale / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (solid === 'sphere') {
      // Esfera com meridianos
      ctx.beginPath();
      ctx.arc(cx, cy, radScale, 0, Math.PI * 2);
      const sphereGrad = ctx.createRadialGradient(cx - radScale * 0.3, cy - radScale * 0.3, 10, cx, cy, radScale);
      sphereGrad.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
      sphereGrad.addColorStop(0.7, 'rgba(30, 64, 175, 0.3)');
      sphereGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
      ctx.fillStyle = sphereGrad;
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Equador e meridiano elípticos
      ctx.beginPath();
      ctx.ellipse(cx, cy, radScale, radScale * 0.35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (solid === 'cuboid') {
      // Paralelepípedo
      const dx = lScale * 0.8;
      const dy = radScale * 0.6;
      const dz = hScale;

      // Face frontal
      ctx.beginPath();
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.rect(cx - dx / 2, cy - dz / 2, dx, dz);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.fill();
      ctx.stroke();

      // Perspectiva superior e lateral
      ctx.beginPath();
      ctx.moveTo(cx - dx / 2, cy - dz / 2); ctx.lineTo(cx - dx / 2 + dy, cy - dz / 2 - dy * 0.5);
      ctx.lineTo(cx + dx / 2 + dy, cy - dz / 2 - dy * 0.5); ctx.lineTo(cx + dx / 2, cy - dz / 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + dx / 2, cy - dz / 2); ctx.lineTo(cx + dx / 2 + dy, cy - dz / 2 - dy * 0.5);
      ctx.lineTo(cx + dx / 2 + dy, cy + dz / 2 - dy * 0.5); ctx.lineTo(cx + dx / 2, cy + dz / 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
      ctx.fill();
      ctx.stroke();
    } else {
      // Pirâmide regular
      const bHalf = lScale * 0.7;
      const topY = cy - hScale / 2;
      const baseY = cy + hScale / 3;

      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      // Base
      ctx.moveTo(cx - bHalf, baseY);
      ctx.lineTo(cx, baseY + bHalf * 0.4);
      ctx.lineTo(cx + bHalf, baseY);
      ctx.stroke();

      // Arestas laterais
      ctx.beginPath();
      ctx.moveTo(cx, topY); ctx.lineTo(cx - bHalf, baseY);
      ctx.moveTo(cx, topY); ctx.lineTo(cx, baseY + bHalf * 0.4);
      ctx.moveTo(cx, topY); ctx.lineTo(cx + bHalf, baseY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fill();
    }
  };

  useEffect(() => {
    draw3D();
  }, [solid, radius, height, length]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
      {/* Visualização 3D Isométrica */}
      <div style={{ background: '#0e131b', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={canvasRef} width={400} height={320} style={{ width: '100%', maxWidth: '400px' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { id: 'cylinder', label: 'Cilindro' },
            { id: 'cone', label: 'Cone' },
            { id: 'sphere', label: 'Esfera' },
            { id: 'cuboid', label: 'Prisma Retangular' },
            { id: 'pyramid', label: 'Pirâmide Regular' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSolid(s.id as SolidType)}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.6rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: solid === s.id ? 700 : 500,
                background: solid === s.id ? '#06b6d4' : 'rgba(255,255,255,0.08)',
                color: solid === s.id ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controles e Cálculos Métricos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Dimensões do Sólido</h4>

          {solid !== 'cuboid' && solid !== 'pyramid' && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Raio (r):</span>
                <strong style={{ color: '#06b6d4' }}>{radius} cm</strong>
              </div>
              <input
                type="range" min="1" max="8" step="0.5" value={radius}
                onChange={e => setRadius(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#06b6d4' }}
              />
            </div>
          )}

          {solid !== 'sphere' && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Altura (h):</span>
                <strong style={{ color: '#f59e0b' }}>{height} cm</strong>
              </div>
              <input
                type="range" min="2" max="12" step="0.5" value={height}
                onChange={e => setHeight(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b' }}
              />
            </div>
          )}

          {(solid === 'cuboid' || solid === 'pyramid') && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>{solid === 'cuboid' ? 'Comprimento (a)' : 'Aresta da Base (L)'}:</span>
                <strong style={{ color: '#10b981' }}>{length} cm</strong>
              </div>
              <input
                type="range" min="2" max="10" step="0.5" value={length}
                onChange={e => setLength(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
              />
            </div>
          )}
        </div>

        {/* Resultados das Grandezas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(6,182,212,0.1)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.25)' }}>
            <span style={{ fontSize: '0.72rem', color: '#06b6d4', display: 'block', fontWeight: 700 }}>VOLUME (Capacidade)</span>
            <strong style={{ color: '#ffffff', fontSize: '1.15rem' }}>{metrics.volume.toFixed(2)} cm³</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>≈ {(metrics.volume / 1000).toFixed(3)} Litros</span>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'block', fontWeight: 700 }}>ÁREA TOTAL DA SUPERFÍCIE</span>
            <strong style={{ color: '#ffffff', fontSize: '1.15rem' }}>{metrics.totalArea.toFixed(2)} cm²</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Base: {metrics.baseArea.toFixed(1)} cm²</span>
          </div>
        </div>

        {/* Fórmulas formatadas */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div><strong>Fórmula do Volume:</strong> <code style={{ color: '#06b6d4' }}>{metrics.formulaVol}</code></div>
          <div><strong>Fórmula da Superfície:</strong> <code style={{ color: '#10b981' }}>{metrics.formulaArea}</code></div>
        </div>

        {/* Diagnóstico IA */}
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span>🤖 IA ADAPTATIVA (GEOMETRIA ESPACIAL)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
            {solid === 'sphere'
              ? 'A esfera é a forma geométrica tridimensional com a menor razão entre área superficial e volume. Por isso, gotas líquidas e planetas assumem formato esférico!'
              : solid === 'cylinder'
                ? `O volume do cilindro (${metrics.volume.toFixed(1)} cm³) é exatamente 3 vezes maior que o volume de um cone com as mesmas dimensões de base e altura!`
                : 'Observe como o volume depende quadraticamente das dimensões da base e linearmente da altura.'}
          </p>
        </div>

        <button
          onClick={onFinish}
          className="premium-btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #10b981)', fontWeight: 'bold', padding: '0.75rem' }}
        >
          🏆 Concluir Laboratório de Geometria Espacial (+50 XP)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 5. LABORATÓRIO: ESTATÍSTICA DESCRITIVA (AMOSTRAGEM, HISTOGRAMA & BOXPLOT)
// ============================================================================
function StatisticsLab({ onFinish }: { onFinish: () => void }) {
  const [data, setData] = useState<number[]>([4, 6, 7, 7, 8, 8, 9, 9, 10, 14]);
  const [inputVal, setInputVal] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Presets rápidos
  const presets = [
    { label: 'Notas Escolares', values: [3, 5, 6, 7, 7, 8, 8.5, 9, 9.5, 10] },
    { label: 'Alturas (cm)', values: [155, 160, 162, 165, 168, 170, 172, 175, 178, 185] },
    { label: 'Com Outlier Notável', values: [2, 3, 4, 4, 5, 5, 6, 6, 7, 25] },
  ];

  // Cálculos Estatísticos
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { n: 0, sum: 0, mean: 0, median: 0, mode: 'N/A', variance: 0, stdDev: 0, min: 0, max: 0, q1: 0, q3: 0, iqr: 0 };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    // Mediana
    const mid = Math.floor(n / 2);
    const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Quartis
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    // Variância e Desvio Padrão Amostral
    const variance = n > 1 ? sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1) : 0;
    const stdDev = Math.sqrt(variance);

    // Moda
    const freq: Record<number, number> = {};
    sorted.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    let maxFreq = 0;
    let modeVal: number[] = [];
    Object.entries(freq).forEach(([k, count]) => {
      if (count > maxFreq) {
        maxFreq = count;
        modeVal = [parseFloat(k)];
      } else if (count === maxFreq && maxFreq > 1) {
        modeVal.push(parseFloat(k));
      }
    });
    const mode = maxFreq > 1 ? modeVal.join(', ') : 'Amodal (todos com freq 1)';

    return {
      n, sum, mean, median, mode, variance, stdDev,
      min: sorted[0], max: sorted[n - 1], q1, q3, iqr
    };
  }, [data]);

  // Desenho Gráfico: Histograma de Frequências e Boxplot
  const drawStats = () => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const minVal = stats.min;
    const maxVal = stats.max;
    const range = Math.max(maxVal - minVal, 1);

    // 1. ÁREA SUPERIOR: HISTOGRAMA DE BARRAS
    const histHeight = height * 0.55;
    const binCount = Math.min(Math.max(Math.ceil(Math.sqrt(data.length)), 4), 8);
    const binSize = range / binCount;
    const bins: number[] = new Array(binCount).fill(0);

    data.forEach(v => {
      let bIdx = Math.floor((v - minVal) / binSize);
      if (bIdx >= binCount) bIdx = binCount - 1;
      bins[bIdx]++;
    });

    const maxBinCount = Math.max(...bins, 1);
    const barWidth = (width - 60) / binCount;

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('HISTOGRAMA DE FREQUÊNCIAS', 25, 20);

    bins.forEach((count, i) => {
      const bx = 30 + i * barWidth;
      const bHeight = (count / maxBinCount) * (histHeight - 40);
      const by = histHeight - bHeight;

      // Barra com gradiente
      const grad = ctx.createLinearGradient(0, by, 0, histHeight);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.fillRect(bx + 3, by, barWidth - 6, bHeight);

      // Rótulo da contagem
      if (count > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(count.toString(), bx + barWidth / 2 - 3, by - 4);
      }
    });

    // 2. LINHA DA MÉDIA NO HISTOGRAMA
    const meanX = 30 + ((stats.mean - minVal) / range) * (width - 60);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(meanX, 25); ctx.lineTo(meanX, histHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Média: ${stats.mean.toFixed(1)}`, meanX - 25, 24);

    // Divisória sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, histHeight + 15); ctx.lineTo(width - 15, histHeight + 15);
    ctx.stroke();

    // 3. ÁREA INFERIOR: BOXPLOT (DIAGRAMA DE CAIXA)
    const boxY = height * 0.78;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('DIAGRAMA DE CAIXA (BOXPLOT)', 25, histHeight + 32);

    const getX = (val: number) => 30 + ((val - minVal) / range) * (width - 60);

    const xMin = getX(stats.min);
    const xQ1 = getX(stats.q1);
    const xMed = getX(stats.median);
    const xQ3 = getX(stats.q3);
    const xMax = getX(stats.max);

    // Bigodes (whiskers)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xMin, boxY); ctx.lineTo(xQ1, boxY);
    ctx.moveTo(xQ3, boxY); ctx.lineTo(xMax, boxY);
    // Travessas nas pontas
    ctx.moveTo(xMin, boxY - 10); ctx.lineTo(xMin, boxY + 10);
    ctx.moveTo(xMax, boxY - 10); ctx.lineTo(xMax, boxY + 10);
    ctx.stroke();

    // Caixa interquartil (Q1 a Q3)
    ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
    ctx.fillRect(xQ1, boxY - 18, Math.max(xQ3 - xQ1, 2), 36);
    ctx.strokeStyle = '#a855f7';
    ctx.strokeRect(xQ1, boxY - 18, Math.max(xQ3 - xQ1, 2), 36);

    // Linha da Mediana
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xMed, boxY - 18); ctx.lineTo(xMed, boxY + 18);
    ctx.stroke();

    // Rótulos do Boxplot
    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`Q1: ${stats.q1}`, xQ1 - 10, boxY + 30);
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`Med: ${stats.median}`, xMed - 12, boxY - 22);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`Q3: ${stats.q3}`, xQ3 - 10, boxY + 30);
  };

  useEffect(() => {
    drawStats();
  }, [data, stats]);

  const handleAddNumber = () => {
    const num = parseFloat(inputVal);
    if (!isNaN(num)) {
      setData(prev => [...prev, num]);
      setInputVal('');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
      {/* Visualização de Gráficos */}
      <div style={{ background: '#0e131b', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={canvasRef} width={420} height={340} style={{ width: '100%', maxWidth: '420px' }} />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
          <span style={{ color: '#06b6d4' }}>■ Histograma de Classes</span>
          <span style={{ color: '#a855f7' }}>■ Intervalo Interquartil (IQR)</span>
          <span style={{ color: '#ec4899' }}>■ Mediana</span>
        </div>
      </div>

      {/* Amostra e Controles Estatísticos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Presets e Entrada Manual */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
            Conjuntos de Amostra Prontos:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setData(p.values)}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              placeholder="Adicionar valor..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNumber()}
              style={{
                flex: 1,
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.3)',
                color: '#ffffff',
                fontSize: '0.85rem',
              }}
            />
            <button
              onClick={handleAddNumber}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                background: '#06b6d4',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Adicionar
            </button>
            <button
              onClick={() => setData([])}
              style={{
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Limpar
            </button>
          </div>

          {/* Amostra Atual */}
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong>Dados (N={stats.n}):</strong> [{data.join(', ')}]
          </div>
        </div>

        {/* Quadro de Métricas Descritivas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Média (x̄)</span>
            <strong style={{ color: '#06b6d4', display: 'block', fontSize: '1rem' }}>{stats.mean.toFixed(2)}</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Mediana (Me)</span>
            <strong style={{ color: '#ec4899', display: 'block', fontSize: '1rem' }}>{stats.median.toFixed(2)}</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Desvio Padrão (s)</span>
            <strong style={{ color: '#10b981', display: 'block', fontSize: '1rem' }}>{stats.stdDev.toFixed(2)}</strong>
          </div>
        </div>

        {/* Informações de Dispersão */}
        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div><strong>Moda:</strong> {stats.mode}</div>
          <div><strong>Variância Amostral (s²):</strong> {stats.variance.toFixed(2)}</div>
          <div><strong>Intervalo Interquartil (IQR = Q3 - Q1):</strong> {stats.iqr.toFixed(2)}</div>
        </div>

        {/* Diagnóstico IA */}
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span>🤖 IA ADAPTATIVA (DIAGNÓSTICO ESTATÍSTICO)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
            {Math.abs(stats.mean - stats.median) < 0.5
              ? 'A distribuição apresenta simetria aproximada (média e mediana muito próximas). O desvio padrão expressa a dispersão típica dos dados ao redor do centro.'
              : stats.mean > stats.median
                ? 'Distribuição assimétrica positiva (à direita). A média é puxada para cima por valores extremos maiores (outliers).'
                : 'Distribuição assimétrica negativa (à esquerda). A média é reduzida por valores atipicamente baixos.'}
          </p>
        </div>

        <button
          onClick={onFinish}
          className="premium-btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #10b981)', fontWeight: 'bold', padding: '0.75rem' }}
        >
          🏆 Concluir Laboratório de Estatística (+50 XP)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 6. LABORATÓRIO: MATRIZES & SISTEMAS LINEARES (DETERMINANTES & CRAMER)
// ============================================================================
function MatricesLab({ onFinish }: { onFinish: () => void }) {
  const [tab, setTab] = useState<'matrix' | 'system'>('system');

  // Matriz 2x2: [[a, b], [c, d]]
  const [m, setM] = useState<number[][]>([[3, 2], [1, 4]]);

  // Sistema 2x2:
  // a1*x + b1*y = c1
  // a2*x + b2*y = c2
  const [sys, setSys] = useState({ a1: 2, b1: 1, c1: 8, a2: 1, b2: -1, c2: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cálculos Matriciais
  const detM = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  const traceM = m[0][0] + m[1][1];

  // Matriz Inversa (quando det !== 0)
  const invM = detM !== 0 ? [
    [m[1][1] / detM, -m[0][1] / detM],
    [-m[1][0] / detM, m[0][0] / detM]
  ] : null;

  // Resolução do Sistema Linear (Regra de Cramer)
  const D = sys.a1 * sys.b2 - sys.b1 * sys.a2;
  const Dx = sys.c1 * sys.b2 - sys.b1 * sys.c2;
  const Dy = sys.a1 * sys.c2 - sys.c1 * sys.a2;

  let solutionType: 'SPD' | 'SPI' | 'SI' = 'SPD';
  let solX = 0;
  let solY = 0;

  if (D !== 0) {
    solutionType = 'SPD'; // Sistema Possível e Determinado
    solX = Dx / D;
    solY = Dy / D;
  } else {
    if (Dx === 0 && Dy === 0) {
      solutionType = 'SPI'; // Infinitas soluções
    } else {
      solutionType = 'SI'; // Sem solução
    }
  }

  // Gráfico do Sistema Linear 2D
  const drawSystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 25; // px por unidade

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += scale) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += scale) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Eixos
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Reta 1: a1*x + b1*y = c1 => y = (c1 - a1*x) / b1
    if (sys.b1 !== 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      for (let px = 0; px <= width; px += 2) {
        const x = (px - width / 2) / scale;
        const y = (sys.c1 - sys.a1 * x) / sys.b1;
        const py = height / 2 - y * scale;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Reta 2: a2*x + b2*y = c2 => y = (c2 - a2*x) / b2
    if (sys.b2 !== 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      for (let px = 0; px <= width; px += 2) {
        const x = (px - width / 2) / scale;
        const y = (sys.c2 - sys.a2 * x) / sys.b2;
        const py = height / 2 - y * scale;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Ponto de Interseção (se SPD)
    if (solutionType === 'SPD') {
      const psx = width / 2 + solX * scale;
      const psy = height / 2 - solY * scale;

      // Halo pulsante
      ctx.beginPath();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
      ctx.arc(psx, psy, 9, 0, Math.PI * 2);
      ctx.fill();

      // Ponto
      ctx.beginPath();
      ctx.fillStyle = '#facc15';
      ctx.arc(psx, psy, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`P(${solX.toFixed(1)}, ${solY.toFixed(1)})`, psx + 8, psy - 8);
    }
  };

  useEffect(() => {
    drawSystem();
  }, [sys, solutionType, solX, solY]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
      {/* Visualização: Gráfico no Sistema Linear ou Matriz Inversa */}
      <div style={{ background: '#0e131b', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', width: '100%' }}>
          <button
            onClick={() => setTab('system')}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: tab === 'system' ? '#06b6d4' : 'rgba(255,255,255,0.08)',
              color: tab === 'system' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Sistema Linear 2D
          </button>
          <button
            onClick={() => setTab('matrix')}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: tab === 'matrix' ? '#a855f7' : 'rgba(255,255,255,0.08)',
              color: tab === 'matrix' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            Álgebra Matricial
          </button>
        </div>

        {tab === 'system' ? (
          <>
            <canvas ref={canvasRef} width={400} height={300} style={{ width: '100%', maxWidth: '400px' }} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
              <span style={{ color: '#06b6d4' }}>● Reta 1: {sys.a1}x + {sys.b1}y = {sys.c1}</span>
              <span style={{ color: '#a855f7' }}>● Reta 2: {sys.a2}x + {sys.b2}y = {sys.c2}</span>
              <span style={{ color: '#facc15' }}>● Interseção P(x, y)</span>
            </div>
          </>
        ) : (
          <div style={{ padding: '1.5rem', width: '100%', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--text-main)', margin: '0 0 1rem 0' }}>Matriz Inversa A⁻¹</h4>
            {invM ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '1.5rem', color: '#a855f7' }}>[</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 60px)', gap: '0.5rem' }}>
                  <div style={{ color: '#06b6d4', fontWeight: 700 }}>{invM[0][0].toFixed(2)}</div>
                  <div style={{ color: '#06b6d4', fontWeight: 700 }}>{invM[0][1].toFixed(2)}</div>
                  <div style={{ color: '#06b6d4', fontWeight: 700 }}>{invM[1][0].toFixed(2)}</div>
                  <div style={{ color: '#06b6d4', fontWeight: 700 }}>{invM[1][1].toFixed(2)}</div>
                </div>
                <span style={{ fontSize: '1.5rem', color: '#a855f7' }}>]</span>
              </div>
            ) : (
              <div style={{ color: '#ef4444', padding: '1rem' }}>
                Matriz Singular (det = 0): Não possui inversa!
              </div>
            )}
            <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div><strong>Traço Tr(A):</strong> {traceM}</div>
              <div><strong>Determinante det(A):</strong> {detM}</div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de Entrada */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tab === 'system' ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Equações do Sistema Linear</h4>

            {/* Reta 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#06b6d4' }}>
              <input
                type="number" value={sys.a1} onChange={e => setSys({ ...sys, a1: parseFloat(e.target.value) || 0 })}
                style={{ width: '45px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: '#111', color: '#fff', textAlign: 'center' }}
              />
              <span>x +</span>
              <input
                type="number" value={sys.b1} onChange={e => setSys({ ...sys, b1: parseFloat(e.target.value) || 0 })}
                style={{ width: '45px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: '#111', color: '#fff', textAlign: 'center' }}
              />
              <span>y =</span>
              <input
                type="number" value={sys.c1} onChange={e => setSys({ ...sys, c1: parseFloat(e.target.value) || 0 })}
                style={{ width: '50px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: '#111', color: '#fff', textAlign: 'center' }}
              />
            </div>

            {/* Reta 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#a855f7' }}>
              <input
                type="number" value={sys.a2} onChange={e => setSys({ ...sys, a2: parseFloat(e.target.value) || 0 })}
                style={{ width: '45px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: '#111', color: '#fff', textAlign: 'center' }}
              />
              <span>x +</span>
              <input
                type="number" value={sys.b2} onChange={e => setSys({ ...sys, b2: parseFloat(e.target.value) || 0 })}
                style={{ width: '45px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: '#111', color: '#fff', textAlign: 'center' }}
              />
              <span>y =</span>
              <input
                type="number" value={sys.c2} onChange={e => setSys({ ...sys, c2: parseFloat(e.target.value) || 0 })}
                style={{ width: '50px', padding: '0.3rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', background: '#111', color: '#fff', textAlign: 'center' }}
              />
            </div>

            {/* Classificação de Cramer */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Classificação do Sistema:</span>
                <strong style={{ color: solutionType === 'SPD' ? '#10b981' : solutionType === 'SPI' ? '#f59e0b' : '#ef4444' }}>
                  {solutionType === 'SPD' ? 'SPD (Solução Única)' : solutionType === 'SPI' ? 'SPI (Infinitas Soluções)' : 'SI (Sistema Impossível)'}
                </strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Determinante Principal D = {D} (Dx = {Dx}, Dy = {Dy})
              </div>
              {solutionType === 'SPD' && (
                <div style={{ marginTop: '0.5rem', color: '#facc15', fontWeight: 700, fontSize: '0.9rem' }}>
                  Solução: S = &#123;({solX.toFixed(2)}, {solY.toFixed(2)})&#125;
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Editor da Matriz A (2x2)</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 60px)', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <input
                type="number" value={m[0][0]} onChange={e => setM([[parseFloat(e.target.value) || 0, m[0][1]], [m[1][0], m[1][1]]])}
                style={{ padding: '0.4rem', textAlign: 'center', background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }}
              />
              <input
                type="number" value={m[0][1]} onChange={e => setM([[m[0][0], parseFloat(e.target.value) || 0], [m[1][0], m[1][1]]])}
                style={{ padding: '0.4rem', textAlign: 'center', background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }}
              />
              <input
                type="number" value={m[1][0]} onChange={e => setM([[m[0][0], m[0][1]], [parseFloat(e.target.value) || 0, m[1][1]]])}
                style={{ padding: '0.4rem', textAlign: 'center', background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }}
              />
              <input
                type="number" value={m[1][1]} onChange={e => setM([[m[0][0], m[0][1]], [m[1][0], parseFloat(e.target.value) || 0]])}
                style={{ padding: '0.4rem', textAlign: 'center', background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }}
              />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Cálculo do Determinante:</strong>
              <div style={{ color: '#a855f7', marginTop: '0.2rem' }}>
                det(A) = ({m[0][0]} · {m[1][1]}) - ({m[0][1]} · {m[1][0]}) = {detM}
              </div>
            </div>
          </div>
        )}

        {/* Diagnóstico IA */}
        <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a855f7', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span>🤖 IA ADAPTATIVA (ÁLGEBRA LINEAR)</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
            {solutionType === 'SPD'
              ? `As duas retas são concorrentes e se cruzam exatamente no ponto único (${solX.toFixed(1)}, ${solY.toFixed(1)}). O determinante não nulo garante inversibilidade da matriz do sistema.`
              : solutionType === 'SPI'
                ? 'As duas retas são coincidentes (mesma reta sob coeficientes proporcionais), gerando infinitos pontos em comum.'
                : 'As retas são estritamente paralelas e distintas, sem nenhum ponto de interseção. O sistema não tem solução!'}
          </p>
        </div>

        <button
          onClick={onFinish}
          className="premium-btn btn-primary"
          style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #a855f7)', fontWeight: 'bold', padding: '0.75rem' }}
        >
          🏆 Concluir Laboratório de Matrizes (+50 XP)
        </button>
      </div>
    </div>
  );
}
