import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfessorDashboard } from '../modules/ux/pages/ProfessorDashboard';
import { searchLearningLabs } from '../modules/core/constants/learningCatalog';

const fixtures = vi.hoisted(() => ({
  turma: { id: 'class-level-test', name: 'Turma de teste', studentsCount: 1, academicLevel: undefined as string | undefined },
  savePlan: vi.fn(async (data: Record<string, unknown>) => ({ ...data, id: 'plan-level-test' })),
}));
vi.mock('../modules/core/contexts/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'professor-level-test' }, userData: { gradeLevel: 'medio', name: 'Professora' } }),
}));
vi.mock('../modules/core/hooks/useProfessorDashboard', () => ({
  useProfessorDashboard: () => ({
    turmas: [fixtures.turma], selectedClassId: fixtures.turma.id,
    isCreatingClass: false, newClassName: '', classReport: null, reportLoading: false,
    globalStats: { completionRate: 0, engagement: 0 }, setIsCreatingClass: vi.fn(), setNewClassName: vi.fn(),
    setSelectedClassId: vi.fn(), handleCreateClass: vi.fn(), handleViewClassReport: vi.fn(), exportReportCSV: vi.fn(),
  }),
}));
vi.mock('../modules/core/constants/dashboardConstants', () => ({ ALL_MODULES: [] }));
vi.mock('../modules/core/services/geminiService', () => ({ generatePedagogicalDiagnosis: vi.fn(), generateCompleteLessonWithAI: vi.fn() }));
vi.mock('../modules/data/repositories/classRepository', () => ({
  getStudentMessages: vi.fn(async () => []), replyStudentMessage: vi.fn(), createClassNotice: vi.fn(),
  subscribeStudentMessages: vi.fn(() => () => {}), subscribeClassNotices: vi.fn(() => () => {}),
  subscribeEnhancedMaterials: vi.fn(() => () => {}), deleteClassNotice: vi.fn(),
  addEnhancedMaterial: vi.fn(), deleteEnhancedMaterial: vi.fn(),
}));
vi.mock('../modules/data/repositories/examRepository', () => ({
  saveExam: vi.fn(), getExamsByProfessor: vi.fn(async () => []), updateExam: vi.fn(), deleteExam: vi.fn(),
  getExamAttemptsByClass: vi.fn(async () => []), calculateExamQuestionAnalytics: vi.fn(),
}));
vi.mock('../modules/data/repositories/lessonPlanRepository', () => ({
  saveLessonPlanItem: fixtures.savePlan, updateLessonPlanItem: vi.fn(), deleteLessonPlanItem: vi.fn(),
  subscribeLessonPlansByClass: vi.fn(() => () => {}),
}));
vi.mock('../modules/ux/components/ProfessorLmsModules', () => ({ ProfessorLmsModules: () => null }));
vi.mock('../modules/ux/components/labs/BatchClassManagerModal', () => ({ BatchClassManagerModal: () => null }));

function renderPlanner() {
  render(<MemoryRouter><ProfessorDashboard /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: /Plano de Aulas Bimestral/ }));
}

beforeEach(() => {
  cleanup();
  fixtures.turma.academicLevel = undefined;
  fixtures.savePlan.mockClear();
});

describe('catálogo e planejamento do professor por nível', () => {
  it('oferece os IDs completos da etapa e salva o título de um laboratório do catálogo', async () => {
    renderPlanner();
    fireEvent.change(screen.getByRole('combobox', { name: 'Nível dos laboratórios' }), { target: { value: 'graduacao' } });
    const select = screen.getByRole('combobox', { name: 'Laboratório Virtual Associado' });
    const labs = searchLearningLabs({ academicLevel: 'graduacao' });
    expect([...select.querySelectorAll('option')].map(option => option.value).filter(Boolean)).toEqual(labs.map(lab => lab.id));
    const lab = labs.find(item => item.source === 'catalog')!;
    fireEvent.change(select, { target: { value: lab.id } });
    fireEvent.change(screen.getByPlaceholderText('Ex: Leis da Termodinâmica e Ciclo de Carnot'), { target: { value: 'Aula da graduação' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Aula no/ }));
    await waitFor(() => expect(fixtures.savePlan).toHaveBeenCalledWith(expect.objectContaining({
      turmaId: fixtures.turma.id, laboratorioAssociadoId: lab.id, laboratorioTitulo: lab.title,
    })));
  });

  it('remove a associação anterior quando a etapa muda', () => {
    renderPlanner();
    const select = screen.getByRole('combobox', { name: 'Laboratório Virtual Associado' });
    const lab = searchLearningLabs({ academicLevel: 'medio' })[0];
    fireEvent.change(select, { target: { value: lab.id } });
    expect(select).toHaveValue(lab.id);
    fireEvent.change(screen.getByRole('combobox', { name: 'Nível dos laboratórios' }), { target: { value: 'fundamental_1' } });
    expect(select).toHaveValue('');
    expect([...select.querySelectorAll('option')].some(option => option.value === lab.id)).toBe(false);
  });

  it('usa o nível da turma quando seus metadados estão disponíveis, sem alterá-los', async () => {
    fixtures.turma.academicLevel = 'pos_graduacao';
    renderPlanner();
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Nível dos laboratórios' })).toHaveValue('pos_graduacao'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Nível dos laboratórios' }), { target: { value: 'profissional' } });
    expect(fixtures.turma.academicLevel).toBe('pos_graduacao');
  });
});
