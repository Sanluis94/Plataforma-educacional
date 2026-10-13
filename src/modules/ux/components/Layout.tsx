import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Users, Settings, Beaker, LogOut, Sun, Moon, GraduationCap, Building2, Search } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import { getRoleHome, ROLE_LABELS, withReturnTo, type NavigationRole } from '../../core/utils/navigation';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { PricingModal } from './PricingModal';
import { ParentBridgeModal } from './ParentBridgeModal';
import { Logo } from './Logo';
import { ConnectivityBadge } from './common/ConnectivityBadge';
import { CommandPaletteModal } from './common/CommandPaletteModal';

interface LayoutProps { theme: 'dark' | 'light'; onThemeToggle: () => void; onLoginOpen: () => void; }
export function Layout({ theme, onThemeToggle, onLoginOpen }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const menuButton = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();
  const familyRequested = new URLSearchParams(location.search).get('portal')==='familia';
  function closeFamily(){setFamilyOpen(false);if(familyRequested){const params=new URLSearchParams(location.search);params.delete('portal');navigate(location.pathname+(params.size?'?'+params.toString():''),{replace:true,state:null});}}
  const role = userData?.role;
  const origin = location.pathname + location.search;
  const home = getRoleHome(role);
  const panelIcon = role === 'professor' ? Users : role === 'coordenador' ? Building2 : role === 'admin' ? Settings : BookOpen;
  const panelLabel = role === 'professor' ? 'Minhas turmas' : role === 'coordenador' ? 'Coordenação' : role === 'admin' ? 'Administração' : 'Meu aprendizado';
  const navigation = [{ name: 'Início', href: '/', icon: Home }, ...(currentUser && userData ? [
    { name: panelLabel, href: home, icon: panelIcon }, { name: 'Laboratórios', href: '/simulacao', icon: Beaker }, { name: 'Simulado ENEM', href: '/enem', icon: GraduationCap },
  ] : [])];
  const destination = (href: string) => ['/simulacao', '/enem'].includes(href) && !['/simulacao', '/enem'].includes(location.pathname) ? withReturnTo(href, origin) : href;
  useEffect(() => { if (!document.querySelector('[role="dialog"]')) mainRef.current?.focus({ preventScroll: true }); window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(value => !value); }
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [menuOpen]);
  const handleLogout = async () => {
    try { await logout(); setMenuOpen(false); navigate('/'); }
    catch { setLogoutError('Não foi possível sair. Tente novamente.'); }
  };
  const navLinks = (mobile = false) => navigation.map(item => {
    const Icon = item.icon;
    const active = location.pathname === item.href;
    return <Link key={item.href} to={destination(item.href)} aria-current={active ? 'page' : undefined} onClick={() => setMenuOpen(false)} className={active ? 'btn-primary' : 'btn-outline'} style={{ textDecoration: 'none', padding: mobile ? '0.8rem' : '0.5rem 0.7rem', justifyContent: mobile ? 'flex-start' : 'center', fontSize: '0.85rem' }}><Icon size={16} aria-hidden="true" />{item.name}</Link>;
  });
  return <div className="app-container" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
    <a href="#main-content" className="skip-content">Ir para o conteúdo</a>
    <header className="app-header" style={{ position: 'fixed', inset: '0 0 auto 0', zIndex: 50, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '90rem', margin: 'auto', height: '4rem', padding: '0 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <Link to="/" aria-label="Edu-Interact — página inicial" className="header-logo" onClick={() => setMenuOpen(false)}><Logo colorMode={theme === 'dark' ? 'negative' : 'default'} symbolSize={28} /></Link>
        <nav aria-label="Navegação principal" className="header-desktop" style={{ display: 'flex', gap: '0.35rem' }}>{navLinks()}</nav>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span className="header-status"><ConnectivityBadge /></span>
          <button className="btn-outline header-icon" aria-label="Buscar páginas e laboratórios" title="Buscar (Ctrl+K)" onClick={() => setSearchOpen(true)}><Search size={18} /></button>
          <AccessibilityToolbar />
          <button className="btn-outline header-icon" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} onClick={onThemeToggle}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          {!currentUser && <button className="btn-primary" onClick={onLoginOpen} style={{ padding: '0.5rem 0.7rem' }}>Entrar</button>}
          <button ref={menuButton} className="btn-outline header-icon" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="navigation-menu" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <div id="navigation-menu" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', maxHeight: 'calc(100dvh - 4rem)', overflowY: 'auto' }}>
        {userData && <p style={{ marginBottom: '0.75rem' }}>{userData.name} · {ROLE_LABELS[role as NavigationRole]}</p>}
        <nav aria-label="Menu de páginas" style={{ display: 'grid', gap: '0.5rem', maxWidth: '35rem' }}>{navLinks(true)}</nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn-outline" onClick={() => { menuButton.current?.focus(); setMenuOpen(false); setPricingOpen(true); }}>Conhecer planos (demonstração)</button>
          <button className="btn-outline" onClick={() => { menuButton.current?.focus(); setMenuOpen(false); setFamilyOpen(true); }}>Portal da família</button>
          {currentUser && <button className="btn-outline" onClick={() => void handleLogout()}><LogOut size={16} /> Sair da conta</button>}
        </div>
        {logoutError && <p role="alert">{logoutError}</p>}
      </div>}
    </header>
    <main id="main-content" ref={mainRef} tabIndex={-1} style={{ paddingTop: '4rem', minHeight: '100vh', flex: 1, outline: 'none' }}><Suspense fallback={<p role="status" style={{ padding: '2rem' }}>Carregando tela…</p>}><Outlet /></Suspense></main>
    <footer style={{ padding: '1.2rem 1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
      <nav aria-label="Privacidade e segurança" style={{ maxWidth: '90rem', margin: 'auto', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/privacidade">Privacidade e seus dados</Link><Link to="/termos">Termos de uso</Link><Link to="/seguranca">Segurança e famílias</Link>
      </nav>
    </footer>
    {pricingOpen && <PricingModal onClose={() => setPricingOpen(false)} />}
    {(familyOpen || familyRequested) && <ParentBridgeModal onClose={closeFamily} onLogin={() => { setFamilyOpen(false); navigate('/', {state:{loginPurpose:'family',from:'/',requiresAuth:true}}); }} />}
    {searchOpen && <CommandPaletteModal isOpen onClose={() => setSearchOpen(false)} theme={theme} onThemeToggle={onThemeToggle} onOpenPricing={() => setPricingOpen(true)} onOpenParentBridge={() => setFamilyOpen(true)} />}
    <style>{`
      .header-icon { padding: 0.5rem; min-width: 2.25rem; min-height: 2.25rem; }
      .skip-content { position: fixed; top: -5rem; left: 1rem; z-index: 2000; padding: 0.7rem 1rem; background: var(--bg-card); color: var(--text-main); border: 2px solid var(--color-primary); }
      .skip-content:focus { top: 0.5rem; }
      @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-only { display: flex !important; } }
      @media (min-width: 769px) { .mobile-only { display: none !important; } }
      @media (max-width: 1279px) { .header-desktop { display: none !important; } }
      @media (max-width: 480px) { .header-logo .edu-interact-wordmark, .header-status { display: none; } .header-logo { max-width: 2rem; overflow: hidden; } }
    `}</style>
  </div>;
}
