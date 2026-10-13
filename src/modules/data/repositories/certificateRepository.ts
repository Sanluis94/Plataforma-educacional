import { collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';

export interface CertificateRequirements { minimumCompleted: number; minScore: number; subject?: string }
export interface CertificateRecord {
  id: string; publicCode: string; studentId: string; studentName: string; classId: string; issuerId: string;
  kind: 'course' | 'lab-record'; title: string; issuerLabel: string; academicLevelLabel?: string;
  issuedAt: string; status: 'active' | 'revoked'; authorizedCourseHours: number | null; observedSeconds: number | null;
  completedItemIds: string[]; evidenceSubmissionIds: string[]; requirements: CertificateRequirements; integrityHash: string;
  revokedAt?: string; revocationReason?: string;
}
export interface PublicCertificate {
  id: string; kind: CertificateRecord['kind']; title: string; issuerLabel: string; issuedAt: string; status: CertificateRecord['status'];
  authorizedCourseHours: number | null; observedSeconds: number | null; completedCount: number; requirementsSummary: string; integrityHash: string; revokedAt?: string;
}

const RECORDS = 'certificate_records';
const PUBLIC = 'certificate_public';
const LOCAL_KEY = 'kortex_certificate_records_v2';
const PUBLIC_LOCAL_KEY = 'kortex_certificate_public_v1';
function localRecords(): CertificateRecord[] {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  const records = JSON.parse(raw);
  if (!Array.isArray(records)) throw new Error('Não foi possível ler os comprovantes deste dispositivo.');
  return records;
}
export function publicCertificateOf(record: CertificateRecord): PublicCertificate {
  return { id: record.id, kind: record.kind, title: record.title, issuerLabel: record.issuerLabel, issuedAt: record.issuedAt, status: record.status,
    authorizedCourseHours: record.authorizedCourseHours, observedSeconds: record.observedSeconds, completedCount: record.completedItemIds.length,
    requirementsSummary: `${record.requirements.minimumCompleted} atividades com correção automática e pelo menos ${record.requirements.minScore}% de aproveitamento${record.requirements.subject ? ` em ${record.requirements.subject}` : ''}.`,
    integrityHash: record.integrityHash, ...(record.revokedAt ? { revokedAt: record.revokedAt } : {}),
  };
}
function saveLocalPublicRecord(record: CertificateRecord): void {
  const records = JSON.parse(localStorage.getItem(PUBLIC_LOCAL_KEY) ?? '[]') as PublicCertificate[];
  if (!Array.isArray(records)) throw new Error('Não foi possível ler os registros públicos deste dispositivo.');
  localStorage.setItem(PUBLIC_LOCAL_KEY, JSON.stringify([publicCertificateOf(record), ...records.filter(entry => entry.id !== record.id)]));
}
export async function saveCertificateRecord(record: CertificateRecord): Promise<CertificateRecord> {
  if (!db) {
    const records = localRecords();
    if (records.some(existing => existing.id === record.id)) throw new Error('Este comprovante já foi registrado.');
    saveLocalPublicRecord(record);
    localStorage.setItem(LOCAL_KEY, JSON.stringify([record, ...records]));
    return record;
  }
  const batch = writeBatch(db);
  batch.set(doc(db, RECORDS, record.id), record);
  batch.set(doc(db, PUBLIC, record.id), publicCertificateOf(record));
  await batch.commit();
  return record;
}
export async function getCertificateRecordsByStudent(studentId: string, classId?:string): Promise<CertificateRecord[]> {
  const records = !db ? localRecords().filter(record => record.studentId === studentId && (classId===undefined||record.classId===classId)) : (await getDocs(query(collection(db, RECORDS), where('studentId', '==', studentId), ...(classId===undefined?[]:[where('classId','==',classId)])))).docs.map(snapshot => ({ ...snapshot.data(), id: snapshot.id }) as CertificateRecord);
  return records.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}
export async function getPrivateCertificateRecord(id: string): Promise<CertificateRecord | null> {
  if (!db) return localRecords().find(record => record.id === id) ?? null;
  const snapshot = await getDoc(doc(db, RECORDS, id));
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as CertificateRecord : null;
}
export async function getPublicCertificate(id: string): Promise<PublicCertificate | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  if (!db) {
    const publicRecords = JSON.parse(localStorage.getItem(PUBLIC_LOCAL_KEY) ?? '[]') as PublicCertificate[];
    const published = publicRecords.find(entry => entry.id === id);
    if (published) return published;
    const legacy = localRecords().find(entry => entry.publicCode === id);
    return legacy ? publicCertificateOf(legacy) : null;
  }
  const snapshot = await getDoc(doc(db, PUBLIC, id));
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as PublicCertificate : null;
}
export async function revokeCertificateRecord(id: string, reason: string): Promise<void> {
  const record = await getPrivateCertificateRecord(id);
  if (!record) throw new Error('Comprovante não encontrado.');
  const revoked = { ...record, status: 'revoked' as const, revokedAt: new Date().toISOString(), revocationReason: reason };
  if (!db) { saveLocalPublicRecord(revoked); localStorage.setItem(LOCAL_KEY, JSON.stringify(localRecords().map(entry => entry.id === id ? revoked : entry))); return; }
  const batch = writeBatch(db);
  batch.update(doc(db, RECORDS, id), { status: revoked.status, revokedAt: revoked.revokedAt, revocationReason: reason });
  batch.update(doc(db, PUBLIC, id), { status: revoked.status, revokedAt: revoked.revokedAt });
  await batch.commit();
}
