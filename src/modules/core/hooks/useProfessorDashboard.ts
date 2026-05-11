/**
 * useProfessorDashboard — Hook para o painel do professor.
 * Conecta o professor autenticado com suas turmas e atividades no Firestore.
 */
import { useState, useEffect } from 'react';
import type { Turma } from '../../data/repositories/classRepository';
import { getProfessorClasses } from '../../data/repositories/classRepository';
import { getLocalEtlClassReport } from '../../data/services/localEtlClient';
import type { LocalClassReport } from '../../data/services/localEtlClient';
import { createNewClass, validateClassName, publishActivity } from '../services/professorService';
import { useAuth } from '../contexts/AuthContext';

export const useProfessorDashboard = () => {
  const { currentUser, userData } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [activeTab, setActiveTab] = useState<'classes' | 'activityBuilder' | 'reports'>('classes');
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
      setActiveTab('classes');
      setBuilderStep(1);
      setActivityConfig({ type: 'quiz', title: '', module: '', config: {} });
    } catch (error) {
      console.error('[useProfessorDashboard] Erro ao publicar atividade:', error);
    }
  };

  const handleViewClassReport = (classId: string) => {
    setSelectedClassId(classId);
    setActiveTab('reports');
  };

  return {
    turmas,
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
    loading,
  };
};
