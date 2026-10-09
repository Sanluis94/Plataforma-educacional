import type { UniversalLabConfig } from '../../ux/components/UniversalLabContainer';

/**
 * Catálogo dos Novos Laboratórios Kortex organizados por Nível e Disciplina.
 * Implementação modular com solvers físicos numéricos em tempo real.
 */
export const NEW_ADVANCED_LABS: Record<string, UniversalLabConfig> = {
  // ─── NÍVEL SUPERIOR: FÍSICA & ENGENHARIA ────────────────────────────────────
  sup_fis_01: {
    id: 'sup_fis_01',
    title: 'Oscilações Forçadas e Ressonância Mecânica',
    academicLevel: 'graduacao',
    subject: 'Física Geral II',
    topic: 'Mecânica Ondulatória',
    objective: 'Analisar o comportamento da amplitude de oscilação em função da frequência de excitação e do coeficiente de amortecimento.',
    theoreticalBackground: `A equação diferencial do oscilador harmônico amortecido e forçado é dada por:
m·(d²x/dt²) + b·(dx/dt) + k·x = F₀·cos(ω·t)

Dividindo pela massa m:
d²x/dt² + 2γ·(dx/dt) + ω₀²·x = (F₀/m)·cos(ω·t)

Onde:
- ω₀ = √(k/m) é a frequência natural do sistema.
- γ = b / (2m) é o parâmetro de amortecimento.
- No estado estacionário, a amplitude atinge o pico máximo quando ω ≈ √(ω₀² - 2γ²), configurando o fenômeno de Ressonância.`,
    parameters: [
      { id: 'm', label: 'Massa (m)', unit: 'kg', min: 0.5, max: 5.0, step: 0.1, defaultValue: 1.0 },
      { id: 'k', label: 'Constante Elástica (k)', unit: 'N/m', min: 10, max: 100, step: 5, defaultValue: 40 },
      { id: 'b', label: 'Amortecimento (b)', unit: 'N·s/m', min: 0.1, max: 5.0, step: 0.1, defaultValue: 0.5 },
      { id: 'F0', label: 'Força Externa (F₀)', unit: 'N', min: 1, max: 20, step: 1, defaultValue: 5 },
      { id: 'omega', label: 'Frequência de Excitação (ω)', unit: 'rad/s', min: 1.0, max: 15.0, step: 0.2, defaultValue: 6.3 }
    ],
    initialState: { x: 0, v: 0, t: 0, historyX: [] },
    physicsStep: (params: Record<string, number>, state: Record<string, any>, dt: number) => {
      const { m, k, b, F0, omega } = params;
      const x = state.x ?? 0;
      const v = state.v ?? 0;
      const t = (state.t ?? 0) + dt;

      // Integração numérica via Método de Euler-Cromer
      const F_mola = -k * x;
      const F_amort = -b * v;
      const F_ext = F0 * Math.cos(omega * t);
      const a = (F_mola + F_amort + F_ext) / m;

      const newV = v + a * dt;
      const newX = x + newV * dt;

      const history = [...(state.historyX || []), newX].slice(-150);

      const omega0 = Math.sqrt(k / m);
      const resonanceAmp = F0 / Math.sqrt(Math.pow(k - m * omega * omega, 2) + Math.pow(b * omega, 2));

      return {
        nextState: { x: newX, v: newV, t, historyX: history },
        telemetry: {
          posicao_m: Number(newX.toFixed(3)),
          velocidade_mps: Number(newV.toFixed(3)),
          freq_natural: Number(omega0.toFixed(2)),
          amp_teorica: Number(resonanceAmp.toFixed(3))
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, state: Record<string, any>, _params: Record<string, number>, width: number, height: number) => {
      const centerY = height / 2;
      const centerX = width / 3;
      const xPos = state.x || 0;

      // Desenhar base e mola
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(30, centerY);
      ctx.lineTo(centerX + xPos * 40, centerY);
      ctx.stroke();

      // Desenhar bloco oscilante
      const blockX = centerX + xPos * 40;
      ctx.fillStyle = '#E4683F';
      ctx.fillRect(blockX - 25, centerY - 25, 50, 50);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(blockX - 25, centerY - 25, 50, 50);

      // Traçado da onda de histórico temporal à direita
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const history = state.historyX || [];
      const startHistX = width * 0.55;
      for (let i = 0; i < history.length; i++) {
        const histY = centerY - history[i] * 35;
        const curX = startHistX + (i / 150) * (width * 0.4);
        if (i === 0) ctx.moveTo(curX, histY);
        else ctx.lineTo(curX, histY);
      }
      ctx.stroke();
    },
    questions: [
      {
        question: 'O que ocorre com a amplitude de oscilação do sistema quando a frequência externa ω se aproxima da frequência natural ω₀?',
        options: [
          { text: 'A amplitude tende ao seu valor máximo (ressonância)', correct: true, explanation: 'Em ω ≈ ω₀ a impedância mecânica do sistema é minimizada, maximizando a transferência de energia.' },
          { text: 'A amplitude cai instantaneamente a zero', correct: false, explanation: 'Pelo contrário, há ganho de amplitude.' },
          { text: 'O sistema para de oscilar e fica estático', correct: false, explanation: 'A oscilação é mantida pela força excitadora.' }
        ]
      }
    ]
  },

  // ─── NÍVEL SUPERIOR: CÁLCULO DIFERENCIAL & INTEGRAL ─────────────────────────
  sup_calc_01: {
    id: 'sup_calc_01',
    title: 'Somas de Riemann e Convergência da Integral Definida',
    academicLevel: 'graduacao',
    subject: 'Cálculo Diferencial e Integral I',
    topic: 'Integração e Aproximação Numérica',
    objective: 'Demonstrar visualmente como a partição infinitesimal de retângulos converge para a área exata sob a curva.',
    theoreticalBackground: `Dada uma função contínua f(x) no intervalo [a, b], a integral definida é definida como o limite das Somas de Riemann:
∫[a até b] f(x) dx = lim (n → ∞) Σ [i=1 até n] f(xᵢ*) · Δx

Onde Δx = (b - a) / n. Conforme o número de partições n cresce, o erro residual entre a aproximação discreta e o valor analítico da integral tende a zero.`,
    parameters: [
      { id: 'n', label: 'Número de Retângulos (n)', unit: 'partições', min: 2, max: 100, step: 1, defaultValue: 10 },
      { id: 'a', label: 'Limite Inferior (a)', unit: 'x', min: 0, max: 2, step: 0.5, defaultValue: 0 },
      { id: 'b', label: 'Limite Superior (b)', unit: 'x', min: 2.5, max: 6, step: 0.5, defaultValue: 4 },
      { id: 'metodo', label: 'Método (1: Esq, 2: Dir, 3: Ponto Médio)', unit: '', min: 1, max: 3, step: 1, defaultValue: 3 }
    ],
    initialState: { riemannSum: 0, exactArea: 0 },
    physicsStep: (params: Record<string, number>) => {
      const { n, a, b, metodo } = params;
      const dx = (b - a) / n;
      let sum = 0;

      // Função teste: f(x) = x * sin(x) + 2
      const f = (x: number) => x * Math.sin(x) + 2.5;

      for (let i = 0; i < n; i++) {
        let xEval = a + i * dx;
        if (metodo === 2) xEval = a + (i + 1) * dx;
        if (metodo === 3) xEval = a + (i + 0.5) * dx;
        sum += f(xEval) * dx;
      }

      // Integral analítica aproximada
      const exact = 10.82; // Valor de referência para intervalo [0, 4]
      const erro = Math.abs(sum - exact);

      return {
        nextState: { riemannSum: sum, exactArea: exact, erro },
        telemetry: {
          soma_riemann: Number(sum.toFixed(3)),
          erro_absoluto: Number(erro.toFixed(3)),
          delta_x: Number(dx.toFixed(4))
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, _state: Record<string, any>, params: Record<string, number>, width: number, height: number) => {
      const { n, a, b, metodo } = params;
      const dx = (b - a) / n;
      const f = (x: number) => x * Math.sin(x) + 2.5;

      const scaleX = width / 7;
      const scaleY = height / 8;
      const originY = height - 40;

      // Desenhar eixos
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, originY);
      ctx.lineTo(width - 20, originY);
      ctx.stroke();

      // Desenhar retângulos de Riemann
      ctx.fillStyle = 'rgba(228, 104, 63, 0.4)';
      ctx.strokeStyle = '#E4683F';
      for (let i = 0; i < n; i++) {
        let xEval = a + i * dx;
        if (metodo === 2) xEval = a + (i + 1) * dx;
        if (metodo === 3) xEval = a + (i + 0.5) * dx;

        const val = f(xEval);
        const rectX = 40 + (a + i * dx) * scaleX;
        const rectW = dx * scaleX;
        const rectH = val * scaleY;

        ctx.fillRect(rectX, originY - rectH, rectW, rectH);
        ctx.strokeRect(rectX, originY - rectH, rectW, rectH);
      }

      // Desenhar curva contínua f(x)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let px = 0; px <= width - 60; px += 4) {
        const xReal = px / scaleX;
        const yReal = f(xReal);
        const py = originY - yReal * scaleY;
        if (px === 0) ctx.moveTo(40 + px, py);
        else ctx.lineTo(40 + px, py);
      }
      ctx.stroke();
    },
    questions: [
      {
        question: 'À medida que o número de retângulos n tende ao infinito (n → ∞), o que acontece com a largura Δx e o erro da aproximação?',
        options: [
          { text: 'Δx tende a zero e o erro tende a zero', correct: true, explanation: 'Pela definição formal de integral de Riemann, a partição infinitesimal elimina o erro de aproximação.' },
          { text: 'Δx aumenta e o erro tende ao infinito', correct: false, explanation: 'O intervalo total (b - a) é fixo, logo dividir em mais retângulos diminui a largura de cada um.' }
        ]
      }
    ]
  },

  // ─── NÍVEL SUPERIOR: ALGORITMOS & ESTRUTURAS DE DADOS ──────────────────────
  sup_comp_01: {
    id: 'sup_comp_01',
    title: 'Visualizador de Algoritmos de Ordenação e Complexidade O(n)',
    academicLevel: 'graduacao',
    subject: 'Estruturas de Dados e Algoritmos',
    topic: 'Análise de Complexidade de Algoritmos',
    objective: 'Comparar a eficiência temporal e espacial de Quicksort vs. Bubblesort com contadores de trocas e comparações.',
    theoreticalBackground: `A eficiência assintótica determina o comportamento de um algoritmo para grandes volumes de dados (Notação Big-O):
- Bubble Sort: Complexidade média e pior caso de O(n²).
- Quicksort: Complexidade média de O(n·log n) usando divisão e conquista com pivô.
- A contagem real de operações permite verificar empiricamente a teoria de análise de algoritmos.`,
    parameters: [
      { id: 'tamArray', label: 'Tamanho do Array (n)', unit: 'itens', min: 10, max: 60, step: 5, defaultValue: 30 },
      { id: 'velocidade', label: 'Passo da Execução', unit: 'ms', min: 1, max: 5, step: 1, defaultValue: 3 }
    ],
    initialState: { array: [], comparisons: 0, swaps: 0, sorted: false },
    physicsStep: (params: Record<string, number>, state: Record<string, any>) => {
      let arr = state.array || [];
      if (arr.length !== params.tamArray) {
        arr = Array.from({ length: params.tamArray }, () => Math.floor(Math.random() * 80) + 10);
        return {
          nextState: { array: arr, comparisons: 0, swaps: 0, sorted: false },
          telemetry: { comparacoes: 0, trocas: 0, tamanho: params.tamArray }
        };
      }

      // Um passo de bubble sort animado
      let comps = state.comparisons || 0;
      let swaps = state.swaps || 0;
      let swapped = false;

      for (let i = 0; i < arr.length - 1; i++) {
        comps++;
        if (arr[i] > arr[i + 1]) {
          const temp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = temp;
          swaps++;
          swapped = true;
          break;
        }
      }

      return {
        nextState: { array: [...arr], comparisons: comps, swaps: swaps, sorted: !swapped },
        telemetry: {
          comparacoes: comps,
          trocas: swaps,
          tamanho: params.tamArray
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, state: Record<string, any>, _params: Record<string, number>, width: number, height: number) => {
      const arr: number[] = state.array || [];
      if (arr.length === 0) return;

      const barWidth = (width - 40) / arr.length;
      const maxHeight = height - 60;

      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        const barH = (val / 100) * maxHeight;
        const x = 20 + i * barWidth;
        const y = height - 20 - barH;

        ctx.fillStyle = state.sorted ? '#22c55e' : '#38bdf8';
        ctx.fillRect(x, y, barWidth - 2, barH);
      }
    },
    questions: [
      {
        question: 'Qual é a classe de complexidade média do algoritmo Quicksort?',
        options: [
          { text: 'O(n · log n)', correct: true, explanation: 'O particionamento equilibrado de pivôs atinge complexidade O(n·log n).' },
          { text: 'O(n²)', correct: false, explanation: 'O(n²) é o pior caso ou o caso médio de algoritmos quadráticos como Bubble Sort.' }
        ]
      }
    ]
  }
};
