export type NavigationRole = 'estudante' | 'professor' | 'coordenador' | 'admin';

export const ROUTE_ROLES: Record<string, NavigationRole[]> = {
  '/estudante': ['estudante', 'admin'],
  '/professor': ['professor', 'coordenador', 'admin'],
  '/coordenacao': ['coordenador', 'admin'],
  '/admin': ['admin'],
  '/simulacao': ['estudante', 'professor', 'coordenador', 'admin'],
  '/enem': ['estudante', 'professor', 'coordenador', 'admin'],
};

export const ROLE_LABELS: Record<NavigationRole, string> = {
  estudante: 'Estudante', professor: 'Professor', coordenador: 'Coordenação', admin: 'Administração',
};

export function getRoleHome(role?: string | null): string {
  return ({ estudante: '/estudante', professor: '/professor', coordenador: '/coordenacao', admin: '/admin' } as Record<string, string>)[role ?? ''] ?? '/';
}

function internalUrl(path?: string | null): URL | null {
  if (!path || !path.startsWith('/') || path.startsWith('//') || /[\\\s]/.test(path)) return null;
  try {
    const url = new URL(path, 'https://navigation.internal');
    return url.origin === 'https://navigation.internal' ? url : null;
  } catch { return null; }
}

export function canAccessPath(role: string | null | undefined, path: string): boolean {
  const url = internalUrl(path);
  if (!url) return false;
  if (url.pathname === '/') return true;
  return !!role && !!ROUTE_ROLES[url.pathname]?.includes(role as NavigationRole);
}

/** Keep return links within the routes available to the authenticated profile. */
export function getReturnDestination(role: string | null | undefined, returnTo?: string | null, fallback?: string): string {
  const candidate = internalUrl(returnTo);
  if (candidate && canAccessPath(role, candidate.pathname)) return candidate.pathname + candidate.search + candidate.hash;
  return fallback && canAccessPath(role, fallback) ? fallback : getRoleHome(role);
}

export function withReturnTo(destination: string, returnTo: string): string {
  const url = internalUrl(destination);
  if (!url) return destination;
  if (internalUrl(returnTo)) url.searchParams.set('returnTo', returnTo);
  return url.pathname + url.search + url.hash;
}
