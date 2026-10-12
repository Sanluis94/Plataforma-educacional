import { describe, expect, it, vi } from 'vitest';
import type { AttendanceRecord, ExamAttempt, GradebookWeights, SubmissionData } from '../modules/data/types';
vi.mock('../modules/core/services/firebaseConfig', () => ({ db: null }));
import { calculateClassGradebook, calculateStudentAttendanceRate, DEFAULT_WEIGHTS } from '../modules/data/repositories/gradebookRepository';
import { buildClassLearningReport } from '../modules/data/services/learningAnalytics';

const students = [{ id: 'qa-student', name: 'Estudante fictício' }, { id: 'qa-no-data', name: 'Sem entregas' }];
const date = '2026-10-01T10:00:00Z';
const submission = (extra: Partial<SubmissionData> = {}): SubmissionData => ({ id: 'send', activityId: 'activity', activityTitle: 'Teste fictício', classId: 'qa-class', studentId: 'qa-student', studentName: students[0].name, score: 80, status: 'completed', submittedAt: date, ...extra });
const attempt = (extra: Partial<ExamAttempt> = {}): ExamAttempt => ({ id: 'attempt', examId: 'p1', examTitle: 'Prova fictícia', turmaId: 'qa-class', alunoId: 'qa-student', alunoNome: students[0].name, pontuacaoObtida: 8, pontuacaoMaxima: 10, porcentagemAproveitamento: 80, classificacao: 'Bom', respostas: [], dataEnvio: date, ...extra });
const weights = (extra: Partial<GradebookWeights> = {}): GradebookWeights => ({ ...DEFAULT_WEIGHTS, turmaId: 'qa-class', pesoParticipacao: 0, ...extra });

describe('boletim a partir de evidência, sem preenchimento fictício', () => {
  it('desempata datas iguais da mesma forma que o relatório, independentemente da ordem recebida', () => {
    const records = [submission({ id: 'a', score: 100 }), submission({ id: 'z', score: 0 })];
    const report = buildClassLearningReport({ classData: { id: 'qa-class', name: 'Turma fictícia', professorId: 'prof', professorName: 'Professor', studentIds: ['qa-student'], studentsCount: 1, createdAt: date, updatedAt: date }, users: [], activities: [{ id: 'activity', title: 'Teste fictício', type: 'quiz', classId: 'qa-class', professorId: 'prof', status: 'published', config: {}, createdAt: date }], submissions: records, source: 'local', now: '2026-10-12T10:00:00Z' });
    expect(report.averageScore).toBe(0);
    for (const list of [records, [...records].reverse()]) expect(calculateClassGradebook(students, 'qa-class', list)[0].notaAtividades).toBe(report.averageScore! / 10);
  });
  it('mantém notas, média e frequência ausentes sem aprovar o estudante', () => {
    expect(calculateClassGradebook(students, 'qa-class')[0]).toMatchObject({ notaProvas: null, notaLabs: null, notaAtividades: null, notaParticipacao: null, mediaFinal: null, frequenciaPercentual: null, situacao: 'Sem dados', coveragePercent: 0 });
    expect(calculateStudentAttendanceRate('qa-student', [])).toMatchObject({ taxaPercentual: null, alertaLDB: false, totalAulas: 0 });
  });
  it('respeita zero verdadeiro e distingue evidências de outras turmas, pendentes e exploração', () => {
    const submissions = [submission({ score: 0 }), submission({ id: 'foreign', classId: 'other', score: 100 }), submission({ id: 'pending', activityId: 'pending', status: 'pending', score: 100 }), submission({ id: 'explore', activityId: 'lab', evidence: { schemaVersion: 1, source: 'lab', sessionId: 'explore', stage: 'exploration' }, score: 100 })];
    expect(calculateClassGradebook(students, 'qa-class', submissions, [], weights({ pesoProvas: 0, pesoLabs: 0, pesoAtividades: 100 }))[0]).toMatchObject({ notaAtividades: 0, mediaFinal: 0, situacao: 'Insuficiente', coveragePercent: 100 });
  });
  it('usa a última tentativa válida por item sem duplicar a média', () => {
    const old = submission({ id: 'old', score: 0 });
    const recent = submission({ id: 'new', score: 100, submittedAt: '2026-10-02T10:00:00Z' });
    expect(calculateClassGradebook(students, 'qa-class', [old, recent, recent, submission({ id: 'invalid', activityId: 'bad', score: NaN })], [], weights({ pesoProvas: 0, pesoLabs: 0, pesoAtividades: 100 }))[0]).toMatchObject({ notaAtividades: 10, mediaFinal: 10 });
  });
  it('normaliza provas e laboratórios para 0 a 10 e aplica somente pesos declarados', () => {
    const lab = submission({ activityId: 'lab', score: 60, evidence: { schemaVersion: 1, source: 'lab', sessionId: 'lab', stage: 'assessment' } });
    const reports = calculateClassGradebook(students, 'qa-class', [submission(), lab], [attempt()], weights(), { participationScores: { 'qa-student': 9 } });
    expect(reports[0]).toMatchObject({ notaProvas: 8, notaLabs: 6, notaAtividades: 8, mediaFinal: 7.3, coveragePercent: 100, situacao: 'Aprovado' });
    expect(reports[1].mediaFinal).toBeNull();
  });
  it('não reduz pesos ou preenche zero quando uma categoria ainda não tem avaliação', () => {
    expect(calculateClassGradebook(students, 'qa-class', [submission()], [], weights())[0]).toMatchObject({ mediaFinal: null, situacao: 'Incompleto', missingCategories: ['Provas', 'Laboratórios'], coveragePercent: 22 });
  });
  it('só usa participação declarada e não transforma frequência em nota', () => {
    const record: AttendanceRecord = { turmaId: 'qa-class', data: '2026-10-01', registros: [{ studentId: 'qa-student', studentName: 'Teste', status: 'presente' }], criadoEm: date };
    const report = calculateClassGradebook(students, 'qa-class', [], [], weights({ pesoProvas: 0, pesoLabs: 0, pesoAtividades: 0, pesoParticipacao: 100 }), { attendanceRecords: [record], participationScores: { 'qa-student': 0 } })[0];
    expect(report).toMatchObject({ notaParticipacao: 0, mediaFinal: 0, frequenciaPercentual: 100 });
    expect(calculateClassGradebook(students, 'qa-class', [], [], DEFAULT_WEIGHTS, { attendanceRecords: [record] })[0].notaParticipacao).toBeNull();
  });
  it('P1 e P2 correspondem às provas selecionadas, sem derivar uma da outra', () => {
    const report = calculateClassGradebook(students, 'qa-class', [], [attempt(), attempt({ id: 'two', examId: 'p2', pontuacaoObtida: 0 })], weights(), { p1ExamId: 'p1', p2ExamId: 'p2' })[0];
    expect(report).toMatchObject({ notaP1: 8, notaP2: 0 });
    expect(calculateClassGradebook(students, 'qa-class', [], [attempt()], weights(), { p1ExamId: 'p1', p2ExamId: 'p2' })[0].notaP2).toBeNull();
  });
  it('não inventa média com pesos negativos, NaN ou todos iguais a zero', () => {
    for (const config of [weights({ pesoProvas: -1 }), weights({ pesoProvas: NaN }), weights({ pesoProvas: 0, pesoLabs: 0, pesoAtividades: 0 })]) expect(calculateClassGradebook(students, 'qa-class', [submission()], [attempt()], config)[0]).toMatchObject({ mediaFinal: null, missingCategories: ['Pesos inválidos'] });
  });
  it('uma correção da mesma chamada substitui o registro anterior', () => {
    const record: AttendanceRecord = { turmaId: 'qa-class', data: '2026-10-01', registros: [{ studentId: 'qa-student', studentName: 'Teste', status: 'falta' }], criadoEm: date };
    const corrected = { ...record, registros: [{ studentId: 'qa-student', studentName: 'Teste', status: 'presente' as const }], criadoEm: '2026-10-02T10:00:00Z' };
    expect(calculateStudentAttendanceRate('qa-student', [record, corrected])).toMatchObject({ totalAulas: 1, presencas: 1, taxaPercentual: 100 });
  });
});
