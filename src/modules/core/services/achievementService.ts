/**
 * Achievements Service — Sistema de conquistas dinâmicas.
 * Verifica condições de desbloqueio e persiste conquistas no progresso do aluno.
 */
import type { ProgressData } from '../../data/types';

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  condition: (progress: ProgressData) => boolean;
  unlocked: boolean;
}

/**
 * Definição de todas as conquistas disponíveis.
 * Cada uma tem uma condição programática baseada no progresso do aluno.
 */
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked'>[] = [
  {
    id: 'pioneer',
    icon: '🏅',
    name: 'Pioneiro',
    description: 'Completou sua primeira atividade',
    condition: (p) => p.completedModules.length >= 1,
  },
  {
    id: 'math_whiz',
    icon: '⭐',
    name: 'Matemático Célere',
    description: 'Completou o módulo de Matemática',
    condition: (p) => p.completedModules.includes('matematica'),
  },
  {
    id: 'scientist',
    icon: '🧪',
    name: 'Cientista Iniciante',
    description: 'Completou o lab de Química',
    condition: (p) => p.completedModules.includes('quimica'),
  },
  {
    id: 'time_traveler',
    icon: '🌍',
    name: 'Viajante do Tempo',
    description: 'Explorou a Linha do Tempo da História',
    condition: (p) => p.completedModules.includes('historia'),
  },
  {
    id: 'polyglot',
    icon: '🎓',
    name: 'Poliglota',
    description: 'Concluiu o módulo de Idiomas',
    condition: (p) => p.completedModules.includes('idiomas'),
  },
  {
    id: 'literary',
    icon: '💡',
    name: 'Arguto Literário',
    description: 'Completou o módulo de Português',
    condition: (p) => p.completedModules.includes('portugues'),
  },
  {
    id: 'biologist',
    icon: '🔬',
    name: 'Biólogo Virtual',
    description: 'Explorou o Microscópio Virtual',
    condition: (p) => p.completedModules.includes('biologia'),
  },
  {
    id: 'writer',
    icon: '✍️',
    name: 'Escritor Criativo',
    description: 'Completou o módulo de Redação',
    condition: (p) => p.completedModules.includes('redacao'),
  },
  {
    id: 'level5',
    icon: '🚀',
    name: 'Desbravador',
    description: 'Atingiu o Nível 5',
    condition: (p) => p.level >= 5,
  },
  {
    id: 'level10',
    icon: '🌟',
    name: 'Mestre do Conhecimento',
    description: 'Atingiu o Nível 10',
    condition: (p) => p.level >= 10,
  },
  {
    id: 'collector',
    icon: '🛍️',
    name: 'Colecionador',
    description: 'Comprou 3 itens na loja',
    condition: (p) => p.purchasedItems.length >= 3,
  },
  {
    id: 'xp1000',
    icon: '💎',
    name: 'Milhar de XP',
    description: 'Acumulou 1.000 XP',
    condition: (p) => p.xp >= 1000,
  },
];

/**
 * Avalia o progresso atual e retorna a lista de conquistas com status de desbloqueio.
 */
export function evaluateAchievements(progress: ProgressData): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map(def => ({
    ...def,
    unlocked: def.condition(progress),
  }));
}

/**
 * Detecta conquistas recém-desbloqueadas (para notificações/toasts).
 */
export function detectNewAchievements(
  previousProgress: ProgressData,
  currentProgress: ProgressData
): Achievement[] {
  const prevAchievements = evaluateAchievements(previousProgress);
  const currAchievements = evaluateAchievements(currentProgress);

  return currAchievements.filter((curr, i) => curr.unlocked && !prevAchievements[i].unlocked);
}
