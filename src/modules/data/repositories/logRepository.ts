/**
 * Log Repository — Persistência de logs de sistema no Firestore.
 * Usado internamente pelos services para registrar ações (login, criação de turma, erros, etc).
 */
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { LogType } from '../types';

const COLLECTION = 'system_logs';

export const writeLog = async (
  type: LogType,
  message: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> => {
  if (!db) {
    console.warn('[LogRepository] Firestore não inicializado. Log ignorado:', message);
    return;
  }

  try {
    await addDoc(collection(db, COLLECTION), {
      timestamp: new Date().toISOString(),
      type,
      message,
      ...(userId && { userId }),
      ...(metadata && { metadata }),
    });
  } catch (error) {
    // Logs nunca devem bloquear a aplicação — falha silenciosa
    console.error('[LogRepository] Erro ao escrever log:', error);
  }
};
