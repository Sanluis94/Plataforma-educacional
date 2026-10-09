import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { GRADE_LABELS } from '../../core/contexts/AuthContext';
import { Logo } from './Logo';

interface NavbarProps {
  theme: string;
  onThemeToggle: () => void;
  onLoginOpen: () => void;
}

export function Navbar({ theme, onThemeToggle, onLoginOpen }: NavbarProps) {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Role-aware nav links
  const navLinks = currentUser && userData ? (() => {
    if (userData.role === 'coordenador') return [
      { to: '/coordenacao', label: '🏛️ Painel Coordenação' },
      { to: '/professor', label: '🏫 Visão Docente' },
      { to: '/simulacao', label: '⚗️ Laboratórios' },
    ];
    if (userData.role === 'professor') return [
      { to: '/professor', label: '🏫 Minhas Turmas' },
      { to: '/simulacao', label: '⚗️ Laboratórios' },
      { to: '/admin', label: '📊 Relatórios', adminOnly: true },
    ];
    if (userData.role === 'admin') return [
      { to: '/admin', label: '🛡️ Painel Admin' },
      { to: '/coordenacao', label: '🏛️ Coordenação' },
      { to: '/professor', label: '🏫 Docência' },
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
      background: 'var(--bg-surface)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem', height: '60px',
    }}>
      {/* Logo Oficial Edu-Interact */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <Logo colorMode={theme === 'dark' ? 'negative' : 'default'} symbolSize={26} />
      </Link>

      {/* Nav links (desktop) */}
      <nav style={{ display: 'flex', gap: '0.35rem', flex: 1 }}>
        {navLinks.map(link => (
          <Link key={link.to} to={link.to}
            style={{
              padding: '0.45rem 0.85rem', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem',
              fontWeight: isActive(link.to) ? '700' : 'normal',
              color: isActive(link.to) ? (theme === 'dark' ? '#F59C7B' : '#B8441F') : 'var(--text-secondary)',
              background: isActive(link.to) ? (theme === 'dark' ? 'rgba(228, 104, 63, 0.16)' : 'rgba(228, 104, 63, 0.1)') : 'transparent',
              border: isActive(link.to) ? (theme === 'dark' ? '1px solid rgba(245, 156, 123, 0.4)' : '1px solid rgba(184, 68, 31, 0.3)') : '1px solid transparent',
              transition: 'all 0.2s',
            }}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button onClick={onThemeToggle}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.35rem 0.65rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
          title="Alternar tema">
          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '⚡'}
        </button>

        {currentUser && userData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                {userData.name?.split(' ')[0] || 'Usuário'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {userData.role === 'coordenador' ? '🏛️ Coordenação' : userData.role === 'professor' ? '👨‍🏫 Professor' : userData.role === 'admin' ? '🛡️ Admin' : '🎓 Estudante'} · {GRADE_LABELS[userData.gradeLevel]?.split('(')[0]?.trim() || ''}
              </span>
            </div>
            {currentUser.photoURL && (
              <img src={currentUser.photoURL} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-primary)' }} />
            )}
            <button onClick={logout}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.35rem 0.75rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Sair
            </button>
          </div>
        ) : (
          <button onClick={onLoginOpen}
            className="btn-primary"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}>
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
