import { describe, expect, it } from 'vitest';
import { buildClassLearningReport, learningTimestamp, normalizeLearningEvidence } from '../modules/data/services/learningAnalytics';
import { buildClassLearningReportCSV, csvCell } from '../modules/data/services/learningReportExport';
import type { ClassReportInput, LearningEvidence } from '../modules/data/learningAnalyticsTypes';
import type { ActivityData, ExamAttempt, ExamData, LessonPlanItem, SubmissionData } from '../modules/data/types';

const now = '2026-10-11T12:00:00.000Z';
const activity = (id = 'a1', classId = 'c1', status: ActivityData['status'] = 'published'): ActivityData => ({ id, title: 'Mesmo título', type: 'quiz', config: {}, classId, professorId: 'p1', createdAt: now, status, subject: 'Ciências' });
const base = (): ClassReportInput => ({
  classData: { id: 'c1', name: 'Turma real', professorId: 'p1', professorName: 'Professora', studentIds: ['s1', 's2', 's3', 's3'], studentsCount: 99, createdAt: now, updatedAt: now },
  users: [{ id: 's1', name: 'Ana', email: 'ana@example.test', role: 'estudante', createdAt: now }, { id: 's2', name: 'Bia', email: 'bia@example.test', role: 'estudante', createdAt: now }],
  activities: [activity()], submissions: [], source: 'local', now,
});
const submission = (overrides: Partial<SubmissionData> = {}): SubmissionData => ({ id: 'r1', activityId: 'a1', activityTitle: 'Título enviado', classId: 'c1', studentId: 's1', studentName: 'Ana da entrega', score: 80, submittedAt: '2026-10-10T12:00:00.000Z', status: 'completed', ...overrides });
const evidence = (overrides: Partial<LearningEvidence> = {}): LearningEvidence => ({ schemaVersion: 1, source: 'activity', sessionId: 'session1', stage: 'assessment', ...overrides });

describe('transformação pedagógica única', () => {
  it('mantém matrícula e ausência de evidências sem fabricar nota, tempo ou atividade recente', () => {
    const report = buildClassLearningReport(base());
    expect(report.studentsCount).toBe(3);
    expect(report.expectedCompletions).toBe(3);
    expect(report.completionRate).toBe(0);
    expect(report.averageScore).toBeNull();
    expect(report.averageTimeSpentMinutes).toBeNull();
    expect(report.students.every(student => student.status === 'sem_dados' && student.lastActive === null && student.averageScore === null)).toBe(true);
    expect(report.quality.warnings.join(' ')).toMatch(/perfil disponível/);
  });

  it('restringe atividades à turma, professor e publicação, e exclui vínculos/datas inválidos', () => {
    const input = base();
    input.activities.push(activity('other', 'c2'), activity('draft', 'c1', 'draft'), { ...activity('intruder'), professorId: 'p2' });
    input.submissions = [submission(), submission({ id: 'r2', activityId: 'other' }), submission({ id: 'r3', studentId: 'unknown' }), submission({ id: 'r4', submittedAt: 'não é data' }), submission({ id: 'r5', submittedAt: '2026-12-01T12:00:00Z' }), submission({ id: 'r6', activityId: 'draft' })];
    const report = buildClassLearningReport(input);
    expect(report.activitiesCount).toBe(1);
    expect(report.completedActivitiesCount).toBe(1);
    expect(report.completionRate).toBe(33.3);
    expect(report.averageScore).toBe(80);
    expect(report.quality.excluded).toBe(5);
  });

  it('deduplica reenvios e usa última conclusão, mantendo tentativas no histórico', () => {
    const input = base();
    input.submissions = [submission({ score: 10 }), submission({ score: 10 }), submission({ id: 'r2', score: 90, submittedAt: '2026-10-11T10:00:00Z' }), submission({ id: 'r3', score: 0, status: 'pending', submittedAt: '2026-10-11T11:00:00Z' })];
    const report = buildClassLearningReport(input);
    expect(report.completedActivitiesCount).toBe(1);
    expect(report.averageScore).toBe(90);
    expect(report.quality.duplicates).toBe(1);
    expect(report.quality.retries).toBe(2);
    expect(report.students[0].records).toHaveLength(3);
    expect(report.students[0].lastActive).toBe('2026-10-11T11:00:00.000Z');
    expect(report.students[0].status).toBe('em_destaque');
  });

  it('distingue nota zero de nota ausente ou inválida e de envio pendente', () => {
    const input = base();
    input.submissions = [submission({ score: 0 }), submission({ id: 'r2', studentId: 's2', score: Number.NaN }), submission({ id: 'r3', studentId: 's3', status: 'pending', score: 100 })];
    const report = buildClassLearningReport(input);
    expect(report.averageScore).toBe(0);
    expect(report.students[0].status).toBe('precisa_apoio');
    expect(report.students[1].averageScore).toBeNull();
    expect(report.students[1].status).toBe('regular');
    expect(report.students[2].averageScore).toBeNull();
    expect(report.completedActivitiesCount).toBe(2);
    expect(report.scoredRecordsCount).toBe(1);
    expect(report.quality.missingScores).toBe(1);
  });

  it('não funde atividades com o mesmo título e não usa progresso global como entrega da turma', () => {
    const input = base();
    input.activities.push(activity('a2'));
    input.submissions = [submission(), submission({ id: 'r2', activityId: 'a2', score: 0 })];
    input.progress = { s1: { level: 5, xp: 500, coins: 30, completedModules: ['elsewhere', 'elsewhere2'], purchasedItems: [], updatedAt: now } };
    const report = buildClassLearningReport(input);
    expect(report.modules).toHaveLength(2);
    expect(report.modules.map(module => module.itemId).sort()).toEqual(['a1', 'a2']);
    expect(report.averageScore).toBe(40);
    expect(report.students[0].completedModulesCount).toBe(2);
    expect(report.students[1].completedModulesCount).toBe(0);
  });

  it('usa apenas duração medida, nunca duração antiga estimada', () => {
    const input = base();
    input.submissions = [submission({ evidence: evidence({ activeSeconds: 120 }) }), submission({ id: 'r2', studentId: 's2' })];
    const report = buildClassLearningReport(input);
    expect(report.averageTimeSpentMinutes).toBe(2);
    expect(report.measuredTimeRecordsCount).toBe(1);
    expect(report.quality.missingTimes).toBe(1);
    expect(report.modules[0].totalTimeSpentMinutes).toBe(2);
  });
  it('uma resposta escrita cumpre a entrega sem gerar nota zero ou contaminar o boletim', () => {
    const input = base();
    input.submissions = [submission({ score: 0, evidence: evidence({ stage: 'response', questions: [], reflection: 'Minha resposta escrita', activeSeconds: 40 }) })];
    const report = buildClassLearningReport(input);
    expect(report.completedActivitiesCount).toBe(1);
    expect(report.completionRate).toBe(33.3);
    expect(report.averageScore).toBeNull();
    expect(report.scoredRecordsCount).toBe(0);
    expect(report.quality.missingScores).toBe(0);
    expect(report.students[0].status).toBe('regular');
  });

  it('exploração tem evidência e participação sem inventar nota ou conclusão avaliada', () => {
    const input = base();
    input.submissions = [submission({ score: 100, evidence: evidence({ stage: 'exploration', reflection: 'Minha hipótese' }) })];
    const report = buildClassLearningReport(input);
    expect(report.studentsWithEvidence).toBe(1);
    expect(report.averageScore).toBeNull();
    expect(report.completedActivitiesCount).toBe(0);
    expect(report.modules[0].eventsCount).toBe(0);
    expect(report.students[0].records[0].evidence?.reflection).toBe('Minha hipótese');
  });

  it('provas formais entram na mesma turma sem misturar pontos e porcentagem', () => {
    const input = base();
    const exam: ExamData = { id: 'exam1', professorId: 'p1', titulo: 'Prova', disciplina: 'Ciências', turmaId: 'c1', status: 'Aberta', pesoTotal: 2, criadoEm: now, questoes: [{ enunciado: 'Pergunta?', tema: 'Tema', nivelDificuldade: 'Fácil', valorPeso: 2, justificativa: 'Justificativa', opcoes: [{ texto: 'Texto escolhido', isCorreta: true }, { texto: 'Outra opção', isCorreta: false }] }] };
    const attempt: ExamAttempt = { id: 'exam-r1', examId: 'exam1', examTitle: 'Prova', turmaId: 'c1', alunoId: 's1', alunoNome: 'Ana', pontuacaoObtida: 2, pontuacaoMaxima: 2, porcentagemAproveitamento: 100, classificacao: 'Excelente', respostas: [{ questaoIndex: 0, opcaoEscolhidaIndex: 0, acertou: true, pontosObtidos: 2 }], dataEnvio: '2026-10-10T10:00:00Z' };
    input.exams = [exam, { ...exam, id: 'future', dataInicio: '2026-11-01T10:00:00Z' }];
    input.examAttempts = [attempt];
    const report = buildClassLearningReport(input);
    expect(report.activitiesCount).toBe(2);
    expect(report.expectedCompletions).toBe(6);
    expect(report.averageScore).toBe(100);
    expect(report.modules.find(module => module.source === 'exam')?.questions[0]).toMatchObject({ responses: 1, correct: 1, accuracy: 100 });
    expect(report.students[0].records[0].evidence?.questions?.[0].selectedText).toBe('Texto escolhido');
  });

  it('vincula laboratório ao plano explícito e rejeita plano de outra turma ou laboratório diferente', () => {
    const input = base();
    const plan: LessonPlanItem = { id: 'lp1', professorId: 'p1', turmaId: 'c1', periodo: '1º Bimestre', topico: 'Investigar', metodologia: 'Experimento', laboratorioAssociadoId: 'lab1', laboratorioTitulo: 'Experiência', status: 'em_andamento', criadoEm: now };
    input.lessonPlans = [plan];
    input.submissions = [submission({ activityId: 'lab1', evidence: evidence({ source: 'lab', labId: 'lab1', lessonPlanId: 'lp1' }) }), submission({ id: 'r2', activityId: 'lab2', evidence: evidence({ source: 'lab', labId: 'lab2', lessonPlanId: 'lp1' }) })];
    const report = buildClassLearningReport(input);
    expect(report.activitiesCount).toBe(2);
    expect(report.completedActivitiesCount).toBe(1);
    expect(report.modules.find(module => module.source === 'lab')?.itemId).toBe('lp1');
    expect(report.quality.excluded).toBe(1);
  });

  it('ausência de tarefas atribuídas tem taxa indefinida, e laboratório livre não é reatribuído', () => {
    const input = base();
    input.activities = [];
    input.submissions = [submission({ classId: '', activityId: 'free', evidence: evidence({ source: 'lab', labId: 'free' }) })];
    const report = buildClassLearningReport(input);
    expect(report.completionRate).toBeNull();
    expect(report.studentsWithEvidence).toBe(0);
    expect(report.quality.received).toBe(0);
    expect(report.quality.excluded).toBe(0);
  });

  it('analisa questões com texto real sem duplicar questão de uma mesma entrega', () => {
    const input = base();
    const question = { questionId: 'q1', question: 'Qual a evidência?', selectedOption: 1, selectedText: 'Texto da alternativa', correct: false };
    input.submissions = [submission({ activityTitle: 'Título da versão aplicada', evidence: evidence({ subject: 'Disciplina da entrega', questions: [question, question], observations: [{ scenarioId: 's1', hypothesis: 'Previ aumento' }], reflection: 'Observei queda' }) })];
    const report = buildClassLearningReport(input);
    expect(report.modules[0].questions).toEqual([{ questionId: 'q1', question: 'Qual a evidência?', responses: 1, correct: 0, accuracy: 0 }]);
    expect(report.students[0].records[0].evidence?.questions?.[0].selectedText).toBe('Texto da alternativa');
    expect(report.students[0].records[0]).toMatchObject({ title: 'Título da versão aplicada', subject: 'Disciplina da entrega' });
    expect(report.modules[0].module).toBe('Mesmo título');
  });

  it('não transforma registro sem envio em data atual, nem aceita datas impossíveis/ambíguas', () => {
    expect(learningTimestamp('2026-02-30T10:00:00Z')).toBeNull();
    expect(learningTimestamp('2026-10-11T10:00:00')).toBeNull();
    expect(learningTimestamp('2026-10-11T10:00:00-03:00')).toBe('2026-10-11T13:00:00.000Z');
    expect(learningTimestamp({ toDate: () => new Date('2026-10-11T10:00:00Z') })).toBe('2026-10-11T10:00:00.000Z');
    expect(learningTimestamp(undefined)).toBeNull();
  });

  it('evidências malformadas não derrubam a transformação e são indicadas', () => {
    expect(normalizeLearningEvidence({ schemaVersion: 1, source: 'lab', sessionId: 's', questions: {}, experiment: { parameters: { good: 10, invalid: Number.NaN }, telemetry: {}, samples: 3 } })).toMatchObject({ experiment: { parameters: { good: 10 }, samples: 3 } });
    const input = base();
    input.submissions = [submission({ evidence: {} as LearningEvidence })];
    expect(buildClassLearningReport(input).quality.warnings.join(' ')).toMatch(/formato desconhecido/);
  });

  it('tem os mesmos indicadores em fontes local, Firestore e batch', () => {
    const input = base(); input.submissions = [submission({ score: 0, evidence: evidence({ activeSeconds: 70 }) })];
    const reports = ['local', 'firestore', 'batch'].map(source => { const report = buildClassLearningReport({ ...input, source: source as ClassReportInput['source'] }); return { ...report, source: 'equal' }; });
    expect(reports[0]).toEqual(reports[1]); expect(reports[1]).toEqual(reports[2]);
  });
  it('qualidade da turma não acusa entregas válidas de outra turma como registros defeituosos', () => {
    const input = base();
    input.activities.push(activity('other', 'c2'));
    input.submissions = [submission(), submission({ id: 'other-r1', activityId: 'other', classId: 'c2' })];
    const fullSnapshot = buildClassLearningReport(input);
    const classQuery = buildClassLearningReport({ ...input, submissions: [input.submissions[0]] });
    expect(fullSnapshot).toEqual(classQuery);
    expect(fullSnapshot.quality.received).toBe(1);
    expect(fullSnapshot.quality.excluded).toBe(0);
  });
});

describe('exportação fiel e segura', () => {
  it('escapa pontuação, aspas, quebras e fórmulas de planilha', () => {
    expect(csvCell('Nome; "apelido"\nsegunda linha')).toBe('"Nome; ""apelido""\nsegunda linha"');
    for (const value of ['=SUM(1;2)', '+CMD', '-CMD', '@CMD', '  =CMD', '\ttexto']) expect(csvCell(value).startsWith('"\'')).toBe(true);
    expect(csvCell(null)).toBe('""');
    expect(csvCell(0)).toBe('"0"');
  });
  it('exporta tentativas completas e alunos sem evidências, com ausências vazias', () => {
    const input = base();
    input.submissions = [submission({ evidence: evidence({ reflection: 'Minha conclusão', questions: [{ questionId: 'q1', question: 'Pergunta', selectedOption: 0, selectedText: 'Resposta real', correct: true }] }) })];
    const csv = buildClassLearningReportCSV(buildClassLearningReport(input));
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Minha conclusão"');
    expect(csv).toContain('Pergunta: Resposta real; correta');
    expect(csv).toContain('"Sem evidências"');
    expect(csv).not.toContain('undefined');
    expect(csv).not.toContain('null');
  });
});
