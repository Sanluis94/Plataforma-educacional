import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const fixture = vi.hoisted(() => ({
  deployment: { mode: 'home' as 'home' | 'school' | 'pilot', installationName: 'Instalação fictícia', installationId: 'installation-fixture' },
  auth: { currentUser: null as { uid: string; email: string; displayName: string } | null },
  db: {} as object | null,
  user: { uid: 'home-fixture-user', email: 'learner@example.test', displayName: 'Pessoa fictícia' },
  read: vi.fn(), policyRead: vi.fn(), set: vi.fn(), commit: vi.fn(), popup: vi.fn(),
}));
vi.mock('../modules/core/config/productConfiguration', () => ({ productDeployment: fixture.deployment }));
vi.mock('../modules/core/services/firebaseConfig', () => ({ auth: fixture.auth, get db() { return fixture.db; } }));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {}, onAuthStateChanged: vi.fn((_auth, listener) => { void listener(fixture.auth.currentUser); return () => {}; }),
  signOut: vi.fn(), signInWithPopup: fixture.popup,
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })), getDoc: fixture.read, getDocFromServer: fixture.policyRead, setDoc: vi.fn(),
  writeBatch: vi.fn(() => ({ set: fixture.set, commit: fixture.commit })),
}));
vi.mock('../modules/data/repositories/logRepository', () => ({ writeLog: vi.fn() }));
vi.mock('../modules/data/services/localEtlClient', () => ({ getLocalEtlUserByRole: vi.fn() }));
import { AuthProvider, useAuth } from '../modules/core/contexts/AuthContext';
import { LoginModal } from '../modules/ux/components/LoginModal';
import { getInitialRegistrationRole } from '../modules/core/config/registrationPolicy';

function DirectAccess({ selectedRole }: { selectedRole: 'professor' | 'coordenador' | 'admin' }) {
  const { loginWithGoogle, userData } = useAuth();
  return <><output aria-label="Perfil confirmado">{userData?.role ?? 'sem perfil'}</output><button onClick={() => { void loginWithGoogle(selectedRole, 'medio').catch(() => {}); }}>Acesso direto</button></>;
}
beforeEach(() => {
  localStorage.clear(); fixture.deployment.mode = 'home'; fixture.auth.currentUser = null; fixture.db = {};
  fixture.read.mockReset().mockResolvedValue({ exists: () => false });
  fixture.policyRead.mockReset().mockImplementation(async () => ({ exists: () => true, data: () => ({ schemaVersion: 1, installationId: fixture.deployment.installationId, mode: fixture.deployment.mode, staffRegistration: fixture.deployment.mode === 'school' ? 'assigned-only' : 'students-only' }) }));
  fixture.popup.mockReset().mockImplementation(async () => { fixture.auth.currentUser = fixture.user; return { user: fixture.user }; });
  fixture.set.mockClear(); fixture.commit.mockReset().mockResolvedValue(undefined);
});
afterEach(cleanup);

it.each(['professor', 'coordenador', 'admin'] as const)('primeiro cadastro doméstico força estudante mesmo com chamada direta selecionando %s', async selectedRole => {
  render(<AuthProvider><DirectAccess selectedRole={selectedRole} /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Acesso direto' }));
  await screen.findByText('estudante');
  const profileWrite = fixture.set.mock.calls.find(([reference]) => reference.collection === 'users');
  const progressWrite = fixture.set.mock.calls.find(([reference]) => reference.collection === 'progress');
  expect(profileWrite?.[1]).toMatchObject({ role: 'estudante', gradeLevel: 'medio', email: fixture.user.email });
  expect(progressWrite).toBeDefined();
  expect(fixture.commit).toHaveBeenCalledTimes(1);
});

it.each(['professor', 'coordenador', 'admin'] as const)('login doméstico preserva perfil existente %s sem regravar cargo', async role => {
  fixture.read.mockResolvedValue({ exists: () => true, data: () => ({ role, name: fixture.user.displayName, email: fixture.user.email, gradeLevel: 'graduacao' }) });
  render(<AuthProvider><DirectAccess selectedRole="professor" /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Acesso direto' }));
  await screen.findByText(role);
  expect(fixture.set).not.toHaveBeenCalled();
  expect(fixture.commit).not.toHaveBeenCalled();
});

it('login doméstico explica a finalidade e não apresenta cargos nem seleção técnica de nível', async () => {
  const success = vi.fn();
  render(<MemoryRouter><AuthProvider><LoginModal initialRole="coordenador" onClose={vi.fn()} onSuccess={success} /></AuthProvider></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Entrar para estudar em casa' });
  expect(screen.queryByRole('button', { name: /Coordenação|professor|estudante/ })).not.toBeInTheDocument();
  expect(screen.queryByText('Em qual nível você estuda?')).not.toBeInTheDocument();
  expect(screen.getByText(/Instalação fictícia.*primeiro acesso cria um perfil de estudante/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com Google' }));
  await waitFor(() => expect(success).toHaveBeenCalledTimes(1));
  expect(fixture.set.mock.calls.find(([reference]) => reference.collection === 'users')?.[1].role).toBe('estudante');
});

it('a escola conserva a entrada de equipe, mas bloqueia cadastro docente não autorizado', async () => {
  fixture.deployment.mode = 'school';
  render(<MemoryRouter><AuthProvider><LoginModal initialRole="professor" onClose={vi.fn()} /></AuthProvider></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Entrar na escola' });
  expect(screen.getByRole('button', { name: /professor/ })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /Coordenação/ })).toBeVisible();
  expect(screen.getByText(/acesso às turmas depende dos vínculos autorizados/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com Google' }));
  await screen.findByText(/Seu acesso à equipe ainda não foi autorizado/);
  expect(fixture.commit).not.toHaveBeenCalled();
  expect(fixture.set).not.toHaveBeenCalled();
});

it('equipe previamente autorizada pela escola entra com seu perfil sem regravação', async () => {
  fixture.deployment.mode = 'school';
  fixture.read.mockResolvedValue({ exists: () => true, data: () => ({ role: 'professor', name: fixture.user.displayName, email: fixture.user.email, gradeLevel: 'medio' }) });
  render(<AuthProvider><DirectAccess selectedRole="professor" /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Acesso direto' }));
  await screen.findByText('professor');
  expect(fixture.commit).not.toHaveBeenCalled();
});

it.each(['home', 'school'] as const)('instalação %s sem política confirmada não abre Google nem grava perfil', async mode => {
  fixture.deployment.mode = mode;
  fixture.policyRead.mockResolvedValue({ exists: () => false });
  render(<MemoryRouter><AuthProvider><LoginModal onClose={vi.fn()} /></AuthProvider></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Entrar com Google' }));
  await screen.findByText(/política de acesso desta instalação não pôde ser confirmada/);
  expect(fixture.popup).not.toHaveBeenCalled();
  expect(fixture.commit).not.toHaveBeenCalled();
});

it('sessão restaurada não recebe perfil enquanto a política de outra instalação estiver ativa', async () => {
  fixture.auth.currentUser = fixture.user;
  fixture.policyRead.mockResolvedValue({ exists: () => true, data: () => ({ schemaVersion: 1, installationId: 'other-installation', mode: 'home', staffRegistration: 'students-only' }) });
  fixture.read.mockResolvedValue({ exists: () => true, data: () => ({ role: 'professor' }) });
  render(<AuthProvider><DirectAccess selectedRole="professor" /></AuthProvider>);
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Perfil confirmado')).toHaveTextContent('sem perfil');
  expect(fixture.read).not.toHaveBeenCalled();
});

it.each(['home', 'school'] as const)('modo explícito %s sem Firebase não restaura sessão fictícia nem usa fallback local', async mode => {
  fixture.deployment.mode = mode; fixture.db = null;
  localStorage.setItem('edu-interact-local-auth-session', JSON.stringify({ currentUser: fixture.user, userData: { role: 'professor', name: fixture.user.displayName } }));
  render(<AuthProvider><DirectAccess selectedRole="professor" /></AuthProvider>);
  await screen.findByRole('alert');
  expect(screen.getByLabelText('Perfil confirmado')).toHaveTextContent('sem perfil');
  fireEvent.click(screen.getByRole('button', { name: 'Acesso direto' }));
  expect(fixture.popup).not.toHaveBeenCalled();
  expect(fixture.policyRead).not.toHaveBeenCalled();
  expect(fixture.set).not.toHaveBeenCalled();
});

it('portal familiar conserva a entrada por convite sem seletores de cargo ou nível', async () => {
  fixture.deployment.mode = 'school';
  render(<MemoryRouter><AuthProvider><LoginModal initialRole="professor" purpose="family" onClose={vi.fn()} /></AuthProvider></MemoryRouter>);
  await screen.findByRole('heading', { name: 'Entrar para acompanhar' });
  expect(screen.getByText('Entre com o mesmo email informado no convite.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Coordenação|professor/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Entrar com Google' }));
  await waitFor(() => expect(fixture.commit).toHaveBeenCalledTimes(1));
  expect(fixture.set.mock.calls.find(([reference]) => reference.collection === 'users')?.[1].role).toBe('estudante');
});

it('a política não converte coordenador ou admin escolares, mas normaliza a finalidade familiar', () => {
  expect(getInitialRegistrationRole('school', 'coordenador')).toBe('coordenador');
  expect(getInitialRegistrationRole('pilot', 'admin')).toBe('admin');
  expect(getInitialRegistrationRole('school', 'professor', 'family')).toBe('estudante');
});
