import { useState, useEffect, useRef } from 'react';

interface GeographySimulatorProps {
  mode?: string;
  labTitle?: string;
  labId?: string;
  onComplete?: (score: number) => void;
}

type PlateBoundary = 'divergent' | 'convergent' | 'transform';

// ── Mode-specific quiz questions for non-tectonics modes ──
interface GeoQuiz {
  title: string;
  description: string;
  questions: { q: string; options: string[]; answer: number; explanation: string }[];
}

const MODE_QUIZZES: Record<string, GeoQuiz> = {
  relief: {
    title: 'Agentes do Relevo',
    description: 'Estude os agentes internos (tectonismo, vulcanismo) e externos (intemperismo, erosão) que transformam a superfície terrestre.',
    questions: [
      { q: 'Qual agente externo do relevo é responsável pelo desgaste das rochas pela ação da água da chuva?', options: ['Vulcanismo', 'Intemperismo químico', 'Tectonismo', 'Epirogênese'], answer: 1, explanation: 'O intemperismo químico dissolve minerais das rochas pela ação da água, CO₂ e ácidos orgânicos, alterando a composição mineralógica.' },
      { q: 'A formação de canyons como o Grand Canyon é resultado de:', options: ['Vulcanismo', 'Erosão fluvial ao longo de milhões de anos', 'Movimentos tectônicos recentes', 'Ação glacial'], answer: 1, explanation: 'O Rio Colorado escavou o Grand Canyon ao longo de ~6 milhões de anos por erosão fluvial progressiva.' },
      { q: 'Os Planaltos Residuais Brasileiros são resultado de:', options: ['Deposição sedimentar recente', 'Erosão diferencial que removeu rochas menos resistentes', 'Glaciação quaternária', 'Vulcanismo basáltico'], answer: 1, explanation: 'São formas que "sobreviveram" à erosão. A erosão diferencial remove rochas mais frágeis e mantém as mais resistentes.' },
    ]
  },
  climate: {
    title: 'Tipos de Clima',
    description: 'Analise os fatores climáticos (latitude, altitude, maritimidade, continentalidade, massas de ar) e os principais climas do mundo.',
    questions: [
      { q: 'Qual fator climático explica por que cidades litorâneas têm menor amplitude térmica?', options: ['Altitude', 'Latitude', 'Maritimidade', 'Correntes de convecção'], answer: 2, explanation: 'A maritimidade regula a temperatura: a água do mar absorve e libera calor lentamente, reduzindo variações extremas (amplitude térmica).' },
      { q: 'O clima semiárido do sertão nordestino é influenciado por:', options: ['Corrente fria de Benguela', 'Massa Equatorial Continental (mEc) + barreira orográfica', 'Proximidade com a linha do Equador', 'Altitude elevada dos planaltos'], answer: 1, explanation: 'As massas de ar úmido perdem umidade ao encontrar os planaltos (efeito orográfico), chegando secas ao interior do Nordeste.' },
      { q: 'O que diferencia clima de tempo meteorológico?', options: ['Clima é momentâneo, tempo é permanente', 'Clima é a média de 30 anos de dados; tempo é o estado momentâneo da atmosfera', 'São sinônimos', 'Tempo se refere apenas à temperatura'], answer: 1, explanation: 'Tempo meteorológico é o estado atual e transitório da atmosfera. Clima é a síntese estatística (mínimo 30 anos) dos padrões de tempo.' },
    ]
  },
  cartography: {
    title: 'Cartografia Digital',
    description: 'Estude projeções cartográficas, escalas, coordenadas geográficas e leitura de mapas temáticos.',
    questions: [
      { q: 'A projeção de Mercator distorce as áreas dos continentes. Em qual região a distorção é MAIOR?', options: ['Equador', 'Trópicos', 'Polos (altas latitudes)', 'Meridianos centrais'], answer: 2, explanation: 'Na projeção cilíndrica de Mercator, as áreas próximas aos polos são enormemente exageradas (ex: Groenlândia parece maior que a África).' },
      { q: 'Se um mapa tem escala 1:50.000, quantos metros reais representam 2 cm no mapa?', options: ['100 m', '500 m', '1.000 m', '5.000 m'], answer: 2, explanation: '1 cm = 50.000 cm = 500 m. Logo, 2 cm = 1.000 m = 1 km.' },
      { q: 'As coordenadas 23°26\'S, 46°38\'W correspondem aproximadamente a qual cidade?', options: ['Buenos Aires', 'São Paulo', 'Rio de Janeiro', 'Brasília'], answer: 1, explanation: 'A coordenada 23°26\'S está muito próxima do Trópico de Capricórnio, e 46°38\'W corresponde à longitude de São Paulo.' },
    ]
  },
  hydrography: {
    title: 'Bacias Hidrográficas',
    description: 'Estude as principais bacias hidrográficas brasileiras, o ciclo da água e a importância dos rios para a sociedade.',
    questions: [
      { q: 'Qual é a maior bacia hidrográfica do mundo em volume de água?', options: ['Bacia do Nilo', 'Bacia Platina', 'Bacia Amazônica', 'Bacia do Mississippi'], answer: 2, explanation: 'A Bacia Amazônica possui ~7 milhões de km² e o Rio Amazonas despeja ~209.000 m³/s no oceano, sendo a maior em volume.' },
      { q: 'A transposição do Rio São Francisco tem como objetivo principal:', options: ['Gerar energia hidrelétrica', 'Levar água para o semiárido do Nordeste Setentrional', 'Irrigar plantações de soja no Cerrado', 'Construir hidrovias de transporte'], answer: 1, explanation: 'O projeto transfere águas do Velho Chico para bacias do Nordeste Setentrional (Ceará, RN, PB, PE) que sofrem com escassez hídrica.' },
    ]
  },
  biomes: {
    title: 'Biomas Brasileiros',
    description: 'Conheça os 6 biomas brasileiros: Amazônia, Cerrado, Mata Atlântica, Caatinga, Pampa e Pantanal.',
    questions: [
      { q: 'Qual bioma brasileiro é considerado o mais biodiverso e também o mais devastado?', options: ['Amazônia', 'Cerrado', 'Mata Atlântica', 'Pantanal'], answer: 2, explanation: 'A Mata Atlântica original cobria ~1,3 milhão de km². Hoje resta apenas ~12,4% da cobertura original, sendo o bioma mais degradado.' },
      { q: 'O Cerrado é conhecido como "berço das águas" porque:', options: ['Tem muitos rios caudalosos', 'Abriga nascentes de 3 grandes bacias hidrográficas (Amazônica, São Francisco e Platina)', 'É o bioma mais chuvoso do Brasil', 'Possui o maior lago artificial'], answer: 1, explanation: 'As chapadas do Cerrado funcionam como divisores de água e abrigam nascentes que alimentam as bacias Amazônica, Tocantins, São Francisco e Platina.' },
      { q: 'A vegetação da Caatinga é adaptada à seca com estratégias como:', options: ['Raízes profundas para buscar água subterrânea permanente', 'Folhas modificadas em espinhos para reduzir a perda de água (transpiração)', 'Fotossíntese noturna exclusiva', 'Produção de resina impermeável nos troncos'], answer: 1, explanation: 'As plantas xerófitas da Caatinga têm folhas reduzidas/espinhos, caules suculentos e perdem folhas na seca (caducifólia) para economizar água.' },
    ]
  },
};

export function GeographySimulator({ mode = 'tectonics', labTitle, onComplete }: GeographySimulatorProps) {
  // ── For non-tectonics modes, render quiz mode ──
  if (mode !== 'tectonics') {
    return <GeographyQuizMode mode={mode} labTitle={labTitle} onComplete={onComplete} />;
  }

  // ── Tectonics mode (original interactive canvas) ──
  const [boundaryType, setBoundaryType] = useState<PlateBoundary>('convergent');
  const [pressure, setPressure] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [isQuake, setIsQuake] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      timeRef.current += 0.05;
      ctx.clearRect(0, 0, width, height);

      // 1. Fundo do Manto (Magma / Astenosfera)
      const magmaGrad = ctx.createLinearGradient(0, height / 2, 0, height);
      magmaGrad.addColorStop(0, '#e64a19');
      magmaGrad.addColorStop(0.5, '#d84315');
      magmaGrad.addColorStop(1, '#212121');
      ctx.fillStyle = magmaGrad;
      ctx.fillRect(0, height / 2, width, height / 2);

      ctx.strokeStyle = 'rgba(255, 110, 64, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < width; x += 15) {
        const offset = Math.sin(timeRef.current + x * 0.05) * 8;
        if (x === 0) ctx.moveTo(x, height / 2 + 30 + offset);
        else ctx.lineTo(x, height / 2 + 30 + offset);
      }
      ctx.stroke();

      const mid = width / 2;
      const plateY = height / 2 - 20;
      const thickness = 40;

      let offsetL = 0;
      let offsetR = 0;
      let subductionDepth = 0;
      let ridgeGap = 0;

      if (boundaryType === 'divergent') {
        ridgeGap = (pressure / 100) * 35;
        offsetL = -ridgeGap;
        offsetR = ridgeGap;
      } else if (boundaryType === 'convergent') {
        const overlap = (pressure / 100) * 30;
        offsetL = overlap / 2;
        offsetR = -overlap / 2;
        subductionDepth = overlap * 1.5;
      } else if (boundaryType === 'transform') {
        offsetL = Math.sin(timeRef.current * 1.5) * (pressure / 100) * 5;
        offsetR = -Math.sin(timeRef.current * 1.5) * (pressure / 100) * 5;
      }

      let shakeX = 0;
      let shakeY = 0;
      if (boundaryType === 'transform' && pressure > 40) {
        shakeX = (Math.random() - 0.5) * (pressure / 12);
        shakeY = (Math.random() - 0.5) * (pressure / 12);
        if (Math.random() > 0.95 && !isQuake) {
          setIsQuake(true);
          setTimeout(() => setIsQuake(false), 800);
        }
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.moveTo(0, plateY);
      ctx.lineTo(mid + offsetL, plateY);
      ctx.lineTo(mid + offsetL - 15, plateY + thickness);
      ctx.lineTo(0, plateY + thickness);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.moveTo(0, plateY - 4);
      ctx.lineTo(mid + offsetL, plateY - 4);
      ctx.lineTo(mid + offsetL - 2, plateY);
      ctx.lineTo(0, plateY);
      ctx.closePath();
      ctx.fill();

      if (boundaryType === 'divergent') {
        const magmaRiftGrad = ctx.createLinearGradient(mid + offsetL, plateY, mid + offsetR, plateY);
        magmaRiftGrad.addColorStop(0, '#ff3d00');
        magmaRiftGrad.addColorStop(0.5, '#ffff00');
        magmaRiftGrad.addColorStop(1, '#ff3d00');
        ctx.fillStyle = magmaRiftGrad;
        ctx.fillRect(mid + offsetL - 1, plateY, (offsetR - offsetL) + 2, thickness);

        ctx.fillStyle = '#ffb300';
        for (let i = 0; i < 3; i++) {
          const bx = mid + offsetL + Math.random() * (offsetR - offsetL);
          const by = plateY + 10 + ((timeRef.current * 20 + i * 15) % thickness);
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (boundaryType === 'convergent') {
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.moveTo(mid + offsetR, plateY + subductionDepth * 0.3);
        ctx.lineTo(width, plateY);
        ctx.lineTo(width, plateY + thickness);
        ctx.lineTo(mid + offsetR - 20 - subductionDepth * 0.5, plateY + thickness + subductionDepth);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#00695c';
        ctx.beginPath();
        ctx.moveTo(mid + offsetR, plateY + subductionDepth * 0.3 - 4);
        ctx.lineTo(width, plateY - 4);
        ctx.lineTo(width, plateY);
        ctx.lineTo(mid + offsetR - 2, plateY + subductionDepth * 0.3);
        ctx.closePath();
        ctx.fill();

        if (pressure > 30) {
          const volcX = mid - 80;
          const volcY = plateY - 4;
          ctx.fillStyle = '#3e2723';
          ctx.beginPath();
          ctx.moveTo(volcX - 30, volcY);
          ctx.lineTo(volcX - 8, volcY - 25);
          ctx.lineTo(volcX + 8, volcY - 25);
          ctx.lineTo(volcX + 30, volcY);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ff3d00';
          ctx.beginPath();
          ctx.ellipse(volcX, volcY - 25, 8, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          if (pressure > 60) {
            ctx.fillStyle = '#ff9100';
            ctx.fillRect(volcX - 4, volcY - 25, 8, 12);

            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            for (let i = 0; i < 4; i++) {
              const sy = volcY - 30 - ((timeRef.current * 15 + i * 10) % 40);
              const sx = volcX + Math.sin(timeRef.current + i) * 6;
              ctx.beginPath();
              ctx.arc(sx, sy, 5 + i, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (boundaryType === 'transform') {
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.moveTo(mid + offsetR, plateY);
        ctx.lineTo(width, plateY);
        ctx.lineTo(width, plateY + thickness);
        ctx.lineTo(mid + offsetR - 15, plateY + thickness);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.moveTo(mid + offsetR, plateY - 4);
        ctx.lineTo(width, plateY - 4);
        ctx.lineTo(width, plateY);
        ctx.lineTo(mid + offsetR - 2, plateY);
        ctx.closePath();
        ctx.fill();

        if (pressure > 50) {
          ctx.strokeStyle = '#ffb300';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(mid + (offsetL + offsetR) / 2, plateY);
          ctx.lineTo(mid + (offsetL + offsetR) / 2 - 5, plateY + thickness);
          ctx.stroke();
        }
      }

      ctx.restore();

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 12px Inter, sans-serif';
      if (boundaryType === 'divergent') {
        ctx.fillText('Expansão do Assoalho / Dorsal Mesoatlantica', 15, 30);
      } else if (boundaryType === 'convergent') {
        ctx.fillText('Zona de Subducção / Fossa e Cadeias Montanhosas', 15, 30);
      } else if (boundaryType === 'transform') {
        ctx.fillText('Falha Transcorrente / Atrito de Placas (ex: San Andreas)', 15, 30);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [boundaryType, pressure]);

  const handleFinish = () => {
    if (onComplete) onComplete(100);
  };

  return (
    <div className="geography-simulator p-4 premium-glass-card" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)' }}>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>
        🌋 {labTitle || 'Laboratório Virtual: Dinâmica de Placas Tectônicas'}
      </h3>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap-reverse' }}>
        <div style={{ flex: '1 1 350px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#121214', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: '420px' }}>
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={280} 
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
            />
            {isQuake && (
              <div style={{ color: '#ff1744', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center', marginTop: '8px', animation: 'pulse 0.3s infinite' }}>
                ⚠️ AVISO: Terremoto Ativo! Tremor detectado na falha tectônica.
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
          <div className="controls-panel premium-glass-panel p-4" style={{ borderRadius: 'var(--border-radius)', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem' }}>Configuração de Limite</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <button onClick={() => setBoundaryType('convergent')} className={`premium-btn ${boundaryType === 'convergent' ? 'btn-primary' : 'btn-outline-cyan'}`} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}>Limites Convergentes (Colisão)</button>
              <button onClick={() => setBoundaryType('divergent')} className={`premium-btn ${boundaryType === 'divergent' ? 'btn-primary' : 'btn-outline-cyan'}`} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}>Limites Divergentes (Afastamento)</button>
              <button onClick={() => setBoundaryType('transform')} className={`premium-btn ${boundaryType === 'transform' ? 'btn-primary' : 'btn-outline-cyan'}`} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}>Limites Transformantes (Deslizamento)</button>
            </div>

            <div className="slider-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Pressão Tectônica: <strong>{pressure}%</strong>
              </label>
              <input type="range" min="0" max="100" value={pressure} onChange={(e) => setPressure(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '1.25rem', lineHeight: 1.5 }}>
              {boundaryType === 'convergent' && 'A colisão de placas eleva a crosta continental criando cadeias como o Himalaia e gerando arcos vulcânicos pelo derretimento da placa subduzida.'}
              {boundaryType === 'divergent' && 'O afastamento das placas permite que o magma quente do manto suba, solidifique-se e forme novas bacias oceânicas e dorsais marinhas.'}
              {boundaryType === 'transform' && 'O deslizamento horizontal gera forte acúmulo de energia potencial elástica. Quando liberada, provoca tremores severos na crosta.'}
            </p>

            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.2rem' }}>🤖 ANALISADOR GEOLÓGICO DE IA</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                {isQuake
                  ? '⚠️ Pressão crítica atingida! A IA registrou uma ruptura sismológica de alta magnitude.'
                  : `Monitorando placa tectônica com pressão ${pressure}%.`}
              </p>
            </div>

            <button className="premium-btn btn-primary mt-4" style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.3)', fontWeight: 'bold' }} onClick={handleFinish}>
              🏆 Concluir Simulação (+50 XP & +10 Moedas)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quiz component for non-canvas geo modes ──
function GeographyQuizMode({ mode, labTitle, onComplete }: { mode: string; labTitle?: string; onComplete?: (score: number) => void }) {
  const quiz = MODE_QUIZZES[mode] || MODE_QUIZZES['relief'];
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = quiz.questions[currentQ];

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === question.answer) setScore(s => s + 1);
  };

  const next = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(q => q + 1);
      setAnswered(null);
    } else {
      setShowResult(true);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswered(null);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🌍 {labTitle || quiz.title}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{quiz.description}</p>

      {!showResult ? (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Questão {currentQ + 1}/{quiz.questions.length}
          </div>
          <p style={{ color: 'var(--text-main)', fontWeight: '500', marginBottom: '1rem' }}>{question.q}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {question.options.map((opt, i) => {
              const isCorrect = i === question.answer;
              const isSelected = answered === i;
              let bg = 'rgba(255,255,255,0.04)';
              let border = '1px solid rgba(255,255,255,0.12)';
              if (answered !== null) {
                if (isCorrect) { bg = 'rgba(76,175,80,0.2)'; border = '1px solid #4caf50'; }
                else if (isSelected) { bg = 'rgba(244,67,54,0.2)'; border = '1px solid #f44336'; }
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  style={{ textAlign: 'left', padding: '0.75rem', borderRadius: '8px', cursor: answered === null ? 'pointer' : 'default', background: bg, border, color: 'var(--text-main)', transition: 'all 0.25s' }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {answered !== null && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(6,182,212,0.08)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid rgba(6,182,212,0.2)' }}>
              🤖 <strong>Análise da IA:</strong> {question.explanation}
            </div>
          )}
          {answered !== null && (
            <button onClick={next} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              {currentQ < quiz.questions.length - 1 ? 'Próxima Questão →' : 'Ver Resultado'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{score === quiz.questions.length ? '🏆' : '🌍'}</div>
          <h3 style={{ color: 'var(--text-main)' }}>Resultado: {score}/{quiz.questions.length}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {score === quiz.questions.length ? `Excelente! Domínio completo de ${quiz.title}.` : 'Revise os conceitos e tente novamente!'}
          </p>
          <button onClick={reset} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer' }}>Refazer Quiz</button>
        </div>
      )}
      {onComplete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
          <button onClick={() => onComplete(100)} className="btn-gradient"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.3)', fontWeight: 'bold' }}>
            🏆 Concluir Laboratório (+50 XP & +10 Moedas)
          </button>
        </div>
      )}
    </div>
  );
}
