/// <reference types="node" />
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
// Batch modules are executable JavaScript, intentionally shared with Node 22.
// @ts-expect-error JavaScript ETL has a checked runtime boundary.
import { transformEducationalSnapshot } from '../../scripts/etl/transform.mjs';
// @ts-expect-error JavaScript configuration has a checked runtime boundary.
import { defaultOutputDir, defaultSource, publicSeedOutputDir, validateOutputDirectory, repoRoot } from '../../scripts/etl/config.mjs';
import { buildClassLearningReport } from '../modules/data/services/learningAnalytics';
const now = '2026-10-11T10:00:00Z';
const date = '2026-10-01T10:00:00Z';
function fixture() {
  return { collections: { users: [{ id: 'prof', name: 'Professor fictício', role: 'teacher' }, { id: 'coordinator', name: 'Coordenação fictícia', role: 'coordenador', academicLevel: 'medio' }, { id: 'student', name: 'Aluno fictício', role: 'student', academicLevel: 'medio' }, { id: 'empty', name: 'Sem entregas', role: 'student' }], classes: [{ id: 'class', name: 'Turma fictícia', professorId: 'prof', studentIds: ['student', 'empty'], code: 'QA1234', academicLevel: 'medio', gradeLevel: '3' }], activities: [{ id: 'activity', title: 'Atividade fictícia', professorId: 'prof', classId: 'class', type: 'quiz', status: 'published', questions: [{ q: 'Teste?', options: ['A'], answer: 0 }], dueDate: date, config: {}, xpReward: 80 }], progress: [{ id: 'student', xp: 67, coins: 12, enrolledClasses: ['class'], completedModules: ['activity'], purchasedItems: ['book'], updatedAt: date }], submissions: [{ id: 'submission', activityId: 'activity', classId: 'class', studentId: 'student', studentName: 'Aluno fictício', activityTitle: 'Atividade fictícia', score: 0, status: 'completed', submittedAt: date, answers: { selected: 1 }, evidence: { schemaVersion: 1, source: 'activity', sessionId: 'session', activeSeconds: 90, stage: 'assessment' } }] } };
}
describe('ETL batch fiel ao contrato educacional', () => {
  it('preserva prática pessoal e compartilhada sem inventar turma para o histórico livre', () => {
    const payload = fixture();
    const free = { ...payload.collections.submissions[0], id: 'free', classId: '', activityId: 'lab-livre', evidence: { ...payload.collections.submissions[0].evidence, source: 'lab', sessionId: 'free-session' } };
    payload.collections.submissions.push(free);
    const snapshot = transformEducationalSnapshot(payload, { now });
    expect(snapshot.collections.submissions.find((row: { id: string }) => row.id === 'free').classId).toBe('');
    expect(snapshot.collections.submissions).toHaveLength(2);
    expect(snapshot.metrics.classReports[0].quality.received).toBe(1);
    expect(snapshot.metrics.classReports[0].quality.excluded).toBe(0);
  });
  it('preserva campos pedagógicos e matrícula sem reconstruir XP ou moedas', () => {
    const snapshot = transformEducationalSnapshot(fixture(), { now });
    expect(snapshot.collections.classes[0]).toMatchObject({ code: 'QA1234', academicLevel: 'medio', gradeLevel: '3' });
    expect(snapshot.collections.activities[0]).toMatchObject({ questions: [{ q: 'Teste?' }], dueDate: new Date(date).toISOString(), xpReward: 80 });
    expect(snapshot.collections.progress.student).toMatchObject({ xp: 67, coins: 12, enrolledClasses: ['class'], purchasedItems: ['book'] });
    expect(snapshot.collections.users.find((user: { id: string }) => user.id === 'coordinator').role).toBe('coordenador');
    expect(snapshot.collections.submissions[0].answers).toEqual({ selected: 1 });
  });
  it('produz exatamente o mesmo panorama que a transformação usada pelo professor', () => {
    const snapshot = transformEducationalSnapshot(fixture(), { now });
    const report = buildClassLearningReport({ classData: snapshot.collections.classes[0], ...snapshot.collections, source: 'batch', now });
    expect(snapshot.metrics.classReports[0]).toEqual(report);
    expect(report).toMatchObject({ averageScore: 0, averageTimeSpentMinutes: 1.5, completionRate: 50 });
    expect(report.students.find(student => student.studentId === 'empty')).toMatchObject({ averageScore: null, lastActive: null, status: 'sem_dados' });
  });
  it('não fabrica notas, datas, estados concluídos ou progresso', () => {
    const payload = fixture();
    Object.assign(payload.collections.submissions[0], { score: undefined, submittedAt: 'invalid', status: 'unknown' });
    payload.collections.progress = [];
    const snapshot = transformEducationalSnapshot(payload, { now });
    expect(snapshot.collections.submissions[0]).toMatchObject({ score: null, submittedAt: null, status: 'unknown' });
    expect(snapshot.quality.issues.some((issue: { reason: string }) => issue.reason.includes('Estado de entrega desconhecido'))).toBe(true);
    expect(snapshot.collections.progress).toEqual({});
    expect(snapshot.metrics.summary).toMatchObject({ averageScore: null, totalCompletedActivities: 0 });
    expect(snapshot.quality.issues.length).toBeGreaterThan(0);
  });
  it('aceita coleções Firestore de provas e planos de aula, preservando evidências', () => {
    const payload = fixture();
    Object.assign(payload.collections, { exams: [{ id: 'exam', professorId: 'prof', turmaId: 'class', titulo: 'Prova fictícia', disciplina: 'Física', status: 'Aberta', questoes: [], criadoEm: date }], exam_attempts: [{ id: 'attempt', examId: 'exam', turmaId: 'class', alunoId: 'student', alunoNome: 'Aluno', porcentagemAproveitamento: 50, dataEnvio: date, respostas: [] }], lesson_plans: [{ id: 'plan', professorId: 'prof', turmaId: 'class', topico: 'Prática', laboratorioAssociadoId: 'lab', status: 'em_andamento', criadoEm: date }] });
    const snapshot = transformEducationalSnapshot(payload, { now });
    expect(snapshot.collections.examAttempts).toHaveLength(1);
    expect(snapshot.collections.lessonPlans[0].laboratorioAssociadoId).toBe('lab');
    expect(snapshot.metrics.classReports[0].modules.some((module: { source: string }) => module.source === 'exam')).toBe(true);
  });
  it('migra submissions do seed legado com identidade estável e sem duplicação por nova extração', () => {
    const payload = fixture();
    const legacy = { studentId: 'student', score: 80, status: 'completed', completedAt: date, timeSpentMinutes: 3 };
    Object.assign(payload.collections.activities[0], { submissions: [legacy, legacy] });
    payload.collections.submissions = [];
    const first = transformEducationalSnapshot(payload, { now });
    const second = transformEducationalSnapshot(payload, { now });
    expect(first.collections.submissions).toHaveLength(1);
    expect(second.collections.submissions).toEqual(first.collections.submissions);
    expect(first.quality.duplicates).toBe(1);
  });
  it('normaliza o seed versionado inteiro sem consultar serviços reais', async () => {
    const payload = JSON.parse(await readFile(defaultSource, 'utf8'));
    const snapshot = transformEducationalSnapshot(payload, { now });
    expect(snapshot.collections.users.length).toBe(payload.users.length);
    expect(snapshot.metrics.classReports.length).toBe(payload.classes.length);
    expect(snapshot.metrics.summary.completionRate).toBeLessThanOrEqual(100);
  });
  it('bloqueia saída pública Firebase, travessia e alvos fora da área ETL', async () => {
    expect(defaultOutputDir).toBe(resolve(repoRoot, '.local/etl'));
    await expect(validateOutputDirectory(publicSeedOutputDir, { source: 'firebase' })).rejects.toThrow('saída ETL');
    await expect(validateOutputDirectory(publicSeedOutputDir, { source: 'firebase', publicSeed: true })).rejects.toThrow('Somente o seed');
    for (const path of [repoRoot, resolve(defaultOutputDir, '..'), resolve(repoRoot, '../outside')]) await expect(validateOutputDirectory(path, { source: defaultSource })).rejects.toThrow('saída ETL');
  });
});
