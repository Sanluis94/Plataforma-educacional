/**
 * useStudentDashboard — Hook para o painel do estudante.
 * Conecta o estudante autenticado com seu progresso real no Firestore.
 * Gerencia gamificação (XP, nível, moedas, loja), conquistas dinâmicas e IA adaptativa.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MODULES_BY_GRADE, ALL_MODULES, SHOP_ITEMS } from '../constants/dashboardConstants';
import { getAIRecommendation, processModuleCompletion, processItemPurchase } from '../services/studentService';
import { getStudentProgress } from '../../data/repositories/studentRepository';
import { evaluateAchievements } from '../services/achievementService';
import type { Achievement } from '../services/achievementService';
import type { ProgressData } from '../../data/types';
import { DEFAULT_PROGRESS } from '../../data/types';

export const useStudentDashboard = () => {
  const { currentUser, userData } = useAuth();
  const gradeLevel = userData?.gradeLevel || 'medio';
  const uid = currentUser?.uid;

  const [progress, setProgress] = useState({ level: 1, xp: 0, coins: 0 });
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [aiTip, setAiTip] = useState('Analisando seu progresso educacional...');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'learning' | 'shop' | 'achievements'>('learning');
  const [shopItems, setShopItems] = useState(SHOP_ITEMS);
  const [loading, setLoading] = useState(true);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const prevProgressRef = useRef<ProgressData | null>(null);

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
      setTimeout(() => setAchievementToast(null), 4000);
    }

    prevProgressRef.current = fullProgress;
  }, [achievements, fullProgress]);

  // Módulos filtrados por nível de ensino
  const modules = useMemo(() => {
    const allowed = MODULES_BY_GRADE[gradeLevel] || [];
    return ALL_MODULES.filter(m => allowed.includes(m.id));
  }, [gradeLevel]);

  // Carrega progresso real do Firestore
  useEffect(() => {
    const loadProgress = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const data = await getStudentProgress(uid);
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
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [uid]);

  // Busca recomendação da IA adaptativa
  useEffect(() => {
    async function fetchTip() {
      const tip = await getAIRecommendation({
        level: progress.level,
        xp: progress.xp,
        recentModules: activeSubject ? [activeSubject] : [],
        weaknesses: progress.level < 5 ? ['fundamentos'] : [],
      });
      setAiTip(tip);
    }
    fetchTip();
  }, [progress.level, progress.xp, activeSubject]);

  // Completa módulo — salva no Firestore
  const handleModuleComplete = useCallback(async (score: number) => {
    if (!uid || !activeSubject) return;

    try {
      const updated = await processModuleCompletion(
        uid,
        activeSubject,
        score,
        progress.xp,
        progress.level,
        progress.coins
      );
      setProgress(updated);
      setCompletedModules(prev => prev.includes(activeSubject) ? prev : [...prev, activeSubject]);
      setActiveSubject(null);
    } catch (error) {
      console.error('[useStudentDashboard] Erro ao completar módulo:', error);
    }
  }, [uid, activeSubject, progress]);

  // Compra item na loja — salva no Firestore
  const buyItem = useCallback(async (itemId: string) => {
    if (!uid) return;

    try {
      const result = await processItemPurchase(uid, itemId, progress.coins, shopItems);
      if (result) {
        setProgress(prev => ({ ...prev, coins: result.newCoins }));
        setShopItems(result.newItems);
        setPurchasedItems(prev => prev.includes(itemId) ? prev : [...prev, itemId]);
      }
    } catch (error) {
      console.error('[useStudentDashboard] Erro ao comprar item:', error);
    }
  }, [uid, progress.coins, shopItems]);

  return {
    progress,
    aiTip,
    activeSubject,
    setActiveSubject,
    activeView,
    setActiveView,
    shopItems,
    modules,
    handleModuleComplete,
    buyItem,
    gradeLevel,
    loading,
    achievements,
    achievementToast,
    completedModules,
  };
};
