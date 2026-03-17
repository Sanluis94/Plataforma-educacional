import { useState, useEffect } from 'react';
import type { Teacher } from '../../data/repositories/adminRepository';
import { getAdminData } from '../../data/repositories/adminRepository';
import { calculateGlobalStats, formatLogs } from '../services/adminService';

export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'logs'>('overview');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalClasses: 0, totalTeachers: 0, iaInteractions: 0 });

  useEffect(() => {
    const loadData = async () => {
      const { teachers, logs } = await getAdminData();
      setTeachers(teachers);
      setLogs(formatLogs(logs));
      setStats(calculateGlobalStats(teachers));
    };
    loadData();
  }, []);

  return {
    activeTab,
    setActiveTab,
    teachers,
    logs,
    stats
  };
};
