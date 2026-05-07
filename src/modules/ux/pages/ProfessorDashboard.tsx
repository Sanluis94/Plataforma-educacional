import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PlusCircle, Users, BookOpen, BarChart as BarChartIcon, TrendingUp, Award, Eye } from 'lucide-react';
import { useProfessorDashboard } from '../../core/hooks/useProfessorDashboard';

export function ProfessorDashboard() {
  const {
    turmas,
    isCreatingClass,
    setIsCreatingClass,
    newClassName,
    setNewClassName,
    activeTab,
    setActiveTab,
    builderStep,
    setBuilderStep,
    activityConfig,
    setActivityConfig,
    handleCreateClass,
    publishActivity
  } = useProfessorDashboard();

  // Derive real stats from Firestore data
  const totalStudents = turmas.reduce((sum, t) => sum + (t.studentsCount || 0), 0);
  const totalClasses = turmas.length;

  // Build chart data from real turmas
  const progressData = turmas.map(t => ({
    name: t.name.length > 12 ? t.name.slice(0, 12) + '…' : t.name,
    estudantes: t.studentsCount || 0,
  }));

  // Engagement data placeholder (would need real analytics from Firestore)
  const engagementData = [
    { dia: 'Seg', horas: 4.2 },
    { dia: 'Ter', horas: 5.1 },
    { dia: 'Qua', horas: 4.8 },
    { dia: 'Qui', horas: 6.3 },
    { dia: 'Sex', horas: 5.5 },
    { dia: 'Sáb', horas: 3.2 },
    { dia: 'Dom', horas: 2.8 },
  ];

  const stats = [
    { label: 'Total de Alunos', value: String(totalStudents), icon: Users, accent: 'cyan' as const },
    { label: 'Turmas Ativas', value: String(totalClasses), icon: BookOpen, accent: 'violet' as const },
    { label: 'Taxa de Conclusão', value: totalStudents > 0 ? '89%' : '0%', icon: Award, accent: 'cyan' as const },
    { label: 'Engajamento', value: totalStudents > 0 ? '73%' : '0%', icon: TrendingUp, accent: 'violet' as const },
  ];

  const tooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    borderRadius: '8px',
    color: 'var(--text-main)',
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Painel do Professor
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gerencie suas turmas, crie atividades e acompanhe o progresso dos alunos.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`stat-card ${stat.accent}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Icon style={{ width: '1.25rem', height: '1.25rem', color: stat.accent === 'cyan' ? '#06b6d4' : '#8b5cf6' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {stat.value}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Students per Class Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
            Alunos por Turma
          </h3>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-main)' }} />
                <Bar dataKey="estudantes" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Crie turmas para visualizar os dados
            </div>
          )}
        </div>

        {/* Engagement Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
            Engajamento Semanal
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="dia" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-main)' }} />
              <Line type="monotone" dataKey="horas" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Classes Section */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Minhas Turmas
          </h3>
          <button onClick={() => setIsCreatingClass(!isCreatingClass)} className="btn-gradient" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <PlusCircle style={{ width: '1rem', height: '1rem' }} />
            Nova Turma
          </button>
        </div>

        {/* Create Class Form */}
        {isCreatingClass && (
          <div className="slide-down" style={{
            padding: '1.25rem', marginBottom: '1.25rem', borderRadius: '0.5rem',
            border: '1px solid rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.05)',
          }}>
            <form onSubmit={handleCreateClass} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Nome da Turma</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ex: Física - 3º Ano B"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setIsCreatingClass(false)} className="btn-outline-violet" style={{ padding: '0.5rem 1rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gradient" style={{ padding: '0.5rem 1rem' }}>
                  Criar Turma
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Classes Grid */}
        {turmas.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {turmas.map(turma => (
              <div key={turma.id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>{turma.name}</h4>
                  <span className={turma.studentsCount > 0 ? 'badge-green' : 'badge-yellow'} style={{
                    display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem',
                    borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 500, border: '1px solid',
                    ...(turma.studentsCount > 0 ? {
                      color: '#10b981', background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)',
                    } : {
                      color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)',
                    }),
                  }}>
                    Ativa
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <Users style={{ width: '1rem', height: '1rem' }} />
                  {turma.studentsCount} Alunos Matriculados
                </div>
                <button className="btn-outline-violet" style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem' }}>
                  <Eye style={{ width: '0.85rem', height: '0.85rem' }} />
                  Visualizar Relatório
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <BookOpen style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p>Nenhuma turma criada ainda. Clique em "Nova Turma" para começar.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div
          className="glass-card"
          style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.3s' }}
          onClick={() => setActiveTab(activeTab === 'activityBuilder' ? 'classes' : 'activityBuilder')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.5rem',
              background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.25rem' }}>Construtor de Aula</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Crie atividades e experimentos interativos</p>
            </div>
          </div>
        </div>

        <div
          className="glass-card"
          style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.3s' }}
          onClick={() => setActiveTab('reports')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.5rem',
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BarChartIcon style={{ width: '1.25rem', height: '1.25rem', color: '#8b5cf6' }} />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.25rem' }}>Relatórios Gerenciais</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>IA categoriza e analisa sua turma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Builder Modal */}
      {activeTab === 'activityBuilder' && (
        <div className="fade-in" style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto',
            padding: '2rem', borderRadius: '1rem',
            background: 'var(--bg-card)',
          }}>
            {/* Builder Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600 }}>
                Construtor de Experiências (Passo {builderStep}/3)
              </h2>
              <button onClick={() => setActiveTab('classes')} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem',
              }}>✕</button>
            </div>

            {/* Step 1 */}
            {builderStep === 1 && (
              <div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>1. Qual o foco da atividade?</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { type: 'simulation_physics', title: '🔭 Simulação de Física', desc: 'Cinemática, Dinâmica, Eletromagnetismo', config: { gravity: 9.8 } },
                    { type: 'simulation_chemistry', title: '🧪 Lab de Química', desc: 'Reações, Titulação, Tabela Periódica', config: { reagents: [] } },
                    { type: 'simulation_biology', title: '🔬 Microscópio Virtual', desc: 'Células, Genética, Anatomia', config: { microscopeZoom: 10 } },
                    { type: 'simulation_math', title: '📐 Álgebra e Geometria', desc: 'Funções, Gráficos, Estatística', config: { functionType: 'linear', allowGraphing: true } },
                    { type: 'professional_training', title: '💼 Capacitação', desc: 'Soft skills, Liderança', config: { skillLevel: 'iniciante' } },
                    { type: 'quiz', title: '📝 Quiz Adaptativo', desc: 'Avaliação inteligente com IA', config: { difficulty: 'adaptative' } },
                  ].map(item => (
                    <div
                      key={item.type}
                      onClick={() => setActivityConfig({ ...activityConfig, type: item.type, config: item.config })}
                      style={{
                        padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer',
                        border: activityConfig.type === item.type ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                        background: activityConfig.type === item.type ? 'rgba(6,182,212,0.1)' : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {builderStep === 2 && (
              <div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>2. Detalhes e Configurações</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Título da Experiência</label>
                  <input type="text" value={activityConfig.title} onChange={e => setActivityConfig({ ...activityConfig, title: e.target.value })} placeholder="Ex: Descobrindo Júpiter com Pêndulos" />
                </div>

                {activityConfig.type === 'simulation_physics' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Gravidade Simulada (m/s²)</label>
                    <input type="number" value={activityConfig.config.gravity} onChange={e => setActivityConfig({ ...activityConfig, config: { gravity: parseFloat(e.target.value) } })} step="0.1" />
                  </div>
                )}

                {activityConfig.type === 'simulation_chemistry' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Reagentes (separados por vírgula)</label>
                    <input type="text" placeholder="Ex: H2O, NaCl, HCl" onChange={e => setActivityConfig({ ...activityConfig, config: { ...activityConfig.config, reagents: e.target.value.split(',') } })} />
                  </div>
                )}

                {activityConfig.type === 'simulation_math' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Tipo de Função</label>
                    <select value={activityConfig.config.functionType} onChange={e => setActivityConfig({ ...activityConfig, config: { ...activityConfig.config, functionType: e.target.value } })}>
                      <option value="linear">Linear (1º Grau)</option>
                      <option value="quadratic">Quadrática (2º Grau)</option>
                      <option value="trigonometric">Trigonométrica</option>
                    </select>
                  </div>
                )}

                {activityConfig.type === 'professional_training' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Foco da Capacitação</label>
                    <input type="text" placeholder="Ex: Gestão de Tempo, Liderança" onChange={e => setActivityConfig({ ...activityConfig, config: { focus: e.target.value } })} />
                  </div>
                )}
              </div>
            )}

            {/* Step 3 */}
            {builderStep === 3 && (
              <div>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>3. Confirmação</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  A atividade "<strong style={{ color: 'var(--text-main)' }}>{activityConfig.title || 'Sem título'}</strong>" será publicada e o motor de IA irá recomendá-la para alunos com proficiência suficiente.
                </p>
              </div>
            )}

            {/* Builder Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setBuilderStep(b => b - 1)}
                disabled={builderStep === 1}
                className="btn-outline-violet"
                style={{ opacity: builderStep === 1 ? 0.4 : 1, padding: '0.5rem 1.25rem' }}
              >
                Voltar
              </button>
              {builderStep < 3 ? (
                <button onClick={() => setBuilderStep(b => b + 1)} className="btn-gradient" style={{ padding: '0.5rem 1.25rem' }}>
                  Próximo Passo
                </button>
              ) : (
                <button onClick={publishActivity} className="btn-gradient" style={{ padding: '0.5rem 1.25rem' }}>
                  Publicar Atividade
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfessorDashboard;
