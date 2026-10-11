import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({ db: null as object | null, getDocs: vi.fn() }));
vi.mock('../modules/core/services/firebaseConfig', () => ({ get db() { return fixture.db; } }));
vi.mock('firebase/firestore', async importOriginal => ({
  ...await importOriginal<typeof import('firebase/firestore')>(),
  collection: vi.fn(), query: vi.fn(), where: vi.fn(), getDocs: fixture.getDocs,
}));
import { getProfessorClasses, getStudentClasses } from '../modules/data/repositories/classRepository';

const classes = [
  { id: 'first', name: 'Fundamental II', professorId: 'teacher', professorName: 'Docente', studentIds: ['student'], gradeLevel: 'fundamental_2' },
  { id: 'second', name: 'Pós-graduação', professorId: 'teacher', professorName: 'Docente', studentIds: ['student'], academicLevel: 'pos_graduacao' },
  { id: 'third', name: 'Sem nível', professorId: 'teacher', professorName: 'Docente', studentIds: ['student'] },
];
beforeEach(() => {
  fixture.db = null;
  fixture.getDocs.mockReset();
  localStorage.setItem('edu_local_db', JSON.stringify({ classes, users: [], activities: [], progress: {}, systemLogs: [], learningEvents: [] }));
});
afterEach(() => { localStorage.clear(); });

describe('Nível acadêmico na leitura de turmas', () => {
  it.each(['local', 'remoto'])('mantém os metadados %s sem atribuir Médio a uma turma sem nível', async mode => {
    if (mode === 'remoto') {
      fixture.db = {};
      fixture.getDocs.mockResolvedValue({ docs: classes.map(data => ({ id: data.id, data: () => data })) });
    }
    for (const result of [await getProfessorClasses('teacher'), await getStudentClasses('student')]) {
      expect(result.find(turma => turma.id === 'first')?.gradeLevel).toBe('fundamental_2');
      expect(result.find(turma => turma.id === 'second')?.academicLevel).toBe('pos_graduacao');
      expect(result.find(turma => turma.id === 'third')?.gradeLevel).toBeUndefined();
      expect(result.find(turma => turma.id === 'third')?.academicLevel).toBeUndefined();
    }
  });
});
