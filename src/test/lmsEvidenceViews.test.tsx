import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProfessorLmsModules } from '../modules/ux/components/ProfessorLmsModules';
import { StudentLmsModules } from '../modules/ux/components/StudentLmsModules';
import { buildClassLearningReport } from '../modules/data/services/learningAnalytics';
import type { ActivityData, SubmissionData } from '../modules/data/types';
const fixture = vi.hoisted(() => ({ roster: [] as string[], submissions: [] as SubmissionData[], activities: [] as ActivityData[] }));
vi.mock('../modules/core/services/firebaseConfig', () => ({ db: null }));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'qa-professor' } }) }));
vi.mock('../modules/data/repositories/reportRepository', () => ({ getLiveClassReport: async (classId: string) => buildClassLearningReport({ classData: { id: classId, name: 'Turma fictícia', professorId: 'qa-professor', professorName: 'Professor fictício', studentIds: fixture.roster, studentsCount: fixture.roster.length, createdAt: '', updatedAt: '' }, users: fixture.roster.map(id => ({ id, name: 'Estudante fictício', email: 'qa@example.test', role: 'estudante' as const, createdAt: '' })), activities: fixture.activities, submissions: fixture.submissions, source: 'local', now: '2026-10-11T10:00:00Z' }) }));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ getSubmissionsByClass: async () => fixture.submissions, getSubmissionsByStudentInClass: async () => fixture.submissions, saveSubmissionReview: vi.fn() }));
vi.mock('../modules/data/repositories/examRepository', () => ({ getExamAttemptsByClass: async () => [], getExamAttemptsByStudent: async () => [], getExamsByClass: async () => [] }));
vi.mock('../modules/data/repositories/activityRepository', () => ({ getActivitiesByClass: async () => fixture.activities }));

beforeEach(() => { cleanup(); localStorage.clear(); fixture.roster = []; fixture.submissions = []; fixture.activities = [{ id: 'qa-activity', title: 'Atividade fictícia', type: 'quiz', professorId: 'qa-professor', classId: 'qa-class', config: {}, createdAt: '2026-10-01T10:00:00Z', status: 'published' }]; });
const professor = () => render(<ProfessorLmsModules turmas={[{ id: 'qa-class', name: 'Turma fictícia', studentsCount: fixture.roster.length }]} selectedClassId="qa-class" onSelectClass={vi.fn()} professorName="Professor fictício" />);
function realStudent() {
  fixture.roster = ['qa-student'];
  fixture.submissions = [{ id: 'qa-send', activityId: 'qa-activity', activityTitle: 'Atividade fictícia', classId: 'qa-class', studentId: 'qa-student', studentName: 'Estudante fictício', score: 0, submittedAt: '2026-10-01T10:00:00Z', status: 'completed', evidence: { schemaVersion: 1, source: 'activity', sessionId: 'qa-session', stage: 'assessment', activeSeconds: 90, reflection: 'Minha conclusão registrada', questions: [{ questionId: 'q1', question: 'Questão registrada?', selectedOption: 0, selectedText: 'Opção enviada', correct: false }], experiment: { parameters: { velocidade: 2 }, telemetry: { distancia: 5 }, samples: 1 } } }];
}
describe('continuidade dos dados nos boletins e correção docente', () => {
  it('turma vazia não recebe pessoas, frequência ou entregas demonstrativas', async () => {
    professor();
    await waitFor(() => expect(screen.getByText(/Esta turma ainda não tem estudantes matriculados/)).toBeInTheDocument());
    expect(screen.queryByText('Ana Clara Silva')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar Chamada do Dia' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /SpeedGrader/ }));
    expect(screen.getByText(/Nenhuma entrega registrada nesta turma/)).toBeInTheDocument();
  });
  it('professor vê nota zero e categorias ausentes sem média final fabricada', async () => {
    realStudent(); professor();
    await waitFor(() => expect(screen.getAllByText('Estudante fictício').length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: 'Livro de Notas' }));
    await waitFor(() => expect(screen.getByText('0.0')).toBeInTheDocument());
    expect(screen.getByText('Incompleto')).toBeInTheDocument();
    expect(screen.getByText(/Aguardando: Provas, Laboratórios, Participação/)).toBeInTheDocument();
    expect(screen.getByText('Sem chamada')).toBeInTheDocument();
  });
  it('correção apresenta somente respostas, medidas e conclusão presentes no envio', async () => {
    realStudent(); professor();
    await waitFor(() => expect(screen.getAllByText('Estudante fictício').length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: /SpeedGrader/ }));
    expect(screen.getByText('Estudante fictício (0 pts)')).toBeInTheDocument();
    expect(screen.getByText(/Minha conclusão registrada/)).toBeInTheDocument();
    expect(screen.getByText('Questão registrada?')).toBeInTheDocument();
    expect(screen.getByText(/90 segundos/)).toBeInTheDocument();
    expect(screen.queryByText(/2.1%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Reproduzir Sessão/)).not.toBeInTheDocument();
    expect(screen.getByText('Preencha os três critérios')).toBeInTheDocument();
  });
  it('aluno vê sua mesma nota zero e ausência de frequência; não ganha certificado por abrir a página', async () => {
    realStudent();
    render(<StudentLmsModules studentId="qa-student" studentName="Estudante fictício" selectedClassId="qa-class" activeView="gradebook" onViewChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('0.0')).toBeInTheDocument());
    expect(screen.getByText('Sem média')).toBeInTheDocument();
    expect(screen.getByText('Sem chamada')).toBeInTheDocument();
    expect(localStorage.getItem('kortex_certificates')).toBeNull();
  });
});
