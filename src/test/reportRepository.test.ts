import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixtures = vi.hoisted(() => ({
  records: new Map<string, Record<string, unknown>>(),
  collections: new Map<string, Record<string, unknown>[]>(),
  denied: '',
  actor: 'p1',
  readPaths: [] as string[],
}));
vi.mock('../modules/core/services/firebaseConfig', () => ({ db: {}, auth: { get currentUser() { return { uid: fixtures.actor }; } } }));
vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, name: string, id: string) => ({ name, id }),
  collection: (_db: unknown, name: string) => name,
  where: (field: string, op: string, value: string) => ({ field, op, value }),
  query: (name: string, condition: { field: string; value: string }) => ({ name, condition }),
  getDoc: async ({ name, id }: { name: string; id: string }) => {
    fixtures.readPaths.push(`${name}/${id}`);
    if (fixtures.denied === name) throw new Error('permission-denied');
    const data = fixtures.records.get(`${name}/${id}`);
    return { id, exists: () => Boolean(data), data: () => data };
  },
  getDocs: async ({ name, condition }: { name: string; condition: { field: string; value: string } }) => {
    fixtures.readPaths.push(name);
    if (fixtures.denied === name) throw new Error('permission-denied');
    return { docs: (fixtures.collections.get(name) ?? []).filter(row => row[condition.field] === condition.value).map(row => ({ id: row.id, data: () => row })) };
  },
}));
vi.mock('../modules/data/services/localEtlClient', () => ({ getLocalEtlClassReport: vi.fn() }));

import { getLiveClassReport, getProfessorLearningOverview } from '../modules/data/repositories/reportRepository';

beforeEach(() => {
  fixtures.records.clear(); fixtures.collections.clear(); fixtures.readPaths = []; fixtures.denied = ''; fixtures.actor = 'p1';
  fixtures.records.set('classes/c1', { name: 'Turma A', professorId: 'p1', professorName: 'Professora', studentIds: ['s1', 's2'], studentsCount: 2 });
  fixtures.records.set('users/s1', { name: 'Nome do perfil', role: 'estudante' });
  fixtures.records.set('progress/s1', { level: 4, xp: 800, coins: 100, completedModules: ['outro'] });
  fixtures.collections.set('activities', [{ id: 'a1', title: 'Atividade real', type: 'quiz', classId: 'c1', professorId: 'p1', status: 'published', config: {} }, { id: 'a2', classId: 'c2', professorId: 'p1', status: 'published' }]);
  fixtures.collections.set('submissions', [{ id: 'r1', activityId: 'a1', activityTitle: 'Atividade real', classId: 'c1', studentId: 's1', studentName: 'Nome da entrega', score: 0, status: 'completed', submittedAt: '2026-01-01T10:00:00Z' }]);
});

describe('leitura real do relatório de turma', () => {
  it('consulta fontes por turma, progresso canônico e nomes de perfil, sem tempo inventado', async () => {
    const report = await getLiveClassReport('c1');
    expect(report?.studentsCount).toBe(2);
    expect(report?.expectedCompletions).toBe(2);
    expect(report?.averageScore).toBe(0);
    expect(report?.averageTimeSpentMinutes).toBeNull();
    expect(report?.students[0]).toMatchObject({ studentName: 'Nome do perfil', level: 4, status: 'precisa_apoio' });
    expect(report?.students[1].lastActive).toBeNull();
    expect(fixtures.readPaths).toContain('progress/s1');
    expect(fixtures.readPaths.some(path => path.startsWith('student_progress'))).toBe(false);
    for (const name of ['activities', 'submissions', 'exams', 'exam_attempts', 'lesson_plans']) expect(fixtures.readPaths).toContain(name);
  });
  it('propaga falha de uma fonte em vez de publicar relatório parcial ou vazio', async () => {
    fixtures.denied = 'exam_attempts';
    await expect(getLiveClassReport('c1')).rejects.toThrow('permission-denied');
  });
  it('retorna inexistente somente quando a turma realmente não existe', async () => {
    expect(await getLiveClassReport('missing')).toBeNull();
    expect(fixtures.readPaths).toEqual(['classes/missing']);
  });
  it('rejeita link de outra turma antes de ler entregas e perfis dos seus alunos', async () => {
    fixtures.actor = 'p2';
    fixtures.records.set('users/p2', { role: 'professor' });
    await expect(getLiveClassReport('c1')).rejects.toThrow('não pertence');
    expect(fixtures.readPaths).toEqual(['classes/c1', 'users/p2']);
  });
  it('indicador geral soma os denominadores de cada turma e não multiplica atividades de turmas diferentes', async () => {
    fixtures.records.set('classes/c2', { name: 'Turma B', professorId: 'p1', professorName: 'Professora', studentIds: ['s3'], studentsCount: 1 });
    const overview = await getProfessorLearningOverview(['c1', 'c2', 'c1']);
    expect(overview.completionRate).toBe(33);
    expect(overview.engagement).toBe(33);
  });
});
