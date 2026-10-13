import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStudentDashboard } from '../modules/core/hooks/useStudentDashboard';
import type { Turma } from '../modules/data/repositories/classRepository';

const fixtures = vi.hoisted(() => ({ uid: 'student-a', subscriptions: [] as { uid: string; next: (classes: Turma[]) => void; error: (error: Error) => void; unsubscribe: ReturnType<typeof vi.fn> }[], readClasses: vi.fn() }));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: fixtures.uid }, userData: { role: 'estudante', gradeLevel: 'medio' } }) }));
vi.mock('../modules/data/repositories/classRepository', () => ({
  getStudentClasses: fixtures.readClasses, enrollStudent: vi.fn(),
  subscribeStudentClasses: (uid: string, next: (classes: Turma[]) => void, error: (error: Error) => void) => { const unsubscribe = vi.fn(); fixtures.subscriptions.push({ uid, next, error, unsubscribe }); return unsubscribe; },
}));
vi.mock('../modules/data/repositories/studentRepository', () => ({ getStudentProgress: vi.fn(async () => ({ level: 1, xp: 0, coins: 0, completedModules: [], purchasedItems: [], updatedAt: new Date().toISOString() })) }));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ getSubmissionsByStudent: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/activityRepository', () => ({ getActivitiesByClass: vi.fn(async () => []) }));
vi.mock('../modules/core/services/offlineSyncService', () => ({ offlineSyncService: { subscribeStatus: () => () => {} } }));
beforeEach(() => { fixtures.uid = 'student-a'; fixtures.subscriptions = []; fixtures.readClasses.mockClear(); });
afterEach(cleanup);

describe('matrícula acompanhada pela assinatura existente de turmas', () => {
  it('reflete remoção da turma sem recarregar a página e limpa erro de consulta', async () => {
    const { result } = renderHook(() => useStudentDashboard());
    await waitFor(() => expect(fixtures.subscriptions).toHaveLength(1));
    act(() => fixtures.subscriptions[0].next([{ id: 'class-a', name: 'Turma A', studentsCount: 1 }]));
    expect(result.current.studentClasses.map(turma => turma.id)).toEqual(['class-a']);
    act(() => fixtures.subscriptions[0].next([]));
    expect(result.current.studentClasses).toEqual([]);
    expect(fixtures.readClasses).not.toHaveBeenCalled();
    act(() => fixtures.subscriptions[0].error(new Error('permission-denied')));
    expect(result.current.classesError).toMatch(/confirmar sua matrícula/);
    expect(result.current.classesLoading).toBe(false);
  });
  it('cancela a assinatura anterior e ignora dados e erros atrasados de outra conta', async () => {
    const { result, rerender } = renderHook(() => useStudentDashboard());
    const previous = fixtures.subscriptions[0];
    fixtures.uid = 'student-b'; rerender();
    expect(previous.unsubscribe).toHaveBeenCalledOnce();
    act(() => { previous.next([{ id: 'private-a', name: 'Turma da conta A', studentsCount: 1 }]); previous.error(new Error('old account')); });
    expect(result.current.studentClasses).toEqual([]); expect(result.current.classesError).toBe('');
    act(() => fixtures.subscriptions[1].next([{ id: 'class-b', name: 'Turma B', studentsCount: 1 }]));
    expect(result.current.studentClasses.map(turma => turma.id)).toEqual(['class-b']);
  });
});
