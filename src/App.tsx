import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './modules/core/contexts/AuthContext';
import { Layout } from './modules/ux/components/Layout';
import { LoginModal } from './modules/ux/components/LoginModal';
import { ProtectedRoute } from './modules/ux/components/ProtectedRoute';
import { ErrorBoundary } from './modules/ux/components/ErrorBoundary';
import './index.css';

// Lazy load pages from modules
const ProfessorDashboard = lazy(() => import('./modules/ux/pages/ProfessorDashboard').then(m => ({ default: m.ProfessorDashboard })));
const EstudanteDashboard = lazy(() => import('./modules/ux/pages/EstudanteDashboard').then(m => ({ default: m.EstudanteDashboard })));
const Simulacao = lazy(() => import('./modules/ux/pages/Simulacao').then(m => ({ default: m.Simulacao })));
const AdminPanel = lazy(() => import('./modules/ux/pages/AdminPanel'));
const CoordenacaoDashboard = lazy(() => import('./modules/ux/pages/CoordenacaoDashboard'));
const EnemSimuladoView = lazy(() => import('./modules/ux/pages/EnemSimuladoView'));
const Home = lazy(() => import('./modules/ux/pages/Home').then(m => ({ default: m.Home })));
const NotFound = lazy(() => import('./modules/ux/pages/NotFound'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'var(--bg-base, #0b0f19)',
    gap: '1.25rem'
  }}>
    <div className="premium-loader" style={{ width: '3.5rem', height: '3.5rem' }}></div>
    <div style={{
      color: 'var(--text-secondary, #94a3b8)',
      fontSize: '0.9rem',
      fontWeight: 500,
      letterSpacing: '0.5px',
      animation: 'pulse 1.5s infinite ease-in-out'
    }}>
      Carregando ambiente de aprendizagem...
    </div>
  </div>
);

function AuthRequirementHandler({ onOpenLogin, isAuthenticated }: { onOpenLogin: () => void; isAuthenticated: boolean }) {
  const location = useLocation();
  useEffect(() => {
    if (location.state?.requiresAuth && !isAuthenticated) {
      onOpenLogin();
    }
  }, [location.state, isAuthenticated, onOpenLogin]);
  return null;
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loginOpen, setLoginOpen] = useState(false);
  const { currentUser } = useAuth();

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';

  return (
    <ErrorBoundary>
      <Router>
        <div className={`app-container ${themeClass}`}>
          <AuthRequirementHandler
            onOpenLogin={() => setLoginOpen(true)}
            isAuthenticated={!!currentUser}
          />

          {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route element={
                <Layout
                  theme={theme}
                  onThemeToggle={toggleTheme}
                  onLoginOpen={() => setLoginOpen(true)}
                />
              }>
                <Route path="/" element={<Home onLoginOpen={() => setLoginOpen(true)} />} />

                {/* Rotas protegidas por role */}
                <Route path="/professor" element={
                  <ProtectedRoute allowedRoles={['professor', 'admin']}>
                    <ProfessorDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/estudante" element={
                  <ProtectedRoute allowedRoles={['estudante', 'admin']}>
                    <EstudanteDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/simulacao" element={
                  <ProtectedRoute allowedRoles={['estudante', 'professor', 'admin']}>
                    <Simulacao />
                  </ProtectedRoute>
                } />

                <Route path="/enem" element={
                  <ProtectedRoute allowedRoles={['estudante', 'professor', 'admin']}>
                    <EnemSimuladoView />
                  </ProtectedRoute>
                } />

                <Route path="/coordenacao" element={
                  <ProtectedRoute allowedRoles={['professor', 'admin']}>
                    <CoordenacaoDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
