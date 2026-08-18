import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { ArrowRight, Beaker, Brain, Trophy, Zap, BookOpen, Users } from 'lucide-react';

export function InteractivePendulum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef<number>(Math.PI / 4); // 45 graus
  const velRef = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const length = 95;
    const gravity = 0.35;
    const damping = 0.994; // Resistência leve

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const pivotX = width / 2;
      const pivotY = 15;

      if (!isDragging.current) {
        const accel = (-gravity / length) * Math.sin(angleRef.current);
        velRef.current = (velRef.current + accel) * damping;
        angleRef.current += velRef.current;
      }

      const bobX = pivotX + length * Math.sin(angleRef.current);
      const bobY = pivotY + length * Math.cos(angleRef.current);

      // Fundo em malha tecnológica
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Linha do arco do pêndulo
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, length, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fio do pêndulo
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Ponto do pivô
      ctx.beginPath();
      ctx.fillStyle = '#8b5cf6';
      ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Glow do Bob
      ctx.beginPath();
      const radGlow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, 18);
      radGlow.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
      radGlow.addColorStop(0.3, 'rgba(6, 182, 212, 0.3)');
      radGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radGlow;
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Centro do Bob
      ctx.beginPath();
      ctx.fillStyle = '#8b5cf6';
      ctx.arc(bobX, bobY, 7, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const pivotX = canvas.width / 2;
    const pivotY = 15;
    const dx = px - pivotX;
    const dy = py - pivotY;

    if (isDragging.current) {
      angleRef.current = Math.atan2(dx, dy);
      velRef.current = 0;
    } else {
      const length = 95;
      const bobX = pivotX + length * Math.sin(angleRef.current);
      const bobY = pivotY + length * Math.cos(angleRef.current);
      const dist = Math.hypot(px - bobX, py - bobY);
      if (dist < 22) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const pivotX = canvas.width / 2;
    const pivotY = 15;
    const length = 95;
    const bobX = pivotX + length * Math.sin(angleRef.current);
    const bobY = pivotY + length * Math.cos(angleRef.current);
    const dist = Math.hypot(px - bobX, py - bobY);

    if (dist < 25) {
      isDragging.current = true;
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grab';
  };

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={150}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: '100%',
        maxWidth: '300px',
        height: '140px',
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '8px',
        border: '1px solid rgba(6, 182, 212, 0.15)',
      }}
    />
  );
}

interface HomeProps {
  onLoginOpen: () => void;
}

export function Home({ onLoginOpen }: HomeProps) {
  const { currentUser, userData } = useAuth();

  const features = [
    {
      icon: Beaker,
      title: 'Laboratórios Virtuais',
      description: 'Experimentos de física interativos com simulações em tempo real',
    },
    {
      icon: Brain,
      title: 'IA Adaptativa',
      description: 'Recomendações personalizadas baseadas no seu progresso',
    },
    {
      icon: Trophy,
      title: 'Gamificação',
      description: 'XP, moedas, conquistas e loja para engajar estudantes',
    },
    {
      icon: Zap,
      title: 'Feedback Instantâneo',
      description: 'Análise em tempo real do desempenho e progresso',
    },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1rem' }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(6,182,212,0.05) 0%, rgba(139,92,246,0.05) 50%, transparent 100%)',
        }} />

        <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="gradient-text" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.1,
          }}>
            Edu-Interact
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            maxWidth: '42rem', margin: '0 auto 2rem',
            lineHeight: 1.7,
          }}>
            Plataforma educacional com Laboratórios Virtuais de Física, Metodologias Ativas e Gamificação inteligente.
          </p>

          {/* CTAs based on auth state */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {currentUser && userData ? (
              <>
                {userData.role === 'professor' && (
                  <>
                    <Link to="/professor" className="btn-gradient" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                      <Users style={{ width: '1.25rem', height: '1.25rem' }} />
                      Minhas Turmas
                      <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                    </Link>
                    <Link to="/simulacao" className="btn-outline-cyan" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                      <Beaker style={{ width: '1.25rem', height: '1.25rem' }} />
                      Laboratórios
                    </Link>
                  </>
                )}
                {userData.role === 'estudante' && (
                  <>
                    <Link to="/estudante" className="btn-gradient" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                      <BookOpen style={{ width: '1.25rem', height: '1.25rem' }} />
                      Meu Aprendizado
                      <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                    </Link>
                    <Link to="/simulacao" className="btn-outline-cyan" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                      <Beaker style={{ width: '1.25rem', height: '1.25rem' }} />
                      Laboratórios
                    </Link>
                  </>
                )}
                {userData.role === 'admin' && (
                  <Link to="/admin" className="btn-gradient" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                    Admin
                    <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                  </Link>
                )}
              </>
            ) : (
              <>
                <button onClick={onLoginOpen} className="btn-gradient" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                  Começar Agora
                  <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
                <Link to="/simulacao" className="btn-outline-cyan" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                  Ver Laboratórios
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Preview Card */}
        <div style={{ maxWidth: '64rem', margin: '5rem auto 0' }}>
          <div className="glass-card" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
            boxShadow: '0 0 50px rgba(6, 182, 212, 0.1)',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem', alignItems: 'center',
            }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
                  Experimente agora
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                  Simule pêndulos, colisões elásticas e muito mais em nossos laboratórios virtuais interativos.
                </p>
                <Link to="/simulacao" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: '#06b6d4', textDecoration: 'none', fontWeight: 500,
                  transition: 'gap 0.2s',
                }}>
                  Ver demonstração
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </Link>
              </div>
              <div style={{
                height: '12rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(139,92,246,0.06))',
                border: '1px solid rgba(139,92,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                boxSizing: 'border-box'
              }}>
                <InteractivePendulum />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '3rem 1rem 5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Recursos da Plataforma
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Tudo que você precisa para ensinar e aprender
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{
                    width: '3rem', height: '3rem', borderRadius: '0.5rem',
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    <Icon style={{ width: '1.5rem', height: '1.5rem', color: '#8b5cf6' }} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '0 1rem 5rem' }}>
        <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
          <div style={{
            borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center',
            border: '1px solid rgba(6,182,212,0.2)',
            background: 'linear-gradient(90deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1), rgba(6,182,212,0.1))',
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              Pronto para começar?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              Junte-se a estudantes e professores que já utilizam a plataforma
            </p>
            {currentUser ? (
              <Link
                to={userData?.role === 'professor' ? '/professor' : '/estudante'}
                className="btn-gradient"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
              >
                Ir para meu painel
                <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </Link>
            ) : (
              <button onClick={onLoginOpen} className="btn-gradient" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                Iniciar agora
                <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
