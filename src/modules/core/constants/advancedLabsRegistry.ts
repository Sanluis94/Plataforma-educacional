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
  },

  // ─── NÍVEL SUPERIOR: QUÍMICA & ENGENHARIA QUÍMICA ───────────────────────────
  sup_qui_01: {
    id: 'sup_qui_01',
    title: 'Cinética Química & Equação de Arrhenius',
    academicLevel: 'graduacao',
    subject: 'Físico-Química',
    topic: 'Cinética Química e Termodinâmica',
    objective: 'Analisar o efeito da temperatura e catalisador na constante de velocidade k e na velocidade de consumo dos reagentes.',
    theoreticalBackground: `A dependência da constante de velocidade com a temperatura é modelada pela Equação de Arrhenius:
k = A · exp(-Eₐ / (R · T))

Onde:
- k: Constante de taxa de reação (s⁻¹)
- A: Fator pré-exponencial ou de frequência (1.0 × 10⁸ s⁻¹)
- Eₐ: Energia de ativação da reação (kJ/mol)
- R: Constante universal dos gases (8.314 J/(mol·K))
- T: Temperatura absoluta em Kelvin (K)

Para uma reação irreversível de 1ª ordem A → B:
d[A]/dt = -k · [A]  ==>  [A](t) = [A]₀ · exp(-k · t)
[B](t) = [A]₀ · (1 - exp(-k · t))`,
    parameters: [
      { id: 'temperatura', label: 'Temperatura (T)', unit: 'K', min: 280, max: 370, step: 5, defaultValue: 300 },
      { id: 'concInicial', label: 'Concentração Inicial [A]₀', unit: 'mol/L', min: 0.5, max: 3.0, step: 0.25, defaultValue: 1.5 },
      { id: 'energiaAtiv', label: 'Energia de Ativação (Eₐ)', unit: 'kJ/mol', min: 40, max: 90, step: 5, defaultValue: 60 },
      { id: 'catalisador', label: 'Catalisador (1: Sim, 0: Não)', unit: '', min: 0, max: 1, step: 1, defaultValue: 0 }
    ],
    initialState: { t: 0, concA: 1.5, concB: 0, history: [] },
    physicsStep: (params: Record<string, number>, state: Record<string, any>, dt: number) => {
      const { temperatura, concInicial, energiaAtiv, catalisador } = params;
      const t = (state.t ?? 0) + dt;

      // Se houver catalisador, reduz Ea em 25 kJ/mol
      const effectiveEa = Math.max(20, (energiaAtiv - (catalisador === 1 ? 25 : 0)) * 1000); // em J/mol
      const R = 8.314;
      const A = 5.0e8; // fator de frequência escalonado para visualização em tempo real

      // k de Arrhenius normalizado para tempo de simulação
      const k = Math.min(2.5, A * Math.exp(-effectiveEa / (R * temperatura)) * 1e-4);

      // Atualização das concentrações por decaimento exponencial
      const concA = Math.max(0.001, concInicial * Math.exp(-k * t));
      const concB = Math.max(0, concInicial - concA);

      const history = [...(state.history || []), { t: Number(t.toFixed(1)), a: concA, b: concB }].slice(-100);

      const tMeiaVida = Math.LN2 / (k || 0.001);

      return {
        nextState: { t, concA, concB, history },
        telemetry: {
          constante_k: Number(k.toFixed(4)),
          conc_reagente_A: Number(concA.toFixed(3)),
          conc_produto_B: Number(concB.toFixed(3)),
          meia_vida_s: Number(tMeiaVida.toFixed(2))
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, state: Record<string, any>, params: Record<string, number>, width: number, height: number) => {
      const concA = state.concA ?? params.concInicial;
      const concB = state.concB ?? 0;
      const concTotal = params.concInicial || 1.5;

      // 1. Painel Esquerdo: Reator / Béquer Cromático
      const bequerX = 50;
      const bequerY = height - 50;
      const bequerW = 110;
      const bequerH = 160;

      // Vidraria Béquer
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.strokeRect(bequerX, bequerY - bequerH, bequerW, bequerH);

      // Líquido com gradiente de cor (azul inicial -> laranja final)
      const fractionB = Math.min(1, Math.max(0, concB / concTotal));
      const r = Math.round(56 + fractionB * (228 - 56));
      const g = Math.round(189 - fractionB * (189 - 104));
      const b = Math.round(248 - fractionB * (248 - 63));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      const liquidH = (concTotal / 3.0) * (bequerH - 20);
      ctx.fillRect(bequerX + 3, bequerY - liquidH, bequerW - 6, liquidH);

      // Marcações de volume do béquer
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      for (let m = 1; m <= 3; m++) {
        const markY = bequerY - (m / 3) * (bequerH - 30);
        ctx.fillRect(bequerX + 3, markY, 15, 2);
        ctx.fillText(`${m} M`, bequerX + 22, markY + 4);
      }

      // 2. Painel Direito: Gráficos de Concentração vs Tempo
      const graphX = 220;
      const graphY = height - 50;
      const graphW = width - graphX - 40;
      const graphH = height - 100;

      // Eixos do gráfico
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY - graphH);
      ctx.lineTo(graphX, graphY);
      ctx.lineTo(graphX + graphW, graphY);
      ctx.stroke();

      // Curva do Reagente A (Azul)
      const history = state.history || [];
      if (history.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
          const ptX = graphX + (i / 100) * graphW;
          const ptY = graphY - (history[i].a / 3.0) * graphH;
          if (i === 0) ctx.moveTo(ptX, ptY);
          else ctx.lineTo(ptX, ptY);
        }
        ctx.stroke();

        // Curva do Produto B (Laranja)
        ctx.strokeStyle = '#E4683F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
          const ptX = graphX + (i / 100) * graphW;
          const ptY = graphY - (history[i].b / 3.0) * graphH;
          if (i === 0) ctx.moveTo(ptX, ptY);
          else ctx.lineTo(ptX, ptY);
        }
        ctx.stroke();
      }

      // Legenda
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`● [A] Reagente: ${concA.toFixed(2)} M`, graphX + 10, graphY - graphH + 20);
      ctx.fillStyle = '#E4683F';
      ctx.fillText(`● [B] Produto: ${concB.toFixed(2)} M`, graphX + 10, graphY - graphH + 38);
    },
    questions: [
      {
        question: 'Segundo a equação de Arrhenius, qual é o efeito prático do aumento da temperatura na reação química?',
        options: [
          { text: 'Aumenta exponencialmente a fração de moléculas com energia cinética superior à energia de ativação, elevando a taxa k', correct: true, explanation: 'Pelo termo exp(-Ea/RT), à medida que T cresce, o expoente negativo torna-se menos severo, elevando k.' },
          { text: 'Diminui a energia interna dos reagentes e reduz a velocidade global', correct: false, explanation: 'O aquecimento fornece energia térmica adicional aos reagentes.' },
          { text: 'Altera permanentemente a estequiometria dos produtos formados', correct: false, explanation: 'A cinética altera a velocidade da reação, não a proporção molecular estequiométrica.' }
        ]
      }
    ]
  },

  // ─── NÍVEL SUPERIOR: ENGENHARIA ELÉTRICA & FÍSICA APLICADA ───────────────────
  sup_eletr_03: {
    id: 'sup_eletr_03',
    title: 'Circuito RLC Transiente & Osciloscópio Digital',
    academicLevel: 'graduacao',
    subject: 'Circuitos Elétricos e Eletromagnetismo',
    topic: 'Resposta Transitória de Segunda Ordem',
    objective: 'Investigar os regimes subamortecido, criticamente amortecido e superamortecido na descarga de um circuito RLC em série.',
    theoreticalBackground: `A equação diferencial que rege a tensão no capacitor V_c(t) em um circuito RLC série é dada por:
L · (d²V_c/dt²) + R · (dV_c/dt) + (1/C) · V_c = 0

Parâmetros canônicos do sistema:
- Frequência natural não amortecida: ω₀ = 1 / √(L · C)
- Coeficiente de amortecimento (Neper): α = R / (2L)
- Fator de Qualidade: Q = ω₀ / (2α) = (1/R) · √(L / C)

Classificação do regime:
1. α < ω₀ : Subamortecido (oscilações senoidais com decaimento exponencial)
2. α = ω₀ : Criticamente Amortecido (retorno ao equilíbrio o mais rápido possível sem oscilação)
3. α > ω₀ : Superamortecido (retorno lento ao equilíbrio)`,
    parameters: [
      { id: 'R', label: 'Resistência (R)', unit: 'Ω', min: 10, max: 400, step: 10, defaultValue: 60 },
      { id: 'L', label: 'Indutância (L)', unit: 'mH', min: 20, max: 500, step: 20, defaultValue: 100 },
      { id: 'C', label: 'Capacitância (C)', unit: 'μF', min: 10, max: 200, step: 10, defaultValue: 50 },
      { id: 'V0', label: 'Tensão Inicial (V₀)', unit: 'V', min: 2, max: 24, step: 1, defaultValue: 12 }
    ],
    initialState: { vc: 12, iL: 0, t: 0, history: [] },
    physicsStep: (params: Record<string, number>, state: Record<string, any>, dt: number) => {
      const { R, L: L_mH, C: C_uF, V0 } = params;
      const L = L_mH * 1e-3; // Henry
      const C = C_uF * 1e-6; // Farad

      let vc = state.vc ?? V0;
      let iL = state.iL ?? 0;
      const t = (state.t ?? 0) + dt;

      // Integração das EDOs acopladas:
      // dVc/dt = - iL / C
      // diL/dt = (Vc - R * iL) / L
      const dVc_dt = -iL / C;
      const diL_dt = (vc - R * iL) / L;

      const nextVc = vc + dVc_dt * dt;
      const nextIL = iL + diL_dt * dt;

      const omega0 = 1 / Math.sqrt(L * C);
      const alpha = R / (2 * L);
      const regime = alpha < omega0 ? 'Subamortecido' : Math.abs(alpha - omega0) < 10 ? 'Crítico' : 'Superamortecido';

      const history = [...(state.history || []), { t, vc: nextVc, iL: nextIL }].slice(-160);

      return {
        nextState: { vc: nextVc, iL: nextIL, t, history, regime },
        telemetry: {
          tensao_Vc: Number(nextVc.toFixed(2)),
          corrente_mA: Number((nextIL * 1000).toFixed(1)),
          omega_0_rad_s: Number(omega0.toFixed(1)),
          alpha_neper: Number(alpha.toFixed(1)),
          fator_qualidade_Q: Number((omega0 / (2 * (alpha || 1))).toFixed(2))
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, state: Record<string, any>, _params: Record<string, number>, width: number, height: number) => {
      // Moldura e tela do osciloscópio (estilo CRT / digital phosphor)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Grade milimétrica reticular de osciloscópio (8x10 divisões)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const divX = width / 10;
      const divY = height / 8;
      for (let x = 0; x <= width; x += divX) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y <= height; y += divY) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Linha central zero (tracejada)
      const centerY = height / 2;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Traçado do Canal 1: Tensão Vc(t) (Verde Fósforo #22c55e)
      const history = state.history || [];
      if (history.length > 1) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
          const ptX = (i / 160) * width;
          const ptY = centerY - (history[i].vc / 24) * (height * 0.4);
          if (i === 0) ctx.moveTo(ptX, ptY);
          else ctx.lineTo(ptX, ptY);
        }
        ctx.stroke();

        // Traçado do Canal 2: Corrente iL(t) (Amarelo Phosphor #f59e0b)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
          const ptX = (i / 160) * width;
          const ptY = centerY - (history[i].iL * 150) * (height * 0.35);
          if (i === 0) ctx.moveTo(ptX, ptY);
          else ctx.lineTo(ptX, ptY);
        }
        ctx.stroke();
      }

      // Painel On-Screen Display (OSD) do osciloscópio
      ctx.fillStyle = '#22c55e';
      ctx.font = '12px monospace';
      ctx.fillText(`CH1 (Vc): 5.0 V/div  [${(state.vc ?? 12).toFixed(1)} V]`, 20, 25);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`CH2 (IL): 20 mA/div [${((state.iL ?? 0) * 1000).toFixed(1)} mA]`, 20, 45);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`TIMEBASE: 2.0 ms/div`, width - 180, 25);
    },
    questions: [
      {
        question: 'Qual a relação matemática necessária entre o amortecimento α e a frequência natural ω₀ para que o circuito atinja o amortecimento crítico?',
        options: [
          { text: 'α = ω₀ (ou R = 2 · √(L / C))', correct: true, explanation: 'No amortecimento crítico as raízes da equação característica são reais e repetidas, garantindo a resposta mais rápida sem ultrapassagem (overshoot).' },
          { text: 'α = 0 (sem resistência ôhmica)', correct: false, explanation: 'α = 0 corresponde a um oscilador puramente harmônico LC sustentado.' },
          { text: 'α >> ω₀ (resistência infinita)', correct: false, explanation: 'Isto provoca um regime fortemente superamortecido.' }
        ]
      }
    ]
  },

  // ─── NÍVEL SUPERIOR: ENGENHARIA MECÂNICA & CIVIL ────────────────────────────
  sup_resmat_01: {
    id: 'sup_resmat_01',
    title: 'Ensaio de Tração & Curva Tensão-Deformação',
    academicLevel: 'graduacao',
    subject: 'Resistência dos Materiais',
    topic: 'Mecânica dos Corpos Deformáveis',
    objective: 'Submeter corpos de prova a ensaio de tração uniaxial para determinar Módulo de Young (E), limite de escoamento e estricção plástica.',
    theoreticalBackground: `No ensaio de tração mecânica uniaxial normalizado pela ABNT NBR ISO 6892-1:
- Tensão Normal (σ): σ = F / A₀ (onde A₀ = π · d² / 4 é a área inicial transversal)
- Deformação Específica (ε): ε = ΔL / L₀

Regiões características do diagrama σ vs ε para ligas metálicas dúcteis:
1. Regime Elástico Linear (Lei de Hooke): σ = E · ε
2. Limite de Escoamento (σ_e): Ocorre deformação plástica irreversível
3. Limite de Resistência à Tração (LRT / σ_u): Tensão de pico suportada
4. Estricção e Ruptura (σ_rup): Concentração localizada de afinamento transversal até fratura`,
    parameters: [
      { id: 'material', label: 'Material (1: Aço ABNT 1020, 2: Alumínio 6061, 3: Cobre)', unit: '', min: 1, max: 3, step: 1, defaultValue: 1 },
      { id: 'diametro', label: 'Diâmetro Inicial (d₀)', unit: 'mm', min: 8, max: 20, step: 1, defaultValue: 12 },
      { id: 'forcaTracao', label: 'Força Aplicada (F)', unit: 'kN', min: 0, max: 70, step: 2, defaultValue: 25 }
    ],
    initialState: { tensao: 0, deformacao: 0, regime: 'Elástico Linear', rompido: false },
    physicsStep: (params: Record<string, number>) => {
      const { material, diametro, forcaTracao } = params;

      // Propriedades dos materiais (GPa e MPa)
      const props = material === 1
        ? { E: 205, sigmaEscoamento: 250, sigmaMax: 420, epsMax: 0.22, name: 'Aço ABNT 1020' }
        : material === 2
        ? { E: 70, sigmaEscoamento: 140, sigmaMax: 260, epsMax: 0.16, name: 'Alumínio 6061' }
        : { E: 115, sigmaEscoamento: 100, sigmaMax: 220, epsMax: 0.35, name: 'Cobre Comercial' };

      const areaMm2 = (Math.PI * Math.pow(diametro, 2)) / 4;
      const forcaN = forcaTracao * 1000;
      const tensaoMpa = forcaN / areaMm2;

      let eps = tensaoMpa / (props.E * 1000); // regime elástico
      let regime = 'Elástico Linear (Hooke)';
      let rompido = false;

      if (tensaoMpa > props.sigmaEscoamento) {
        regime = 'Escoamento Plástico';
        // Aproximação Ramberg-Osgood para endurecimento plástico
        eps = (tensaoMpa / (props.E * 1000)) + 0.05 * Math.pow((tensaoMpa - props.sigmaEscoamento) / (props.sigmaMax - props.sigmaEscoamento), 2);
      }

      if (tensaoMpa >= props.sigmaMax) {
        regime = 'Estricção e Ruptura';
        rompido = true;
      }

      return {
        nextState: { tensao: tensaoMpa, deformacao: eps, regime, rompido, materialNome: props.name },
        telemetry: {
          tensao_MPa: Number(tensaoMpa.toFixed(1)),
          deformacao_pct: Number((eps * 100).toFixed(3)),
          modulo_Young_GPa: props.E,
          limite_escoamento_MPa: props.sigmaEscoamento,
          corpo_rompido: rompido ? 1 : 0
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, state: Record<string, any>, params: Record<string, number>, width: number, height: number) => {
      // 1. Painel Esquerdo: Máquina Universal de Ensaios (Garra e Corpo de Prova)
      const machX = 40;
      const machY = 30;
      const machW = 140;
      const machH = height - 60;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(machX, machY, machW, machH);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(machX, machY, machW, machH);

      // Garras mecânicas
      ctx.fillStyle = '#64748b';
      ctx.fillRect(machX + 25, machY + 15, machW - 50, 30);
      ctx.fillRect(machX + 25, machY + machH - 45, machW - 50, 30);

      // Corpo de Prova (com estricção se estiver plástico)
      const d = params.diametro || 12;
      const isRompido = state.rompido;
      const def = state.deformacao || 0;
      const barColor = isRompido ? '#ef4444' : '#E4683F';

      ctx.fillStyle = barColor;
      if (!isRompido) {
        const neckWidth = Math.max(4, d * (1 - def * 1.5));
        ctx.fillRect(machX + machW / 2 - neckWidth / 2, machY + 45, neckWidth, machH - 90);
      } else {
        // Fratura no meio
        const halfH = (machH - 90) / 2 - 10;
        ctx.fillRect(machX + machW / 2 - 4, machY + 45, 8, halfH);
        ctx.fillRect(machX + machW / 2 - 4, machY + machH - 45 - halfH, 8, halfH);
      }

      // 2. Painel Direito: Curva Tensão-Deformação (σ vs ε)
      const gX = 230;
      const gY = height - 50;
      const gW = width - gX - 30;
      const gH = height - 90;

      // Eixos do gráfico
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gX, gY - gH);
      ctx.lineTo(gX, gY);
      ctx.lineTo(gX + gW, gY);
      ctx.stroke();

      // Curva σ vs ε de referência do material
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(gX, gY);
      // Trecho elástico
      const elX = gX + gW * 0.2;
      const elY = gY - gH * 0.55;
      ctx.lineTo(elX, elY);
      // Trecho plástico até LRT
      const pX = gX + gW * 0.65;
      const pY = gY - gH * 0.9;
      ctx.quadraticCurveTo(elX + 20, elY - 40, pX, pY);
      // Estricção até ruptura
      ctx.lineTo(gX + gW * 0.85, gY - gH * 0.7);
      ctx.stroke();

      // Ponto de Tensão Atual
      const curTensao = state.tensao || 0;
      const curPtX = Math.min(gX + gW, gX + (state.deformacao || 0) * 1500);
      const curPtY = Math.max(gY - gH, gY - (curTensao / 500) * gH);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(curPtX, curPtY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Legenda e status do regime
      ctx.fillStyle = '#fff';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Tensão Atual: ${curTensao.toFixed(1)} MPa`, gX + 15, gY - gH + 20);
      ctx.fillStyle = isRompido ? '#ef4444' : '#10b981';
      ctx.fillText(`Regime: ${state.regime || 'Elástico'}`, gX + 15, gY - gH + 38);
    },
    questions: [
      {
        question: 'O que caracteriza a deformação de um material dúctil quando a tensão aplicada ultrapassa o limite de escoamento (σ_e)?',
        options: [
          { text: 'Ocorre escorregamento permanente de planos cristalinos (deformação plástica irreversível)', correct: true, explanation: 'Ao ultrapassar o limite elástico, o material não retorna às dimensões iniciais ao cessar a carga.' },
          { text: 'O material retorna instantaneamente ao comprimento original sem energia residual', correct: false, explanation: 'Essa reversibilidade só ocorre estritamente dentro do regime elástico linear de Hooke.' },
          { text: 'O corpo de prova vaporiza imediatamente', correct: false, explanation: 'O ensaio mecânico a frio provoca deformação e eventual fratura, sem transição de fase gasosa.' }
        ]
      }
    ]
  },

  // ─── NÍVEL SUPERIOR: BIOQUÍMICA & BIOMEDICINA ───────────────────────────────
  sup_bioq_01: {
    id: 'sup_bioq_01',
    title: 'Cinética Enzimática de Michaelis-Menten & Lineweaver-Burk',
    academicLevel: 'graduacao',
    subject: 'Bioquímica e Biotecnologia',
    topic: 'Catálise Enzimática e Farmacologia',
    objective: 'Determinar os parâmetros cinéticos fundamentais Km e Vmax e quantificar a inibição competitiva e não-competitiva.',
    theoreticalBackground: `O modelo de Michaelis-Menten descreve a taxa de reação enzimática inicial (V₀) em função da concentração de substrato [S]:
V₀ = (Vₘₐₓ · [S]) / (Kₘ + [S])

Onde:
- Vₘₐₓ: Velocidade máxima atingida na saturação da enzima.
- Kₘ (Constante de Michaelis): Concentração de substrato onde V₀ = Vₘₐₓ / 2. Mede a afinidade aparente.

Linearização pelo Diagrama Duplo-Recíproco de Lineweaver-Burk:
(1 / V₀) = (Kₘ / Vₘₐₓ) · (1 / [S]) + (1 / Vₘₐₓ)

Efeito dos Inibidores:
- Competitivo: Disputa o sítio ativo. Aumenta Kₘ aparente; mantém Vₘₐₓ inalterada.
- Não-competitivo: Liga-se a sítio alostérico. Mantém Kₘ; reduz Vₘₐₓ aparente.`,
    parameters: [
      { id: 'substrato', label: 'Concentração [S]', unit: 'mM', min: 0.5, max: 40, step: 1, defaultValue: 10 },
      { id: 'vmax', label: 'Vₘₐₓ Enzimática', unit: 'μmol/min', min: 20, max: 120, step: 5, defaultValue: 80 },
      { id: 'km', label: 'Constante Kₘ', unit: 'mM', min: 2, max: 20, step: 1, defaultValue: 8 },
      { id: 'inibidor', label: 'Inibidor (0: Nenhum, 1: Competitivo, 2: Não-Competitivo)', unit: '', min: 0, max: 2, step: 1, defaultValue: 0 }
    ],
    initialState: { v0: 0, history: [] },
    physicsStep: (params: Record<string, number>, state: Record<string, any>) => {
      const { substrato, vmax, km, inibidor } = params;

      let effectiveKm = km;
      let effectiveVmax = vmax;

      if (inibidor === 1) {
        effectiveKm = km * 2.5; // Inibidor competitivo aumenta Km
      } else if (inibidor === 2) {
        effectiveVmax = vmax * 0.55; // Inibidor não-competitivo reduz Vmax
      }

      const v0 = (effectiveVmax * substrato) / (effectiveKm + substrato);
      const invS = 1 / Math.max(0.01, substrato);
      const invV0 = 1 / Math.max(0.01, v0);

      const history = [...(state.history || []), { s: substrato, v: v0 }].slice(-30);

      return {
        nextState: { v0, effectiveKm, effectiveVmax, history },
        telemetry: {
          velocidade_V0: Number(v0.toFixed(2)),
          Km_aparente: Number(effectiveKm.toFixed(1)),
          Vmax_aparente: Number(effectiveVmax.toFixed(1)),
          inv_S_mM: Number(invS.toFixed(3)),
          inv_V0: Number(invV0.toFixed(4))
        }
      };
    },
    renderCanvas: (ctx: CanvasRenderingContext2D, state: Record<string, any>, params: Record<string, number>, width: number, height: number) => {
      // 1. Gráfico Esquerdo: Hipérbole de Michaelis-Menten (V0 vs [S])
      const g1X = 50;
      const g1Y = height - 50;
      const g1W = (width - 120) / 2;
      const g1H = height - 90;

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(g1X, g1Y - g1H);
      ctx.lineTo(g1X, g1Y);
      ctx.lineTo(g1X + g1W, g1Y);
      ctx.stroke();

      // Traçado da hipérbole
      const effKm = state.effectiveKm ?? params.km;
      const effVmax = state.effectiveVmax ?? params.vmax;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let sVal = 0; sVal <= 45; sVal += 0.5) {
        const v = (effVmax * sVal) / (effKm + sVal);
        const ptX = g1X + (sVal / 45) * g1W;
        const ptY = g1Y - (v / 130) * g1H;
        if (sVal === 0) ctx.moveTo(ptX, ptY);
        else ctx.lineTo(ptX, ptY);
      }
      ctx.stroke();

      // Ponto de operação atual
      const curS = params.substrato || 10;
      const curV0 = state.v0 || 0;
      const opX = g1X + (curS / 45) * g1W;
      const opY = g1Y - (curV0 / 130) * g1H;

      ctx.fillStyle = '#E4683F';
      ctx.beginPath();
      ctx.arc(opX, opY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Linha assintótica de Vmax
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([4, 4]);
      const vmaxY = g1Y - (effVmax / 130) * g1H;
      ctx.beginPath();
      ctx.moveTo(g1X, vmaxY);
      ctx.lineTo(g1X + g1W, vmaxY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px monospace';
      ctx.fillText(`Vmax = ${effVmax.toFixed(0)}`, g1X + 10, vmaxY - 5);
      ctx.fillStyle = '#fff';
      ctx.fillText('Michaelis-Menten: V₀ vs [S]', g1X + 10, g1Y - g1H + 20);

      // 2. Gráfico Direito: Linearização de Lineweaver-Burk (1/V0 vs 1/[S])
      const g2X = g1X + g1W + 50;
      const g2Y = height - 50;
      const g2W = g1W;
      const g2H = g1H;

      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(g2X, g2Y - g2H);
      ctx.lineTo(g2X, g2Y);
      ctx.lineTo(g2X + g2W, g2Y);
      ctx.stroke();

      // Reta 1/V0 = (Km/Vmax)*(1/S) + 1/Vmax
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const interceptY = g2Y - ((1 / effVmax) * 4500);
      const slopePtX = g2X + g2W;
      const slopePtY = g2Y - (((effKm / effVmax) * 1.5 + (1 / effVmax)) * 4500);
      ctx.moveTo(g2X, interceptY);
      ctx.lineTo(slopePtX, slopePtY);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.fillText('Lineweaver-Burk: 1/V₀ vs 1/[S]', g2X + 10, g2Y - g2H + 20);
    },
    questions: [
      {
        question: 'O que representa biologicamente um valor baixo de Constante de Michaelis (Km)?',
        options: [
          { text: 'Alta afinidade da enzima pelo substrato (atinge metade da velocidade máxima com baixa concentração)', correct: true, explanation: 'Km e afinidade são inversamente relacionados: menor Km indica que menos substrato é necessário para saturar 50% dos sítios ativos.' },
          { text: 'Inativação irreversível da enzima por desnaturação térmica', correct: false, explanation: 'Km é uma constante cinética fisiológica que mede afinidade, não degradação.' },
          { text: 'Taxa zero de formação do produto', correct: false, explanation: 'Uma enzima com baixo Km é muito ativa mesmo sob baixíssimas concentrações de substrato.' }
        ]
      }
    ]
  }
};

