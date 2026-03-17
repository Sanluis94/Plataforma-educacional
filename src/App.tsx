import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './modules/core/contexts/AuthContext';
import './index.css';

// Lazy load pages from modules
const ProfessorDashboard = lazy(() => import('./modules/ux/pages/ProfessorDashboard').then(m => ({ default: m.ProfessorDashboard })));
const EstudanteDashboard = lazy(() => import('./modules/ux/pages/EstudanteDashboard').then(m => ({ default: m.EstudanteDashboard })));
const Simulacao = lazy(() => import('./modules/ux/pages/Simulacao').then(m => ({ default: m.Simulacao })));
const AdminPanel = lazy(() => import('./modules/ux/pages/AdminPanel'));
const Home = lazy(() => import('./modules/ux/pages/Home').then(m => ({ default: m.Home })));

// Components from modules
import { Navbar } from './modules/ux/components/Navbar';
import { LoginModal } from './modules/ux/components/LoginModal';

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
    <div className="premium-loader"></div>
  </div>
);

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
