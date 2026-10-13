/**
 * Admin Service — Lógica de negócio para o painel administrativo.
 * Calcula estatísticas globais da plataforma a partir de dados reais do Firestore.
 */
import type { Teacher, LogEntry } from '../../data/repositories/adminRepository';
import { getGlobalStats } from '../../data/repositories/adminRepository';

/**
 * Calcula estatísticas globais.
 * Uma falha de consulta é propagada; não cria contagens substitutas.
 */
export const calculateGlobalStats = async (teachersFallback?: Teacher[]) => {
  void teachersFallback;
  return getGlobalStats();
};

/**
 * Formata entries de log para exibição na UI.
 */
export const formatLogs = (logs: LogEntry[]) => {
  return logs.map(log => ({
    ...log,
    typeLabel: log.type.toUpperCase()
  }));
};
