import { collection, doc, getDoc, getDocs, query, runTransaction, setDoc, Timestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { ClassData, SubmissionData } from '../types';
import { getRepositoryActor } from './repositoryActor';
import { getLocalEtlClassReport } from '../services/localEtlClient';
import { learningTimestamp } from '../services/learningAnalytics';

export interface FamilyInvitation { id: string; classId: string; className: string; studentId: string; studentName: string; professorId: string; professorName: string; email: string; status: 'pending' | 'accepted' | 'revoked'; createdAt: string; expiresAt: string; acceptedBy?: string; acceptedAt?: string }
export interface FamilyConnection { id: string; invitationId: string; classId: string; className: string; studentId: string; studentName: string; professorId: string; professorName: string; parentId: string; email: string; status: 'active' | 'revoked'; createdAt: string; revokedAt?: string }
export interface FamilyMessage { id: string; linkId: string; classId: string; studentId: string; parentId: string; professorId: string; senderId: string; senderName: string; text: string; createdAt: string }
export interface FamilyStudentSummary { connection: FamilyConnection; submissions: SubmissionData[]; reviews: Record<string, unknown>[]; guidance: Record<string, unknown>[]; averageScore: number | null; completedCount: number; lastActivity: string | null }
const LOCAL = 'edu_family_connections_v1';
function local() { return JSON.parse(localStorage.getItem(LOCAL) ?? '{"invitations":[],"connections":[],"messages":[]}') as { invitations: FamilyInvitation[]; connections: FamilyConnection[]; messages: FamilyMessage[] }; }
const save = (data: ReturnType<typeof local>) => localStorage.setItem(LOCAL, JSON.stringify(data));
const fromInvite = (id: string, value: Record<string, unknown>): FamilyInvitation => ({ ...value, id, expiresAt: value.expiresAt instanceof Timestamp ? value.expiresAt.toDate().toISOString() : String(value.expiresAt) }) as FamilyInvitation;
async function classForInvitation(classId: string, studentId: string) {
  const actor = await getRepositoryActor();
  let classData: ClassData | undefined; let studentName = '';
  if (!db) { const data = JSON.parse(localStorage.getItem('edu_local_db') ?? '{}'); classData = data.classes?.find((entry: ClassData) => entry.id === classId); studentName = data.users?.find((entry: { id: string; name: string }) => entry.id === studentId)?.name ?? ''; }
  else { const snapshot = await getDoc(doc(db, 'classes', classId)); classData = snapshot.exists() ? snapshot.data() as ClassData : undefined; const profile = await getDoc(doc(db, 'classes', classId, 'student_profiles', studentId)); studentName = profile.exists() ? profile.data().name ?? '' : ''; }
  if (!classData || !classData.studentIds.includes(studentId) || (classData.professorId !== actor.uid && actor.role !== 'admin')) throw new Error('O convite deve partir do professor da turma e indicar um estudante matriculado.');
  return { actor, classData, studentName: studentName || 'Estudante da turma' };
}
export async function createFamilyInvitation(input: { classId: string; studentId: string; email: string }): Promise<FamilyInvitation> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Informe o email da pessoa responsável.');
  const { actor, classData, studentName } = await classForInvitation(input.classId, input.studentId);
  const invitation: FamilyInvitation = { id: crypto.randomUUID(), classId: input.classId, className: classData.name, studentId: input.studentId, studentName, professorId: classData.professorId, professorName: classData.professorName || actor.name, email, status: 'pending', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString() };
  if (!db) { const data = local(); data.invitations.push(invitation); save(data); }
  else await setDoc(doc(db, 'family_invitations', invitation.id), { ...invitation, expiresAt: Timestamp.fromDate(new Date(invitation.expiresAt)) });
  return invitation;
}
export async function getClassFamilyInvitations(classId: string): Promise<FamilyInvitation[]> {
  const actor = await getRepositoryActor();
  if (!db) { const data = JSON.parse(localStorage.getItem('edu_local_db') ?? '{}'); if (actor.role !== 'admin' && !data.classes?.some((entry: ClassData) => entry.id === classId && entry.professorId === actor.uid)) throw new Error('Esta turma não pertence ao seu perfil.'); return local().invitations.filter(invitation => invitation.classId === classId); }
  return (await getDocs(query(collection(db, 'family_invitations'), where('classId', '==', classId)))).docs.map(entry => fromInvite(entry.id, entry.data()));
}
export async function listFamilyInvitations(): Promise<FamilyInvitation[]> {
  const actor = await getRepositoryActor(); if (!actor.emailVerified) throw new Error('Use uma conta com email verificado para receber o convite.');
  const invitations = !db ? local().invitations.filter(invitation => invitation.email === actor.email) : (await getDocs(query(collection(db, 'family_invitations'), where('email', '==', actor.email)))).docs.map(entry => fromInvite(entry.id, entry.data()));
  return invitations.filter(invitation => invitation.status === 'pending' && Date.parse(invitation.expiresAt) > Date.now());
}
export async function acceptFamilyInvitation(id: string): Promise<FamilyConnection> {
  const actor = await getRepositoryActor(); if (!actor.emailVerified) throw new Error('Seu email precisa estar verificado.');
  function connection(invitation: FamilyInvitation): FamilyConnection {
    if (invitation.email !== actor.email || invitation.status !== 'pending' || Date.parse(invitation.expiresAt) <= Date.now()) throw new Error('Este convite não está disponível para sua conta.');
    return { id: `${invitation.classId}__${invitation.studentId}__${actor.uid}`, invitationId: id, classId: invitation.classId, className: invitation.className, studentId: invitation.studentId, studentName: invitation.studentName, professorId: invitation.professorId, professorName: invitation.professorName, parentId: actor.uid, email: actor.email, status: 'active', createdAt: new Date().toISOString() };
  }
  if (!db) { const data = local(); const invitation = data.invitations.find(entry => entry.id === id); if (!invitation) throw new Error('Convite não encontrado.'); const linked = connection(invitation); invitation.status = 'accepted'; invitation.acceptedBy = actor.uid; invitation.acceptedAt = linked.createdAt; data.connections = [...data.connections.filter(entry => entry.id !== linked.id), linked]; save(data); return linked; }
  return runTransaction(db, async transaction => { const reference = doc(db!, 'family_invitations', id); const snapshot = await transaction.get(reference); if (!snapshot.exists()) throw new Error('Convite não encontrado.'); const linked = connection(fromInvite(id, snapshot.data())); transaction.update(reference, { status: 'accepted', acceptedBy: actor.uid, acceptedAt: linked.createdAt }); transaction.set(doc(db!, 'family_links', linked.id), linked); return linked; });
}
export async function getFamilyConnections(): Promise<FamilyConnection[]> {
  const actor = await getRepositoryActor();
  return !db ? local().connections.filter(link => link.parentId === actor.uid && link.status === 'active') : (await getDocs(query(collection(db, 'family_links'), where('parentId', '==', actor.uid), where('status', '==', 'active')))).docs.map(entry => ({ ...entry.data(), id: entry.id }) as FamilyConnection);
}
async function authorizedLink(id: string): Promise<FamilyConnection> {
  const actor = await getRepositoryActor(); const value = !db ? local().connections.find(link => link.id === id) : await getDoc(doc(db, 'family_links', id)).then(snapshot => snapshot.exists() ? { ...snapshot.data(), id } as FamilyConnection : undefined);
  const locallyEnrolled=db||JSON.parse(localStorage.getItem('edu_local_db')??'{}').classes?.some((item:ClassData&{id:string})=>item.id===value?.classId&&item.studentIds.includes(value.studentId));
  if (!value || !locallyEnrolled || value.status !== 'active' || (value.parentId !== actor.uid && value.professorId !== actor.uid && actor.role !== 'admin')) throw new Error('Este vínculo familiar não está disponível para sua conta.');
  return value;
}
export async function getFamilyStudentSummary(linkId: string): Promise<FamilyStudentSummary> {
  const connection = await authorizedLink(linkId);
  let submissions: SubmissionData[]; let reviews: Record<string, unknown>[]; let guidance: Record<string, unknown>[];
  if (!db) { const report = await getLocalEtlClassReport(connection.classId); const records = report?.students.find(student => student.studentId === connection.studentId)?.records ?? []; submissions = records.map(record => ({ id: record.id, activityId: record.itemId, activityTitle: record.title, classId: connection.classId, studentId: connection.studentId, studentName: record.studentName, score: record.score!, submittedAt: record.submittedAt, status: record.completed ? 'completed' : 'pending', evidence: record.evidence })); reviews = JSON.parse(localStorage.getItem('edu_local_submission_reviews')||'[]').filter((item:{classId:string;studentId:string;status:string})=>item.classId===connection.classId&&item.studentId===connection.studentId&&item.status==='published'); guidance = JSON.parse(localStorage.getItem('edu_local_student_guidance')||'[]').filter((item:{classId:string;studentId:string})=>item.classId===connection.classId&&item.studentId===connection.studentId); }
  else { const database = db; const studentQuery = (name: string, published = false) => query(collection(database, name), where('classId', '==', connection.classId), where('studentId', '==', connection.studentId), ...(published ? [where('status', '==', 'published')] : [])); const [sent, corrected, oriented] = await Promise.all([getDocs(studentQuery('submissions')), getDocs(studentQuery('submission_reviews', true)), getDocs(studentQuery('student_guidance'))]); submissions = sent.docs.map(entry => ({ ...entry.data(), id: entry.id }) as SubmissionData); reviews = corrected.docs.map(entry => ({ ...entry.data(), id: entry.id })); guidance = oriented.docs.map(entry => ({ ...entry.data(), id: entry.id })); }
  const latest = new Map<string, SubmissionData>(); submissions.filter(submission => submission.status === 'completed' && submission.evidence?.stage !== 'exploration' && learningTimestamp(submission.submittedAt)).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).forEach(submission => { if (!latest.has(submission.activityId)) latest.set(submission.activityId, submission); });
  const scores = [...latest.values()].map(submission => submission.score).filter(score => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100);
  return { connection, submissions, reviews, guidance, completedCount: latest.size, averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null, lastActivity: submissions.map(submission => learningTimestamp(submission.submittedAt)).filter((value): value is string => Boolean(value)).sort().at(-1) ?? null };
}
export async function getFamilyMessages(linkId: string): Promise<FamilyMessage[]> { await authorizedLink(linkId); const messages = !db ? local().messages.filter(message => message.linkId === linkId) : (await getDocs(query(collection(db, 'family_messages'), where('linkId', '==', linkId)))).docs.map(entry => ({ ...entry.data(), id: entry.id }) as FamilyMessage); return messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); }
export async function sendFamilyMessage(linkId: string, text: string): Promise<FamilyMessage> { const link = await authorizedLink(linkId); const actor = await getRepositoryActor(); const message = text.trim(); if (!message || message.length > 4000) throw new Error('Escreva uma mensagem com até 4.000 caracteres.'); const sent: FamilyMessage = { id: crypto.randomUUID(), linkId, classId: link.classId, studentId: link.studentId, parentId: link.parentId, professorId: link.professorId, senderId: actor.uid, senderName: actor.name, text: message, createdAt: new Date().toISOString() }; if (!db) { const data = local(); data.messages.push(sent); save(data); } else await setDoc(doc(db, 'family_messages', sent.id), sent); return sent; }
export async function revokeFamilyInvitation(id: string): Promise<void> { const actor = await getRepositoryActor(); if (!db) { const data = local(); const invitation = data.invitations.find(entry => entry.id === id); if (!invitation || (invitation.professorId !== actor.uid && actor.role !== 'admin')) throw new Error('Convite não disponível para revogação.'); invitation.status = 'revoked'; data.connections.filter(link => link.invitationId === id).forEach(link => { link.status = 'revoked'; link.revokedAt = new Date().toISOString(); }); save(data); return; } const reference = doc(db, 'family_invitations', id); const snapshot = await getDoc(reference); if (!snapshot.exists()) throw new Error('Convite não encontrado.'); const invitation = fromInvite(id, snapshot.data()); const batch = writeBatch(db); batch.update(reference, { status: 'revoked' }); if (invitation.acceptedBy) batch.update(doc(db, 'family_links', `${invitation.classId}__${invitation.studentId}__${invitation.acceptedBy}`), { status: 'revoked', revokedAt: new Date().toISOString() }); await batch.commit(); }
