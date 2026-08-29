/**
 * A/B Testing Service — Motor de experimentos educacionais.
 * Gerencia alocação determinística de variantes, rastreamento de engajamento e métricas estatísticas.
 */

export interface ExperimentVariant {
  id: 'A' | 'B';
  name: string;
  description: string;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  active: boolean;
  variants: {
    A: ExperimentVariant;
    B: ExperimentVariant;
  };
}

export interface ExperimentMetrics {
  experimentId: string;
  variantA: {
    impressions: number;
    conversions: number;
    totalScore: number;
    conversionRate: number;
    averageScore: number;
  };
  variantB: {
    impressions: number;
    conversions: number;
    totalScore: number;
    conversionRate: number;
    averageScore: number;
  };
}

// Catálogo de experimentos ativos na plataforma
export const ACTIVE_EXPERIMENTS: Record<string, Experiment> = {
  exp_interactive_feedback: {
    id: 'exp_interactive_feedback',
    name: 'Feedback da IA em Tempo Real',
    description: 'Compara a retenção de aprendizado entre feedback estático no fim vs feedback explicativo imediato da IA.',
    active: true,
    variants: {
      A: { id: 'A', name: 'Feedback Padrão', description: 'Resultado e gabarito exibidos apenas ao finalizar o módulo.' },
      B: { id: 'B', name: 'Feedback IA Imediato', description: 'Justificativa pedagógica e explicação da IA exibidas a cada questão.' },
    },
  },
  exp_gamified_rewards: {
    id: 'exp_gamified_rewards',
    name: 'Multiplicador de Recompensas Gamificadas',
    description: 'Compara engajamento entre pontuação de XP fixa e bônus dinâmico de moedas por acertos.',
    active: true,
    variants: {
      A: { id: 'A', name: 'XP Linear Padrão', description: 'Ganha +80 XP fixos por conclusão de laboratório.' },
      B: { id: 'B', name: 'Moedas Dinâmicas & Bônus', description: 'Ganha XP + Moedas Virtuais para compras na loja gamificada.' },
    },
  },
  exp_lab_onboarding: {
    id: 'exp_lab_onboarding',
    name: 'Onboarding com Missões Guiadas',
    description: 'Compara a taxa de conclusão entre simulador livre e modo guiado com objetivos de aprendizagem.',
    active: true,
    variants: {
      A: { id: 'A', name: 'Exploração Livre', description: 'Acesso direto a todos os controles do simulador.' },
      B: { id: 'B', name: 'Missão Guiada', description: 'Instruções passo a passo com checklist de verificação.' },
    },
  },
};

// Armazenamento em memória / cache local das métricas dos experimentos
const experimentStore: Record<string, {
  impressionsA: Set<string>;
  impressionsB: Set<string>;
  conversionsA: { userId: string; score: number }[];
  conversionsB: { userId: string; score: number }[];
}> = {};

function initExperimentStore(expId: string) {
  if (!experimentStore[expId]) {
    experimentStore[expId] = {
      impressionsA: new Set(),
      impressionsB: new Set(),
      conversionsA: [],
      conversionsB: [],
    };
  }
}

/**
 * Função de hash determinística simples (djb2) para garantir que o mesmo usuário
 * sempre caia na mesma variante para um dado experimento.
 */
export function hashUserToVariant(experimentId: string, userId: string): 'A' | 'B' {
  const combined = `${experimentId}:${userId}`;
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  // Divide 50% / 50%
  return Math.abs(hash) % 2 === 0 ? 'A' : 'B';
}

/**
 * Retorna a variante ('A' ou 'B') designada para o usuário.
 */
export function getExperimentVariant(experimentId: string, userId: string): 'A' | 'B' {
  return hashUserToVariant(experimentId, userId);
}

/**
 * Registra a impressão (visualização) do experimento pelo usuário.
 */
export function trackExperimentImpression(experimentId: string, userId: string): 'A' | 'B' {
  initExperimentStore(experimentId);
  const variant = getExperimentVariant(experimentId, userId);
  if (variant === 'A') {
    experimentStore[experimentId].impressionsA.add(userId);
  } else {
    experimentStore[experimentId].impressionsB.add(userId);
  }
  return variant;
}

/**
 * Registra a conversão (conclusão da atividade / lab) com a respectiva pontuação.
 */
export function trackExperimentConversion(
  experimentId: string,
  userId: string,
  score: number
): { variant: 'A' | 'B'; recorded: boolean } {
  initExperimentStore(experimentId);
  const variant = getExperimentVariant(experimentId, userId);
  const record = { userId, score };

  if (variant === 'A') {
    experimentStore[experimentId].conversionsA.push(record);
  } else {
    experimentStore[experimentId].conversionsB.push(record);
  }

  return { variant, recorded: true };
}

/**
 * Calcula os resultados agregados e estatísticas de conversão e média de pontuação.
 */
export function getExperimentMetrics(experimentId: string): ExperimentMetrics {
  initExperimentStore(experimentId);
  const store = experimentStore[experimentId];

  const impA = store.impressionsA.size;
  const convA = store.conversionsA.length;
  const totalScoreA = store.conversionsA.reduce((sum, c) => sum + c.score, 0);
  const avgScoreA = convA > 0 ? Math.round(totalScoreA / convA) : 0;
  const convRateA = impA > 0 ? Math.round((convA / impA) * 100) : 0;

  const impB = store.impressionsB.size;
  const convB = store.conversionsB.length;
  const totalScoreB = store.conversionsB.reduce((sum, c) => sum + c.score, 0);
  const avgScoreB = convB > 0 ? Math.round(totalScoreB / convB) : 0;
  const convRateB = impB > 0 ? Math.round((convB / impB) * 100) : 0;

  return {
    experimentId,
    variantA: {
      impressions: impA,
      conversions: convA,
      totalScore: totalScoreA,
      conversionRate: convRateA,
      averageScore: avgScoreA,
    },
    variantB: {
      impressions: impB,
      conversions: convB,
      totalScore: totalScoreB,
      conversionRate: convRateB,
      averageScore: avgScoreB,
    },
  };
}

/**
 * Reseta os dados de um experimento (útil para testes unitários).
 */
export function resetExperimentStore(experimentId?: string) {
  if (experimentId) {
    delete experimentStore[experimentId];
  } else {
    Object.keys(experimentStore).forEach(k => delete experimentStore[k]);
  }
}
