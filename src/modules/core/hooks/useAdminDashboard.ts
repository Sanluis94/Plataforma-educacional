/**
 * useAdminDashboard — Hook para o painel administrativo.
 * Carrega professores reais do Firestore e logs de sistema.
 */
import { useState, useEffect } from 'react';
import type { Teacher } from '../../data/repositories/adminRepository';
import { getAdminData } from '../../data/repositories/adminRepository';
import { calculateGlobalStats, formatLogs } from '../services/adminService';

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'logs'>('overview');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalTeachers: 0,
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { teachers, logs } = await getAdminData();
        setTeachers(teachers);
        setLogs(formatLogs(logs));

        // Estatísticas reais do Firestore
        const globalStats = await calculateGlobalStats(teachers);
        setStats(globalStats);
      } catch (error) {
        console.error('[useAdminDashboard] Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return {
    activeTab,
    setActiveTab,
    teachers,
    logs,
    stats,
    loading,
  };
};
