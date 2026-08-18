import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa o SDK do Gemini apenas se a chave estiver configurada
export const genAI = (apiKey && apiKey !== "COLE_AQUI" && apiKey.trim() !== "") ? new GoogleGenerativeAI(apiKey) : null;

// Sistema de Cache Local em Memória
const recommendationCache = new Map<string, {data: AIRecommendation, timestamp: number}>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutos de cache

export interface StudentContext {
  xp: number;
  level: number;
  recentModules?: string[];
  weaknesses?: string[];
  strengths?: string[];
  completedModules?: string[];
  enrolledClasses?: string[];
}

export interface AIRecommendation {
  message: string;
  actionType: 'navigate_subject' | 'navigate_tab' | 'join_class' | 'none';
  actionValue?: string;
  actionLabel?: string;
}

/**
 * Motor de recomendações de heurísticas locais (Offline / Sem API Key)
 */
export function getOfflineRecommendation(context: StudentContext): AIRecommendation {
  const level = context.level;
  const enrolledClasses = context.enrolledClasses || [];
  const completedModules = context.completedModules || [];

  // Regra 1: Aluno não matriculado em nenhuma turma
  if (enrolledClasses.length === 0) {
    return {
      message: "Percebi que você ainda não está matriculado em nenhuma turma escolar. Junte-se a uma turma usando o código do seu professor para ter acesso a materiais complementares de estudo e tarefas recomendadas!",
      actionType: 'navigate_tab',
      actionValue: 'classes',
      actionLabel: 'Ver Minhas Turmas'
    };
  }

  // Regra 2: Aluno novo sem nenhum laboratório concluído
  if (completedModules.length === 0) {
    return {
      message: "Seja bem-vindo ao painel interativo! Que tal começar explorando os gráficos cartesianos na aba de Matemática? O laboratório de Funções do 1º Grau é perfeito para começar.",
      actionType: 'navigate_subject',
      actionValue: 'matematica',
      actionLabel: 'Iniciar Matemática'
    };
  }

  // Regra 3: Recomendar os novos laboratórios de Geografia e Filosofia
  const hasFinishedGeo = completedModules.some(m => m.startsWith('geo_'));
  const hasFinishedFil = completedModules.some(m => m.startsWith('fil_'));

  if (!hasFinishedGeo || !hasFinishedFil) {
    if (level >= 3 && !hasFinishedFil) {
      return {
        message: "Novo Laboratório disponível! Entre no módulo de Filosofia e desafie seu senso moral no laboratório de Dilemas Éticos para ver sua escola de pensamento dominante.",
        actionType: 'navigate_subject',
        actionValue: 'filosofia',
        actionLabel: 'Abrir Filosofia'
      };
    } else if (!hasFinishedGeo) {
      return {
        message: "Novo Laboratório disponível! Acesse o simulador de Placas Tectônicas na aba de Geografia para ver de perto as correntes de convecção de magma.",
        actionType: 'navigate_subject',
        actionValue: 'geografia',
        actionLabel: 'Abrir Geografia'
      };
    }
  }

  // Regra 4: Progredir de Matemática para Física (Cinemática do Pêndulo)
  const hasFinishedMath = completedModules.some(m => m.startsWith('math_'));
  const hasFinishedPhysics = completedModules.some(m => m.startsWith('fis_'));

  if (hasFinishedMath && !hasFinishedPhysics) {
    return {
      message: "Ótimo trabalho concluindo tarefas de matemática! Que tal ver como equações e forças funcionam na física real com o simulador de Cinemática do Pêndulo?",
      actionType: 'navigate_subject',
      actionValue: 'fisica',
      actionLabel: 'Explorar Física'
    };
  }

  // Regra 5: Recomendar a loja caso o aluno tenha muitas moedas
  if (context.xp > 600) {
    return {
      message: "Seu progresso acadêmico é impressionante! Você já acumulou uma boa quantia de XP e moedas de aprendizado. Que tal resgatar decorações exclusivas para o seu perfil?",
      actionType: 'navigate_tab',
      actionValue: 'shop',
      actionLabel: 'Ir para a Loja'
    };
  }

  // Fallback padrão de continuação de estudos
  return {
    message: "Continue mantendo seu ritmo diário de estudos! Fazer revisões nos laboratórios virtuais ajuda a fixar o conteúdo conceitual das matérias do colégio.",
    actionType: 'none',
    actionLabel: ''
  };
}

/**
 * Solicita recomendação dinâmica. Se a API estiver offline ou sem chave, cai no motor de regras local.
 */
export async function getAdaptiveRecommendation(studentContext: StudentContext): Promise<AIRecommendation> {
  const cacheKey = `${studentContext.level}-${studentContext.xp}-${(studentContext.completedModules || []).join(',')}-${(studentContext.enrolledClasses || []).join(',')}`;
  
  if (recommendationCache.has(cacheKey)) {
    const cached = recommendationCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (!genAI) {
    const offlineRec = getOfflineRecommendation(studentContext);
    recommendationCache.set(cacheKey, { data: offlineRec, timestamp: Date.now() });
    return offlineRec;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Você é o Motor de IA Adaptativo de uma plataforma educacional (Edu-Interact).
    Analise o contexto do estudante e retorne OBLIGATORIAMENTE um objeto JSON válido correspondente à recomendação educacional prática.
    
    ESTRUTURA DO JSON ESPERADA:
    {
      "message": "Texto curto de conselho explicativo, incentivador e direto (máximo 200 caracteres)",
      "actionType": "navigate_subject" | "navigate_tab" | "join_class" | "none",
      "actionValue": "matematica" | "fisica" | "quimica" | "biologia" | "portugues" | "redacao" | "historia" | "idiomas" | "geografia" | "filosofia" | "classes" | "shop" | "achievements" | null,
      "actionLabel": "Texto do botão de atalho rápido correspondente (ex: 'Estudar Química', 'Entrar em Turma', 'Ver Conquistas' ou vazio se 'none')"
    }

    CONTEXTO DO ESTUDANTE:
    Nível Atual: ${studentContext.level}
    XP Acumulado: ${studentContext.xp}
    Módulos Concluídos: ${studentContext.completedModules?.join(', ') || 'Nenhum ainda'}
    Códigos de Turmas Matriculadas: ${studentContext.enrolledClasses?.join(', ') || 'Nenhuma turma'}
    Último Módulo Ativo: ${studentContext.recentModules?.join(', ') || 'Nenhum recente'}

    Atenção: Não adicione explicações, comentários ou formatações markdown em volta do JSON. Retorne apenas a string do JSON puro de forma que possa ser parseada por JSON.parse().
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text().trim();
    
    // Limpar marcadores de markdown do JSON caso o modelo tenha retornado
    const cleanJson = textResult.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const recommendation = JSON.parse(cleanJson) as AIRecommendation;

    recommendationCache.set(cacheKey, { data: recommendation, timestamp: Date.now() });
    return recommendation;
  } catch (error) {
    console.warn("[aiAdaptiveEngine] Erro ao obter recomendação da API Gemini, usando motor de regras local:", error);
    const offlineRec = getOfflineRecommendation(studentContext);
    recommendationCache.set(cacheKey, { data: offlineRec, timestamp: Date.now() });
    return offlineRec;
  }
}
