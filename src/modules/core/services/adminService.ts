import type { Teacher, LogEntry } from '../../data/repositories/adminRepository';

export const calculateGlobalStats = (teachers: Teacher[]) => {
  const totalStudents = teachers.reduce((s, t) => s + t.students, 0);
  const totalClasses = teachers.reduce((s, t) => s + t.classes, 0);
  
  return {
    totalStudents,
    totalClasses,
    totalTeachers: teachers.length,
    iaInteractions: 247, // Mock
  };
};

export const formatLogs = (logs: LogEntry[]) => {
  return logs.map(log => ({
    ...log,
    typeLabel: log.type.toUpperCase()
  }));
};
