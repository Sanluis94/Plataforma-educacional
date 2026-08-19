import { useState, useRef, useEffect } from 'react';

interface MathSimulatorProps {
  functionType?: 'linear' | 'quadratic' | 'trigonometric' | 'generic';
  title?: string;
  onComplete?: (score: number) => void;
}

export function MathSimulator({ functionType = 'linear', title, onComplete }: MathSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const mousePos = useRef<{ px: number; py: number; mx: number; my: number } | null>(null);
  const currentProgressX = useRef<number>(0);
  
  // Parâmetros da função f(x) = ax² + bx + c (ou a*sin(bx) + c, etc)
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const drawGraph = (forceAnimate = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = 40; // Pixels por unidade

    const renderFrame = () => {
      // Limpar canvas
      ctx.clearRect(0, 0, width, height);
      
      // Desenhar grid
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= width; i += 40) {
        ctx.moveTo(i, 0); ctx.lineTo(i, height);
        ctx.moveTo(0, i); ctx.lineTo(width, i);
      }
      ctx.stroke();

      // Eixos X e Y centrados
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); // Y
      ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); // X
      ctx.stroke();

      // Desenhar ticks e números nos eixos
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      // Eixo X ticks
      for (let i = 40; i < width; i += 40) {
        const val = (i - width / 2) / scale;
        if (val === 0) continue;
        ctx.moveTo(i, height / 2 - 3);
        ctx.lineTo(i, height / 2 + 3);
        ctx.fillText(val.toString(), i - 4, height / 2 + 14);
      }

      // Eixo Y ticks
      for (let i = 40; i < height; i += 40) {
        const val = (height / 2 - i) / scale;
        if (val === 0) continue;
        ctx.moveTo(width / 2 - 3, i);
        ctx.lineTo(width / 2 + 3, i);
        ctx.fillText(val.toString(), width / 2 + 8, i + 3.5);
      }
      ctx.stroke();

      // Desenhar guias de tracking do mouse
      if (mousePos.current) {
        const { px, py, mx, my } = mousePos.current;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.moveTo(px, 0); ctx.lineTo(px, height);
        ctx.moveTo(0, py); ctx.lineTo(width, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ponto luminoso na interseção
        ctx.beginPath();
        ctx.fillStyle = '#06b6d4';
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Rótulo da coordenada
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.fillText(`(${mx.toFixed(1)}, ${my.toFixed(1)})`, px + 8, py - 8);
      }

      // Desenhar a função
      ctx.beginPath();
      ctx.strokeStyle = 'var(--color-primary)';
      ctx.lineWidth = 3;

      let firstPoint = true;
      const limitX = forceAnimate ? currentProgressX.current : width;

      for (let pixelX = 0; pixelX <= limitX; pixelX++) {
        const x = (pixelX - width / 2) / scale;
        let y = 0;
        if (functionType === 'linear' || functionType === 'generic') {
          y = a * x + b;
        } else if (functionType === 'quadratic') {
          y = a * x * x + b * x + c;
        } else if (functionType === 'trigonometric') {
          y = a * Math.sin(b * x) + c;
        }
        const pixelY = height / 2 - y * scale;

        if (firstPoint) {
          ctx.moveTo(pixelX, pixelY);
          firstPoint = false;
        } else {
          ctx.lineTo(pixelX, pixelY);
        }
      }
      ctx.stroke();
    };

    if (forceAnimate) {
      const runAnim = () => {
        currentProgressX.current = Math.min(width, currentProgressX.current + 16);
        renderFrame();
        if (currentProgressX.current < width) {
          animationRef.current = requestAnimationFrame(runAnim);
        }
      };
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(runAnim);
    } else {
      renderFrame();
    }
  };

  useEffect(() => {
    currentProgressX.current = 0;
    drawGraph(true);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [a, b, c, functionType]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    
    const scale = 40;
    const mx = (px - canvas.width / 2) / scale;
    const my = (canvas.height / 2 - py) / scale;

    mousePos.current = { px, py, mx, my };
    drawGraph(false);
  };

  const handleMouseLeave = () => {
    mousePos.current = null;
    drawGraph(false);
  };

  const handleFinish = () => {
    if (onComplete) onComplete(100); // Exemplo: Simulação finalizada com sucesso
  };

  return (
    <div className="math-simulator mt-4 p-4" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)' }}>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
        Laboratório Virtual: {title || (
          functionType === 'linear' ? 'Plano Cartesiano - Função do 1º Grau' :
          functionType === 'quadratic' ? 'Plano Cartesiano - Função do 2º Grau' :
          functionType === 'trigonometric' ? 'Plano Cartesiano - Função Trigonométrica' : 'Matemática Aplicada'
        )}
      </h3>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap-reverse' }}>
        <div style={{ flex: '1 1 300px', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
           {/* Canvas Container com fundo escuro pra parecer um quadro negro ou papel milimetrado digital */}
           <div style={{ background: '#111418', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
             <canvas 
               ref={canvasRef} 
               width={400} 
               height={400} 
               style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1', cursor: 'crosshair' }}
               onMouseMove={handleMouseMove}
               onMouseLeave={handleMouseLeave}
             />
           </div>
        </div>

        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'center' }}>
          <div className="controls-panel premium-glass-panel p-4" style={{ borderRadius: 'var(--border-radius)', padding: '1rem' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Controles da Função</h4>
            
            <div className="slider-group mb-3">
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                Coeficiente A <strong>{a.toFixed(1)}</strong>
              </label>
              <input 
                type="range" 
                min="-5" max="5" step="0.5" 
                value={a} 
                onChange={(e) => setA(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
              />
            </div>

            <div className="slider-group mb-3">
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                Coeficiente B <strong>{b.toFixed(1)}</strong>
              </label>
              <input 
                type="range" 
                min="-5" max="5" step="0.5" 
                value={b} 
                onChange={(e) => setB(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
              />
            </div>

            {(functionType === 'quadratic' || functionType === 'trigonometric') && (
              <div className="slider-group mb-3">
                <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  Coeficiente C <strong>{c.toFixed(1)}</strong>
                </label>
                <input 
                  type="range" 
                  min="-5" max="5" step="0.5" 
                  value={c} 
                  onChange={(e) => setC(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
              </div>
            )}

            <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '0.6rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span>🤖 IA ADAPTATIVA (DIAGNÓSTICO EM TEMPO REAL)</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                {a > 0 
                  ? `Com a = ${a.toFixed(1)}, a curva cresce rapidamente no 1º quadrante. Observe a variação das raízes!` 
                  : a < 0 
                    ? `Com a = ${a.toFixed(1)} negativo, a concavidade inverte para baixo (ponto de máximo em y = ${c.toFixed(1)}).`
                    : 'Com a = 0, a função torna-se constante ou linear plana. Aumente o coeficiente para ver a curvatura.'}
              </p>
            </div>

            <button 
              className="premium-btn btn-primary mt-4" 
              style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 0 15px rgba(6,182,212,0.4)', fontWeight: 'bold' }}
              onClick={handleFinish}
            >
              🏆 Concluir Análise (+50 XP & +10 Moedas)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
