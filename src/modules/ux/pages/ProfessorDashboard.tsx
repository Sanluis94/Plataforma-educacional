import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PlusCircle, Users, BookOpen, BarChart as BarChartIcon, TrendingUp, Award, Eye, Trash2, Download, ListTodo } from 'lucide-react';
import { useProfessorDashboard } from '../../core/hooks/useProfessorDashboard';

export function ProfessorDashboard() {
  const {
    turmas,
    activities,
    isCreatingClass,
    setIsCreatingClass,
    newClassName,
    setNewClassName,
    activeTab,
    setActiveTab,
    selectedClassId,
    setSelectedClassId,
    classReport,
    reportLoading,
    builderStep,
    setBuilderStep,
    activityConfig,
    setActivityConfig,
    handleCreateClass,
    handleViewClassReport,
    publishActivity,
    handleDeleteActivity,
    exportReportCSV,
    globalStats,
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
    { label: 'Taxa de Conclusão', value: `${globalStats.completionRate}%`, icon: Award, accent: 'cyan' as const },
    { label: 'Engajamento', value: `${globalStats.engagement}%`, icon: TrendingUp, accent: 'violet' as const },
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
                <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px dashed var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Código da Turma: <strong style={{ color: 'var(--text-main)', letterSpacing: '0.5px' }}>{turma.id}</strong>
                </div>
                <button
                  className="btn-outline-violet"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem' }}
                  onClick={() => handleViewClassReport(turma.id)}
                >
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

        <div
          className="glass-card"
          style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.3s' }}
          onClick={() => setActiveTab('activities')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.5rem',
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ListTodo style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.25rem' }}>Minhas Atividades ({activities.length})</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Gerencie atividades publicadas</p>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'reports' && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Relatório da Turma
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Indicadores consolidados pelo ETL local para apoiar acompanhamento pedagógico.
              </p>
            </div>
            <button className="btn-outline-violet" style={{ padding: '0.45rem 0.9rem' }} onClick={() => setActiveTab('classes')}>
              Fechar
            </button>
            {classReport && (
              <button className="btn-gradient" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }} onClick={exportReportCSV}>
                <Download style={{ width: '0.85rem', height: '0.85rem' }} /> Exportar CSV
              </button>
            )}
          </div>

          {turmas.length > 0 && (
            <div style={{ maxWidth: '420px', marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                Turma analisada
              </label>
              <select
                value={selectedClassId ?? turmas[0]?.id ?? ''}
                onChange={(event) => setSelectedClassId(event.target.value)}
              >
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>{turma.name}</option>
                ))}
              </select>
            </div>
          )}

          {reportLoading && (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Carregando relatório...</div>
          )}

          {!reportLoading && !classReport && (
            <div style={{ padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Nenhum relatório encontrado. Rode <code>npm run etl</code> para gerar os dados locais.
            </div>
          )}

          {!reportLoading && classReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Alunos', value: classReport.studentsCount },
                  { label: 'Atividades', value: classReport.activitiesCount },
                  { label: 'Média geral', value: `${classReport.averageScore}%` },
                  { label: 'Conclusão', value: `${classReport.completionRate}%` },
                ].map((metric) => (
                  <div key={metric.label} className="stat-card cyan">
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>{metric.label}</p>
                    <strong style={{ color: 'var(--text-main)', fontSize: '1.55rem' }}>{metric.value}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-card)', background: 'rgba(255,255,255,0.03)' }}>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.45rem' }}>{classReport.className}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Professor(a): {classReport.professorName}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Módulo de maior engajamento: <strong>{classReport.topModule}</strong></p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tempo médio por atividade: <strong>{classReport.averageTimeSpentMinutes} min</strong></p>
                </div>

                <div style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${classReport.atRiskStudents.length ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)'}`,
                  background: classReport.atRiskStudents.length ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                }}>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.45rem' }}>
                    {classReport.atRiskStudents.length ? 'Atenção pedagógica' : 'Turma estável'}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {classReport.atRiskStudents.length
                      ? `${classReport.atRiskStudents.join(', ')} precisam de apoio.`
                      : 'Nenhum aluno abaixo do limiar de acompanhamento.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                <div>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.75rem' }}>Desempenho por aluno</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {classReport.students.map((student) => (
                      <div key={student.studentId} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(120px, 1fr) repeat(3, auto)',
                        gap: '0.75rem',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '0.6rem',
                        border: '1px solid var(--border-card)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.82rem',
                      }}>
                        <strong style={{ color: 'var(--text-main)' }}>{student.studentName}</strong>
                        <span>Nível {student.level}</span>
                        <span>{student.averageScore}%</span>
                        <span style={{
                          color: student.status === 'precisa_apoio' ? '#f59e0b' : student.status === 'em_destaque' ? '#10b981' : 'var(--text-muted)',
                          fontWeight: 600,
                        }}>
                          {student.status === 'precisa_apoio' ? 'Apoio' : student.status === 'em_destaque' ? 'Destaque' : 'Regular'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.75rem' }}>Engajamento por módulo</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {classReport.modules.map((module) => (
                      <div key={module.module} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(120px, 1fr) repeat(2, auto)',
                        gap: '0.75rem',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '0.6rem',
                        border: '1px solid var(--border-card)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.82rem',
                      }}>
                        <strong style={{ color: 'var(--text-main)' }}>{module.module}</strong>
                        <span>{module.eventsCount} entregas</span>
                        <span>{module.averageScore}% média</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Builder Modal */}
      {activeTab === 'activityBuilder' && (
        <div className="fade-in" style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '1000px', height: '80vh', display: 'flex', flexDirection: 'column',
            borderRadius: '1rem', background: 'var(--bg-card)', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Builder Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600 }}>
                  Construtor de Experiências Estúdio
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Passo {builderStep} de 3</p>
              </div>
              <button onClick={() => setActiveTab('classes')} style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-main)', cursor: 'pointer',
                width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}>✕</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Controls Panel */}
              <div style={{ flex: '1 1 55%', padding: '2rem', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
                {builderStep === 1 && (
                  <div className="fade-in">
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Selecione o tipo de laboratório</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                      {[
                        { type: 'simulation_physics', title: '🔭 Física Avançada', desc: 'Gravidade, Cinemática e Colisões', config: { gravity: 9.8 } },
                        { type: 'simulation_chemistry', title: '🧪 Laboratório Químico', desc: 'Reações e Titulação', config: { reagents: [] } },
                        { type: 'simulation_biology', title: '🔬 Microscópio Virtual', desc: 'Análise Celular e Genética', config: { microscopeZoom: 10 } },
                        { type: 'simulation_math', title: '📐 Álgebra e Geometria', desc: 'Visualização de Funções e Gráficos', config: { functionType: 'linear', allowGraphing: true } },
                        { type: 'professional_training', title: '💼 Treinamento', desc: 'Soft skills e Liderança Corporativa', config: { skillLevel: 'iniciante' } },
                        { type: 'quiz', title: '📝 Avaliação Adaptativa', desc: 'Questões com Inteligência Artificial', config: { difficulty: 'adaptative' } },
                      ].map(item => (
                        <div
                          key={item.type}
                          onClick={() => setActivityConfig({ ...activityConfig, type: item.type, config: item.config })}
                          style={{
                            padding: '1.25rem', borderRadius: '0.85rem', cursor: 'pointer',
                            border: activityConfig.type === item.type ? '2px solid #06b6d4' : '1px solid var(--border-card)',
                            background: activityConfig.type === item.type ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.2s', transform: activityConfig.type === item.type ? 'translateY(-2px)' : 'none',
                            boxShadow: activityConfig.type === item.type ? '0 10px 20px -10px rgba(6,182,212,0.3)' : 'none'
                          }}
                        >
                          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>{item.title}</h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {builderStep === 2 && (
                  <div className="fade-in">
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Parametrização da Experiência</h3>
                    
                    <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Título da Atividade</label>
                      <input type="text" value={activityConfig.title} onChange={e => setActivityConfig({ ...activityConfig, title: e.target.value })} placeholder="Ex: Explorando Leis de Newton" style={{ width: '100%', fontSize: '1rem', padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-card)', borderRadius: '0.5rem', color: 'var(--text-main)' }} />
                    </div>

                    {activityConfig.type === 'simulation_physics' && (
                      <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gravidade Simulada (m/s²)</label>
                          <span style={{ color: '#06b6d4', fontWeight: 600 }}>{activityConfig.config.gravity}</span>
                        </div>
                        <input type="range" min="1" max="25" value={activityConfig.config.gravity || 9.8} onChange={e => setActivityConfig({ ...activityConfig, config: { gravity: parseFloat(e.target.value) } })} step="0.1" style={{ width: '100%', accentColor: '#06b6d4' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>Lua (1.6)</span><span>Terra (9.8)</span><span>Júpiter (24.7)</span>
                        </div>
                      </div>
                    )}

                    {activityConfig.type === 'simulation_math' && (
                      <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Categoria da Função</label>
                        <select style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-card)', borderRadius: '0.5rem', color: 'var(--text-main)', fontSize: '0.95rem' }} value={activityConfig.config.functionType} onChange={e => setActivityConfig({ ...activityConfig, config: { ...activityConfig.config, functionType: e.target.value } })}>
                          <option value="linear">Linear (1º Grau)</option>
                          <option value="quadratic">Quadrática (2º Grau)</option>
                          <option value="trigonometric">Trigonométrica</option>
                        </select>
                      </div>
                    )}
                    
                    {['simulation_physics', 'simulation_math'].indexOf(activityConfig.type) === -1 && (
                       <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', textAlign: 'center' }}>
                         Configurações avançadas para este laboratório estão sendo implementadas. O título e a turma já são suficientes para publicação!
                       </div>
                    )}
                  </div>
                )}

                {builderStep === 3 && (
                  <div className="fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', marginBottom: '1.5rem' }}>
                      <BookOpen style={{ width: '2rem', height: '2rem' }} />
                    </div>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.25rem' }}>Tudo Pronto!</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                      A atividade <strong style={{ color: 'var(--text-main)' }}>{activityConfig.title || 'Sem título'}</strong> está configurada.
                      Ao publicar, ela será enviada instantaneamente para os dashboards dos alunos matriculados e liberada para consumo.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Preview Panel */}
              <div style={{ flex: '1 1 45%', background: 'var(--bg-main)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>Live Preview Visual</h3>
                
                <div style={{ flex: 1, borderRadius: '1rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.25rem 0.75rem', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {activityConfig.type.replace('_', ' ')}
                  </div>
                  
                  {activityConfig.type === 'simulation_physics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '2px', height: '60px', background: '#06b6d4', borderStyle: 'dashed' }}></div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, #06b6d4 0%, #8b5cf6 100%)', boxShadow: '0 0 20px rgba(6,182,212,0.4)', marginTop: '-2px' }}></div>
                      <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Pêndulo (Grav: {activityConfig.config.gravity || 9.8} m/s²)</p>
                    </div>
                  )}

                  {activityConfig.type === 'simulation_chemistry' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#00bcd4' }}>
                      <span style={{ fontSize: '3rem' }}>🧪</span>
                      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Laboratório Químico</p>
                    </div>
                  )}

                  {activityConfig.type === 'simulation_math' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#7c4dff', width: '100%' }}>
                      <div style={{ width: '100%', height: '80px', borderBottom: '2px solid rgba(255,255,255,0.1)', borderLeft: '2px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                          <path d="M0,100 C30,20 70,80 100,0" fill="none" stroke="#7c4dff" strokeWidth="3" />
                        </svg>
                      </div>
                      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Gráfico: {activityConfig.config.functionType}</p>
                    </div>
                  )}
                  
                  {['simulation_physics', 'simulation_math', 'simulation_chemistry'].indexOf(activityConfig.type) === -1 && (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <span style={{ fontSize: '3rem' }}>✨</span>
                       <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>Design Adaptativo em Construção<br/>Sua atividade ficará linda.</p>
                     </div>
                  )}

                  <div style={{ position: 'absolute', bottom: '1.5rem', width: '80%', textAlign: 'center', color: 'var(--text-main)', fontWeight: 600, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activityConfig.title || 'Sem Título Definido'}
                  </div>
                </div>
              </div>
            </div>

            {/* Builder Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <button
                onClick={() => setBuilderStep(b => b - 1)}
                disabled={builderStep === 1}
                className="btn-outline-violet"
                style={{ opacity: builderStep === 1 ? 0.3 : 1, padding: '0.6rem 1.5rem', cursor: builderStep === 1 ? 'not-allowed' : 'pointer' }}
              >
                Passo Anterior
              </button>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3].map(step => (
                  <div key={step} style={{ width: '2rem', height: '0.35rem', borderRadius: '99px', background: step <= builderStep ? '#06b6d4' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
              </div>

              {builderStep < 3 ? (
                <button onClick={() => setBuilderStep(b => b + 1)} className="btn-gradient" style={{ padding: '0.6rem 1.5rem' }}>
                  Próximo Passo
                </button>
              ) : (
                <button onClick={publishActivity} className="btn-gradient" style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award style={{ width: '1.1rem', height: '1.1rem' }} /> Publicar Atividade
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activities Listing */}
      {activeTab === 'activities' && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Minhas Atividades</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{activities.length} atividade(s) publicada(s)</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-gradient" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setActiveTab('activityBuilder')}>
                <PlusCircle style={{ width: '1rem', height: '1rem' }} /> Nova Atividade
              </button>
              <button className="btn-outline-violet" style={{ padding: '0.45rem 0.9rem' }} onClick={() => setActiveTab('classes')}>
                Fechar
              </button>
            </div>
          </div>

          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.map(activity => (
                <div key={activity.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem',
                  alignItems: 'center', padding: '1rem', borderRadius: '0.75rem',
                  border: '1px solid var(--border-card)', background: 'rgba(255,255,255,0.02)',
                }}>
                  <div>
                    <h4 style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      {activity.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '9999px',
                        fontSize: '0.7rem', fontWeight: 600,
                        color: '#06b6d4', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
                      }}>{activity.type}</span>
                      <span style={{
                        display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '9999px',
                        fontSize: '0.7rem', fontWeight: 600,
                        color: activity.status === 'published' ? '#10b981' : '#f59e0b',
                        background: activity.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${activity.status === 'published' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}>{activity.status === 'published' ? 'Publicada' : 'Rascunho'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => activity.id && handleDeleteActivity(activity.id)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    aria-label={`Excluir atividade ${activity.title}`}
                  >
                    <Trash2 style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <BookOpen style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>Nenhuma atividade criada. Clique em "Nova Atividade" para começar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfessorDashboard;
