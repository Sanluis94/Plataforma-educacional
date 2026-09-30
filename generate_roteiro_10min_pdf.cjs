const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// ==============================================================================
// CORES OFICIAIS — KORTEX / V1_Validação.pdf
// ==============================================================================
const cVerdePrimary = rgb(41 / 255, 62 / 255, 36 / 255);      // #293E24 (30%)
const cVerdeDark    = rgb(23 / 255, 35 / 255, 20 / 255);      // #172314
const cVerdeLight   = rgb(61 / 255, 91 / 255, 54 / 255);      // #3D5B36
const cVerdeTint    = rgb(240 / 255, 244 / 255, 239 / 255);  // #F0F4EF
const cLaranjaAction= rgb(228 / 255, 104 / 255, 63 / 255);    // #E4683F (15%)
const cLaranjaTint  = rgb(253 / 255, 243 / 255, 239 / 255);  // #FDF3EF
const cVermelho     = rgb(188 / 255, 57 / 255, 31 / 255);     // #BC391F (5%)
const cNudeBg       = rgb(250 / 255, 247 / 255, 238 / 255);  // #FAF7EE (50%)
const cNudeBorder   = rgb(226 / 255, 215 / 255, 195 / 255);  // #E2D7C3
const cTextMain     = rgb(23 / 255, 35 / 255, 20 / 255);      // #172314
const cTextMuted    = rgb(86 / 255, 100 / 255, 82 / 255);     // #566452
const cWhite        = rgb(1, 1, 1);

// Sanitizador para caracteres compatíveis com Helvetica (WinAnsi)
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
    .replace(/‘/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/[—–]/g, '-')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');
}

// Quebra de texto por largura
function wrapText(text, font, size, maxWidth) {
  text = sanitizeText(text);
  const words = text.split(/\s+/);
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

  // Dimensões A4: 595.28 x 841.89 pt
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 44;
  const contentWidth = pageWidth - (margin * 2);

  let currentPage = null;
  let cursorY = 0;
  const pagesList = [];

  function addNewPage() {
    currentPage = doc.addPage([pageWidth, pageHeight]);
    pagesList.push(currentPage);
    cursorY = pageHeight - margin - 35;
    return currentPage;
  }

  function ensureSpace(neededHeight) {
    if (!currentPage || (cursorY - neededHeight) < (margin + 35)) {
      addNewPage();
    }
  }

  function drawSectionHeader(title, subtitle) {
    ensureSpace(55);
    
    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 2,
      width: 4,
      height: 22,
      color: cLaranjaAction
    });

    currentPage.drawText(sanitizeText(title), {
      x: margin + 12,
      y: cursorY + 5,
      size: 13.5,
      font: fontBold,
      color: cVerdePrimary
    });

    if (subtitle) {
      currentPage.drawText(sanitizeText(subtitle), {
        x: margin + 12,
        y: cursorY - 8,
        size: 8.5,
        font: fontRegular,
        color: cTextMuted
      });
      cursorY -= 26;
    } else {
      cursorY -= 20;
    }
  }

  function drawSpeakerHeader(speakerName, role, timeRange, slidesText) {
    ensureSpace(62);

    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 44,
      width: contentWidth,
      height: 44,
      color: cVerdeTint,
      borderColor: cVerdePrimary,
      borderWidth: 1
    });

    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 44,
      width: 6,
      height: 44,
      color: cVerdePrimary
    });

    currentPage.drawText(sanitizeText(speakerName), {
      x: margin + 16,
      y: cursorY - 18,
      size: 12,
      font: fontBold,
      color: cVerdeDark
    });

    currentPage.drawText(sanitizeText(role), {
      x: margin + 16,
      y: cursorY - 32,
      size: 8.5,
      font: fontOblique,
      color: cVerdeLight
    });

    const badgeText = `${timeRange} | ${slidesText}`;
    const badgeWidth = fontBold.widthOfTextAtSize(badgeText, 8.5);
    currentPage.drawText(badgeText, {
      x: margin + contentWidth - badgeWidth - 14,
      y: cursorY - 24,
      size: 8.5,
      font: fontBold,
      color: cLaranjaAction
    });

    cursorY -= 56;
  }

  function drawSlideBlock(slideNum, title, time, actionText, speechText, conceptText) {
    const actionLines = wrapText(actionText, fontOblique, 8.2, contentWidth - 28);
    const speechLines = wrapText(speechText, fontRegular, 9.2, contentWidth - 28);
    const conceptLines = conceptText ? wrapText(conceptText, fontRegular, 8.2, contentWidth - 28) : [];

    let blockHeight = 28 + (actionLines.length * 11) + (speechLines.length * 12.5) + 32;
    if (conceptLines.length > 0) {
      blockHeight += (conceptLines.length * 11) + 14;
    }

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

    // Topo do card
    currentPage.drawRectangle({
      x: margin,
      y: boxTop - 22,
      width: contentWidth,
      height: 22,
      color: cNudeBg,
      borderColor: cNudeBorder,
      borderWidth: 0.5
    });

    currentPage.drawText(sanitizeText(`SLIDE ${slideNum < 10 ? '0' + slideNum : slideNum} - ${title}`), {
      x: margin + 10,
      y: boxTop - 15,
      size: 9.5,
      font: fontBold,
      color: cVerdePrimary
    });

    const timeText = `Tempo: ${time}`;
    const timeWidth = fontBold.widthOfTextAtSize(timeText, 8);
    currentPage.drawText(timeText, {
      x: margin + contentWidth - timeWidth - 10,
      y: boxTop - 15,
      size: 8,
      font: fontBold,
      color: cLaranjaAction
    });

    let currentY = boxTop - 34;

    // Ação no Slide
    currentPage.drawText("ACAO / GATILHO VISUAL NO SLIDE:", {
      x: margin + 10,
      y: currentY,
      size: 7.5,
      font: fontBold,
      color: cVerdeLight
    });
    currentY -= 10;

    for (const line of actionLines) {
      currentPage.drawText(line, {
        x: margin + 10,
        y: currentY,
        size: 8.2,
        font: fontOblique,
        color: cVerdePrimary
      });
      currentY -= 11;
    }

    currentY -= 4;

    // Discurso Verbatim
    currentPage.drawText("FALA SUGERIDA (VERBATIM):", {
      x: margin + 10,
      y: currentY,
      size: 7.5,
      font: fontBold,
      color: cLaranjaAction
    });
    currentY -= 11;

    for (const line of speechLines) {
      currentPage.drawText(line, {
        x: margin + 10,
        y: currentY,
        size: 9.2,
        font: fontRegular,
        color: cTextMain
      });
      currentY -= 12.5;
    }

    // Conceito Chave (opcional)
    if (conceptLines.length > 0) {
      currentY -= 3;
      currentPage.drawText("FUNDAMENTO / CONCEITO-CHAVE:", {
        x: margin + 10,
        y: currentY,
        size: 7.5,
        font: fontBold,
        color: cTextMuted
      });
      currentY -= 10;

      for (const line of conceptLines) {
        currentPage.drawText(line, {
          x: margin + 10,
          y: currentY,
          size: 8.2,
          font: fontRegular,
          color: cTextMuted
        });
        currentY -= 11;
      }
    }

    cursorY = boxTop - blockHeight - 12;
  }

  // ============================================================================
  // PÁGINA 1: CAPA INSTITUCIONAL & CRONOGRAMA
  // ============================================================================
  addNewPage();

  // Cabeçalho da capa
  currentPage.drawRectangle({
    x: margin,
    y: cursorY - 140,
    width: contentWidth,
    height: 140,
    color: cNudeBg,
    borderColor: cNudeBorder,
    borderWidth: 1
  });

  currentPage.drawText("KORTEX", {
    x: margin + 18,
    y: cursorY - 32,
    size: 22,
    font: fontBold,
    color: cVerdePrimary
  });

  currentPage.drawText("Onde a raiz encontra o circuito: unindo o rigor da tecnologia a calidez do olhar humano", {
    x: margin + 18,
    y: cursorY - 48,
    size: 9,
    font: fontOblique,
    color: cLaranjaAction
  });

  currentPage.drawText("UNIVERSIDADE DE SOROCABA (UNISO) - DEFESA OFICIAL DE TCC 2026", {
    x: margin + 18,
    y: cursorY - 70,
    size: 9.5,
    font: fontBold,
    color: cVerdeDark
  });

  currentPage.drawText("Equipe: Gabriel Ramalho Resende | Luis Antonio de Albuquerque Adamski", {
    x: margin + 18,
    y: cursorY - 86,
    size: 8.5,
    font: fontRegular,
    color: cTextMain
  });

  currentPage.drawText("        Luis Filipe Giglio Frasao | Victor Augusto Pereira Nascimento", {
    x: margin + 18,
    y: cursorY - 99,
    size: 8.5,
    font: fontRegular,
    color: cTextMain
  });

  currentPage.drawText("Orientador: Prof. Denicezar Angelo Baldo | Duracao Total: 10 Minutos Cravados (2m30s / pessoa)", {
    x: margin + 18,
    y: cursorY - 118,
    size: 8.5,
    font: fontBold,
    color: cVerdePrimary
  });

  cursorY -= 158;

  // Seção 1: Matriz de Distribuição e Pacing
  drawSectionHeader("1. Matriz de Distribuicao e Pacing (10 Minutos)", "Divisao temporal estrita com 2 minutos e 30 segundos por integrante");

  const pacingData = [
    {
      membro: "1. Gabriel Ramalho Resende",
      bloco: "00:00 - 02:30",
      slides: "Slides 01 e 02",
      tema: "Abertura oficial, identidade institucional, os 4 pilares e o deficit de laboratorios no Brasil."
    },
    {
      membro: "2. Luis Antonio Adamski",
      bloco: "02:30 - 05:00",
      slides: "Slides 03 e 04",
      tema: "Objetivos cientificos, engenharia de software (React 19/Vite/Canvas 2D) e Ciclo CSFA."
    },
    {
      membro: "3. Luis Filipe Frasao",
      bloco: "05:00 - 07:30",
      slides: "Slides 05 e 06",
      tema: "Demonstracoes interativas ao vivo: Pendulo Gravitacional e Suite de Acessibilidade DUA."
    },
    {
      membro: "4. Victor Augusto Nascimento",
      bloco: "07:30 - 10:00",
      slides: "Slides 07, 08, 09 e 10",
      tema: "Avaliacao TRI 3PL, telemetria docente, metricas empiricas (+42% retencao) e encerramento."
    }
  ];

  for (const item of pacingData) {
    ensureSpace(34);
    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 30,
      width: contentWidth,
      height: 30,
      color: cWhite,
      borderColor: cNudeBorder,
      borderWidth: 1
    });

    currentPage.drawText(sanitizeText(item.membro), {
      x: margin + 8,
      y: cursorY - 14,
      size: 8.5,
      font: fontBold,
      color: cVerdePrimary
    });

    currentPage.drawText(sanitizeText(item.bloco), {
      x: margin + 200,
      y: cursorY - 14,
      size: 8.5,
      font: fontBold,
      color: cLaranjaAction
    });

    currentPage.drawText(sanitizeText(item.slides), {
      x: margin + 285,
      y: cursorY - 14,
      size: 8,
      font: fontOblique,
      color: cVerdeLight
    });

    currentPage.drawText(sanitizeText(item.tema), {
      x: margin + 8,
      y: cursorY - 24,
      size: 7.5,
      font: fontRegular,
      color: cTextMuted
    });

    cursorY -= 35;
  }

  cursorY -= 6;

  // ============================================================================
  // INTEGRANTE 1: GABRIEL RAMALHO RESENDE
  // ============================================================================
  drawSectionHeader("2. Roteiro Detalhado por Integrante (Falas Verbatim)", "Discursos exatos com instrucoes de gatilhos visuais e transicoes entre oradores");

  drawSpeakerHeader(
    "1. Gabriel Ramalho Resende",
    "Abertura Institucional, Conceito Kortex e Diagnostico do Problema",
    "00:00 - 02:30 (2m30s)",
    "Slides 01 e 02"
  );

  drawSlideBlock(
    1,
    "Capa Kortex — 'Onde a raiz encontra o circuito'",
    "00:00 - 01:15",
    "Manter postura ereta, olhar firme para os membros da banca. Apontar para o logotipo oficial da semente com o circuito integrado e para a sintese dos quatro pilares destacados no rodape.",
    `"Prezados membros da banca examinadora, estimado orientador Prof. Denicezar, colegas e presentes, tenham um excelente dia. Em nome da nossa equipe - formada por mim, Gabriel Ramalho, e pelos meus colegas Luis Antonio Adamski, Luis Filipe Frasao e Victor Augusto Nascimento -, temos a satisfacao de apresentar o Trabalho de Conclusao de Curso da plataforma Kortex: 'Onde a raiz encontra o circuito'. O Kortex nasce com uma premissa clara: a tecnologia educacional de ponta nao deve romper com os fundamentos pedagogicos classicos, mas sim potencializa-los. Unimos quatro pilares historicos: a maieutica socratica no dialogo formativo da IA; o empirismo de Aristoteles nos experimentos virtuais; a pedagogia libertadora de Paulo Freire; e as neurociencias aplicadas no Desenho Universal para a Aprendizagem (DUA)."`,
    "Fundamentacao Pedagogica: Socrates (dialogo guiado), Aristoteles (empirismo sensorial), Paulo Freire (autonomia) e CAST (DUA)."
  );

  drawSlideBlock(
    2,
    "O Problema do Abstracionismo e a Realidade das Escolas",
    "01:15 - 02:30",
    "Avancar para o Slide 2. Apontar com firmeza o contraste entre a coluna vermelha (Diagnostico Critico: <15% laboratorios) e a coluna verde (Resposta Kortex). Concluir passando o bastao para Luis Antonio.",
    `"Ao olharmos para a realidade do ensino de ciencias no Brasil, nos deparamos com um abismo: segundo dados do Censo Escolar, menos de 15% das escolas publicas possuem laboratorios funcionais. A consequencia direta e o desengajamento em massa: fisica e quimica viram decorebas de formulas abstratas na lousa. Para alunos neurodivergentes - como aqueles com dislexia e TDAH -, materiais estaticos e sem contraste representam barreiras intransponiveis. Ao mesmo tempo, professores passam madrugadas corrigindo pilhas de provas sem nenhum dado agil para intervir a tempo. O Kortex foi arquitetado para romper esse ciclo, transformando qualquer tela simples em um centro de investigacao cientifica de primeiro mundo. Para detalhar nossos objetivos e a engenharia por tras da solucao, passo a palavra ao Luis Antonio."`,
    "Passagem de Bastao: Conectar a dor social a solucao tecnologica, chamando Luis Antonio de Albuquerque Adamski."
  );

  // ============================================================================
  // INTEGRANTE 2: LUIS ANTONIO DE ALBUQUERQUE ADAMSKI
  // ============================================================================
  drawSpeakerHeader(
    "2. Luis Antonio de Albuquerque Adamski",
    "Objetivos da Pesquisa, Engenharia de Software e o Ciclo CSFA",
    "02:30 - 05:00 (2m30s)",
    "Slides 03 e 04"
  );

  drawSlideBlock(
    3,
    "Objetivos Gerais e Metas Praticas da Plataforma",
    "02:30 - 03:45",
    "Assumir o controle dos slides com seguranca. Destacar visualmente os 4 cards de metas especificas na tela.",
    `"Obrigado, Gabriel. Cumprimento a banca e os presentes. Nosso objetivo geral foi projetar, desenvolver e validar empiricamente uma plataforma web aberta, responsiva e universalmente acessivel, integrando simulacoes fisicas em tempo real, tutoria socratica guiada por inteligencia artificial e avaliacao formativa baseada na Teoria de Resposta ao Item (TRI). Para isso, fixamos quatro metas praticas: primeiro, desenvolver mais de 70 laboratorios virtuais nativos em Canvas 2D; segundo, incorporar acessibilidade WCAG nivel AAA por padrao; terceiro, programar um agente socratico que desafie a cognicao do aluno sem entregar respostas prontas; e quarto, automatizar a devolutiva docente com latencia zero."`,
    "Metas Tecnicas: 70+ simuladores, conformidade WCAG AAA, motor socratico sem bypass e telemetria docente em tempo real."
  );

  drawSlideBlock(
    4,
    "Arquitetura de Software e Metodologia Pedagogica CSFA",
    "03:45 - 05:00",
    "Exibir o diagrama de arquitetura modular React 19/Vite e percorrer as 4 etapas do ciclo: Conhecer, Simular, Formular e Agir. Passar o bastao para Luis Filipe.",
    `"Na engenharia de software, priorizamos velocidade e soberania: escolhemos React 19 com empacotamento Vite otimizado em chunks modulares, garantindo carregamento inicial ultrarrapido mesmo em redes moveis de escolas perifericas. As simulacoes rodam no cliente a 60 quadros por segundo via Canvas 2D, com calculo numerico exato. Essa robustez tecnica da suporte a nossa metodologia pedagogica autoral: o Ciclo CSFA. O aluno: 1. Conhece a provocacao do fenomeno; 2. Simula e experimenta sem medo de errar; 3. Formula a correlacao matematica; e 4. Age, resolvendo problemas do mundo real. Para ver essa teoria funcionando na pratica, o Luis Filipe fara as demonstracoes ao vivo."`,
    "Passagem de Bastao: Transitar da fundamentacao teorica para a execucao sensorial ao vivo com Luis Filipe Giglio Frasao."
  );

  // ============================================================================
  // INTEGRANTE 3: LUIS FILIPE GIGLIO FRASAO
  // ============================================================================
  drawSpeakerHeader(
    "3. Luis Filipe Giglio Frasao",
    "Demonstracoes Praticas Interativas: Pendulo Físico e Acessibilidade DUA",
    "05:00 - 07:30 (2m30s)",
    "Slides 05 e 06"
  );

  drawSlideBlock(
    5,
    "Demo 1: Pendulo Gravitacional com Fisica Newtoniana Continua",
    "05:00 - 06:15",
    "CLICAR AO VIVO no slide 5: 1) Clicar no botao 'Lua (1.6 m/s^2)' e mostrar a oscilacao lenta; 2) Clicar no botao 'Jupiter (24.8 m/s^2)' e mostrar a restauracao rapida; 3) Ajustar o slider de comprimento de 1.5m para 2.5m.",
    `"Obrigado, Luis Antonio. Senhores membros da banca, convido-os a olhar diretamente para o experimento embutido no slide. Temos aqui nosso simulador de Pendulo Gravitacional com fisica newtoniana continua. Em uma aula tradicional, o aluno apenas copia a formula: T = 2*pi*sqrt(L/g). Aqui ele interage: ao clicar em 'Lua', a gravidade cai para 1.62 m/s^2 e voces notam a oscilacao suave e o periodo se dilatando. Se mudarmos para 'Jupiter', com gravidade de 24.8 m/s^2, a oscilacao se torna intensa e imediata. O estudante aprende pelo experimento sensorial direto - e Aristoteles aplicado a educacao digital."`,
    "Fisica Real no Cliente: Integracao de Verlet/Euler a 60fps no Canvas 2D, eliminando custos de servidor."
  );

  drawSlideBlock(
    6,
    "Demo 2: Suite de Acessibilidade Universal DUA",
    "06:15 - 07:30",
    "CLICAR AO VIVO no slide 6: 1) Clicar em 'Fonte Dislexia' (mostrar a fonte OpenDyslexic sendo aplicada); 2) Clicar em 'Regua de Leitura' ou ativar o 'Leitor de Voz' por 3 segundos. Passar o bastao para Victor Augusto.",
    `"Nossa segunda demonstracao comprova nosso compromisso etico com a inclusao. No Kortex, a acessibilidade nao e um complemento terceirizado: ela e intrinseca. Vejam: com um clique no botao 'Fonte Dislexia', toda a tipografia da tela assume peso basal aumentado e espacamento expandido, eliminando a confusao entre letras espelhadas. Ao ativar a 'Regua de Leitura', geramos uma mascara de contraste que acompanha a linha de visao, auxiliando estudantes com TDAH no foco sustentado. E o 'Leitor de Voz' utiliza sintese nativa do navegador, funcionando 100% offline. Passo agora a palavra ao Victor Augusto para apresentar os resultados da avaliacao psicometrica e as conclusoes do projeto."`,
    "Passagem de Bastao: Conectar inclusao ativa aos dados de retencao e avaliacao psicometrica com Victor Augusto Pereira Nascimento."
  );

  // ============================================================================
  // INTEGRANTE 4: VICTOR AUGUSTO PEREIRA NASCIMENTO
  // ============================================================================
  drawSpeakerHeader(
    "4. Victor Augusto Pereira Nascimento",
    "Avaliacao TRI, Telemetria Docente, Resultados Empiricos e Encerramento",
    "07:30 - 10:00 (2m30s)",
    "Slides 07, 08, 09 e 10"
  );

  drawSlideBlock(
    7,
    "Demo 3: Avaliacao TRI e Painel de Telemetria Docente",
    "07:30 - 08:30",
    "Clicar em uma alternativa da questao interativa no slide. Apontar o badge verde de latencia (12ms) e o grafico de alerta de defasagem por habilidade BNCC.",
    `"Obrigado, Luis Filipe. Boa tarde aos avaliadores. Nesta terceira demonstracao, resolvemos a dor do professor. Ao responder esta questao sobre gravidade, a devolutiva pedagogica ocorre em apenas 12 milissegundos. Nao usamos correcao linear classica: aplicamos a Teoria de Resposta ao Item (TRI) com modelo logistico de 3 parametros, calibrando discriminacao, dificuldade e acerto casual. Imediatamente, o painel do professor consolida os dados da turma. Vejam este alerta em destaque: a habilidade H3 registrou baixo dominio e o sistema sugere intervencao pontual imediata, poupando semanas de diagnostico tardio."`,
    "Psicometria & Telemetria: Modelo TRI 3PL (Lord/Birnbaum) + agregador realtime para tomada de decisao docente."
  );

  drawSlideBlock(
    8,
    "Resultados Empiricos Validados e Sintese Conclusiva",
    "08:30 - 09:30",
    "Avancar para os KPIs do Slide 8 e em seguida para os pilares do Slide 9. Apresentar os numeros com seguranca estatistica.",
    `"Os resultados comprovam a eficacia da nossa proposta: Desenvolvemos mais de 72 laboratorios funcionais cobrindo 12 disciplinas; Registramos zero latencia na execucao local no cliente; Nos testes de validacao pedagogica, obtivemos 42% mais retencao conceitual do que com listas de exercicios convencionais; E alcancamos conformidade com as normas internacionais WCAG 2.1 AAA. Concluimos que a integracao entre a maieutica socratica, o rigor do codigo e o Desenho Universal democratiza a ciencia real para qualquer escola brasileira."`,
    "Evidencias: +42% retencao (p < 0.01), 72+ labs, WCAG AAA, zero custo operacional de IA em computacao local."
  );

  drawSlideBlock(
    10,
    "Encerramento Oficial e Abertura para Arguicao da Banca",
    "09:30 - 10:00",
    "Transitar para o Slide 10 final. Manter a tela com os nomes dos 4 autores e do orientador visivel durante as perguntas da banca.",
    `"Em nome de toda a nossa equipe - Gabriel, Luis Antonio, Luis Filipe e eu -, agradecemos imensamente a banca pelas valiosas consideracoes e ao Prof. Denicezar pela orientacao dedicada. A plataforma Kortex esta em operacao e aberta para a arguicao dos professores. Muito obrigado!"`,
    "Postura Final: Silencio sereno, caneta e bloco de anotacoes prontos para registrar cada sugestao da banca."
  );

  // ============================================================================
  // SEÇÃO FINAL: 5 DICAS TÁTICAS PARA O DIA DA BANCA
  // ============================================================================
  drawSectionHeader("3. Diretrizes Taticas para o Grupo (Checklist de Sucesso)", "Normas operacionais para garantir nota maxima e sincronia perfeita");

  const dicas = [
    { num: "01", tit: "Passagem de Bastao Fluida", txt: "Ao final de cada fala, cite expressamente o nome do proximo colega e o tema que ele vai demonstrar. Isso demonstra maturidade de equipe." },
    { num: "02", tit: "Interacao ao Vivo Obrigatória", txt: "Luis Filipe e Victor DEVEM mexer nos simuladores embutidos nos slides 5, 6 e 7. O maior diferencial do projeto e a aplicacao viva no browser." },
    { num: "03", tit: "Disciplina de Tempo", txt: "Cada integrante tem exatamente 2m15s de discurso, deixando 15 segundos de sobra para transicao. Treinem com cronometro regressivo." },
    { num: "04", tit: "Apresentacao em Tela Cheia", txt: "Abra 'apresentacao_tcc.html' no Chrome/Edge e pressione F11. As setas do teclado e a barra de espaco avancam e voltam os slides." },
    { num: "05", tit: "Postura Receptiva na Arguicao", txt: "Anotem cada pergunta antes de responder. Nunca interrompam um avaliador; iniciem sempre agradecendo a contribuicao academica." }
  ];

  for (const d of dicas) {
    ensureSpace(32);
    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 26,
      width: contentWidth,
      height: 26,
      color: cWhite,
      borderColor: cNudeBorder,
      borderWidth: 0.5
    });

    currentPage.drawText(d.num, {
      x: margin + 8,
      y: cursorY - 17,
      size: 9,
      font: fontBold,
      color: cLaranjaAction
    });

    currentPage.drawText(sanitizeText(d.tit + ":"), {
      x: margin + 28,
      y: cursorY - 17,
      size: 8.5,
      font: fontBold,
      color: cVerdeDark
    });

    const titWidth = fontBold.widthOfTextAtSize(d.tit + ": ", 8.5);
    currentPage.drawText(sanitizeText(d.txt), {
      x: margin + 28 + titWidth + 2,
      y: cursorY - 17,
      size: 7.8,
      font: fontRegular,
      color: cTextMuted
    });

    cursorY -= 30;
  }

  // ============================================================================
  // CABEÇALHOS E RODAPÉS DE TODAS AS PÁGINAS
  // ============================================================================
  const totalPages = pagesList.length;

  for (let i = 0; i < totalPages; i++) {
    const page = pagesList[i];
    const pageNum = i + 1;

    // Cabeçalho a partir da página 2
    if (pageNum > 1) {
      page.drawText("KORTEX - Roteiro Oficial de Apresentacao de TCC (10 Minutos) - UNISO 2026", {
        x: margin,
        y: pageHeight - margin + 12,
        size: 7.8,
        font: fontBold,
        color: cVerdePrimary
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

    page.drawText("Kortex - 'Onde a raiz encontra o circuito' - Gabriel Ramalho, Luis Antonio, Luis Filipe, Victor Augusto", {
      x: margin,
      y: margin - 18,
      size: 7.5,
      font: fontRegular,
      color: cTextMuted
    });

    const pageStr = `Pagina ${pageNum} de ${totalPages}`;
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

  // Salvar na Área de Trabalho do Usuário (Desktop)
  const userDesktop = 'C:\\Users\\Asus\\Desktop';
  const outPathDesktop = path.join(userDesktop, 'Roteiro_Apresentacao_TCC_10_Minutos_Kortex.pdf');
  fs.writeFileSync(outPathDesktop, pdfBytes);

  // Salvar também no projeto para persistência e no public para acesso web
  const outPathPublic = path.join(__dirname, 'public', 'Roteiro_Apresentacao_TCC_10_Minutos_Kortex.pdf');
  const outPathRoot = path.join(__dirname, 'Roteiro_Apresentacao_TCC_10_Minutos_Kortex.pdf');
  fs.writeFileSync(outPathPublic, pdfBytes);
  fs.writeFileSync(outPathRoot, pdfBytes);

  console.log(`PDF gerado com sucesso!`);
  console.log(`- Área de Trabalho: ${outPathDesktop} (${pdfBytes.length} bytes, ${totalPages} páginas)`);
  console.log(`- Projeto public: ${outPathPublic}`);
  console.log(`- Projeto root: ${outPathRoot}`);
}

buildPdf().catch(err => {
  console.error("Erro ao gerar PDF:", err);
  process.exit(1);
});
