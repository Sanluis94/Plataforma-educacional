import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './modules/core/contexts/AuthContext';
import { Layout } from './modules/ux/components/Layout';
import { LoginModal } from './modules/ux/components/LoginModal';
import { ProtectedRoute } from './modules/ux/components/ProtectedRoute';
import './index.css';

// Lazy load pages from modules
const ProfessorDashboard = lazy(() => import('./modules/ux/pages/ProfessorDashboard').then(m => ({ default: m.ProfessorDashboard })));
const EstudanteDashboard = lazy(() => import('./modules/ux/pages/EstudanteDashboard').then(m => ({ default: m.EstudanteDashboard })));
const Simulacao = lazy(() => import('./modules/ux/pages/Simulacao').then(m => ({ default: m.Simulacao })));
const AdminPanel = lazy(() => import('./modules/ux/pages/AdminPanel'));
const Home = lazy(() => import('./modules/ux/pages/Home').then(m => ({ default: m.Home })));
const NotFound = lazy(() => import('./modules/ux/pages/NotFound'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-base)' }}>
    <div className="premium-loader"></div>
  </div>
);

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loginOpen, setLoginOpen] = useState(false);
  const { currentUser, userData } = useAuth();

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';

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
  );
}

export default App;
