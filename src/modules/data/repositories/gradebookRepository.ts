/**
 * Gradebook & Attendance Repository — Gestão de Boletins, Frequência e Fórum da Turma.
 * Implementa funcionalidades centrais inspiradas no padrão Moodle e Canvas LMS.
 */
import {
  collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { sanitizeText } from '../../core/services/securityService';
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
  }
}

// ─── 1. CONTROLE DE FREQUÊNCIA (ATTENDANCE) ─────────────────────────

export const saveAttendanceRecord = async (
  record: Omit<AttendanceRecord, 'id'>
): Promise<AttendanceRecord> => {
  if (!db) {
    const list = getLocalAttendance(record.turmaId);
    const item: AttendanceRecord = { id: `att_${Date.now()}`, ...record };
    list.unshift(item);
    saveLocalAttendance(record.turmaId, list);
    return item;
  }

  const docRef = await addDoc(collection(db, ATTENDANCE_COLL), record);
  return { id: docRef.id, ...record };
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
    return getLocalAttendance(classId);
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
    const key = `${rec.turmaId}:${rec.data}:${rec.aulaNumero ?? ''}`;
    const previous = distinctLessons.get(key);
    if (!previous || Date.parse(rec.criadoEm) > Date.parse(previous.criadoEm)) distinctLessons.set(key, rec);
  });
  distinctLessons.forEach(rec => {
    const reg = rec.registros.find(r => r.studentId === studentId);
    if (reg && ['presente', 'falta', 'justificada'].includes(reg.status)) {
      totalAulas++;
      if (reg.status === 'presente' || reg.status === 'justificada') {
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

  // Garante sincronização no cache local
  const localList = getLocalForum(topic.turmaId);

  if (!db) {
    const item: ForumTopic = { id: `top_${Date.now()}`, ...newTopic };
    localList.unshift(item);
    saveLocalForum(topic.turmaId, localList);
    return item;
  }

  try {
    const docRef = await addDoc(collection(db, FORUM_COLL), newTopic);
    const item: ForumTopic = { id: docRef.id, ...newTopic };
    // Mantém cópia atualizada no storage local
    localList.unshift(item);
    saveLocalForum(topic.turmaId, localList);
    return item;
  } catch (err) {
    console.warn('[gradebookRepository] Falha ao salvar tópico no Firestore, usando fallback local:', err);
    const item: ForumTopic = { id: `top_${Date.now()}`, ...newTopic };
    localList.unshift(item);
    saveLocalForum(topic.turmaId, localList);
    return item;
  }
};

export const getForumTopicsByClass = async (classId: string): Promise<ForumTopic[]> => {
  if (!db) {
    return getLocalForum(classId);
  }

  try {
    const q = query(collection(db, FORUM_COLL), where('turmaId', '==', classId));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumTopic));
    list.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    if (list.length > 0) {
      saveLocalForum(classId, list);
    }
    return list.length > 0 ? list : getLocalForum(classId);
  } catch (err) {
    console.error('[gradebookRepository] Erro ao buscar tópicos do fórum:', err);
    return getLocalForum(classId);
  }
};

export const subscribeForumTopicsByClass = (
  classId: string,
  callback: (topics: ForumTopic[]) => void
): (() => void) => {
  if (!db) {
    callback(getLocalForum(classId));
    return () => {};
  }

  const q = query(collection(db, FORUM_COLL), where('turmaId', '==', classId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumTopic));
    list.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    if (list.length > 0) {
      saveLocalForum(classId, list);
      callback(list);
    } else {
      const localList = getLocalForum(classId);
      callback(localList);
    }
  }, (err) => {
    console.warn('[gradebookRepository] Listener do fórum usando cache local:', err);
    callback(getLocalForum(classId));
  });
};

/**
 * Adiciona uma resposta a um tópico do fórum.
 * Salva com persistência resiliente tanto no Firestore quanto no cache local.
 */
export const addForumReply = async (
  classId: string,
  topicId: string,
  reply: Omit<ForumReply, 'id' | 'criadoEm'>
): Promise<ForumReply> => {
  const newReply: ForumReply = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...reply,
    texto: sanitizeText(reply.texto),
    criadoEm: new Date().toISOString()
  };

  // 1. Persistência imediata no cache local (garante sincronização síncrona/offline)
  const localTopics = getLocalForum(classId);
  const localTopic = localTopics.find(t => t.id === topicId);
  if (localTopic) {
    if (!localTopic.respostas) localTopic.respostas = [];
    localTopic.respostas.push(newReply);
    saveLocalForum(classId, localTopics);
  }

  if (!db) {
    return newReply;
  }

  // 2. Persistência no Firestore
  try {
    const topicRef = doc(db, FORUM_COLL, topicId);
    const docSnap = await getDoc(topicRef);

    if (docSnap.exists()) {
      const current = docSnap.data() as ForumTopic;
      const currentReplies = current.respostas || [];
      await updateDoc(topicRef, {
        respostas: [...currentReplies, newReply]
      });
    } else {
      // Se não encontrou pelo docId direto, busca por fallback na turma
      const q = query(collection(db, FORUM_COLL), where('turmaId', '==', classId));
      const allSnap = await getDocs(q);
      const matched = allSnap.docs.find(d => d.id === topicId);
      if (matched) {
        const current = matched.data() as ForumTopic;
        const currentReplies = current.respostas || [];
        await updateDoc(doc(db, FORUM_COLL, matched.id), {
          respostas: [...currentReplies, newReply]
        });
      }
    }
  } catch (err) {
    console.warn('[gradebookRepository] Falha ao persistir resposta no Firestore, mantido no cache local:', err);
  }

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
export const markForumBestReply = async (
  classId: string,
  topicId: string,
  replyId: string,
  isBest: boolean
): Promise<void> => {
  // 1. Atualiza no cache local
  const localTopics = getLocalForum(classId);
  const localTopic = localTopics.find(t => t.id === topicId);
  if (localTopic && localTopic.respostas) {
    localTopic.respostas.forEach(r => {
      if (r.id === replyId) {
        r.isMelhorResposta = isBest;
        r.moedasGanhas = isBest ? 20 : 0;
      } else if (isBest) {
        r.isMelhorResposta = false;
      }
    });
    saveLocalForum(classId, localTopics);
  }

  if (!db) return;

  // 2. Atualiza no Firestore
  try {
    const topicRef = doc(db, FORUM_COLL, topicId);
    const docSnap = await getDoc(topicRef);
    if (docSnap.exists()) {
      const current = docSnap.data() as ForumTopic;
      const updated = (current.respostas || []).map(r => ({
        ...r,
        isMelhorResposta: r.id === replyId ? isBest : (isBest ? false : r.isMelhorResposta),
        moedasGanhas: r.id === replyId && isBest ? 20 : (r.id === replyId ? 0 : r.moedasGanhas)
      }));
      await updateDoc(topicRef, { respostas: updated });
    }
  } catch (err) {
    console.warn('[gradebookRepository] Falha ao atualizar melhor resposta no Firestore:', err);
  }
};

/**
 * Remove um tópico do fórum (moderação do professor).
 */
export const deleteForumTopic = async (classId: string, topicId: string): Promise<void> => {
  const localTopics = getLocalForum(classId).filter(t => t.id !== topicId);
  saveLocalForum(classId, localTopics);

  if (!db) return;

  try {
    await deleteDoc(doc(db, FORUM_COLL, topicId));
  } catch (err) {
    console.warn('[gradebookRepository] Falha ao remover tópico do Firestore:', err);
  }
};

/**
 * Remove uma resposta de um tópico do fórum (moderação do professor).
 */
export const deleteForumReply = async (classId: string, topicId: string, replyId: string): Promise<void> => {
  const localTopics = getLocalForum(classId);
  const localTopic = localTopics.find(t => t.id === topicId);
  if (localTopic && localTopic.respostas) {
    localTopic.respostas = localTopic.respostas.filter(r => r.id !== replyId);
    saveLocalForum(classId, localTopics);
  }

  if (!db) return;

  try {
    const topicRef = doc(db, FORUM_COLL, topicId);
    const docSnap = await getDoc(topicRef);
    if (docSnap.exists()) {
      const current = docSnap.data() as ForumTopic;
      const updated = (current.respostas || []).filter(r => r.id !== replyId);
      await updateDoc(topicRef, { respostas: updated });
    }
  } catch (err) {
    console.warn('[gradebookRepository] Falha ao deletar resposta no Firestore:', err);
  }
};
