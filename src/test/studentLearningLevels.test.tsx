import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { EstudanteDashboard } from '../modules/ux/pages/EstudanteDashboard';
import { LEARNING_LABS_CATALOG, getLearningLab, searchLearningLabs } from '../modules/core/constants/learningCatalog';
import { LEARNING_LEVELS } from '../modules/core/constants/learningLevels';
import type { Turma } from '../modules/data/repositories/classRepository';
import type { LessonPlanItem } from '../modules/data/types';

const session = vi.hoisted(() => ({
  currentUser: { uid: 'student-level-test', displayName: 'Estudante' },
  userData: { role: 'estudante', gradeLevel: 'fundamental_1' },
}));
const fixtures = vi.hoisted(() => ({
  classes: [] as Turma[],
  plans: [] as LessonPlanItem[],
  enroll: vi.fn(async () => {}),
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
  getStudentClasses: vi.fn(async () => fixtures.classes), enrollStudent: fixtures.enroll, sendStudentMessage: vi.fn(),
  subscribeStudentMessages: vi.fn(() => () => {}), subscribeClassNotices: vi.fn(() => () => {}),
  subscribeEnhancedMaterials: vi.fn(() => () => {}),
}));
vi.mock('../modules/data/repositories/examRepository', () => ({
  getExamAttemptsByStudent: vi.fn(async () => []), subscribeExamsByClass: vi.fn(() => () => {}), saveExamAttempt: vi.fn(),
}));
vi.mock('../modules/data/repositories/lessonPlanRepository', () => ({
  subscribeLessonPlansByClass: vi.fn((_classId: string, callback: (plans: LessonPlanItem[]) => void) => {
    callback(fixtures.plans);
    return () => {};
  }),
}));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ saveSubmission: vi.fn(), getPublishedSubmissionReviewsByStudent:vi.fn(async()=>[]),getSubmissionsByStudentInClass:vi.fn(async()=>[]),getSubmissionsByStudent: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/activityRepository', () => ({ subscribeActivitiesByClass: vi.fn((_classId, callback) => { callback([]); return () => {}; }) }));
vi.mock('../modules/core/services/soundEffects', () => ({ default: { playClick: vi.fn(), playUnlock: vi.fn(), playSuccess: vi.fn() } }));
vi.mock('../modules/ux/components/StudentLmsModules', () => ({
  StudentLmsModules: ({ onViewChange }: { onViewChange: (view: 'forum') => void }) => <button onClick={() => onViewChange('forum')}>Abrir fórum pelo boletim</button>,
}));
vi.mock('../modules/ux/components/labs/LabLearningWorkspace', () => ({
  LabLearningWorkspace: ({ labId, academicLevel, children }: { labId: string; academicLevel: string; children: React.ReactNode }) =>
    <section data-testid="learning-workspace" data-level={academicLevel} aria-label={labId}>{children}</section>,
}));

function Destination() {
  const location = useLocation();
  return <output data-testid="destination">{location.pathname}{location.search}</output>;
}
function HistoryControls() {
  const navigate = useNavigate();
  const location = useLocation();
  return <><button onClick={() => navigate(-1)}>Histórico anterior</button><span data-testid="panel-url">{location.pathname}{location.search}</span></>;
}

function renderStudent(url = '/estudante?tab=labs') {
  return render(<MemoryRouter initialEntries={[url]}><HistoryControls /><Routes>
    <Route path="/estudante" element={<EstudanteDashboard />} />
    <Route path="/simulacao" element={<Destination />} />
  </Routes></MemoryRouter>);
}

beforeEach(() => {
  cleanup();
  session.userData.gradeLevel = 'fundamental_1';
  fixtures.classes = [];
  fixtures.plans = [];
  fixtures.enroll.mockReset();
  fixtures.enroll.mockResolvedValue(undefined);
});

describe('trilha do estudante por nível de aprendizado', () => {
  it('começa no nível do perfil e oferece apenas disciplinas e tópicos dessa etapa', async () => {
    renderStudent();
    expect(screen.getByRole('combobox', { name: 'Nível de aprendizado' })).toHaveValue('fundamental_1');
    const labs = searchLearningLabs({ academicLevel: 'fundamental_1' });
    expect(screen.getAllByRole('status').find(item=>item.textContent?.includes('laboratórios'))).toHaveTextContent(`${labs.length} laboratórios`);
    const subject = screen.getByRole('combobox', { name: 'Disciplina' });
    expect([...subject.querySelectorAll('option')].map(option => option.value)).toEqual([...new Set(labs.map(lab => lab.subject))]);
    expect(screen.queryByRole('article', { name: 'Funções Trigonométricas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('article', { name: 'Matrizes e Sistemas' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('article').length).toBeGreaterThan(0));
  });

  it('reconcilia a disciplina ao trocar de nível e mantém apenas os tópicos correspondentes', () => {
    renderStudent('/estudante?tab=labs&level=graduacao&subject=disciplina-inexistente');
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

  it('volta à aba inicial pelo histórico quando a URL não contém tab', async () => {
    await act(async () => { renderStudent(); });
    fireEvent.click(screen.getByRole('button', { name: /Plano de Aulas/ }));
    expect(screen.getByTestId('panel-url')).toHaveTextContent('tab=lesson_plans');
    fireEvent.click(screen.getByRole('button', { name: 'Histórico anterior' }));
    expect(screen.getByRole('combobox', { name: 'Nível de aprendizado' })).toBeInTheDocument();
    expect(screen.getByTestId('panel-url')).toHaveTextContent('/estudante');
    expect(screen.queryByText('📅 Cronograma & Plano de Aulas da Turma')).not.toBeInTheDocument();
  });

  it('preserva a turma e a subaba LMS nos links de retorno', async () => {
    fixtures.classes = [{ id: 'class-a', name: 'Turma A', studentsCount: 1 }, { id: 'class-b', name: 'Turma B', studentsCount: 1 }];
    await act(async () => { renderStudent('/estudante?tab=gradebook&class=class-b'); });
    expect(screen.getByRole('combobox', { name: 'Turma selecionada' })).toHaveValue('class-b');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir fórum pelo boletim' }));
    const url = new URL(screen.getByRole('link', { name: /Simulado ENEM/ }).getAttribute('href')!, 'https://test.local');
    expect(url.searchParams.get('returnTo')).toBe('/estudante?tab=forum&class=class-b');
  });

  it('mantém o código e mostra erro quando a matrícula falha', async () => {
    fixtures.enroll.mockRejectedValueOnce(new Error('Código inválido'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => { renderStudent('/estudante?tab=classes'); });
    fireEvent.change(screen.getByRole('textbox', { name: 'Código da turma' }), { target: { value: 'ERRADO' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na Turma' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível entrar na turma');
    expect(screen.getByRole('textbox', { name: 'Código da turma' })).toHaveValue('ERRADO');
    expect(screen.queryByText(/Matrícula realizada com sucesso/)).not.toBeInTheDocument();
    log.mockRestore();
  });

  it('retorna ao plano após abrir o laboratório associado à aula', async () => {
    fixtures.classes = [{ id: 'class-a', name: 'Turma A', studentsCount: 1 }];
    fixtures.plans = [{ id: 'plan-a', turmaId: 'class-a', professorId: 'professor-a', periodo: '1º Bimestre', ordemSemana: 1, topico: 'Aula de funções', metodologia: 'Compare as funções.', laboratorioAssociadoId: 'math_3', status: 'planejada', criadoEm: '2026-10-11' }];
    await act(async () => { renderStudent('/estudante?tab=lesson_plans&class=class-a'); });
    fireEvent.click(screen.getByRole('button', { name: /Abrir Laboratório da Aula/ }));
    expect(await screen.findByTestId('legacy-bench')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Voltar ao Plano de Aulas/ }));
    expect(screen.getByText('Aula de funções')).toBeInTheDocument();
    expect(screen.getByTestId('panel-url')).toHaveTextContent('tab=lesson_plans');
    expect(screen.getByRole('combobox', { name: 'Turma selecionada' })).toHaveValue('class-a');
  });
});
