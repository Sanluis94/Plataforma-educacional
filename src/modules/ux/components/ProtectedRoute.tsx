/**
 * ProtectedRoute — Componente de guarda de rotas.
 * Verifica autenticação e role do usuário antes de renderizar a página.
 * Redireciona para Home se não autenticado, ou exibe Forbidden se role não autorizada.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import type { ReactNode } from 'react';

type UserRole = 'professor' | 'estudante' | 'admin';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles permitidas para acessar esta rota */
  allowedRoles: UserRole[];
  /** Rota de fallback quando não autenticado (default: /) */
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = '/' }: ProtectedRouteProps) {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  // Enquanto carrega, não renderiza nada (o Suspense/LoadingFallback cuida disso)
  if (loading) return null;

  // Não autenticado → redireciona para Home
  if (!currentUser || !userData) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Autenticado mas role não permitida → Forbidden
  if (!allowedRoles.includes(userData.role as UserRole)) {
    return <Forbidden userRole={userData.role} />;
  }

  return <>{children}</>;
}

/**
 * Componente visual de acesso negado (403 Forbidden).
 */
function Forbidden({ userRole }: { userRole: string }) {
  const roleRedirects: Record<string, { path: string; label: string }> = {
    professor: { path: '/professor', label: 'Dashboard do Professor' },
    estudante: { path: '/estudante', label: 'Dashboard do Estudante' },
    admin: { path: '/admin', label: 'Painel Administrativo' },
  };

  const redirect = roleRedirects[userRole];

  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 8rem)', textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        Acesso Restrito
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '28rem' }}>
        Você não tem permissão para acessar esta página.
        {redirect && ` Como ${userRole}, você pode acessar o ${redirect.label}.`}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {redirect && (
          <a href={redirect.path} className="btn-gradient" style={{ padding: '0.65rem 1.5rem', textDecoration: 'none' }}>
            Ir para {redirect.label}
          </a>
        )}
        <a href="/" className="btn-outline-cyan" style={{ padding: '0.65rem 1.5rem', textDecoration: 'none' }}>
          Voltar ao Início
        </a>
      </div>
    </div>
  );
}

export default ProtectedRoute;
