import { createHash } from 'node:crypto';
import { buildClassLearningReport, learningTimestamp } from '../../src/modules/data/services/learningAnalytics.ts';

const roles = new Map([['admin', 'admin'], ['administrador', 'admin'], ['professor', 'professor'], ['teacher', 'professor'], ['estudante', 'estudante'], ['student', 'estudante'], ['aluno', 'estudante'], ['coordenador', 'coordenador'], ['coordinator', 'coordenador']]);
const dateKeys = new Set(['createdAt', 'updatedAt', 'lastLoginAt', 'submittedAt', 'completedAt', 'timestamp', 'criadoEm', 'atualizadoEm', 'dataEnvio', 'dataInicio', 'dataLimite', 'dueDate', 'startedAt', 'gradedAt']);
const record = value => typeof value === 'object' && value !== null && !Array.isArray(value);
const string = value => typeof value === 'string' && value.trim() ? value.trim() : undefined;
const number = value => typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'string' && value.trim() && Number.isFinite(Number(value)) ? Number(value) : null;
const iso = learningTimestamp;
const unique = value => Array.isArray(value) ? [...new Set(value.map(string).filter(Boolean))] : [];

/** Preserves source fields and records uncertainty instead of inventing activity. */
export function transformEducationalSnapshot(payload, { source = 'fixture', now = new Date().toISOString() } = {}) {
  if (!record(payload)) throw new Error('A fonte ETL deve ser um objeto JSON.');
  const generatedAt = iso(now);
  if (!generatedAt) throw new Error('Data de geração ETL inválida.');
  const sourceCollections = record(payload.collections) ? payload.collections : payload;
  const issues = [];
  let excluded = 0;
  let duplicates = 0;
  const issue = (collection, id, reason) => issues.push({ collection, id: id ?? null, reason });
  function collection(key, alias) {
    const value = sourceCollections[key] ?? sourceCollections[alias] ?? [];
    if (!Array.isArray(value)) throw new Error(`A coleção ${key} deve ser uma lista.`);
    return value;
  }
  function normalizeDates(value, collectionName, id) {
    if (Array.isArray(value)) return value.map(entry => normalizeDates(entry, collectionName, id));
    if (!record(value)) return value;
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => {
      if (dateKeys.has(key) && nested !== undefined && nested !== null) {
        const parsed = iso(nested);
        if (!parsed) issue(collectionName, id, `Data inválida: ${key}.`);
        return [key, parsed];
      }
      return [key, normalizeDates(nested, collectionName, id)];
    }));
  }
  function documents(name, entries, normalize) {
    const byId = new Map();
    entries.forEach(raw => {
      const id = record(raw) ? string(raw.id ?? raw.uid) : undefined;
      try {
        if (!record(raw) || !id) throw new Error('Documento sem ID válido.');
        const normalized = normalize(normalizeDates({ ...raw, id }, name, id));
        if (byId.has(id)) {
          duplicates++;
          issue(name, id, 'ID repetido; preservada a revisão mais recente conhecida.');
          const previous = byId.get(id);
          const timestamp = entry => entry.updatedAt ?? entry.atualizadoEm ?? entry.submittedAt ?? entry.dataEnvio ?? entry.createdAt ?? '';
          if (timestamp(previous) > timestamp(normalized)) return;
        }
        byId.set(id, normalized);
      } catch (error) {
        excluded++;
        issue(name, id, error.message);
      }
    });
    return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
  function requireId(raw, keys, label) {
    const id = keys.map(key => string(raw[key])).find(Boolean);
    if (!id) throw new Error(`${label} ausente.`);
    return id;
  }
  const users = documents('users', collection('users'), raw => {
    const role = roles.get(string(raw.role ?? raw.type)?.toLowerCase());
    if (!role) throw new Error('Perfil desconhecido.');
    return { ...raw, name: string(raw.name ?? raw.displayName) ?? '', role };
  });
  const classes = documents('classes', collection('classes'), raw => ({ ...raw, name: string(raw.name ?? raw.title) ?? '', professorId: requireId(raw, ['professorId', 'teacherId'], 'Professor'), studentIds: unique(raw.studentIds ?? raw.students), studentsCount: unique(raw.studentIds ?? raw.students).length }));
  const activities = documents('activities', collection('activities'), raw => ({ ...raw, title: string(raw.title ?? raw.name) ?? '', professorId: requireId(raw, ['professorId', 'teacherId'], 'Professor'), config: record(raw.config) ? raw.config : {}, ...(raw.status === 'draft' || raw.status === 'published' ? {} : { status: 'draft' }) }));
  const activitiesById = new Map(activities.map(activity => [activity.id, activity]));
  const legacySubmissions = activities.flatMap(activity => (Array.isArray(activity.submissions) ? activity.submissions : []).flatMap(raw => record(raw) ? [{
    ...raw,
    id: string(raw.id) ?? `legacy-${createHash('sha256').update(JSON.stringify({ activityId: activity.id, ...raw })).digest('hex').slice(0, 24)}`,
    activityId: activity.id, activityTitle: activity.title, classId: raw.classId ?? activity.classId,
    studentId: raw.studentId ?? raw.userId, submittedAt: raw.submittedAt ?? raw.completedAt ?? raw.updatedAt,
  }] : []));
  const legacyEvents = collection('learningEvents').filter(record).map(raw => ({ ...raw, activityTitle: raw.activityTitle ?? raw.module, submittedAt: raw.submittedAt ?? raw.completedAt }));
  const submissions = documents('submissions', [...legacySubmissions, ...legacyEvents, ...collection('submissions')], raw => {
    const activityId = requireId(raw, ['activityId'], 'Atividade');
    const score = typeof raw.score === 'number' && Number.isFinite(raw.score) ? raw.score : null;
    if (score === null || score < 0 || score > 100) issue('submissions', raw.id, 'Pontuação ausente ou fora de 0 a 100; não entra na média.');
    if (!iso(raw.submittedAt)) issue('submissions', raw.id, 'Data do envio ausente; não foi substituída pela extração.');
    const activity = activitiesById.get(activityId);
    const classId = string(raw.classId) ?? '';
    const status = raw.status === 'started' ? 'pending' : raw.status ?? null;
    if (!['completed', 'pending'].includes(status)) issue('submissions', raw.id, 'Estado de entrega desconhecido; não entra no relatório da turma.');
    if (!classId && !['lab', 'enem'].includes(raw.evidence?.source) && !activity?.classId) issue('submissions', raw.id, 'Sem turma confirmada; registro preservado sem atribuição ao professor.');
    return { ...raw, activityId, studentId: requireId(raw, ['studentId', 'userId'], 'Estudante'), classId, activityTitle: string(raw.activityTitle) ?? activity?.title ?? '', score: score !== null && score >= 0 && score <= 100 ? score : null, status };
  });
  const exams = documents('exams', collection('exams'), raw => ({ ...raw, professorId: requireId(raw, ['professorId', 'teacherId'], 'Professor') }));
  const examAttempts = documents('examAttempts', collection('examAttempts', 'exam_attempts'), raw => ({ ...raw, examId: requireId(raw, ['examId'], 'Prova'), alunoId: requireId(raw, ['alunoId', 'studentId'], 'Estudante'), turmaId: requireId(raw, ['turmaId', 'classId'], 'Turma') }));
  const lessonPlans = documents('lessonPlans', collection('lessonPlans', 'lesson_plans'), raw => ({ ...raw, turmaId: requireId(raw, ['turmaId', 'classId'], 'Turma'), professorId: requireId(raw, ['professorId'], 'Professor') }));
  const systemLogs = documents('systemLogs', collection('systemLogs', 'system_logs').length ? collection('systemLogs', 'system_logs') : collection('logs'), raw => raw);
  const progress = {};
  function addProgress(input, canonical) {
    const entries = Array.isArray(input) ? input.map(entry => [entry?.studentId ?? entry?.userId ?? entry?.id, entry]) : record(input) ? Object.entries(input) : [];
    entries.forEach(([rawId, raw]) => {
      const id = string(rawId);
      if (!id || !record(raw)) { excluded++; issue('progress', id, 'Progresso sem estudante válido.'); return; }
      if (!canonical && progress[id]) return;
      const normalized = normalizeDates(raw, 'progress', id);
      for (const key of ['xp', 'coins', 'level']) {
        if (raw[key] === undefined) continue;
        const value = number(raw[key]);
        if (value === null || value < (key === 'level' ? 1 : 0)) { delete normalized[key]; issue('progress', id, `Valor inválido: ${key}.`); }
        else normalized[key] = value;
      }
      for (const key of ['completedModules', 'purchasedItems', 'enrolledClasses']) if (raw[key] !== undefined) normalized[key] = unique(raw[key]);
      progress[id] = normalized;
    });
  }
  addProgress(sourceCollections.student_progress, false);
  addProgress(sourceCollections.progress, true);
  const classReports = classes.map(classData => buildClassLearningReport({ classData, users, progress, activities, submissions, exams, examAttempts, lessonPlans, source: 'batch', now: generatedAt }));
  const expected = classReports.reduce((sum, report) => sum + report.expectedCompletions, 0);
  const completed = classReports.reduce((sum, report) => sum + report.completedActivitiesCount, 0);
  const scoreCount = classReports.reduce((sum, report) => sum + report.scoredRecordsCount, 0);
  const weightedScore = classReports.reduce((sum, report) => sum + (report.averageScore ?? 0) * report.scoredRecordsCount, 0);
  const weightedAverage = reports => {
    const count = reports.reduce((sum, report) => sum + report.scoredRecordsCount, 0);
    return count ? Math.round(reports.reduce((sum, report) => sum + (report.averageScore ?? 0) * report.scoredRecordsCount, 0) / count * 100) / 100 : null;
  };
  const teacherPerformance = users.filter(user => user.role === 'professor').map(teacher => {
    const teacherClasses = classes.filter(classData => classData.professorId === teacher.id);
    return { teacherId: teacher.id, teacherName: teacher.name, classesCount: teacherClasses.length, studentsCount: new Set(teacherClasses.flatMap(classData => classData.studentIds)).size, activitiesCount: activities.filter(activity => activity.professorId === teacher.id && activity.status === 'published').length, averageScore: weightedAverage(classReports.filter(report => teacherClasses.some(classData => classData.id === report.classId))) };
  });
  const studentPerformance = users.filter(user => user.role === 'estudante').map(student => {
    const reports = classReports.flatMap(report => report.students.filter(entry => entry.studentId === student.id));
    const scores = reports.flatMap(report => report.records.filter(entry => entry.completed && entry.score !== null).map(entry => entry.score));
    return { studentId: student.id, studentName: student.name, averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) / 100 : null, lastActive: reports.map(report => report.lastActive).filter(Boolean).sort().at(-1) ?? null, classesWithEvidence: reports.filter(report => report.records.length > 0).length, progress: progress[student.id] ?? null };
  });
  const learningEvents = submissions.map(submission => ({ ...submission, module: submission.activityTitle, completedAt: submission.submittedAt, timeSpentMinutes: typeof submission.evidence?.activeSeconds === 'number' ? submission.evidence.activeSeconds / 60 : typeof submission.timeSpentMinutes === 'number' && submission.timeSpentMinutes >= 0 ? submission.timeSpentMinutes : null }));
  return { version: 'educational-etl-v2', source, generatedAt, collections: { users, classes, activities, submissions, progress, systemLogs, learningEvents, exams, examAttempts, lessonPlans }, metrics: { summary: { totalStudents: users.filter(user => user.role === 'estudante').length, totalTeachers: teacherPerformance.length, totalAdmins: users.filter(user => user.role === 'admin').length, totalCoordinators: users.filter(user => user.role === 'coordenador').length, totalClasses: classes.length, totalActivities: activities.length, totalPublishedActivities: activities.filter(activity => activity.status === 'published').length, totalCompletedActivities: completed, expectedCompletions: expected, averageScore: scoreCount ? Math.round(weightedScore / scoreCount * 100) / 100 : null, completionRate: expected ? Math.round(completed / expected * 10000) / 100 : null, totalLogs: systemLogs.length }, teacherPerformance, studentPerformance, classReports }, quality: { duplicates, excluded, issues, classes: classReports.map(report => ({ classId: report.classId, ...report.quality })) } };
}
