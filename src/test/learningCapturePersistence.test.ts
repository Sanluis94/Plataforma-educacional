import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../modules/core/services/firebaseConfig', () => ({ db: null }));
import { saveSubmission, getSubmissionsByStudent, getSubmissionsByClass } from '../modules/data/repositories/submissionRepository';
import { getLocalEtlProgress } from '../modules/data/services/localEtlClient';
import { completeStudentLabProgress } from '../modules/data/repositories/studentRepository';
import { saveExamAttempt, getExamAttemptsByClass } from '../modules/data/repositories/examRepository';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('edu_local_db', JSON.stringify({ users: [], classes: [], activities: [], progress: {}, systemLogs: [], learningEvents: [] }));
});

describe('Persistência fiel da evidência', () => {
  it('preserva conclusões, respostas e tempo reais sem criar prêmio ou duração aleatória', async () => {
    const payload = { activityId: 'activity-a', activityTitle: 'Atividade fictícia', classId: 'class-a', studentId: 'student-a', studentName: 'Aluno fictício', score: 50, status: 'completed' as const, submittedAt: '2026-10-11T10:00:00Z', evidence: { schemaVersion: 1 as const, source: 'activity' as const, sessionId: 'session-a', activeSeconds: 30, reflection: 'Concluí que...', questions: [{ questionId: 'q1', question: 'Qual hipótese?', selectedOption: 1, selectedText: 'Hipótese B', correct: false }] } };
    const first = await saveSubmission(payload); const repeated = await saveSubmission(payload);
    expect(repeated.id).toBe(first.id);
    expect(await getSubmissionsByStudent('student-a')).toEqual([first]);
    expect(await getSubmissionsByClass('class-a')).toEqual([first]);
    expect(first.evidence).toEqual(payload.evidence);
    expect(await getLocalEtlProgress('student-a')).toBeNull();
    await completeStudentLabProgress('student-a', 'activity-a', 50); await completeStudentLabProgress('student-a', 'activity-a', 50);
    expect(await getLocalEtlProgress('student-a')).toMatchObject({ xp: 40, coins: 15 });
  });

  it('não reatribui prática livre a qualquer turma', async () => {
    await saveSubmission({ activityId: 'lab-a', activityTitle: 'Prática livre', classId: '', studentId: 'student-a', studentName: 'Aluno fictício', score: 100, status: 'completed', submittedAt: '2026-10-11T10:00:00Z', evidence: { schemaVersion: 1, source: 'lab', sessionId: 'free-a', stage: 'assessment' } });
    expect(await getSubmissionsByClass('class-a')).toHaveLength(0);
    expect(await getSubmissionsByStudent('student-a')).toHaveLength(1);
  });

  it('uma tentativa de prova reenviada tem um único ID e conserva as respostas', async () => {
    const attempt = { examId: 'exam-a', examTitle: 'Prova fictícia', turmaId: 'class-a', alunoId: 'student-a', alunoNome: 'Aluno fictício', pontuacaoObtida: 1, pontuacaoMaxima: 2, porcentagemAproveitamento: 50, classificacao: 'Regular' as const, respostas: [{ questaoIndex: 0, opcaoEscolhidaIndex: 1, acertou: true, pontosObtidos: 1 }], dataEnvio: '2026-10-11T10:00:00Z', evidence: { schemaVersion: 1 as const, source: 'exam' as const, sessionId: 'exam-attempt-a', activeSeconds: 20 } };
    const first = await saveExamAttempt(attempt); const again = await saveExamAttempt(attempt);
    expect(first.id).toBe(again.id); expect(await getExamAttemptsByClass('class-a')).toEqual([first]);
  });
});
