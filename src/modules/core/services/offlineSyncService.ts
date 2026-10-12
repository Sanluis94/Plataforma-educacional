import type { ExamAttempt, SubmissionData } from '../../data/types';
import { learningDocumentId } from '../../data/services/learningCapture';

export type LearningDelivery = {
  studentId: string;
  rewardId?: string;
} & ({ kind: 'submission'; submission: Omit<SubmissionData, 'id'> } | { kind: 'exam'; examAttempt: Omit<ExamAttempt, 'id'> });

export type PendingOfflineSubmission = LearningDelivery & { id: string; synced: false; timestamp: string; error?: string };
const OUTBOX_STORAGE_KEY = 'kortex_offline_outbox_v2';

export class OfflineSyncService {
  private isOnline = typeof navigator === 'undefined' || navigator.onLine;
  private currentStudentId: string | null = null;
  private listeners: ((online: boolean) => void)[] = [];
  private syncing: Promise<{ syncedCount: number }> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
    }
  }

  private notify() { this.listeners.forEach(listener => listener(this.isOnline)); }
  subscribeStatus(listener: (online: boolean) => void) {
    this.listeners.push(listener);
    listener(this.isOnline);
    return () => { this.listeners = this.listeners.filter(item => item !== listener); };
  }
  getIsOnline() { return this.isOnline; }
  hasLegacyUnassignedRecords(): boolean {
    const raw = localStorage.getItem('kortex_offline_outbox_v1');
    if (!raw) return false;
    try { const value = JSON.parse(raw); return !Array.isArray(value) || value.length > 0; }
    catch { return true; }
  }
  setOnline(online: boolean) { this.isOnline = online; this.notify(); if (online) void this.syncOutbox().catch(() => this.notify()); }
  setCurrentStudent(studentId: string | null) {
    if (this.currentStudentId === studentId) return;
    this.currentStudentId = studentId;
    this.notify();
    if (studentId && this.isOnline) void this.syncOutbox().catch(() => this.notify());
  }

  getPendingSubmissions(studentId = this.currentStudentId): PendingOfflineSubmission[] {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    if (!raw) return [];
    let list: PendingOfflineSubmission[];
    try { list = JSON.parse(raw); } catch { throw new Error('A fila de entregas não pôde ser lida. Seus registros foram preservados.'); }
    if (!Array.isArray(list)) throw new Error('A fila de entregas está inválida. Seus registros foram preservados.');
    return studentId ? list.filter(item => item.studentId === studentId) : [];
  }

  private allPending(): PendingOfflineSubmission[] {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) throw new Error('Não foi possível ler a fila de entregas.');
    return list;
  }

  enqueueSubmission(delivery: LearningDelivery): PendingOfflineSubmission {
    const payload = delivery.kind === 'submission' ? delivery.submission : delivery.examAttempt;
    const actor = delivery.kind === 'submission' ? delivery.submission.studentId : delivery.examAttempt.alunoId;
    if (!delivery.studentId || actor !== delivery.studentId || !payload.evidence?.sessionId) throw new Error('Entrega sem aluno ou tentativa válida.');
    const scope = delivery.kind === 'submission' ? `${delivery.submission.classId}-${payload.evidence.stage ?? 'assessment'}` : delivery.examAttempt.turmaId;
    const id = learningDocumentId(delivery.studentId, payload.evidence.sessionId, `${delivery.kind}-${scope}`);
    const list = this.allPending();
    const existing = list.find(item => item.id === id);
    if (existing) return existing;
    const item: PendingOfflineSubmission = { ...delivery, id, synced: false, timestamp: new Date().toISOString() };
    list.push(item);
    try { localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(list)); }
    catch { throw new Error('Não foi possível guardar a entrega neste dispositivo. Mantenha a atividade aberta e tente novamente.'); }
    this.notify();
    return item;
  }

  async deliver(delivery: LearningDelivery): Promise<{ queued: boolean }> {
    if (this.currentStudentId && this.currentStudentId !== delivery.studentId) throw new Error('O perfil mudou durante a entrega. Entre com o perfil que realizou a atividade para tentar novamente.');
    if (!this.currentStudentId) this.setCurrentStudent(delivery.studentId);
    const item = this.enqueueSubmission(delivery);
    if (this.isOnline) await this.syncOutbox();
    return { queued: this.getPendingSubmissions(delivery.studentId).some(entry => entry.id === item.id) };
  }

  async syncOutbox(): Promise<{ syncedCount: number }> {
    if (this.syncing) { await this.syncing; return this.syncOutbox(); }
    if (!this.isOnline || !this.currentStudentId) return { syncedCount: 0 };
    const studentId = this.currentStudentId;
    const operation = (async () => {
      let syncedCount = 0;
      for (const item of this.getPendingSubmissions(studentId)) {
        if (this.currentStudentId !== studentId || !this.isOnline) break;
        try {
          const write = async () => {
            if (item.kind === 'submission') {
              const { saveSubmission } = await import('../../data/repositories/submissionRepository');
              if (this.currentStudentId !== studentId) throw new Error('Perfil alterado; entrega preservada para a conta original.');
              await saveSubmission(item.submission);
            } else {
              const { saveExamAttempt } = await import('../../data/repositories/examRepository');
              if (this.currentStudentId !== studentId) throw new Error('Perfil alterado; entrega preservada para a conta original.');
              await saveExamAttempt(item.examAttempt);
            }
            if (item.rewardId) {
              const score = item.kind === 'submission' ? item.submission.score : item.examAttempt.porcentagemAproveitamento;
              const { completeStudentLabProgress } = await import('../../data/repositories/studentRepository');
              if (this.currentStudentId !== studentId) throw new Error('Perfil alterado; recompensa aguardando confirmação na conta original.');
              await completeStudentLabProgress(studentId, item.rewardId, score);
            }
          };
          let timeout: ReturnType<typeof setTimeout> | undefined;
          try {
            await Promise.race([write(), new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('A confirmação da entrega demorou. Vamos tentar novamente.')), 12_000); })]);
          } finally { clearTimeout(timeout); }
          localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(this.allPending().filter(entry => entry.id !== item.id)));
          syncedCount++;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Entrega ainda não confirmada.';
          const list = this.allPending().map(entry => entry.id === item.id ? { ...entry, error: message } : entry);
          localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(list));
        }
        this.notify();
      }
      return { syncedCount };
    })();
    this.syncing = operation;
    try { return await operation; } finally { this.syncing = null; this.notify(); }
  }
}

export const offlineSyncService = new OfflineSyncService();
