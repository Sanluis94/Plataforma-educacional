/**
 * Motor de Avaliação com Teoria de Resposta ao Item (TRI)
 * Modelo Logístico de 3 Parâmetros (3PL):
 * P(θ) = c + (1 - c) / (1 + exp(-1.7 * a * (θ - b)))
 * Melhoria #11 do Plano Estratégico
 */

export interface TriItemParameters {
  itemId: string;
  discrimination_a: number; // Discriminação (típico: 0.5 a 2.5)
  difficulty_b: number;     // Dificuldade na escala z (-3.0 a +3.0)
  guessing_c: number;       // Acerto casual / chute (típico: 0.2 a 0.33)
  domain: string;
}

export interface TriAnswerRecord {
  itemId: string;
  correct: boolean;
  itemParams: TriItemParameters;
}

export interface TriProficiencyResult {
  thetaZ: number;           // Proficiência na escala padrão N(0, 1) (-3 a +3)
  scoreEnem: number;        // Escala normalizada ENEM/ENADE (200 a 1000, média 500, desvio 100)
  standardError: number;    // Erro padrão da medida (SE)
  consistencyIndex: number; // Índice de consistência pedagógica (0 a 1)
  classification: 'Abaixo do Básico' | 'Básico' | 'Adequado' | 'Avançado' | 'Excelente';
}

/**
 * Calcula a probabilidade de acerto segundo o modelo logístico 3PL
 */
export function calculateItemProbability(theta: number, a: number, b: number, c: number): number {
  const exponent = -1.7 * a * (theta - b);
  const logistic = 1 / (1 + Math.exp(Math.max(-50, Math.min(50, exponent))));
  return c + (1 - c) * logistic;
}

/**
 * Estima a proficiência do estudante pelo método da Máxima Verossimilhança (MLE) ou EAP com prior normal
 */
export function estimateStudentProficiency(answers: TriAnswerRecord[]): TriProficiencyResult {
  if (!answers || answers.length === 0) {
    return {
      thetaZ: 0,
      scoreEnem: 500,
      standardError: 1.0,
      consistencyIndex: 0.5,
      classification: 'Básico'
    };
  }

  // Busca em grade fina de -3.5 a +3.5 com passo 0.05
  let bestTheta = 0;
  let maxPosterior = -Infinity;

  for (let theta = -3.5; theta <= 3.5; theta += 0.05) {
    let logLikelihood = 0;

    for (const ans of answers) {
      const p = calculateItemProbability(
        theta,
        ans.itemParams.discrimination_a,
        ans.itemParams.difficulty_b,
        ans.itemParams.guessing_c
      );
      const safeP = Math.max(0.001, Math.min(0.999, p));
      logLikelihood += ans.correct ? Math.log(safeP) : Math.log(1 - safeP);
    }

    // Priori normal padrão N(0, 1): log(N(theta)) = -0.5 * theta^2
    const logPrior = -0.5 * theta * theta;
    const logPosterior = logLikelihood + logPrior;

    if (logPosterior > maxPosterior) {
      maxPosterior = logPosterior;
      bestTheta = theta;
    }
  }

  // Cálculo da Informação de Fisher no ponto bestTheta para derivar o erro padrão
  let totalInformation = 0;
  for (const ans of answers) {
    const a = ans.itemParams.discrimination_a;
    const b = ans.itemParams.difficulty_b;
    const c = ans.itemParams.guessing_c;
    const p = calculateItemProbability(bestTheta, a, b, c);
    const pStar = (p - c) / (1 - c);
    const num = Math.pow(1.7 * a, 2) * (1 - p) * Math.pow(pStar, 2);
    const denom = p * Math.pow(1 - c, 2);
    totalInformation += Math.max(0.01, denom > 0 ? num / denom : 0.1);
  }

  const standardError = Number((1 / Math.sqrt(Math.max(0.2, totalInformation))).toFixed(2));
  
  // Conversão para escala ENEM/ENADE: Score = 500 + 100 * theta (limitada entre 200 e 1000)
  const rawScore = 500 + 100 * bestTheta;
  const scoreEnem = Math.round(Math.max(200, Math.min(1000, rawScore)));

  // Classificação pedagógica
  let classification: TriProficiencyResult['classification'] = 'Básico';
  if (scoreEnem < 400) classification = 'Abaixo do Básico';
  else if (scoreEnem < 550) classification = 'Básico';
  else if (scoreEnem < 700) classification = 'Adequado';
  else if (scoreEnem < 850) classification = 'Avançado';
  else classification = 'Excelente';

  return {
    thetaZ: Number(bestTheta.toFixed(2)),
    scoreEnem,
    standardError,
    consistencyIndex: Number((Math.max(0.4, 1 - standardError * 0.3)).toFixed(2)),
    classification
  };
}

/**
 * Gera parâmetros de calibração padrão para um laboratório com base no seu nível acadêmico
 */
export function getCalibratedTriParametersForLab(labId: string, academicLevel: string): TriItemParameters {
  const difficultyMap: Record<string, number> = {
    fundamental_1: -1.2,
    fundamental_2: -0.4,
    medio: 0.3,
    graduacao: 1.1,
    pos_graduacao: 2.0
  };

  const baseB = difficultyMap[academicLevel] ?? 0.0;
  // Variação determinística leve pelo ID
  const hash = labId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const diffOffset = ((hash % 10) - 5) * 0.05;

  return {
    itemId: labId,
    discrimination_a: 1.35 + ((hash % 5) * 0.1),
    difficulty_b: Number((baseB + diffOffset).toFixed(2)),
    guessing_c: 0.33, // 3 opções de múltipla escolha
    domain: academicLevel
  };
}
