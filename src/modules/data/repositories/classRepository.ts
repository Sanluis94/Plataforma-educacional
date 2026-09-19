/**
 * Class Repository — Persistência de turmas no Firestore.
 * Gerencia CRUD de turmas do professor e matrícula de alunos.
 */
import {
  collection, addDoc, query, where, getDocs, onSnapshot,
  doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { 
  getLocalEtlClassesByProfessor, 
  getLocalStudentClasses, 
  saveLocalClass, 
  enrollLocalStudent, 
  unenrollLocalStudent,
  getLocalComplementaryMaterials,
  saveLocalComplementaryMaterial,
  getLocalStudentMessages,
  saveLocalStudentMessage,
  replyLocalStudentMessage
} from '../services/localEtlClient';
import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import type { ClassData } from '../types';

// Manter a interface Turma para compatibilidade com o front-end existente
export interface Turma {
  id: string;
  name: string;
  studentsCount: number;
  professorName?: string;
  code?: string;
  createdAt?: string;
}

const COLLECTION = 'classes';

/** Alfabeto seguro para códigos de turma: sem ambiguidade visual (sem 0/O, 1/I) */
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Gera um código de 6 dígitos alfanuméricos legíveis para a turma.
 */
export const generateShortClassCode = (): string => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_ALPHABET.length);
    code += CODE_ALPHABET[randomIndex];
  }
  return code;
};

/**
 * Busca turmas de um professor específico.
 */
export const getProfessorClasses = async (professorId?: string): Promise<Turma[]> => {
  if (!db || !professorId) {
    console.warn('[ClassRepository] Firestore não inicializado ou sem professorId.');
    return getLocalEtlClassesByProfessor(professorId);
  }

  try {
    const q = query(
      collection(db, COLLECTION),
      where('professorId', '==', professorId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        studentsCount: data.studentsCount || 0,
        code: data.code || docSnap.id.slice(0, 6).toUpperCase(),
        createdAt: data.createdAt || '',
      };
    });
    
    // Sort locally to avoid Firestore missing index issues
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar turmas:', error);
    return getLocalEtlClassesByProfessor(professorId);
  }
};

/**
 * Busca turmas nas quais um estudante está matriculado.
 */
export const getStudentClasses = async (studentId: string): Promise<Turma[]> => {
  if (!db || !studentId) {
    return getLocalStudentClasses(studentId);
  }

  try {
    const q = query(
      collection(db, COLLECTION),
      where('studentIds', 'array-contains', studentId)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        studentsCount: data.studentsCount || 0,
        professorName: data.professorName || 'Professor',
        code: data.code || docSnap.id.slice(0, 6).toUpperCase(),
        createdAt: data.createdAt || '',
      };
    });
    
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar turmas do estudante:', error);
    return [];
  }
};

/**
 * Cria uma nova turma no Firestore gerando um código amigável de 6 dígitos.
 */
export const saveClass = async (
  name: string,
  professorId?: string,
  professorName?: string
): Promise<Turma> => {
  const shortCode = generateShortClassCode();

  if (!db || !professorId) {
    console.warn('[ClassRepository] Firestore não inicializado. Turma salva localmente no LocalStorage.');
    const newClass = await saveLocalClass(name, professorId, professorName, shortCode);
    return { id: newClass.id!, name: newClass.name, studentsCount: 0, code: newClass.code || shortCode };
  }

  const classData: Omit<ClassData, 'id'> = {
    name,
    code: shortCode,
    professorId,
    professorName: professorName || 'Professor',
    studentsCount: 0,
    studentIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, COLLECTION), classData);
  return { id: docRef.id, name, studentsCount: 0, code: shortCode };
};

/**
 * Remove uma turma do Firestore.
 */
export const deleteClass = async (classId: string): Promise<void> => {
  if (!db) return;
  await deleteDoc(doc(db, COLLECTION, classId));
};

/**
 * Matricula um estudante em uma turma.
 * Suporta busca retrocompatível tanto pelo código de 6 dígitos quanto pelo id do Firestore.
 */
export const enrollStudent = async (classCodeOrId: string, studentId: string): Promise<void> => {
  const normalized = classCodeOrId.trim().toUpperCase();

  if (!db) {
    await enrollLocalStudent(normalized, studentId);
    return;
  }

  let targetDocRef = null;
  let currentStudentIds: string[] = [];

  // 1. Tenta buscar pelo campo 'code' (código de 6 dígitos amigável)
  try {
    const codeQuery = query(
      collection(db, COLLECTION),
      where('code', '==', normalized)
    );
    const codeSnap = await getDocs(codeQuery);

    if (!codeSnap.empty) {
      const foundDoc = codeSnap.docs[0];
      targetDocRef = doc(db, COLLECTION, foundDoc.id);
      currentStudentIds = foundDoc.data().studentIds || [];
    }
  } catch (err) {
    console.warn('[ClassRepository] Falha ao consultar código de turma, tentando por ID:', err);
  }

  // 2. Se não encontrou por code, tenta buscar direto pelo id do documento
  if (!targetDocRef) {
    try {
      const idDocRef = doc(db, COLLECTION, classCodeOrId.trim());
      const idSnap = await getDoc(idDocRef);
      if (idSnap.exists()) {
        targetDocRef = idDocRef;
        currentStudentIds = idSnap.data().studentIds || [];
      }
    } catch {
      // Ignora erro se não for um doc ID válido
    }
  }

  // 3. Fallback retrocompatível: busca turmas legadas onde o ID começa com os 6 dígitos digitados
  if (!targetDocRef) {
    try {
      const allSnap = await getDocs(collection(db, COLLECTION));
      const matched = allSnap.docs.find(d => {
        const dCode = d.data().code;
        return (dCode && dCode.toUpperCase() === normalized) ||
               d.id.toUpperCase().startsWith(normalized) ||
               d.id === classCodeOrId.trim();
      });
      if (matched) {
        targetDocRef = doc(db, COLLECTION, matched.id);
        currentStudentIds = matched.data().studentIds || [];
      }
    } catch (err) {
      console.warn('[ClassRepository] Falha na busca por fallback:', err);
    }
  }

  if (!targetDocRef) {
    throw new Error('Turma não encontrada. Verifique o código de 6 dígitos digitado.');
  }

  // Só adiciona se o aluno ainda não estiver na turma
  if (!currentStudentIds.includes(studentId)) {
    await updateDoc(targetDocRef, {
      studentIds: arrayUnion(studentId),
      studentsCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  }
};

/**
 * Remove um estudante de uma turma (remove do array + decrementa counter).
 */
export const unenrollStudent = async (classId: string, studentId: string): Promise<void> => {
  if (!db) {
    await unenrollLocalStudent(classId, studentId);
    return;
  }

  const classDoc = doc(db, COLLECTION, classId);
  await updateDoc(classDoc, {
    studentIds: arrayRemove(studentId),
    studentsCount: increment(-1),
    updatedAt: new Date().toISOString(),
  });
};

export interface ComplementaryMaterial {
  id?: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
}

export interface StudentMessage {
  id?: string;
  studentId: string;
  studentName: string;
  message: string;
  replied: boolean;
  replyText?: string;
  createdAt: string;
  repliedAt?: string;
}

/**
 * Busca materiais complementares de uma turma.
 */
export const getComplementaryMaterials = async (classId: string): Promise<ComplementaryMaterial[]> => {
  if (!db) {
    return getLocalComplementaryMaterials(classId);
  }
  try {
    const q = collection(db, COLLECTION, classId, 'materials');
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplementaryMaterial));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar materiais:', error);
    return getLocalComplementaryMaterials(classId);
  }
};

/**
 * Publica um novo material complementar.
 */
export const addComplementaryMaterial = async (
  classId: string,
  title: string,
  description: string,
  link: string
): Promise<ComplementaryMaterial> => {
  if (!db) {
    return saveLocalComplementaryMaterial(classId, { title, description, link });
  }
  const newMaterial: Omit<ComplementaryMaterial, 'id'> = {
    title,
    description,
    link,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, COLLECTION, classId, 'materials'), newMaterial);
  return { id: docRef.id, ...newMaterial };
};

/**
 * Busca mensagens/dúvidas dos alunos enviadas para a turma.
 */
export const getStudentMessages = async (classId: string): Promise<StudentMessage[]> => {
  if (!db) {
    return getLocalStudentMessages(classId);
  }
  try {
    const q = collection(db, COLLECTION, classId, 'messages');
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentMessage));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar mensagens:', error);
    return getLocalStudentMessages(classId);
  }
};

/**
 * Envia uma pergunta/dúvida ao professor de uma turma.
 */
export const sendStudentMessage = async (
  classId: string,
  studentId: string,
  studentName: string,
  message: string
): Promise<StudentMessage> => {
  if (!db) {
    return saveLocalStudentMessage(classId, { studentId, studentName, message });
  }
  const newMsg: Omit<StudentMessage, 'id'> = {
    studentId,
    studentName,
    message,
    replied: false,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(collection(db, COLLECTION, classId, 'messages'), newMsg);
  return { id: docRef.id, ...newMsg };
};

/**
 * Professor responde a uma dúvida e pode conceder XP/Moedas adicionais.
 */
export const replyStudentMessage = async (
  classId: string,
  messageId: string,
  replyText: string,
  bonusCoins = 0,
  bonusXp = 0,
  studentId?: string
): Promise<void> => {
  if (!db) {
    await replyLocalStudentMessage(classId, messageId, replyText, bonusCoins, bonusXp, studentId);
    return;
  }
  try {
    const msgDocRef = doc(db, COLLECTION, classId, 'messages', messageId);
    await updateDoc(msgDocRef, {
      replied: true,
      replyText,
      repliedAt: new Date().toISOString()
    });

    // Se houver recompensa e o ID do aluno, adiciona no progresso dele
    if (studentId && (bonusCoins > 0 || bonusXp > 0)) {
      const studentDocRef = doc(db, 'progress', studentId);
      const studentSnap = await getDoc(studentDocRef);
      if (studentSnap.exists()) {
        const data = studentSnap.data();
        const currentXp = data.xp || 0;
        const currentCoins = data.coins || 0;
        const newXp = currentXp + bonusXp;
        const newCoins = currentCoins + bonusCoins;
        const newLevel = Math.floor(newXp / 500) + 1;
        await updateDoc(studentDocRef, {
          xp: newXp,
          coins: newCoins,
          level: newLevel,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('[ClassRepository] Erro ao responder dúvida:', error);
  }
};

/**
 * Escuta reativa em tempo real de materiais complementares da turma.
 */
export const subscribeComplementaryMaterials = (
  classId: string,
  callback: (materials: ComplementaryMaterial[]) => void
): () => void => {
  if (!db) {
    getLocalComplementaryMaterials(classId).then(callback);
    return () => {};
  }
  const q = collection(db, COLLECTION, classId, 'materials');
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplementaryMaterial));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(docs);
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de materiais:', err);
    getLocalComplementaryMaterials(classId).then(callback);
  });
};

/**
 * Escuta reativa em tempo real de mensagens de alunos na turma.
 */
export const subscribeStudentMessages = (
  classId: string,
  callback: (messages: StudentMessage[]) => void
): () => void => {
  if (!db) {
    getLocalStudentMessages(classId).then(callback);
    return () => {};
  }
  const q = collection(db, COLLECTION, classId, 'messages');
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentMessage));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(docs);
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de mensagens:', err);
    getLocalStudentMessages(classId).then(callback);
  });
};

// ─── Avisos da Turma (Mural estilo Edu-Interact-v2) ───────────────
const LOCAL_NOTICES_KEY = 'edu_local_notices';
function getLocalNotices(classId: string): any[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_NOTICES_KEY}_${classId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocalNotices(classId: string, notices: any[]) {
  try {
    localStorage.setItem(`${LOCAL_NOTICES_KEY}_${classId}`, JSON.stringify(notices));
  } catch (err) {
    console.error('Erro ao salvar avisos locais:', err);
  }
}

/**
 * Deduplica lista de avisos preservando integridade por ID e chave composta (título + texto).
 */
export function deduplicateNotices(notices: any[]): any[] {
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const result: any[] = [];

  for (const item of notices) {
    if (!item) continue;
    const id = item.id ? String(item.id).trim() : '';
    const title = (item.titulo || '').trim().toLowerCase();
    const text = (item.texto || '').trim().toLowerCase();
    const contentKey = `${title}|${text}`;

    if (id && seenIds.has(id)) {
      continue;
    }
    if (contentKey && contentKey !== '|' && seenContent.has(contentKey)) {
      continue;
    }

    if (id) seenIds.add(id);
    if (contentKey && contentKey !== '|') seenContent.add(contentKey);
    result.push(item);
  }
  return result;
}

export const createClassNotice = async (
  classId: string,
  professorId: string,
  professorName: string,
  titulo: string,
  texto: string
): Promise<any> => {
  const newNotice = sanitizeForFirestore({
    turmaId: classId,
    professorId,
    professorName,
    titulo,
    texto,
    criadoEm: new Date().toISOString()
  });

  let savedNotice: any = null;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION, classId, 'notices'), newNotice);
      savedNotice = { id: docRef.id, ...newNotice };
    } catch (err) {
      console.warn('[ClassRepository] Falha ao salvar aviso no Firestore, utilizando fallback local:', err);
    }
  }

  if (!savedNotice) {
    savedNotice = { id: `notice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`, ...newNotice };
  }

  // Atualiza cache local garantindo mesmo ID e sem duplicatas
  const notices = getLocalNotices(classId);
  const filtered = notices.filter(
    n => n.id !== savedNotice.id &&
         !(n.titulo?.trim().toLowerCase() === newNotice.titulo.trim().toLowerCase() &&
           n.texto?.trim().toLowerCase() === newNotice.texto.trim().toLowerCase())
  );
  filtered.unshift(savedNotice);
  saveLocalNotices(classId, deduplicateNotices(filtered));

  return savedNotice;
};

export const getClassNotices = async (classId: string): Promise<any[]> => {
  const localDocs = deduplicateNotices(getLocalNotices(classId));
  if (!db) {
    return localDocs;
  }
  try {
    const q = collection(db, COLLECTION, classId, 'notices');
    const snap = await getDocs(q);
    const remoteDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Documentos remotos têm prioridade sobre qualquer cópia local com ID gerado localmente
    const merged = deduplicateNotices([...remoteDocs, ...localDocs]);
    merged.sort((a: any, b: any) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    saveLocalNotices(classId, merged);
    return merged;
  } catch (err) {
    console.error('[ClassRepository] Erro ao buscar avisos da turma:', err);
    return localDocs;
  }
};

export const subscribeClassNotices = (
  classId: string,
  callback: (notices: any[]) => void
): () => void => {
  if (!db) {
    callback(deduplicateNotices(getLocalNotices(classId)));
    return () => {};
  }
  const q = collection(db, COLLECTION, classId, 'notices');
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a: any, b: any) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    const deduped = deduplicateNotices(docs);
    saveLocalNotices(classId, deduped);
    callback(deduped);
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de avisos:', err);
    callback(deduplicateNotices(getLocalNotices(classId)));
  });
};

export const deleteClassNotice = async (classId: string, noticeId: string): Promise<void> => {
  const notices = getLocalNotices(classId).filter(n => n.id !== noticeId);
  saveLocalNotices(classId, notices);
  if (!db) return;
  try {
    await deleteDoc(doc(db, COLLECTION, classId, 'notices', noticeId));
  } catch (err) {
    console.warn('[ClassRepository] Erro ao deletar aviso no Firestore:', err);
  }
};

// ─── Materiais com Suporte a Upload & Categorização ───────────────

/**
 * Deduplica lista de materiais didáticos garantindo chave única por ID e por conteúdo/arquivo.
 */
export function deduplicateMaterials(materials: any[]): any[] {
  const seenIds = new Set<string>();
  const seenContent = new Set<string>();
  const result: any[] = [];

  for (const item of materials) {
    if (!item) continue;
    const id = item.id ? String(item.id).trim() : '';
    const title = (item.title || item.titulo || '').trim().toLowerCase();
    const content = (item.nomeArquivo || item.linkOuConteudo || item.url || item.description || '').trim().toLowerCase();
    const contentKey = `${title}|${content}`;

    if (id && seenIds.has(id)) {
      continue;
    }
    if (contentKey && contentKey !== '|' && seenContent.has(contentKey)) {
      continue;
    }

    if (id) seenIds.add(id);
    if (contentKey && contentKey !== '|') seenContent.add(contentKey);
    result.push(item);
  }
  return result;
}

export const addEnhancedMaterial = async (
  classId: string,
  material: {
    title: string;
    description: string;
    tipo: 'pdf' | 'link' | 'texto' | 'arquivo';
    linkOuConteudo: string;
    nomeArquivo?: string;
    tamanhoFormatado?: string;
    disciplina?: string;
    periodo?: string;
    professorId?: string;
  }
): Promise<any> => {
  const item = sanitizeForFirestore({
    ...material,
    turmaId: classId,
    criadoEm: new Date().toISOString()
  });

  let savedItem: any = null;

  if (db) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION, classId, 'enhanced_materials'), item);
      savedItem = { id: docRef.id, ...item };
    } catch (err) {
      console.warn('[ClassRepository] Falha ao salvar material no Firestore, utilizando fallback local:', err);
    }
  }

  if (!savedItem) {
    savedItem = { id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`, ...item };
  }

  // Salva no armazenamento local com o ID consistente
  try {
    await saveLocalComplementaryMaterial(classId, {
      title: item.title,
      description: item.description,
      type: item.tipo === 'texto' ? 'texto' : item.tipo === 'link' ? 'link' : 'pdf',
      url: item.linkOuConteudo,
      subject: item.disciplina,
      bimester: item.periodo,
      fileName: item.nomeArquivo,
      fileSize: item.tamanhoFormatado
    } as any);
  } catch (err) {
    console.warn('[ClassRepository] Falha ao salvar material em storage local:', err);
  }

  return savedItem;
};

export const getEnhancedMaterials = async (classId: string): Promise<any[]> => {
  let localDocs: any[] = [];
  try {
    const local = await getLocalComplementaryMaterials(classId);
    localDocs = (local || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      tipo: m.type === 'link' ? 'link' : m.type === 'texto' ? 'texto' : 'pdf',
      linkOuConteudo: m.url || m.linkOuConteudo || '',
      nomeArquivo: m.fileName || m.nomeArquivo,
      tamanhoFormatado: m.fileSize || m.tamanhoFormatado,
      disciplina: m.subject || m.disciplina,
      periodo: m.bimester || m.periodo,
      turmaId: classId,
      criadoEm: m.createdAt || m.criadoEm || new Date().toISOString()
    }));
  } catch {
    localDocs = [];
  }

  if (!db) {
    return deduplicateMaterials(localDocs);
  }
  try {
    const q = collection(db, COLLECTION, classId, 'enhanced_materials');
    const snap = await getDocs(q);
    const remoteDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const merged = deduplicateMaterials([...remoteDocs, ...localDocs]);
    merged.sort((a: any, b: any) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    return merged;
  } catch (err) {
    console.error('[ClassRepository] Erro ao buscar materiais enriquecidos:', err);
    return deduplicateMaterials(localDocs);
  }
};

export const subscribeEnhancedMaterials = (
  classId: string,
  callback: (materials: any[]) => void
): () => void => {
  if (!db) {
    getEnhancedMaterials(classId).then(mats => callback(deduplicateMaterials(mats)));
    return () => {};
  }
  const q = collection(db, COLLECTION, classId, 'enhanced_materials');
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a: any, b: any) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
    callback(deduplicateMaterials(docs));
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de materiais enriquecidos:', err);
    getEnhancedMaterials(classId).then(mats => callback(deduplicateMaterials(mats)));
  });
};

export const deleteEnhancedMaterial = async (classId: string, materialId: string): Promise<void> => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, COLLECTION, classId, 'enhanced_materials', materialId));
  } catch (err) {
    console.warn('[ClassRepository] Erro ao deletar material no Firestore:', err);
  }
};

