import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { Outlet, useLocation } from 'react-router-dom';
import { canAccessPath, getReturnDestination, getRoleHome, withReturnTo } from '../modules/core/utils/navigation';

const session = vi.hoisted(() => ({ userData: null as null | { role: string; name: string; gradeLevel: string }, currentUser: null as null | { uid: string } }));
vi.mock('../modules/core/contexts/AuthContext', () => ({
  GRADE_LABELS: { medio: 'Ensino Médio' },
  useAuth: () => ({ ...session, loading: false, isLocalAuthMode: true, loginWithGoogle: async (role: string) => {
    session.userData = { role, name: 'Perfil de teste', gradeLevel: 'medio' }; session.currentUser = { uid: 'qa-login' };
  } }),
}));
vi.mock('../modules/ux/components/Layout', () => ({ Layout: ({ onLoginOpen }: { onLoginOpen: () => void }) => <><button onClick={onLoginOpen}>Entrar</button><Outlet /></> }));
vi.mock('../modules/ux/pages/Home', () => ({ Home: () => <h1>Página inicial</h1> }));
function Destination() { const location = useLocation(); return <h1>{location.pathname + location.search}</h1>; }
vi.mock('../modules/ux/pages/Simulacao', () => ({ Simulacao: Destination }));
vi.mock('../modules/ux/pages/ProfessorDashboard', () => ({ ProfessorDashboard: Destination }));
vi.mock('../modules/ux/pages/EstudanteDashboard', () => ({ EstudanteDashboard: Destination }));
vi.mock('../modules/ux/pages/CoordenacaoDashboard', () => ({ default: Destination }));
vi.mock('../modules/ux/pages/AdminPanel', () => ({ default: Destination }));
vi.mock('../modules/ux/pages/EnemSimuladoView', () => ({ default: Destination }));
import App from '../App';

afterEach(cleanup);
beforeEach(() => { session.userData = null; session.currentUser = null; localStorage.clear(); window.history.replaceState(null, '', '/'); });

describe('authorized navigation and return destinations', () => {
  it('maps each profile to its own panel and excludes incompatible destinations', () => {
    expect(getRoleHome('coordenador')).toBe('/coordenacao');
    expect(canAccessPath('professor', '/coordenacao')).toBe(false);
    expect(canAccessPath('coordenador', '/estudante')).toBe(false);
    expect(canAccessPath('coordenador', '/professor?tab=reports')).toBe(true);
    expect(canAccessPath('admin', '/estudante')).toBe(true);
    expect(canAccessPath(null, '/simulacao')).toBe(false);
  });
  it('preserves filters in a valid return and rejects external or unauthorized destinations', () => {
    const origin = '/estudante?tab=labs&level=fundamental_2&subject=Física';
    const destination = withReturnTo('/simulacao?lab=fis_1', origin);
    expect(new URL(destination, 'https://test.invalid').searchParams.get('returnTo')).toBe(origin);
    expect(getReturnDestination('estudante', origin)).toBe('/estudante?tab=labs&level=fundamental_2&subject=F%C3%ADsica');
    for (const invalid of ['https://outside.invalid', '//outside.invalid', '/\\outside.invalid', '/coordenacao', '/missing']) expect(getReturnDestination('estudante', invalid)).toBe('/estudante');
  });
});

describe('login continuity', () => {
  it('returns to the complete requested link after signing in', async () => {
    window.history.replaceState(null, '', '/simulacao?lab=fis_1&level=medio');
    render(<App />);
    await screen.findByRole('dialog', { name: 'Entrar na plataforma' });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar localmente' }));
    await screen.findByRole('heading', { name: '/simulacao?lab=fis_1&level=medio' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('lets the user dismiss a requested login without reopening it', async () => {
    window.history.replaceState(null, '', '/estudante?tab=classes');
    render(<App />);
    const dialog = await screen.findByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar acesso' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
  it('takes a general login to the actual profile panel', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    fireEvent.click(screen.getByRole('button', { name: /professor/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar localmente' }));
    await screen.findByRole('heading', { name: '/professor' });
  });
  it('falls back to the profile panel when a requested page is not allowed', async () => {
    window.history.replaceState(null, '', '/coordenacao?tab=reports');
    render(<App />);
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button',{name:/estudante$/i}));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar localmente' }));
    await screen.findByRole('heading', { name: '/estudante' });
    expect(screen.queryByText('Acesso Restrito')).toBeNull();
  });
});
