/**
 * Gradebook & Attendance Repository — Gestão de Boletins, Frequência e Fórum da Turma.
 * Implementa funcionalidades centrais inspiradas no padrão Moodle e Canvas LMS.
 */
import {
  collection, addDoc, query, where, getDocs, doc, getDocFromServer, deleteDoc, onSnapshot, runTransaction, writeBatch
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { sanitizeText } from '../../core/services/securityService';
import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import { examAttemptPercentage, learningTimestamp } from '../services/learningAnalytics';
import type {
  AttendanceRecord,
  ForumTopic,
  ForumReply,
  GradebookWeights,
  StudentGradeReport,
  SubmissionData,
  ExamAttempt,
  ActivityData
} from '../types';

const ATTENDANCE_COLL = 'attendance';
const FORUM_COLL = 'forum_topics';

const LOCAL_ATTENDANCE_KEY = 'edu_local_attendance';
const LOCAL_FORUM_KEY = 'edu_local_forum';

function getLocalAttendance(classId: string): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_ATTENDANCE_KEY}_${classId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAttendance(classId: string, records: AttendanceRecord[]) {
  try {
    localStorage.setItem(`${LOCAL_ATTENDANCE_KEY}_${classId}`, JSON.stringify(records));
  } catch (err) {
    console.error('Erro ao salvar frequência local:', err);
    throw new Error('Não foi possível guardar a chamada neste dispositivo. Tente novamente.');
  }
}

function getLocalForum(classId: string): ForumTopic[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_FORUM_KEY}_${classId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalForum(classId: string, topics: ForumTopic[]) {
  try {
    localStorage.setItem(`${LOCAL_FORUM_KEY}_${classId}`, JSON.stringify(topics));
  } catch (err) {
    console.error('Erro ao salvar fórum local:', err);
    throw new Error('Não foi possível guardar o fórum neste dispositivo. Tente novamente.');
  }
}

// ─── 1. CONTROLE DE FREQUÊNCIA (ATTENDANCE) ─────────────────────────

export const saveAttendanceRecord = async (
  record: Omit<AttendanceRecord, 'id'>
): Promise<AttendanceRecord> => {
  const date = new Date(`${record.data}T00:00:00Z`);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(record.data) && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === record.data;
  if (!record.turmaId || !validDate || (record.aulaNumero !== undefined && (!Number.isInteger(record.aulaNumero) || record.aulaNumero < 1)) || !record.registros.length || new Set(record.registros.map(entry => entry.studentId)).size !== record.registros.length || record.registros.some(entry => !entry.studentId || !['presente', 'falta', 'justificada'].includes(entry.status))) throw new Error('Informe uma data válida e uma situação para cada estudante, sem duplicatas.');
  const id = `attendance-${encodeURIComponent(record.turmaId)}-${record.data}-${record.aulaNumero ?? 1}`;
  const item: AttendanceRecord = { ...sanitizeForFirestore(record), id };
  if (!db) {
    const list = getLocalAttendance(record.turmaId);
    saveLocalAttendance(record.turmaId, [item, ...list.filter(entry => !(entry.data === record.data && (entry.aulaNumero ?? 1) === (record.aulaNumero ?? 1)))]);
    return item;
  }

  const source = doc(db, ATTENDANCE_COLL, id);
  const previous = (await getAttendanceByClass(record.turmaId)).find(entry => entry.id === id);
  const previousStudents = (previous?.registros ?? []).map(entry => entry.studentId);
  const currentStudents = new Set(record.registros.map(entry => entry.studentId));
  const removed = [...new Set(previousStudents)].filter(studentId => !currentStudents.has(studentId));
  if (record.registros.length + removed.length + 1 > 500) throw new Error('Esta chamada excede o limite de publicação. Divida a turma antes de salvar os registros individuais.');
  const batch = writeBatch(db);
  batch.set(source, sanitizeForFirestore(record));
  record.registros.forEach((entry, sourceIndex) => batch.set(doc(db!, COLLECTION_CLASSES, record.turmaId, 'attendance_students', entry.studentId, 'records', id), {
    sourceId: id, sourceIndex, data: record.data, aulaNumero: record.aulaNumero ?? 1, status: entry.status, updatedAt: record.criadoEm,
  }));
  removed.forEach(studentId => batch.delete(doc(db!, COLLECTION_CLASSES, record.turmaId, 'attendance_students', studentId, 'records', id)));
  await batch.commit();
  return item;
};

const COLLECTION_CLASSES = 'classes';

/** Students read their own published frequency, never the class roster. */
export const getStudentAttendanceRecords = async (classId: string, studentId: string): Promise<AttendanceRecord[]> => {
  if (!classId || !studentId) return [];
  if (!db) return getLocalAttendance(classId).flatMap(record => {
    const own = record.registros.find(entry => entry.studentId === studentId);
    return own ? [{ ...record, registros: [own] }] : [];
  });
  const snapshot = await getDocs(collection(db, COLLECTION_CLASSES, classId, 'attendance_students', studentId, 'records'));
  return snapshot.docs.map(entry => {
    const projection = entry.data();
    return { id: projection.sourceId, turmaId: classId, data: projection.data, aulaNumero: projection.aulaNumero, criadoEm: projection.updatedAt, registros: [{ studentId, studentName: '', status: projection.status }] } as AttendanceRecord;
  }).sort((a, b) => b.data.localeCompare(a.data));
};

export const getAttendanceByClass = async (classId: string): Promise<AttendanceRecord[]> => {
  if (!db) {
    return getLocalAttendance(classId);
  }

  try {
    const q = query(collection(db, ATTENDANCE_COLL), where('turmaId', '==', classId));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
    docs.sort((a, b) => b.data.localeCompare(a.data));
    return docs;
  } catch (err) {
    console.error('[gradebookRepository] Erro ao buscar frequências:', err);
    throw err;
  }
};

export const calculateStudentAttendanceRate = (
  studentId: string,
  records: AttendanceRecord[]
): { totalAulas: number; presencas: number; faltas: number; taxaPercentual: number | null; alertaLDB: boolean } => {
  let totalAulas = 0;
  let presencas = 0;
  let faltas = 0;

  const distinctLessons = new Map<string, AttendanceRecord>();
  records.forEach(rec => {
    const key = `${rec.turmaId}:${rec.data}:${rec.aulaNumero ?? 1}`;
    const previous = distinctLessons.get(key);
    if (!previous || Date.parse(rec.criadoEm) > Date.parse(previous.criadoEm)) distinctLessons.set(key, rec);
  });
  distinctLessons.forEach(rec => {
    const reg = rec.registros.find(r => r.studentId === studentId);
    if (reg && ['presente', 'falta', 'justificada'].includes(reg.status)) {
      totalAulas++;
      if (reg.status === 'presente') {
        presencas++;
      } else {
        faltas++;
      }
    }
  });

  const taxaPercentual = totalAulas > 0 ? Math.round((presencas / totalAulas) * 100) : null;
  return {
    totalAulas,
    presencas,
    faltas,
    taxaPercentual,
    alertaLDB: taxaPercentual !== null && taxaPercentual < 75
  };
};

// ─── 2. LIVRO DE NOTAS & BOLETIM PONDERADO (GRADEBOOK) ──────────────

export const DEFAULT_WEIGHTS: GradebookWeights = {
  turmaId: '',
  pesoProvas: 40,
  pesoLabs: 30,
  pesoAtividades: 20,
  pesoParticipacao: 10
};

export function calculateStudentGrade(
  scores: {
    notaProvas: number; // 0 a 10
    notaLabs: number; // 0 a 10
    notaAtividades: number; // 0 a 10
    notaParticipacao: number; // 0 a 10
  },
  weights: GradebookWeights = DEFAULT_WEIGHTS
): { mediaFinal: number; situacao: 'Aprovado' | 'Recuperação' | 'Insuficiente' } {
  const totalWeight = weights.pesoProvas + weights.pesoLabs + weights.pesoAtividades + weights.pesoParticipacao;
  const weightedSum =
    (scores.notaProvas * weights.pesoProvas) +
    (scores.notaLabs * weights.pesoLabs) +
    (scores.notaAtividades * weights.pesoAtividades) +
    (scores.notaParticipacao * weights.pesoParticipacao);

  const mediaFinal = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

  let situacao: 'Aprovado' | 'Recuperação' | 'Insuficiente' = 'Insuficiente';
  if (mediaFinal >= 6.0) situacao = 'Aprovado';
  else if (mediaFinal >= 4.0) situacao = 'Recuperação';

  return { mediaFinal, situacao };
}

// ─── 3. FÓRUM PEDAGÓGICO DA TURMA ───────────────────────────────────

export const saveForumTopic = async (
  topic: Omit<ForumTopic, 'id' | 'respostas' | 'criadoEm'>
): Promise<ForumTopic> => {
  const newTopic: Omit<ForumTopic, 'id'> = {
    ...topic,
    titulo: sanitizeText(topic.titulo),
    conteudo: sanitizeText(topic.conteudo),
    disciplina: topic.disciplina || 'Ciências',
    respostas: [],
    criadoEm: new Date().toISOString()
  };
  if (!newTopic.turmaId || !newTopic.autorId || !newTopic.titulo || !newTopic.conteudo) throw new Error('Selecione uma turma e informe o título e a mensagem.');
  if (newTopic.titulo.length > 300 || newTopic.conteudo.length > 20000) throw new Error('Use até 300 caracteres no título e 20.000 na mensagem do tópico.');
  if (!db) {
    const item: ForumTopic = { ...newTopic, id: 'topic-' + crypto.randomUUID() };
    saveLocalForum(topic.turmaId, [item, ...getLocalForum(topic.turmaId)]);
    return item;
  }
  const reference = await addDoc(collection(db, FORUM_COLL), sanitizeForFirestore(newTopic));
  return { ...newTopic, id: reference.id };
};

export const getForumTopicsByClass = async (classId: string): Promise<ForumTopic[]> => {
  if (!db) return getLocalForum(classId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const snapshot = await getDocs(query(collection(db, FORUM_COLL), where('turmaId', '==', classId)));
  return snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as ForumTopic)).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
};

export const subscribeForumTopicsByClass = (
  classId: string,
  callback: (topics: ForumTopic[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!db) {
    callback(getLocalForum(classId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
    return () => {};
  }
  return onSnapshot(query(collection(db, FORUM_COLL), where('turmaId', '==', classId)), snapshot => {
    callback(snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as ForumTopic)).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
  }, error => {
    console.error('[gradebookRepository] Erro ao acompanhar o fórum:', error);
    onError?.(error);
  });
};

/** Reads and writes the same topic transactionally, keeping concurrent replies. */
async function updateForumReplies(classId: string, topicId: string, mutate: (replies: ForumReply[]) => ForumReply[]): Promise<void> {
  if (!db) {
    const topics = getLocalForum(classId);
    const topic = topics.find(entry => entry.id === topicId);
    if (!topic) throw new Error('O tópico não está mais disponível. Atualize o fórum.');
    topic.respostas = mutate(topic.respostas ?? []);
    saveLocalForum(classId, topics);
    return;
  }
  const database = db;
  const reference = doc(database, FORUM_COLL, topicId);
  for (let retry = 0; retry < 3; retry++) {
    let readReplies: string | undefined;
    try {
      await runTransaction(database, async transaction => {
        const snapshot = await transaction.get(reference);
        if (!snapshot.exists() || snapshot.data().turmaId !== classId) throw new Error('O tópico não está mais disponível nesta turma. Atualize o fórum.');
        readReplies = JSON.stringify(snapshot.data().respostas ?? []);
        transaction.update(reference, { respostas: sanitizeForFirestore(mutate(snapshot.data().respostas ?? [])) });
      });
      return;
    } catch (error) {
      // Append-only rules can reject a stale list before Firestore reports
      // contention. Retry only when a fresh server read proves that it changed.
      if (retry === 2 || readReplies === undefined || (error as { code?: string }).code !== 'permission-denied') throw error;
      const latest = await getDocFromServer(reference).catch(() => null);
      if (!latest?.exists() || latest.data().turmaId !== classId || JSON.stringify(latest.data().respostas ?? []) === readReplies) throw error;
    }
  }
}

export const addForumReply = async (
  classId: string,
  topicId: string,
  reply: Omit<ForumReply, 'id' | 'criadoEm'>
): Promise<ForumReply> => {
  const newReply: ForumReply = {
    ...reply,
    id: 'reply-' + crypto.randomUUID(),
    texto: sanitizeText(reply.texto),
    isMelhorResposta: false,
    moedasGanhas: 0,
    criadoEm: new Date().toISOString()
  };
  if (!newReply.autorId || !newReply.texto) throw new Error('Escreva uma resposta antes de enviar.');
  if (newReply.texto.length > 10000) throw new Error('Use até 10.000 caracteres na resposta.');
  await updateForumReplies(classId, topicId, replies => [...replies, newReply]);
  return newReply;
};

export interface GradebookEvidenceContext {
  attendanceRecords?: AttendanceRecord[];
  activities?: ActivityData[];
  participationScores?: Record<string, number>;
  p1ExamId?: string;
  p2ExamId?: string;
  acceptedRecordIds?: string[];
}

export function calculateSemesterGrade(
  scores: { p1: number | null; p2: number | null; labs: number | null },
  weights: { p1: number; p2: number; labs: number; minPassDireta: number; minExameFinal: number }
): { mediaSemestre: number | null; statusUniv: string; notaExameNecessaria: string } {
  const numbers = [weights.p1, weights.p2, weights.labs];
  const values = [scores.p1, scores.p2, scores.labs];
  const total = numbers.reduce((sum, weight) => sum + weight, 0);
  const complete = total > 0 && numbers.every(weight => Number.isFinite(weight) && weight >= 0) && values.every((value, index) => numbers[index] === 0 || (value !== null && Number.isFinite(value) && value >= 0 && value <= 10)) && Number.isFinite(weights.minPassDireta) && Number.isFinite(weights.minExameFinal) && weights.minExameFinal >= 0 && weights.minPassDireta <= 10 && weights.minPassDireta >= weights.minExameFinal;
  if (!complete) return { mediaSemestre: null, statusUniv: 'Incompleto', notaExameNecessaria: '-' };
  const mediaSemestre = Math.round(numbers.reduce((sum, weight, index) => sum + weight * (values[index] ?? 0), 0) / total * 10) / 10;
  if (mediaSemestre >= weights.minPassDireta) return { mediaSemestre, statusUniv: 'Aprovado no modelo', notaExameNecessaria: '-' };
  if (mediaSemestre >= weights.minExameFinal) return { mediaSemestre, statusUniv: 'Exame final no modelo', notaExameNecessaria: String(Math.max(0, Math.round((10 - mediaSemestre) * 10) / 10)) };
  return { mediaSemestre, statusUniv: 'Abaixo da média', notaExameNecessaria: '-' };
}

/** Latest assessed attempt per item; absence never becomes zero or approval. */
export function calculateClassGradebook(
  students: { id: string; name: string }[],
  turmaId: string,
  submissions: SubmissionData[] = [],
  examAttempts: ExamAttempt[] = [],
  weights: GradebookWeights = DEFAULT_WEIGHTS,
  context: GradebookEvidenceContext = {}
): StudentGradeReport[] {
  const activities = new Map((context.activities ?? []).map(activity => [activity.id, activity]));
  const categoryWeights = [weights.pesoProvas, weights.pesoLabs, weights.pesoAtividades, weights.pesoParticipacao];
  const validWeights = categoryWeights.every(weight => Number.isFinite(weight) && weight >= 0) && categoryWeights.some(weight => weight > 0);
  const totalWeight = categoryWeights.reduce((sum, weight) => sum + weight, 0);
  const isPercentage = (score: unknown): score is number => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
  const validDate = (date: string) => learningTimestamp(date) !== null;
  function latest<T extends { id?: string }>(items: T[], getId: (item: T) => string, getDate: (item: T) => string): T[] {
    const records = new Map<string, T>();
    items.forEach(item => {
      const previous = records.get(getId(item));
      if (!previous || Date.parse(getDate(item)) > Date.parse(getDate(previous)) || (Date.parse(getDate(item)) === Date.parse(getDate(previous)) && (item.id || '').localeCompare(previous.id || '') > 0)) records.set(getId(item), item);
    });
    return [...records.values()];
  }
  const averageGrade = (scores: number[]) => scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) / 10 : null;
  return students.map(s => {
    const studentSubmissions = latest(submissions.filter(submission => submission.classId === turmaId && submission.studentId === s.id && submission.status === 'completed' && validDate(submission.submittedAt) && submission.evidence?.stage !== 'exploration' && submission.evidence?.stage !== 'response' && submission.evidence?.source !== 'enem' && (!context.acceptedRecordIds || (submission.id && context.acceptedRecordIds.includes(submission.id))) && (!context.activities || submission.evidence?.source === 'lab' || activities.get(submission.activityId)?.status === 'published')), submission => `${submission.evidence?.source || 'activity'}:${submission.evidence?.lessonPlanId || submission.activityId}`, submission => submission.submittedAt);
    const isLab = (submission: SubmissionData) => submission.evidence?.source === 'lab' || /^simulation_|^lab$/.test(activities.get(submission.activityId)?.type ?? '');
    const attempts = latest(examAttempts.filter(attempt => attempt.turmaId === turmaId && attempt.alunoId === s.id && validDate(attempt.dataEnvio) && (!context.acceptedRecordIds || (attempt.id && context.acceptedRecordIds.includes(attempt.id))) && Number.isFinite(attempt.pontuacaoMaxima) && attempt.pontuacaoMaxima > 0 && Number.isFinite(attempt.pontuacaoObtida) && attempt.pontuacaoObtida >= 0 && attempt.pontuacaoObtida <= attempt.pontuacaoMaxima), attempt => attempt.examId, attempt => attempt.dataEnvio);
    const examPercent = (attempt: ExamAttempt) => examAttemptPercentage(attempt)!;
    const participation = context.participationScores?.[s.id];
    const scores = {
      notaProvas: averageGrade(attempts.map(examPercent)),
      notaLabs: averageGrade(studentSubmissions.filter(submission => isLab(submission) && isPercentage(submission.score)).map(submission => submission.score)),
      notaAtividades: averageGrade(studentSubmissions.filter(submission => !isLab(submission) && isPercentage(submission.score)).map(submission => submission.score)),
      notaParticipacao: typeof participation === 'number' && Number.isFinite(participation) && participation >= 0 && participation <= 10 ? participation : null
    };
    const categories = ['Provas', 'Laboratórios', 'Atividades', 'Participação'];
    const values = [scores.notaProvas, scores.notaLabs, scores.notaAtividades, scores.notaParticipacao];
    const missingCategories = validWeights ? categories.filter((_, index) => categoryWeights[index] > 0 && values[index] === null) : ['Pesos inválidos'];
    const coveragePercent = validWeights ? Math.round(categoryWeights.reduce((sum, weight, index) => sum + (values[index] === null ? 0 : weight), 0) / totalWeight * 100) : 0;
    const available = values.some((value, index) => value !== null && categoryWeights[index] > 0);
    const result = missingCategories.length ? { mediaFinal: null, situacao: available ? 'Incompleto' as const : 'Sem dados' as const } : calculateStudentGrade({ notaProvas: scores.notaProvas ?? 0, notaLabs: scores.notaLabs ?? 0, notaAtividades: scores.notaAtividades ?? 0, notaParticipacao: scores.notaParticipacao ?? 0 }, weights);
    const attendance = calculateStudentAttendanceRate(s.id, (context.attendanceRecords ?? []).filter(record => record.turmaId === turmaId));
    const examGrade = (examId?: string) => {
      const attempt = attempts.find(entry => entry.examId === examId);
      return attempt ? Math.round(examPercent(attempt)) / 10 : null;
    };
    return {
      studentId: s.id,
      studentName: s.name,
      ...scores,
      ...result,
      frequenciaPercentual: attendance.taxaPercentual,
      alertaFrequencia: attendance.alertaLDB,
      missingCategories,
      coveragePercent,
      notaP1: examGrade(context.p1ExamId),
      notaP2: examGrade(context.p2ExamId)
    };
  });
}

/**
 * Marca ou desmarca uma resposta como Melhor Resposta (destaque oficial).
 */
/** Highlights one response without promising a reward that is not credited. */
export const markForumBestReply = async (
  classId: string,
  topicId: string,
  replyId: string,
  isBest: boolean
): Promise<void> => {
  await updateForumReplies(classId, topicId, replies => {
    if (!replies.some(reply => reply.id === replyId)) throw new Error('A resposta não está mais disponível. Atualize o fórum.');
    return replies.map(reply => ({
      ...reply,
      isMelhorResposta: reply.id === replyId ? isBest : (isBest ? false : !!reply.isMelhorResposta),
      moedasGanhas: 0
    }));
  });
};

export const deleteForumTopic = async (classId: string, topicId: string): Promise<void> => {
  if (!db) {
    saveLocalForum(classId, getLocalForum(classId).filter(topic => topic.id !== topicId));
    return;
  }
  await deleteDoc(doc(db, FORUM_COLL, topicId));
};

export const deleteForumReply = async (classId: string, topicId: string, replyId: string): Promise<void> => {
  await updateForumReplies(classId, topicId, replies => replies.filter(reply => reply.id !== replyId));
};
