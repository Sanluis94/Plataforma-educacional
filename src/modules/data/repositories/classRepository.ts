/**
 * Class Repository — Persistência de turmas no Firestore.
 * Gerencia CRUD de turmas do professor e matrícula de alunos.
 */
import {
  collection, addDoc, query, where, getDocs, onSnapshot,
  doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment, setDoc, writeBatch, runTransaction
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { getRepositoryActor } from './repositoryActor';
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
} from '../services/localEtlClient';
import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import { isValidSafeUrl, sanitizeText } from '../../core/services/securityService';
import type { ClassData, ClassMaterial } from '../types';
import { DEFAULT_PROGRESS } from '../types';

// Manter a interface Turma para compatibilidade com o front-end existente
export interface Turma {
  studentIds?: string[];
  id: string;
  name: string;
  studentsCount: number;
  professorName?: string;
  code?: string;
  createdAt?: string;
  gradeLevel?: string;
  academicLevel?: string;
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
  if (!professorId) return [];
  if (!db) {
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
        studentIds: data.studentIds ?? [],
        studentsCount: Array.isArray(data.studentIds) ? new Set(data.studentIds.filter((id: unknown) => typeof id === 'string' && id.trim())).size : 0,
        code: data.code || docSnap.id.slice(0, 6).toUpperCase(),
        createdAt: data.createdAt || '',
        gradeLevel: data.gradeLevel,
        academicLevel: data.academicLevel,
      };
    });

    // Sort locally to avoid Firestore missing index issues
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar turmas:', error);
    throw error;
  }
};

/**
 * Busca turmas nas quais um estudante está matriculado.
 */
export const getStudentClasses = async (studentId: string): Promise<Turma[]> => {
  if (!studentId) return [];
  if (!db) {
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
        studentsCount: Array.isArray(data.studentIds) ? new Set(data.studentIds).size : 0,
        professorName: data.professorName || 'Professor',
        gradeLevel: data.gradeLevel,
        academicLevel: data.academicLevel,
        code: data.code || docSnap.id.slice(0, 6).toUpperCase(),
        createdAt: data.createdAt || '',
      };
    });

    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar turmas do estudante:', error);
    throw error;
  }
};

/** The same membership query stays active when a teacher changes the roster. */
export const subscribeStudentClasses = (studentId: string, callback: (classes: Turma[]) => void, onError?: (error: Error) => void): (() => void) => {
  let active = true;
  if (!studentId) { callback([]); return () => { active = false; }; }
  if (!db) {
    void getLocalStudentClasses(studentId).then(classes => { if (active) callback(classes); }).catch(error => { if (active) onError?.(error); });
    return () => { active = false; };
  }
  const membership = query(collection(db, COLLECTION), where('studentIds', 'array-contains', studentId));
  const unsubscribe = onSnapshot(membership, snapshot => {
    if (!active) return;
    const classes = snapshot.docs.map(entry => {
      const data = entry.data();
      return { id: entry.id, name: data.name, studentsCount: Array.isArray(data.studentIds) ? new Set(data.studentIds).size : 0, professorName: data.professorName || 'Professor', gradeLevel: data.gradeLevel, academicLevel: data.academicLevel, code: data.code || entry.id.slice(0, 6).toUpperCase(), createdAt: data.createdAt || '' };
    });
    callback(classes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, error => { if (active) onError?.(error); });
  return () => { active = false; unsubscribe(); };
};

/**
 * Cria uma nova turma no Firestore gerando um código amigável de 6 dígitos.
 */
export const saveClass = async (
  name: string,
  professorId?: string,
  professorName?: string
): Promise<Turma> => {
  name = name.trim();
  if (!name || name.length > 200) throw new Error('Informe um nome de turma com até 200 caracteres.');
  const shortCode = generateShortClassCode();

  if (!db) {
    console.warn('[ClassRepository] Firestore não inicializado. Turma salva localmente no LocalStorage.');
    const newClass = await saveLocalClass(name, professorId, professorName, shortCode);
    return { id: newClass.id!, name: newClass.name, studentsCount: 0, code: newClass.code || shortCode };
  }
  if (!professorId) throw new Error('Entre na sua conta de professor antes de criar a turma.');

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

  const reference = doc(collection(db, COLLECTION));
  for (let retry = 0; retry < 6; retry++) {
    const code = retry === 0 ? shortCode : generateShortClassCode();
    const codeReference = doc(db, 'class_codes', code);
    if ((await getDoc(codeReference)).exists()) continue;
    const batch = writeBatch(db);
    batch.set(reference, { ...classData, code });
    batch.set(codeReference, { classId: reference.id, code, name, professorName: classData.professorName });
    try {
      await batch.commit();
      return { id: reference.id, name, studentIds: [], studentsCount: 0, code };
    } catch (error) {
      const existing = await getDoc(codeReference).catch(() => null);
      if (!existing?.exists() || existing.data().classId === reference.id) throw error;
    }
  }
  throw new Error('Não foi possível reservar um código para a turma. Tente criar a turma novamente.');
};

/**
 * Remove uma turma do Firestore.
 */
export const deleteClass = async (classId: string): Promise<void> => {
  if (!db) {
    await getLocalEtlClassesByProfessor();
    const state = JSON.parse(localStorage.getItem('edu_local_db') ?? '{}');
    state.classes = (state.classes ?? []).filter((entry: ClassData) => entry.id !== classId);
    localStorage.setItem('edu_local_db', JSON.stringify(state));
    return;
  }
  const reference = doc(db, COLLECTION, classId);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) return;
  const batch = writeBatch(db);
  batch.delete(reference);
  if (snapshot.data().code) batch.delete(doc(db, 'class_codes', snapshot.data().code));
  await batch.commit();
};

/**
 * Matricula um estudante em uma turma.
 * Suporta busca retrocompatível tanto pelo código de 6 dígitos quanto pelo id do Firestore.
 */
export async function ensureClassEnrollmentCode(classId: string): Promise<void> {
  if (!db) return;
  const database = db;
  await runTransaction(database, async transaction => {
    const reference = doc(database, COLLECTION, classId);
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('Turma não encontrada.');
    const classData = snapshot.data() as ClassData;
    const code = classData.code || classId.slice(0, 6).toUpperCase();
    const codeReference = doc(database, 'class_codes', code);
    const existing = await transaction.get(codeReference);
    if (existing.exists() && existing.data().classId !== classId) throw new Error('Este código pertence a outra turma. Solicite à administração um novo código.');
    const studentIds = [...new Set(classData.studentIds ?? [])];
    if (!classData.code || classData.studentsCount !== studentIds.length || studentIds.length !== (classData.studentIds ?? []).length) transaction.update(reference, { code, studentIds, studentsCount: studentIds.length, updatedAt: new Date().toISOString() });
    if (!existing.exists()) transaction.set(codeReference, { classId, code, name: classData.name, professorName: classData.professorName ?? 'Professor' });
  });
}
export const enrollStudent = async (classCodeOrId: string, studentId: string): Promise<string> => {
  const normalized = classCodeOrId.trim().toUpperCase();
  if (!db) { await enrollLocalStudent(normalized, studentId); const classes = await getLocalStudentClasses(studentId); const selected = classes.find(entry => entry.code?.toUpperCase() === normalized || entry.id === classCodeOrId.trim()); if (!selected) throw new Error('Turma não encontrada.'); return selected.id; }
  const actor = await getRepositoryActor();
  if (actor.uid !== studentId || actor.role !== 'estudante') throw new Error('A matrícula deve ser feita pelo próprio estudante.');
  const current = await getStudentClasses(studentId);
  const already = current.find(entry => entry.code?.toUpperCase() === normalized || entry.id === classCodeOrId.trim());
  let classId = already?.id;
  if (!classId) {
    const code = await getDoc(doc(db, 'class_codes', normalized));
    if (!code.exists()) throw new Error('Turma não encontrada. Confira o código ou peça ao professor para abrir seu painel e disponibilizar o código.');
    classId = code.data().classId;
    try {
      await updateDoc(doc(db, COLLECTION, classId!), { studentIds: arrayUnion(studentId), studentsCount: increment(1), updatedAt: new Date().toISOString() });
    } catch (error) {
      // A simultaneous enrollment may already have committed the same membership.
      if (!(await getStudentClasses(studentId)).some(entry => entry.id === classId)) throw error;
    }
  }
  await setDoc(doc(db, COLLECTION, classId!, 'student_profiles', studentId), { studentId, name: actor.name || 'Estudante', updatedAt: new Date().toISOString() });
  return classId!;
};

/**
 * Remove um estudante de uma turma (remove do array + decrementa counter).
 */
export const unenrollStudent = async (classId: string, studentId: string): Promise<void> => {
  if (!db) {
    await unenrollLocalStudent(classId, studentId);
    return;
  }

  const actor = await getRepositoryActor();
  if (actor.uid !== studentId || actor.role !== 'estudante') throw new Error('A saída da turma deve ser feita pelo próprio estudante.');
  if (!(await getStudentClasses(studentId)).some(entry => entry.id === classId)) return;
  try {
    await updateDoc(doc(db, COLLECTION, classId), { studentIds: arrayRemove(studentId), studentsCount: increment(-1), updatedAt: new Date().toISOString() });
  } catch (error) {
    if ((await getStudentClasses(studentId)).some(entry => entry.id === classId)) throw error;
  }
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
  bonusCoins?: number;
  bonusXp?: number;
  rewardClaimedAt?: string;
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
    throw error;
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
  if (!title.trim() || !isValidSafeUrl(link) || !/^https?:/i.test(link.trim())) throw new Error('Informe o título e um link HTTP ou HTTPS válido.');
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
export const getStudentMessages = async (classId: string, studentId?:string): Promise<StudentMessage[]> => {
  if (!db) {
    return (await getLocalStudentMessages(classId)).filter(message => !studentId || message.studentId === studentId);
  }
  try {
    const reference=collection(db, COLLECTION, classId, 'messages');
    const q = studentId?query(reference,where('studentId','==',studentId)):reference;
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentMessage));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return docs;
  } catch (error) {
    console.error('[ClassRepository] Erro ao buscar mensagens:', error);
    throw error;
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
  message = sanitizeText(message);
  if (!message || message.length > 4000) throw new Error('Escreva uma dúvida com até 4.000 caracteres.');
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
  replyText = sanitizeText(replyText);
  if (!replyText || replyText.length > 4000) throw new Error('Escreva uma resposta com até 4.000 caracteres.');
  if (!Number.isInteger(bonusCoins) || !Number.isInteger(bonusXp) || bonusCoins < 0 || bonusCoins > 1000 || bonusXp < 0 || bonusXp > 1000) throw new Error('A recompensa deve usar números inteiros de 0 a 1.000 pontos.');
  if (!db) {
    await getLocalStudentMessages(classId);
    const state = JSON.parse(localStorage.getItem('edu_local_db') ?? '{}');
    const message: StudentMessage | undefined = state.messages?.[classId]?.find((entry: StudentMessage) => entry.id === messageId);
    if (!message || (studentId && message.studentId !== studentId)) throw new Error('A dúvida não está mais disponível nesta turma.');
    if (message.rewardClaimedAt && ((message.bonusCoins ?? 0) !== bonusCoins || (message.bonusXp ?? 0) !== bonusXp)) throw new Error('Uma recompensa já recebida pelo estudante não pode ser alterada.');
    Object.assign(message, { replied: true, replyText, repliedAt: new Date().toISOString(), bonusCoins, bonusXp });
    localStorage.setItem('edu_local_db', JSON.stringify(state));
    return;
  }
  try {
    if(!Number.isFinite(bonusCoins)||!Number.isFinite(bonusXp)||bonusCoins<0||bonusCoins>1000||bonusXp<0||bonusXp>1000)throw new Error('A recompensa deve ficar entre 0 e 1.000 pontos.');
    const msgDocRef = doc(db, COLLECTION, classId, 'messages', messageId);
    await updateDoc(msgDocRef, {
      replied: true,
      replyText,
      repliedAt: new Date().toISOString(),
      bonusCoins, bonusXp,
    });

    // The student receives the reward atomically on the next message refresh.
  } catch (error) {
    console.error('[ClassRepository] Erro ao responder dúvida:', error);
    throw error;
  }
};

export async function claimStudentMessageReward(classId:string,messageId:string,studentId:string):Promise<boolean>{
  if (!db) {
    await getLocalStudentMessages(classId);
    const state = JSON.parse(localStorage.getItem('edu_local_db') ?? '{}');
    const message: StudentMessage | undefined = state.messages?.[classId]?.find((entry: StudentMessage) => entry.id === messageId);
    if (!message || message.studentId !== studentId || !message.replied || message.rewardClaimedAt || !((message.bonusCoins ?? 0) > 0 || (message.bonusXp ?? 0) > 0)) return false;
    const current = { ...DEFAULT_PROGRESS, ...(state.progress?.[studentId] ?? {}) };
    const xp = current.xp + (message.bonusXp ?? 0), coins = current.coins + (message.bonusCoins ?? 0), updatedAt = new Date().toISOString();
    state.progress ??= {};
    state.progress[studentId] = { ...current, xp, coins, level: Math.floor(xp / 500) + 1, updatedAt };
    message.rewardClaimedAt = updatedAt;
    localStorage.setItem('edu_local_db', JSON.stringify(state));
    return true;
  }
  const database=db,messageRef=doc(database,COLLECTION,classId,'messages',messageId),progressRef=doc(database,'progress',studentId);
  return runTransaction(database,async transaction=>{
    const [message,progress]=await Promise.all([transaction.get(messageRef),transaction.get(progressRef)]);
    if(!message.exists())return false;
    const data=message.data();
    if(data.studentId!==studentId||!data.replied||data.rewardClaimedAt||!(data.bonusCoins>0||data.bonusXp>0))return false;
    const current={...DEFAULT_PROGRESS,...(progress.exists()?progress.data():{})};
    const xp=current.xp+(data.bonusXp??0),coins=current.coins+(data.bonusCoins??0),updatedAt=new Date().toISOString();
    transaction.set(progressRef,{...current,xp,coins,level:Math.floor(xp/500)+1,updatedAt},{merge:true});
    transaction.update(messageRef,{rewardClaimedAt:updatedAt});
    return true;
  });
}

/**
 * Escuta reativa em tempo real de materiais complementares da turma.
 */
export const subscribeComplementaryMaterials = (
  classId: string,
  callback: (materials: ComplementaryMaterial[]) => void,
  onError?: (error: Error) => void
): () => void => {
  if (!db) {
    let active = true;
    getLocalComplementaryMaterials(classId).then(materials => { if (active) callback(materials); }).catch(error => { if (active) onError?.(error); });
    return () => { active = false; };
  }
  const q = collection(db, COLLECTION, classId, 'materials');
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ComplementaryMaterial));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(docs);
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de materiais:', err);
    onError?.(err);
  });
};

/**
 * Escuta reativa em tempo real de mensagens de alunos na turma.
 */
export const subscribeStudentMessages = (
  classId: string,
  callback: (messages: StudentMessage[]) => void,
  studentId?:string,
  onError?: (error: Error) => void
): () => void => {
  if (!db) {
    let active = true;
    getStudentMessages(classId, studentId).then(messages => { if (active) callback(messages); }).catch(error => { if (active) onError?.(error); });
    return () => { active = false; };
  }
  const reference=collection(db, COLLECTION, classId, 'messages');
  const q = studentId?query(reference,where('studentId','==',studentId)):reference;
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentMessage));
    docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(docs);
  }, (err) => {
    console.error('[ClassRepository] Erro no listener de mensagens:', err);
    onError?.(err);
  });
};

// ─── Avisos e materiais da turma ───────────────────────────────
export interface PersistedClassNotice {
  id: string;
  turmaId: string;
  professorId: string;
  professorName: string;
  titulo: string;
  texto: string;
  criadoEm: string;
}

export type EnhancedMaterial = Omit<ClassMaterial, 'periodo'> & { periodo?: string };
const LOCAL_NOTICES_KEY = 'edu_local_notices';
const LOCAL_ENHANCED_KEY = 'edu_local_enhanced_materials';
function readLocalList<T>(key: string): T[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function writeLocalList<T>(key: string, items: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(items)); }
  catch { throw new Error('Não foi possível guardar as alterações neste dispositivo. Tente novamente.'); }
}

export function deduplicateNotices<T extends { id?: string; titulo?: string; texto?: string }>(notices: T[]): T[] {
  const ids = new Set<string>(), contents = new Set<string>();
  return notices.filter(item => {
    if (!item) return false;
    const content = (item.titulo ?? '').trim().toLowerCase() + '|' + (item.texto ?? '').trim().toLowerCase();
    if ((item.id && ids.has(item.id)) || (content !== '|' && contents.has(content))) return false;
    if (item.id) ids.add(item.id);
    if (content !== '|') contents.add(content);
    return true;
  });
}

export const createClassNotice = async (classId: string, professorId: string, professorName: string, titulo: string, texto: string): Promise<PersistedClassNotice> => {
  const notice = { turmaId: classId, professorId, professorName, titulo: sanitizeText(titulo), texto: sanitizeText(texto), criadoEm: new Date().toISOString() };
  if (!classId || !professorId || !notice.titulo || !notice.texto) throw new Error('Informe a turma, o título e o texto do aviso.');
  if (db) {
    const reference = await addDoc(collection(db, COLLECTION, classId, 'notices'), sanitizeForFirestore(notice));
    return { ...notice, id: reference.id };
  }
  const saved = { ...notice, id: 'notice-' + crypto.randomUUID() };
  const key = LOCAL_NOTICES_KEY + '_' + classId;
  writeLocalList(key, deduplicateNotices([saved, ...readLocalList<PersistedClassNotice>(key)]));
  return saved;
};

export const getClassNotices = async (classId: string): Promise<PersistedClassNotice[]> => {
  if (!db) return deduplicateNotices(readLocalList<PersistedClassNotice>(LOCAL_NOTICES_KEY + '_' + classId));
  const snapshot = await getDocs(collection(db, COLLECTION, classId, 'notices'));
  return deduplicateNotices(snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as PersistedClassNotice))).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
};

export const subscribeClassNotices = (classId: string, callback: (notices: PersistedClassNotice[]) => void, onError?: (error: Error) => void): (() => void) => {
  if (!db) { callback(deduplicateNotices(readLocalList<PersistedClassNotice>(LOCAL_NOTICES_KEY + '_' + classId))); return () => {}; }
  return onSnapshot(collection(db, COLLECTION, classId, 'notices'), snapshot => {
    callback(deduplicateNotices(snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as PersistedClassNotice))).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
  }, error => { console.error('[ClassRepository] Erro ao acompanhar avisos:', error); onError?.(error); });
};

export const deleteClassNotice = async (classId: string, noticeId: string): Promise<void> => {
  if (db) { await deleteDoc(doc(db, COLLECTION, classId, 'notices', noticeId)); return; }
  const key = LOCAL_NOTICES_KEY + '_' + classId;
  writeLocalList(key, readLocalList<PersistedClassNotice>(key).filter(notice => notice.id !== noticeId));
};

export function deduplicateMaterials<T extends { id?: string; title?: string; titulo?: string; nomeArquivo?: string; linkOuConteudo?: string; url?: string; description?: string }>(materials: T[]): T[] {
  const ids = new Set<string>(), contents = new Set<string>();
  return materials.filter(item => {
    if (!item) return false;
    const title = (item.title || item.titulo || '').trim().toLowerCase();
    const content = (item.linkOuConteudo || item.url || item.description || item.nomeArquivo || '').trim();
    const key = title + '|' + content;
    if ((item.id && ids.has(item.id)) || (key !== '|' && contents.has(key))) return false;
    if (item.id) ids.add(item.id);
    if (key !== '|') contents.add(key);
    return true;
  });
}

export const addEnhancedMaterial = async (classId: string, material: Omit<EnhancedMaterial, 'id' | 'turmaId' | 'criadoEm'>): Promise<EnhancedMaterial> => {
  const item = sanitizeForFirestore({ ...material, title: sanitizeText(material.title), turmaId: classId, criadoEm: new Date().toISOString() });
  if (!classId || !item.title || !item.linkOuConteudo.trim()) throw new Error('Informe a turma, o título e o conteúdo do material.');
  if (item.tipo !== 'texto' && !isValidSafeUrl(item.linkOuConteudo)) throw new Error('O material precisa de um link HTTP/HTTPS ou arquivo PDF/imagem válido.');
  if (item.tipo === 'link' && !/^https?:/i.test(item.linkOuConteudo.trim())) throw new Error('Use um endereço HTTP ou HTTPS para o link.');
  if (new TextEncoder().encode(JSON.stringify(item)).length > 750_000) throw new Error('Este arquivo é grande demais. Use um link para o arquivo ou um anexo menor que 550 KB.');
  if (db) {
    const reference = await addDoc(collection(db, COLLECTION, classId, 'enhanced_materials'), item);
    return { ...item, id: reference.id };
  }
  const saved = { ...item, id: 'material-' + crypto.randomUUID() };
  const key = LOCAL_ENHANCED_KEY + '_' + classId;
  writeLocalList(key, deduplicateMaterials([saved, ...readLocalList<EnhancedMaterial>(key)]));
  return saved;
};

export const getEnhancedMaterials = async (classId: string): Promise<EnhancedMaterial[]> => {
  if (db) {
    const snapshot = await getDocs(collection(db, COLLECTION, classId, 'enhanced_materials'));
    return deduplicateMaterials(snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as EnhancedMaterial))).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }
  // Read older local records once alongside the dedicated list, preserving their IDs.
  const legacy = await getLocalComplementaryMaterials(classId);
  const projected = legacy.map(entry => {
    const material = entry as typeof entry & { type?: string; url?: string; subject?: string; bimester?: string; fileName?: string; fileSize?: string };
    return { id: entry.id, title: entry.title, description: entry.description, tipo: material.type === 'link' ? 'link' as const : material.type === 'texto' ? 'texto' as const : 'pdf' as const, linkOuConteudo: material.url || entry.link || '', nomeArquivo: material.fileName, tamanhoFormatado: material.fileSize, disciplina: material.subject, periodo: material.bimester, turmaId: classId, criadoEm: entry.createdAt };
  });
  return deduplicateMaterials([...readLocalList<EnhancedMaterial>(LOCAL_ENHANCED_KEY + '_' + classId), ...projected]).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
};

export const subscribeEnhancedMaterials = (classId: string, callback: (materials: EnhancedMaterial[]) => void, onError?: (error: Error) => void): (() => void) => {
  if (!db) {
    let active = true;
    getEnhancedMaterials(classId).then(materials => { if (active) callback(materials); }).catch(error => { if (active) onError?.(error); });
    return () => { active = false; };
  }
  return onSnapshot(collection(db, COLLECTION, classId, 'enhanced_materials'), snapshot => {
    callback(deduplicateMaterials(snapshot.docs.map(entry => ({ ...entry.data(), id: entry.id } as EnhancedMaterial))).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
  }, error => { console.error('[ClassRepository] Erro ao acompanhar materiais:', error); onError?.(error); });
};

export const deleteEnhancedMaterial = async (classId: string, materialId: string): Promise<void> => {
  if (db) { await deleteDoc(doc(db, COLLECTION, classId, 'enhanced_materials', materialId)); return; }
  // Initialize legacy storage before reading it, then remove both representations.
  await getLocalComplementaryMaterials(classId);
  const state = JSON.parse(localStorage.getItem('edu_local_db') ?? '{}');
  if (state.complementaryMaterials?.[classId]) state.complementaryMaterials[classId] = state.complementaryMaterials[classId].filter((material: { id: string }) => material.id !== materialId);
  const key = LOCAL_ENHANCED_KEY + '_' + classId;
  writeLocalList(key, readLocalList<EnhancedMaterial>(key).filter(material => material.id !== materialId));
  localStorage.setItem('edu_local_db', JSON.stringify(state));
};
