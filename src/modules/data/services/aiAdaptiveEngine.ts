import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa o SDK do Gemini apenas se a chave estiver configurada
export const genAI = apiKey !== "COLE_AQUI" ? new GoogleGenerativeAI(apiKey) : null;

// Sistema de Cache Local em Memória
// Evita requisições repetitivas para o mesmo montante de XP/Nível da sessão atual
const recommendationCache = new Map<string, {text: string, timestamp: number}>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora de cache salvo

export interface StudentContext {
  xp: number;
  level: number;
  recentModules?: string[];
  weaknesses?: string[];
  strengths?: string[];
}

export async function getAdaptiveRecommendation(studentContext: StudentContext): Promise<string> {
  if (!genAI) {
    return "A IA Adaptativa está configurada em modo Demonstração. Insira sua chave no .env para análises reais.";
  }

  // Chave de Cache baseada no perfil estático atual do aluno
  const cacheKey = `${studentContext.level}-${studentContext.xp}-${(studentContext.recentModules || []).join(',')}`;
  if (recommendationCache.has(cacheKey)) {
    const cached = recommendationCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log("Servindo recomendação via Cache da IA");
      return cached.text;
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Você é o Motor de IA Adaptativo de uma plataforma educacional (Fase 14).
    Analise o contexto do estudante abaixo e escreva 1 parágrafo curto, encorajador e altamente direcionado.
    
    Diretrizes de Personalização:
    1. Se o "level" for baixo (<10), recomende fundamentação teórica.
    2. Se houver "weaknesses" declaradas, recomende o laboratório virtual específico dessa área.
    3. Use um tom de mentor visionário, mas não use saudações clichês.
    
    Contexto Atual do Estudante:
    Nível Atual: ${studentContext.level}
    XP Total Acumulado: ${studentContext.xp}
    Últimos Módulos Vistos: ${studentContext.recentModules?.join(', ') || 'Nenhum recente'}
    Pontos de Atenção (Weaknesses): ${studentContext.weaknesses?.join(', ') || 'Não avaliado'}
    Pontos Fortes: ${studentContext.strengths?.join(', ') || 'Não avaliado'}
    
    Ação Esperada: Dê a recomendação prática do que o aluno deve clicar ou estudar agora.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();

    // Salva no cache
    recommendationCache.set(cacheKey, { text: textResult, timestamp: Date.now() });

    return textResult;
  } catch (error) {
    console.error("Erro na Análise de IA:", error);
    return "O servidor da IA está processando seu próximo desafio. Continue explorando a plataforma!";
  }
}

