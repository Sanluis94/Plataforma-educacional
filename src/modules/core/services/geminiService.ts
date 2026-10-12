/**
 * Gemini Service — Gerenciador de Chave de API e Integração com Google Gemini.
 * Suporta priorização da chave inserida no navegador (localStorage) e chave padrão de ambiente (VITE_GEMINI_API_KEY).
 */

// Modelo estável recomendado para novos projetos na revisão de outubro/2026.
export const GEMINI_TEXT_MODEL = 'gemini-3.5-flash-lite';

export const getEffectiveGeminiApiKey = (): string | null => {
  if (import.meta.env.VITE_DISABLE_AI === 'true') return null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  if (localKey && localKey.trim().length > 0) {
    return localKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return null;
};

/**
 * Avalia uma redação com o modelo Google Gemini REST API (se a chave estiver disponível)
 * ou com a máquina de heurísticas locais (fallback gracioso).
 */
export const analyzeEssayWithGemini = async (
  theme: string,
  essayText: string
): Promise<{ score: number; comments: string[] }> => {
  const apiKey = getEffectiveGeminiApiKey();

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Você é um avaliador da banca do ENEM. Avalie a seguinte redação temática: "${theme}".
Texto da Redação:
"${essayText}"

Forneça a nota final de 0 a 1000 (soma das 5 competências C1 a C5 de 0 a 200) e 5 comentários estruturados por competência.
Responda APENAS em formato JSON válido no seguinte esquema:
{
  "score": 840,
  "comments": [
    "C1 (Domínio da Língua Escrita): 160/200 pts — Bom domínio da norma culta com pequenas falhas de concordância.",
    "C2 (Compreensão do Tema): 180/200 pts — Excelente repertório e compreensão temática.",
    "C3 (Organização Argumentativa): 160/200 pts — Argumentos bem estruturados.",
    "C4 (Mecanismos Linguísticos): 180/200 pts — Bom uso de conectivos entre parágrafos.",
    "C5 (Proposta de Intervenção): 160/200 pts — Proposta detalhada com agente e ação clara."
  ]
}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed.score === 'number' && Array.isArray(parsed.comments)) {
            return parsed;
          }
        }
      }
    } catch (error) {
      console.warn('[GeminiService] Falha na chamada da API Gemini, recorrendo às heurísticas:', error);
    }
  }

  // Fallback Inteligente Heurístico (offline / sem chave)
  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const hasIntroduction = essayText.length > 100;
  const hasSocioculturalRef = /inventor|cientista|lei|pesquisa|dado|sociedade|estudo|história|filósofo/i.test(essayText);
  const hasIntervention = /portanto|dessa forma|propõe-se|é necessário|deve-se|medida|solução/i.test(essayText);
  const hasConnectives = /além disso|entretanto|no entanto|portanto|ademais|visto que/i.test(essayText);

  const scores = [
    Math.min(200, 120 + (hasIntroduction ? 40 : 0) + (wordCount > 150 ? 40 : 0)),
    Math.min(200, theme.split(' ').filter(w => essayText.toLowerCase().includes(w.toLowerCase())).length * 30 + 60),
    Math.min(200, 80 + (hasSocioculturalRef ? 80 : 0) + (hasConnectives ? 40 : 0)),
    Math.min(200, 100 + (hasConnectives ? 100 : 0)),
    Math.min(200, hasIntervention ? 180 : 60),
  ];

  const total = scores.reduce((a, b) => a + b, 0);
  const COMPETENCIAS = [
    { id: 1, name: 'Domínio da Língua Escrita' },
    { id: 2, name: 'Compreensão do Tema' },
    { id: 3, name: 'Organização Argumentativa' },
    { id: 4, name: 'Mecanismos Linguísticos' },
    { id: 5, name: 'Proposta de Intervenção' },
  ];
  const comments = COMPETENCIAS.map((c, i) => `C${c.id} (${c.name}): ${scores[i]}/200 pts — ${scores[i] >= 160 ? '✅ Ótimo' : scores[i] >= 100 ? '⚠️ Regular' : '❌ Necessita revisão'}`);

  return { score: total, comments };
};

export interface PedagogicalReportData {
  className: string;
  studentsCount: number;
  completionRate: number | null;
  averageScore: number | null;
  studentsWithEvidence?: number;
  scoredRecordsCount?: number;
  completedActivitiesCount?: number;
  expectedCompletions?: number;
  supportStudentsCount?: number;
  /** Compatibilidade com relatórios anteriores. Os nomes nunca são enviados à IA. */
  atRiskStudents?: string[];
  topModules: { module: string; averageScore: number | null; count: number }[];
}

export interface PedagogicalDiagnosis {
  source: 'rules' | 'gemini';
  summary: string;
  strengths: string[];
  recommendations: string[];
  priorityActions: string[];
  notice?: string;
}

/** Panorama determinístico: cada afirmação corresponde a um número recebido. */
export function buildPedagogicalSummary(data: PedagogicalReportData): PedagogicalDiagnosis {
  const support = data.supportStudentsCount ?? data.atRiskStudents?.length ?? 0;
  const observed = data.studentsWithEvidence;
  const hasEvidence = observed === undefined ? data.averageScore !== null : observed > 0;
  const scoreText = data.averageScore === null ? 'Ainda não há notas válidas para calcular a média.' : `A média das entregas com nota é ${data.averageScore}%${data.scoredRecordsCount !== undefined ? `, baseada em ${data.scoredRecordsCount} resultados` : ''}.`;
  const completionText = data.completionRate === null ? 'A conclusão ainda não pode ser calculada sem atividades atribuídas e alunos matriculados.' : `${data.completionRate}% das entregas esperadas foram concluídas${data.expectedCompletions !== undefined ? ` (${data.completedActivitiesCount ?? 0} de ${data.expectedCompletions})` : ''}.`;
  const strengths = [observed !== undefined ? `${observed} de ${data.studentsCount} alunos possuem evidências registradas.` : `${data.studentsCount} alunos compõem a turma.`, scoreText, completionText];
  const recommendations = !hasEvidence
    ? ['Conferir a matrícula e as atividades atribuídas.', 'Combinar com os alunos uma primeira entrega; ausência de registro ainda não permite avaliar aprendizagem.']
    : [support > 0 ? `Conferir as evidências de ${support} ${support === 1 ? 'aluno indicado' : 'alunos indicados'} para apoio e combinar uma retomada.` : 'Revisar também os alunos sem evidências antes de planejar o próximo passo.',
      data.topModules.some(module => module.averageScore !== null && module.averageScore < 70) ? 'Retomar as atividades com média abaixo de 70% e observar as questões com menor acerto.' : 'Conferir as respostas e reflexões antes de escolher os próximos desafios.',
      'Usar o acompanhamento por aluno para oferecer uma orientação específica.'];
  return { source: 'rules', summary: hasEvidence ? `${scoreText} ${completionText} Os registros orientam o acompanhamento; não medem presença nem preveem evasão.` : 'Ainda não há evidências suficientes para descrever a aprendizagem da turma.', strengths, recommendations, priorityActions: recommendations.slice(0, 2) };
}

function readDiagnosis(value: unknown): Omit<PedagogicalDiagnosis, 'source'> | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (typeof data.summary !== 'string' || !data.summary.trim() || data.summary.length > 3000) return null;
  const lists = ['strengths', 'recommendations', 'priorityActions'] as const;
  if (lists.some(key => !Array.isArray(data[key]) || (data[key] as unknown[]).length > 8 || (data[key] as unknown[]).some(item => typeof item !== 'string' || !item.trim() || item.length > 1000))) return null;
  return { summary: data.summary.trim(), strengths: (data.strengths as string[]).map(item => item.trim()), recommendations: (data.recommendations as string[]).map(item => item.trim()), priorityActions: (data.priorityActions as string[]).map(item => item.trim()) };
}

/** Acionada explicitamente pelo professor. Envia somente agregados numéricos. */
export const generatePedagogicalDiagnosis = async (reportData: PedagogicalReportData): Promise<PedagogicalDiagnosis> => {
  const fallback = buildPedagogicalSummary(reportData);
  const apiKey = getEffectiveGeminiApiKey();

  if (apiKey) {
    try {
      const aggregate = {
        matriculados: reportData.studentsCount,
        alunosComEvidencias: reportData.studentsWithEvidence ?? null,
        resultadosComNota: reportData.scoredRecordsCount ?? null,
        conclusaoPercentual: reportData.completionRate,
        mediaPercentual: reportData.averageScore,
        entregasConcluidas: reportData.completedActivitiesCount ?? null,
        entregasEsperadas: reportData.expectedCompletions ?? null,
        alunosIndicadosParaApoio: reportData.supportStudentsCount ?? reportData.atRiskStudents?.length ?? 0,
        gruposDeAtividades: reportData.topModules.map(module => ({ mediaPercentual: module.averageScore, entregas: module.count })),
      };
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(15000),
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Você auxilia um professor a planejar o acompanhamento a partir de agregados anônimos.
Dados: ${JSON.stringify(aggregate)}
Use apenas estes números. Null significa ausência de informação; nunca zero. Não infira pontualidade, frequência, causas, dedicação, diagnósticos pessoais, evasão, comparação com outras turmas ou referência externa. Indicação para apoio usa critérios de acompanhamento e precisa de revisão docente. Expresse sugestões como possibilidades, não conclusões. Se faltam evidências, explique a limitação. Não invente nomes, disciplinas ou dados. Gere JSON estrito com todas as listas:
{
  "summary": "Resumo analítico do panorama da turma...",
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "recommendations": ["Recomendação pedagógica 1", "Recomendação pedagógica 2"],
  "priorityActions": ["Ação prioritária 1", "Ação prioritária 2"]
}`
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = readDiagnosis(JSON.parse(jsonMatch[0]));
          if (parsed) return { ...parsed, source: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('[GeminiService] Resumo por IA indisponível; mantido o resumo por critérios.', err);
    }
  }

  return { ...fallback, notice: apiKey ? 'Não foi possível obter um resumo válido com IA. O resumo pelos critérios da plataforma foi mantido.' : 'A IA não está configurada neste ambiente. O resumo pelos critérios da plataforma foi mantido.' };
};

export interface GeneratedLessonPayload {
  title: string;
  description: string;
  theoryContent: string;
  questions: Array<{
    q: string;
    options: string[];
    answer: number;
    explanation: string;
  }>;
  simulationConfig?: Record<string, unknown>;
  xpReward: number;
  coinReward: number;
}

/**
 * Cria uma aula e atividade completa com Inteligência Artificial Google Gemini
 * com base no tema, disciplina e nível de ensino definidos pelo professor.
 */
export const generateCompleteLessonWithAI = async ({
  topic,
  subject,
  gradeLevel = 'Ensino Médio',
  activityType = 'quiz'
}: {
  topic: string;
  subject: string;
  gradeLevel?: string;
  activityType?: string;
}): Promise<GeneratedLessonPayload> => {
  const apiKey = getEffectiveGeminiApiKey();

  if (apiKey) {
    try {
      const prompt = `Você é um coordenador pedagógico e especialista em design de aprendizagem digital.
Crie um plano de aula interativo e atividade estruturada sobre o seguinte tema:
- Disciplina: ${subject}
- Tema: "${topic}"
- Nível de Ensino: ${gradeLevel}
- Tipo de Atividade: ${activityType}

Forneça um JSON estrito no seguinte formato:
{
  "title": "Título Criativo da Aula",
  "description": "Objetivo pedagógico e resumo claro da atividade para os estudantes em 2 a 3 frases.",
  "theoryContent": "Explicação teórica concisa, dinâmica e contextualizada sobre o tema (3 a 5 parágrafos com exemplos práticos).",
  "questions": [
    {
      "q": "Enunciado claro da questão 1 contextualizada",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "answer": 0,
      "explanation": "Explicação detalhada de por que a alternativa A é correta e onde reside o conceito-chave."
    },
    {
      "q": "Enunciado da questão 2",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "answer": 1,
      "explanation": "Explicação da questão 2."
    },
    {
      "q": "Enunciado da questão 3",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "answer": 2,
      "explanation": "Explicação da questão 3."
    }
  ],
  "simulationConfig": {
    "recommendedMode": "simulation_physics",
    "params": { "gravity": 9.8, "scale": 1.0 }
  },
  "xpReward": 100,
  "coinReward": 20
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title && Array.isArray(parsed.questions)) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('[GeminiService] Falha ao gerar aula via Gemini API, recorrendo ao gerador pedagógico heurístico:', err);
    }
  }

  // Fallback Pedagógico Inteligente Estruturado
  const cleanTopic = topic.trim() || 'Fundamentos da Disciplina';
  return {
    title: `${cleanTopic} — Estudo Prático & Desafio`,
    description: `Nesta atividade interativa de ${subject}, exploraremos os conceitos essenciais de ${cleanTopic}, aplicando metodologia ativa com checagem imediata de aprendizado.`,
    theoryContent: `O estudo de ${cleanTopic} constitui um dos pilares fundamentais no aprendizado de ${subject}.\n\nAo analisar este tema sob a ótica científica e prática, identificamos relações causais diretas e aplicações cotidianas indispensáveis.\n\nDedique atenção aos princípios fundamentais, observe as variações dos parâmetros e teste suas hipóteses através dos exercícios a seguir.`,
    questions: [
      {
        q: `Qual é o princípio fundamental que rege o conceito de ${cleanTopic} em ${subject}?`,
        options: [
          `Aplicação das leis e modelos fundamentais de ${cleanTopic} com base em evidências e deduções lógicas.`,
          `Desconsideração dos dados experimentais em favor de hipóteses puramente empíricas.`,
          `Dependência exclusiva de variáveis aleatórias sem regularidade conceitual.`,
          `Interpretação restrita a casos isolados sem possibilidade de generalização.`
        ],
        answer: 0,
        explanation: `A resposta correta baseia-se na aplicação rigorosa dos modelos teóricos e evidências que estruturam o conhecimento em ${subject}.`
      },
      {
        q: `Em uma situação prática envolvendo ${cleanTopic}, como devemos interpretar uma variação proporcional nos resultados?`,
        options: [
          `Como um erro sistemático que invalida o modelo.`,
          `Como uma correlação direta prevista pelas relações fundamentais da teoria.`,
          `Como ausência de relação entre as variáveis testadas.`,
          `Como um fenômeno puramente imprevisível.`
        ],
        answer: 1,
        explanation: `Variações proporcionais refletem o comportamento matemático e conceitual previsto pelas equações e princípios de ${cleanTopic}.`
      },
      {
        q: `Ao sintetizar as conclusões sobre ${cleanTopic}, qual competência é mais exigida para a resolução de problemas complexos?`,
        options: [
          `Memorização passiva de fórmulas sem contextualização.`,
          `Pensamento crítico, análise lógica e capacidade de articulação interdisciplinar.`,
          `Rejeição de verificações empíricas e simulações digitais.`,
          `Foco em apenas um único aspecto do problema ignorando o contexto sistêmico.`
        ],
        answer: 1,
        explanation: `O domínio pleno do conteúdo exige raciocínio crítico articulado e aplicação conceitual em problemas reais.`
      }
    ],
    simulationConfig: {
      gravity: 9.8,
      functionType: 'linear',
      difficulty: 'intermediario'
    },
    xpReward: 100,
    coinReward: 20
  };
};

/**
 * Chamada direta ao modelo Google Gemini para prompts textuais abertos (como mediação socrática).
 */
export const callGeminiWithKey = async (apiKey: string, prompt: string): Promise<string> => {
  if (import.meta.env.VITE_DISABLE_AI === 'true') {
    throw new Error('IA externa desativada neste ambiente de desenvolvimento.');
  }
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chave de API do Gemini não informada.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey.trim()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return answer || 'Não foi possível obter resposta do tutor no momento.';
};
