import { collection, doc, getDocs, limit, query, runTransaction, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { getRepositoryActor } from './repositoryActor';

export const PRIVACY_REQUEST_KINDS = ['access', 'correction', 'deletion', 'portability', 'objection', 'consent-revocation', 'review', 'other'] as const;
export type PrivacyRequestKind = typeof PRIVACY_REQUEST_KINDS[number];
export const PRIVACY_REQUEST_STATUSES = ['received', 'processing', 'completed', 'declined'] as const;
export type PrivacyRequestStatus = typeof PRIVACY_REQUEST_STATUSES[number];
export interface PrivacyRequestEvent { status: Exclude<PrivacyRequestStatus, 'received'>; at: string; by: string; resolution: string }
export interface PrivacyRequest {
  id: string; protocol: string; ownerId: string; kind: PrivacyRequestKind; details: string;
  status: PrivacyRequestStatus; createdAt: string; updatedAt: string; updatedBy: string;
  version: number; resolution: string; history: PrivacyRequestEvent[];
}
export interface CreatePrivacyRequestInput { requestId: string; kind: PrivacyRequestKind; details: string }
export interface UpdatePrivacyRequestInput { requestId: string; status: Exclude<PrivacyRequestStatus, 'received'>; resolution: string; expectedVersion: number }
export const PRIVACY_REQUEST_LIST_LIMIT = 200;
const COLLECTION = 'privacy_requests';
const LOCAL_KEY = 'edu_privacy_requests_v1';
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const time = (value: unknown): string => value instanceof Timestamp ? value.toDate().toISOString() : typeof value === 'string' ? value : '';
function decode(id: string, value: Record<string, unknown>): PrivacyRequest {
  const events = Array.isArray(value.history) ? value.history : value.history && typeof value.history === 'object' ? Object.entries(value.history).sort(([a], [b]) => Number(a) - Number(b)).map(([, event]) => event) : [];
  return { ...value, id, createdAt: time(value.createdAt), updatedAt: time(value.updatedAt), history: events.map(event => ({ ...event, at: time(event.at) })) } as PrivacyRequest;
}
function local(): PrivacyRequest[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); if (!Array.isArray(value)) throw new Error('invalid'); return value as PrivacyRequest[]; }
  catch { throw new Error('Não foi possível consultar os pedidos guardados neste dispositivo. Os registros foram preservados.'); }
}
const saveLocal = (value: PrivacyRequest[]) => { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(value)); } catch { throw new Error('O pedido não foi confirmado neste dispositivo. Mantenha o formulário aberto e tente novamente.'); } };

/** Assign before submitting and keep the identifier when acknowledgement fails. */
export function newPrivacyRequestId(ownerId: string): string {
  if (!ownerId || ownerId.includes('/') || ownerId.includes('__')) throw new Error('Entre novamente antes de registrar o pedido.');
  return `${ownerId}__${crypto.randomUUID()}`;
}
function protocolFor(id: string, ownerId: string): string {
  const parts = id.split('__');
  if (parts.length !== 2 || parts[0] !== ownerId || !uuid.test(parts[1])) throw new Error('O identificador do pedido não pertence à sua conta.');
  return `DP-${parts[1]}`;
}

export async function createPrivacyRequest(input: CreatePrivacyRequestInput): Promise<PrivacyRequest> {
  const actor = await getRepositoryActor();
  const protocol = protocolFor(input.requestId, actor.uid), details = input.details.trim();
  if (!PRIVACY_REQUEST_KINDS.includes(input.kind) || details.length < 10 || details.length > 4000) throw new Error('Escolha o tipo do pedido e descreva a solicitação com 10 a 4.000 caracteres, sem senhas ou documentos.');
  const now = new Date().toISOString();
  const value: PrivacyRequest = { id: input.requestId, protocol, ownerId: actor.uid, kind: input.kind, details, status: 'received', createdAt: now, updatedAt: now, updatedBy: actor.uid, version: 1, resolution: '', history: [] };
  const confirmed = (existing: PrivacyRequest) => {
    if (existing.ownerId !== actor.uid || existing.kind !== value.kind || existing.details !== value.details || existing.protocol !== protocol) throw new Error('Este protocolo já foi registrado com outro conteúdo. Consulte o pedido antes de abrir uma nova solicitação.');
    return existing;
  };
  if (!db) { const values = local(), existing = values.find(entry => entry.id === value.id); if (existing) return confirmed(existing); saveLocal([value, ...values]); return value; }
  const database = db, reference = doc(database, COLLECTION, value.id);
  await runTransaction(database, async transaction => {
    const snapshot = await transaction.get(reference);
    if (snapshot.exists()) { confirmed(decode(snapshot.id, snapshot.data())); return; }
    transaction.set(reference, { ...value, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), history: {} });
  });
  // Read through a transaction so the result has confirmed server timestamps.
  return runTransaction(database, async transaction => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists()) throw new Error('O pedido ainda não pôde ser confirmado. Tente novamente com o mesmo protocolo.');
    return confirmed(decode(snapshot.id, snapshot.data()));
  });
}

export async function getMyPrivacyRequests(): Promise<PrivacyRequest[]> {
  const actor = await getRepositoryActor();
  const values = !db ? local().filter(entry => entry.ownerId === actor.uid).slice(0, PRIVACY_REQUEST_LIST_LIMIT) : (await getDocs(query(collection(db, COLLECTION), where('ownerId', '==', actor.uid), limit(PRIVACY_REQUEST_LIST_LIMIT)))).docs.map(entry => decode(entry.id, entry.data()));
  return values.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function getPrivacyRequestsForAdmin(): Promise<PrivacyRequest[]> {
  const actor = await getRepositoryActor();
  if (actor.role !== 'admin') throw new Error('Somente a administração pode acompanhar pedidos de outras contas.');
  const values = !db ? local().slice(0, PRIVACY_REQUEST_LIST_LIMIT) : (await getDocs(query(collection(db, COLLECTION), limit(PRIVACY_REQUEST_LIST_LIMIT)))).docs.map(entry => decode(entry.id, entry.data()));
  return values.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function updatePrivacyRequest(input: UpdatePrivacyRequestInput): Promise<PrivacyRequest> {
  const actor = await getRepositoryActor();
  if (actor.role !== 'admin') throw new Error('Somente a administração pode registrar o andamento do pedido.');
  const resolution = input.resolution.trim();
  if (!['processing', 'completed', 'declined'].includes(input.status) || resolution.length > 4000 || (input.status !== 'processing' && resolution.length < 10)) throw new Error('Informe a situação e, ao encerrar, uma resposta com 10 a 4.000 caracteres que explique as providências ou os motivos.');
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1 || !input.requestId || input.requestId.includes('/')) throw new Error('Atualize a lista de pedidos antes de registrar a resposta.');
  function changed(previous: PrivacyRequest, at: string): PrivacyRequest {
    if (previous.version !== input.expectedVersion) throw new Error('Este pedido foi atualizado por outra sessão. Recarregue o histórico antes de responder.');
    if (previous.status === 'completed' || previous.status === 'declined') throw new Error('Este pedido já foi encerrado. Seu histórico permanece disponível para consulta.');
    if (previous.status === input.status && previous.resolution === resolution) throw new Error('Nenhuma alteração no andamento foi informada.');
    if (previous.history.length >= 100) throw new Error('O histórico atingiu o limite de registros. Consulte a administração antes de continuar.');
    const event: PrivacyRequestEvent = { status: input.status, resolution, at, by: actor.uid };
    return { ...previous, status: input.status, resolution, updatedAt: at, updatedBy: actor.uid, version: previous.version + 1, history: [...previous.history, event] };
  }
  if (!db) { const values = local(), previous = values.find(entry => entry.id === input.requestId); if (!previous) throw new Error('Pedido não encontrado. Atualize a lista.'); const result = changed(previous, new Date().toISOString()); saveLocal(values.map(entry => entry.id === result.id ? result : entry)); return result; }
  const database = db, reference = doc(database, COLLECTION, input.requestId);
  await runTransaction(database, async transaction => {
    const snapshot = await transaction.get(reference); if (!snapshot.exists()) throw new Error('Pedido não encontrado. Atualize a lista.');
    const previous = decode(snapshot.id, snapshot.data()), result = changed(previous, new Date().toISOString());
    const updatedAt = serverTimestamp();
    transaction.update(reference, { status: result.status, resolution, updatedAt, updatedBy: actor.uid, version: result.version, history: { ...snapshot.data().history, [String(result.version)]: { status: input.status, resolution, at: updatedAt, by: actor.uid } } });
  });
  return runTransaction(database, async transaction => { const snapshot = await transaction.get(reference); if (!snapshot.exists()) throw new Error('A atualização não pôde ser confirmada. Consulte o pedido antes de tentar novamente.'); return decode(snapshot.id, snapshot.data()); });
}
