const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// ==============================================================================
// CORES OFICIAIS — V1_Validação.pdf (Edu-Interact)
// ==============================================================================
const cVerdePrimary = rgb(41 / 255, 62 / 255, 36 / 255);      // #293E24
const cVerdeDark    = rgb(23 / 255, 35 / 255, 20 / 255);      // #172314
const cVerdeLight   = rgb(61 / 255, 91 / 255, 54 / 255);      // #3D5B36
const cVerdeTint    = rgb(240 / 255, 244 / 255, 239 / 255);  // sutil
const cLaranjaAction= rgb(228 / 255, 104 / 255, 63 / 255);    // #E4683F
const cLaranjaTint  = rgb(253 / 255, 243 / 255, 239 / 255);  // sutil
const cVermelho     = rgb(188 / 255, 57 / 255, 31 / 255);     // #BC391F
const cNudeBg       = rgb(250 / 255, 247 / 255, 238 / 255);  // #FAF7EE
const cNudeBorder   = rgb(226 / 255, 215 / 255, 195 / 255);  // #E2D7C3
const cTextMain     = rgb(23 / 255, 35 / 255, 20 / 255);      // #172314
const cTextMuted    = rgb(86 / 255, 100 / 255, 82 / 255);     // #566452
const cWhite        = rgb(1, 1, 1);

// Helper para sanitizar caracteres não suportados por WinAnsi (como letras gregas e raiz)
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/≈/g, '~=')
    .replace(/×/g, 'x')
    .replace(/•/g, '-')
    .replace(/’/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/[—–]/g, '-');
}

// Helper para quebra de texto respeitando a largura máxima em pontos
function wrapText(text, font, size, maxWidth) {
  text = sanitizeText(text);
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

async function buildPdf() {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  // Dimensões da Página (A4: 595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const contentWidth = pageWidth - (margin * 2);

  let currentPage = null;
  let cursorY = 0;
  const pagesList = [];

  function addNewPage() {
    currentPage = doc.addPage([pageWidth, pageHeight]);
    pagesList.push(currentPage);
    cursorY = pageHeight - margin - 35; // espaço para cabeçalho
    return currentPage;
  }

  function ensureSpace(neededHeight) {
    if (!currentPage || (cursorY - neededHeight) < (margin + 35)) {
      addNewPage();
    }
  }

  // Elemento: Título de Seção Principal
  function drawSectionHeader(title, subtitle) {
    ensureSpace(60);
    
    // Tarja / Linha decorativa
    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 2,
      width: 4,
      height: 24,
      color: cLaranjaAction
    });

    currentPage.drawText(title, {
      x: margin + 12,
      y: cursorY + 6,
      size: 15,
      font: fontBold,
      color: cVerdePrimary
    });

    if (subtitle) {
      currentPage.drawText(subtitle, {
        x: margin + 12,
        y: cursorY - 8,
        size: 9,
        font: fontRegular,
        color: cTextMuted
      });
      cursorY -= 28;
    } else {
      cursorY -= 22;
    }
  }

  // Elemento: Box de Slide
  function drawSlideBlock(slideNum, title, time, speechText, actionText, conceptText) {
    // Estimativa de altura
    const speechLines = wrapText(speechText, fontRegular, 9.5, contentWidth - 28);
    const actionLines = wrapText(actionText, fontOblique, 8.5, contentWidth - 28);
    const conceptLines = wrapText(conceptText, fontRegular, 8.5, contentWidth - 28);

    const blockHeight = 32 + (speechLines.length * 13) + (actionLines.length * 12) + (conceptLines.length * 12) + 26;

    ensureSpace(blockHeight + 10);

    const boxTop = cursorY;

    // Fundo do card
    currentPage.drawRectangle({
      x: margin,
      y: boxTop - blockHeight,
      width: contentWidth,
      height: blockHeight,
      color: cWhite,
      borderColor: cNudeBorder,
      borderWidth: 1
    });

    // Barra de cabeçalho do card
    currentPage.drawRectangle({
      x: margin,
      y: boxTop - 24,
      width: contentWidth,
      height: 24,
      color: cVerdeTint,
      borderColor: cNudeBorder,
      borderWidth: 1
    });

    // Tag do Slide
    currentPage.drawText(`SLIDE ${slideNum < 10 ? '0' + slideNum : slideNum} • ${title}`, {
      x: margin + 12,
      y: boxTop - 16,
      size: 10,
      font: fontBold,
      color: cVerdePrimary
    });

    // Badge de Tempo
    const timeText = `Tempo: ${time}`;
    const timeWidth = fontBold.widthOfTextAtSize(timeText, 8.5);
    currentPage.drawText(timeText, {
      x: margin + contentWidth - timeWidth - 12,
      y: boxTop - 16,
      size: 8.5,
      font: fontBold,
      color: cLaranjaAction
    });

    let currentY = boxTop - 38;

    // Rótulo Discurso
    currentPage.drawText("FALA SUGERIDA (VERBATIM):", {
      x: margin + 12,
      y: currentY,
      size: 8,
      font: fontBold,
      color: cLaranjaAction
    });
    currentY -= 12;

    // Linhas de discurso
    for (const line of speechLines) {
      currentPage.drawText(line, {
        x: margin + 12,
        y: currentY,
        size: 9.5,
        font: fontRegular,
        color: cTextMain
      });
      currentY -= 13;
    }

    currentY -= 4;

    // Rótulo Ação
    currentPage.drawText("ACAO / GATILHO VISUAL NA TELA:", {
      x: margin + 12,
      y: currentY,
      size: 8,
      font: fontBold,
      color: cVerdeLight
    });
    currentY -= 11;

    for (const line of actionLines) {
      currentPage.drawText(line, {
        x: margin + 12,
        y: currentY,
        size: 8.5,
        font: fontOblique,
        color: cVerdePrimary
      });
      currentY -= 12;
    }

    currentY -= 4;

    // Rótulo Fundamento
    currentPage.drawText("CONCEITO-CHAVE:", {
      x: margin + 12,
      y: currentY,
      size: 8,
      font: fontBold,
      color: cTextMuted
    });
    currentY -= 11;

    for (const line of conceptLines) {
      currentPage.drawText(line, {
        x: margin + 12,
        y: currentY,
        size: 8.5,
        font: fontRegular,
        color: cTextMuted
      });
      currentY -= 12;
    }

    cursorY = boxTop - blockHeight - 14;
  }

  // Elemento: Bloco de Q&A
  function drawQaBlock(num, question, answer) {
    const qLines = wrapText(question, fontBold, 10, contentWidth - 28);
    const aLines = wrapText(answer, fontRegular, 9, contentWidth - 28);
    const blockHeight = (qLines.length * 14) + (aLines.length * 13) + 28;

    ensureSpace(blockHeight + 10);
    const boxTop = cursorY;

    currentPage.drawRectangle({
      x: margin,
      y: boxTop - blockHeight,
      width: contentWidth,
      height: blockHeight,
      color: cWhite,
      borderColor: cNudeBorder,
      borderWidth: 1
    });

    let currentY = boxTop - 16;
    currentPage.drawText(`PERGUNTA PROVAVEL 0${num}:`, {
      x: margin + 12,
      y: currentY,
      size: 8,
      font: fontBold,
      color: cVermelho
    });
    currentY -= 12;

    for (const line of qLines) {
      currentPage.drawText(line, {
        x: margin + 12,
        y: currentY,
        size: 10,
        font: fontBold,
        color: cVerdeDark
      });
      currentY -= 14;
    }

    currentY -= 4;
    currentPage.drawText("RESPOSTA TÁTICA SUGERIDA:", {
      x: margin + 12,
      y: currentY,
      size: 8,
      font: fontBold,
      color: cLaranjaAction
    });
    currentY -= 11;

    for (const line of aLines) {
      currentPage.drawText(line, {
        x: margin + 12,
        y: currentY,
        size: 9,
        font: fontRegular,
        color: cTextMain
      });
      currentY -= 13;
    }

    cursorY = boxTop - blockHeight - 12;
  }

  // ============================================================================
  // PÁGINA 1: CAPA & CRONOGRAMA DE APRESENTAÇÃO
  // ============================================================================
  addNewPage();

  // Fundo sutil do cabeçalho da capa
  currentPage.drawRectangle({
    x: margin,
    y: cursorY - 145,
    width: contentWidth,
    height: 145,
    color: cNudeBg,
    borderColor: cNudeBorder,
    borderWidth: 1
  });

  // Marca d'água / Logo text
  currentPage.drawText("Kortex", {
    x: margin + 20,
    y: cursorY - 34,
    size: 24,
    font: fontBold,
    color: cVerdePrimary
  });

  currentPage.drawText("Onde a raiz encontra o circuito", {
    x: margin + 20,
    y: cursorY - 50,
    size: 11,
    font: fontOblique,
    color: cLaranjaAction
  });

  currentPage.drawText("UNIVERSIDADE DE SOROCABA (UNISO) - DEFESA DE TCC 2026", {
    x: margin + 20,
    y: cursorY - 74,
    size: 10,
    font: fontBold,
    color: cVerdeDark
  });

  currentPage.drawText("Discentes: Gabriel Ramalho Resende, Luis Antonio de Albuquerque Adamski,", {
    x: margin + 20,
    y: cursorY - 92,
    size: 8.5,
    font: fontRegular,
    color: cTextMain
  });

  currentPage.drawText("Luis Filipe Giglio Frasao, Victor Augusto Pereira Nascimento", {
    x: margin + 20,
    y: cursorY - 105,
    size: 8.5,
    font: fontRegular,
    color: cTextMain
  });

  currentPage.drawText("Orientador: Prof. Denicezar Angelo Baldo - Curso: Ciencia da Computacao / Engenharia", {
    x: margin + 20,
    y: cursorY - 124,
    size: 8.5,
    font: fontBold,
    color: cVerdePrimary
  });

  cursorY -= 165;

  // Box de Orientações Gerais de Apresentação
  drawSectionHeader("1. Estrutura de Pacing & Cronograma (15 Minutos de Defesa)", "Distribuição temporal precisa para garantir o cumprimento do regulamento acadêmico");

  const pacingData = [
    { bloco: "Bloco 1 (00:00 - 02:30)", nome: "Abertura & O Problema do Abstracionismo", foco: "Slides 1 e 2: Postura firme, cumprimentar a banca, destacar déficit de laboratórios e 4 pilares." },
    { bloco: "Bloco 2 (02:30 - 05:00)", nome: "Objetivos & Engenharia do Ciclo CSFA", foco: "Slides 3 e 4: Clareza acadêmica, stack técnica moderna e o ciclo Conhecer-Simular-Formular-Agir." },
    { bloco: "Bloco 3 (05:00 - 11:30)", nome: "Demonstrações Práticas Interativas (O Clímax)", foco: "Slides 5, 6 e 7: Pêndulo Físico ao vivo, Suíte de Acessibilidade DUA e Matriz TRI 3PL." },
    { bloco: "Bloco 4 (11:30 - 14:00)", nome: "Resultados Empíricos & Conclusão Científica", foco: "Slides 8 e 9: 72 laboratórios, 0s de latência, +42% engajamento e validação da hipótese." },
    { bloco: "Bloco 5 (14:00 - 15:00)", nome: "Agradecimentos & Transição para Arguição", foco: "Slide 10: Fechamento com a frase-lema, agradecimento aos mestres e postura receptiva." }
  ];

  for (const item of pacingData) {
    ensureSpace(38);
    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 32,
      width: contentWidth,
      height: 32,
      color: cWhite,
      borderColor: cNudeBorder,
      borderWidth: 1
    });

    currentPage.drawText(item.bloco, {
      x: margin + 10,
      y: cursorY - 16,
      size: 8.5,
      font: fontBold,
      color: cLaranjaAction
    });

    currentPage.drawText(item.nome, {
      x: margin + 140,
      y: cursorY - 16,
      size: 9,
      font: fontBold,
      color: cVerdePrimary
    });

    currentPage.drawText(item.foco, {
      x: margin + 10,
      y: cursorY - 26,
      size: 7.8,
      font: fontRegular,
      color: cTextMuted
    });

    cursorY -= 38;
  }

  cursorY -= 10;

  // ============================================================================
  // SEÇÃO 2: ROTEIRO SLIDE A SLIDE COM FALAS VERBATIM (10 SLIDES)
  // ============================================================================
  drawSectionHeader("2. Roteiro de Falas Slide a Slide (Discurso Verbatim)", "Discurso completo com marcações de ação, entonação e fundamentação para a banca");

  drawSlideBlock(
    1,
    "Capa: Kortex — Onde a raiz encontra o circuito",
    "00:00 - 01:15",
    "Prezados membros da banca examinadora, orientador Prof. Denicezar, colegas e presentes, tenham um excelente dia. Em nome de nossa equipe da Universidade de Sorocaba (UNISO) — composta por Gabriel Ramalho Resende, Luis Antonio de Albuquerque Adamski, Luis Filipe Giglio Frasao e Victor Augusto Pereira Nascimento —, e uma honra imensa apresentar hoje o Trabalho de Conclusao de Curso da plataforma Kortex: 'Onde a raiz encontra o circuito'. O projeto nasce de uma conviccao basilar: a tecnologia educacional de ponta nao deve romper com a tradicao filosofica, mas sim honra-la. Sintetizamos quatro pilares centenarios: a maieutica socratica na nossa IA, o empirismo aristotelico nos nossos laboratorios virtuais, a educacao dialogica de Paulo Freire e as neurociencias aplicadas pelo Desenho Universal para a Aprendizagem (DUA).",
    "Mantenha contato visual sereno com os membros da banca. Aponte para o logotipo oficial no slide e para os 4 pilares destacados no rodape.",
    "Fundamentacao humanista, equipe da UNISO e integracao curricular com a BNCC e ODS 4 da ONU."
  );

  drawSlideBlock(
    2,
    "Introdução: O Abstracionismo Excessivo na Educação Básica",
    "01:15 - 02:45",
    "Ao analisarmos o ensino de ciências da natureza e matemática no Brasil, deparamo-nos com uma realidade alarmante: de acordo com o Censo Escolar, menos de 15% das escolas públicas possuem laboratórios funcionais de ciências. As consequências são devastadoras: a física torna-se uma decoreba estéril de fórmulas decoradas para a prova, desprovidas de intuição física. Para estudantes neurodivergentes — como jovens com dislexia e TDAH —, materiais didáticos estáticos e sem contraste representam barreiras cognitivas quase intransponíveis. O Kortex foi arquitetado precisamente para quebrar esse ciclo de exclusão.",
    "Aponte para o contraste entre a coluna de 'Diagnóstico Crítico' (em vermelho) e a síntese da 'Resposta Proposta' (em verde).",
    "Conexão entre falta de experimentação prática e índices de evasão no Ensino Médio."
  );

  drawSlideBlock(
    3,
    "Objetivos: Propósito Científico e Tecnológico",
    "02:45 - 04:00",
    "Nosso objetivo geral consistiu em conceber, desenvolver e validar empiricamente uma plataforma web aberta, responsiva e universalmente acessível, integrando simulações computacionais em tempo real, tutoria cognitiva orientada por IA maiêutica e avaliação diagnóstica com Teoria de Resposta ao Item (TRI). Para materializar essa meta, estruturamos quatro objetivos específicos: 1) construir 72 laboratórios virtuais em Canvas 2D; 2) implantar os três princípios do DUA por padrão; 3) desenvolver um agente socrático que desafie o estudante sem entregar o gabarito; e 4) automatizar a devolutiva docente com latência zero.",
    "Destaque cada um dos 4 cards de objetivos específicos, ressaltando o equilíbrio entre rigor computacional e impacto pedagógico.",
    "Metas SMART, aderência à engenharia de requisitos e psicometria moderna."
  );

  drawSlideBlock(
    4,
    "Materiais e Métodos: Arquitetura Técnica e Ciclo CSFA",
    "04:00 - 05:30",
    "Do ponto de vista da engenharia de software, escolhemos o React 18 com empacotamento Vite para assegurar carregamento inferior a 800 milissegundos mesmo em conexões lentas de escolas públicas. Nossas simulações físicas rodam nativamente no navegador utilizando a API Canvas 2D e resolução numérica de equações diferenciais a 60 quadros por segundo. Para garantir soberania e zero latência na síntese de voz, integramos a Web Speech API nativa. Toda essa arquitetura sustenta nossa metodologia pedagógica autoral: o Ciclo CSFA — onde o aluno primeiro Conhece o fenômeno, Simula sem medo de errar, Formula a equação e Age na resolução de problemas reais.",
    "Apresente os cartões de tecnologia e explique didaticamente o diagrama do Ciclo CSFA: Conhecer, Simular, Formular e Agir.",
    "Arquitetura SPA orientada a eventos, componentes desacoplados e modelagem matemática."
  );

  drawSlideBlock(
    5,
    "Demonstração 01: Laboratório Virtual de Pêndulo Gravitacional",
    "05:30 - 07:30",
    "Convido agora a banca a acompanhar nossa primeira demonstração ao vivo, embutida diretamente aqui na nossa apresentação. Observem este pêndulo simples oscilando com física real. A equação fundamental é T = 2π√(L/g). Em uma aula expositiva tradicional, o professor apenas escreve essa fórmula. No Kortex, o aluno altera o comprimento do fio e vê o período se expandir. E mais: ao clicar no botão 'Lua', a gravidade cai para 1.62 m/s² e a oscilação se torna suave e lenta. Ao selecionar 'Júpiter', com 24.8 m/s², a restauração é violenta. Isso é Aristóteles no século XXI: a apreensão do conceito pela experiência empírica direta.",
    "CLIQUE AO VIVO nos botões 'Lua' e 'Júpiter' no slide! Alterne o slider de comprimento de 1.5m para 2.5m e aponte para a telemetria que atualiza o período T e a frequência instantaneamente.",
    "Empirismo aristotélico, visualização dinâmica de grandezas físicas e ausência de risco de quebra de equipamentos laboratoriais."
  );

  drawSlideBlock(
    6,
    "Demonstração 02: Suíte de Acessibilidade Universal (DUA)",
    "07:30 - 09:30",
    "Nossa segunda demonstração materializa o Desenho Universal para a Aprendizagem. Na grande maioria dos softwares educativos, a acessibilidade é um mero puxadinho ou plugin terceirizado. No Kortex, ela é nativa. Vejam: com um clique no botão 'Fonte Dislexia', todas as fontes adotam pesos inferiores maiores e espaçamento ampliado, eliminando confusões visuais entre letras como 'b' e 'd'. Ao ativar a 'Régua de Leitura', criamos uma máscara de foco visual que acompanha o cursor, reduzindo a dispersão visual para alunos com TDAH. E com o 'Leitor de Voz', ativamos a sintetização nativa em português sem consumir tráfego de dados.",
    "CLIQUE AO VIVO no botão 'Fonte Dislexia' (observe a tipografia mudando em tempo real) e ative o 'Leitor de Voz' por alguns segundos para que a banca escute a síntese de fala no navegador.",
    "Os 3 princípios do CAST/DUA: Múltiplos meios de representação, ação/expressão e engajamento. Conformidade WCAG 2.1 nível AAA."
  );

  drawSlideBlock(
    7,
    "Demonstração 03: Avaliação Diagnóstica TRI e Painel Docente",
    "09:30 - 11:30",
    "A terceira demonstração aborda a dor do professor. Observem este item modelo ENEM sobre o período na Lua. Quando o estudante seleciona a alternativa B e responde, a devolutiva pedagógica ocorre em exatos 12 milissegundos. Não há gabarito estático: a questão é calibrada com parâmetros de discriminação 'a', dificuldade 'b' e acerto casual 'c' da TRI 3PL. Simultaneamente, o Painel do Professor sintetiza o domínio das habilidades da turma. Reparem neste destaque em vermelho: a habilidade H3 obteve apenas 42% de acerto. O sistema imediatamente rotula como 'Alerta Pedagógico de Intervenção Prioritária', poupando dias de correção docente e viabilizando reforço pontual.",
    "CLIQUE na alternativa B da questão modelo. Aponte para o badge verde de 'Latência: 12ms' e, no gráfico ao lado, destaque o alerta vermelho de intervenção prioritária.",
    "Teoria de Resposta ao Item (modelo logístico de 3 parâmetros), curva característica do item (CCI) e diagnóstico formativo contínuo."
  );

  drawSlideBlock(
    8,
    "Resultados: Métricas de Validação e Eficácia Empírica",
    "11:30 - 13:00",
    "Sintetizando nossos resultados quantitativos e qualitativos: desenvolvemos com sucesso mais de 72 laboratórios virtuais ativos cobrindo 12 disciplinas das ciências exatas e naturais. Registramos latência zero na devolutiva pedagógica e nos cálculos de simulação local. Nos testes empíricos com turmas de validação, registramos um aumento de 42% na retenção de conceitos físicos complexos comparado a grupos de controle que utilizaram apenas listas impressas em PDF. Além disso, a aplicação atingiu 100% de conformidade com as diretrizes WCAG 2.1 nível AAA, comprovando que o rigor técnico pode e deve andar de mãos dadas com a equidade de acesso.",
    "Apresente com segurança os quatro grandes KPIs no topo do slide (72 labs, 0s latência, +42% engajamento, 100% DUA) e discorra brevemente sobre o ganho de tempo dos professores.",
    "Validação experimental, mensuração de usabilidade segundo o System Usability Scale (SUS) e telemetria de engajamento."
  );

  drawSlideBlock(
    9,
    "Conclusão: A Raiz Conectada ao Circuito",
    "13:00 - 14:15",
    "Chegamos à conclusão de que a hipótese central deste trabalho foi amplamente corroborada: a fusão harmoniosa entre o empirismo investigativo, a maiêutica socrática e a neurociência do DUA não apenas é tecnicamente viável na web moderna, como resgata o encanto da ciência para uma geração que rejeita a passividade. O Kortex demonstra que uma escola pública sem espaço físico para vidrarias de química e trilhos de ar pode proporcionar uma formação científica de primeiro mundo através da tela. Como trabalhos futuros, planejamos a extensão com WebXR para realidade aumentada e modelos de linguagem socráticos rodando offline via WebGPU.",
    "Apresente os 3 pilares de conclusão (Validação, Acessibilidade e Escalabilidade) e finalize com tom propositivo olhando para o horizonte da pesquisa.",
    "Contribuição científica para a área de Informática na Educação (SBIE) e impacto social na democratização do saber."
  );

  drawSlideBlock(
    10,
    "Encerramento: Agradecimentos e Abertura para a Banca",
    "14:15 - 15:00",
    "Gostaria de encerrar expressando minha mais profunda gratidão a esta respeitável banca examinadora pela leitura atenta e contribuições valorosas, ao meu orientador pelo estímulo contínuo e à instituição por fornecer a base acadêmica sólida que tornou este projeto possível. Deixo a plataforma à disposição de vocês para testes e abro a palavra para perguntas, arguições e comentários. Muito obrigado!",
    "Encerre com uma reverência respeitosa, sorriso confiante e postura aberta. Mantenha os slides à vista para recorrer a qualquer tela durante as respostas.",
    "Postura acadêmica, segurança científica e receptividade ao debate de alto nível."
  );

  // ============================================================================
  // SEÇÃO 3: PITCH EXECUTIVO / COMERCIAL (3 MINUTOS)
  // ============================================================================
  drawSectionHeader("3. Pitch Executivo / Comercial (3 Minutos — Elevator Pitch)", "Roteiro condensado para investidores de impacto social, secretarias de educação e gestores escolares");

  ensureSpace(140);
  const pitchIntro = "Este pitch é ideal para apresentações rápidas de captação de recursos, feiras de inovação (ex: Bett Brasil) ou reuniões decisórias com secretários de educação:";
  const pIntroLines = wrapText(pitchIntro, fontOblique, 9, contentWidth);
  for (const l of pIntroLines) {
    currentPage.drawText(l, { x: margin, y: cursorY, size: 9, font: fontOblique, color: cTextMuted });
    cursorY -= 13;
  }
  cursorY -= 8;

  const pitchSteps = [
    {
      minuto: "Minuto 00:00 - 00:45",
      titulo: "O Gancho & A Dor do Mercado",
      texto: "Vocês sabiam que 85% das escolas públicas do Brasil não possuem laboratório de física e química? Isso significa que milhões de jovens terminam o Ensino Médio sem nunca terem visto um experimento prático, decorando fórmulas que esquecem semanas depois. O resultado? Baixo desempenho no ENEM, desengajamento em massa e sobrecarga extrema de professores que passam noites inteiras corrigindo provas à mão."
    },
    {
      minuto: "Minuto 00:45 - 01:45",
      titulo: "A Solução Kortex",
      texto: "Nós criamos o Kortex: uma plataforma educacional completa onde a raiz do pensamento pedagógico encontra o circuito da tecnologia de ponta. São mais de 72 laboratórios virtuais interativos rodando direto no navegador, a 60 FPS, sem precisar instalar nada. O aluno mexe na gravidade, altera o pH, queima reagentes e aprende por tentativa e descoberta. E ao lado dele, nosso tutor socrático por IA nunca dá a resposta de graça: ele faz a pergunta certa para o aluno deduzir a lógica por si mesmo."
    },
    {
      minuto: "Minuto 01:45 - 02:30",
      titulo: "Diferenciais Únicos & ROI Pedagógico",
      texto: "Diferente dos simuladores estrangeiros pesados, o Kortex nasce 100% inclusivo, com Desenho Universal para a Aprendizagem: quem tem dislexia lê com fonte adaptada; quem tem TDAH usa nossa régua de foco visual; e quem tem baixa visão conta com síntese vocal nativa. E para a escola, o ganho é imediato: nossa correção com modelo psicométrico TRI tem latência zero, gerando relatórios de intervenção na hora. Reduzimos o tempo de correção de dias para zero segundos e aumentamos a retenção conceitual em 42%."
    },
    {
      minuto: "Minuto 02:30 - 03:00",
      titulo: "Chamada para Ação & Impacto",
      texto: "O Kortex democratiza o acesso à ciência de alto nível para qualquer rede escolar pública ou privada, rodando até nos computadores e celulares mais simples. Estamos prontos para rodar pilotos e transformar o ensino de exatas do Brasil. Muito obrigado!"
    }
  ];

  for (const step of pitchSteps) {
    const sLines = wrapText(step.texto, fontRegular, 9, contentWidth - 24);
    const sHeight = 24 + (sLines.length * 13) + 14;
    ensureSpace(sHeight + 8);
    const sTop = cursorY;

    currentPage.drawRectangle({
      x: margin,
      y: sTop - sHeight,
      width: contentWidth,
      height: sHeight,
      color: cWhite,
      borderColor: cNudeBorder,
      borderWidth: 1
    });

    currentPage.drawText(`${step.minuto} • ${step.titulo}`, {
      x: margin + 12,
      y: sTop - 16,
      size: 9.5,
      font: fontBold,
      color: cLaranjaAction
    });

    let sy = sTop - 30;
    for (const line of sLines) {
      currentPage.drawText(line, {
        x: margin + 12,
        y: sy,
        size: 9,
        font: fontRegular,
        color: cTextMain
      });
      sy -= 13;
    }

    cursorY = sTop - sHeight - 10;
  }

  // ============================================================================
  // SEÇÃO 4: GUIA DE DEFESA CONTRA PERGUNTAS PROVÁVEIS DA BANCA (Q&A TÁTICO)
  // ============================================================================
  drawSectionHeader("4. Guia de Defesa contra Perguntas Prováveis da Banca (Q&A)", "Respostas estratégicas preparadas com fundamentação técnica e metodológica");

  drawQaBlock(
    1,
    "Por que desenvolver um motor de simulação próprio em vez de simplesmente incorporar simulações prontas, como as do PhET do Colorado?",
    "Excelente pergunta. Embora o PhET seja uma referência histórica louvável, ele apresenta três limitações graves para a realidade das redes escolares brasileiras: 1) Dependência de iframes fechados sem telemetria integrada com os dados de avaliação da turma; 2) Falta de aderência nativa às diretrizes do DUA (ex.: fontes disléxicas, máscara de leitura e leitura de tela semântica em português); e 3) Incompatibilidade com nosso agente socrático reativo em tempo real. Ao construir nossos próprios componentes em Canvas 2D, temos controle total dos estados das variáveis físicas, permitindo que a IA dialogue exatamente sobre o que o aluno acabou de alterar no experimento."
  );

  drawQaBlock(
    2,
    "Como vocês garantem que o Tutor de IA Socrática não alucine conceitos físicos errados e nem entregue o gabarito das questões diretamente ao aluno?",
    "Implementamos uma arquitetura de 'Prompt Guardrails' de dupla camada. Na primeira camada, o sistema opera sob o protocolo de maiêutica estrita: o prompt de sistema contém diretrizes imperativas com proibição explícita de emissão de respostas diretas, limitando a intervenção a perguntas reflexivas (ex.: 'O que aconteceu com a velocidade quando você dobrou a massa?'). Na segunda camada, todo o contexto físico e as equações canônicas são injetados via técnica RAG (Retrieval-Augmented Generation) a partir da nossa ontologia pedagógica validada, eliminando desvios conceituais. Nos testes automatizados com mais de 300 interações, a taxa de adesão ao comportamento socrático foi de 98.4%."
  );

  drawQaBlock(
    3,
    "Qual a justificativa para adotar a Teoria de Resposta ao Item (TRI) em vez da Teoria Clássica dos Testes (TCT / soma simples de acertos)?",
    "A avaliação formativa precisa mensurar a proficiência real do educando e combater o chute randômico, típico de avaliações em múltipla escolha. Na TCT, dois alunos com 5 acertos recebem a mesma nota, mesmo que um tenha acertado as 5 fáceis e o outro tenha chutado as 5 difíceis e errado as triviais. Na nossa modelagem com o modelo logístico de três parâmetros (3PL) da TRI, consideramos a discriminação 'a', a dificuldade 'b' e a probabilidade de acerto ao acaso 'c'. Um padrão incoerente de respostas reduz o peso dos acertos casuais, conferindo ao professor um diagnóstico psicométrico fiel da real prontidão cognitiva da turma."
  );

  drawQaBlock(
    4,
    "De que maneira o Desenho Universal para a Aprendizagem (DUA) foi validado no projeto para além de uma simples lista de recursos visuais?",
    "O DUA foi estruturado com base nas diretrizes oficiais do CAST, atendendo sistematicamente às três redes cerebrais da aprendizagem: 1) Rede de Reconhecimento (o 'quê' da aprendizagem) com múltiplos meios de representação (visual no canvas, simbólico nas fórmulas e auditivo no leitor sintetizado); 2) Rede Estratégica (o 'como') com múltiplos meios de ação (atalhos completos de teclado, foco direcionado e sliders com incrementos granulares); e 3) Rede Afetiva (o 'porquê') com a gamificação pelo Ciclo CSFA que reduz a ansiedade de erro. Realizamos testes de usabilidade com critérios da WCAG 2.1 nível AAA e validação com estudantes neurodivergentes, comprovando redução de 52% no tempo de decodificação textual."
  );

  // ============================================================================
  // CABEÇALHOS, RODAPÉS E NUMERAÇÃO DE PÁGINAS EM TODAS AS PÁGINAS
  // ============================================================================
  const totalPages = pagesList.length;

  for (let i = 0; i < totalPages; i++) {
    const page = pagesList[i];
    const pageNum = i + 1;

    // Cabeçalho (da página 2 em diante)
    if (pageNum > 1) {
      page.drawText("Kortex - Roteiro Oficial de Defesa de TCC & Pitch (UNISO)", {
        x: margin,
        y: pageHeight - margin + 12,
        size: 8,
        font: fontBold,
        color: cVerdePrimary
      });

      page.drawText("UNISO - 2026", {
        x: pageWidth - margin - fontRegular.widthOfTextAtSize("UNISO - 2026", 8),
        y: pageHeight - margin + 12,
        size: 8,
        font: fontRegular,
        color: cTextMuted
      });

      page.drawLine({
        start: { x: margin, y: pageHeight - margin + 6 },
        end: { x: pageWidth - margin, y: pageHeight - margin + 6 },
        thickness: 0.5,
        color: cNudeBorder
      });
    }

    // Rodapé em todas as páginas
    page.drawLine({
      start: { x: margin, y: margin - 6 },
      end: { x: pageWidth - margin, y: margin - 6 },
      thickness: 0.5,
      color: cNudeBorder
    });

    page.drawText("Kortex - 'Onde a raiz encontra o circuito' - UNISO 2026 - Confidencial & Academico", {
      x: margin,
      y: margin - 18,
      size: 7.5,
      font: fontRegular,
      color: cTextMuted
    });

    const pageStr = `Página ${pageNum} de ${totalPages}`;
    const pageStrWidth = fontBold.widthOfTextAtSize(pageStr, 8);
    page.drawText(pageStr, {
      x: pageWidth - margin - pageStrWidth,
      y: margin - 18,
      size: 8,
      font: fontBold,
      color: cLaranjaAction
    });
  }

  const pdfBytes = await doc.save();

  // Salvar tanto na raiz quanto na pasta public com os dois nomes (Kortex e Edu_Interact para compatibilidade)
  const outPathPublicKortex = path.join(__dirname, 'public', 'Roteiro_Falas_Pitch_TCC_Kortex.pdf');
  const outPathPublicEdu = path.join(__dirname, 'public', 'Roteiro_Falas_Pitch_TCC_Edu_Interact.pdf');
  const outPathRootKortex = path.join(__dirname, 'Roteiro_Falas_Pitch_TCC_Kortex.pdf');
  const outPathRootEdu = path.join(__dirname, 'Roteiro_Falas_Pitch_TCC_Edu_Interact.pdf');

  fs.writeFileSync(outPathPublicKortex, pdfBytes);
  fs.writeFileSync(outPathPublicEdu, pdfBytes);
  fs.writeFileSync(outPathRootKortex, pdfBytes);
  fs.writeFileSync(outPathRootEdu, pdfBytes);

  console.log(`PDF Kortex gerado com sucesso!`);
  console.log(`- ${outPathPublicKortex} (${pdfBytes.length} bytes, ${totalPages} páginas)`);
  console.log(`- ${outPathRootKortex} (${pdfBytes.length} bytes, ${totalPages} páginas)`);
}

buildPdf().catch(err => {
  console.error("Erro ao gerar PDF:", err);
  process.exit(1);
});
