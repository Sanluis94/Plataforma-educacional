import type { ClassReportInput, ClassLearningReport, LearningEvidence, LearningRecord, LearningSource } from '../learningAnalyticsTypes';
import type { ExamAttempt } from '../types';

const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const scoreOf = (value: unknown) => finite(value) && value >= 0 && value <= 100 ? value : null;
const round = (value: number) => Math.round(value * 10) / 10;
const mean = (values: (number | null)[], precision = 1) => {
  const measured = values.filter((value): value is number => value !== null);
  const scale = 10 ** precision;
  return measured.length ? Math.round(measured.reduce((sum, value) => sum + value, 0) / measured.length * scale) / scale : null;
};
const percent = (numerator: number, denominator: number) => denominator > 0 ? round(numerator / denominator * 100) : null;
const cleanText = (value: unknown, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;

export function learningTimestamp(value: unknown): string | null {
  try {
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') return learningTimestamp(value.toDate());
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:$|T.*(?:Z|[+-]\d{2}:\d{2})$)/.test(value)) return null;
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    const days = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) return null;
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toISOString() : null;
  } catch { return null; }
}

export function normalizeLearningEvidence(value: unknown): LearningEvidence | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== 1 || !['activity', 'lab', 'exam', 'enem'].includes(String(raw.source)) || !cleanText(raw.sessionId)) return undefined;
  const result: LearningEvidence = { schemaVersion: 1, source: raw.source as LearningSource, sessionId: cleanText(raw.sessionId).slice(0, 180) };
  for (const key of ['subject', 'labId', 'lessonPlanId'] as const) if (cleanText(raw[key])) result[key] = cleanText(raw[key]).slice(0, 500);
  const startedAt = learningTimestamp(raw.startedAt);
  if (startedAt) result.startedAt = startedAt;
  if (finite(raw.activeSeconds) && raw.activeSeconds >= 0 && raw.activeSeconds <= 7 * 24 * 3600) result.activeSeconds = round(raw.activeSeconds);
  if (raw.stage === 'assessment' || raw.stage === 'exploration' || raw.stage === 'response') result.stage = raw.stage;
  if (typeof raw.reflection === 'string') result.reflection = raw.reflection.slice(0, 20_000);
  if (raw.estimatedScore && typeof raw.estimatedScore === 'object') {
    const estimate = raw.estimatedScore as Record<string, unknown>;
    if (estimate.model === 'tri-practice' && estimate.scaleMax === 1000 && finite(estimate.value) && estimate.value >= 0 && estimate.value <= 1000) result.estimatedScore = { model: 'tri-practice', scaleMax: 1000, value: estimate.value };
  }
  if (Array.isArray(raw.questions)) result.questions = raw.questions.slice(0, 100).flatMap(item => {
    if (!item || typeof item !== 'object' || !cleanText(item.questionId) || !cleanText(item.question)) return [];
    const selectedOption = Number.isInteger(item.selectedOption) && item.selectedOption >= 0 && item.selectedOption < 100 ? item.selectedOption as number : null;
    return [{ questionId: cleanText(item.questionId).slice(0, 180), question: cleanText(item.question).slice(0, 4000), selectedOption,
      correct: typeof item.correct === 'boolean' && !(selectedOption === null && item.correct) ? item.correct as boolean : null,
      ...(cleanText(item.topic) ? { topic: cleanText(item.topic).slice(0, 500) } : {}),
      ...(cleanText(item.selectedText) ? { selectedText: cleanText(item.selectedText).slice(0, 4000) } : {}),
      ...(cleanText(item.expectedText) ? { expectedText: cleanText(item.expectedText).slice(0, 4000) } : {}),
      ...(cleanText(item.explanation) ? { explanation: cleanText(item.explanation).slice(0, 8000) } : {}),
    }];
  });
  if (result.questions) result.questions = [...new Map(result.questions.map(question => [question.questionId, question])).values()];
  if (Array.isArray(raw.observations)) result.observations = raw.observations.slice(0, 100).flatMap(item => item && typeof item === 'object' && cleanText(item.scenarioId) && typeof item.hypothesis === 'string' ? [{ scenarioId: cleanText(item.scenarioId).slice(0, 180), hypothesis: item.hypothesis.slice(0, 10_000), ...(cleanText(item.scenarioLabel) ? { scenarioLabel: cleanText(item.scenarioLabel).slice(0, 500) } : {}), ...(typeof item.observed === 'boolean' ? { observed: item.observed } : {}) }] : []);
  if (raw.experiment && typeof raw.experiment === 'object') {
    const experiment = raw.experiment as Record<string, unknown>;
    const numbers = (input: unknown) => Object.fromEntries(input && typeof input === 'object' && !Array.isArray(input) ? Object.entries(input).filter(([, number]) => finite(number)).slice(0, 64) : []) as Record<string, number>;
    result.experiment = { parameters: numbers(experiment.parameters), telemetry: numbers(experiment.telemetry), samples: finite(experiment.samples) && experiment.samples >= 0 ? Math.floor(experiment.samples) : 0 };
    for (const key of ['parameterUnits', 'telemetryUnits', 'parameterLabels', 'telemetryLabels'] as const) {
      if (experiment[key] && typeof experiment[key] === 'object') result.experiment[key] = Object.fromEntries(Object.entries(experiment[key]).filter(([, text]) => typeof text === 'string').slice(0, 64).map(([id, text]) => [id, cleanText(text).slice(0, 300)]));
    }
  }
  return result;
}

interface Item {
  id: string; title: string; source: LearningSource; subject: string | null; assigned: boolean; dueDate: string | null;
}
const keyFor = (source: LearningSource, id: string) => `${source}:${id}`;
const compareRecords = (a: LearningRecord, b: LearningRecord) => b.submittedAt.localeCompare(a.submittedAt) || b.id.localeCompare(a.id);

export function examAttemptPercentage(attempt: Pick<ExamAttempt, 'pontuacaoObtida' | 'pontuacaoMaxima'>): number | null {
  const { pontuacaoObtida: obtained, pontuacaoMaxima: maximum } = attempt;
  return finite(obtained) && finite(maximum) && maximum > 0 && obtained >= 0 && obtained <= maximum ? Math.round(obtained / maximum * 10_000) / 100 : null;
}

export function scopeClassLearningInput(input: ClassReportInput): ClassReportInput {
  const activityIds = new Set(input.activities.filter(activity => activity.classId === input.classData.id && activity.id).map(activity => activity.id));
  return {
    ...input,
    submissions: input.submissions.filter(submission => submission && (submission.classId === input.classData.id || (!submission.classId && (!submission.evidence?.source || submission.evidence.source === 'activity') && activityIds.has(submission.activityId)))),
    examAttempts: (input.examAttempts ?? []).filter(attempt => attempt && attempt.turmaId === input.classData.id),
  };
}

/** One transformation for browser, Firestore and batch; missing measurements stay missing. */
export function buildClassLearningReport(input: ClassReportInput): ClassLearningReport {
  input = scopeClassLearningInput(input);
  const { classData } = input;
  const generatedAt = learningTimestamp(input.now) ?? new Date().toISOString();
  const now = Date.parse(generatedAt);
  const roster = [...new Set((classData.studentIds ?? []).filter(id => typeof id === 'string' && id.trim()))];
  const studentIds = new Set(roster);
  const users = new Map(input.users.map(user => [user.id, user]));
  const quality: ClassLearningReport['quality'] = { received: input.submissions.length + (input.examAttempts?.length ?? 0), accepted: 0, duplicates: 0, retries: 0, excluded: 0, missingScores: 0, missingTimes: 0, warnings: [] };
  const notices = new Set<string>();
  const items = new Map<string, Item>();
  const allActivities = new Map(input.activities.filter(activity => activity.id).map(activity => [activity.id!, activity]));
  const allExams = new Map((input.exams ?? []).filter(exam => exam.id).map(exam => [exam.id!, exam]));
  const plans = (input.lessonPlans ?? []).filter(plan => plan.id && plan.turmaId === classData.id && plan.professorId === classData.professorId && plan.laboratorioAssociadoId);
  const planById = new Map(plans.map(plan => [plan.id!, plan]));

  for (const activity of input.activities) {
    if (!activity.id || activity.classId !== classData.id || activity.professorId !== classData.professorId || activity.status !== 'published') continue;
    items.set(keyFor('activity', activity.id), { id: activity.id, title: activity.title, source: 'activity', subject: cleanText(activity.subject) || null, assigned: true, dueDate: learningTimestamp(activity.dueDate) });
  }
  for (const exam of input.exams ?? []) {
    if (!exam.id || exam.turmaId !== classData.id || exam.professorId !== classData.professorId || exam.status === 'Rascunho') continue;
    const opening = learningTimestamp(exam.dataInicio);
    if (opening && Date.parse(opening) > now) continue;
    items.set(keyFor('exam', exam.id), { id: exam.id, title: exam.titulo, source: 'exam', subject: cleanText(exam.disciplina) || null, assigned: true, dueDate: learningTimestamp(exam.dataLimite) });
  }
  for (const plan of plans) {
    const scheduled = learningTimestamp(plan.dataPrevista);
    if (plan.status === 'planejada' && scheduled && Date.parse(scheduled) > now) continue;
    items.set(keyFor('lab', plan.id!), { id: plan.id!, title: plan.laboratorioTitulo || plan.topico, source: 'lab', subject: null, assigned: true, dueDate: null });
  }

  const accepted: LearningRecord[] = [];
  const seen = new Set<string>();
  function accept(candidate: Omit<LearningRecord, 'assigned'>, classId: string, validLink: boolean) {
    const time = learningTimestamp(candidate.submittedAt);
    if (classId !== classData.id || !studentIds.has(candidate.studentId) || !candidate.itemId || !validLink || !time || Date.parse(time) > now + 5 * 60_000) {
      quality.excluded++;
      notices.add('Registros sem vínculo válido com a turma, aluno matriculado ou data válida foram excluídos.');
      return;
    }
    const duplicateKey = `${candidate.source}:${candidate.id}`;
    if (seen.has(duplicateKey)) { quality.duplicates++; return; }
    seen.add(duplicateKey);
    const itemKey = keyFor(candidate.source, candidate.itemId);
    let item = items.get(itemKey);
    if (!item) {
      item = { id: candidate.itemId, title: candidate.title, source: candidate.source, subject: candidate.subject, assigned: false, dueDate: null };
      items.set(itemKey, item);
    }
    if (!item.subject && candidate.subject) item.subject = candidate.subject;
    const evaluated = candidate.completed && candidate.evidence?.stage !== 'exploration' && candidate.evidence?.stage !== 'response';
    const score = evaluated ? scoreOf(candidate.score) : null;
    const activeSeconds = finite(candidate.activeSeconds) && candidate.activeSeconds >= 0 && candidate.activeSeconds <= 7 * 24 * 3600 ? candidate.activeSeconds : null;
    if (evaluated && score === null) quality.missingScores++;
    if (activeSeconds === null) quality.missingTimes++;
    accepted.push({ ...candidate, title: cleanText(candidate.title, item.title), subject: candidate.subject || item.subject, score, activeSeconds, submittedAt: time, assigned: item.assigned });
    quality.accepted++;
  }

  for (const submission of input.submissions) {
    if (!submission || !['completed', 'pending'].includes(submission.status)) {
      quality.excluded++;
      notices.add('Registros com estado de entrega desconhecido foram excluídos.');
      continue;
    }
    const evidence = normalizeLearningEvidence(submission.evidence);
    if (submission.evidence && !evidence) notices.add('Evidências com formato desconhecido foram desconsideradas; confira os registros de origem.');
    const source: LearningSource = evidence?.source === 'lab' ? 'lab' : evidence?.source === 'enem' ? 'enem' : 'activity';
    const activity = allActivities.get(submission.activityId);
    let classId = submission.classId;
    if (!classId && source === 'activity' && activity?.classId === classData.id) {
      classId = classData.id;
      notices.add('Alguns registros antigos tiveram o vínculo recuperado pela atividade da turma.');
    }
    let itemId = source === 'lab' ? evidence?.lessonPlanId || evidence?.labId || submission.activityId : submission.activityId;
    let validLink = source === 'lab';
    if (source === 'lab') {
      const linkedPlan = evidence?.lessonPlanId ? planById.get(evidence.lessonPlanId) : null;
      validLink = !evidence?.lessonPlanId || Boolean(linkedPlan && linkedPlan.laboratorioAssociadoId === (evidence.labId || submission.activityId));
      if (!evidence?.lessonPlanId) {
        const matchingPlans = plans.filter(plan => plan.laboratorioAssociadoId === (evidence?.labId || submission.activityId));
        if (matchingPlans.length === 1) itemId = matchingPlans[0].id!;
      }
    } else if (source === 'enem') {
      validLink = submission.activityId === 'enem-training-v1' && evidence?.stage === 'assessment';
    } else {
      validLink = Boolean(activity && activity.classId === classData.id && activity.professorId === classData.professorId && activity.status === 'published');
    }
    accept({
      id: submission.id || evidence?.sessionId || `${submission.studentId}:${itemId}:${submission.submittedAt}`,
      itemId, title: submission.activityTitle, source, subject: cleanText(evidence?.subject || activity?.subject) || null,
      studentId: submission.studentId, studentName: submission.studentName,
      score: submission.score, completed: submission.status === 'completed', submittedAt: submission.submittedAt,
      activeSeconds: evidence?.activeSeconds ?? null, evidence,
    }, classId, validLink);
  }
  for (const attempt of input.examAttempts ?? []) {
    const exam = allExams.get(attempt.examId);
    const examChanged = exam?.atualizadoEm && learningTimestamp(exam.atualizadoEm) && learningTimestamp(attempt.dataEnvio) && Date.parse(exam.atualizadoEm) > Date.parse(attempt.dataEnvio);
    if (examChanged && !attempt.evidence?.questions?.length) notices.add('Uma avaliação foi editada após a entrega; o texto original não está disponível em alguns registros antigos.');
    const questions: LearningEvidence['questions'] = exam ? (Array.isArray(attempt.respostas) ? attempt.respostas : []).filter(answer => answer && Number.isInteger(answer.questaoIndex) && exam.questoes[answer.questaoIndex]).map(answer => {
      const question = exam.questoes[answer.questaoIndex];
      const option = examChanged ? null : question.opcoes[answer.opcaoEscolhidaIndex];
      return { questionId: `${attempt.examId}:${answer.questaoIndex}`, question: examChanged ? `Questão ${answer.questaoIndex + 1} (texto da versão aplicada não registrado)` : question.enunciado, selectedOption: answer.opcaoEscolhidaIndex >= 0 ? answer.opcaoEscolhidaIndex : null, ...(option ? { selectedText: option.texto } : {}), ...(examChanged ? {} : { expectedText: question.opcoes.find(option => option.isCorreta)?.texto, explanation: question.justificativa }), correct: typeof answer.acertou === 'boolean' ? answer.acertou : null, topic: examChanged ? undefined : question.tema };
    }) : [];
    const evidence = normalizeLearningEvidence(attempt.evidence) ?? { schemaVersion: 1, source: 'exam', sessionId: attempt.id || `${attempt.alunoId}:${attempt.examId}:${attempt.dataEnvio}`, questions };
    const percentage = examAttemptPercentage(attempt);
    if (percentage !== null && percentage !== attempt.porcentagemAproveitamento) notices.add('Percentuais de avaliações foram calculados pelos pontos obtidos e máximos registrados na entrega.');
    accept({
      id: attempt.id || evidence.sessionId, itemId: attempt.examId, title: attempt.examTitle, source: 'exam', subject: cleanText(exam?.disciplina) || null,
      studentId: attempt.alunoId, studentName: attempt.alunoNome,
      score: percentage, completed: true, submittedAt: attempt.dataEnvio,
      activeSeconds: evidence.activeSeconds ?? null, evidence: { ...evidence, questions: evidence.questions ?? questions },
    }, attempt.turmaId, Boolean(exam && exam.turmaId === classData.id && exam.professorId === classData.professorId && exam.status !== 'Rascunho'));
  }

  const groups = new Map<string, LearningRecord[]>();
  for (const record of accepted) {
    const key = `${record.studentId}|${keyFor(record.source, record.itemId)}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  const latest: LearningRecord[] = [];
  for (const records of groups.values()) {
    const assessments = records.filter(record => record.evidence?.stage !== 'exploration');
    const completed = assessments.filter(record => record.completed).sort(compareRecords);
    const selected = completed[0] ?? [...records].sort(compareRecords)[0];
    latest.push(selected);
    quality.retries += Math.max(0, assessments.length - 1);
  }
  const assessed = latest.filter(record => record.completed && record.score !== null);
  const completedAssigned = latest.filter(record => record.assigned && record.completed && record.evidence?.stage !== 'exploration');
  const assignedCount = [...items.values()].filter(item => item.assigned).length;
  const expectedCompletions = assignedCount * roster.length;
  const measured = latest.filter(record => record.activeSeconds !== null);
  if (quality.duplicates) notices.add('Reenvios com o mesmo identificador foram contados uma única vez.');
  if (quality.retries) notices.add('Tentativas diferentes permanecem no histórico; a última entrega concluída representa cada aluno e atividade nos indicadores.');
  if (quality.missingScores) notices.add('Entregas sem nota válida não entram na média.');
  if (quality.missingTimes) notices.add('Registros sem duração medida não entram no cálculo de tempo.');
  const missingProfiles = roster.filter(id => !users.has(id));
  if (missingProfiles.length) notices.add('Alunos sem perfil disponível permanecem na contagem de matriculados; o nome vem da entrega quando disponível.');
  quality.warnings = [...notices];

  const modules: ClassLearningReport['modules'] = [...items.entries()].map(([key, item]) => {
    const records = latest.filter(record => keyFor(record.source, record.itemId) === key);
    const attempts = accepted.filter(record => keyFor(record.source, record.itemId) === key);
    const graded = records.filter(record => record.completed && record.evidence?.stage !== 'exploration');
    const durations = records.map(record => record.activeSeconds).filter((value): value is number => value !== null);
    const questionGroups = new Map<string, { questionId: string; question: string; responses: number; correct: number; accuracy: number | null }>();
    for (const record of graded) for (const question of record.evidence?.questions ?? []) {
      if (!question.questionId || typeof question.correct !== 'boolean') continue;
      const current = questionGroups.get(question.questionId) ?? { questionId: question.questionId, question: question.question, responses: 0, correct: 0, accuracy: null };
      current.responses++;
      if (question.correct) current.correct++;
      current.accuracy = percent(current.correct, current.responses);
      questionGroups.set(question.questionId, current);
    }
    return {
      itemId: item.id, module: item.title, source: item.source, subject: item.subject, assigned: item.assigned,
      eventsCount: graded.length, attemptsCount: attempts.length, studentsCount: new Set(records.map(record => record.studentId)).size,
      averageScore: mean(graded.map(record => record.score)),
      completionRate: item.assigned ? percent(graded.length, roster.length) : null,
      totalTimeSpentMinutes: durations.length ? Math.round(durations.reduce((sum, seconds) => sum + seconds, 0) / 60 * 1000) / 1000 : null,
      questions: [...questionGroups.values()].sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101)),
    };
  }).sort((a, b) => b.eventsCount - a.eventsCount || a.module.localeCompare(b.module, 'pt-BR'));

  const students: ClassLearningReport['students'] = roster.map(studentId => {
    const records = accepted.filter(record => record.studentId === studentId).sort(compareRecords);
    const consolidated = latest.filter(record => record.studentId === studentId);
    const completed = consolidated.filter(record => record.completed && record.evidence?.stage !== 'exploration');
    const averageScore = mean(completed.map(record => record.score));
    const completedAssignedCount = completed.filter(record => record.assigned).length;
    const overdue = [...items.entries()].filter(([key, item]) => item.assigned && item.dueDate && Date.parse(item.dueDate) < now && !completed.some(record => keyFor(record.source, record.itemId) === key));
    const supportReasons: string[] = [];
    if (averageScore !== null && averageScore < 70) supportReasons.push(`Média de ${averageScore}% nas entregas avaliadas, abaixo do critério de acompanhamento de 70%.`);
    if (overdue.length) supportReasons.push(`${overdue.length} atividade(s) com prazo encerrado sem entrega concluída.`);
    if (!records.length) supportReasons.push('Ainda não há entregas registradas. Verifique acesso e compreensão da proposta antes de avaliar desempenho.');
    const status = !records.length ? 'sem_dados' : supportReasons.length ? 'precisa_apoio' : averageScore !== null && averageScore >= 85 ? 'em_destaque' : 'regular';
    const progress = input.progress?.[studentId];
    return {
      studentId, studentName: cleanText(users.get(studentId)?.name) || records.find(record => cleanText(record.studentName))?.studentName || 'Aluno sem nome disponível',
      level: progress?.level ?? 1, xp: progress?.xp ?? 0, coins: progress?.coins ?? 0,
      completedModulesCount: completed.length, completedAssignedCount, expectedCount: assignedCount,
      averageScore, lastActive: records[0]?.submittedAt ?? null, status, supportReasons, records,
    };
  });
  return {
    classId: classData.id, className: classData.name, professorName: classData.professorName || users.get(classData.professorId)?.name || 'Professor', generatedAt, source: input.source,
    studentsCount: roster.length, activitiesCount: assignedCount, expectedCompletions,
    completedActivitiesCount: completedAssigned.length, averageScore: mean(assessed.map(record => record.score)),
    averageTimeSpentMinutes: mean(measured.map(record => record.activeSeconds === null ? null : record.activeSeconds / 60), 3),
    completionRate: percent(completedAssigned.length, expectedCompletions),
    participationRate: percent(new Set(accepted.map(record => record.studentId)).size, roster.length),
    studentsWithEvidence: new Set(accepted.map(record => record.studentId)).size,
    assessedStudentsCount: new Set(assessed.map(record => record.studentId)).size,
    scoredRecordsCount: assessed.length, measuredTimeRecordsCount: measured.length,
    topModule: modules.find(module => module.eventsCount > 0)?.module ?? 'Sem entregas concluídas',
    atRiskStudents: students.filter(student => student.status === 'precisa_apoio').map(student => student.studentName),
    quality, modules, students,
  };
}
