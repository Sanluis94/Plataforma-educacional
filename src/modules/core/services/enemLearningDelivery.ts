import { getStudentClasses } from '../../data/repositories/classRepository';
import type { EnemAttempt } from '../../data/services/enemAttemptSession';
import { BANCO_ITENS_ENEM_PADRAO } from '../../data/services/triCalculationService';
import { offlineSyncService } from './offlineSyncService';
import type { LearningEvidence } from '../../data/learningAnalyticsTypes';

export function enemLearningEvidence(attempt: EnemAttempt): LearningEvidence {
  if (attempt.status !== 'finished' || !attempt.result || attempt.startedAt === null) throw new Error('Conclua o treino antes de compartilhar.');
  return { schemaVersion: 1, source: 'enem', sessionId: `enem-${attempt.startedAt}`, startedAt: new Date(attempt.startedAt).toISOString(), stage: 'assessment', subject: 'Treino ENEM',
    ...(attempt.activeSeconds !== undefined ? { activeSeconds: attempt.activeSeconds } : {}),
    estimatedScore: { value: attempt.result.notaEnem, model: 'tri-practice', scaleMax: 1000 },
    questions: BANCO_ITENS_ENEM_PADRAO.map(item => ({ questionId: item.id, question: item.enunciado, selectedOption: attempt.answers[item.id] ?? null, selectedText: item.opcoes[attempt.answers[item.id]], expectedText: item.opcoes[item.respostaCorreta], explanation: item.justificativa, correct: attempt.answers[item.id] === item.respostaCorreta, topic: `${item.area} · ${item.habilidadeBNCC}` })),
  };
}

export async function deliverEnemLearning(userId: string, studentName: string, attempt: EnemAttempt, classId = '') {
  const evidence = enemLearningEvidence(attempt);
  if (classId && !(await getStudentClasses(userId)).some(entry => entry.id === classId)) throw new Error('Selecione uma turma em que você está matriculado.');
  return offlineSyncService.deliver({ kind: 'submission', studentId: userId, submission: { studentId: userId, studentName, classId, activityId: 'enem-training-v1', activityTitle: 'Treino para o ENEM', score: attempt.result!.porcentagemAcerto, status: 'completed', submittedAt: new Date().toISOString(), evidence } });
}
