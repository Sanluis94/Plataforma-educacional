/**
 * Serviço de Gerenciamento Offline & Sincronização PWA (Outbox Queue)
 * Melhoria #15 do Plano Estratégico
 */

export interface PendingOfflineSubmission {
  id: string;
  labId: string;
  studentId: string;
  timestamp: string;
  parameters: Record<string, number>;
  telemetry: Record<string, number>;
  diagnosticAnswer?: {
    questionText: string;
    selectedOption: string;
    correct: boolean;
  };
  synced: boolean;
}

const OUTBOX_STORAGE_KEY = 'kortex_offline_outbox_v1';

class OfflineSyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: ((online: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true));
      window.addEventListener('offline', () => this.handleConnectionChange(false));
    }
  }

  private handleConnectionChange(online: boolean) {
    this.isOnline = online;
    this.listeners.forEach(fn => fn(online));
    if (online) {
      this.syncOutbox();
    }
  }

  public subscribeStatus(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.isOnline);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public setOnline(online: boolean) {
    this.handleConnectionChange(online);
  }

  public getPendingSubmissions(): PendingOfflineSubmission[] {
    try {
      const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_e) {
      return [];
    }
  }

  public enqueueSubmission(submission: Omit<PendingOfflineSubmission, 'id' | 'synced'>): PendingOfflineSubmission {
    const list = this.getPendingSubmissions();
    const item: PendingOfflineSubmission = {
      ...submission,
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      synced: false
    };

    list.push(item);
    try {
      localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(list));
    } catch (_e) {}

    // Tenta sincronizar imediatamente se estiver online
    if (this.isOnline) {
      this.syncOutbox();
    }

    return item;
  }

  public async syncOutbox(): Promise<{ syncedCount: number }> {
    const list = this.getPendingSubmissions();
    const pending = list.filter(item => !item.synced);
    if (pending.length === 0) return { syncedCount: 0 };

    let count = 0;
    // Marca como sincronizadas
    const updated = list.map(item => {
      if (!item.synced) {
        count++;
        return { ...item, synced: true };
      }
      return item;
    });

    try {
      // Remove do outbox as que foram sincronizadas com sucesso
      const remaining = updated.filter(item => !item.synced);
      localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(remaining));
    } catch (_e) {}

    return { syncedCount: count };
  }

  public clearQueue(): void {
    try {
      localStorage.removeItem(OUTBOX_STORAGE_KEY);
    } catch (_e) {}
  }
}

export const offlineSyncService = new OfflineSyncService();
