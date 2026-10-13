import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EstudanteDashboard } from '../modules/ux/pages/EstudanteDashboard';
import { readClassExamSession, saveClassExamSession } from '../modules/data/services/classExamSession';
import type { ExamAttempt, ExamData, LessonPlanItem } from '../modules/data/types';
import type { PendingOfflineSubmission } from '../modules/core/services/offlineSyncService';

const fixtures = vi.hoisted(() => ({
  classes: [{ id: 'class-a', name: 'Turma A', studentsCount: 1 }], plans: [] as LessonPlanItem[], exams: [] as ExamData[], attempts: [] as ExamAttempt[], pending: [] as PendingOfflineSubmission[],
  planCallbacks: [] as ((plans: LessonPlanItem[]) => void)[], listeners: new Set<() => void>(), refreshProgress: vi.fn(), deliver: vi.fn(), getAttempts: vi.fn<() => Promise<ExamAttempt[]>>(),
}));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'student-continuity', displayName: 'Estudante' }, userData: { role: 'estudante', gradeLevel: 'medio' } }) }));
vi.mock('../modules/core/hooks/useStudentDashboard', () => ({ useStudentDashboard: () => ({ progress: { level: 1, xp: 0, coins: 0 }, completedModules: [], activeLab: null, setActiveLab: vi.fn(), shopItems: [], purchasedItems: [], achievements: [], studentClasses: fixtures.classes, modules: [], gradeLevel: 'medio', refreshProgress: fixtures.refreshProgress }) }));
vi.mock('../modules/core/constants/dashboardConstants', () => ({ ALL_MODULES: [] }));
vi.mock('../modules/data/repositories/classRepository', () => ({
  sendStudentMessage: vi.fn(), claimStudentMessageReward: vi.fn(),
  subscribeStudentMessages: vi.fn((_id, callback) => { callback([]); return () => {}; }),
  subscribeClassNotices: vi.fn((_id, callback) => { callback([]); return () => {}; }),
  subscribeEnhancedMaterials: vi.fn((_id, callback) => { callback([]); return () => {}; }),
}));
vi.mock('../modules/data/repositories/lessonPlanRepository', () => ({ subscribeLessonPlansByClass: vi.fn((_id, callback) => { fixtures.planCallbacks.push(callback); callback(fixtures.plans); return () => {}; }) }));
vi.mock('../modules/data/repositories/examRepository', () => ({ subscribeExamsByClass: vi.fn((_id, callback) => { callback(fixtures.exams); return () => {}; }), getExamAttemptsByStudent: fixtures.getAttempts }));
vi.mock('../modules/data/repositories/activityRepository', () => ({ subscribeActivitiesByClass: vi.fn((_id, callback) => { callback([]); return () => {}; }) }));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ getSubmissionsByStudent: vi.fn(async () => []), getPublishedSubmissionReviewsByStudent: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/gradePolicyRepository', () => ({ getGradePolicy: vi.fn(async () => null) }));
vi.mock('../modules/core/services/offlineSyncService', () => ({ offlineSyncService: {
  getPendingSubmissions: () => fixtures.pending,
  subscribeStatus: (listener: () => void) => { fixtures.listeners.add(listener); listener(); return () => fixtures.listeners.delete(listener); },
  deliver: fixtures.deliver,
} }));
vi.mock('../modules/core/services/soundEffects', () => ({ default: { playClick: vi.fn(), playSuccess: vi.fn(), playLevelUp: vi.fn() } }));
vi.mock('../modules/ux/components/StudentGuidance', () => ({ StudentGuidanceInbox: () => null }));
vi.mock('../modules/ux/components/StudentReviewCard', () => ({ StudentReviewCard: () => null }));
vi.mock('../modules/ux/components/StudentLmsModules', () => ({ StudentLmsModules: () => null }));
vi.mock('../modules/ux/components/StudentClassActivity', () => ({ StudentClassActivity: () => null }));

const exam = (expired = false): ExamData => ({ id: 'exam-a', professorId: 'teacher', professorName: 'Professor', titulo: 'Prova de continuidade', disciplina: 'Matemática', turmaId: 'class-a', turmaNome: 'Turma A', status: 'Aberta', duracaoMinutos: 10, dataLimite: new Date(Date.now() + (expired ? -600000 : 600000)).toISOString(), pesoTotal: 10, criadoEm: new Date().toISOString(), questoes: [{ enunciado: 'Quanto é dois mais dois?', tema: 'Adição', nivelDificuldade: 'Fácil', valorPeso: 10, justificativa: 'Dois somado a dois resulta em quatro.', opcoes: [{ texto: 'Quatro', isCorreta: true }, { texto: 'Cinco', isCorreta: false }] }] });
const attempt = (): ExamAttempt => ({ id: 'delivery-exam-a', examId: 'exam-a', examTitle: 'Prova de continuidade', turmaId: 'class-a', alunoId: 'student-continuity', alunoNome: 'Estudante', pontuacaoObtida: 10, pontuacaoMaxima: 10, porcentagemAproveitamento: 100, classificacao: 'Excelente', respostas: [{ questaoIndex: 0, opcaoEscolhidaIndex: 0, acertou: true, pontosObtidos: 10 }], dataEnvio: new Date().toISOString(), evidence: { schemaVersion: 1, source: 'exam', stage: 'assessment', sessionId: 'attempt-a', activeSeconds: 30, questions: [{ questionId: 'exam-a-q1', question: 'Quanto é dois mais dois?', selectedOption: 0, correct: true, selectedText: 'Quatro', expectedText: 'Quatro', explanation: 'Dois somado a dois resulta em quatro.', topic: 'Adição' }] } as ExamAttempt['evidence'] });
const queue = (value = attempt(), error?: string): PendingOfflineSubmission => ({ id: value.id!, studentId: value.alunoId, kind: 'exam', examAttempt: value, synced: false, timestamp: value.dataEnvio, error });
const draw = (tab: string) => render(<MemoryRouter initialEntries={[`/estudante?tab=${tab}`]}><EstudanteDashboard /></MemoryRouter>);
const notify = () => fixtures.listeners.forEach(listener => listener());

beforeEach(() => {
  cleanup(); localStorage.clear(); sessionStorage.clear(); vi.clearAllMocks(); fixtures.listeners.clear(); fixtures.planCallbacks = []; fixtures.classes = [{ id: 'class-a', name: 'Turma A', studentsCount: 1 }]; fixtures.exams = []; fixtures.plans = []; fixtures.attempts = []; fixtures.pending = [];
  fixtures.deliver.mockImplementation(async () => ({ queued: true }));
  fixtures.getAttempts.mockReset().mockImplementation(async () => fixtures.attempts);
});
afterEach(cleanup);

describe('continuidade da matrícula e entregas de provas', () => {
  it('bloqueia nova tentativa quando o histórico falha e permite recuperar a consulta', async () => {
    fixtures.exams = [exam()]; fixtures.getAttempts.mockRejectedValueOnce(new Error('unavailable'));
    draw('exams');
    await screen.findByText(/Não foi possível consultar seu histórico de provas/);
    expect(screen.getByRole('button', { name: 'Histórico indisponível' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Consultar histórico novamente' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Realizar Prova 📝' })).toBeEnabled());
    expect(fixtures.deliver).not.toHaveBeenCalled();
  });
  it('limpa a turma perdida e ignora callback atrasado de sua assinatura', async () => {
    fixtures.plans = [{ id: 'plan-a', turmaId: 'class-a', topico: 'Planejamento restrito à turma A', periodo: '1º Bimestre', ordemSemana: 1, status: 'planejada' } as LessonPlanItem];
    const view = draw('lesson_plans');
    await screen.findByText('Planejamento restrito à turma A');
    const previous = fixtures.planCallbacks[0]; fixtures.classes = [];
    view.rerender(<MemoryRouter initialEntries={['/estudante?tab=lesson_plans']}><EstudanteDashboard /></MemoryRouter>);
    await waitFor(() => expect(screen.queryByText('Planejamento restrito à turma A')).not.toBeInTheDocument());
    act(() => previous(fixtures.plans));
    expect(screen.queryByText('Planejamento restrito à turma A')).not.toBeInTheDocument();
  });

  it('confirma a tentativa sincronizada mesmo com outra prova na fila e atualiza a sessão', async () => {
    fixtures.exams = [exam()]; const result = attempt(); fixtures.pending = [queue(result)];
    expect(saveClassExamSession('student-continuity', { exam: fixtures.exams[0], answers: { 0: 0 }, questionIndex: 0, deadlineAt: Date.now() + 600000, frozen: result, result, pending: true, activeSeconds: 30 })).toBe(true);
    draw('exams'); fireEvent.click(await screen.findByRole('button', { name: 'Consultar entrega pendente' }));
    await screen.findByRole('heading', { name: 'Prova guardada neste dispositivo' });
    fixtures.attempts = [result]; fixtures.pending = [queue({ ...result, id: 'other-delivery', examId: 'another-exam', evidence: { ...result.evidence, sessionId: 'other-session' } as ExamAttempt['evidence'] })];
    act(notify);
    await screen.findByRole('heading', { name: 'Prova entregue' });
    expect(readClassExamSession('student-continuity', fixtures.exams[0])?.pending).toBe(false);
  });

  it('recupera a fila após o prazo, conserva evidência e orienta reabertura quando o envio foi negado', async () => {
    fixtures.exams = [exam(true)]; fixtures.pending = [queue(attempt(), 'permission-denied')];
    draw('exams');
    const consult = await screen.findByRole('button', { name: 'Consultar entrega pendente' }); expect(consult).toBeEnabled(); fireEvent.click(consult);
    await screen.findByRole('heading', { name: 'Prova guardada neste dispositivo' });
    await screen.findByText(/peça ao professor para reabrir a prova/);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar enviar novamente' }));
    await waitFor(() => expect(fixtures.deliver).toHaveBeenCalledWith(expect.objectContaining({ kind: 'exam', examAttempt: expect.objectContaining({ respostas: attempt().respostas, evidence: expect.objectContaining({ sessionId: 'attempt-a' }) }) })));
    expect(fixtures.deliver.mock.calls[0][0].examAttempt).not.toHaveProperty('id');
    expect(fixtures.pending).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'Prova entregue' })).not.toBeInTheDocument();
  });

  it('entrega automaticamente rascunho expirado e bloqueia novas respostas', async () => {
    fixtures.exams = [exam(true)];
    expect(saveClassExamSession('student-continuity', { exam: fixtures.exams[0], answers: { 0: 0 }, questionIndex: 0, deadlineAt: Date.now() - 1, frozen: null, result: null, pending: false, activeSeconds: 30 })).toBe(true);
    draw('exams'); fireEvent.click(await screen.findByRole('button', { name: 'Continuar prova ou consultar entrega' }));
    await waitFor(() => expect(fixtures.deliver).toHaveBeenCalledTimes(1));
    await screen.findByRole('heading', { name: 'Prova guardada neste dispositivo' });
    expect(fixtures.deliver.mock.calls[0][0].examAttempt.respostas[0]).toEqual(expect.objectContaining({ opcaoEscolhidaIndex: 0, acertou: true }));
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
