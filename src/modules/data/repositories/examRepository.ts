/**
 * Exam Repository — Gerenciamento e persistência de Provas e Avaliações Formais.
 * Inspirado na arquitetura do Edu-Interact-v2 (Questionários, Questões, Aplicações e Tentativas).
 */
import {
  collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot, setDoc, getDoc
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import {examDeadlineAt} from '../services/examTiming';
import type { ExamData, ExamAttempt } from '../types';

import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import { learningDocumentId } from '../services/learningCapture';

const EXAMS_COLLECTION = 'exams';
const ATTEMPTS_COLLECTION = 'exam_attempts';

const LOCAL_EXAMS_KEY = 'edu_local_exams';
const LOCAL_ATTEMPTS_KEY = 'edu_local_exam_attempts';

function getLocalExams(): ExamData[] {
  try {
    const raw = localStorage.getItem(LOCAL_EXAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalExams(exams: ExamData[]) {
  try {
    localStorage.setItem(LOCAL_EXAMS_KEY, JSON.stringify(exams));
  } catch (err) {
    console.error('Erro ao salvar exames locais:', err);
    throw new Error('Não foi possível guardar a prova neste dispositivo. Tente novamente.');
  }
}

function getLocalAttempts(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAttempts(attempts: ExamAttempt[]) {
  try {
    localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (err) {
    console.error('Erro ao salvar tentativas locais:', err);
    throw new Error('Não foi possível guardar a prova neste dispositivo. Tente novamente antes de sair.');
  }
}

/**
 * Cria ou publica uma nova prova.
 */
export const saveExam = async (exam: Omit<ExamData, 'id'>): Promise<ExamData> => {
  const deadline=examDeadlineAt(exam);
  if(exam.dataLimite&&deadline===null)throw new Error('Informe uma data limite válida.');
  const sanitized = sanitizeForFirestore({...exam,...(deadline===null?{}:{dataLimite:new Date(deadline).toISOString(),deadlineAtMillis:deadline})});

  if (!db) {
    const exams = getLocalExams();
    const newExam: ExamData = { ...sanitized, id: `exam_${crypto.randomUUID()}` } as ExamData;
    exams.unshift(newExam);
    saveLocalExams(exams);
    return newExam;
  }

  if (!exam.turmaId) throw new Error('Selecione a turma antes de salvar a prova.');
  const docRef = await addDoc(collection(db, EXAMS_COLLECTION), sanitized);
  return { ...sanitized, id: docRef.id } as ExamData;
};

/**
 * Atualiza dados de uma prova existente.
 */
export const updateExam = async (id: string, updates: Partial<ExamData>): Promise<void> => {
  if(Object.hasOwn(updates,'dataLimite')){const deadline=examDeadlineAt(updates);if(updates.dataLimite&&deadline===null)throw new Error('Informe uma data limite válida.');updates={...updates,dataLimite:deadline===null?'':new Date(deadline).toISOString(),deadlineAtMillis:deadline};}
  if (!db) {
    const exams = getLocalExams();
    const idx = exams.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('A prova não está mais disponível. Atualize a lista.');
    exams[idx] = { ...exams[idx], ...sanitizeForFirestore(updates), id, atualizadoEm: new Date().toISOString() };
    saveLocalExams(exams);
    return;
  }

  const docRef = doc(db, EXAMS_COLLECTION, id);
  const data = { ...updates, atualizadoEm: new Date().toISOString() };
  delete data.id;
  await updateDoc(docRef, sanitizeForFirestore(data));
};

/**
 * Deleta uma prova pelo ID.
 */
export const deleteExam = async (id: string): Promise<void> => {
  if (!db) {
    const exams = getLocalExams().filter(e => e.id !== id);
    saveLocalExams(exams);
    return;
  }

  const docRef = doc(db, EXAMS_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Busca todas as provas criadas por um professor.
 */
export const getExamsByProfessor = async (professorId: string): Promise<ExamData[]> => {
  if (!db) {
    return getLocalExams().filter(e => e.professorId === professorId).sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
  }

  try {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('professorId', '==', professorId)
    );
    const snap = await getDocs(q);
    const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamData));
    return remoteList.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
  } catch (err) {
    console.error('[examRepository] Erro ao buscar provas do professor:', err);
    throw err;
  }
};

/**
 * Busca todas as provas abertas atribuídas a uma turma específica.
 */
export const getExamsByClass = async (classId: string): Promise<ExamData[]> => {
  if (!db) {
    return getLocalExams().filter(e => e.turmaId === classId && e.status === 'Aberta').sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
  }

  try {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('turmaId', '==', classId),
      where('status', '==', 'Aberta')
    );
    const snap = await getDocs(q);
    const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamData));
    return remoteList.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
  } catch (err) {
    console.error('[examRepository] Erro ao buscar provas da turma:', err);
    throw err;
  }
};


/**
 * Escuta provas de uma turma em tempo real.
 */
export const subscribeExamsByClass = (
  classId: string,
  callback: (exams: ExamData[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!db) {
    callback(getLocalExams().filter(e => e.turmaId === classId && e.status === 'Aberta'));
    return () => {};
  }

  const q = query(
    collection(db, EXAMS_COLLECTION),
    where('turmaId', '==', classId),
    where('status', '==', 'Aberta')
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ExamData));
    data.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    callback(data);
  }, (error) => {
    console.error('[examRepository] Erro no listener de provas:', error);
    onError?.(error);
  });
};

/**
 * Salva tentativa / resolução de prova de um aluno com correção automática.
 */
export const saveExamAttempt = async (attempt: Omit<ExamAttempt, 'id'>): Promise<ExamAttempt> => {
  if (!attempt.alunoId || !attempt.examId || !Number.isFinite(attempt.porcentagemAproveitamento) || attempt.porcentagemAproveitamento < 0 || attempt.porcentagemAproveitamento > 100) throw new Error('Tentativa de prova inválida.');
  const stableId = attempt.evidence?.sessionId ? learningDocumentId(attempt.alunoId, attempt.evidence.sessionId, `exam-${attempt.turmaId}`) : undefined;
  const sameAttempt = (previous: Omit<ExamAttempt, 'id'>) => previous.alunoId === attempt.alunoId && previous.examId === attempt.examId && previous.turmaId === attempt.turmaId && previous.evidence?.sessionId === attempt.evidence?.sessionId && previous.pontuacaoObtida === attempt.pontuacaoObtida && previous.pontuacaoMaxima === attempt.pontuacaoMaxima && JSON.stringify(previous.respostas) === JSON.stringify(attempt.respostas);
  if (!db) {
    const attempts = getLocalAttempts();
    const existing = stableId && attempts.find(entry => entry.id === stableId);
    if (existing) {
      if (!sameAttempt(existing)) throw new Error('Esta tentativa já foi enviada com outras respostas. Abra uma nova tentativa para refazer a prova.');
      return existing;
    }
    const newAttempt: ExamAttempt = { ...attempt, id: stableId ?? `attempt_${crypto.randomUUID()}` };
    attempts.unshift(newAttempt);
    saveLocalAttempts(attempts);
    return newAttempt;
  }

  if (stableId) {
    const reference = doc(db, ATTEMPTS_COLLECTION, stableId);
    try { await setDoc(reference, sanitizeForFirestore(attempt)); }
    catch (error) {
      const existing = await getDoc(reference).catch(() => null);
      const data = existing?.exists() ? existing.data() as Omit<ExamAttempt, 'id'> : null;
      if (data && sameAttempt(data)) return { ...data, id: stableId };
      throw error;
    }
    return { ...attempt, id: stableId };
  }
  const docRef = await addDoc(collection(db, ATTEMPTS_COLLECTION), sanitizeForFirestore(attempt));
  return { id: docRef.id, ...attempt };
};

/**
 * Busca todas as tentativas de provas realizadas pelos alunos de uma turma.
 */
export const getExamAttemptsByClass = async (classId: string): Promise<ExamAttempt[]> => {
  if (!db) {
    return getLocalAttempts().filter(a => a.turmaId === classId);
  }

  try {
    const q = query(
      collection(db, ATTEMPTS_COLLECTION),
      where('turmaId', '==', classId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamAttempt));
  } catch (err) {
    console.error('[examRepository] Erro ao buscar tentativas da turma:', err);
    throw err;
  }
};

/**
 * Busca tentativas de um aluno específico.
 */
export const getExamAttemptsByStudent = async (studentId: string): Promise<ExamAttempt[]> => {
  if (!db) {
    return getLocalAttempts().filter(a => a.alunoId === studentId);
  }

  try {
    const q = query(
      collection(db, ATTEMPTS_COLLECTION),
      where('alunoId', '==', studentId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamAttempt));
  } catch (err) {
    console.error('[examRepository] Erro ao buscar tentativas do aluno:', err);
    throw err;
  }
};

/**
 * Calcula analytics detalhado de acerto por questão (Padrão Edu-Interact-v2).
 */
export interface ExamQuestionAnalytics {
  questaoIndex: number;
  enunciado: string;
  tema: string;
  totalRespostas: number;
  totalAcertos: number;
  taxaAcertoPercentual: number;
  alertaPedagogico: boolean;
}

export interface ExamReportSummary {
  totalTentativas: number;
  mediaTurmaPercentual: number;
  distribuicao: {
    excelente: number;
    bom: number;
    regular: number;
    insuficiente: number;
  };
  analiseQuestoes: ExamQuestionAnalytics[];
}

export function calculateExamQuestionAnalytics(
  exam: ExamData,
  attempts: ExamAttempt[]
): ExamReportSummary {
  const totalTentativas = attempts.length;
  if (totalTentativas === 0) {
    return {
      totalTentativas: 0,
      mediaTurmaPercentual: 0,
      distribuicao: { excelente: 0, bom: 0, regular: 0, insuficiente: 0 },
      analiseQuestoes: exam.questoes.map((q, i) => ({
        questaoIndex: i,
        enunciado: q.enunciado,
        tema: q.tema,
        totalRespostas: 0,
        totalAcertos: 0,
        taxaAcertoPercentual: 0,
        alertaPedagogico: false,
      })),
    };
  }

  const mediaTurmaPercentual = Math.round(
    attempts.reduce((sum, a) => sum + a.porcentagemAproveitamento, 0) / totalTentativas
  );

  const distribuicao = {
    excelente: attempts.filter(a => a.classificacao === 'Excelente').length,
    bom: attempts.filter(a => a.classificacao === 'Bom').length,
    regular: attempts.filter(a => a.classificacao === 'Regular').length,
    insuficiente: attempts.filter(a => a.classificacao === 'Insuficiente').length,
  };

  const analiseQuestoes: ExamQuestionAnalytics[] = exam.questoes.map((q, qIndex) => {
    let acertos = 0;
    attempts.forEach(att => {
      const resp = att.respostas.find(r => r.questaoIndex === qIndex);
      if (resp && resp.acertou) acertos++;
    });
    const taxaAcerto = Math.round((acertos / totalTentativas) * 100);
    return {
      questaoIndex: qIndex,
      enunciado: q.enunciado,
      tema: q.tema,
      totalRespostas: totalTentativas,
      totalAcertos: acertos,
      taxaAcertoPercentual: taxaAcerto,
      alertaPedagogico: taxaAcerto < 50, // Flag pedagógica de intervenção
    };
  });

  return {
    totalTentativas,
    mediaTurmaPercentual,
    distribuicao,
    analiseQuestoes,
  };
}
