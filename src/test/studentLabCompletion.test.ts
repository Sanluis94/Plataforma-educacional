import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PROGRESS } from '../modules/data/types';
import type { ProgressData } from '../modules/data/types';

const fixture = vi.hoisted(() => ({
  db: null as object | null,
  remote: new Map<string, ProgressData>(),
  transaction: vi.fn(),
  log: vi.fn(),
}));
vi.mock('../modules/core/services/firebaseConfig', () => ({ get db() { return fixture.db; } }));
vi.mock('../modules/data/repositories/logRepository', () => ({ writeLog: fixture.log }));
vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, _collection: string, uid: string) => ({ uid }),
  getDoc: vi.fn(), setDoc: vi.fn(), updateDoc: vi.fn(), arrayUnion: vi.fn(),
  runTransaction: fixture.transaction,
}));

import { completeStudentLabProgress } from '../modules/data/repositories/studentRepository';
import { completeStudentLab } from '../modules/core/services/studentLabService';
import { getLocalEtlProgress } from '../modules/data/services/localEtlClient';

beforeEach(() => {
  fixture.db = null;
  fixture.remote.clear();
  fixture.transaction.mockReset();
  fixture.log.mockReset();
  localStorage.setItem('edu_local_db', JSON.stringify({ users: [], classes: [], activities: [], progress: {}, systemLogs: [], learningEvents: [] }));
});
afterEach(() => { localStorage.clear(); });

describe('Conclusão persistente dos laboratórios', () => {
  it('preserva uma nota 67 e grava conclusão, XP e moedas juntos', async () => {
    const result = await completeStudentLabProgress('student', 'lab', 67);
    expect(result).toMatchObject({ alreadyCompleted: false, progress: { xp: 53, coins: 20, level: 1, completedModules: ['lab'] } });
    expect(await getLocalEtlProgress('student')).toMatchObject({ xp: 53, coins: 20, level: 1, completedModules: ['lab'], purchasedItems: [] });
  });

  it('roteiro e bancada simultâneos recompensam o mesmo ID apenas uma vez', async () => {
    const results = await Promise.all([completeStudentLabProgress('student', 'same', 100), completeStudentLabProgress('student', 'same', 100)]);
    expect(results.map(result => result.alreadyCompleted)).toEqual([false, true]);
    expect(await getLocalEtlProgress('student')).toMatchObject({ xp: 80, coins: 30, completedModules: ['same'] });
    expect((await completeStudentLabProgress('student', 'same', 100)).alreadyCompleted).toBe(true);
  });

  it('não perde progresso quando duas atividades diferentes concluem juntas', async () => {
    await Promise.all([completeStudentLabProgress('student', 'first', 100), completeStudentLabProgress('student', 'second', 50)]);
    expect(await getLocalEtlProgress('student')).toMatchObject({ xp: 120, coins: 45, completedModules: ['first', 'second'] });
  });

  it('não concede progresso a professor, administrador ou sessão ausente', async () => {
    const evidence = { schemaVersion: 1 as const, source: 'lab' as const, sessionId: 'fictitious' };
    for (const role of ['professor', 'admin', 'coordenador'] as const) expect(await completeStudentLab('teacher', role, { id: 'lab', title: 'Teste' }, 100, evidence)).toBeNull();
    expect(await completeStudentLab(undefined, 'estudante', { id: 'lab', title: 'Teste' }, 100, evidence)).toBeNull();
    expect(await getLocalEtlProgress('teacher')).toBeNull();
    expect(fixture.log).not.toHaveBeenCalled();
  });

  it('valida a escala 0 a 100 sem aceitar NaN, negativos ou notas de 1000', async () => {
    for (const score of [NaN, -1, 101, 1000]) await expect(completeStudentLabProgress('student', 'lab', score)).rejects.toThrow('inválidos');
    expect(await getLocalEtlProgress('student')).toBeNull();
  });

  it('usa a transação remota e preserva compras, turmas e módulos anteriores', async () => {
    fixture.db = {};
    fixture.remote.set('student', { ...DEFAULT_PROGRESS, xp: 450, coins: 20, completedModules: ['old'], purchasedItems: ['book'], enrolledClasses: ['class'] });
    fixture.transaction.mockImplementation(async (_db, callback) => callback({
      get: async ({ uid }: { uid: string }) => ({ exists: () => fixture.remote.has(uid), data: () => fixture.remote.get(uid) }),
      set: ({ uid }: { uid: string }, progress: ProgressData) => fixture.remote.set(uid, progress),
    }));
    await completeStudentLabProgress('student', 'new', 100);
    const again = await completeStudentLabProgress('student', 'new', 100);
    expect(again).toMatchObject({ alreadyCompleted: true, progress: { xp: 530, level: 2, coins: 50, completedModules: ['old', 'new'], purchasedItems: ['book'], enrolledClasses: ['class'] } });
    expect(fixture.transaction).toHaveBeenCalledTimes(2);
    expect(await getLocalEtlProgress('student')).toBeNull();
  });

  it('propaga a falha remota, não inventa conclusão local e permite tentar novamente', async () => {
    fixture.db = {};
    fixture.transaction.mockRejectedValueOnce(new Error('permission-denied'));
    await expect(completeStudentLabProgress('student', 'lab', 100)).rejects.toThrow('permission-denied');
    expect(await getLocalEtlProgress('student')).toBeNull();
    fixture.transaction.mockImplementation(async (_db, callback) => callback({
      get: async () => ({ exists: () => false }), set: vi.fn(),
    }));
    expect(await completeStudentLabProgress('student', 'lab', 100)).toMatchObject({ alreadyCompleted: false, progress: { xp: 80 } });
  });
});
