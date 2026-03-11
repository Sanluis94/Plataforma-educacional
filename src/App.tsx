import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import type { GradeLevel } from './contexts/AuthContext';
import { GRADE_LABELS } from './contexts/AuthContext';
import './index.css';

// Lazy load pages
const ProfessorDashboard = lazy(() => import('./pages/ProfessorDashboard').then(m => ({ default: m.ProfessorDashboard })));
const EstudanteDashboard = lazy(() => import('./pages/EstudanteDashboard').then(m => ({ default: m.EstudanteDashboard })));
const Simulacao = lazy(() => import('./pages/Simulacao').then(m => ({ default: m.Simulacao })));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
    <div className="premium-loader"></div>
  </div>
);

// ---- Login Modal Component ----
function LoginModal({ onClose }: { onClose: () => void }) {
  const { loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'estudante' | 'professor'>('estudante');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('medio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(selectedRole, selectedGrade);
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Login cancelado. Tente novamente e conclua o processo na janela do Google.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domínio não autorizado. Adicione "localhost" nos Authorized Domains no Firebase Console → Authentication → Settings.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In não está ativado. Acesse Firebase Console → Authentication → Sign-in method → Google → Ativar.');
      } else if (code === 'auth/invalid-api-key' || !code) {
        setError('Firebase não está configurado ou a chave da API é inválida. Verifique o arquivo .env.');
      } else {
        setError(`Erro ao fazer login: ${code}`);
      }
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-secondary)', borderRadius: '16px', padding: '2rem',
        width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Entrar na Plataforma</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Selecione seu perfil para continuar</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['estudante', 'professor'] as const).map(role => (
            <button key={role} onClick={() => setSelectedRole(role)}
              style={{
                padding: '0.9rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: selectedRole === role ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                color: selectedRole === role ? 'white' : 'var(--text-secondary)',
                fontWeight: selectedRole === role ? 'bold' : 'normal',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{role === 'estudante' ? '🎓' : '👨‍🏫'}</div>
              <div style={{ fontSize: '0.88rem' }}>{role === 'estudante' ? 'Sou Estudante' : 'Sou Professor'}</div>
            </button>
          ))}
        </div>

        {/* Grade/Segment selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>
            {selectedRole === 'estudante' ? 'Minha turma pertence a:' : 'Vou lecionar para:'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setSelectedGrade(key)}
                style={{
                  textAlign: 'left', padding: '0.65rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
                  background: selectedGrade === key ? 'rgba(var(--color-primary-rgb),0.15)' : 'rgba(255,255,255,0.04)',
                  border: selectedGrade === key ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                  color: selectedGrade === key ? 'var(--color-primary)' : 'var(--text-main)',
                  fontSize: '0.85rem', fontWeight: selectedGrade === key ? '600' : 'normal',
                  transition: 'all 0.2s',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{
            width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', fontSize: '0.95rem',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
          }}>
          {loading ? '⏳ Entrando...' : '🚀 Entrar com Google'}
        </button>

        {error && (
          <div style={{
            marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px',
            background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.35)',
            color: '#ef9a9a', fontSize: '0.8rem', lineHeight: '1.5',
          }}>
            ⚠️ {error}
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
          Seus dados são armazenados com segurança no Firebase.
        </p>
      </div>
    </div>
  );
}

// ---- Smart Navbar ----
function Navbar({ theme, onThemeToggle, onLoginOpen }: {
  theme: string; onThemeToggle: () => void; onLoginOpen: () => void;
}) {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Role-aware nav links
  const navLinks = currentUser && userData ? (() => {
    if (userData.role === 'professor') return [
      { to: '/professor', label: '🏫 Minhas Turmas' },
      { to: '/simulacao', label: '⚗️ Laboratórios' },
      { to: '/admin', label: '📊 Relatórios', adminOnly: true },
    ];
    if (userData.role === 'admin') return [
      { to: '/admin', label: '🛡️ Painel Admin' },
    ];
    return [
      { to: '/estudante', label: '📚 Meu Aprendizado' },
      { to: '/simulacao', label: '⚗️ Laboratórios' },
    ];
  })() : [
    { to: '/', label: 'Início' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem', height: '60px',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ fontSize: '1.4rem' }}>🎓</span>
        <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>EduPlataforma</span>
      </Link>

      {/* Nav links (desktop) */}
      <nav style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
        {navLinks.map(link => (
          <Link key={link.to} to={link.to}
            style={{
              padding: '0.4rem 0.8rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem',
              fontWeight: isActive(link.to) ? 'bold' : 'normal',
              color: isActive(link.to) ? 'var(--color-primary)' : 'var(--text-secondary)',
              background: isActive(link.to) ? 'rgba(var(--color-primary-rgb),0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button onClick={onThemeToggle}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem' }}
          title="Alternar tema">
          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '⚡'}
        </button>

        {currentUser && userData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                {userData.name?.split(' ')[0] || 'Usuário'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {userData.role === 'professor' ? '👨‍🏫 Professor' : '🎓 Estudante'} · {GRADE_LABELS[userData.gradeLevel]?.split('(')[0]?.trim() || ''}
              </span>
            </div>
            {currentUser.photoURL && (
              <img src={currentUser.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-primary)' }} />
            )}
            <button onClick={logout}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.3rem 0.75rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Sair
            </button>
          </div>
        ) : (
          <button onClick={onLoginOpen}
            style={{ padding: '0.4rem 1rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}

// ---- Home Page ----
function Home() {
  const { currentUser, userData } = useAuth();

  return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
        {currentUser ? `Olá, ${userData?.name?.split(' ')[0]}!` : 'Plataforma Educacional'}
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 2.5rem' }}>
        {currentUser
          ? `Bem-vindo de volta. Acesse sua área de ${userData?.role === 'professor' ? 'gerenciamento' : 'aprendizado'} abaixo.`
          : 'Aprendizado imersivo, gamificado e adaptado ao seu ritmo. Faça login para começar.'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        {currentUser && userData?.role === 'professor' && (
          <>
            <Link to="/professor" style={cardStyle('#7c4dff')}>
              <span style={{ fontSize: '2.5rem' }}>🏫</span>
              <strong>Minhas Turmas</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Gerenciar e criar atividades</span>
            </Link>
            <Link to="/simulacao" style={cardStyle('#ef5350')}>
              <span style={{ fontSize: '2.5rem' }}>⚗️</span>
              <strong>Laboratórios</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Simulações interativas</span>
            </Link>
          </>
        )}
        {currentUser && userData?.role === 'estudante' && (
          <>
            <Link to="/estudante" style={cardStyle('#7c4dff')}>
              <span style={{ fontSize: '2.5rem' }}>📚</span>
              <strong>Meu Aprendizado</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Trilhas e laboratórios</span>
            </Link>
            <Link to="/simulacao" style={cardStyle('#ef5350')}>
              <span style={{ fontSize: '2.5rem' }}>⚗️</span>
              <strong>Laboratório de Física</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Simulação de pêndulos e colisões</span>
            </Link>
          </>
        )}
        {!currentUser && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            👆 Clique em <strong style={{ color: 'var(--color-primary)' }}>Entrar</strong> no topo da página para começar.
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = (accent: string): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.75rem',
  borderRadius: '14px', textDecoration: 'none', color: 'var(--text-main)',
  background: `${accent}11`, border: `1px solid ${accent}33`,
  transition: 'all 0.25s', width: '180px', alignItems: 'center',
});

// ---- Main App ----
function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('dark');
  const [loginOpen, setLoginOpen] = useState(false);
  const { currentUser, userData } = useAuth();

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : t === 'dark' ? 'high-contrast' : 'light');
  };

  const themeClass = theme === 'dark' ? 'dark-theme' : theme === 'high-contrast' ? 'high-contrast' : '';

  // Auto-redirect based on role after login
  const RoleRedirect = () => {
    if (!currentUser || !userData) return null;
    if (window.location.pathname === '/') {
      if (userData.role === 'professor') return <Navigate to="/professor" replace />;
      if (userData.role === 'estudante') return <Navigate to="/estudante" replace />;
    }
    return null;
  };

  return (
    <Router>
      <div className={`app-container ${themeClass}`}>
        <a href="#main-content" className="sr-only">Pular para o conteúdo principal</a>

        <RoleRedirect />

        <Navbar theme={theme} onThemeToggle={toggleTheme} onLoginOpen={() => setLoginOpen(true)} />

        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

        <main id="main-content" className="main-content">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/professor" element={<ProfessorDashboard />} />
              <Route path="/estudante" element={<EstudanteDashboard />} />
              <Route path="/simulacao" element={<Simulacao />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
