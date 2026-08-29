import { useState, useEffect, useRef } from 'react';
import { Star, Award, BrainCircuit, Beaker, TrendingUp, Trophy, ShoppingBag, BookOpen, MessageCircle, Key, Sparkles, CheckCircle } from 'lucide-react';
import { useStudentDashboard } from '../../core/hooks/useStudentDashboard';
import { SUBJECT_THEMES } from '../../core/constants/dashboardConstants';
import SoundEffects from '../../core/services/soundEffects';
import { 
  getStudentMessages, 
  sendStudentMessage,
  subscribeComplementaryMaterials,
  subscribeStudentMessages,
  type ComplementaryMaterial,
  type StudentMessage 
} from '../../data/repositories/classRepository';
import {
  subscribeActivitiesByClass
} from '../../data/repositories/activityRepository';
import type { ActivityData } from '../../data/types';
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
        speedY: -Math.random() * 15 - 10,
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
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.28;
        p.speedX *= 0.98;
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

    animId = requestAnimationFrame(tick);

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
  }, [active, onComplete]);

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
    handleActivitySubmit,
    buyItem,
    achievements,
    achievementToast,
    completedModules,
    studentClasses,
    joinClass,
  } = useStudentDashboard();

  const [classCodeInput, setClassCodeInput] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState<string | null>(null);
  const [classMaterials, setClassMaterials] = useState<ComplementaryMaterial[]>([]);
  const [classActivities, setClassActivities] = useState<ActivityData[]>([]);
  const [classMessages, setClassMessages] = useState<StudentMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [geminiSaved, setGeminiSaved] = useState(false);
  const { currentUser } = useAuth();

  // Custom Teacher Activity Execution Modal State
  const [activeCustomActivity, setActiveCustomActivity] = useState<ActivityData | null>(null);
  const [customQIndex, setCustomQIndex] = useState(0);
  const [customAnswered, setCustomAnswered] = useState<number | null>(null);
  const [customScore, setCustomScore] = useState(0);
  const [customCompleted, setCustomCompleted] = useState(false);

  useEffect(() => {
    if (!selectedClassDetail) return;

    const unsubMaterials = subscribeComplementaryMaterials(selectedClassDetail, (mats) => {
      setClassMaterials(mats);
    });

    const unsubActivities = subscribeActivitiesByClass(selectedClassDetail, (acts) => {
      setClassActivities(acts);
    });

    const unsubMessages = subscribeStudentMessages(selectedClassDetail, (msgs) => {
      setClassMessages(msgs.filter(m => m.studentId === (currentUser?.uid || '')));
    });

    return () => {
      unsubMaterials();
      unsubActivities();
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
    { label: 'Laboratórios Virtuais', value: `${completedLabs}`, icon: Beaker },
    { label: 'Progresso Médio', value: `${Math.min(100, Math.round((xp / Math.max(1, level * 500)) * 100))}%`, icon: TrendingUp },
    { label: 'Nível Geral', value: `Nv. ${level}`, icon: Trophy },
    { label: 'Moedas Virtuais', value: `${coins}`, icon: Award },
  ];

  const handleSaveGeminiKey = () => {
    if (geminiKeyInput.trim()) {
      localStorage.setItem('gemini_api_key', geminiKeyInput.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setGeminiSaved(true);
    setTimeout(() => {
      setGeminiSaved(false);
      setShowGeminiModal(false);
    }, 1200);
  };

  // Custom Activity Answer Handler
  const handleCustomQuestionAnswer = (optIndex: number) => {
    if (customAnswered !== null || !activeCustomActivity?.questions) return;
    setCustomAnswered(optIndex);
    const isCorrect = optIndex === activeCustomActivity.questions[customQIndex].answer;
    if (isCorrect) {
      setCustomScore(prev => prev + 1);
    }
  };

  const handleCustomNext = async () => {
    if (!activeCustomActivity?.questions) return;
    if (customQIndex < activeCustomActivity.questions.length - 1) {
      setCustomQIndex(prev => prev + 1);
      setCustomAnswered(null);
    } else {
      setCustomCompleted(true);
      const totalQ = activeCustomActivity.questions.length;
      const finalPercentage = Math.round((customScore / totalQ) * 100);
      SoundEffects.playCoin();
      setShowConfetti(true);
      if (handleActivitySubmit) {
        await handleActivitySubmit(activeCustomActivity, finalPercentage);
      }
    }
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      {/* Toast de Conquista */}
      {achievementToast && (
        <div className="achievement-toast">
          <div className="achievement-toast-icon">
            {achievementToast.icon}
          </div>
          <div>
            <div className="achievement-toast-title">Conquista Desbloqueada!</div>
            <div className="achievement-toast-name">{achievementToast.name}</div>
            <div className="achievement-toast-desc">{achievementToast.description}</div>
          </div>
        </div>
      )}

      {/* Confetti */}
      <ConfettiCanvas active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Top Banner / Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Plataforma Gamificada & Laboratórios Virtuais
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Explore 72 laboratórios especializados, resolva desafios com IA e conquiste recompensas!
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowGeminiModal(true)}
            className="btn-outline-cyan"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Key style={{ width: '0.9rem', height: '0.9rem', color: '#06b6d4' }} />
            {localStorage.getItem('gemini_api_key') ? '🔑 Chave IA Conectada' : '⚙️ Configurar Chave IA'}
          </button>
        </div>
      </div>

      {/* Top View Selector Tabs */}
      {!activeSubject && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'learning', label: '🔬 Laboratórios Virtuais (72 Labs)', icon: Beaker },
            { id: 'classes', label: `🏫 Minhas Turmas (${studentClasses.length})`, icon: BookOpen },
            { id: 'shop', label: `🛍️ Loja de Recompensas (${coins} 🪙)`, icon: ShoppingBag },
            { id: 'achievements', label: `🏆 Conquistas (${achievements.filter(a => a.unlocked).length}/${achievements.length})`, icon: Award },
            { id: 'leaderboard', label: '⭐ Ranking da Turma', icon: Star },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              style={{
                padding: '0.6rem 1.15rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: activeView === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
                background: activeView === tab.id ? 'rgba(6,182,212,0.1)' : 'transparent',
                color: activeView === tab.id ? '#06b6d4' : 'var(--text-secondary)',
                fontWeight: activeView === tab.id ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <tab.icon style={{ width: '0.95rem', height: '0.95rem' }} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── VIEW: LEARNING / DASHBOARD (LABS & PROGRESS) ── */}
      {!activeSubject && activeView === 'learning' && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.label}</span>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0' }}>{stat.value}</div>
                    </div>
                    <Icon style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Recommendation Banner */}
          <div className="glass-card mb-4" style={{
            padding: '1.25rem 1.5rem',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <BrainCircuit style={{ width: '2rem', height: '2rem', color: '#06b6d4', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.85rem' }}>RECOMENDAÇÃO PEDAGÓGICA IA</div>
              <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginTop: '0.2rem' }}>{aiTip?.message || 'Explore os laboratórios para receber recomendações adaptativas de aprendizado!'}</div>
            </div>
            {aiTip?.actionLabel && (
              <button onClick={handleAIAction} className="btn-gradient" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {aiTip.actionLabel} →
              </button>
            )}
          </div>

          {/* 12 Disciplines Grid */}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Disciplinas & Áreas de Estudo (72 Laboratórios Virtuais)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
                    padding: '1.25rem', textAlign: 'left', cursor: 'pointer',
                    borderColor: t?.primary ? `${t.primary}33` : 'var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>{t?.emoji || '📚'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
                      {availableLabs}/{totalLabs} Labs
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.4rem' }}>{mod.label}</div>
                  <div style={{ color: t?.primary || '#06b6d4', fontSize: '0.8rem', fontWeight: 700 }}>
                    Acessar Laboratórios ({availableLabs}) →
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW: DISCIPLINE LABS SELECTION ── */}
      {activeSubject && !activeLab && (
        <div className="fade-in">
          <button
            onClick={() => setActiveSubject(null)}
            className="btn-outline-cyan"
            style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            ← Voltar para todas as disciplinas
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{SUBJECT_THEMES[activeSubject]?.emoji || '🔬'}</span>
            <div>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                {activeModule?.label}
              </h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
                Selecione um dos 6 laboratórios especializados abaixo para iniciar a prática:
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {activeModule?.labs.map((lab: any, idx: number) => {
              const isCompleted = completedModules.includes(lab.id);
              return (
                <div
                  key={lab.id}
                  className="glass-card"
                  style={{
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>
                        Lab #{idx + 1}
                      </span>
                      {isCompleted && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                          ✓ Concluído
                        </span>
                      )}
                    </div>
                    <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.35rem' }}>
                      {lab.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                      Modo: {lab.props?.mode || 'especializado'}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveLab(lab)}
                    className="btn-gradient"
                    style={{ width: '100%', padding: '0.6rem', fontSize: '0.88rem', fontWeight: 700 }}
                  >
                    ▶️ Iniciar Laboratório Virtual
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW: ACTIVE LAB SIMULATOR ── */}
      {activeSubject && activeLab && ActiveComponent && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setActiveLab(null)}
              className="btn-outline-cyan"
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              ← Voltar aos Labs de {activeModule?.label}
            </button>
            <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.9rem' }}>
              🔬 {activeLab.title}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', minHeight: '500px' }}>
            <ActiveComponent
              key={activeLab.id}
              {...(activeLab.props || {})}
              labId={activeLab.id}
              labTitle={activeLab.title}
              onComplete={handleInterceptComplete}
            />
          </div>
        </div>
      )}

      {/* ── VIEW: MINHAS TURMAS & ATIVIDADES DO PROFESSOR ── */}
      {!activeSubject && activeView === 'classes' && (
        <div>
          {/* Enroll in Class */}
          <div className="glass-card mb-4" style={{ padding: '1.25rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Entrar em uma Nova Turma
            </h3>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                placeholder="Insira o Código da Turma fornecido pelo professor..."
                value={classCodeInput}
                onChange={e => setClassCodeInput(e.target.value)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
              <button
                className="btn-gradient"
                style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}
                onClick={async () => {
                  if (classCodeInput.trim()) {
                    const success = await joinClass(classCodeInput.trim());
                    if (success) setClassCodeInput('');
                  }
                }}
              >
                Matricular
              </button>
            </div>
          </div>

          {/* Enrolled Classes List */}
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>
            Turmas Matriculadas ({studentClasses.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {studentClasses.map(turma => (
              <div key={turma.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{turma.name}</h4>
                  <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
                    Ativa
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                  Professor(a): <strong style={{ color: 'var(--text-main)' }}>{turma.professorName || 'Professor'}</strong>
                </div>
                <button
                  className="btn-outline-cyan"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem', fontWeight: 700 }}
                  onClick={() => setSelectedClassDetail(turma.id)}
                >
                  Abrir Painel da Turma & Exercícios →
                </button>
              </div>
            ))}
          </div>

          {/* Class Detail View: Activities + Materials + Messages */}
          {selectedClassDetail && (
            <div className="fade-in" style={{ marginTop: '2rem' }}>
              <button
                onClick={() => setSelectedClassDetail(null)}
                className="btn-outline-cyan"
                style={{ marginBottom: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                ← Voltar para lista de turmas
              </button>

              {/* 1. Atividades Criadas pelo Professor */}
              <div className="glass-card mb-4" style={{ padding: '1.5rem', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                  <h3 style={{ color: '#06b6d4', fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>
                    🚀 Atividades & Desafios Publicados pelo Professor ({classActivities.length})
                  </h3>
                </div>

                {classActivities.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {classActivities.map((act) => {
                      const isCompleted = completedModules.includes(act.id || 'custom_act');
                      return (
                        <div key={act.id} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: isCompleted ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                              {act.subject || 'Geral'}
                            </span>
                            {isCompleted ? (
                              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                                ✓ Concluído
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700 }}>
                                ⚡ +{act.xpReward || 100} XP
                              </span>
                            )}
                          </div>
                          <h4 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', margin: '0 0 0.35rem' }}>{act.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.85rem', lineHeight: 1.4 }}>
                            {act.description || 'Atividade prática para fixação do conteúdo.'}
                          </p>

                          <button
                            onClick={() => {
                              setActiveCustomActivity(act);
                              setCustomQIndex(0);
                              setCustomAnswered(null);
                              setCustomScore(0);
                              setCustomCompleted(false);
                            }}
                            className="btn-gradient"
                            style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', fontWeight: 700 }}
                          >
                            {isCompleted ? 'Refazer Atividade' : '▶️ Iniciar Desafio'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    Nenhuma atividade publicada pelo professor nesta turma até o momento.
                  </p>
                )}
              </div>

              {/* 2. Materiais Complementares */}
              <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen style={{ width: '1.1rem', height: '1.1rem', color: '#8b5cf6' }} />
                  📚 Materiais & Leituras Complementares da Turma
                </h3>
                {classMaterials.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {classMaterials.map(mat => (
                      <div key={mat.id} style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.04)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{mat.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.35rem' }}>{mat.description}</div>
                        {mat.link && (
                          <a href={mat.link} target="_blank" rel="noopener noreferrer" style={{ color: '#06b6d4', fontSize: '0.8rem', textDecoration: 'underline' }}>
                            Acessar recurso compartilhado →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum material complementar publicado para esta turma.</p>
                )}
              </div>

              {/* 3. Mensagens & Dúvidas com o Professor */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageCircle style={{ width: '1.1rem', height: '1.1rem', color: '#06b6d4' }} />
                  Tirar Dúvida com o Professor
                </h3>
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <input
                    type="text"
                    placeholder="Digite sua dúvida sobre a matéria ou atividade..."
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.25)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                  />
                  <button
                    className="btn-gradient"
                    disabled={sendingMsg || !messageInput.trim()}
                    style={{ padding: '0 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
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
                    Enviar Dúvida
                  </button>
                </div>

                {classMessages.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {classMessages.map(msg => (
                      <div key={msg.id} style={{ padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>{msg.message}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Enviado em {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {msg.replied && msg.replyText && (
                          <div style={{ marginTop: '0.6rem', padding: '0.65rem', borderRadius: '6px', background: 'rgba(6,182,212,0.08)', borderLeft: '3px solid #06b6d4' }}>
                            <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.2rem' }}>Resposta do Professor:</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{msg.replyText}</div>
                          </div>
                        )}
                        {!msg.replied && (
                          <span style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 600, display: 'block', marginTop: '0.3rem' }}>
                            ⏳ Aguardando retorno do professor
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VIEW: SHOP ── */}
      {!activeSubject && activeView === 'shop' && (
        <div className="fade-in glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🛍️ Loja de Itens & Customização do Perfil
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Utilize suas moedas conquistadas nos laboratórios para desbloquear títulos e temas!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {shopItems.map(item => (
              <div key={item.id} style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: item.owned ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 700, margin: '0 0 0.25rem' }}>{item.name}</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>🪙 {item.price}</span>
                  <button
                    onClick={() => buyItem(item.id)}
                    disabled={item.owned || coins < item.price}
                    className="btn-gradient"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', opacity: item.owned ? 0.6 : (coins < item.price ? 0.5 : 1) }}
                  >
                    {item.owned ? 'Adquirido' : 'Adquirir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW: ACHIEVEMENTS ── */}
      {!activeSubject && activeView === 'achievements' && (
        <div className="fade-in glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🏆 Conquistas & Medalhas Gamificadas
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Complete desafios nos simuladores e desbloqueie todas as medalhas da sua jornada acadêmica!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {achievements.map(ach => (
              <div key={ach.id} style={{ padding: '1.25rem', borderRadius: '12px', background: ach.unlocked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: ach.unlocked ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2.25rem', opacity: ach.unlocked ? 1 : 0.4 }}>{ach.icon}</div>
                <div>
                  <div style={{ color: ach.unlocked ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.95rem' }}>{ach.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{ach.description}</div>
                  {ach.unlocked && <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>✓ Conquistada</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIEW: LEADERBOARD ── */}
      {!activeSubject && activeView === 'leaderboard' && (
        <div className="fade-in glass-card" style={{ padding: '1.75rem', maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Trophy style={{ width: '1.75rem', height: '1.75rem', color: '#f59e0b' }} />
            <div>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Ranking Geral de Aprendizado</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Destaques com maior engajamento nos laboratórios</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { pos: 1, name: 'Você', xp: xp, level: level, isMe: true },
              { pos: 2, name: 'Beatriz Lima', xp: 2400, level: 5, isMe: false },
              { pos: 3, name: 'Lucas Ferreira', xp: 1950, level: 4, isMe: false },
              { pos: 4, name: 'Mariana Costa', xp: 1600, level: 4, isMe: false },
              { pos: 5, name: 'Gabriel Santos', xp: 1200, level: 3, isMe: false },
            ].map(user => (
              <div key={user.pos} style={{ padding: '1rem', borderRadius: '10px', background: user.isMe ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)', border: user.isMe ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: user.pos === 1 ? '#f59e0b' : user.pos === 2 ? '#94a3b8' : user.pos === 3 ? '#b45309' : 'var(--text-muted)', width: '24px' }}>
                    #{user.pos}
                  </span>
                  <div>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{user.name}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Nível {user.level}</div>
                  </div>
                </div>
                <div style={{ color: '#06b6d4', fontWeight: 800, fontSize: '1.05rem' }}>
                  {user.xp} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: EXECUÇÃO DE ATIVIDADE DO PROFESSOR ── */}
      {activeCustomActivity && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#121214', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '16px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                  {activeCustomActivity.subject || 'Atividade da Turma'}
                </span>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0' }}>
                  {activeCustomActivity.title}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Recompensa: ⚡ +{activeCustomActivity.xpReward || 100} XP | 🪙 +{activeCustomActivity.coinReward || 20} Moedas
                </span>
              </div>
              <button
                onClick={() => setActiveCustomActivity(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Theory Box */}
            {activeCustomActivity.theoryContent && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                <strong style={{ color: '#06b6d4', display: 'block', marginBottom: '0.4rem' }}>📖 Fundamentação Teórica:</strong>
                {activeCustomActivity.theoryContent}
              </div>
            )}

            {/* Questions Execution */}
            {activeCustomActivity.questions && activeCustomActivity.questions.length > 0 && !customCompleted ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>Questão {customQIndex + 1} de {activeCustomActivity.questions.length}</span>
                  <span>Acertos: {customScore}</span>
                </div>

                <div style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }}>
                  <p style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {activeCustomActivity.questions[customQIndex].q}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {activeCustomActivity.questions[customQIndex].options.map((opt, oIdx) => {
                      const isSelected = customAnswered === oIdx;
                      const isCorrect = oIdx === activeCustomActivity.questions![customQIndex].answer;
                      let bg = 'rgba(255,255,255,0.03)';
                      let border = '1px solid rgba(255,255,255,0.1)';
                      if (customAnswered !== null) {
                        if (isCorrect) { bg = 'rgba(16,185,129,0.2)'; border = '1px solid #10b981'; }
                        else if (isSelected) { bg = 'rgba(239,68,68,0.2)'; border = '1px solid #ef4444'; }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleCustomQuestionAnswer(oIdx)}
                          style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '8px', background: bg, border, color: 'var(--text-main)', fontSize: '0.88rem', cursor: customAnswered === null ? 'pointer' : 'default', transition: 'all 0.2s' }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback da IA */}
                  {customAnswered !== null && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '6px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      🤖 <strong>Explicação da IA:</strong> {activeCustomActivity.questions[customQIndex].explanation}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleCustomNext}
                    disabled={customAnswered === null}
                    className="btn-gradient"
                    style={{ padding: '0.65rem 1.5rem', fontWeight: 700, opacity: customAnswered === null ? 0.4 : 1 }}
                  >
                    {customQIndex < activeCustomActivity.questions.length - 1 ? 'Próxima Questão →' : 'Finalizar Atividade'}
                  </button>
                </div>
              </div>
            ) : customCompleted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                  Atividade Concluída com Sucesso!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Você acertou {customScore} de {activeCustomActivity.questions?.length} questões e recebeu <strong>+{activeCustomActivity.xpReward || 100} XP</strong> e <strong>+{activeCustomActivity.coinReward || 20} Moedas</strong>!
                </p>
                <button
                  onClick={() => setActiveCustomActivity(null)}
                  className="btn-gradient"
                  style={{ padding: '0.75rem 2rem', fontWeight: 800, fontSize: '0.95rem' }}
                >
                  Continuar Aprendendo
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIGURAÇÃO DA CHAVE GEMINI IA ── */}
      {showGeminiModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '1.75rem', background: '#121214', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Key style={{ width: '1.35rem', height: '1.35rem', color: '#06b6d4' }} />
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Configuração da Chave Google Gemini IA
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Insira sua chave de API para habilitar feedbacks avançados e diagnósticos adaptativos instantâneos nos laboratórios.
            </p>
            <input
              type="password"
              placeholder="Cole sua API Key do Google AI Studio (AIzaSy...)"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem' }}
            />
            {geminiSaved && (
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle style={{ width: '1rem', height: '1rem' }} /> Chave salva com sucesso!
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setShowGeminiModal(false)} className="btn-outline-cyan" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Fechar
              </button>
              <button onClick={handleSaveGeminiKey} className="btn-gradient" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}>
                Salvar Chave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
