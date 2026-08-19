import { useState, useEffect, useRef } from 'react';

interface GeographySimulatorProps {
  labTitle?: string;
  labId?: string;
  onComplete?: (score: number) => void;
}

type PlateBoundary = 'divergent' | 'convergent' | 'transform';

export function GeographySimulator({ labTitle, onComplete }: GeographySimulatorProps) {
  const [boundaryType, setBoundaryType] = useState<PlateBoundary>('convergent');
  const [pressure, setPressure] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [isQuake, setIsQuake] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      timeRef.current += 0.05;
      ctx.clearRect(0, 0, width, height);

      // 1. Fundo do Manto (Magma / Astenosfera)
      const magmaGrad = ctx.createLinearGradient(0, height / 2, 0, height);
      magmaGrad.addColorStop(0, '#e64a19'); // Laranja forte
      magmaGrad.addColorStop(0.5, '#d84315');
      magmaGrad.addColorStop(1, '#212121'); // Base escura
      ctx.fillStyle = magmaGrad;
      ctx.fillRect(0, height / 2, width, height / 2);

      // Desenhar fluxos convectivos de magma (linhas de fogo lentas)
      ctx.strokeStyle = 'rgba(255, 110, 64, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < width; x += 15) {
        const offset = Math.sin(timeRef.current + x * 0.05) * 8;
        if (x === 0) ctx.moveTo(x, height / 2 + 30 + offset);
        else ctx.lineTo(x, height / 2 + 30 + offset);
      }
      ctx.stroke();

      // 2. Desenhar as Placas Litosféricas
      const mid = width / 2;
      const plateY = height / 2 - 20;
      const thickness = 40;

      // Deslocamento de animação baseado no tipo de limite
      let offsetL = 0;
      let offsetR = 0;
      let subductionDepth = 0;
      let ridgeGap = 0;

      if (boundaryType === 'divergent') {
        // As placas se afastam
        ridgeGap = (pressure / 100) * 35;
        offsetL = -ridgeGap;
        offsetR = ridgeGap;
      } else if (boundaryType === 'convergent') {
        // Colisão (Subducção)
        const overlap = (pressure / 100) * 30;
        offsetL = overlap / 2;
        offsetR = -overlap / 2;
        subductionDepth = overlap * 1.5;
      } else if (boundaryType === 'transform') {
        // Deslizamento lateral (cria terremoto oscilatório)
        offsetL = Math.sin(timeRef.current * 1.5) * (pressure / 100) * 5;
        offsetR = -Math.sin(timeRef.current * 1.5) * (pressure / 100) * 5;
      }

      // Efeito terremoto (tremer tela se for transformante e pressão alta)
      let shakeX = 0;
      let shakeY = 0;
      if (boundaryType === 'transform' && pressure > 40) {
        shakeX = (Math.random() - 0.5) * (pressure / 12);
        shakeY = (Math.random() - 0.5) * (pressure / 12);
        if (Math.random() > 0.95 && !isQuake) {
          setIsQuake(true);
          setTimeout(() => setIsQuake(false), 800);
        }
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Desenhar Placa Esquerda (Litosfera Continental)
      ctx.fillStyle = '#4e342e'; // Marrom terra
      ctx.beginPath();
      ctx.moveTo(0, plateY);
      ctx.lineTo(mid + offsetL, plateY);
      ctx.lineTo(mid + offsetL - 15, plateY + thickness);
      ctx.lineTo(0, plateY + thickness);
      ctx.closePath();
      ctx.fill();

      // Crosta superior da placa esquerda (Verde vegetação)
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.moveTo(0, plateY - 4);
      ctx.lineTo(mid + offsetL, plateY - 4);
      ctx.lineTo(mid + offsetL - 2, plateY);
      ctx.lineTo(0, plateY);
      ctx.closePath();
      ctx.fill();

      if (boundaryType === 'divergent') {
        // Fenda central brilhando com magma subindo
        const magmaRiftGrad = ctx.createLinearGradient(mid + offsetL, plateY, mid + offsetR, plateY);
        magmaRiftGrad.addColorStop(0, '#ff3d00');
        magmaRiftGrad.addColorStop(0.5, '#ffff00');
        magmaRiftGrad.addColorStop(1, '#ff3d00');
        ctx.fillStyle = magmaRiftGrad;
        ctx.fillRect(mid + offsetL - 1, plateY, (offsetR - offsetL) + 2, thickness);

        // Bolhas subindo na fenda
        ctx.fillStyle = '#ffb300';
        for (let i = 0; i < 3; i++) {
          const bx = mid + offsetL + Math.random() * (offsetR - offsetL);
          const by = plateY + 10 + ((timeRef.current * 20 + i * 15) % thickness);
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (boundaryType === 'convergent') {
        // Placa Direita (Subduzindo sob a Esquerda)
        ctx.fillStyle = '#37474f'; // Cinza escuro da placa oceânica
        ctx.beginPath();
        // A placa entra em ângulo diagonal para baixo
        ctx.moveTo(mid + offsetR, plateY + subductionDepth * 0.3);
        ctx.lineTo(width, plateY);
        ctx.lineTo(width, plateY + thickness);
        ctx.lineTo(mid + offsetR - 20 - subductionDepth * 0.5, plateY + thickness + subductionDepth);
        ctx.closePath();
        ctx.fill();

        // Crosta oceânica superior (Azulada)
        ctx.fillStyle = '#00695c';
        ctx.beginPath();
        ctx.moveTo(mid + offsetR, plateY + subductionDepth * 0.3 - 4);
        ctx.lineTo(width, plateY - 4);
        ctx.lineTo(width, plateY);
        ctx.lineTo(mid + offsetR - 2, plateY + subductionDepth * 0.3);
        ctx.closePath();
        ctx.fill();

        // Vulcão na Placa Esquerda devido à fusão parcial
        if (pressure > 30) {
          const volcX = mid - 80;
          const volcY = plateY - 4;
          ctx.fillStyle = '#3e2723';
          ctx.beginPath();
          ctx.moveTo(volcX - 30, volcY);
          ctx.lineTo(volcX - 8, volcY - 25);
          ctx.lineTo(volcX + 8, volcY - 25);
          ctx.lineTo(volcX + 30, volcY);
          ctx.closePath();
          ctx.fill();

          // Cratera
          ctx.fillStyle = '#ff3d00';
          ctx.beginPath();
          ctx.ellipse(volcX, volcY - 25, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Lava escorrendo / Fumaça
          if (pressure > 60) {
            ctx.fillStyle = '#ff9100';
            ctx.fillRect(volcX - 4, volcY - 25, 8, 12);

            // Partículas de fumaça cinza subindo
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            for (let i = 0; i < 4; i++) {
              const sy = volcY - 30 - ((timeRef.current * 15 + i * 10) % 40);
              const sx = volcX + Math.sin(timeRef.current + i) * 6;
              ctx.beginPath();
              ctx.arc(sx, sy, 5 + i, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (boundaryType === 'transform') {
        // Desenhar Placa Direita normal deslizando
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.moveTo(mid + offsetR, plateY);
        ctx.lineTo(width, plateY);
        ctx.lineTo(width, plateY + thickness);
        ctx.lineTo(mid + offsetR - 15, plateY + thickness);
        ctx.closePath();
        ctx.fill();

        // Crosta verde
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.moveTo(mid + offsetR, plateY - 4);
        ctx.lineTo(width, plateY - 4);
        ctx.lineTo(width, plateY);
        ctx.lineTo(mid + offsetR - 2, plateY);
        ctx.closePath();
        ctx.fill();

        // Linha de falha com atrito (faíscas se a pressão for alta)
        if (pressure > 50) {
          ctx.strokeStyle = '#ffb300';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(mid + (offsetL + offsetR) / 2, plateY);
          ctx.lineTo(mid + (offsetL + offsetR) / 2 - 5, plateY + thickness);
          ctx.stroke();
        }
      }

      ctx.restore();

      // Rótulos informativos sobre o Canvas
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 12px Inter, sans-serif';
      if (boundaryType === 'divergent') {
        ctx.fillText('Expansão do Assoalho / Dorsal Mesoatlantica', 15, 30);
      } else if (boundaryType === 'convergent') {
        ctx.fillText('Zona de Subducção / Fossa e Cadeias Montanhosas', 15, 30);
      } else if (boundaryType === 'transform') {
        ctx.fillText('Falha Transcorrente / Atrito de Placas (ex: San Andreas)', 15, 30);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [boundaryType, pressure]);

  const handleFinish = () => {
    if (onComplete) onComplete(100);
  };

  return (
    <div className="geography-simulator p-4 premium-glass-card" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)' }}>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>
        🌋 {labTitle || 'Laboratório Virtual: Dinâmica de Placas Tectônicas'}
      </h3>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap-reverse' }}>
        {/* Canvas de Simulação */}
        <div style={{ flex: '1 1 350px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#121214', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: '420px' }}>
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={280} 
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
            />
            {isQuake && (
              <div style={{ color: '#ff1744', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center', marginTop: '8px', animation: 'pulse 0.3s infinite' }}>
                ⚠️ AVISO: Terremoto Ativo! Tremor detectado na falha tectônica.
              </div>
            )}
          </div>
        </div>

        {/* Painel de Controles */}
        <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
          <div className="controls-panel premium-glass-panel p-4" style={{ borderRadius: 'var(--border-radius)', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem' }}>Configuração de Limite</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setBoundaryType('convergent')}
                className={`premium-btn ${boundaryType === 'convergent' ? 'btn-primary' : 'btn-outline-cyan'}`}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
              >
                Limites Convergentes (Colisão)
              </button>
              <button 
                onClick={() => setBoundaryType('divergent')}
                className={`premium-btn ${boundaryType === 'divergent' ? 'btn-primary' : 'btn-outline-cyan'}`}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
              >
                Limites Divergentes (Afastamento)
              </button>
              <button 
                onClick={() => setBoundaryType('transform')}
                className={`premium-btn ${boundaryType === 'transform' ? 'btn-primary' : 'btn-outline-cyan'}`}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
              >
                Limites Transformantes (Deslizamento)
              </button>
            </div>

            <div className="slider-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Pressão Tectônica: <strong>{pressure}%</strong>
              </label>
              <input 
                type="range" 
                min="0" max="100" 
                value={pressure} 
                onChange={(e) => setPressure(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
              />
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1.25rem', lineHeight: 1.5 }}>
              {boundaryType === 'convergent' && 'A colisão de placas eleva a crosta continental criando cadeias como o Himalaia e gerando arcos vulcânicos pelo derretimento da placa subduzida.'}
              {boundaryType === 'divergent' && 'O afastamento das placas permite que o magma quente do manto suba, solidifique-se e forme novas bacias oceânicas e dorsais marinhas.'}
              {boundaryType === 'transform' && 'O deslizamento horizontal gera forte acúmulo de energia potencial elástica. Quando liberada, provoca tremores severos na crosta.'}
            </p>

            <button 
              className="premium-btn btn-primary mt-4" 
              style={{ width: '100%' }}
              onClick={handleFinish}
            >
              Registrar Conclusão Tectônica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
