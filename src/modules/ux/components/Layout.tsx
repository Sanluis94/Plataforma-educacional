import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home as HomeIcon, BookOpen, Users, Settings, Beaker, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';

interface LayoutProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onLoginOpen: () => void;
}

export function Layout({ theme, onThemeToggle, onLoginOpen }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();

  // Dynamic navigation based on auth state and role
  const getNavigation = () => {
    if (!currentUser || !userData) {
      return [
        { name: 'Início', href: '/', icon: HomeIcon },
      ];
    }

    if (userData.role === 'professor') {
      return [
        { name: 'Início', href: '/', icon: HomeIcon },
        { name: 'Minhas Turmas', href: '/professor', icon: Users },
        { name: 'Laboratórios', href: '/simulacao', icon: Beaker },
      ];
    }

    if (userData.role === 'admin') {
      return [
        { name: 'Início', href: '/', icon: HomeIcon },
        { name: 'Admin', href: '/admin', icon: Settings },
      ];
    }

    // Estudante
    return [
      { name: 'Início', href: '/', icon: HomeIcon },
      { name: 'Meu Aprendizado', href: '/estudante', icon: BookOpen },
      { name: 'Laboratórios', href: '/simulacao', icon: Beaker },
    ];
  };

  const navigation = getNavigation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="app-container" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid var(--border-card)',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto',
          padding: '0 1rem', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '4rem',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            }} />
            <span style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Edu-Interact
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', borderRadius: '0.5rem',
                    fontSize: '0.875rem', textDecoration: 'none',
                    transition: 'all 0.2s',
                    ...(isActive(item.href) ? {
                      background: 'rgba(6, 182, 212, 0.1)',
                      color: '#06b6d4',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                    } : {
                      color: 'var(--text-secondary)',
                      border: '1px solid transparent',
                    }),
                  }}
                >
                  <Icon style={{ width: '1rem', height: '1rem' }} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.5rem', borderRadius: '0.5rem',
                background: 'none', border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? <Sun style={{ width: '1.1rem', height: '1.1rem' }} /> : <Moon style={{ width: '1.1rem', height: '1.1rem' }} />}
            </button>

            {currentUser && userData ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* User info - desktop only */}
                <div className="desktop-nav" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    {userData.name?.split(' ')[0] || 'Usuário'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {userData.role === 'professor' ? 'Professor' : userData.role === 'admin' ? 'Admin' : 'Estudante'}
                  </span>
                </div>
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt="avatar"
                    style={{
                      width: '2rem', height: '2rem', borderRadius: '50%',
                      border: '2px solid #06b6d4',
                    }}
                  />
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                    background: 'none', border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontSize: '0.8rem', transition: 'all 0.2s',
                  }}
                  className="desktop-nav"
                >
                  <LogOut style={{ width: '0.85rem', height: '0.85rem' }} />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginOpen}
                className="btn-gradient"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                Entrar
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-only"
              style={{
                display: 'none',
                padding: '0.5rem', borderRadius: '0.5rem',
                background: 'none', border: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X style={{ width: '1.5rem', height: '1.5rem' }} /> : <Menu style={{ width: '1.5rem', height: '1.5rem' }} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="slide-down" style={{
            borderTop: '1px solid var(--border-card)',
            background: 'var(--bg-surface)',
            backdropFilter: 'blur(20px)',
            padding: '1rem',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '0.5rem',
                      fontSize: '0.9rem', textDecoration: 'none',
                      transition: 'all 0.2s',
                      ...(isActive(item.href) ? {
                        background: 'rgba(6, 182, 212, 0.1)',
                        color: '#06b6d4',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                      } : {
                        color: 'var(--text-secondary)',
                        border: '1px solid transparent',
                      }),
                    }}
                  >
                    <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                    {item.name}
                  </Link>
                );
              })}
              {currentUser && (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: '0.5rem',
                    background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <LogOut style={{ width: '1.25rem', height: '1.25rem' }} />
                  Sair
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '4rem', minHeight: '100vh', flex: 1 }}>
        <Outlet />
      </main>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default Layout;
