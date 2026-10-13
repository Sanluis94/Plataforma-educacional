import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  auth: { currentUser: null as { uid: string; email: string; displayName: string } | null },
  db: {} as object | null,
  user: { uid: 'privacy-test-uid', email: 'private-person@example.test', displayName: 'Nome privado fictício' },
  getDoc: vi.fn(), popup: vi.fn(), write: vi.fn(), commit: vi.fn(), signOut: vi.fn(),
}));
vi.mock('../modules/core/services/firebaseConfig', () => ({ auth: fixture.auth, get db() { return fixture.db; } }));
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {}, onAuthStateChanged: vi.fn((_auth, listener) => { void listener(null); return () => {}; }),
  signInWithPopup: fixture.popup, signOut: fixture.signOut,
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })), collection: vi.fn((_db, name) => ({ name })),
  getDoc: fixture.getDoc, setDoc: vi.fn(), addDoc: fixture.write,
  writeBatch: vi.fn(() => ({ set: vi.fn(), commit: fixture.commit })),
}));
vi.mock('../modules/data/services/localEtlClient', () => ({ getLocalEtlUserByRole: vi.fn() }));
import { AuthProvider, useAuth } from '../modules/core/contexts/AuthContext';
import { writeLog } from '../modules/data/repositories/logRepository';

function Controls() {
  const { loginWithGoogle, logout, userData } = useAuth();
  return <><output aria-label="Perfil">{userData?.role ?? 'sem perfil'}</output>
    <button onClick={() => { void loginWithGoogle('estudante', 'medio').catch(() => {}); }}>Entrar</button>
    <button onClick={() => { void logout(); }}>Sair</button></>;
}
beforeEach(() => {
  localStorage.clear(); fixture.auth.currentUser = null; fixture.db = {};
  fixture.getDoc.mockReset(); fixture.write.mockReset().mockResolvedValue({ id: 'log-ficticio' });
  fixture.commit.mockReset().mockResolvedValue(undefined); fixture.signOut.mockReset().mockResolvedValue(undefined);
  fixture.popup.mockReset().mockImplementation(async () => { fixture.auth.currentUser = fixture.user; return { user: fixture.user }; });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('cadastro, login e logout conservam UID sem repetir nome ou email nos logs', async () => {
  fixture.getDoc.mockResolvedValue({ exists: () => false });
  render(<AuthProvider><Controls /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Entrar' }));
  await waitFor(() => expect(fixture.write).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
  await waitFor(() => expect(fixture.signOut).toHaveBeenCalledTimes(1));
  const events = fixture.write.mock.calls.map(([, record]) => record);
  expect(events.map(event => event.message)).toEqual(['Cadastro criado via Google.', 'Login via Google concluído.', 'Sessão encerrada.']);
  for (const event of events) expect(event).toMatchObject({ type: 'auth', userId: fixture.user.uid });
  expect(JSON.stringify(events)).not.toContain(fixture.user.email);
  expect(JSON.stringify(events)).not.toContain(fixture.user.displayName);
});

it('login existente registra somente o evento e usa o perfil salvo para acesso', async () => {
  fixture.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ name: fixture.user.displayName, email: fixture.user.email, role: 'professor', gradeLevel: 'medio' }) });
  render(<AuthProvider><Controls /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Entrar' }));
  await screen.findByText('professor');
  expect(fixture.write).toHaveBeenCalledTimes(1);
  expect(fixture.write.mock.calls[0][1]).toMatchObject({ message: 'Login via Google concluído.', userId: fixture.user.uid });
  expect(fixture.commit).not.toHaveBeenCalled();
});

it.each(['auth/network-request-failed', 'auth/popup-closed-by-user'])('falha %s registra código conhecido sem mensagem, token ou stack arbitrário', async code => {
  const sensitiveError = Object.assign(new Error(`Conta ${fixture.user.email}; token=fictitious-sensitive-value`), { code });
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  fixture.popup.mockRejectedValueOnce(sensitiveError);
  render(<AuthProvider><Controls /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Entrar' }));
  await waitFor(() => expect(fixture.write).toHaveBeenCalledTimes(1));
  const stored = fixture.write.mock.calls[0][1];
  expect(stored).toMatchObject({ type: 'error', message: `Falha no login com Google (${code}).` });
  expect(JSON.stringify([stored, consoleError.mock.calls])).not.toContain(fixture.user.email);
  expect(JSON.stringify([stored, consoleError.mock.calls])).not.toContain('fictitious-sensitive-value');
});

it('código de erro não reconhecido não passa dados pessoais para logs nem console', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  fixture.popup.mockRejectedValueOnce({ code: `private/${fixture.user.email}`, message: fixture.user.displayName });
  render(<AuthProvider><Controls /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Entrar' }));
  await waitFor(() => expect(fixture.write).toHaveBeenCalledTimes(1));
  expect(fixture.write.mock.calls[0][1].message).toBe('Falha no login com Google (unknown).');
  expect(consoleError.mock.calls[0]).toEqual(['Não foi possível concluir o login com Google.', 'unknown']);
});

it('falha do transporte de logs não bloqueia login nem imprime o objeto da falha', async () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  fixture.write.mockRejectedValue(new Error(`Caminho privado de ${fixture.user.email}`));
  fixture.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'estudante', name: fixture.user.displayName, email: fixture.user.email }) });
  render(<AuthProvider><Controls /></AuthProvider>);
  fireEvent.click(await screen.findByRole('button', { name: 'Entrar' }));
  await screen.findByText('estudante');
  await waitFor(() => expect(consoleError).toHaveBeenCalledWith('[LogRepository] Não foi possível registrar o evento.'));
  expect(JSON.stringify(consoleError.mock.calls)).not.toContain(fixture.user.email);
});

it('ambiente sem Firestore não despeja o conteúdo do log no console', async () => {
  fixture.db = null;
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await writeLog('auth', `Mensagem privada ${fixture.user.email}`, fixture.user.uid);
  expect(warn).toHaveBeenCalledWith('[LogRepository] Firestore não inicializado. Registro de evento indisponível.');
  expect(JSON.stringify(warn.mock.calls)).not.toContain(fixture.user.email);
});
