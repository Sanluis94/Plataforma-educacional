import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MODULES_BY_GRADE, ALL_MODULES } from '../constants/dashboardConstants';
import { getAIRecommendation, processModuleCompletion, processItemPurchase } from '../services/studentService';
import { SHOP_ITEMS } from '../constants/dashboardConstants';
import { getStudentProgress } from '../../data/repositories/studentRepository';

export const useStudentDashboard = () => {
  const { userData } = useAuth();
  const gradeLevel = userData?.gradeLevel || 'medio';

  const [progress, setProgress] = useState({ level: 5, xp: 1250, coins: 450 });
  const [aiTip, setAiTip] = useState('Analisando seu progresso educacional...');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'learning' | 'shop' | 'achievements'>('learning');
  const [shopItems, setShopItems] = useState(SHOP_ITEMS);

  const modules = useMemo(() => {
    const allowed = MODULES_BY_GRADE[gradeLevel] || [];
    return ALL_MODULES.filter(m => allowed.includes(m.id));
  }, [gradeLevel]);

  useEffect(() => {
    const loadProgress = async () => {
      const data = await getStudentProgress();
      setProgress(data);
    };
    loadProgress();
  }, []);

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

  const handleModuleComplete = (score: number) => {
    const updated = processModuleCompletion(score, progress.xp, progress.level, progress.coins);
    setProgress(updated);
    setActiveSubject(null);
  };

  const buyItem = (itemId: string) => {
    const result = processItemPurchase(itemId, progress.coins, shopItems);
    if (result) {
      setProgress(prev => ({ ...prev, coins: result.newCoins }));
      setShopItems(result.newItems);
    }
  };

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
    gradeLevel
  };
};
