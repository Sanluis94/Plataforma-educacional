import { Users, BookOpen, Activity, Shield, TrendingUp, Search } from 'lucide-react';
import { useAdminDashboard } from '../../core/hooks/useAdminDashboard';
import { useState } from 'react';

export function AdminPanel() {
  const {
    activeTab,
    setActiveTab,
    teachers,
    logs,
    stats
  } = useAdminDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const { totalStudents, totalClasses, totalTeachers, totalActivities } = stats;

  const statCards = [
    { icon: Users, label: 'Estudantes', value: totalStudents, accent: 'cyan' as const },
    { icon: BookOpen, label: 'Turmas Ativas', value: totalClasses, accent: 'violet' as const },
    { icon: Activity, label: 'Professores', value: totalTeachers, accent: 'cyan' as const },
    { icon: TrendingUp, label: 'Atividades', value: totalActivities, accent: 'violet' as const },
  ];

  const tabs = [
    { id: 'overview' as const, label: '📊 Visão Geral' },
    { id: 'teachers' as const, label: '👩‍🏫 Professores' },
    { id: 'logs' as const, label: '🔐 Logs de Segurança' },
  ];

  const filteredTeachers = searchQuery
    ? teachers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : teachers;

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{
          width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-sm, 10px)',
          background: 'var(--color-verde-light, rgba(41, 62, 36, 0.15))', border: '1px solid var(--color-verde-500, #3D5B36)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-verde-700, #293E24)' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>Painel Administrativo</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Visão global da instituição, professores e logs de segurança.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`stat-card ${stat.accent}`} style={{ borderRadius: 'var(--radius-lg, 14px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Icon style={{ width: '1.25rem', height: '1.25rem', color: stat.accent === 'cyan' ? 'var(--color-primary-accessible, #B8441F)' : 'var(--color-verde-700, #293E24)' }} />
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{stat.value}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)', paddingBottom: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary, #E4683F)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.875rem', transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="glass-card fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg, 14px)' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Distribuição de Estudantes por Professor
          </h3>
          {teachers.length > 0 ? teachers.map((t, i) => (
            <div key={i} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{t.name}</span>
                <span>{t.students} alunos</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${totalStudents > 0 ? (t.students / totalStudents) * 100 : 0}%`, background: 'var(--gradient-primary)' }} />
                </div>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              Nenhum professor cadastrado ainda.
            </p>
          )}
        </div>
      )}

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="fade-in">
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search style={{
              position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
              width: '1.1rem', height: '1.1rem', color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="Buscar professores..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-sm, 10px)' }}
            />
          </div>

          {/* Desktop Table */}
          <div className="glass-card" style={{ padding: '0.5rem', overflow: 'hidden', borderRadius: 'var(--radius-lg, 14px)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Professor(a)</th>
                    <th>Email</th>
                    <th style={{ textAlign: 'center' }}>Turmas</th>
                    <th style={{ textAlign: 'center' }}>Estudantes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-main)', fontWeight: 600 }}>{t.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.email}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-main)' }}>{t.classes}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700 }}>{t.students}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        {searchQuery ? 'Nenhum professor encontrado.' : 'Nenhum professor cadastrado.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {logs.length > 0 ? logs.map((log: any, i: number) => {
            const colors: Record<string, string> = { auth: 'var(--color-primary-accessible, #B8441F)', ai: 'var(--color-verde-700, #293E24)', error: 'var(--color-vermelho, #BC391F)' };
            const color = colors[log.type] || 'var(--text-muted)';
            return (
              <div key={i} className="glass-card" style={{
                display: 'flex', gap: '1rem', padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm, 10px)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap', alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace', flexShrink: 0 }}>
                  {log.time}
                </span>
                <span style={{
                  background: 'var(--bg-glass)', color: color, padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm, 10px)', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                  border: `1px solid ${color}`,
                }}>
                  {log.typeLabel}
                </span>
                <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.5, flex: 1, minWidth: '200px' }}>
                  {log.message}
                </span>
              </div>
            );
          }) : (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-lg, 14px)' }}>
              Nenhum log registrado.
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1rem', textAlign: 'center' }}>
            Logs de segurança são armazenados no Firestore com retenção de 30 dias.
          </p>
        </div>
      )}

      {/* Permissions Section */}
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Permissões por Função</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Admin', icon: Shield, color: 'var(--color-vermelho, #BC391F)', perms: ['Acesso total ao sistema', 'Gerenciar usuários', 'Configurações globais'] },
            { title: 'Professor', icon: Users, color: 'var(--color-verde-700, #293E24)', perms: ['Visualizar métricas', 'Gerenciar turmas', 'Criar laboratórios'] },
            { title: 'Aluno', icon: BookOpen, color: 'var(--color-primary-accessible, #B8441F)', perms: ['Acessar laboratórios', 'Ver progresso próprio', 'Conquistar badges'] },
          ].map(role => {
            const Icon = role.icon;
            return (
              <div key={role.title} style={{
                padding: '1.5rem', borderRadius: 'var(--radius-lg, 14px)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-glass)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-sm, 10px)',
                    background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', border: `1px solid ${role.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '1.25rem', height: '1.25rem', color: role.color }} />
                  </div>
                  <h4 style={{ color: 'var(--text-main)', fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)' }}>{role.title}</h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0 }}>
                  {role.perms.map(perm => (
                    <li key={perm} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>• {perm}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
