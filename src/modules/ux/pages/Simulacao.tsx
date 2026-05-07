import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Simulacao: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pendulum' | 'collisions'>('pendulum');

  // Pendulum states
  const [isPlayingPendulum, setIsPlayingPendulum] = useState(false);
  const [angle, setAngle] = useState(30);
  const [length, setLength] = useState(150);
  const [gravity, setGravity] = useState(9.8);
  const [mass, setMass] = useState(1.0);
  const pendulumCanvasRef = useRef<HTMLCanvasElement>(null);
  const pendulumAnimRef = useRef<number>(0);

  // Collisions states
  const [isPlayingCollisions, setIsPlayingCollisions] = useState(false);
  const [friction, setFriction] = useState(0);
  const collisionCanvasRef = useRef<HTMLCanvasElement>(null);
  const collisionAnimRef = useRef<number>(0);
  const [balls, setBalls] = useState([
    { id: 1, x: 80, y: 100, vx: 5, vy: 0, radius: 20, mass: 1, color: '#06b6d4' },
    { id: 2, x: 350, y: 100, vx: -3, vy: 0, radius: 25, mass: 1.5, color: '#8b5cf6' }
  ]);

  // Pendulum canvas rendering
  useEffect(() => {
    const canvas = pendulumCanvasRef.current;
    if (!canvas || activeTab !== 'pendulum') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentAngle = (angle * Math.PI) / 180;
    let angularVelocity = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const pivotX = width / 2;
      const pivotY = 80;

      if (isPlayingPendulum) {
        const angularAcceleration = (-(gravity / length) * 100) * Math.sin(currentAngle);
        angularVelocity += angularAcceleration * 0.016;
        currentAngle += angularVelocity * 0.016;
      }

      const bobX = pivotX + length * Math.sin(currentAngle);
      const bobY = pivotY + length * Math.cos(currentAngle);

      // Reference line (dashed)
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + length);
      ctx.stroke();
      ctx.setLineDash([]);

      // String
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Pivot
      ctx.fillStyle = '#1f1f2e';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bob with gradient
      const bobRadius = 14 + mass * 5;
      const gradient = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobRadius);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bob outline glow
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Angle indicator text
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`θ = ${(currentAngle * 180 / Math.PI).toFixed(1)}°`, pivotX, height - 15);

      pendulumAnimRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (pendulumAnimRef.current) cancelAnimationFrame(pendulumAnimRef.current);
    };
  }, [isPlayingPendulum, angle, length, gravity, mass, activeTab]);

  // Collisions canvas rendering
  useEffect(() => {
    const canvas = collisionCanvasRef.current;
    if (!canvas || activeTab !== 'collisions') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localBalls = balls.map(b => ({ ...b }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      localBalls.forEach(ball => {
        // Ball glow
        const glow = ctx.createRadialGradient(ball.x, ball.y, ball.radius * 0.5, ball.x, ball.y, ball.radius * 2);
        glow.addColorStop(0, ball.color + '33');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Ball body
        const gradient = ctx.createRadialGradient(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0, ball.x, ball.y, ball.radius);
        gradient.addColorStop(0, ball.color);
        gradient.addColorStop(1, ball.color + '88');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = ball.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.stroke();
      });
    };

    const updateCollisions = () => {
      localBalls.forEach(b => {
        b.x += b.vx;
        if (friction > 0) {
          if (b.vx > 0) b.vx = Math.max(0, b.vx - friction * 0.05);
          if (b.vx < 0) b.vx = Math.min(0, b.vx + friction * 0.05);
        }
        if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -1; }
        else if (b.x + b.radius > canvas.width) { b.x = canvas.width - b.radius; b.vx *= -1; }
      });

      const b1 = localBalls[0];
      const b2 = localBalls[1];
      const dx = b2.x - b1.x;
      const distance = Math.abs(dx);

      if (distance < b1.radius + b2.radius) {
        const overlap = (b1.radius + b2.radius) - distance;
        const direction = dx > 0 ? 1 : -1;
        b1.x -= overlap / 2 * direction;
        b2.x += overlap / 2 * direction;

        const m1 = b1.mass; const m2 = b2.mass;
        const v1 = b1.vx; const v2 = b2.vx;
        b1.vx = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        b2.vx = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
      }

      draw();
      if (isPlayingCollisions) {
        collisionAnimRef.current = requestAnimationFrame(updateCollisions);
      }
    };

    if (isPlayingCollisions) {
      collisionAnimRef.current = requestAnimationFrame(updateCollisions);
    } else {
      draw();
    }

    return () => {
      if (collisionAnimRef.current) cancelAnimationFrame(collisionAnimRef.current);
    };
  }, [isPlayingCollisions, activeTab, friction]);

  const resetPendulum = () => {
    setIsPlayingPendulum(false);
    setAngle(30);
  };

  const resetCollisions = () => {
    setIsPlayingCollisions(false);
    setBalls([
      { id: 1, x: 80, y: 100, vx: 5, vy: 0, radius: 20, mass: 1, color: '#06b6d4' },
      { id: 2, x: 350, y: 100, vx: -3, vy: 0, radius: 25, mass: 1.5, color: '#8b5cf6' }
    ]);
  };

  const period = (2 * Math.PI * Math.sqrt((length / 100) / gravity)).toFixed(2);
  const frequency = (1 / (2 * Math.PI * Math.sqrt((length / 100) / gravity))).toFixed(2);

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link to="/estudante" className="btn-outline-cyan" style={{ padding: '0.5rem', borderRadius: '0.5rem' }}>
          <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Laboratório Virtual: Mecânica Clássica
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Explore módulos dinâmicos para dominar conceitos da Física.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('pendulum')}
            className={activeTab === 'pendulum' ? 'btn-gradient' : 'btn-outline-cyan'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Pêndulo
          </button>
          <button
            onClick={() => setActiveTab('collisions')}
            className={activeTab === 'collisions' ? 'btn-gradient' : 'btn-outline-violet'}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Colisões (1D)
          </button>
        </div>
      </div>

      {/* Pendulum Tab */}
      {activeTab === 'pendulum' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Canvas Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <canvas
                ref={pendulumCanvasRef}
                width={800}
                height={450}
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', background: '#0f0f18' }}
              />
            </div>

            {/* Play controls */}
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={() => setIsPlayingPendulum(!isPlayingPendulum)} className="btn-gradient" style={{ padding: '0.65rem 1.5rem' }}>
                {isPlayingPendulum ? <><Pause style={{ width: '1.15rem', height: '1.15rem' }} /> Pausar</> : <><Play style={{ width: '1.15rem', height: '1.15rem' }} /> Iniciar</>}
              </button>
              <button onClick={resetPendulum} className="btn-outline-violet" style={{ padding: '0.65rem 1.5rem' }}>
                <RotateCcw style={{ width: '1.15rem', height: '1.15rem' }} /> Resetar
              </button>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings2 style={{ width: '1.15rem', height: '1.15rem', color: '#06b6d4' }} />
                Variáveis Físicas
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ângulo Inicial</label>
                    <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>{angle}°</span>
                  </div>
                  <input type="range" min="5" max="85" value={angle} onChange={e => setAngle(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Comprimento</label>
                    <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>{length} px</span>
                  </div>
                  <input type="range" min="50" max="250" value={length} onChange={e => setLength(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Gravidade</label>
                    <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>{gravity.toFixed(1)} m/s²</span>
                  </div>
                  <input type="range" min="1" max="25" step="0.1" value={gravity} onChange={e => setGravity(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Massa</label>
                    <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>{mass.toFixed(1)} kg</span>
                  </div>
                  <input type="range" min="0.5" max="3" step="0.1" value={mass} onChange={e => setMass(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
                Informações
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Período (T)</p>
                  <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{period}s</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Frequência (f)</p>
                  <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{frequency} Hz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive override for mobile */}
          <style>{`
            @media (max-width: 768px) {
              .fade-in > div:first-child { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      )}

      {/* Collisions Tab */}
      {activeTab === 'collisions' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <canvas
                ref={collisionCanvasRef}
                width={600}
                height={200}
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', background: '#0f0f18' }}
              />
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <span className={friction === 0 ? 'badge-green' : 'badge-yellow'}>
                  Conservação do Momento: {friction === 0 ? 'ATIVA' : 'DISSIPATIVA'}
                </span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={() => setIsPlayingCollisions(!isPlayingCollisions)} className="btn-gradient" style={{ padding: '0.65rem 1.5rem' }}>
                {isPlayingCollisions ? <><Pause style={{ width: '1.15rem', height: '1.15rem' }} /> Pausar</> : <><Play style={{ width: '1.15rem', height: '1.15rem' }} /> Iniciar</>}
              </button>
              <button onClick={resetCollisions} className="btn-outline-violet" style={{ padding: '0.65rem 1.5rem' }}>
                <RotateCcw style={{ width: '1.15rem', height: '1.15rem' }} /> Resetar
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings2 style={{ width: '1.15rem', height: '1.15rem', color: '#06b6d4' }} />
              Dinâmica de Colisões
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Atrito Superficial</label>
                  <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>{friction.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" value={friction} onChange={e => setFriction(Number(e.target.value))} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {friction === 0 ? 'Colisão perfeitamente elástica' : 'Colisão com perda de energia cinética'}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Massa M1 (Cyan)</label>
                  <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>{balls[0].mass.toFixed(1)}</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.5"
                  value={balls[0].mass}
                  onChange={e => {
                    const n = [...balls];
                    n[0].mass = Number(e.target.value);
                    n[0].radius = 20 * Number(e.target.value);
                    setBalls(n);
                  }}
                  disabled={isPlayingCollisions}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Massa M2 (Violet)</label>
                  <span style={{ fontSize: '0.82rem', color: '#8b5cf6' }}>{balls[1].mass.toFixed(1)}</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.5"
                  value={balls[1].mass}
                  onChange={e => {
                    const n = [...balls];
                    n[1].mass = Number(e.target.value);
                    n[1].radius = 20 * Number(e.target.value);
                    setBalls(n);
                  }}
                  disabled={isPlayingCollisions}
                />
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .fade-in > div { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Simulacao;
