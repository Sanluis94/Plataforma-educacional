/**
 * Exam Repository — Gerenciamento e persistência de Provas e Avaliações Formais.
 * Inspirado na arquitetura do Edu-Interact-v2 (Questionários, Questões, Aplicações e Tentativas).
 */
import {
  collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { ExamData, ExamAttempt } from '../types';

import { sanitizeForFirestore } from '../../core/services/firestoreUtils';

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
  }
}

/**
 * Cria ou publica uma nova prova.
 */
export const saveExam = async (exam: Omit<ExamData, 'id'>): Promise<ExamData> => {
  const sanitized = sanitizeForFirestore(exam);

  // Sempre sincroniza com cache local como garantia de consistência
  const exams = getLocalExams();

  if (!db) {
    const newExam: ExamData = { id: `exam_${Date.now()}`, ...sanitized } as ExamData;
    exams.unshift(newExam);
    saveLocalExams(exams);
    return newExam;
  }

  try {
    const docRef = await addDoc(collection(db, EXAMS_COLLECTION), sanitized);
    const savedExam: ExamData = { id: docRef.id, ...sanitized } as ExamData;
    exams.unshift(savedExam);
    saveLocalExams(exams);
    return savedExam;
  } catch (err) {
    console.warn('[examRepository] Falha ao salvar no Firestore, utilizando persistência local resiliente:', err);
    const fallbackExam: ExamData = { id: `exam_${Date.now()}`, ...sanitized } as ExamData;
    exams.unshift(fallbackExam);
    saveLocalExams(exams);
    return fallbackExam;
  }
};

/**
 * Atualiza dados de uma prova existente.
 */
export const updateExam = async (id: string, updates: Partial<ExamData>): Promise<void> => {
  if (!db) {
    const exams = getLocalExams();
    const idx = exams.findIndex(e => e.id === id);
    if (idx !== -1) {
      exams[idx] = { ...exams[idx], ...updates, atualizadoEm: new Date().toISOString() };
      saveLocalExams(exams);
    }
    return;
  }

  const docRef = doc(db, EXAMS_COLLECTION, id);
  await updateDoc(docRef, { ...updates, atualizadoEm: new Date().toISOString() });
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
  const localList = getLocalExams().filter(e => e.professorId === professorId || e.professorId === 'prof_current');
  if (!db) {
    return localList;
  }

  try {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('professorId', '==', professorId)
    );
    const snap = await getDocs(q);
    const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamData));
    const map = new Map<string, ExamData>();
    for (const e of localList) if (e.id) map.set(e.id, e);
    for (const e of remoteList) if (e.id) map.set(e.id, e);

    const combined = Array.from(map.values());
    combined.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    return combined;
  } catch (err) {
    console.error('[examRepository] Erro ao buscar provas do professor:', err);
    return localList;
  }
};

/**
 * Busca todas as provas abertas atribuídas a uma turma específica.
 */
export const getExamsByClass = async (classId: string): Promise<ExamData[]> => {
  const localList = getLocalExams().filter(e => (e.turmaId === classId || e.turmaId === 'turma_geral' || !e.turmaId) && e.status === 'Aberta');
  if (!db) {
    return localList;
  }

  try {
    const q = query(
      collection(db, EXAMS_COLLECTION),
      where('turmaId', '==', classId),
      where('status', '==', 'Aberta')
    );
    const snap = await getDocs(q);
    const remoteList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamData));
    const map = new Map<string, ExamData>();
    for (const e of localList) if (e.id) map.set(e.id, e);
    for (const e of remoteList) if (e.id) map.set(e.id, e);

    const combined = Array.from(map.values());
    combined.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    return combined;
  } catch (err) {
    console.error('[examRepository] Erro ao buscar provas da turma:', err);
    return localList;
  }
};


/**
 * Escuta provas de uma turma em tempo real.
 */
export const subscribeExamsByClass = (
  classId: string,
  callback: (exams: ExamData[]) => void
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
  });
};

/**
 * Salva tentativa / resolução de prova de um aluno com correção automática.
 */
export const saveExamAttempt = async (attempt: Omit<ExamAttempt, 'id'>): Promise<ExamAttempt> => {
  if (!db) {
    const attempts = getLocalAttempts();
    const newAttempt: ExamAttempt = { id: `attempt_${Date.now()}`, ...attempt };
    attempts.unshift(newAttempt);
    saveLocalAttempts(attempts);
    return newAttempt;
  }

  const docRef = await addDoc(collection(db, ATTEMPTS_COLLECTION), attempt);
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
    return getLocalAttempts().filter(a => a.turmaId === classId);
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
    return getLocalAttempts().filter(a => a.alunoId === studentId);
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
