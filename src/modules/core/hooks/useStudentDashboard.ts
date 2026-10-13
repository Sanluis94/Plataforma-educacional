/**
 * useStudentDashboard — Hook para o painel do estudante.
 * Conecta o estudante autenticado com seu progresso real no Firestore.
 * Gerencia gamificação (XP, nível, moedas, loja), conquistas dinâmicas e IA adaptativa.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SHOP_ITEMS } from '../constants/dashboardConstants';
import { normalizeLearningLevel, type LearningLevel } from '../constants/learningLevels';
import { searchLearningLabs, type LearningLab } from '../constants/learningCatalog';
import { processItemPurchase } from '../services/studentService';
import { buildStudentStudySuggestion, type StudentStudySuggestion } from '../services/studentStudyGuidance';
import { getSubmissionsByStudent } from '../../data/repositories/submissionRepository';
import { getActivitiesByClass } from '../../data/repositories/activityRepository';
import { getStudentProgress } from '../../data/repositories/studentRepository';
import { getStudentClasses, subscribeStudentClasses, enrollStudent } from '../../data/repositories/classRepository';
import { offlineSyncService } from '../services/offlineSyncService';
import type { LearningEvidence } from '../../data/learningAnalyticsTypes';
import { ActiveLearningCapture } from '../../data/services/learningCapture';
import type { Turma } from '../../data/repositories/classRepository';
import { evaluateAchievements } from '../services/achievementService';
import type { Achievement } from '../services/achievementService';
import type { ActivityData, ProgressData } from '../../data/types';
import SoundEffects from '../services/soundEffects';
import { useStudentLabCompletion } from './useStudentLabCompletion';
import type { CompletedLearningLab } from '../services/studentLabService';

export const useStudentDashboard = (requestedLevel?: LearningLevel) => {
  const { currentUser, userData } = useAuth();
  const gradeLevel = normalizeLearningLevel(requestedLevel, normalizeLearningLevel(userData?.gradeLevel));
  const uid = currentUser?.uid;
  const { completeLab } = useStudentLabCompletion();

  const [progress, setProgress] = useState({ level: 1, xp: 0, coins: 0 });
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [aiTip, setAiTip] = useState<StudentStudySuggestion | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeLab, setActiveLab] = useState<{id: string, title: string, component: any, props: any} | null>(null);
  const [activeView, setActiveView] = useState<'learning' | 'shop' | 'achievements' | 'classes' | 'leaderboard'>('learning');
  const [shopItems, setShopItems] = useState(SHOP_ITEMS);
  const [studentClasses, setStudentClasses] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressError,setProgressError]=useState('');
  const [progressRefresh,setProgressRefresh]=useState(0);
  const reloadProgress=useCallback(()=>setProgressRefresh(value=>value+1),[]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState('');
  const [purchaseBusy,setPurchaseBusy]=useState(false);
  const purchaseInFlight=useRef(false);
  const [purchaseError,setPurchaseError]=useState('');
  const [purchaseNotice,setPurchaseNotice]=useState('');
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const prevProgressRef = useRef<ProgressData | null>(null);
  const [labSaveError, setLabSaveError] = useState(false);
  const [labSaving, setLabSaving] = useState(false);
  const [labPending, setLabPending] = useState(false);
  const retryLabRef = useRef<{ lab: CompletedLearningLab; score: number; evidence: LearningEvidence } | null>(null);

  const handleLabComplete = useCallback(async (lab: CompletedLearningLab, score: number, evidence: LearningEvidence) => {
    setLabSaving(true);
    setLabSaveError(false);
    try {
      const result = await completeLab(lab, score, evidence);
      setLabPending(result?.queued ?? false);
      if (result?.progress) {
        setProgress({ level: result.progress.level, xp: result.progress.xp, coins: result.progress.coins });
        setCompletedModules(result.progress.completedModules);
        setPurchasedItems(result.progress.purchasedItems);
      }
      retryLabRef.current = null;
      return result !== null;
    } catch {
      retryLabRef.current = { lab, score, evidence };
      setLabSaveError(true);
      return false;
    } finally {
      setLabSaving(false);
    }
  }, [completeLab]);

  const retryLabCompletion = useCallback(() => {
    const pending = retryLabRef.current;
    if (pending) return handleLabComplete(pending.lab, pending.score, pending.evidence);
  }, [handleLabComplete]);

  // Full progress data for achievement evaluation
  const fullProgress: ProgressData = useMemo(() => ({
    level: progress.level,
    xp: progress.xp,
    coins: progress.coins,
    completedModules,
    purchasedItems,
    updatedAt: new Date().toISOString(),
  }), [progress, completedModules, purchasedItems]);

  // Evaluate achievements dynamically
  const achievements = useMemo(() => evaluateAchievements(fullProgress), [fullProgress]);

  // Detect new achievements and show toast
  useEffect(() => {
    if (!prevProgressRef.current) {
      prevProgressRef.current = fullProgress;
      return;
    }

    const prevAchievements = evaluateAchievements(prevProgressRef.current);
    const newlyUnlocked = achievements.filter(
      (curr, i) => curr.unlocked && !prevAchievements[i]?.unlocked
    );

    if (newlyUnlocked.length > 0) {
      setAchievementToast(newlyUnlocked[0]);
      SoundEffects.playUnlock();
      setTimeout(() => setAchievementToast(null), 4000);
    }

    prevProgressRef.current = fullProgress;
  }, [achievements, fullProgress]);

  // Módulos filtrados por nível de ensino
  const modules = useMemo(() => {
    const grouped = new Map<string, { id: string; label: string; labs: LearningLab[] }>();
    for (const lab of searchLearningLabs({ academicLevel: gradeLevel })) {
      const module = grouped.get(lab.subject) || { id: lab.subject, label: lab.subject, labs: [] };
      module.labs.push(lab);
      grouped.set(lab.subject, module);
    }
    return [...grouped.values()];
  }, [gradeLevel]);

  const refreshProgress=useCallback(async()=>{
    if(!uid)return;
    const data=await getStudentProgress(uid);
    setProgress({level:data.level,xp:data.xp,coins:data.coins});
    setCompletedModules(data.completedModules??[]);
  },[uid]);

  // Carrega progresso real do Firestore
  useEffect(() => {
    let active=true;
    const loadProgress = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);setProgressError('');
        const data = await getStudentProgress(uid);
        if(!active)return;
        setProgress({ level: data.level, xp: data.xp, coins: data.coins });
        setCompletedModules(data.completedModules || []);
        setPurchasedItems(data.purchasedItems || []);

        // Initialize prevProgressRef with loaded data
        prevProgressRef.current = data;

        // Marcar itens já comprados na loja
        if (data.purchasedItems && data.purchasedItems.length > 0) {
          setShopItems(prev =>
            prev.map(item => ({
              ...item,
              owned: data.purchasedItems.includes(item.id),
            }))
          );
        }
      } catch (error) {
        console.error('[useStudentDashboard] Erro ao carregar progresso:', error);
        if(active)setProgressError('Não foi possível consultar seu progresso. Tente atualizar novamente.');
      } finally {
        if(active)setLoading(false);
      }
    };

    loadProgress();
    return()=>{active=false;};
  }, [uid,progressRefresh]);

  useEffect(() => {
    let active = true;
    setStudentClasses([]); setClassesError(''); setClassesLoading(Boolean(uid));
    if (!uid) return () => { active = false; };
    const unsubscribe = subscribeStudentClasses(uid, classes => {
      if (!active) return;
      setStudentClasses(classes); setClassesError(''); setClassesLoading(false);
    }, () => {
      if (!active) return;
      setStudentClasses([]); setClassesLoading(false); setClassesError('Não foi possível atualizar suas turmas. Recarregue a página para confirmar sua matrícula.');
    });
    return () => { active = false; unsubscribe(); };
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const unsubscribe = offlineSyncService.subscribeStatus(() => {
      try {
        if (offlineSyncService.getPendingSubmissions(uid).length > 0) return;
        setLabPending(false);
        void getStudentProgress(uid).then(data => {
          if (cancelled) return;
          setProgress({ level: data.level, xp: data.xp, coins: data.coins });
          setCompletedModules(data.completedModules ?? []);
        }).catch(() => undefined);
      } catch { /* The delivery UI keeps the queue error visible. */ }
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [uid]);

  // Suggestions are grounded in actual assigned activities and question evidence.
  useEffect(() => {
    if (loading || classesLoading || !uid) return;
    let active = true;
    async function fetchTip() {
      try {
        const [submissions, activities] = await Promise.all([getSubmissionsByStudent(uid!), Promise.all(studentClasses.map(item => getActivitiesByClass(item.id)))]);
        if (active) setAiTip(buildStudentStudySuggestion({ classIds: studentClasses.map(item => item.id), activities: activities.flat(), submissions, level: gradeLevel }));
      } catch { if (active) setAiTip({ title: 'Sua turma é o próximo passo', message: 'Não foi possível consultar suas respostas para sugerir uma revisão. As atividades e materiais da turma continuam disponíveis.', href: '/estudante?tab=activities', actionLabel: 'Ver atividades da turma', evidenceCount: 0 }); }
    }
    void fetchTip();
    return () => { active = false; };
  }, [gradeLevel, completedModules, studentClasses, loading, classesLoading, uid]);

  // Completa módulo — salva no Firestore
  const handleModuleComplete = useCallback(async (score: number) => {
    if (!uid || !activeSubject || !activeLab) return;

    return handleLabComplete(activeLab, score, new ActiveLearningCapture().evidence('lab', { labId: activeLab.id, stage: 'exploration' }));
  }, [uid, activeSubject, activeLab, handleLabComplete]);

  // Compra item na loja — salva no Firestore
  const buyItem = useCallback(async (itemId: string) => {
    if (!uid||purchaseInFlight.current) return;
    purchaseInFlight.current=true;setPurchaseBusy(true);setPurchaseError('');setPurchaseNotice('');

    try {
      const result = await processItemPurchase(uid, itemId, progress.coins, shopItems);
      if (result) {
        SoundEffects.playCoin();
        setProgress(prev => ({ ...prev, coins: result.newCoins }));
        setShopItems(result.newItems);
        setPurchasedItems(result.purchasedItems);
        setPurchaseNotice('Item adquirido e aplicado ao seu perfil.');
      }
    } catch (error) {
      console.error('[useStudentDashboard] Erro ao comprar item:', error);
      setPurchaseError(error instanceof Error?error.message:'Não foi possível adquirir o item. Tente novamente.');
    } finally {
      purchaseInFlight.current=false;setPurchaseBusy(false);
    }
  }, [uid, progress.coins, shopItems]);

  // Join a class
  const joinClass = useCallback(async (classCode: string) => {
    if (!uid || !classCode.trim()) return null;
    try {
      const enrolledId = await enrollStudent(classCode.trim(), uid);
      const classes = await getStudentClasses(uid);
      setStudentClasses(classes);
      const joined = classes.find(item => typeof enrolledId === 'string' ? item.id === enrolledId : item.id === classCode.trim() || item.code?.toUpperCase() === classCode.trim().toUpperCase());
      return joined ? { classId: joined.id, name: joined.name } : null;
    } catch (error) {
      console.error('[useStudentDashboard] Erro ao entrar na turma:', error);
      return null;
    }
  }, [uid]);

  // Submit custom teacher activity
  const handleActivitySubmit = useCallback(async (activity: ActivityData, score: number, evidence: LearningEvidence) => {
    if (!uid || !activity.id || !activity.classId || !studentClasses.some(item => item.id === activity.classId) || activity.status !== 'published') throw new Error('Atividade ou turma indisponível para este perfil.');
    const assessed = Boolean(evidence.questions?.length);
    const result = await offlineSyncService.deliver({
      kind: 'submission', studentId: uid, ...(assessed ? { rewardId: `activity:${activity.id}` } : {}),
      submission: { activityId: activity.id, activityTitle: activity.title, classId: activity.classId, studentId: uid, studentName: userData?.name ?? currentUser?.displayName ?? 'Estudante',
        score, submittedAt: new Date().toISOString(), status: 'completed', evidence,
        answers: { questions: evidence.questions ?? [], reflection: evidence.reflection ?? '' },
      },
    });
    if (!result.queued) {
      const updated = await getStudentProgress(uid);
      setProgress({ level: updated.level, xp: updated.xp, coins: updated.coins });
      setCompletedModules(updated.completedModules);
    }
    return result;
  }, [uid, studentClasses, currentUser?.displayName, userData?.name]);

  return {
    refreshProgress,
    purchasedItems,purchaseBusy,purchaseError,purchaseNotice,
    progress,
    aiTip,
    activeSubject, setActiveSubject,
    activeLab, setActiveLab,
    activeView, setActiveView,
    shopItems,
    modules,
    handleModuleComplete,
    handleActivitySubmit,
    handleLabComplete, labSaveError, labSaving, labPending, retryLabCompletion,
    buyItem,
    gradeLevel,
    loading,
    progressError,reloadProgress,
    classesLoading, classesError,
    achievements,
    achievementToast,
    completedModules,
    studentClasses,
    joinClass,
  };
};
