import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Play, Pause, RotateCcw, ArrowLeft, Home as HomeIcon,
  ChevronDown, ChevronUp, HelpCircle, Settings2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { SocraticTutorWidget } from '../components/SocraticTutorWidget';
import { UniversalLabContainer } from '../components/UniversalLabContainer';
import { NEW_ADVANCED_LABS } from '../../core/constants/advancedLabsRegistry';
import {
  MASTER_LABS_CATALOG,
  resolveUniversalLab,
  createGuidedLabConfig
} from '../../core/constants/masterLabsCatalog';
import type { StudioLab } from '../../core/services/labStudioService';
import { LEARNING_LABS_CATALOG, getLearningLab, getLearningLabCounts, searchLearningLabs, type LearningLab } from '../../core/constants/learningCatalog';
import { LEARNING_LEVELS, normalizeLearningLevel, learningLevelLabel, type LearningLevel } from '../../core/constants/learningLevels';
import { SkillTreeExplorerModal } from '../components/labs/SkillTreeExplorerModal';
import { LabStudioBuilderModal } from '../components/labs/LabStudioBuilderModal';
import { CertificateModal } from '../components/labs/CertificateModal';
import { issueLabCertificate, type LabCertificate } from '../../core/services/certificateService';
import { GitBranch, PlusCircle, Award } from 'lucide-react';

const LegacyLabRunner = lazy(() => import('../components/labs/LegacyLabRunner'));

interface LabMission {
  id: string;
  title: string;
  objective: string;
  steps: string[];
  scientificQuestion: string;
  options: { text: string; correct: boolean }[];
  hint: string;
}

const LAB_MISSIONS: Record<string, LabMission> = {
  pendulum: {
    id: 'pendulum_mission',
    title: 'Missão 1: O Pêndulo em Gravidades Alienígenas',
    objective: 'Investigar como a aceleração gravitacional altera o período de oscilação do pêndulo.',
    steps: [
      '1. Ajuste o comprimento do fio para 150 cm.',
      '2. Defina a gravidade para 1.6 m/s² (Lua) e observe a lentidão da oscilação.',
      '3. Depois, aumente a gravidade para 24.8 m/s² (Júpiter) e compare o novo período.',
    ],
    scientificQuestion: 'O que acontece com a frequência de oscilação quando a aceleração da gravidade diminui?',
    options: [
      { text: 'A frequência diminui (o pêndulo oscila mais devagar)', correct: true },
      { text: 'A frequência aumenta consideravelmente', correct: false },
      { text: 'A frequência permanece exatamente a mesma', correct: false },
    ],
    hint: 'Lembre-se: o período T = 2π√(L/g). Menor gravidade significa período maior e menor frequência f = 1/T.'
  },
  collisions: {
    id: 'collisions_mission',
    title: 'Missão 2: Conservação de Quantidade de Movimento',
    objective: 'Demonstrar a conservação do momento linear em colisões com e sem atrito.',
    steps: [
      '1. Mantenha o coeficiente de atrito em 0.',
      '2. Inicie a simulação e observe o choque frontal elástico.',
      '3. Aumente o atrito gradativamente para 0.05 e analise a perda de energia mecânica.',
    ],
    scientificQuestion: 'Na colisão perfeitamente elástica (sem atrito), o que se conserva?',
    options: [
      { text: 'Apenas a energia térmica gerada', correct: false },
      { text: 'A quantidade de movimento total e a energia cinética do sistema', correct: true },
      { text: 'Apenas a velocidade escalar de cada corpo isoladamente', correct: false },
    ],
    hint: 'No sistema isolado livre de forças dissipativas externas, tanto o momento linear total quanto a energia cinética permanecem constantes.'
  },
  optics: {
    id: 'optics_mission',
    title: 'Missão 3: Lei de Snell-Descartes e Refração',
    objective: 'Constatar o desvio do feixe luminoso na transição entre meios com densidades ópticas distintas.',
    steps: [
      '1. Mantenha o meio 1 como Ar (n1 = 1.0).',
      '2. Defina o meio 2 como Vidro (n2 = 1.5).',
      '3. Altere o ângulo de incidência para 45° e confira o ângulo refratado calculado.',
    ],
    scientificQuestion: 'Ao passar de um meio menos refringente para um mais refringente (Ar -> Vidro), o feixe de luz:',
    options: [
      { text: 'Aproxima-se da reta normal à superfície', correct: true },
      { text: 'Afasta-se da reta normal à superfície', correct: false },
      { text: 'Segue em linha reta sem sofrer qualquer desvio', correct: false },
    ],
    hint: 'De acordo com n1·sen(θ1) = n2·sen(θ2), se n2 > n1, então sen(θ2) < sen(θ1), logo o raio aproxima-se da normal.'
  },
  thermodynamics: {
    id: 'thermo_mission',
    title: 'Missão 4: Transformações Gasosas e Trabalho Mecânico',
    objective: 'Explorar a relação entre temperatura, pressão e volume na 1ª Lei da Termodinâmica.',
    steps: [
      '1. Monitore a pressão ao elevar a temperatura do recipiente.',
      '2. Observe o trabalho exercido pelo gás na expansão volumétrica.',
    ],
    scientificQuestion: 'Em uma transformação isobárica (pressão constante), ao dobrar a temperatura absoluta, o volume:',
    options: [
      { text: 'Dobra de valor proporcionalmente', correct: true },
      { text: 'Cai pela metade', correct: false },
      { text: 'Permanece inalterado', correct: false },
    ],
    hint: 'Pela Lei de Charles e Gay-Lussac (V1/T1 = V2/T2), volume e temperatura absoluta são diretamente proporcionais sob pressão constante.'
  },
  electromagnetism: {
    id: 'em_mission',
    title: 'Missão 5: Campo Magnético e Lei de Faraday',
    objective: 'Analisar o fluxo magnético e a indução eletromagnética em espiras condutoras.',
    steps: [
      '1. Aproxime o ímã da bobina com velocidade variável.',
      '2. Verifique a geração de força eletromotriz induzida.',
    ],
    scientificQuestion: 'O que determina a intensidade da corrente elétrica induzida em uma espira?',
    options: [
      { text: 'A taxa de variação do fluxo magnético no tempo (dΦ/dt)', correct: true },
      { text: 'A cor do isolamento do fio condutor', correct: false },
      { text: 'Apenas a temperatura ambiente do laboratório', correct: false },
    ],
    hint: 'A Lei de Faraday-Lenz expressa que ε = -dΦ/dt. Variações mais rápidas de fluxo magnético induzem tensões maiores.'
  },
  modern_physics: {
    id: 'modern_mission',
    title: 'Missão 6: Efeito Fotoelétrico de Einstein',
    objective: 'Constatar a natureza corpuscular da luz através da emissão de fotoelétrons.',
    steps: [
      '1. Ajuste a frequência da radiação incidente para a faixa ultravioleta.',
      '2. Observe a liberação de elétrons na placa metálica.',
    ],
    scientificQuestion: 'O que deve ser superior à função trabalho (φ) do metal para que ocorra emissão de elétrons?',
    options: [
      { text: 'A energia de cada fóton incidente (E = h·f)', correct: true },
      { text: 'Apenas a intensidade luminosa ou brilho da lâmpada', correct: false },
      { text: 'A área total da placa metálica', correct: false },
    ],
    hint: 'Einstein demonstrou que a emissão depende da frequência do fóton (E = h·f) ser maior que o limiar φ, e não da intensidade clássica da luz.'
  }
};

interface SimulacaoProps {
  mode?: string;
  labTitle?: string;
  labId?: string;
  onComplete?: (score: number) => void;
}

export const Simulacao: React.FC<SimulacaoProps> = ({ mode, labId, labTitle, onComplete }) => {
  const { currentUser, userData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const embedded = mode !== undefined || labId !== undefined;
  const [customLabs, setCustomLabs] = useState<StudioLab[]>([]);
  const requestedLab = getLearningLab(searchParams.get('lab') || '') ?? customLabs.find(lab => lab.id === searchParams.get('lab'));
  const activeTab = embedded ? mode || 'pendulum' : requestedLab?.id || '';
  const catalogLevel = requestedLab?.academicLevel ?? normalizeLearningLevel(searchParams.get('level'), normalizeLearningLevel(userData?.gradeLevel));
  const [showMission, setShowMission] = useState(true);
  const [selectedMissionOption, setSelectedMissionOption] = useState<number | null>(null);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [missionFeedback, setMissionFeedback] = useState<string | null>(null);
  const [catalogExpanded, setShowCatalogExplorer] = useState(false);
  const showCatalogExplorer = !activeTab || catalogExpanded;
  const [catalogSearch, setCatalogSearch] = useState('');
  const [subjectSelection, setSubjectSelection] = useState({ labId: activeTab, value: requestedLab?.subject || '' });
  const [completedActivities, setCompletedActivities] = useState<{ id: string; academicLevel: LearningLevel }[]>([]);
  const counts = getLearningLabCounts();

  // Novos modais estratégicos
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState<LabCertificate | null>(null);
  const activeCustomLab = customLabs.find(lab => lab.id === activeTab);

  const selectedLab = activeCustomLab ?? getLearningLab(activeTab);
  const completedAtLevel = completedActivities.filter(activity => activity.academicLevel === catalogLevel);
  const subjects = [...new Set([
    ...searchLearningLabs({ academicLevel: catalogLevel }).map(lab => lab.subject),
    ...customLabs.filter(lab => lab.academicLevel === catalogLevel).map(lab => lab.subject),
  ])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const selectedSubject = subjectSelection.labId === activeTab ? subjectSelection.value : selectedLab?.subject || '';
  const catalogSubject = subjects.includes(selectedSubject) ? selectedSubject : '';
  const filteredLabs = searchLearningLabs({ query: catalogSearch, academicLevel: catalogLevel, subject: catalogSubject || undefined });
  const query = catalogSearch.trim().toLocaleLowerCase('pt-BR');
  const customResults = customLabs.filter(lab => lab.academicLevel === catalogLevel && (!catalogSubject || lab.subject === catalogSubject) && `${lab.title} ${lab.subject} ${lab.topic}`.toLocaleLowerCase('pt-BR').includes(query));

  function setCatalogSubject(value: string) {
    setSubjectSelection({ labId: activeTab, value });
  }

  function openLab(lab: LearningLab | StudioLab) {
    setSearchParams({ lab: lab.id, level: lab.academicLevel });
    setShowCatalogExplorer(false);
  }

  function completeSelectedLab(score: number) {
    if (selectedLab) setCompletedActivities(previous => previous.some(item => item.id === selectedLab.id) ? previous : [...previous, { id: selectedLab.id, academicLevel: selectedLab.academicLevel }]);
    onComplete?.(score * 10);
  }

  const handleOpenCertificate = async () => {
    if (completedAtLevel.length === 0) return;
    const cert = await issueLabCertificate({
      studentId: currentUser?.uid || userData?.email || 'estudante_default',
      studentName: userData?.name || 'Estudante Kortex',
      academicLevelLabel: learningLevelLabel(catalogLevel),
      completedLabsCount: completedAtLevel.length,
      totalSimulatedHours: 0,
    });
    setCurrentCertificate(cert);
    setShowCertModal(true);
  };

  useEffect(() => {
    setSelectedMissionOption(null);
    setMissionCompleted(false);
    setMissionFeedback(null);
  }, [activeTab]);

  const [refractionIndex1, setRefractionIndex1] = useState(1.0); // Ar
  const [refractionIndex2, setRefractionIndex2] = useState(1.5); // Vidro
  const [incidentAngle, setIncidentAngle] = useState(45); // Graus

  // Pendulum states
  const [isPlayingPendulum, setIsPlayingPendulum] = useState(false);
  const [angle, setAngle] = useState(30);
  const [length, setLength] = useState(150);
  const [gravity, setGravity] = useState(9.8);
  const [mass, setMass] = useState(1.0);
  const pendulumCanvasRef = useRef<HTMLCanvasElement>(null);
  const pendulumAnimRef = useRef<number>(0);

  // Collisions states
  const [isPlayingCollisions, setIsPlayingCollisions] = useState(false);
  const [friction, setFriction] = useState(0);
  const collisionCanvasRef = useRef<HTMLCanvasElement>(null);
  const collisionAnimRef = useRef<number>(0);
  const [balls, setBalls] = useState([
    { id: 1, x: 80, y: 100, vx: 5, vy: 0, radius: 20, mass: 1, color: '#E4683F' },
    { id: 2, x: 350, y: 100, vx: -3, vy: 0, radius: 25, mass: 1.5, color: '#293E24' }
  ]);

  // Pendulum canvas rendering
  useEffect(() => {
    const canvas = pendulumCanvasRef.current;
    if (!canvas || activeTab !== 'pendulum') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentAngle = (angle * Math.PI) / 180;
    let angularVelocity = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Tela de fundo clara do laboratório com grade de alta precisão
      ctx.fillStyle = '#FAF7EE';
      ctx.fillRect(0, 0, width, height);

      // Grade milimetrada de laboratório (suave e limpa)
      ctx.strokeStyle = 'rgba(41, 62, 36, 0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      const pivotX = width / 2;
      const pivotY = 80;

      if (isPlayingPendulum) {
        const angularAcceleration = (-(gravity / length) * 100) * Math.sin(currentAngle);
        angularVelocity += angularAcceleration * 0.016;
        currentAngle += angularVelocity * 0.016;
      }

      const bobX = pivotX + length * Math.sin(currentAngle);
      const bobY = pivotY + length * Math.cos(currentAngle);

      // Linha de referência vertical (tracejada)
      ctx.strokeStyle = 'rgba(41, 62, 36, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + length);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fio do Pêndulo (Verde 700 da identidade visual)
      ctx.strokeStyle = '#293E24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Ponto de Pivot / Suporte Superior
      ctx.fillStyle = '#172314';
      ctx.strokeStyle = '#293E24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Esfera oscilante com gradiente oficial Laranja
      const bobRadius = 14 + mass * 5;
      const gradient = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobRadius);
      gradient.addColorStop(0, '#E4683F');
      gradient.addColorStop(1, '#B8441F');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      // Borda nítida da esfera
      ctx.strokeStyle = '#B8441F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Indicador de ângulo (Texto nítido em Verde 900 sobre fundo claro)
      ctx.fillStyle = '#172314';
      ctx.font = '700 13px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`θ = ${(currentAngle * 180 / Math.PI).toFixed(1)}°`, pivotX, height - 16);

      pendulumAnimRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (pendulumAnimRef.current) cancelAnimationFrame(pendulumAnimRef.current);
    };
  }, [isPlayingPendulum, angle, length, gravity, mass, activeTab]);

  // Collisions canvas rendering
  useEffect(() => {
    const canvas = collisionCanvasRef.current;
    if (!canvas || activeTab !== 'collisions') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const localBalls = balls.map(b => ({ ...b }));

    const draw = () => {
      // Fundo de bancada de laboratório claro
      ctx.fillStyle = '#FAF7EE';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grade milimetrada de física mecânica
      ctx.strokeStyle = 'rgba(41, 62, 36, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Trilho de Ar / Superfície de deslizamento
      ctx.strokeStyle = '#293E24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 130);
      ctx.lineTo(canvas.width, 130);
      ctx.stroke();

      localBalls.forEach(ball => {
        // Corpo da esfera com gradiente
        const gradient = ctx.createRadialGradient(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0, ball.x, ball.y, ball.radius);
        gradient.addColorStop(0, ball.color);
        gradient.addColorStop(1, ball.color === '#E4683F' ? '#B8441F' : '#172314');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Contorno nítido
        ctx.strokeStyle = '#172314';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Rótulo de Massa sobre a esfera
        ctx.fillStyle = '#FAF7EE';
        ctx.font = 'bold 11px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${ball.mass}kg`, ball.x, ball.y + 4);

        // Vetor de Velocidade (Rótulo superior)
        ctx.fillStyle = '#172314';
        ctx.font = '700 11px Space Grotesk, sans-serif';
        ctx.fillText(`v = ${ball.vx.toFixed(1)} m/s`, ball.x, ball.y - ball.radius - 8);
      });
    };

    const updateCollisions = () => {
      localBalls.forEach(b => {
        b.x += b.vx;
        if (friction > 0) {
          if (b.vx > 0) b.vx = Math.max(0, b.vx - friction * 0.05);
          if (b.vx < 0) b.vx = Math.min(0, b.vx + friction * 0.05);
        }
        if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -1; }
        else if (b.x + b.radius > canvas.width) { b.x = canvas.width - b.radius; b.vx *= -1; }
      });

      const b1 = localBalls[0];
      const b2 = localBalls[1];
      const dx = b2.x - b1.x;
      const distance = Math.abs(dx);

      if (distance < b1.radius + b2.radius) {
        const overlap = (b1.radius + b2.radius) - distance;
        const direction = dx > 0 ? 1 : -1;
        b1.x -= overlap / 2 * direction;
        b2.x += overlap / 2 * direction;

        const m1 = b1.mass; const m2 = b2.mass;
        const v1 = b1.vx; const v2 = b2.vx;
        b1.vx = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
        b2.vx = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
      }

      draw();
      if (isPlayingCollisions) {
        collisionAnimRef.current = requestAnimationFrame(updateCollisions);
      }
    };

    if (isPlayingCollisions) {
      collisionAnimRef.current = requestAnimationFrame(updateCollisions);
    } else {
      draw();
    }

    return () => {
      if (collisionAnimRef.current) cancelAnimationFrame(collisionAnimRef.current);
    };
  }, [isPlayingCollisions, activeTab, friction]);

  const resetPendulum = () => {
    setIsPlayingPendulum(false);
    setAngle(30);
  };

  const resetCollisions = () => {
    setIsPlayingCollisions(false);
    setBalls([
      { id: 1, x: 80, y: 100, vx: 5, vy: 0, radius: 20, mass: 1, color: '#E4683F' },
      { id: 2, x: 350, y: 100, vx: -3, vy: 0, radius: 25, mass: 1.5, color: '#293E24' }
    ]);
  };

  const period = (2 * Math.PI * Math.sqrt((length / 100) / gravity)).toFixed(2);
  const frequency = (1 / (2 * Math.PI * Math.sqrt((length / 100) / gravity))).toFixed(2);

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      {!embedded && <>
        <nav aria-label="Navegação dos laboratórios" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-outline"><HomeIcon size={16} /> Hub inicial</Link>
          <Link to={userData?.role === 'professor' ? '/professor' : userData?.role === 'coordenador' ? '/coordenacao' : userData?.role === 'admin' ? '/admin' : '/estudante'} className="btn-outline"><ArrowLeft size={16} /> Meu aprendizado</Link>
        </nav>
        <header style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ color: 'var(--text-main)', marginBottom: '0.4rem' }}>Laboratórios por nível de aprendizagem</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Escolha seu nível, a disciplina e a atividade. O catálogo reúne {LEARNING_LABS_CATALOG.length} laboratórios.</p>
        </header>
        <section aria-label="Catálogo de laboratórios" className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <nav aria-label="Níveis de aprendizagem" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {LEARNING_LEVELS.map(level => <button key={level.id} type="button" aria-pressed={catalogLevel === level.id} className={catalogLevel === level.id ? 'btn-primary' : 'btn-outline'} onClick={() => {
              setCatalogSubject('');
              setSearchParams({ level: level.id });
            }}>{level.label} ({counts[level.id]})</button>)}
          </nav>
          <p style={{ color: 'var(--text-secondary)', margin: '0.85rem 0' }}>{LEARNING_LEVELS.find(level => level.id === catalogLevel)?.description}</p>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: '0.3rem', flex: '1 1 250px', color: 'var(--text-main)' }}>Disciplina
              <select aria-label="Disciplina" value={catalogSubject} onChange={event => { setCatalogSubject(event.target.value); setShowCatalogExplorer(true); }} style={{ padding: '0.6rem', color: 'var(--text-main)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <option value="">Todas as disciplinas deste nível</option>
                {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </label>
            <label style={{ display: 'grid', gap: '0.3rem', flex: '1 1 260px', color: 'var(--text-main)' }}>Buscar laboratórios
              <input type="search" aria-label="Buscar laboratórios" placeholder="Título, tópico ou código" value={catalogSearch} onChange={event => { setCatalogSearch(event.target.value); setShowCatalogExplorer(true); }} style={{ padding: '0.6rem', color: 'var(--text-main)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
            </label>
            <button type="button" className="btn-outline" onClick={() => setShowSkillTree(true)}><GitBranch size={16} /> Mapa de atividades</button>
            <button type="button" className="btn-outline" onClick={() => setShowStudio(true)}><PlusCircle size={16} /> Criar atividade</button>
            <button type="button" className="btn-outline" disabled={completedAtLevel.length === 0} onClick={handleOpenCertificate} title="Atividades concluídas nesta sessão; carga horária não contabilizada"><Award size={16} /> Certificado deste nível</button>
          </div>
          {activeTab && <button type="button" className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => setShowCatalogExplorer(previous => !previous)}>{showCatalogExplorer ? 'Recolher atividades' : 'Explorar atividades deste nível'}</button>}
          {showCatalogExplorer && <>
            <p role="status" style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>{filteredLabs.length + customResults.length} atividades em {learningLevelLabel(catalogLevel)}.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.85rem', maxHeight: '500px', overflowY: 'auto', padding: '0.2rem' }}>
              {[...customResults, ...filteredLabs].map(lab => <article key={lab.id} aria-label={lab.title} data-lab-id={lab.id} data-academic-level={lab.academicLevel} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{learningLevelLabel(lab.academicLevel)} · {lab.subject}</span>
                <h2 style={{ fontSize: '1rem', margin: 0 }}>{lab.icon} {lab.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>{lab.topic}</p>
                <button type="button" className="btn-outline" onClick={() => openLab(lab)} style={{ marginTop: 'auto' }}><Play size={14} /> Abrir laboratório</button>
              </article>)}
            </div>
            {filteredLabs.length + customResults.length === 0 && <p>Nenhum laboratório encontrado. Experimente outra disciplina ou termo de busca.</p>}
          </>}
        </section>
        {searchParams.get('lab') && !selectedLab && <p role="alert">Laboratório não encontrado. Escolha uma atividade no catálogo.</p>}
        {selectedLab && <p style={{ color: 'var(--text-secondary)' }}>{learningLevelLabel(selectedLab.academicLevel)} › {selectedLab.subject} › {selectedLab.title}</p>}
      </>}
      {embedded && <h2 style={{ color: 'var(--text-main)' }}>Bancada: {labTitle || LAB_MISSIONS[activeTab]?.title || 'Física'}</h2>}

      {/* ── PAINEL DE MISSÃO EXPERIMENTAL GUIADA ── */}
      {LAB_MISSIONS[activeTab] && (
        <div
          className="glass-card"
          style={{
            marginBottom: '1.75rem',
            border: missionCompleted ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-color, #E2D7C3)',
            background: missionCompleted ? 'rgba(16,185,129,0.04)' : 'transparent',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowMission(!showMission)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🎯</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {LAB_MISSIONS[activeTab].title}
                  </h3>
                  {missionCompleted && (
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '9999px', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
                      ✓ Concluída (+50 XP)
                    </span>
                  )}
                </div>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {LAB_MISSIONS[activeTab].objective}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              onClick={(e) => { e.stopPropagation(); setShowMission(!showMission); }}
            >
              {showMission ? <><ChevronUp style={{ width: '0.9rem', height: '0.9rem' }} /> Ocultar Roteiro</> : <><ChevronDown style={{ width: '0.9rem', height: '0.9rem' }} /> Ver Roteiro Guiado</>}
            </button>
          </div>

          {showMission && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Steps */}
              <div style={{ marginBottom: '1.25rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary-accessible, #B8441F)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Passo a passo investigativo no laboratório:
                </strong>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {LAB_MISSIONS[activeTab].steps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Scientific Question & Quiz */}
              <div style={{
                padding: '1.25rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm, 10px)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <HelpCircle style={{ width: '1.15rem', height: '1.15rem', color: 'var(--color-primary-accessible, #E4683F)' }} />
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    Desafio de Conclusão: {LAB_MISSIONS[activeTab].scientificQuestion}
                  </strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.85rem' }}>
                  {LAB_MISSIONS[activeTab].options.map((opt, optIdx) => {
                    const isSelected = selectedMissionOption === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          setSelectedMissionOption(optIdx);
                          setMissionFeedback(null);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm, 10px)',
                          border: isSelected ? '1.5px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--color-primary-light, rgba(228,104,63,0.18))' : 'var(--bg-base)',
                          color: isSelected ? 'var(--color-primary-accessible, #F59C7B)' : 'var(--text-main)',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem'
                        }}
                      >
                        <span style={{
                          fontWeight: 700,
                          minWidth: '1.2rem',
                          color: isSelected ? 'var(--color-primary, #E4683F)' : 'var(--color-primary-accessible, #B8441F)'
                        }}>
                          {String.fromCharCode(65 + optIdx)})
                        </span>
                        <span style={{ color: 'var(--text-main)', flex: 1, lineHeight: 1.45 }}>
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {missionFeedback && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: missionCompleted ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.15)',
                      border: missionCompleted ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(239,68,68,0.4)',
                      color: missionCompleted ? '#34d399' : '#f87171',
                      fontWeight: 500,
                    }}
                  >
                    {missionFeedback}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={selectedMissionOption === null || missionCompleted}
                    style={{
                      padding: '0.65rem 1.4rem',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: (selectedMissionOption === null || missionCompleted) ? 0.6 : 1,
                      cursor: (selectedMissionOption === null || missionCompleted) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => {
                      if (selectedMissionOption === null) return;
                      const isCorrect = LAB_MISSIONS[activeTab].options[selectedMissionOption].correct;
                      if (isCorrect) {
                        setMissionCompleted(true);
                        setMissionFeedback('🎉 Excelente dedução científica! Sua resposta está correta e comprova a relação observada no simulador.');
                        if (onComplete) {
                          onComplete(100);
                        }
                      } else {
                        setMissionFeedback(`💡 Não exatamente. Dica: ${LAB_MISSIONS[activeTab].hint}`);
                      }
                    }}
                  >
                    {missionCompleted ? '✓ Missão Concluída' : 'Validar Conclusão'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pendulum Tab */}
      {activeTab === 'pendulum' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Canvas Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="lab-canvas-container" style={{ padding: '1.25rem' }}>
              <canvas
                ref={pendulumCanvasRef}
                width={800}
                height={450}
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', background: '#FAF7EE' }}
              />
            </div>

            {/* Play controls */}
            <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={() => setIsPlayingPendulum(!isPlayingPendulum)} className="btn-gradient" style={{ padding: '0.65rem 1.5rem' }}>
                {isPlayingPendulum ? <><Pause style={{ width: '1.15rem', height: '1.15rem' }} /> Pausar</> : <><Play style={{ width: '1.15rem', height: '1.15rem' }} /> Iniciar</>}
              </button>
              <button onClick={resetPendulum} className="btn-outline" style={{ padding: '0.65rem 1.5rem' }}>
                <RotateCcw style={{ width: '1.15rem', height: '1.15rem' }} /> Resetar
              </button>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings2 style={{ width: '1.15rem', height: '1.15rem', color: 'var(--color-primary-accessible, #B8441F)' }} />
                Variáveis Físicas
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ângulo Inicial</label>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-secondary, #293E24)', fontWeight: 600 }}>{angle}°</span>
                  </div>
                  <input type="range" min="5" max="85" value={angle} onChange={e => setAngle(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Comprimento</label>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-secondary, #293E24)', fontWeight: 600 }}>{length} px</span>
                  </div>
                  <input type="range" min="50" max="250" value={length} onChange={e => setLength(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Gravidade</label>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-secondary, #293E24)', fontWeight: 600 }}>{gravity.toFixed(1)} m/s²</span>
                  </div>
                  <input type="range" min="1" max="25" step="0.1" value={gravity} onChange={e => setGravity(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Massa</label>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-secondary, #293E24)', fontWeight: 600 }}>{mass.toFixed(1)} kg</span>
                  </div>
                  <input type="range" min="0.5" max="3" step="0.1" value={mass} onChange={e => setMass(Number(e.target.value))} disabled={isPlayingPendulum} />
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>
                Informações
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Período (T)</p>
                  <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{period}s</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Frequência (f)</p>
                  <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{frequency} Hz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive override for mobile */}
          <style>{`
            @media (max-width: 768px) {
              .fade-in > div:first-child { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      )}

      {/* Collisions Tab */}
      {activeTab === 'collisions' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="lab-canvas-container" style={{ padding: '1.25rem' }}>
              <canvas
                ref={collisionCanvasRef}
                width={600}
                height={200}
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', background: '#FAF7EE' }}
              />
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <span className={friction === 0 ? 'badge-green' : 'badge-yellow'}>
                  Conservação do Momento: {friction === 0 ? 'ATIVA' : 'DISSIPATIVA'}
                </span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={() => setIsPlayingCollisions(!isPlayingCollisions)} className="btn-gradient" style={{ padding: '0.65rem 1.5rem' }}>
                {isPlayingCollisions ? <><Pause style={{ width: '1.15rem', height: '1.15rem' }} /> Pausar</> : <><Play style={{ width: '1.15rem', height: '1.15rem' }} /> Iniciar</>}
              </button>
              <button onClick={resetCollisions} className="btn-outline" style={{ padding: '0.65rem 1.5rem' }}>
                <RotateCcw style={{ width: '1.15rem', height: '1.15rem' }} /> Resetar
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings2 style={{ width: '1.15rem', height: '1.15rem', color: 'var(--color-primary-accessible, #B8441F)' }} />
              Dinâmica de Colisões
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Atrito Superficial</label>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-secondary, #293E24)', fontWeight: 600 }}>{friction.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" value={friction} onChange={e => setFriction(Number(e.target.value))} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {friction === 0 ? 'Colisão perfeitamente elástica' : 'Colisão com perda de energia cinética'}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Massa M1 (Laranja)</label>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-primary-accessible, #B8441F)' }}>{balls[0].mass.toFixed(1)}</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.5"
                  value={balls[0].mass}
                  onChange={e => {
                    const n = [...balls];
                    n[0].mass = Number(e.target.value);
                    n[0].radius = 20 * Number(e.target.value);
                    setBalls(n);
                  }}
                  disabled={isPlayingCollisions}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Massa M2 (Verde)</label>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-verde-700, #293E24)' }}>{balls[1].mass.toFixed(1)}</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.5"
                  value={balls[1].mass}
                  onChange={e => {
                    const n = [...balls];
                    n[1].mass = Number(e.target.value);
                    n[1].radius = 20 * Number(e.target.value);
                    setBalls(n);
                  }}
                  disabled={isPlayingCollisions}
                />
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .fade-in > div { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      )}
      {/* Optics Tab */}
      {activeTab === 'optics' && (() => {
        const rad1 = (incidentAngle * Math.PI) / 180;
        const sinRad2 = (refractionIndex1 * Math.sin(rad1)) / refractionIndex2;
        const isTotalInternalReflection = sinRad2 > 1.0;
        const rad2 = isTotalInternalReflection ? rad1 : Math.asin(sinRad2);
        const refractedAngle = isTotalInternalReflection ? incidentAngle : (rad2 * 180 / Math.PI);

        return (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="lab-canvas-container" style={{ width: '100%', height: '300px', background: '#FAF7EE', borderRadius: 'var(--radius-sm, 10px)', position: 'relative', overflow: 'hidden', border: '1px solid #E2D7C3' }}>
                {/* Meio 1 (Ar / Meio Superior) */}
                <div style={{ height: '50%', background: 'rgba(41, 62, 36, 0.05)', borderBottom: '2px dashed #293E24', display: 'flex', alignItems: 'flex-start', padding: '0.6rem', color: '#172314', fontSize: '0.82rem', fontWeight: 600 }}>
                  Meio 1 (n₁ = {refractionIndex1.toFixed(2)}) — Ar
                </div>
                {/* Meio 2 (Vidro / Meio Inferior) */}
                <div style={{ height: '50%', background: 'rgba(228, 104, 63, 0.08)', display: 'flex', alignItems: 'flex-end', padding: '0.6rem', color: '#172314', fontSize: '0.82rem', fontWeight: 600 }}>
                  Meio 2 (n₂ = {refractionIndex2.toFixed(2)}) — Vidro
                </div>

                {/* Linha Normal com alto contraste */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', borderLeft: '2px dashed rgba(41, 62, 36, 0.45)' }} />

                {/* SVG dos Raios Luminosos */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {/* Raio Incidente */}
                  <line
                    x1={250 - 140 * Math.sin(rad1)}
                    y1={150 - 140 * Math.cos(rad1)}
                    x2={250}
                    y2={150}
                    stroke="#D95A2B"
                    strokeWidth="3.5"
                  />
                  {/* Raio Refratado ou Refletido */}
                  {!isTotalInternalReflection ? (
                    <line
                      x1={250}
                      y1={150}
                      x2={250 + 140 * Math.sin(rad2)}
                      y2={150 + 140 * Math.cos(rad2)}
                      stroke="#293E24"
                      strokeWidth="3.5"
                    />
                  ) : (
                    <line
                      x1={250}
                      y1={150}
                      x2={250 + 140 * Math.sin(rad1)}
                      y2={150 - 140 * Math.cos(rad1)}
                      stroke="#BC391F"
                      strokeWidth="3.5"
                    />
                  )}
                </svg>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                {isTotalInternalReflection ? (
                  <span className="badge badge-red">⚠️ Reflexão total interna ocorrida!</span>
                ) : (
                  <span className="badge badge-primary">Ângulo de refração θ₂ = {refractedAngle.toFixed(1)}° (Lei de Snell-Descartes)</span>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Controles de óptica
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Índice de refração Meio 1 (n₁)</label>
                  <input type="range" min="1.0" max="2.5" step="0.1" value={refractionIndex1} onChange={e => setRefractionIndex1(Number(e.target.value))} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-primary-accessible, #B8441F)' }}>{refractionIndex1.toFixed(2)}</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Índice de refração Meio 2 (n₂)</label>
                  <input type="range" min="1.0" max="2.5" step="0.1" value={refractionIndex2} onChange={e => setRefractionIndex2(Number(e.target.value))} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-verde-700, #293E24)' }}>{refractionIndex2.toFixed(2)}</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ângulo incidente (θ₁)</label>
                  <input type="range" min="0" max="85" value={incidentAngle} onChange={e => setIncidentAngle(Number(e.target.value))} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-primary-accessible, #B8441F)' }}>{incidentAngle}°</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Electromagnetism Tab */}
      {activeTab === 'electromagnetism' && (
        <div className="fade-in glass-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🧲 Eletromagnetismo — Força de Lorentz</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Exemplo de elétron com velocidade perpendicular a um campo magnético uniforme: r = mv / (|q|B). A figura é esquemática, sem escala; se houver velocidade paralela ao campo, a trajetória pode ser helicoidal.</p>
            <div className="lab-canvas-container" style={{ width: '100%', height: '280px', background: '#FAF7EE', borderRadius: 'var(--radius-sm, 10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2D7C3', position: 'relative' }}>
              <svg width="300" height="220">
                <circle cx="150" cy="110" r="70" fill="none" stroke="var(--color-secondary, #293E24)" strokeWidth="2.5" strokeDasharray="6 4" />
                <circle cx="220" cy="110" r="11" fill="var(--color-primary, #E4683F)" />
                <text x="220" y="114" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">e⁻</text>
                <line x1="150" y1="110" x2="220" y2="110" stroke="var(--color-secondary, #293E24)" strokeWidth="2" />
                <text x="185" y="102" fill="#172314" fontSize="12" fontWeight="bold">r = mv/(|q|B)</text>
              </svg>
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Variáveis Magnéticas</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div>Campo Magnético (B): <strong style={{ color: 'var(--color-verde-700, #293E24)' }}>0.5 T</strong></div>
              <div>Carga Elétrica (q): <strong style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>−1,6 × 10⁻¹⁹ C</strong></div>
              <div>Massa (m): <strong style={{ color: 'var(--text-main)' }}>9.1 × 10⁻³¹ kg</strong></div>
              <div>Velocidade (v): <strong style={{ color: 'var(--color-verde-700, #293E24)' }}>2.0 × 10⁶ m/s</strong></div>
              <div>Raio calculado: <strong>2,28 × 10⁻⁵ m</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Thermodynamics Tab */}
      {activeTab === 'thermodynamics' && (
        <div className="fade-in glass-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🔥 Termodinâmica — Equação dos Gases Ideais</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Relação entre Pressão (P), Volume (V) e Temperatura (T) no modelo ideal P · V = n · R · T.</p>
            <div className="lab-canvas-container" style={{ width: '100%', height: '280px', background: '#FAF7EE', borderRadius: 'var(--radius-sm, 10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2D7C3' }}>
              <div style={{ width: '140px', height: '180px', border: '3px solid var(--color-danger, #BC391F)', borderTop: 'none', position: 'relative', background: 'rgba(188,57,31,0.05)' }}>
                <div style={{ position: 'absolute', top: '40px', left: 0, right: 0, height: '14px', background: '#293E24', border: '1px solid #172314' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '20px', right: '20px', height: '60px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger, #BC391F)' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary, #E4683F)' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-verde-700, #293E24)' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary-accessible, #B8441F)' }} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Estado Termodinâmico</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div>Pressão (P): <strong style={{ color: 'var(--color-danger, #BC391F)' }}>1.5 atm</strong></div>
              <div>Volume (V): <strong style={{ color: 'var(--color-verde-700, #293E24)' }}>2.0 L</strong></div>
              <div>Temperatura (T): <strong style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>300 K (27°C)</strong></div>
              <div>Quantidade de Matéria (n): <strong style={{ color: 'var(--color-verde-700, #293E24)' }}>≈ 0,122 mol</strong></div>
              <div>n = PV/(RT), com R = 0,08206 L·atm/(mol·K).</div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Physics Tab */}
      {activeTab === 'modern_physics' && (
        <div className="fade-in glass-card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>⚛️ Física Moderna — Efeito Fotoelétrico</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Fótons incidentes com energia E = h · f ejetam fotoelétrons com energia cinética K_máx = hf - Φ.</p>
            <div className="lab-canvas-container" style={{ width: '100%', height: '280px', background: '#FAF7EE', borderRadius: 'var(--radius-sm, 10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2D7C3' }}>
              <svg width="320" height="200">
                <rect x="40" y="40" width="20" height="120" fill="#293E24" rx="3" />
                <text x="50" y="175" textAnchor="middle" fill="#172314" fontSize="11" fontWeight="700">Placa (Catodo)</text>
                <path d="M 120,40 L 55,90" stroke="var(--color-primary, #E4683F)" strokeWidth="2.5" strokeDasharray="4 2" />
                <path d="M 140,60 L 55,105" stroke="var(--color-primary, #E4683F)" strokeWidth="2.5" strokeDasharray="4 2" />
                <text x="135" y="45" fill="var(--color-primary-accessible, #B8441F)" fontSize="11" fontWeight="bold">h·f (Fótons)</text>
                <circle cx="160" cy="95" r="7" fill="var(--color-primary, #E4683F)" />
                <line x1="60" y1="95" x2="154" y2="95" stroke="var(--color-primary, #E4683F)" strokeWidth="2" strokeDasharray="3 2" />
                <text x="180" y="99" fill="var(--color-primary-accessible, #B8441F)" fontSize="11" fontWeight="bold">e⁻ (Fotoelétron)</text>
              </svg>
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Parâmetros Quânticos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div>Constante de Planck (h): <strong style={{ color: '#a78bfa' }}>6.63 × 10⁻³⁴ J·s</strong></div>
              <div>Frequência da Luz (f): <strong style={{ color: '#f59e0b' }}>7.5 × 10¹⁴ Hz (UV)</strong></div>
              <div>Função Trabalho (Φ): <strong style={{ color: '#ef4444' }}>2.3 eV (Sódio)</strong></div>
              <div>Energia Cinética (K_máx): <strong style={{ color: '#10b981' }}>0.8 eV</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Renderização Dinâmica dos Laboratórios Avançados e Catálogo Master (UniversalLabContainer) */}
      {!embedded && getLearningLab(activeTab)?.source === 'legacy' && <Suspense fallback={<p role="status">Carregando bancada…</p>}>
        <LegacyLabRunner key={activeTab} labId={activeTab} onComplete={({ score }) => completeSelectedLab(score)} />
      </Suspense>}
      {!embedded && (activeCustomLab || NEW_ADVANCED_LABS[activeTab] || MASTER_LABS_CATALOG.some(l => l.id === activeTab)) && (
        <UniversalLabContainer
          config={activeCustomLab ? createGuidedLabConfig(activeCustomLab, activeCustomLab.learningContent) : resolveUniversalLab(activeTab)}
          onComplete={({ score }) => completeSelectedLab(score)}
        />
      )}

      {/* Mediação Ativa: Tutor Socrático e Freiriano (para labs legados) */}
      {embedded && LAB_MISSIONS[activeTab] && (
        <SocraticTutorWidget
          labTitle={`Laboratório de ${activeTab.toUpperCase()}`}
          subject="Ciências e Física Interativa"
        />
      )}

      {!embedded && <>
        <SkillTreeExplorerModal
          isOpen={showSkillTree}
          onClose={() => setShowSkillTree(false)}
          academicLevel={catalogLevel}
          subject={catalogSubject || undefined}
          query={catalogSearch}
          completedLabIds={completedActivities.map(activity => activity.id)}
          onSelectLab={id => {
            const lab = getLearningLab(id);
            if (lab) openLab(lab);
          }}
        />
        <LabStudioBuilderModal
          key={catalogLevel}
          initialAcademicLevel={catalogLevel}
          isOpen={showStudio}
          onClose={() => setShowStudio(false)}
          existingLabs={customLabs}
          onSaveNewLab={newLab => {
            setCustomLabs(previous => [newLab, ...previous]);
            openLab(newLab);
          }}
        />
        <CertificateModal isOpen={showCertModal} onClose={() => setShowCertModal(false)} certificate={currentCertificate} />
      </>}

    </div>
  );
};

export default Simulacao;
