import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttendanceRecord } from '../modules/data/types';

const backend = vi.hoisted(() => ({ remote: false, fail: false, stored: new Map<string, Record<string, unknown>>() }));
vi.mock('../modules/core/services/firebaseConfig', () => ({ get db() { return backend.remote ? {} : null; } }));
vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  collection: (_db: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  query: (reference: { path: string }, constraint: unknown) => ({ ...reference, constraint }),
  where: (field: string, _comparison: string, value: string) => ({ field, value }),
  getDocs: async (reference: { path: string; constraint?: { field: string; value: string } }) => ({ docs: [...backend.stored].filter(([path, data]) => path.startsWith(reference.path + '/') && path.slice(reference.path.length + 1).split('/').length === 1 && (!reference.constraint || data[reference.constraint.field] === reference.constraint.value)).map(([path, data]) => ({ id: path.split('/').at(-1), data: () => structuredClone(data) })) }),
  writeBatch: () => {
    const writes: [string, Record<string, unknown> | null][] = [];
    return { set: (reference: { path: string }, data: Record<string, unknown>) => writes.push([reference.path, structuredClone(data)]), delete: (reference: { path: string }) => writes.push([reference.path, null]), commit: async () => { if (backend.fail) throw new Error('unavailable'); writes.forEach(([path, data]) => { if (data) backend.stored.set(path, data); else backend.stored.delete(path); }); } };
  },
}));
import { saveAttendanceRecord, getStudentAttendanceRecords, calculateStudentAttendanceRate } from '../modules/data/repositories/gradebookRepository';

const record: Omit<AttendanceRecord, 'id'> = { turmaId: 'class-a', data: '2026-10-13', criadoEm: '2026-10-13T12:00:00Z', conteudoResumo: 'Investigação da turma.', registros: [{ studentId: 'student-a', studentName: 'Aluna A', status: 'presente' }, { studentId: 'student-b', studentName: 'Aluno B', status: 'falta' }] };
beforeEach(() => { backend.remote = false; backend.fail = false; backend.stored.clear(); localStorage.clear(); });

describe('publicação individual de frequência', () => {
  it('modo local devolve apenas o registro do estudante solicitado', async () => {
    await saveAttendanceRecord(record);
    const own = await getStudentAttendanceRecords('class-a', 'student-a');
    expect(own[0].registros).toEqual([record.registros[0]]);
    expect(JSON.stringify(own)).not.toContain('Aluno B');
    expect(calculateStudentAttendanceRate('student-a', own).taxaPercentual).toBe(100);
  });
  it('publica somente campos mínimos e preserva correção de frequência', async () => {
    backend.remote = true;
    const saved = await saveAttendanceRecord(record);
    const ownPath = `classes/class-a/attendance_students/student-a/records/${saved.id}`;
    expect(backend.stored.get(ownPath)).toEqual({ sourceId: saved.id, sourceIndex: 0, data: record.data, aulaNumero: 1, status: 'presente', updatedAt: record.criadoEm });
    expect(JSON.stringify(backend.stored.get(ownPath))).not.toContain('Aluna A');
    await saveAttendanceRecord({ ...record, registros: [{ ...record.registros[0], status: 'justificada' }] });
    expect(backend.stored.has(`classes/class-a/attendance_students/student-b/records/${saved.id}`)).toBe(false);
    const own = await getStudentAttendanceRecords('class-a', 'student-a');
    expect(own).toHaveLength(1); expect(own[0].registros).toEqual([{ studentId: 'student-a', studentName: '', status: 'justificada' }]);
    expect(calculateStudentAttendanceRate('student-a', own).taxaPercentual).toBe(0);
  });
  it('falha do lote conserva a chamada anterior e todas as projeções', async () => {
    backend.remote = true; await saveAttendanceRecord(record);
    const previous = structuredClone([...backend.stored]); backend.fail = true;
    await expect(saveAttendanceRecord({ ...record, registros: [{ ...record.registros[0], status: 'falta' }] })).rejects.toThrow('unavailable');
    expect([...backend.stored]).toEqual(previous);
  });
  it('chamada antiga sem projeção não devolve dados dos colegas ao aluno', async () => {
    backend.remote = true; backend.stored.set('attendance/legacy', record as unknown as Record<string, unknown>);
    expect(await getStudentAttendanceRecords('class-a', 'student-a')).toEqual([]);
  });
  it('histórico misto calcula somente a parcela publicada sem abrir chamada antiga', async () => {
    backend.remote = true;
    backend.stored.set('attendance/legacy', { ...record, data: '2026-10-12', registros: [{ ...record.registros[0], status: 'falta' }] });
    await saveAttendanceRecord(record);
    const published = await getStudentAttendanceRecords('class-a', 'student-a');
    expect(published).toHaveLength(1);
    expect(calculateStudentAttendanceRate('student-a', published)).toEqual(expect.objectContaining({ totalAulas: 1, taxaPercentual: 100 }));
    expect(published.some(entry => entry.data === '2026-10-12')).toBe(false);
  });
});
