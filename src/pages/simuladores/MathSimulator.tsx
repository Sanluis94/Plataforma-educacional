import { useState, useRef, useEffect } from 'react';

interface MathSimulatorProps {
  functionType?: 'linear' | 'quadratic' | 'trigonometric';
  onComplete?: (score: number) => void;
}

export function MathSimulator({ functionType = 'linear', onComplete }: MathSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Parâmetros da função f(x) = ax² + bx + c (ou a*sin(bx) + c, etc)
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Limpar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Desenhar grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 40) {
      ctx.moveTo(i, 0); ctx.lineTo(i, height);
      ctx.moveTo(0, i); ctx.lineTo(width, i);
    }
    ctx.stroke();

    // Eixos X e Y centrados
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); // Y
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); // X
    ctx.stroke();

    // Desenhar a função
    ctx.beginPath();
    ctx.strokeStyle = 'var(--color-primary)';
    ctx.lineWidth = 3;

    const scale = 40; // Pixels por unidade
    let firstPoint = true;

    for (let pixelX = 0; pixelX <= width; pixelX++) {
      // Converte coordenada X do canvas para unidade matemática
      const x = (pixelX - width / 2) / scale;
      
      let y = 0;
      if (functionType === 'linear') {
        y = a * x + b;
      } else if (functionType === 'quadratic') {
        y = a * x * x + b * x + c;
      } else if (functionType === 'trigonometric') {
        y = a * Math.sin(b * x) + c;
      }

      // Converte Y matemático devolta para coordenada Pixel (invertida verticalmente)
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

  useEffect(() => {
    drawGraph();
  }, [a, b, c, functionType]);

  const handleFinish = () => {
    if (onComplete) onComplete(100); // Exemplo: Simulação finalizada com sucesso
  };

  return (
    <div className="math-simulator mt-4 p-4" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)' }}>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
        Laboratório Virtual: Plano Cartesiano
        {functionType === 'linear' && ' - Função do 1º Grau'}
        {functionType === 'quadratic' && ' - Função do 2º Grau'}
        {functionType === 'trigonometric' && ' - Função Trigonométrica'}
      </h3>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap-reverse' }}>
        <div style={{ flex: '1 1 300px', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
           {/* Canvas Container com fundo escuro pra parecer um quadro negro ou papel milimetrado digital */}
           <div style={{ background: '#111418', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
             <canvas 
               ref={canvasRef} 
               width={400} 
               height={400} 
               style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1' }}
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

            <button 
              className="premium-btn btn-primary mt-4" 
              style={{ width: '100%' }}
              onClick={handleFinish}
            >
              Finalizar Análise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
