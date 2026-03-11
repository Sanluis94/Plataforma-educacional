import { useState } from 'react';
import { Users, BookOpen, Activity, Shield, TrendingUp } from 'lucide-react';

interface Teacher {
  name: string; email: string; classes: number; students: number;
}
interface LogEntry {
  time: string; type: 'auth' | 'ai' | 'error'; message: string;
}

const MOCK_TEACHERS: Teacher[] = [
  { name: 'Profa. Ana Lima', email: 'ana@escola.edu.br', classes: 3, students: 87 },
  { name: 'Prof. Carlos Melo', email: 'carlos@escola.edu.br', classes: 2, students: 61 },
  { name: 'Profa. Fernanda Costa', email: 'fernanda@escola.edu.br', classes: 4, students: 112 },
];
const MOCK_LOGS: LogEntry[] = [
  { time: '14:32:01', type: 'auth', message: 'Login via Google — ana@escola.edu.br (Professor)' },
  { time: '14:35:10', type: 'ai', message: 'Gemini API chamada — Recomendação adaptativa para estudante #1041' },
  { time: '14:40:05', type: 'auth', message: 'Login via Google — joao.silva@escola.edu.br (Estudante)' },
  { time: '14:41:33', type: 'ai', message: 'Gemini API — Cache HIT para perfil level=5 (sem chamada à API)' },
  { time: '14:55:00', type: 'error', message: 'Tentativa de acessar dados sem autenticação — IP 192.168.1.45 bloqueado' },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'logs'>('overview');

  const totalStudents = MOCK_TEACHERS.reduce((s, t) => s + t.students, 0);
  const totalClasses = MOCK_TEACHERS.reduce((s, t) => s + t.classes, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Shield size={28} style={{ color: 'var(--color-primary)' }} />
        <div>
          <h1 style={{ color: 'var(--text-main)', margin: 0 }}>Painel do Administrador</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Visão global da institução, professores e logs de segurança.</p>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { icon: <Users size={20} />, label: 'Estudantes', value: totalStudents, color: '#42a5f5' },
          { icon: <BookOpen size={20} />, label: 'Turmas Ativas', value: totalClasses, color: '#66bb6a' },
          { icon: <Activity size={20} />, label: 'Professores', value: MOCK_TEACHERS.length, color: '#ffa726' },
          { icon: <TrendingUp size={20} />, label: 'Interações de IA (hoje)', value: 247, color: '#7c4dff' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem', border: `1px solid ${stat.color}22` }}>
            <div style={{ color: stat.color, marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stat.value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0' }}>
        {[
          { id: 'overview', label: '📊 Visão Geral' },
          { id: 'teachers', label: '👩‍🏫 Professores' },
          { id: 'logs', label: '🔐 Logs de Segurança' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal', fontSize: '0.88rem', transition: 'all 0.2s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Distribuição de Estudantes por Professor</h3>
          {MOCK_TEACHERS.map((t, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span>{t.name}</span>
                <span>{t.students} alunos</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                <div style={{ height: '100%', borderRadius: '4px', background: 'var(--color-primary)',
                  width: `${(t.students / totalStudents) * 100}%`, transition: 'width 0.6s' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teachers table */}
      {activeTab === 'teachers' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: '600' }}>Professor(a)</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>Turmas</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '600' }}>Estudantes</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TEACHERS.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '0.9rem 0.5rem', color: 'var(--text-main)', fontWeight: '500' }}>{t.name}</td>
                  <td style={{ padding: '0.9rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.email}</td>
                  <td style={{ padding: '0.9rem 0.5rem', textAlign: 'center', color: 'var(--text-main)' }}>{t.classes}</td>
                  <td style={{ padding: '0.9rem 0.5rem', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 'bold' }}>{t.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Security logs */}
      {activeTab === 'logs' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MOCK_LOGS.map((log, i) => {
              const colors = { auth: '#42a5f5', ai: '#7c4dff', error: '#ef5350' };
              return (
                <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: `1px solid ${colors[log.type]}22` }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'monospace', flexShrink: 0 }}>{log.time}</span>
                  <span style={{ background: `${colors[log.type]}22`, color: colors[log.type], padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold', flexShrink: 0, alignSelf: 'flex-start' }}>
                    {log.type.toUpperCase()}
                  </span>
                  <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: '1.5' }}>{log.message}</span>
                </div>
              );
            })}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '1rem', textAlign: 'center' }}>
            Logs de segurança são armazenados no Firestore com retenção de 30 dias.
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
