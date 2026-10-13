import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ClassLearningReportView } from '../modules/ux/components/ClassLearningReportView';
import type { ClassLearningReport } from '../modules/data/learningAnalyticsTypes';
import { generatePedagogicalDiagnosis } from '../modules/core/services/geminiService';

vi.mock('../modules/core/services/geminiService', async importOriginal => ({
  ...await importOriginal<typeof import('../modules/core/services/geminiService')>(),
  generatePedagogicalDiagnosis: vi.fn(),
}));

function report(): ClassLearningReport {
  return {
    classId: 'class-report', className: 'Turma de ciências', professorName: 'Professora', generatedAt: '2026-10-10T12:00:00.000Z', source: 'firestore',
    studentsCount: 2, activitiesCount: 1, expectedCompletions: 2, completedActivitiesCount: 1,
    averageScore: 0, averageTimeSpentMinutes: 2, completionRate: 50, participationRate: 50, studentsWithEvidence: 1, assessedStudentsCount: 1, scoredRecordsCount: 1, measuredTimeRecordsCount: 1, topModule: 'Energia', atRiskStudents: ['Ana'],
    quality: { received: 2, accepted: 1, duplicates: 1, retries: 0, excluded: 0, missingScores: 0, missingTimes: 0, warnings: ['Um registro repetido foi removido.'] },
    students: [
      { studentId: 'ana', studentName: 'Ana', level: 1, xp: 0, coins: 0, completedModulesCount: 1, completedAssignedCount: 1, expectedCount: 1, averageScore: 0, lastActive: '2026-10-10T10:00:00.000Z', status: 'precisa_apoio', supportReasons: ['A última avaliação teve menos de 70% de acerto.'], records: [{
        id: 'delivery-ana', itemId: 'energy', title: 'Energia', source: 'lab', subject: 'Física', studentId: 'ana', studentName: 'Ana', score: 0, completed: true, submittedAt: '2026-10-10T10:00:00.000Z', activeSeconds: 120, assigned: true,
        evidence: { schemaVersion: 1, source: 'lab', sessionId: 'test-session', questions: [{ questionId: 'q-1', question: 'Como a energia se conserva?', selectedOption: 1, correct: false }], observations: [{ scenarioId: 'scenario-1', hypothesis: 'A massa muda o resultado.' }], reflection: 'Preciso rever a conservação.', experiment: { parameters: { gravity: 9.8 }, telemetry: { energy: 12 }, samples: 3 } },
      }] },
      { studentId: 'beto', studentName: 'Beto', level: 1, xp: 0, coins: 0, completedModulesCount: 0, completedAssignedCount: 0, expectedCount: 1, averageScore: null, lastActive: null, status: 'sem_dados', supportReasons: [], records: [] },
    ],
    modules: [{ itemId: 'energy', module: 'Energia', source: 'lab', subject: 'Física', assigned: true, eventsCount: 1, attemptsCount: 1, studentsCount: 1, averageScore: 0, completionRate: 50, totalTimeSpentMinutes: 2, questions: [{ questionId: 'q-1', question: 'Como a energia se conserva?', responses: 1, correct: 0, accuracy: 0 }] }],
  };
}

beforeEach(() => { vi.stubEnv('VITE_DISABLE_AI', 'true'); vi.mocked(generatePedagogicalDiagnosis).mockReset(); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe('leitura docente das evidências consolidadas', () => {
  it('mostra denominadores e distingue nota zero de aluno sem evidências', () => {
    render(<ClassLearningReportView report={report()} />);
    expect(screen.getAllByText('1 de 2').length).toBeGreaterThan(0);
    const ana = screen.getByRole('heading', { name: 'Ana' }).closest('article')!;
    expect(within(ana).getByText('Média com nota').parentElement?.querySelector('dd')).toHaveTextContent('0%');
    expect(within(ana).getByText('Precisa de apoio')).toBeInTheDocument();
    const beto = screen.getByRole('heading', { name: 'Beto' }).closest('article')!;
    expect(within(beto).getByText('Sem evidências')).toBeInTheDocument();
    expect(within(beto).getByText('Sem dados')).toBeInTheDocument();
    expect(within(beto).getByText('Sem registro')).toBeInTheDocument();
    expect(generatePedagogicalDiagnosis).not.toHaveBeenCalled();
  });

  it('permite buscar alunos e examinar respostas, hipótese e reflexão preservadas', () => {
    render(<ClassLearningReportView report={report()} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar aluno' }), { target: { value: 'ana' } });
    expect(screen.queryByRole('heading', { name: 'Beto' })).not.toBeInTheDocument();
    const details = screen.getByText('Ver entregas de Ana no período').closest('details')!;
    fireEvent.click(within(details).getByText('Ver entregas de Ana no período'));
    expect(details.open).toBe(true);
    expect(within(details).getByText('Opção marcada: 2ª alternativa · Resposta incorreta: retomar este conceito.')).toBeInTheDocument();
    expect(within(details).getByText('A massa muda o resultado.')).toBeInTheDocument();
    expect(within(details).getByText('Preciso rever a conservação.')).toBeInTheDocument();
    expect(screen.getByText('0 de 1 respostas corretas · 0%')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Mostrar' }), { target: { value: 'sem_dados' } });
    expect(screen.getByText('Nenhum aluno corresponde a este filtro.')).toBeInTheDocument();
  });

  it('expõe qualidade e explicação; contexto local deixa claro que os dados não se compartilham', () => {
    const data = report(); data.source = 'local';
    render(<ClassLearningReportView report={data} />);
    expect(screen.getByText(/não são compartilhadas automaticamente/)).toBeInTheDocument();
    expect(screen.getByText('Um registro repetido foi removido.')).toBeInTheDocument();
    expect(screen.getByText(/Uma nova tentativa não aumenta/)).toBeInTheDocument();
    expect(screen.getByText(/Não indica presença nem dedicação/)).toBeInTheDocument();
  });

  it('mostra o texto real da opção e distingue exploração de avaliação', () => {
    const data = report();
    data.students[0].records[0].evidence!.questions![0].selectedText = 'A energia desaparece.';
    data.students[0].records[0].evidence!.stage = 'exploration';
    data.students[0].records[0].score = null;
    render(<ClassLearningReportView report={data} />);
    expect(screen.getByText('Opção marcada: A energia desaparece. · Resposta incorreta: retomar este conceito.')).toBeInTheDocument();
    expect(screen.getByText(/Exploração registrada/)).toBeInTheDocument();
    expect(screen.getByText('Não se aplica à exploração')).toBeInTheDocument();
  });

  it('mostra segundos, unidades dos experimentos e escala estimada do treino separada de acertos', () => {
    const data = report(); data.averageTimeSpentMinutes = 2 / 60;
    const record = data.students[0].records[0]; record.source = 'enem'; record.score = 40; record.activeSeconds = 2;
    record.evidence!.estimatedScore = { value: 620, model: 'tri-practice', scaleMax: 1000 };
    record.evidence!.experiment!.parameterLabels = { gravity: 'Aceleração gravitacional' };
    record.evidence!.experiment!.parameterUnits = { gravity: 'm/s²' };
    record.evidence!.observations![0].scenarioLabel = 'Dez unidades'; record.evidence!.observations![0].observed = false;
    render(<ClassLearningReportView report={data} />);
    expect(screen.getAllByText('2 s').length).toBe(2);
    expect(screen.getByText('9,8 m/s²')).toBeInTheDocument();
    expect(screen.getByText('12 (sem unidade registrada)')).toBeInTheDocument();
    expect(screen.getByText('Nota estimada do treino (escala 0–1000):')).toBeInTheDocument();
    expect(screen.getByText('Acertos (%)').parentElement?.querySelector('dd')).toHaveTextContent('40%');
    expect(screen.getByText('Dez unidades')).toBeInTheDocument(); expect(screen.getByText(/Previsão inicial/)).toBeInTheDocument();
  });

  it('usa ausências explícitas em turma vazia e mantém a ação de IA desativada', () => {
    const data = report(); Object.assign(data, { studentsCount: 0, students: [], modules: [], activitiesCount: 0, expectedCompletions: 0, completedActivitiesCount: 0, studentsWithEvidence: 0, assessedStudentsCount: 0, averageScore: null, averageTimeSpentMinutes: null, scoredRecordsCount: 0, measuredTimeRecordsCount: 0, participationRate: null, completionRate: null });
    render(<ClassLearningReportView report={data} />);
    expect(screen.getByRole('heading', { name: 'Ainda não há evidências de aprendizagem' })).toBeInTheDocument();
    expect(screen.getByText('Ainda não há alunos matriculados nesta turma.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gerar sugestão com IA' })).toBeDisabled();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('encaminha às mensagens da mesma turma e só solicita resumo com IA após clique', async () => {
    vi.mocked(generatePedagogicalDiagnosis).mockResolvedValue({ source: 'gemini', summary: 'Revisar os conceitos com menor acerto.', strengths: ['Uma entrega registrada.'], recommendations: ['Retomar a atividade.'], priorityActions: [] });
    const onMessages = vi.fn();
    render(<ClassLearningReportView report={report()} onViewMessages={onMessages} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mensagens da turma' })); expect(onMessages).toHaveBeenCalledOnce();
    expect(generatePedagogicalDiagnosis).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Gerar sugestão com IA' }));
    await waitFor(() => expect(screen.getByText('Revisar os conceitos com menor acerto.')).toBeInTheDocument());
    const input = vi.mocked(generatePedagogicalDiagnosis).mock.calls[0][0];
    expect(input.supportStudentsCount).toBe(1); expect(input).not.toHaveProperty('atRiskStudents');
  });

  it('não apresenta uma resposta atrasada após trocar a turma mesmo sem desmontar', async () => {
    let finish!: (value: Awaited<ReturnType<typeof generatePedagogicalDiagnosis>>) => void;
    vi.mocked(generatePedagogicalDiagnosis).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const view = render(<ClassLearningReportView report={report()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Gerar sugestão com IA' }));
    const other = report(); other.classId = 'other'; other.className = 'Outra turma';
    view.rerender(<ClassLearningReportView report={other} />);
    finish({ source: 'gemini', summary: 'RESPOSTA DA TURMA ANTERIOR', strengths: [], recommendations: [], priorityActions: [] });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Gerar sugestão com IA' })).toBeEnabled());
    expect(screen.queryByText('RESPOSTA DA TURMA ANTERIOR')).not.toBeInTheDocument();
  });
});
