import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { ClassData, UserData } from '../types';
import { getRepositoryActor } from './repositoryActor';
export type InstitutionalClass = ClassData & { id: string; coordinatorIds?: string[]; institutionId?: string };
function localDb(): { classes: InstitutionalClass[]; users: UserData[] } { return JSON.parse(localStorage.getItem('edu_local_db') ?? '{"classes":[],"users":[]}'); }
export async function getCoordinatorClasses(uid?: string): Promise<InstitutionalClass[]> {
  const actor = await getRepositoryActor();
  if (!['admin', 'coordenador'].includes(actor.role) || (uid && uid !== actor.uid && actor.role !== 'admin')) throw new Error('Este perfil não tem acesso à coordenação solicitada.');
  const coordinatorId = uid ?? actor.uid;
  if (!db) return localDb().classes.filter(classData => actor.role === 'admin' && !uid || classData.coordinatorIds?.includes(coordinatorId) || classData.professorId===coordinatorId);
  const reference = collection(db, 'classes');
  const snapshot = await getDocs(actor.role === 'admin' && !uid ? reference : query(reference, where('coordinatorIds', 'array-contains', coordinatorId)));
  const owned=actor.role==='admin'&&!uid?[]:(await getDocs(query(reference,where('professorId','==',coordinatorId)))).docs;
  return [...new Map([...snapshot.docs,...owned].map(entry=>[entry.id,{...entry.data(),id:entry.id} as InstitutionalClass])).values()];
}
export async function listAssignableClasses(): Promise<InstitutionalClass[]> {
  const actor = await getRepositoryActor();
  if (actor.role !== 'admin') throw new Error('Somente a administração pode atribuir turmas à coordenação.');
  return !db ? localDb().classes : (await getDocs(collection(db, 'classes'))).docs.map(entry => ({ ...entry.data(), id: entry.id }) as InstitutionalClass);
}
export async function listCoordinators(): Promise<(UserData & { id: string })[]> {
  const actor = await getRepositoryActor();
  if (actor.role !== 'admin') throw new Error('Somente a administração pode consultar os perfis de coordenação.');
  return !db ? localDb().users.filter(user => user.role === 'coordenador').map(user => ({ ...user, id: user.id! })) : (await getDocs(query(collection(db, 'users'), where('role', '==', 'coordenador')))).docs.map(entry => ({ ...entry.data(), id: entry.id }) as UserData & { id: string });
}
export async function assignCoordinatorToClass(classId: string, coordinatorId: string, enabled = true): Promise<void> {
  const actor = await getRepositoryActor();
  if (actor.role !== 'admin') throw new Error('Somente a administração pode alterar os vínculos da coordenação.');
  if (!classId || !coordinatorId) throw new Error('Selecione a turma e a pessoa responsável pela coordenação.');
  if (!db) {
    const data = localDb(); const classData = data.classes.find(entry => entry.id === classId); const coordinator = data.users.find(entry => entry.id === coordinatorId && entry.role === 'coordenador');
    if (!classData || !coordinator) throw new Error('Turma ou perfil de coordenação não encontrado.');
    classData.coordinatorIds = enabled ? [...new Set([...(classData.coordinatorIds ?? []), coordinatorId])] : (classData.coordinatorIds ?? []).filter(id => id !== coordinatorId);
    localStorage.setItem('edu_local_db', JSON.stringify(data)); return;
  }
  const coordinator = await getDoc(doc(db, 'users', coordinatorId));
  if (!coordinator.exists() || coordinator.data().role !== 'coordenador') throw new Error('O perfil escolhido precisa pertencer à coordenação.');
  await updateDoc(doc(db, 'classes', classId), { coordinatorIds: enabled ? arrayUnion(coordinatorId) : arrayRemove(coordinatorId), updatedAt: new Date().toISOString() });
}
