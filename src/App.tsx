import { useState, useEffect, useCallback, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './modules/core/contexts/AuthContext';
import { Layout } from './modules/ux/components/Layout';
import { LoginModal } from './modules/ux/components/LoginModal';
import { ProtectedRoute } from './modules/ux/components/ProtectedRoute';
import { ErrorBoundary } from './modules/ux/components/ErrorBoundary';
import { getReturnDestination, ROUTE_ROLES } from './modules/core/utils/navigation';
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
const VerifyCertificate = lazy(() => import('./modules/ux/pages/VerifyCertificate'));
const ProductInformation = lazy(() => import('./modules/ux/pages/ProductInformation'));
const MyData = lazy(() => import('./modules/ux/pages/MyData'));

function LoginFlow({ loginOpen, openLogin, closeLogin }: { loginOpen: boolean; openLogin: () => void; closeLogin: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  useEffect(() => {
    if (location.state?.requiresAuth && !userData) {
      openLogin();
    }
  }, [location.state, userData, openLogin]);
  const cancelLogin = () => {
    navigate(location.pathname + location.search + location.hash, { replace: true, state: null });
    closeLogin();
  };
  if (!loginOpen) return null;
  return <LoginSession destination={typeof location.state?.from === 'string' ? location.state.from : null} onCancel={cancelLogin} onComplete={closeLogin} />;
}

function LoginSession({ destination, onCancel, onComplete }: { destination: string | null; onCancel: () => void; onComplete: () => void }) {
  const { userData } = useAuth();
  const location = useLocation();
  const purpose = location.state?.loginPurpose === 'family' ? 'family' : 'learning';
  const [loginCompleted, setLoginCompleted] = useState(false);
  if (loginCompleted && userData) return <LoginDestination destination={purpose === 'family' ? '/?portal=familia' : getReturnDestination(userData.role, destination)} onComplete={onComplete} />;
  const initialRole = destination?.startsWith('/professor') ? 'professor' : destination?.startsWith('/coordenacao') ? 'coordenador' : 'estudante';
  return <LoginModal purpose={purpose} initialRole={initialRole} onClose={onCancel} onSuccess={() => setLoginCompleted(true)} />;
}

function LoginDestination({ destination, onComplete }: { destination: string; onComplete: () => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(destination, { replace: true, state: null });
    onComplete();
  }, [destination, navigate, onComplete]);
  return <p role="status">Abrindo sua página…</p>;
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('edu-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  useEffect(() => { try { localStorage.setItem('edu-theme', theme); } catch { /* theme still works in memory */ } }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';

  return (
    <ErrorBoundary>
      <Router>
        <div className={`app-container ${themeClass}`}>
          <LoginFlow loginOpen={loginOpen} openLogin={openLogin} closeLogin={closeLogin} />
            <Routes>
              <Route element={
                <Layout
                  theme={theme}
                  onThemeToggle={toggleTheme}
                  onLoginOpen={openLogin}
                />
              }>
                <Route path="/" element={<Home onLoginOpen={openLogin} />} />
                <Route path="/verificar-certificado" element={<VerifyCertificate />} />
                <Route path="/privacidade" element={<ProductInformation topic="privacy" />} />
                <Route path="/termos" element={<ProductInformation topic="terms" />} />
                <Route path="/seguranca" element={<ProductInformation topic="safety" />} />
                <Route path="/meus-dados" element={<ProtectedRoute allowedRoles={ROUTE_ROLES['/meus-dados']}><MyData /></ProtectedRoute>} />

                {/* Rotas protegidas por role com segregação estrita */}
                <Route path="/professor" element={
                  <ProtectedRoute allowedRoles={ROUTE_ROLES['/professor']}>
                    <ProfessorDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/estudante" element={
                  <ProtectedRoute allowedRoles={ROUTE_ROLES['/estudante']}>
                    <EstudanteDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/simulacao" element={
                  <ProtectedRoute allowedRoles={ROUTE_ROLES['/simulacao']}>
                    <Simulacao />
                  </ProtectedRoute>
                } />

                <Route path="/enem" element={
                  <ProtectedRoute allowedRoles={ROUTE_ROLES['/enem']}>
                    <EnemSimuladoView />
                  </ProtectedRoute>
                } />

                <Route path="/coordenacao" element={
                  <ProtectedRoute allowedRoles={ROUTE_ROLES['/coordenacao']}>
                    <CoordenacaoDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={ROUTE_ROLES['/admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
