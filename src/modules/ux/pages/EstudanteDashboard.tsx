import { useState } from 'react';
import { Star, Award, BrainCircuit, Beaker, TrendingUp, Trophy, ShoppingBag, BookOpen } from 'lucide-react';
import { useStudentDashboard } from '../../core/hooks/useStudentDashboard';
import { SUBJECT_THEMES } from '../../core/constants/dashboardConstants';

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
    { id: 'shop' as const, label: 'Loja', icon: ShoppingBag },
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            onComplete={handleModuleComplete}
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
            padding: '1rem 1.25rem', borderRadius: '0.75rem',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)',
          }}>
            <BrainCircuit style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '0.05em' }}>IA ADAPTATIVA</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, lineHeight: 1.7 }}>{aiTip}</p>
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
                    <span style={{ cursor: 'pointer', color: '#06b6d4' }} onClick={() => setActiveView('learning')}>Ver Atividades →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
              <p>Você ainda não está matriculado em nenhuma turma.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EstudanteDashboard;
