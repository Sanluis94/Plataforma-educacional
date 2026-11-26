import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, BookOpen, Users, Settings, Beaker, LogOut, Sun, Moon, GraduationCap, Building2, Search, Sparkles, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import { getRoleHome, ROLE_LABELS, withReturnTo, type NavigationRole } from '../../core/utils/navigation';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { PricingModal } from './PricingModal';
import { ParentBridgeModal } from './ParentBridgeModal';
import { Logo } from './Logo';
import { ConnectivityBadge } from './common/ConnectivityBadge';
import { CommandPaletteModal } from './common/CommandPaletteModal';
import './Layout.css';

/** Âncoras da landing page (só aparecem para visitantes) */
const LANDING_SECTIONS = [
  { id: 'recursos', label: 'Recursos' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'para-quem', label: 'Para quem' },
  { id: 'acessibilidade', label: 'Acessibilidade' },
  { id: 'perguntas', label: 'Perguntas' },
];

interface LayoutProps { theme: 'dark' | 'light'; onThemeToggle: () => void; onLoginOpen: () => void; }
export function Layout({ theme, onThemeToggle, onLoginOpen }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [familyOpen, setFamilyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();
  const familyRequested = new URLSearchParams(location.search).get('portal')==='familia';
  function closeFamily(){setFamilyOpen(false);if(familyRequested){const params=new URLSearchParams(location.search);params.delete('portal');navigate(location.pathname+(params.size?'?'+params.toString():''),{replace:true,state:null});}}
  const role = userData?.role;
  const signedIn = Boolean(currentUser && userData);
  const origin = location.pathname + location.search;
  const home = getRoleHome(role);
  const panelIcon = role === 'professor' ? Users : role === 'coordenador' ? Building2 : role === 'admin' ? Settings : BookOpen;
  const panelLabel = role === 'professor' ? 'Minhas turmas' : role === 'coordenador' ? 'Coordenação' : role === 'admin' ? 'Administração' : 'Meu aprendizado';
  const navigation = [{ name: 'Início', href: '/', icon: Home }, ...(signedIn ? [
    { name: panelLabel, href: home, icon: panelIcon }, { name: 'Laboratórios', href: '/simulacao', icon: Beaker }, { name: 'Simulado ENEM', href: '/enem', icon: GraduationCap },
  ] : [])];
  const destination = (href: string) => ['/simulacao', '/enem'].includes(href) && !['/simulacao', '/enem'].includes(location.pathname) ? withReturnTo(href, origin) : href;
  const initials = (userData?.name || 'Você').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');

  useEffect(() => { if (!document.querySelector('[role="dialog"]')) mainRef.current?.focus({ preventScroll: true }); if (!location.hash) window.scrollTo(0, 0); }, [location.pathname, location.hash]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(value => !value); }
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [menuOpen]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try { await logout(); setMenuOpen(false); navigate('/'); }
    catch { setLogoutError('Não foi possível sair. Tente novamente.'); }
  };
  const openFromMenu = (open: () => void) => { menuButton.current?.focus(); setMenuOpen(false); open(); };

  const navLinks = (variant: 'side' | 'drawer') => navigation.map(item => {
    const Icon = item.icon;
    const active = location.pathname === item.href;
    return <Link key={item.href} to={destination(item.href)} aria-current={active ? 'page' : undefined} onClick={() => setMenuOpen(false)} className={`shell-nav__link shell-nav__link--${variant}`}><Icon size={20} aria-hidden="true" /><span>{item.name}</span></Link>;
  });

  const anchorLinks = (onPick?: () => void) => LANDING_SECTIONS.map(section => (
    <a key={section.id} href={location.pathname === '/' ? `#${section.id}` : `/#${section.id}`} className="site-nav__link" onClick={onPick}>{section.label}</a>
  ));

  return <div className={`app-container shell ${signedIn ? 'shell--app' : 'shell--site'}`} style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
    <a href="#main-content" className="skip-content">Ir para o conteúdo</a>

    {/* Barra lateral: só para quem está logado, em telas largas */}
    {signedIn && <aside className="shell-sidebar" aria-label="Painel lateral">
      <Link to="/" aria-label="Edu-Interact — página inicial" className="shell-sidebar__brand"><Logo colorMode="negative" symbolSize={30} /></Link>
      <nav aria-label="Navegação principal" className="shell-nav">{navLinks('side')}</nav>
      <div className="shell-sidebar__group">
        <p className="shell-sidebar__label">Mais</p>
        <button type="button" className="shell-nav__link shell-nav__link--side" onClick={() => setFamilyOpen(true)}><HeartHandshake size={20} aria-hidden="true" /><span>Portal da família</span></button>
        <button type="button" className="shell-nav__link shell-nav__link--side" onClick={() => setPricingOpen(true)}><Sparkles size={20} aria-hidden="true" /><span>Planos (demonstração)</span></button>
        <Link to="/meus-dados" className="shell-nav__link shell-nav__link--side" aria-current={location.pathname === '/meus-dados' ? 'page' : undefined}><ShieldCheck size={20} aria-hidden="true" /><span>Meus dados</span></Link>
      </div>
      <div className="shell-user">
        <span className="shell-user__avatar" aria-hidden="true">{initials}</span>
        <span className="shell-user__info"><strong>{userData?.name}</strong><span>{ROLE_LABELS[role as NavigationRole]}</span></span>
        <button type="button" className="shell-user__logout" onClick={() => void handleLogout()} aria-label="Sair da conta" title="Sair da conta"><LogOut size={18} aria-hidden="true" /></button>
      </div>
    </aside>}

    <header className={`shell-header${scrolled ? ' shell-header--scrolled' : ''}`}>
      <div className="shell-header__inner">
        <Link to="/" aria-label="Edu-Interact — página inicial" className="header-logo"><Logo colorMode={theme === 'dark' ? 'negative' : 'default'} symbolSize={28} /></Link>

        {!signedIn && <nav aria-label="Navegação principal" className="site-nav">{anchorLinks()}</nav>}

        {signedIn && <button type="button" className="shell-search" onClick={() => setSearchOpen(true)} aria-label="Buscar páginas e laboratórios">
          <Search size={18} aria-hidden="true" /><span>Buscar páginas e laboratórios</span><kbd>Ctrl K</kbd>
        </button>}

        <div className="shell-header__actions">
          <span className="header-status"><ConnectivityBadge /></span>
          {!signedIn && <button className="shell-icon-btn" aria-label="Buscar páginas e laboratórios" title="Buscar (Ctrl+K)" onClick={() => setSearchOpen(true)}><Search size={20} aria-hidden="true" /></button>}
          {signedIn && <button className="shell-icon-btn shell-only-compact" aria-label="Buscar páginas e laboratórios" title="Buscar (Ctrl+K)" onClick={() => setSearchOpen(true)}><Search size={20} aria-hidden="true" /></button>}
          <AccessibilityToolbar />
          <button className="shell-icon-btn" aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} onClick={onThemeToggle}>{theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}</button>
          {!currentUser && <>
            <button className="btn-outline shell-login" onClick={onLoginOpen}>Entrar</button>
            <button className="btn-primary shell-cta" onClick={onLoginOpen}>Começar agora <ArrowRight size={18} aria-hidden="true" /></button>
          </>}
          <button ref={menuButton} className="shell-icon-btn shell-menu-btn" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="navigation-menu" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}</button>
        </div>
      </div>

      {menuOpen && <div id="navigation-menu" className="shell-drawer">
        {userData && <div className="shell-user shell-user--drawer">
          <span className="shell-user__avatar" aria-hidden="true">{initials}</span>
          <span className="shell-user__info"><strong>{userData.name}</strong><span>{ROLE_LABELS[role as NavigationRole]}</span></span>
        </div>}
        <nav aria-label="Menu de páginas" className="shell-drawer__nav">{navLinks('drawer')}</nav>
        {!signedIn && <div className="shell-drawer__anchors">{anchorLinks(() => setMenuOpen(false))}</div>}
        <div className="shell-drawer__actions">
          <button className="btn-outline" onClick={() => openFromMenu(() => setPricingOpen(true))}><Sparkles size={18} aria-hidden="true" /> Conhecer planos (demonstração)</button>
          <button className="btn-outline" onClick={() => openFromMenu(() => setFamilyOpen(true))}><HeartHandshake size={18} aria-hidden="true" /> Portal da família</button>
          {currentUser && <Link to="/meus-dados" className="btn-outline" onClick={() => setMenuOpen(false)}><ShieldCheck size={18} aria-hidden="true" /> Meus dados e solicitações</Link>}
          {currentUser && <button className="btn-outline" onClick={() => void handleLogout()}><LogOut size={18} aria-hidden="true" /> Sair da conta</button>}
        </div>
        {logoutError && <p role="alert" className="ei-alert ei-alert--error">{logoutError}</p>}
      </div>}
    </header>

    <div className="shell-body">
      <main id="main-content" ref={mainRef} tabIndex={-1} className="shell-main"><Suspense fallback={<p role="status" className="shell-loading">Carregando tela…</p>}><Outlet /></Suspense></main>
      <footer className="app-footer">
        <div className="app-footer__inner">
          <div className="app-footer__brand">
            <Logo colorMode="negative" symbolSize={28} showTagline />
            <p>Onde a raiz encontra o circuito. Laboratórios virtuais, turmas e simulados pensados com o Desenho Universal para a Aprendizagem e as diretrizes WCAG.</p>
          </div>
          <div className="app-footer__cols">
            <nav aria-label="Plataforma" className="app-footer__col">
              <p className="app-footer__title">Plataforma</p>
              <Link to="/simulacao">Laboratórios</Link>
              <Link to="/enem">Simulado ENEM</Link>
              <button type="button" onClick={() => setPricingOpen(true)}>Planos (demonstração)</button>
              <button type="button" onClick={() => setFamilyOpen(true)}>Portal da família</button>
            </nav>
            <nav aria-label="Privacidade e segurança" className="app-footer__col">
              <p className="app-footer__title">Confiança</p>
              <Link to="/privacidade">Privacidade e seus dados</Link><Link to="/termos">Termos de uso</Link><Link to="/seguranca">Segurança e famílias</Link>
            </nav>
          </div>
        </div>
        <p className="app-footer__legal">Edu-Interact · Educação científica inclusiva · Raiz e circuito, sempre juntos.</p>
      </footer>
    </div>

    {pricingOpen && <PricingModal onClose={() => setPricingOpen(false)} />}
    {(familyOpen || familyRequested) && <ParentBridgeModal onClose={closeFamily} onLogin={() => { setFamilyOpen(false); navigate('/', {state:{loginPurpose:'family',from:'/',requiresAuth:true}}); }} />}
    {searchOpen && <CommandPaletteModal isOpen onClose={() => setSearchOpen(false)} theme={theme} onThemeToggle={onThemeToggle} onOpenPricing={() => setPricingOpen(true)} onOpenParentBridge={() => setFamilyOpen(true)} />}
  </div>;
}
