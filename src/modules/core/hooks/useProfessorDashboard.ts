/**
 * useProfessorDashboard — Hook para o painel do professor.
 * Conecta o professor autenticado com suas turmas, atividades e relatórios.
 */
import { useState, useEffect, useCallback } from 'react';
import type { Turma } from '../../data/repositories/classRepository';
import { getProfessorClasses } from '../../data/repositories/classRepository';
import { getActivitiesByProfessor, deleteActivity } from '../../data/repositories/activityRepository';
import { getLocalEtlClassReport } from '../../data/services/localEtlClient';
import type { LocalClassReport } from '../../data/services/localEtlClient';
import { createNewClass, validateClassName, publishActivity } from '../services/professorService';
import { useAuth } from '../contexts/AuthContext';
import type { ActivityData } from '../../data/types';

export const useProfessorDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [activeTab, setActiveTab] = useState<'classes' | 'activityBuilder' | 'reports' | 'activities'>('classes');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classReport, setClassReport] = useState<LocalClassReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [builderStep, setBuilderStep] = useState(1);
  const [activityConfig, setActivityConfig] = useState<any>({ type: 'quiz', title: '', module: '', config: {} });
  const [loading, setLoading] = useState(true);

  // Carrega turmas do professor autenticado
  useEffect(() => {
    const loadClasses = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      try {
        const data = await getProfessorClasses(currentUser.uid);
        setTurmas(data);
      } catch (error) {
        console.error('[useProfessorDashboard] Erro ao carregar turmas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, [currentUser?.uid]);

  // Carrega atividades do professor
  useEffect(() => {
    const loadActivities = async () => {
      if (!currentUser?.uid) return;
      try {
        const data = await getActivitiesByProfessor(currentUser.uid);
        setActivities(data);
      } catch (error) {
        console.error('[useProfessorDashboard] Erro ao carregar atividades:', error);
      }
    };
    loadActivities();
  }, [currentUser?.uid]);

  // Carrega relatório quando tab 'reports' está ativa
  useEffect(() => {
    if (activeTab !== 'reports') return;

    const classId = selectedClassId ?? turmas[0]?.id;
    if (!classId) {
      setClassReport(null);
      return;
    }

    if (!selectedClassId) {
      setSelectedClassId(classId);
    }

    const loadReport = async () => {
      setReportLoading(true);
      try {
        const report = await getLocalEtlClassReport(classId);
        setClassReport(report);
      } catch (error) {
        console.error('[useProfessorDashboard] Erro ao carregar relatório da turma:', error);
        setClassReport(null);
      } finally {
        setReportLoading(false);
      }
    };

    loadReport();
  }, [activeTab, selectedClassId, turmas]);

  // Cria turma vinculada ao professor autenticado
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClassName(newClassName) || !currentUser?.uid) return;

    try {
      const novaTurma = await createNewClass(
        newClassName,
        currentUser.uid,
        userData?.name || currentUser.displayName || 'Professor'
      );
      setTurmas(prev => [...prev, novaTurma]);
      setNewClassName('');
      setIsCreatingClass(false);
    } catch (error) {
      console.error('[useProfessorDashboard] Erro ao criar turma:', error);
    }
  };

  // Publica atividade no Firestore
  const handlePublishActivity = async () => {
    if (!currentUser?.uid) return;

    try {
      await publishActivity(
        activityConfig.title || 'Atividade sem título',
        activityConfig.type,
        activityConfig.config || {},
        currentUser.uid
      );
      // Reload activities
      const data = await getActivitiesByProfessor(currentUser.uid);
      setActivities(data);

      setActiveTab('activities');
      setBuilderStep(1);
      setActivityConfig({ type: 'quiz', title: '', module: '', config: {} });
    } catch (error) {
      console.error('[useProfessorDashboard] Erro ao publicar atividade:', error);
    }
  };

  // Deleta atividade
  const handleDeleteActivity = useCallback(async (activityId: string) => {
    if (!activityId || !currentUser?.uid) return;
    try {
      await deleteActivity(activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (error) {
      console.error('[useProfessorDashboard] Erro ao deletar atividade:', error);
    }
  }, [currentUser?.uid]);

  const handleViewClassReport = (classId: string) => {
    setSelectedClassId(classId);
    setActiveTab('reports');
  };

  // Exporta relatório como CSV
  const exportReportCSV = useCallback(() => {
    if (!classReport) return;

    const headers = ['Aluno', 'Nível', 'Média (%)', 'Status'];
    const rows = classReport.students.map(s => [
      s.studentName,
      String(s.level),
      String(s.averageScore),
      s.status === 'precisa_apoio' ? 'Precisa de Apoio' : s.status === 'em_destaque' ? 'Destaque' : 'Regular',
    ]);

    const csvContent = [
      `Relatório: ${classReport.className}`,
      `Professor: ${classReport.professorName}`,
      `Alunos: ${classReport.studentsCount} | Média Geral: ${classReport.averageScore}% | Conclusão: ${classReport.completionRate}%`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${classReport.className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [classReport]);

  return {
    turmas,
    activities,
    isCreatingClass,
    setIsCreatingClass,
    newClassName,
    setNewClassName,
    activeTab,
    setActiveTab,
    selectedClassId,
    setSelectedClassId,
    classReport,
    reportLoading,
    builderStep,
    setBuilderStep,
    activityConfig,
    setActivityConfig,
    handleCreateClass,
    handleViewClassReport,
    publishActivity: handlePublishActivity,
    handleDeleteActivity,
    exportReportCSV,
    loading,
  };
};
