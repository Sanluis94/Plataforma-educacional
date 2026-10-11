import { afterEach, beforeEach, expect, it } from 'vitest';
import { enrollLocalStudent } from '../modules/data/services/localEtlClient';

beforeEach(() => localStorage.setItem('edu_local_db', JSON.stringify({ users: [], classes: [{ id: 'class-alpha', code: 'QA0001', name: 'Turma fictícia', studentIds: [], studentsCount: 0 }], activities: [], progress: {}, systemLogs: [], learningEvents: [] })));
afterEach(() => localStorage.clear());
it('rejects a missing code without granting membership', async () => {
  await expect(enrollLocalStudent('INVALIDO', 'qa-student')).rejects.toThrow('Código de turma não encontrado');
  expect(JSON.parse(localStorage.getItem('edu_local_db')!).classes[0].studentIds).toEqual([]);
});
it('accepts an exact code and preserves one membership on retry', async () => {
  await enrollLocalStudent('qa0001', 'qa-student');
  await enrollLocalStudent('QA0001', 'qa-student');
  const turma = JSON.parse(localStorage.getItem('edu_local_db')!).classes[0];
  expect(turma.studentIds).toEqual(['qa-student']);
  expect(turma.studentsCount).toBe(1);
});
it('rejects a partial class ID when a complete code is available', async () => {
  await expect(enrollLocalStudent('class', 'qa-student')).rejects.toThrow('Código de turma não encontrado');
});
