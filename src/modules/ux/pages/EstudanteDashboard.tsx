import { useState, useEffect, useRef } from 'react';
import { Star, Award, BrainCircuit, Beaker, TrendingUp, Trophy, ShoppingBag, BookOpen, MessageCircle, Flame, Key } from 'lucide-react';
import { useStudentDashboard } from '../../core/hooks/useStudentDashboard';
import { SUBJECT_THEMES } from '../../core/constants/dashboardConstants';
import SoundEffects from '../../core/services/soundEffects';
import { 
  getComplementaryMaterials, 
  getStudentMessages, 
  sendStudentMessage,
  subscribeComplementaryMaterials,
  subscribeStudentMessages,
  type ComplementaryMaterial,
  type StudentMessage 
} from '../../data/repositories/classRepository';
import { useAuth } from '../../core/contexts/AuthContext';

function ConfettiCanvas({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }

    const colors = ['#06b6d4', '#8b5cf6', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
    const particles: Particle[] = [];

    // Create 100 particles shooting from the center bottom
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height + 10,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 16,
        speedY: -Math.random() * 15 - 10, // Shoot upwards
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let animId: number;
    let frames = 0;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let alive = false;
      particles.forEach(p => {
        // Physics
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.28; // Gravity
        p.speedX *= 0.98; // Air resistance
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height + 20) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      frames++;
      if (alive && frames < 180) {
        animId = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    tick();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

export function EstudanteDashboard() {
  const {
    progress,
    aiTip,
    activeSubject,
    setActiveSubject,
    activeLab,
    setActiveLab,
    activeView,
    setActiveView,
    shopItems,
    modules,
    handleModuleComplete,
    buyItem,
    achievements,
    achievementToast,
    studentClasses,
    joinClass,
  } = useStudentDashboard();

  const [classCodeInput, setClassCodeInput] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState<string | null>(null);
  const [classMaterials, setClassMaterials] = useState<ComplementaryMaterial[]>([]);
  const [classMessages, setClassMessages] = useState<StudentMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [geminiSaved, setGeminiSaved] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!selectedClassDetail) return;

    const unsubMaterials = subscribeComplementaryMaterials(selectedClassDetail, (mats) => {
      setClassMaterials(mats);
    });

    const unsubMessages = subscribeStudentMessages(selectedClassDetail, (msgs) => {
      setClassMessages(msgs.filter(m => m.studentId === (currentUser?.uid || '')));
    });

    return () => {
      unsubMaterials();
      unsubMessages();
    };
  }, [selectedClassDetail, currentUser]);

  const handleInterceptComplete = async (score: number) => {
    SoundEffects.playCoin();
    setShowConfetti(true);
    await handleModuleComplete(score);
  };

  const handleAIAction = () => {
    const actionType = aiTip?.actionType;
    const actionValue = aiTip?.actionValue;
    
    if (actionType === 'navigate_subject' && actionValue) {
      setActiveSubject(actionValue);
      setActiveLab(null);
    } else if (actionType === 'navigate_tab' && actionValue) {
      setActiveView(actionValue as any);
    }
  };

  const { level, xp, coins } = progress;

  const activeModule = activeSubject ? modules.find(m => m.id === activeSubject) : null;
  const ActiveComponent = activeLab?.component;

  const completedLabs = modules.reduce((acc, m) => acc + (m.labs?.filter((l: any) => l.component).length || 0), 0);
  const stats = [
    { label: 'Labs Disponíveis', value: `${completedLabs}`, icon: Beaker },
    { label: 'Progresso Médio', value: `${Math.min(100, Math.round((xp / Math.max(1, level * 500)) * 100))}%`, icon: TrendingUp },
    { label: 'Nível Atual', value: String(level), icon: Trophy },
    { label: 'Moedas', value: String(coins), icon: ShoppingBag },
  ];

  const tabs = [
    { id: 'learning' as const, label: 'Aprendizado', icon: Beaker },
    { id: 'classes' as const, label: 'Turmas', icon: BookOpen },
    { id: 'leaderboard' as const, label: 'Ranking', icon: Flame },
    { id: 'shop' as const, label: 'Loja de Recompensas', icon: ShoppingBag },
    { id: 'achievements' as const, label: 'Conquistas', icon: Trophy },
  ];

  return (
    <div className="fade-in" style={{
      padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto', minHeight: 'calc(100vh - 4rem)',
      ...(activeSubject ? {
        background: SUBJECT_THEMES[activeSubject]?.bg || undefined,
        transition: 'background 0.8s ease',
      } : {}),
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {activeSubject
              ? `${SUBJECT_THEMES[activeSubject]?.emoji || '🎓'} ${activeLab ? activeLab.title : (activeModule?.label || 'Laboratório')}`
              : 'Painel do Estudante'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {activeLab ? 'Laboratório Virtual — modo imersivo ativo' : (activeSubject ? 'Selecione um laboratório para iniciar' : 'Continue sua jornada de aprendizado')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge-yellow" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <Star style={{ width: '0.85rem', height: '0.85rem' }} fill="currentColor" /> {xp} XP
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.75rem',
            borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
            color: '#ffa726', background: 'rgba(255,167,38,0.1)', border: '1px solid rgba(255,167,38,0.3)',
          }}>
            🪙 {coins}
          </span>
          <span className="badge-violet" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <Award style={{ width: '0.85rem', height: '0.85rem' }} /> Nível {level}
          </span>
          <button
            onClick={() => setShowGeminiModal(true)}
            className="btn-outline-cyan"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Key style={{ width: '0.85rem', height: '0.85rem' }} /> Gemini AI
          </button>
        </div>
      </div>

      {/* Active Lab View */}
      {activeSubject && activeLab && ActiveComponent && (
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <button
            onClick={() => setActiveLab(null)}
            className="btn-outline-cyan"
            style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.82rem' }}
          >
            ← Voltar para {activeModule?.label}
          </button>
          <ActiveComponent
            {...(activeLab.props || {})}
            labId={activeLab.id}
            labTitle={activeLab.title}
            onComplete={handleInterceptComplete}
          />
        </div>
      )}

      {/* Sub-modules View (Labs Grid for Active Subject) */}
      {activeSubject && !activeLab && (
        <div style={{ maxWidth: '64rem', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
          <button
            onClick={() => setActiveSubject(null)}
            className="btn-outline-cyan"
            style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.82rem' }}
          >
            ← Voltar para Disciplinas
          </button>
          
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
            Trilha de Laboratórios: {activeModule?.label}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {activeModule?.labs?.map((lab: any) => {
              const t = SUBJECT_THEMES[activeSubject];
              const isAvailable = !!lab.component;
              return (
                <button
                  key={lab.id}
                  onClick={() => isAvailable && setActiveLab(lab)}
                  disabled={!isAvailable}
                  className="glass-card"
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    padding: '1.25rem', textAlign: 'left', cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.45,
                    borderColor: isAvailable && t?.primary ? `${t.primary}44` : 'var(--border-color)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                    {lab.title}
                  </div>
                  <div style={{
                    color: isAvailable ? (t?.primary || '#06b6d4') : 'var(--text-muted)', 
                    fontSize: '0.78rem', fontWeight: 700,
                  }}>
                    {isAvailable ? 'Acessar Laboratório →' : '🔒 Em Breve'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Nav Tabs */}
      {!activeSubject && (
        <>
          <div style={{
            display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-color)', paddingBottom: 0,
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.65rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.875rem', transition: 'all 0.2s',
                    color: activeView === tab.id ? '#06b6d4' : 'var(--text-muted)',
                    borderBottom: activeView === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
                    fontWeight: activeView === tab.id ? 600 : 400,
                  }}
                >
                  <Icon style={{ width: '1rem', height: '1rem' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="stat-card cyan">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <Icon style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{stat.value}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Learning View */}
      {!activeSubject && activeView === 'learning' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* AI Tip */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '1.25rem', borderRadius: '0.75rem',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
          }}>
            <BrainCircuit style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '0.05em' }}>IA ADAPTATIVA</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, lineHeight: 1.7 }}>
                {aiTip?.message || (typeof aiTip === 'string' ? aiTip : 'Analisando seu progresso...')}
              </p>
              {aiTip?.actionType && aiTip?.actionType !== 'none' && aiTip?.actionLabel && (
                <button
                  onClick={handleAIAction}
                  className="premium-btn btn-primary"
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.35rem 0.9rem',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  {aiTip.actionLabel} →
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Labs Grid */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
                Laboratórios Disponíveis
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {modules.map(mod => {
                  const t = SUBJECT_THEMES[mod.id];
                  const availableLabs = mod.labs?.filter((l: any) => l.component).length || 0;
                  const totalLabs = mod.labs?.length || 0;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveSubject(mod.id)}
                      className="glass-card"
                      style={{
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        padding: '1.1rem', textAlign: 'left', cursor: 'pointer',
                        borderColor: t?.primary ? `${t.primary}33` : 'var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.75rem' }}>{t?.emoji || '📚'}</div>
                        <div style={{ fontSize: '0.65rem', color: availableLabs > 0 ? '#06b6d4' : 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {availableLabs}/{totalLabs} Labs
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.88rem', marginTop: '0.5rem' }}>{mod.label}</div>
                      <div style={{
                        color: t?.primary || 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700,
                      }}>
                        Acessar Trilha →
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* XP Progress */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem' }}>Nível {level}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{xp} / {level * 500} XP</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (xp / (level * 500)) * 100)}%` }} />
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                  Faltam {Math.max(0, level * 500 - xp)} XP para o Nível {level + 1}
                </div>
              </div>

              {/* Coins */}
              <div style={{
                padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(255,167,38,0.07)', border: '1px solid rgba(255,167,38,0.2)',
              }}>
                <span style={{ fontSize: '1.75rem' }}>🪙</span>
                <div>
                  <div style={{ color: '#ffa726', fontWeight: 700 }}>{coins} Moedas</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Use na loja para personalizar!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop View */}
      {!activeSubject && activeView === 'shop' && (
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>🛍️ Loja de Itens</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Gaste suas moedas em personalizações exclusivas.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {shopItems.map(item => (
              <div key={item.id} className="glass-card" style={{
                padding: '1.25rem', textAlign: 'center',
                borderColor: item.owned ? '#06b6d4' : undefined,
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.88rem' }}>{item.name}</div>
                {item.owned ? (
                  <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700 }}>✅ Adquirido</div>
                ) : (
                  <button
                    onClick={() => buyItem(item.id)}
                    disabled={coins < item.price}
                    className="btn-gradient"
                    style={{
                      marginTop: '0.5rem', padding: '0.3rem 0.75rem', fontSize: '0.8rem',
                      opacity: coins >= item.price ? 1 : 0.4,
                      cursor: coins >= item.price ? 'pointer' : 'not-allowed',
                    }}
                  >
                    🪙 {item.price}
                  </button>
                )}
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '1.5rem', textAlign: 'center' }}>
            Saldo atual: <strong style={{ color: '#ffa726' }}>🪙 {coins}</strong> — complete laboratórios para ganhar mais moedas!
          </p>
        </div>
      )}

      {/* Achievement Toast */}
      {achievementToast && (
        <div className="slide-down" style={{
          position: 'fixed', top: '5rem', right: '1.5rem', zIndex: 1000,
          padding: '1rem 1.5rem', borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))',
          border: '1px solid rgba(6,182,212,0.4)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'slideDown 0.4s ease-out',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: '2rem' }}>{achievementToast.icon}</span>
          <div>
            <div style={{ color: '#06b6d4', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>CONQUISTA DESBLOQUEADA!</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{achievementToast.name}</div>
          </div>
        </div>
      )}

      {/* Achievements View */}
      {!activeSubject && activeView === 'achievements' && (
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600 }}>🏆 Suas Conquistas</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {achievements.filter(a => a.unlocked).length}/{achievements.length} desbloqueadas
            </span>
          </div>
          {/* Progress bar */}
          <div className="progress-bar" style={{ marginBottom: '1.5rem' }}>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%` }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {achievements.map((ach) => (
              <div key={ach.id} className="glass-card" style={{
                display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem',
                opacity: ach.unlocked ? 1 : 0.45,
                borderColor: ach.unlocked ? 'rgba(6,182,212,0.25)' : undefined,
                background: ach.unlocked ? 'rgba(6,182,212,0.05)' : undefined,
                transition: 'all 0.3s ease',
              }}>
                <div style={{ fontSize: '2rem', filter: ach.unlocked ? 'none' : 'grayscale(1)', transition: 'filter 0.3s' }}>{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem' }}>{ach.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{ach.description}</div>
                </div>
                {ach.unlocked && <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>✅</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classes View */}
      {!activeSubject && activeView === 'classes' && (
        <div className="fade-in" style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600 }}>👥 Minhas Turmas</h2>
          </div>
          
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Entrar em uma nova Turma</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Insira o código de convite fornecido pelo seu professor para se matricular na turma.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Ex: tB4xY9qR12kL" 
                value={classCodeInput}
                onChange={(e) => setClassCodeInput(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}
              />
              <button 
                className="btn-gradient" 
                style={{ padding: '0 1.5rem' }}
                onClick={async () => {
                  if (classCodeInput) {
                    const success = await joinClass(classCodeInput);
                    if (success) setClassCodeInput('');
                  }
                }}
              >
                Entrar
              </button>
            </div>
          </div>

          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem' }}>Turmas Matriculadas ({studentClasses.length})</h3>
          
          {studentClasses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {studentClasses.map(turma => (
                <div key={turma.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem' }}>{turma.name}</h4>
                    <span className="badge-green" style={{
                      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem',
                      borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 500, border: '1px solid',
                      color: '#10b981', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)',
                    }}>
                      Inscrito
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Professor(a): <strong style={{ color: 'var(--text-main)' }}>{turma.professorName || 'Não informado'}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Colegas: {turma.studentsCount}</span>
                    <span style={{ cursor: 'pointer', color: '#06b6d4' }} onClick={async () => {
                      setSelectedClassDetail(turma.id);
                      const mats = await getComplementaryMaterials(turma.id);
                      setClassMaterials(mats);
                      const msgs = await getStudentMessages(turma.id);
                      setClassMessages(msgs.filter(m => m.studentId === (currentUser?.uid || '')));
                    }}>Ver Detalhes →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
              <p>Você ainda não está matriculado em nenhuma turma.</p>
            </div>
          )}

          {/* Detalhe da Turma — Materiais & Mensagens */}
          {selectedClassDetail && (
            <div className="fade-in" style={{ marginTop: '2rem' }}>
              <button
                onClick={() => setSelectedClassDetail(null)}
                className="btn-outline-cyan"
                style={{ marginBottom: '1rem', padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}
              >
                ← Voltar para lista de turmas
              </button>

              {/* Material de Apoio */}
              <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen style={{ width: '1.1rem', height: '1.1rem', color: '#8b5cf6' }} />
                  Material de Apoio
                </h3>
                {classMaterials.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {classMaterials.map(mat => (
                      <div key={mat.id} style={{ padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{mat.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>{mat.description}</div>
                        {mat.link && (
                          <a href={mat.link} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', fontSize: '0.8rem', textDecoration: 'underline' }}>
                            Acessar recurso →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum material compartilhado pelo professor ainda.</p>
                )}
              </div>

              {/* Falar com Professor */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageCircle style={{ width: '1.1rem', height: '1.1rem', color: '#06b6d4' }} />
                  Falar com o Professor
                </h3>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <input
                    type="text"
                    placeholder="Escreva sua dúvida sobre um laboratório..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    style={{ flex: 1, padding: '0.7rem', borderRadius: '0.5rem', border: '1px solid rgba(6,182,212,0.25)', background: 'rgba(0,0,0,0.15)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && messageInput.trim()) {
                        setSendingMsg(true);
                        await sendStudentMessage(
                          selectedClassDetail,
                          currentUser?.uid || 'local-student',
                          currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Aluno',
                          messageInput.trim()
                        );
                        setMessageInput('');
                        const msgs = await getStudentMessages(selectedClassDetail);
                        setClassMessages(msgs.filter(m => m.studentId === (currentUser?.uid || 'local-student')));
                        setSendingMsg(false);
                      }
                    }}
                  />
                  <button
                    className="btn-gradient"
                    disabled={sendingMsg || !messageInput.trim()}
                    style={{ padding: '0 1.25rem', fontSize: '0.85rem', opacity: messageInput.trim() ? 1 : 0.4 }}
                    onClick={async () => {
                      if (!messageInput.trim()) return;
                      setSendingMsg(true);
                      await sendStudentMessage(
                        selectedClassDetail,
                        currentUser?.uid || 'local-student',
                        currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Aluno',
                        messageInput.trim()
                      );
                      setMessageInput('');
                      const msgs = await getStudentMessages(selectedClassDetail);
                      setClassMessages(msgs.filter(m => m.studentId === (currentUser?.uid || 'local-student')));
                      setSendingMsg(false);
                    }}
                  >
                    Enviar
                  </button>
                </div>

                {classMessages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {classMessages.map(msg => (
                      <div key={msg.id} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '0.4rem' }}>{msg.message}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Enviado em {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {msg.replied && msg.replyText && (
                          <div style={{ marginTop: '0.5rem', padding: '0.6rem', borderRadius: '0.4rem', background: 'rgba(6,182,212,0.08)', borderLeft: '3px solid #06b6d4' }}>
                            <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.2rem' }}>Resposta do Professor</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{msg.replyText}</div>
                          </div>
                        )}
                        {!msg.replied && (
                          <span style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600 }}>⏳ Aguardando resposta</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma mensagem enviada ainda.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard View */}
      {!activeSubject && activeView === 'leaderboard' && (
        <div className="fade-in glass-card" style={{ padding: '1.75rem', maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Flame style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />
            <div>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Ranking da Turma (Leaderboard)</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Classificação dos estudantes baseada em XP e laboratórios concluídos.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { rank: 1, name: currentUser?.displayName || 'Você (Estudante)', xp: xp, level: level, isMe: true },
              { rank: 2, name: 'Lucas Mendes', xp: 2450, level: 5, isMe: false },
              { rank: 3, name: 'Beatriz Lima', xp: 2100, level: 4, isMe: false },
              { rank: 4, name: 'Carlos Eduardo', xp: 1850, level: 4, isMe: false },
              { rank: 5, name: 'Mariana Costa', xp: 1400, level: 3, isMe: false },
            ].sort((a, b) => b.xp - a.xp).map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.85rem 1.25rem', borderRadius: '0.75rem',
                background: item.isMe ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                border: item.isMe ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    width: '2.2rem', height: '2.2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.9rem',
                    background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.1)',
                    color: idx < 3 ? '#fff' : 'var(--text-secondary)',
                    boxShadow: idx === 0 ? '0 0 12px rgba(245,158,11,0.4)' : 'none',
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {item.name} {item.isMe && <span className="badge-cyan" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>Você</span>}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Nível {item.level}</div>
                  </div>
                </div>
                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>⚡ {item.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gemini AI Settings Modal */}
      {showGeminiModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '440px', padding: '1.75rem', background: '#0b0f19', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Key style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>CONFIGURAR CHAVE GEMINI AI</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Insira sua chave de API do Google Gemini para habilitar análises LLM em tempo real no módulo de Redação e Dicas Adaptativas.
            </p>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKeyInput}
              onChange={e => setGeminiKeyInput(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', outline: 'none' }}
            />
            {geminiSaved && <div style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 600 }}>✅ Chave salva com sucesso no navegador!</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn-outline-cyan" onClick={() => setShowGeminiModal(false)} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Fechar</button>
              <button className="btn-gradient" onClick={() => {
                localStorage.setItem('gemini_api_key', geminiKeyInput.trim());
                setGeminiSaved(true);
                setTimeout(() => setGeminiSaved(false), 2000);
              }} style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>Salvar Chave</button>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Explosion Canvas */}
      <ConfettiCanvas active={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}

export default EstudanteDashboard;
