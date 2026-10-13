/**
 * useAdminDashboard — Hook para o painel administrativo.
 * Carrega professores reais do Firestore e logs de sistema.
 */
import { useState, useEffect,useCallback } from 'react';
import type { Teacher,LogEntry } from '../../data/repositories/adminRepository';
import { getAdminData } from '../../data/repositories/adminRepository';
import { calculateGlobalStats, formatLogs } from '../services/adminService';

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'logs'>('overview');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [logs, setLogs] = useState<(LogEntry&{typeLabel:string})[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalTeachers: 0,
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error,setError]=useState('');
  const [refresh,setRefresh]=useState(0);
  const reload=useCallback(()=>setRefresh(value=>value+1),[]);

  useEffect(() => {
    let active=true;
    const loadData = async () => {
      setLoading(true);setError('');
      try {
        const [{ teachers, logs },globalStats] = await Promise.all([getAdminData(),calculateGlobalStats()]);
        if(!active)return;
        setTeachers(teachers);
        setLogs(formatLogs(logs));

        // Estatísticas reais do Firestore
        setStats(globalStats);
      } catch (error) {
        console.error('[useAdminDashboard] Erro ao carregar dados:', error);
        if(active)setError('Não foi possível consultar os dados administrativos. Tente atualizar novamente.');
      } finally {
        if(active)setLoading(false);
      }
    };
    loadData();
    return()=>{active=false;};
  }, [refresh]);

  return {
    activeTab,
    setActiveTab,
    teachers,
    logs,
    stats,
    loading,
    error,reload,
  };
};
