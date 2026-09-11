/**
 * Serviço de Cálculo de Nota TRI (Teoria de Resposta ao Item)
 * Baseado no modelo logístico de 3 parâmetros (3PL) de Birnbaum adaptado para o ENEM:
 * P(θ) = c + (1 - c) / (1 + e^(-D * a * (θ - b)))
 *
 * Onde:
 * θ = Proficiência estimada do estudante (escala típica normal ~ N(0, 1))
 * a = Discriminação do item (capacidade de diferenciar alunos com proficiências distintas, tipicamente 0.5 a 2.5)
 * b = Dificuldade do item (em escala theta, tipicamente -2.0 a +2.5)
 * c = Probabilidade de acerto ao acaso / chute (tipicamente ~0.20 para 5 alternativas)
 * D = Fator de ajuste de escala de Birnbaum (1.7)
 */

export interface TriItem {
  id: string;
  enunciado: string;
  area: 'Ciências da Natureza' | 'Matemática' | 'Ciências Humanas' | 'Linguagens';
  habilidadeBNCC: string;
  opcoes: string[];
  respostaCorreta: number; // 0 a 4
  justificativa: string;
  // Parâmetros TRI calibrados
  a: number; // Discriminação
  b: number; // Dificuldade (-2 a +2.5)
  c: number; // Acerto casual (~0.2)
}

export interface TriResponseSubmission {
  itemId: string;
  respostaEscolhida: number; // 0 a 4
}

export interface TriResult {
  totalQuestoes: number;
  acertosBrutos: number;
  porcentagemAcerto: number;
  thetaEstimado: number; // escala padronizada (-3 a +3)
  notaEnem: number; // escala ENEM (tipicamente 300 a 1000)
  indiceCoerenciaPedagogica: number; // 0 a 100% (penaliza chute estatístico)
  classificacao: 'Excelente' | 'Bom' | 'Médio' | 'Em Desenvolvimento' | 'Atenção';
  detalhesPorItem: {
    itemId: string;
    correto: boolean;
    dificuldadeNivel: 'Fácil' | 'Médio' | 'Difícil';
    pesoItem: number;
  }[];
  recomendacoesPedagogicas: string[];
}

const D = 1.7;

/**
 * Função de probabilidade de acerto do modelo logístico 3PL
 */
export function probabilidade3PL(theta: number, a: number, b: number, c: number): number {
  const expoente = -D * a * (theta - b);
  const logistica = 1 / (1 + Math.exp(Math.max(-20, Math.min(20, expoente))));
  return c + (1 - c) * logistica;
}

/**
 * Calcula o índice de coerência pedagógica:
 * Um estudante consistente acerta questões com b < θ e pode errar questões com b > θ.
 * Se ele acerta questões muito difíceis (b alto) mas erra questões muito fáceis (b baixo),
 * o algoritmo detecta forte indício de chute (incoerência probabilística).
 */
export function calcularCoerenciaPedagogica(
  itens: TriItem[],
  submissoes: TriResponseSubmission[]
): number {
  if (itens.length === 0 || submissoes.length === 0) return 100;

  let totalInversoes = 0;
  let paresComparados = 0;

  // Mapeia acertos
  const mapaAcertos = new Map<string, boolean>();
  submissoes.forEach(s => {
    const item = itens.find(i => i.id === s.itemId);
    if (item) {
      mapaAcertos.set(item.id, s.respostaEscolhida === item.respostaCorreta);
    }
  });

  // Compara cada par de itens (Item Fácil vs Item Difícil)
  for (let i = 0; i < itens.length; i++) {
    for (let j = i + 1; j < itens.length; j++) {
      const item1 = itens[i];
      const item2 = itens[j];

      // Garante que itemA é mais fácil que itemB
      const [facil, dificil] = item1.b < item2.b ? [item1, item2] : [item2, item1];
      const diffDificuldade = dificil.b - facil.b;

      // Apenas compara se a diferença de dificuldade for perceptível (ex: > 0.4)
      if (diffDificuldade >= 0.4) {
        paresComparados++;
        const acertouFacil = mapaAcertos.get(facil.id) ?? false;
        const acertouDificil = mapaAcertos.get(dificil.id) ?? false;

        // Incoerência clássica de chute: errou a questão fácil e acertou a difícil
        if (!acertouFacil && acertouDificil) {
          totalInversoes++;
        }
      }
    }
  }

  if (paresComparados === 0) return 100;
  const taxaIncoerencia = totalInversoes / paresComparados;
  return Math.max(20, Math.round((1 - taxaIncoerencia * 1.8) * 100));
}

/**
 * Estima o theta (proficiência) utilizando aproximação numérica pelo método de Newton-Raphson / Busca em Grade
 */
export function estimarTheta(itens: TriItem[], submissoes: TriResponseSubmission[]): number {
  const mapaAcertos = new Map<string, boolean>();
  submissoes.forEach(s => {
    const item = itens.find(i => i.id === s.itemId);
    if (item) {
      mapaAcertos.set(item.id, s.respostaEscolhida === item.respostaCorreta);
    }
  });

  let melhorTheta = 0;
  let maxLogLikelihood = -Infinity;

  // Busca em grade fina entre -3.0 e +3.0 com passo de 0.05
  for (let theta = -3.0; theta <= 3.0; theta += 0.05) {
    let logLikelihood = 0;

    for (const item of itens) {
      const acertou = mapaAcertos.get(item.id) ?? false;
      const P = probabilidade3PL(theta, item.a, item.b, item.c);
      const P_safe = Math.max(0.0001, Math.min(0.9999, P));

      if (acertou) {
        logLikelihood += Math.log(P_safe);
      } else {
        logLikelihood += Math.log(1 - P_safe);
      }
    }

    // Penalidade Bayesiana normal prior N(0, 1) para estabilidade estatística
    logLikelihood -= 0.5 * theta * theta;

    if (logLikelihood > maxLogLikelihood) {
      maxLogLikelihood = logLikelihood;
      melhorTheta = theta;
    }
  }

  return Math.round(melhorTheta * 100) / 100;
}

/**
 * Converte theta (-3 a +3) para a escala ENEM (tipicamente média 500, desvio padrão 100)
 * aplicando o fator de coerência pedagógica
 */
export function converterThetaParaNotaEnem(theta: number, coerencia: number): number {
  // Escala linear base ENEM com desvio calibrado: 500 + 150 * theta
  let notaBase = 500 + 150 * theta;

  // Limites mínimos e máximos usuais das provas do ENEM
  notaBase = Math.max(300, Math.min(980, notaBase));

  // Aplicação da penalidade de coerência (anti-chute da TRI)
  // Se a coerência for baixa (< 70%), a nota sofre redução proporcional como no ENEM real
  if (coerencia < 70) {
    const fatorPenalidade = 1 - ((70 - coerencia) / 100) * 0.25;
    notaBase *= fatorPenalidade;
  }

  return Math.round(notaBase);
}

/**
 * Processamento completo da submissão do Simulado ENEM com TRI
 */
export function processarSimuladoEnemTRI(
  itens: TriItem[],
  submissoes: TriResponseSubmission[]
): TriResult {
  const totalQuestoes = itens.length;
  let acertosBrutos = 0;

  const detalhesPorItem = itens.map(item => {
    const sub = submissoes.find(s => s.itemId === item.id);
    const correto = sub ? sub.respostaEscolhida === item.respostaCorreta : false;
    if (correto) acertosBrutos++;

    const dificuldadeNivel: 'Fácil' | 'Médio' | 'Difícil' =
      item.b < -0.3 ? 'Fácil' : item.b <= 0.8 ? 'Médio' : 'Difícil';

    return {
      itemId: item.id,
      correto,
      dificuldadeNivel,
      pesoItem: Math.round(item.a * 10) / 10
    };
  });

  const porcentagemAcerto = Math.round((acertosBrutos / (totalQuestoes || 1)) * 100);
  const thetaEstimado = estimarTheta(itens, submissoes);
  const indiceCoerenciaPedagogica = calcularCoerenciaPedagogica(itens, submissoes);
  const notaEnem = converterThetaParaNotaEnem(thetaEstimado, indiceCoerenciaPedagogica);

  let classificacao: TriResult['classificacao'] = 'Em Desenvolvimento';
  if (notaEnem >= 700 || porcentagemAcerto === 100) classificacao = 'Excelente';
  else if (notaEnem >= 600) classificacao = 'Bom';
  else if (notaEnem >= 500) classificacao = 'Médio';
  else if (notaEnem >= 400) classificacao = 'Em Desenvolvimento';
  else classificacao = 'Atenção';

  const recomendacoesPedagogicas: string[] = [];
  if (indiceCoerenciaPedagogica < 65) {
    recomendacoesPedagogicas.push(
      'Atenção ao Padrão de Chute: Você errou questões com conceitos fundamentais mas acertou questões de alta complexidade. Na TRI, consolidar a base teórica eleva muito mais sua pontuação do que arriscar itens difíceis.'
    );
  }
  if (porcentagemAcerto >= 80) {
    recomendacoesPedagogicas.push(
      'Excelente consistência de domínio cognitivo! Sua proficiência indica alta probabilidade de aprovação em cursos concorridos no SiSU (Medicina, Engenharia, Direito).'
    );
  } else if (porcentagemAcerto >= 50) {
    recomendacoesPedagogicas.push(
      'Bom desempenho intermediário. Foque na revisão das habilidades de aplicação prática nos laboratórios virtuais da plataforma para transformar acertos medianos em proficiência consistente.'
    );
  } else {
    recomendacoesPedagogicas.push(
      'Recomendamos realizar os experimentos virtuais guiados de nível introdutório e utilizar a Maiêutica Socrática para fixar as bases conceituais antes do próximo simulado.'
    );
  }

  return {
    totalQuestoes,
    acertosBrutos,
    porcentagemAcerto,
    thetaEstimado,
    notaEnem,
    indiceCoerenciaPedagogica,
    classificacao,
    detalhesPorItem,
    recomendacoesPedagogicas
  };
}

/**
 * Banco Inicial de Questões Calibradas do ENEM / BNCC
 */
export const BANCO_ITENS_ENEM_PADRAO: TriItem[] = [
  {
    id: 'enem_nat_01',
    area: 'Ciências da Natureza',
    habilidadeBNCC: 'EM13CNT101 - Mecânica e Conservação da Energia',
    enunciado: 'Em um parque de diversões, um carrinho de montanha-russa de massa m parte do repouso no topo de uma colina de altura h. Desprezando-se as forças dissipativas e atritos, qual é a expressão correta para a velocidade do carrinho no ponto mais baixo da trajetória?',
    opcoes: [
      'v = √(2 · g · h)',
      'v = 2 · g · h',
      'v = m · g · h / 2',
      'v = √(g · h / 2)',
      'v = g · h²'
    ],
    respostaCorreta: 0,
    justificativa: 'Pelo princípio da conservação da energia mecânica total: E_inicial = E_final => m·g·h = m·v²/2 => v = √(2·g·h).',
    a: 1.45,
    b: -0.65, // Fácil / Conceito fundamental
    c: 0.20
  },
  {
    id: 'enem_nat_02',
    area: 'Ciências da Natureza',
    habilidadeBNCC: 'EM13CNT102 - Termodinâmica e Ciclos Térmicos',
    enunciado: 'Um refrigerador doméstico opera segundo o ciclo de refrigeração por compressão de vapor. De acordo com a Segunda Lei da Termodinâmica aplicada a máquinas térmicas e refrigeradores, qual afirmação é fisicamente rigorosa?',
    opcoes: [
      'O calor flui espontaneamente da fonte fria para a fonte quente sem necessidade de trabalho externo.',
      'É impossível construir um refrigerador cujo único efeito seja transferir calor de um corpo mais frio para outro mais quente sem consumo de trabalho mecânico ou elétrico.',
      'O rendimento de qualquer máquina térmica atinge 100% caso não ocorra perda de matéria na combustão.',
      'A entropia de um sistema isolado em processo irreversível diminui com o passar do tempo.',
      'O refrigerador produz mais energia térmica na condensação do que consome no compressor.'
    ],
    respostaCorreta: 1,
    justificativa: 'Enunciado de Clausius da Segunda Lei: é impossível um processo cujo único resultado seja a transferência de calor de um corpo frio para outro quente sem realização de trabalho.',
    a: 1.62,
    b: 0.35, // Médio
    c: 0.20
  },
  {
    id: 'enem_nat_03',
    area: 'Ciências da Natureza',
    habilidadeBNCC: 'EM13CNT103 - Eletromagnetismo e Indução de Faraday',
    enunciado: 'Uma espira circular de cobre é mantida em repouso em uma região com campo magnético uniforme. Para induzir uma corrente elétrica mensurável nessa espira, de acordo com a Lei de Faraday-Neumann-Lenz, é imprescindível:',
    opcoes: [
      'Aumentar indefinidamente a espessura do fio condutor mantendo o campo magnético rigorosamente constante.',
      'Providenciar uma variação temporal no fluxo magnético total que atravessa a área delimitada pela espira.',
      'Manter o fluxo magnético constante e anular a temperatura do condutor.',
      'Inverter instantaneamente o sentido da gravidade no ambiente.',
      'Adicionar uma bateria sem fechar o circuito elétrico.'
    ],
    respostaCorreta: 1,
    justificativa: 'A força eletromotriz induzida (fem) é dada por ε = -dΦ_B/dt. Para existir fem induzida e corrente, deve haver variação temporal no fluxo magnético.',
    a: 1.78,
    b: 0.85, // Médio-Difícil
    c: 0.20
  },
  {
    id: 'enem_mat_01',
    area: 'Matemática',
    habilidadeBNCC: 'EM13MAT101 - Funções Exponenciais e Logaritmos',
    enunciado: 'O crescimento de uma colônia de bactérias em laboratório de biologia segue a lei exponencial N(t) = 500 · 2^(0.5 · t), em que N(t) é a quantidade de bactérias e t é o tempo em horas. Decorridas quantas horas a população inicial atingirá 8.000 bactérias?',
    opcoes: [
      '4 horas',
      '8 horas',
      '12 horas',
      '16 horas',
      '20 horas'
    ],
    respostaCorreta: 1,
    justificativa: '8.000 = 500 · 2^(0.5t) => 16 = 2^(0.5t) => 2^4 = 2^(0.5t) => 0.5t = 4 => t = 8 horas.',
    a: 1.35,
    b: -0.15, // Médio-Fácil
    c: 0.20
  },
  {
    id: 'enem_mat_02',
    area: 'Matemática',
    habilidadeBNCC: 'EM13MAT102 - Probabilidade e Análise Combinatória',
    enunciado: 'Em uma turma de iniciação científica com 10 estudantes (6 meninas e 4 meninos), o professor deseja selecionar uma equipe de 3 estudantes para apresentar um experimento de química em um congresso. Qual é a probabilidade de que a equipe sorteada seja composta por exatamente 2 meninas e 1 menino?',
    opcoes: [
      '1/2 (50%)',
      '1/3 (33,3%)',
      '1/4 (25%)',
      '3/10 (30%)',
      '1/5 (20%)'
    ],
    respostaCorreta: 0,
    justificativa: 'Total de trios possíveis: C(10,3) = (10·9·8)/(3·2·1) = 120. Trios com 2 meninas e 1 menino: C(6,2) · C(4,1) = 15 · 4 = 60. Probabilidade = 60/120 = 1/2 = 50%.',
    a: 1.85,
    b: 1.25, // Difícil
    c: 0.20
  }
];
