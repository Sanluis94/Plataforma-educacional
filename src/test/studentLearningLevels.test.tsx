import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { EstudanteDashboard } from '../modules/ux/pages/EstudanteDashboard';
import { LEARNING_LABS_CATALOG, getLearningLab, searchLearningLabs } from '../modules/core/constants/learningCatalog';
import { LEARNING_LEVELS } from '../modules/core/constants/learningLevels';

const session = vi.hoisted(() => ({
  currentUser: { uid: 'student-level-test', displayName: 'Estudante' },
  userData: { role: 'estudante', gradeLevel: 'fundamental_1' },
}));

vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => session }));
vi.mock('../modules/core/constants/dashboardConstants', () => ({
  SHOP_ITEMS: [],
  ALL_MODULES: [{ id: 'matematica', label: 'Matemática', labs: [{
    id: 'math_3', title: 'Funções Trigonométricas', props: { mode: 'trigonometric' },
    component: ({ labId }: { labId: string }) => <div data-testid="legacy-bench">{labId}</div>,
  }] }],
}));
vi.mock('../modules/data/repositories/studentRepository', () => ({
  getStudentProgress: vi.fn(async () => ({ level: 1, xp: 0, coins: 0, completedModules: [], purchasedItems: [] })),
}));
vi.mock('../modules/core/services/studentService', () => ({
  getAIRecommendation: vi.fn(async () => ({ message: 'Continue estudando.' })),
  processModuleCompletion: vi.fn(), processItemPurchase: vi.fn(),
}));
vi.mock('../modules/data/repositories/classRepository', () => ({
  getStudentClasses: vi.fn(async () => []), enrollStudent: vi.fn(), sendStudentMessage: vi.fn(),
  subscribeStudentMessages: vi.fn(() => () => {}), subscribeClassNotices: vi.fn(() => () => {}),
  subscribeEnhancedMaterials: vi.fn(() => () => {}),
}));
vi.mock('../modules/data/repositories/examRepository', () => ({
  getExamAttemptsByStudent: vi.fn(async () => []), subscribeExamsByClass: vi.fn(() => () => {}), saveExamAttempt: vi.fn(),
}));
vi.mock('../modules/data/repositories/lessonPlanRepository', () => ({ subscribeLessonPlansByClass: vi.fn(() => () => {}) }));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ saveSubmission: vi.fn() }));
vi.mock('../modules/core/services/soundEffects', () => ({ default: { playClick: vi.fn(), playUnlock: vi.fn() } }));
vi.mock('../modules/ux/components/StudentLmsModules', () => ({ StudentLmsModules: () => null }));
vi.mock('../modules/ux/components/labs/LabLearningWorkspace', () => ({
  LabLearningWorkspace: ({ labId, academicLevel, children }: { labId: string; academicLevel: string; children: React.ReactNode }) =>
    <section data-testid="learning-workspace" data-level={academicLevel} aria-label={labId}>{children}</section>,
}));

function Destination() {
  const location = useLocation();
  return <output data-testid="destination">{location.pathname}{location.search}</output>;
}

function renderStudent(url = '/estudante') {
  return render(<MemoryRouter initialEntries={[url]}><Routes>
    <Route path="/estudante" element={<EstudanteDashboard />} />
    <Route path="/simulacao" element={<Destination />} />
  </Routes></MemoryRouter>);
}

beforeEach(() => {
  cleanup();
  session.userData.gradeLevel = 'fundamental_1';
});

describe('trilha do estudante por nível de aprendizado', () => {
  it('começa no nível do perfil e oferece apenas disciplinas e tópicos dessa etapa', async () => {
    renderStudent();
    expect(screen.getByRole('combobox', { name: 'Nível de aprendizado' })).toHaveValue('fundamental_1');
    const labs = searchLearningLabs({ academicLevel: 'fundamental_1' });
    expect(screen.getByRole('status')).toHaveTextContent(`${labs.length} laboratórios`);
    const subject = screen.getByRole('combobox', { name: 'Disciplina' });
    expect([...subject.querySelectorAll('option')].map(option => option.value)).toEqual([...new Set(labs.map(lab => lab.subject))]);
    expect(screen.queryByRole('article', { name: 'Funções Trigonométricas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('article', { name: 'Matrizes e Sistemas' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('article').length).toBeGreaterThan(0));
  });

  it('reconcilia a disciplina ao trocar de nível e mantém apenas os tópicos correspondentes', () => {
    renderStudent('/estudante?level=graduacao&subject=disciplina-inexistente');
    const level = screen.getByRole('combobox', { name: 'Nível de aprendizado' });
    expect(level).toHaveValue('graduacao');
    fireEvent.change(level, { target: { value: 'pos_graduacao' } });
    const subject = screen.getByRole('combobox', { name: 'Disciplina' }) as HTMLSelectElement;
    const validLabs = searchLearningLabs({ academicLevel: 'pos_graduacao', subject: subject.value });
    expect(validLabs.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('article').map(article => article.getAttribute('aria-label'))).toEqual(validLabs.map(lab => lab.title));
  });

  it('disponibiliza os 582 IDs uma vez em sua etapa e disciplina, incluindo formação profissional', async () => {
    await act(async () => { renderStudent(); });
    const visibleIds: string[] = [];
    for (const level of LEARNING_LEVELS) {
      fireEvent.change(screen.getByRole('combobox', { name: 'Nível de aprendizado' }), { target: { value: level.id } });
      const subjectSelect = screen.getByRole('combobox', { name: 'Disciplina' });
      const subjects = [...subjectSelect.querySelectorAll('option')].map(option => option.value);
      for (const subject of subjects) {
        fireEvent.change(subjectSelect, { target: { value: subject } });
        const articles = screen.getAllByRole('article');
        expect(articles.every(article => article.getAttribute('data-academic-level') === level.id)).toBe(true);
        const ids = articles.map(article => article.getAttribute('data-lab-id')!);
        expect(ids).toEqual(searchLearningLabs({ academicLevel: level.id, subject }).map(lab => lab.id));
        visibleIds.push(...ids);
      }
    }
    expect(visibleIds).toHaveLength(582);
    expect(new Set(visibleIds)).toEqual(new Set(LEARNING_LABS_CATALOG.map(lab => lab.id)));
  }, 20_000);

  it('abre o legado solicitado pela URL no nível real e o fecha ao mudar de etapa', async () => {
    const lab = getLearningLab('math_3')!;
    renderStudent('/estudante?lab=math_3&level=fundamental_1');
    expect(await screen.findByTestId('legacy-bench')).toHaveTextContent('math_3');
    expect(screen.getByRole('combobox', { name: 'Nível de aprendizado' })).toHaveValue(lab.academicLevel);
    expect(screen.getByTestId('learning-workspace')).toHaveAttribute('data-level', lab.academicLevel);
    fireEvent.change(screen.getByRole('combobox', { name: 'Nível de aprendizado' }), { target: { value: 'fundamental_1' } });
    expect(screen.queryByTestId('legacy-bench')).not.toBeInTheDocument();
    expect(screen.queryByRole('article', { name: lab.title })).not.toBeInTheDocument();
  });

  it('encaminha um laboratório do catálogo para seu ID exato na simulação', async () => {
    const lab = searchLearningLabs({ academicLevel: 'fundamental_1' }).find(item => item.source === 'catalog')!;
    renderStudent(`/estudante?level=${lab.academicLevel}&subject=${encodeURIComponent(lab.subject)}`);
    fireEvent.click(screen.getByRole('button', { name: `Iniciar ${lab.title}` }));
    expect(await screen.findByTestId('destination')).toHaveTextContent(`/simulacao?lab=${lab.id}&level=${lab.academicLevel}`);
  });

  it('preserva as abas LMS depois de abrir um legado pela URL', async () => {
    renderStudent('/estudante?lab=math_3&tab=labs');
    await screen.findByTestId('legacy-bench');
    fireEvent.click(screen.getByRole('button', { name: /Plano de Aulas/ }));
    expect(screen.getByText('📅 Cronograma & Plano de Aulas da Turma')).toBeInTheDocument();
    expect(screen.queryByTestId('legacy-bench')).not.toBeInTheDocument();
  });
});
