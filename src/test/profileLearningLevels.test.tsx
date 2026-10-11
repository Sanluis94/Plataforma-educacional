import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { AuthProvider, useAuth } from '../modules/core/contexts/AuthContext';

vi.mock('../modules/core/services/firebaseConfig', () => ({ auth: null, db: null }));
vi.mock('../modules/data/repositories/logRepository', () => ({ writeLog: vi.fn() }));
vi.mock('../modules/data/services/localEtlClient', () => ({ getLocalEtlUserByRole: vi.fn(async () => null) }));

function Profile() {
  const { userData } = useAuth();
  return <output data-testid="profile-level">{userData?.gradeLevel}</output>;
}

beforeEach(() => { cleanup(); localStorage.clear(); });

describe('normalização do nível do perfil na sessão', () => {
  it.each([
    [{ academicLevel: 'Graduação' }, 'graduacao'],
    [{ gradeLevel: 'Ensino Médio' }, 'medio'],
    [{ gradeLevel: 'profissional', academicLevel: 'graduacao' }, 'profissional'],
    [{ gradeLevel: 'inexistente', academicLevel: 'pos_graduacao' }, 'pos_graduacao'],
    [{ academicLevel: 'fundamental_2' }, 'fundamental_2'],
    [{ gradeLevel: 'inexistente', academicLevel: 'inexistente' }, 'medio'],
  ])('restaura o perfil %j no nível %s sem regravar o cadastro salvo', async (levelData, expected) => {
    const saved = JSON.stringify({
      currentUser: { uid: 'old-session', displayName: 'Teste', email: 'teste@example.test', photoURL: null },
      userData: { role: 'estudante', name: 'Teste', email: 'teste@example.test', ...levelData },
    });
    localStorage.setItem('edu-interact-local-auth-session', saved);
    render(<AuthProvider><Profile /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('profile-level')).toHaveTextContent(expected));
    expect(localStorage.getItem('edu-interact-local-auth-session')).toBe(saved);
  });
});
