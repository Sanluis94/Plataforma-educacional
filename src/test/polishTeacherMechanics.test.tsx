import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfessorLmsModules } from '../modules/ux/components/ProfessorLmsModules';
import type { AttendanceRecord, ForumTopic } from '../modules/data/types';

const fixtures = vi.hoisted(() => ({
  getAttendance: vi.fn<() => Promise<AttendanceRecord[]>>(),
  saveAttendance: vi.fn(),
  saveTopic: vi.fn(),
  subscribeForum: vi.fn(),
  getPolicy: vi.fn(),
  savePolicy: vi.fn(),
}));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'teacher-real' } }) }));
vi.mock('../modules/data/repositories/gradebookRepository', async importOriginal => ({
  ...await importOriginal<object>(), getAttendanceByClass: fixtures.getAttendance, saveAttendanceRecord: fixtures.saveAttendance, saveForumTopic: fixtures.saveTopic, subscribeForumTopicsByClass: fixtures.subscribeForum,
}));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ getSubmissionsByClass: vi.fn(async () => []), getSubmissionReviewsByClass: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/examRepository', () => ({ getExamAttemptsByClass: vi.fn(async () => []), getExamsByClass: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/activityRepository', () => ({ getActivitiesByClass: vi.fn(async () => []) }));
vi.mock('../modules/data/repositories/reportRepository', () => ({ getLiveClassReport: vi.fn(async () => ({ students: [{ studentId: 'student-1', studentName: 'Estudante de teste', records: [] }] })) }));
vi.mock('../modules/data/repositories/gradePolicyRepository', async importOriginal => ({ ...await importOriginal<object>(), getGradePolicy: fixtures.getPolicy, saveGradePolicy: fixtures.savePolicy }));
vi.mock('../modules/ux/components/TeacherCertificates', () => ({ TeacherCertificates: () => null }));
vi.mock('../modules/ux/components/TeacherCorrectionWorkspace', () => ({ TeacherCorrectionWorkspace: () => null }));
vi.mock('../modules/ux/components/TeacherLabStudio', () => ({ TeacherLabStudio: () => <p>Studio de roteiros disponível</p> }));

const classes = [{ id: 'class-a', name: 'Turma A', studentsCount: 1 }, { id: 'class-b', name: 'Turma B', studentsCount: 1 }];
const props = { turmas: classes, selectedClassId: 'class-a', professorName: 'Docente', onSelectClass: vi.fn() };
const draw = (subtab: string) => render(<MemoryRouter initialEntries={[`/professor?subtab=${subtab}`]}><ProfessorLmsModules {...props} /></MemoryRouter>);

beforeEach(() => {
  cleanup(); vi.clearAllMocks();
  fixtures.getAttendance.mockResolvedValue([]);
  fixtures.saveAttendance.mockImplementation(async record => ({ ...record, id: 'attendance-stable' }));
  fixtures.saveTopic.mockImplementation(async topic => ({ ...topic, id: 'topic-1', respostas: [], criadoEm: new Date().toISOString() }));
  fixtures.subscribeForum.mockImplementation((_id: string, callback: (topics: ForumTopic[]) => void) => { callback([]); return () => {}; });
  fixtures.getPolicy.mockResolvedValue(null);
});

describe('mecânicas do diário do professor', () => {
  it('mantém chamada preenchida após falha e só confirma depois de salvar', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    fixtures.saveAttendance.mockRejectedValueOnce(new Error('Connection unavailable'));
    draw('attendance');
    await waitFor(() => expect(screen.getByRole('button', { name: /Registrar Chamada/ })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /Registrar Chamada/ }));
    fireEvent.change(screen.getByLabelText('Conteúdo trabalhado'), { target: { value: 'Investigação sobre energia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Falta justificada' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Chamada' }));
    await screen.findByText(/salvamento da chamada não foi confirmado/);
    expect(screen.getByLabelText('Conteúdo trabalhado')).toHaveValue('Investigação sobre energia');
    expect(screen.getByRole('button', { name: 'Falta justificada' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Chamada' }));
    await screen.findByText(/Chamada salva para esta turma/);
    expect(fixtures.saveAttendance).toHaveBeenLastCalledWith(expect.objectContaining({ turmaId: 'class-a', registros: [{ studentId: 'student-1', studentName: 'Estudante de teste', status: 'justificada' }] }));
    log.mockRestore();
  });

  it('recupera chamada da data para correção sem acrescentar outra aula', async () => {
    fixtures.getAttendance.mockResolvedValue([{ id: 'old', turmaId: 'class-a', data: '2026-10-01', conteudoResumo: 'Conteúdo já registrado', criadoEm: '2026-10-01T12:00:00Z', registros: [{ studentId: 'student-1', studentName: 'Estudante de teste', status: 'falta' }] }]);
    draw('attendance');
    await waitFor(() => expect(screen.getByRole('button', { name: /Registrar Chamada/ })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /Registrar Chamada/ }));
    fireEvent.change(screen.getByLabelText('Data da Aula'), { target: { value: '2026-10-01' } });
    expect(screen.getByLabelText('Conteúdo trabalhado')).toHaveValue('Conteúdo já registrado');
    expect(screen.getByRole('button', { name: 'Falta' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Presente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Chamada' }));
    await screen.findByText(/Chamada salva/);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('publica tópico com identidade real, mantendo texto quando o envio falha', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    fixtures.saveTopic.mockRejectedValueOnce(new Error('Offline'));
    draw('forum');
    fireEvent.click(screen.getByRole('button', { name: 'Novo Tópico de Discussão' }));
    fireEvent.change(screen.getByLabelText('Título da Discussão'), { target: { value: 'Conservação da energia' } });
    fireEvent.change(screen.getByLabelText('Mensagem Inicial / Pergunta Orientadora'), { target: { value: 'Como interpretar a energia dissipada?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar Tópico' }));
    await screen.findByText(/Não foi possível publicar o tópico/);
    expect(screen.getByLabelText('Título da Discussão')).toHaveValue('Conservação da energia');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar Tópico' }));
    await screen.findByText(/Novo tópico de discussão criado com sucesso/);
    expect(fixtures.saveTopic).toHaveBeenLastCalledWith(expect.objectContaining({ autorId: 'teacher-real', turmaId: 'class-a' }));
    expect(screen.queryByText(/\+20 XP/)).not.toBeInTheDocument();
    log.mockRestore();
  });

  it('informa falha do listener e permite refazer a conexão', async () => {
    fixtures.subscribeForum.mockImplementationOnce((_id: string, _callback: unknown, fail: (error: Error) => void) => { fail(new Error('Permission unavailable')); return () => {}; });
    draw('forum');
    await screen.findByText(/Não foi possível carregar o fórum/);
    fireEvent.click(screen.getByRole('button', { name: /Tentar carregar fórum novamente/ }));
    await waitFor(() => expect(fixtures.subscribeForum).toHaveBeenCalledTimes(2));
  });

  it('bloqueia edição de critérios desconhecidos e permite recuperar os dados', async () => {
    fixtures.getPolicy.mockRejectedValueOnce(new Error('Offline'));
    draw('gradebook');
    await screen.findByText(/Não foi possível recuperar os critérios/);
    expect(screen.getByRole('button', { name: 'Salvar critérios para a turma' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Tentar carregar critérios novamente/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar critérios para a turma' })).toBeEnabled());
    expect(fixtures.savePolicy).not.toHaveBeenCalled();
  });

  it('ignora resposta tardia de frequência de uma turma anterior', async () => {
    let finish!: (value: AttendanceRecord[]) => void;
    fixtures.getAttendance.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const view = draw('attendance');
    view.rerender(<MemoryRouter initialEntries={['/professor?subtab=attendance']}><ProfessorLmsModules {...props} selectedClassId="class-b" /></MemoryRouter>);
    await act(async () => finish([{ id: 'from-a', turmaId: 'class-a', data: '2026-10-01', conteudoResumo: 'Aula da turma anterior', criadoEm: '', registros: [] }]));
    expect(screen.queryByText('Aula da turma anterior')).not.toBeInTheDocument();
  });
});
