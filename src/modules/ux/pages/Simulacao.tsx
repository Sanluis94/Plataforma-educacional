import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from '../components';
import { Play, Pause, RotateCcw } from 'lucide-react';
import './Simulacao.css';

export const Simulacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pendulum' | 'collisions'>('collisions');
  
  // States Pendulum
  const [isPlayingPendulum, setIsPlayingPendulum] = useState(false);
  const [angle, setAngle] = useState(45); 
  const [length, setLength] = useState(150); 
  const [gravity, setGravity] = useState(9.8);
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [elapsedTime, setElapsedTime] = useState(0);

  // States Collisions
  const [isPlayingCollisions, setIsPlayingCollisions] = useState(false);
  const [friction, setFriction] = useState(0); // 0 = Sem atrito (Elástica perfeita)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Elementos Colisão
  const [balls, setBalls] = useState([
    { id: 1, x: 50, y: 100, vx: 5, vy: 0, radius: 20, mass: 1, color: 'var(--color-primary)' },
    { id: 2, x: 250, y: 100, vx: -3, vy: 0, radius: 25, mass: 1.5, color: 'var(--color-secondary)' }
  ]);

  // Lógica do Pêndulo Simples
  useEffect(() => {
    let animationFrame: number;
    let startTime: number;

    const animatePendulum = (timestamp?: number) => {
      const now = timestamp || performance.now();
      if (!startTime) startTime = now;
      const t = (now - startTime) / 1000 + elapsedTime; 
      const omega = Math.sqrt(gravity / (length / 100)); 
      const theta = angle * Math.cos(omega * t);
      setCurrentAngle(theta);
      animationFrame = requestAnimationFrame(animatePendulum);
    };

    if (isPlayingPendulum && activeTab === 'pendulum') {
      animationFrame = requestAnimationFrame(() => animatePendulum(performance.now()));
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isPlayingPendulum, gravity, length, angle, activeTab, elapsedTime]);

  // Lógica de Colisões (1D por simplicidade no display horizontal, expansível)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'collisions') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localBalls = [...balls];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      localBalls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
      });
    };

    const updateCollisions = () => {
      // Movimentação
      localBalls.forEach(b => {
        b.x += b.vx;
        
        // Aplica atrito (desaceleração) se houver
        if (friction > 0) {
          if (b.vx > 0) b.vx = Math.max(0, b.vx - friction * 0.05);
          if (b.vx < 0) b.vx = Math.min(0, b.vx + friction * 0.05);
        }

        // Colisão com as paredes
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx *= -1;
        } else if (b.x + b.radius > canvas.width) {
          b.x = canvas.width - b.radius;
          b.vx *= -1;
        }
      });

      // Detecção Círculo vs Círculo (1D eixo X para colisão frontal)
      const b1 = localBalls[0];
      const b2 = localBalls[1];
      const dx = b2.x - b1.x;
      const distance = Math.abs(dx);

      if (distance < b1.radius + b2.radius) {
         // Resolve sobreposição
         const overlap = (b1.radius + b2.radius) - distance;
         const direction = dx > 0 ? 1 : -1;
         b1.x -= overlap / 2 * direction;
         b2.x += overlap / 2 * direction;

         // Equação de Colisão 1D Conservação de Momento (Elástica)
         const m1 = b1.mass; const m2 = b2.mass;
         const v1 = b1.vx; const v2 = b2.vx;
         
         const newV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
         const newV2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);

         b1.vx = newV1;
         b2.vx = newV2;
      }

      draw();

      if (isPlayingCollisions) {
        animationRef.current = requestAnimationFrame(updateCollisions);
      }
    };

    if (isPlayingCollisions) {
      animationRef.current = requestAnimationFrame(updateCollisions);
    } else {
      draw(); // Render stático inicial
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlayingCollisions, activeTab, friction]);

  const resetPendulum = () => {
    setIsPlayingPendulum(false);
    setCurrentAngle(angle);
    setElapsedTime(0);
  };

  const resetCollisions = () => {
    setIsPlayingCollisions(false);
    setBalls([
      { id: 1, x: 50, y: 100, vx: 5, vy: 0, radius: 20, mass: 1, color: 'var(--color-primary)' },
      { id: 2, x: 250, y: 100, vx: -3, vy: 0, radius: 25, mass: 1.5, color: 'var(--color-secondary)' }
    ]);
  };

  return (
    <div className="simulacao-container">
      <header className="simulacao-header">
        <div>
          <h1>Laboratório Virtual: Mecânica Clássica</h1>
          <p className="text-secondary">Explore módulos dinâmicos para dominar conceitos da Física.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant={activeTab === 'pendulum' ? 'primary' : 'outline'} onClick={() => setActiveTab('pendulum')}>
            Pêndulo
          </Button>
          <Button variant={activeTab === 'collisions' ? 'primary' : 'outline'} onClick={() => setActiveTab('collisions')}>
            Colisões (1D)
          </Button>
        </div>
      </header>

      {activeTab === 'pendulum' && (
        <div className="simulacao-grid fade-in">
          <Card className="control-panel">
            <CardHeader><h2>Variáveis de Controle</h2></CardHeader>
            <CardContent className="control-content">
              <div className="control-group">
                <label>Comprimento do Fio ({length} px)</label>
                <input type="range" min="50" max="250" value={length} onChange={(e) => { setLength(Number(e.target.value)); resetPendulum(); }} disabled={isPlayingPendulum} />
              </div>
              <div className="control-group">
                <label>Ângulo Inicial ({angle}°)</label>
                <input type="range" min="10" max="90" value={angle} onChange={(e) => { setAngle(Number(e.target.value)); resetPendulum(); }} disabled={isPlayingPendulum} />
              </div>
              <div className="control-group">
                <label>Gravidade ({gravity.toFixed(1)} m/s²)</label>
                <select value={gravity} onChange={(e) => { setGravity(Number(e.target.value)); resetPendulum(); }} disabled={isPlayingPendulum}>
                  <option value={9.8}>Terra (9.8 m/s²)</option>
                  <option value={1.6}>Lua (1.6 m/s²)</option>
                  <option value={24.7}>Júpiter (24.7 m/s²)</option>
                </select>
              </div>

              <div className="action-buttons">
                <Button variant={isPlayingPendulum ? "secondary" : "primary"} onClick={() => setIsPlayingPendulum(!isPlayingPendulum)} fullWidth>
                  {isPlayingPendulum ? <><Pause size={16}/> Pausar</> : <><Play size={16}/> Iniciar</>}
                </Button>
                <Button variant="outline" onClick={resetPendulum} fullWidth>
                  <RotateCcw size={16}/> Reiniciar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="simulacao-view">
            <CardContent className="canvas-container">
              <div className="pendulo-pivot"></div>
              <div className="pendulo-fio-container" style={{ transform: `rotate(${currentAngle}deg)`, height: `${length}px` }}>
                 <div className="pendulo-fio" style={{ height: `${length}px` }}></div>
                 <div className="pendulo-massa">
                   <span className="sr-only">Massa do pêndulo no grau {currentAngle.toFixed(1)}</span>
                 </div>
              </div>
              <div className="simulacao-metrics">
                <Badge variant="secondary">θ = {currentAngle.toFixed(1)}°</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'collisions' && (
        <div className="simulacao-grid fade-in">
          <Card className="control-panel">
            <CardHeader><h2>Dinâmica de Colisões</h2></CardHeader>
            <CardContent className="control-content">
              <div className="control-group">
                <label>Atrito Superficial ({friction.toFixed(1)})</label>
                <input type="range" min="0" max="2" step="0.1" value={friction} onChange={(e) => { setFriction(Number(e.target.value)); }} />
                <small className="text-secondary mt-1">{friction === 0 ? "Colisão perfeitamente elástica" : "Colisão com perda de energia cinética"}</small>
              </div>
              <div className="control-group mt-3">
                <label>Massa M1 (Azul)</label>
                <input type="range" min="0.5" max="3" step="0.5" value={balls[0].mass} onChange={(e) => { 
                  const n = [...balls]; n[0].mass = Number(e.target.value); n[0].radius = 20 * Number(e.target.value); setBalls(n); 
                }} disabled={isPlayingCollisions}/>
              </div>
              <div className="control-group">
                <label>Massa M2 (Verde)</label>
                <input type="range" min="0.5" max="3" step="0.5" value={balls[1].mass} onChange={(e) => { 
                  const n = [...balls]; n[1].mass = Number(e.target.value); n[1].radius = 20 * Number(e.target.value); setBalls(n); 
                }} disabled={isPlayingCollisions}/>
              </div>

              <div className="action-buttons mt-4">
                <Button variant={isPlayingCollisions ? "secondary" : "primary"} onClick={() => setIsPlayingCollisions(!isPlayingCollisions)} fullWidth>
                  {isPlayingCollisions ? <><Pause size={16}/> Pausar</> : <><Play size={16}/> Iniciar</>}
                </Button>
                <Button variant="outline" onClick={resetCollisions} fullWidth>
                  <RotateCcw size={16}/> Reiniciar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="simulacao-view">
            <CardContent className="canvas-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={200} 
                style={{ background: '#111418', borderRadius: '8px', border: '1px bottom rgba(255,255,255,0.2)' }}
              />
              <div className="simulacao-metrics" style={{ bottom: '10px' }}>
                <Badge variant="secondary">Conservação do Momento: {friction === 0 ? 'ATIVA' : 'DISSIPATIVA'}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Simulacao;
