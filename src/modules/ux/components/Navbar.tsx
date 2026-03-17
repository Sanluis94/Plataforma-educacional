import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { GRADE_LABELS } from '../../core/contexts/AuthContext';

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
