/**
 * Admin Service — Lógica de negócio para o painel administrativo.
 * Calcula estatísticas globais da plataforma a partir de dados reais do Firestore.
 */
import type { Teacher, LogEntry } from '../../data/repositories/adminRepository';
import { getGlobalStats } from '../../data/repositories/adminRepository';

/**
 * Calcula estatísticas globais.
 * Se der erro no Firestore, calcula a partir dos dados de teachers já carregados (fallback).
 */
export const calculateGlobalStats = async (teachersFallback?: Teacher[]) => {
  try {
    const stats = await getGlobalStats();
    return {
      totalStudents: stats.totalStudents,
      totalClasses: stats.totalClasses,
      totalTeachers: stats.totalTeachers,
      totalActivities: stats.totalActivities,
    };
  } catch {
    // Fallback com dados locais
    if (teachersFallback) {
      const totalStudents = teachersFallback.reduce((s, t) => s + t.students, 0);
      const totalClasses = teachersFallback.reduce((s, t) => s + t.classes, 0);
      return {
        totalStudents,
        totalClasses,
        totalTeachers: teachersFallback.length,
        totalActivities: 0,
      };
    }
    return { totalStudents: 0, totalClasses: 0, totalTeachers: 0, totalActivities: 0 };
  }
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
