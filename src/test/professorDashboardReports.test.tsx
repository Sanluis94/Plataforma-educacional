import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useProfessorDashboard } from '../modules/core/hooks/useProfessorDashboard';
import type { LocalClassReport } from '../modules/data/services/localEtlClient';
import { buildClassLearningReport } from '../modules/data/services/learningAnalytics';

const fixtures = vi.hoisted(() => ({
  classes: [{ id: 'class-a', name: 'Turma A', studentsCount: 1 }, { id: 'class-b', name: 'Turma B', studentsCount: 1 }],
  getReport: vi.fn<(classId: string) => Promise<LocalClassReport | null>>(),
}));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'professor-test' }, userData: { role: 'professor' } }) }));
vi.mock('../modules/data/repositories/classRepository', () => ({ getProfessorClasses: vi.fn(async () => fixtures.classes) }));
vi.mock('../modules/data/repositories/activityRepository', () => ({ getActivitiesByProfessor: vi.fn(async () => []), deleteActivity: vi.fn() }));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ getSubmissionsByClass: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/reportRepository', () => ({ getLiveClassReport: fixtures.getReport, getProfessorLearningOverview: vi.fn(async () => ({ completionRate: null, engagement: null })) }));
vi.mock('../modules/core/services/professorService', () => ({ createNewClass: vi.fn(), validateClassName: vi.fn(), publishActivity: vi.fn() }));

function report(classId: string): LocalClassReport {
  return buildClassLearningReport({ classData: { id: classId, name: classId, professorId: 'professor-test', professorName: 'Professor', studentIds: [], studentsCount: 0, createdAt: '2026-10-11T00:00:00Z', updatedAt: '2026-10-11T00:00:00Z' }, users: [], activities: [], submissions: [], source: 'local' });
}

beforeEach(() => {
  cleanup();
  fixtures.getReport.mockReset();
  fixtures.getReport.mockImplementation(async classId => report(classId));
});

describe('relatórios ligados à navegação do professor', () => {
  it('carrega ao entrar na aba, respeita a turma da URL e busca novamente ao atualizar', async () => {
    const { result, rerender } = renderHook(({ tab, classId }) => useProfessorDashboard({ activeTab: tab, classId }), { initialProps: { tab: 'classes', classId: 'class-b' } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fixtures.getReport).not.toHaveBeenCalled();
    rerender({ tab: 'reports', classId: 'class-b' });
    await waitFor(() => expect(result.current.classReport?.classId).toBe('class-b'));
    expect(fixtures.getReport).toHaveBeenCalledExactlyOnceWith('class-b');
    await act(async () => { await result.current.refreshReport(); });
    expect(fixtures.getReport).toHaveBeenCalledTimes(2);
  });

  it('não mostra uma resposta antiga após trocar a turma', async () => {
    let finishFirst!: (value: LocalClassReport) => void;
    fixtures.getReport.mockImplementation(classId => classId === 'class-a' ? new Promise(resolve => { finishFirst = resolve; }) : Promise.resolve(report(classId)));
    const { result, rerender } = renderHook(({ classId }) => useProfessorDashboard({ activeTab: 'reports', classId }), { initialProps: { classId: 'class-a' } });
    await waitFor(() => expect(fixtures.getReport).toHaveBeenCalledWith('class-a'));
    rerender({ classId: 'class-b' });
    await waitFor(() => expect(result.current.classReport?.classId).toBe('class-b'));
    await act(async () => { finishFirst(report('class-a')); });
    expect(result.current.classReport?.classId).toBe('class-b');
  });

  it('expõe a falha e permite buscar novamente sem trocar de aba', async () => {
    fixtures.getReport.mockRejectedValueOnce(new Error('Falha de conexão'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useProfessorDashboard({ activeTab: 'reports', classId: 'class-a' }));
    await waitFor(() => expect(result.current.reportError).toMatch(/Não foi possível carregar/));
    await act(async () => { await result.current.refreshReport(); });
    expect(result.current.reportError).toBeNull();
    expect(result.current.classReport?.classId).toBe('class-a');
    log.mockRestore();
  });
});
