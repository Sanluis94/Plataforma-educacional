/**
 * useProfessorDashboard — Hook para o painel do professor.
 * Conecta o professor autenticado com suas turmas, atividades e relatórios.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Turma } from '../../data/repositories/classRepository';
import { getProfessorClasses } from '../../data/repositories/classRepository';
import { getActivitiesByProfessor, deleteActivity } from '../../data/repositories/activityRepository';
import { getLiveClassReport, getProfessorLearningOverview } from '../../data/repositories/reportRepository';
import type { LocalClassReport } from '../../data/services/localEtlClient';
import { createNewClass, validateClassName } from '../services/professorService';
import { publishClassActivity } from '../../data/repositories/classPublicationRepository';
import { useAuth } from '../contexts/AuthContext';
import type { ActivityData } from '../../data/types';
import { buildClassLearningReportCSV } from '../../data/services/learningReportExport';

export const useProfessorDashboard = (navigation?: { activeTab: string; classId: string | null }) => {
  const { currentUser, userData } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [activeTab, setActiveTab] = useState<'classes' | 'activityBuilder' | 'reports' | 'activities'>('classes');
  const [storedClassId, setSelectedClassId] = useState<string | null>(null);
  const selectedClassId = navigation
    ? turmas.find(turma => turma.id === navigation.classId)?.id ?? turmas[0]?.id ?? null
    : storedClassId;
  const currentTab = navigation?.activeTab ?? activeTab;
  const [classReport, setClassReport] = useState<LocalClassReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const reportRequest = useRef(0);
  const [builderStep, setBuilderStep] = useState(1);
  const [activityConfig, setActivityConfig] = useState<any>({ type: 'quiz', title: '', module: '', config: {} });
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<{ completionRate: number | null; engagement: number | null }>({ completionRate: null, engagement: null });
  const [statsError, setStatsError] = useState<string | null>(null);
  const [classCreationError, setClassCreationError] = useState<string | null>(null);
  const [creatingClass, setCreatingClass] = useState(false);

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
        if (data.length > 0) {
          setSelectedClassId(prev => prev || data[0].id);
        }
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
    let cancelled = false;
    const loadActivitiesAndStats = async () => {
      if (!currentUser?.uid) return;
      setGlobalStats({ completionRate: null, engagement: null });
      setStatsError(null);
      try {
        const data = await getActivitiesByProfessor(currentUser.uid);
        if (cancelled) return;
        setActivities(data);
        const overview = await getProfessorLearningOverview(turmas.map(turma => turma.id));
        if (cancelled) return;
        setGlobalStats(overview);
      } catch (error) {
        console.error('[useProfessorDashboard] Erro ao carregar atividades/stats:', error);
        if (!cancelled) setStatsError('Não foi possível atualizar os indicadores. Abra o relatório da turma e tente novamente.');
      }
    };
    loadActivitiesAndStats();
    return () => { cancelled = true; };
  }, [currentUser?.uid, turmas]);

  const refreshReport = useCallback(async () => {
    const classId = selectedClassId;
    const request = ++reportRequest.current;
    setReportError(null);
    if (!classId) {
      setClassReport(null);
      setReportLoading(false);
      return;
    }
    setReportLoading(true);
    setClassReport(null);
    try {
      const report = await getLiveClassReport(classId,{force:true});
      if (request === reportRequest.current) {
        setClassReport(report);
        try {
          const overview = await getProfessorLearningOverview(turmas.map(turma => turma.id),report?[report]:[]);
          if (request === reportRequest.current) { setGlobalStats(overview); setStatsError(null); }
        } catch {
          if (request === reportRequest.current) setStatsError('Os indicadores gerais não foram atualizados. O relatório desta turma continua disponível.');
        }
      }
    } catch (error) {
      console.error('[useProfessorDashboard] Erro ao carregar relatório da turma:', error);
      if (request === reportRequest.current) {
        setClassReport(null);
        setReportError('Não foi possível carregar o relatório. Tente atualizar novamente.');
      }
    } finally {
      if (request === reportRequest.current) setReportLoading(false);
    }
  }, [selectedClassId, turmas]);

  const cancelReportRequests = useCallback(() => { reportRequest.current++; }, []);
  useEffect(() => {
    if (currentTab === 'reports') void refreshReport();
    return cancelReportRequests;
  }, [currentTab, refreshReport, cancelReportRequests]);

  // Cria turma vinculada ao professor autenticado
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingClass) return;
    if (!validateClassName(newClassName) || !currentUser?.uid) { setClassCreationError('Preencha o nome da turma para continuar.'); return; }
    setClassCreationError(null); setCreatingClass(true);

    try {
      const novaTurma = await createNewClass(
        newClassName,
        currentUser.uid,
        userData?.name || currentUser.displayName || 'Professor'
      );
      setTurmas(prev => [...prev, novaTurma]);
      setSelectedClassId(novaTurma.id);
      setNewClassName('');
      setIsCreatingClass(false);
      return novaTurma;
    } catch (error) {
      console.error('[useProfessorDashboard] Erro ao criar turma:', error);
      setClassCreationError('Não foi possível confirmar a criação da turma. O nome foi preservado; tente novamente.');
    } finally {
      setCreatingClass(false);
    }
  };

  // Publica atividade no Firestore
  const handlePublishActivity = async (customPayload?: Partial<ActivityData>) => {
    if (!currentUser?.uid) throw new Error('Entre novamente para publicar uma atividade.');
    const payload = customPayload || activityConfig;
    const classId = payload.classId ?? selectedClassId;
    if (!classId || !turmas.some(turma => turma.id === classId)) throw new Error('Selecione uma das suas turmas para publicar.');
    const saved = await publishClassActivity(currentUser.uid, { ...payload, classId, className: turmas.find(turma => turma.id === classId)?.name });
    setActivities(previous => [saved, ...previous.filter(activity => activity.id !== saved.id)]);
    setBuilderStep(1);
    setActivityConfig({ type: 'quiz', title: '', module: '', config: {} });
    return saved;
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

    const blob = new Blob([buildClassLearningReportCSV(classReport)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${classReport.className.replace(/[^\p{L}\p{N}_-]+/gu, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
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
    reportError,
    refreshReport,
    builderStep,
    setBuilderStep,
    activityConfig,
    setActivityConfig,
    handleCreateClass,
    handleViewClassReport,
    publishActivity: handlePublishActivity,
    handleDeleteActivity,
    exportReportCSV,
    globalStats,
    statsError,
    loading,
    classCreationError,
    creatingClass,
  };
};
