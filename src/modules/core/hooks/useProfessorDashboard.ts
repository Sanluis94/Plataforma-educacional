import { useState, useEffect } from 'react';
import type { Turma } from '../../data/repositories/classRepository';
import { getProfessorClasses } from '../../data/repositories/classRepository';
import { createNewClass, validateClassName } from '../services/professorService';

export const useProfessorDashboard = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [activeTab, setActiveTab] = useState<'classes' | 'activityBuilder' | 'reports'>('classes');
  const [builderStep, setBuilderStep] = useState(1);
  const [activityConfig, setActivityConfig] = useState<any>({ type: 'quiz', title: '', module: '', config: {} });

  useEffect(() => {
    const loadClasses = async () => {
      const data = await getProfessorClasses();
      setTurmas(data);
    };
    loadClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateClassName(newClassName)) return;
    
    const novaTurma = await createNewClass(newClassName);
    setTurmas(prev => [...prev, novaTurma]);
    setNewClassName('');
    setIsCreatingClass(false);
  };

  const publishActivity = () => {
    alert('Atividade salva mock no Firebase!');
    setActiveTab('classes');
    setBuilderStep(1);
  };

  return {
    turmas,
    isCreatingClass,
    setIsCreatingClass,
    newClassName,
    setNewClassName,
    activeTab,
    setActiveTab,
    builderStep,
    setBuilderStep,
    activityConfig,
    setActivityConfig,
    handleCreateClass,
    publishActivity
  };
};
