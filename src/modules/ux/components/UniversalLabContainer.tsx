import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Download, 
  FileText, CheckCircle2, Sliders,
  BookOpen, Columns2, History, Terminal, 
  Bot, ShieldAlert, Box, Copy, Check
} from 'lucide-react';
import { SocraticTutorWidget } from '../components/SocraticTutorWidget';
import { triggerPrintLabReport, generateLabReportMarkdown, generateLabReportLatex } from '../../core/services/labReportService';
import { estimateStudentProficiency, getCalibratedTriParametersForLab, type TriProficiencyResult, type TriAnswerRecord } from '../../core/services/triEvaluationService';
import { sonifier } from '../../core/services/webAudioSonifier';
import { offlineSyncService } from '../../core/services/offlineSyncService';
import { LabNotebookDrawer } from './labs/LabNotebookDrawer';
import { LabSplitScreenComparator } from './labs/LabSplitScreenComparator';
import { LabTimeTravelReplay } from './labs/LabTimeTravelReplay';
import { LabAccessibilityToolbar } from './labs/LabAccessibilityToolbar';
import { LabSocraticTutorModal } from './labs/LabSocraticTutorModal';
import { LabPythonRunnerModal } from './labs/LabPythonRunnerModal';
import { SecureExamModal } from './labs/SecureExamModal';
import { Lab3DRenderer } from './labs/Lab3DRenderer';
import type { LabLearningContent } from '../../core/content/labLearningContent';
import { GuidedLabActivity } from './labs/GuidedLabActivity';
import { LabLearningWorkspace } from './labs/LabLearningWorkspace';
import { learningLevelLabel, type LearningLevel } from '../../core/constants/learningLevels';

export interface UniversalLabParam {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description?: string;
}

export type LabParameter = UniversalLabParam;

export interface UniversalLabQuestion {
  question: string;
  options: {
    text: string;
    correct: boolean;
    explanation: string;
  }[];
}

export interface UniversalLabConfig {
  id: string;
  title: string;
  academicLevel: LearningLevel;
  subject: string;
  topic: string;
  objective: string;
  theoreticalBackground: string;
  learningContent?: LabLearningContent;
  presentation?: 'simulation' | 'guided_activity';
  parameters: UniversalLabParam[];
  initialState?: Record<string, any>;
  physicsStep: (
    params: Record<string, number>, 
    currentState: Record<string, any>, 
    dt: number
  ) => { 
    nextState: Record<string, any>; 
    telemetry: Record<string, number>; 
  };
  renderCanvas: (
    ctx: CanvasRenderingContext2D, 
    state: Record<string, any>, 
    params: Record<string, number>, 
    width: number, 
    height: number
  ) => void;
  questions?: UniversalLabQuestion[];
  socraticPromptContext?: (params: Record<string, number>, state: Record<string, any>) => string;
}

interface UniversalLabContainerProps {
  config: UniversalLabConfig;
  onComplete?: (reportData: { score: number; telemetryRows: number }) => void;
}

export function UniversalLabContainer({ config, onComplete }: UniversalLabContainerProps) {
  if (config.presentation === 'guided_activity') {
    if (!config.learningContent) throw new Error(`Atividade sem conteúdo: ${config.id}`);
    return <GuidedLabActivity key={config.id} labId={config.id} title={config.title} subject={config.subject} objective={config.objective} academicLevel={config.academicLevel} content={config.learningContent} onComplete={onComplete} />;
  }
  return <LabLearningWorkspace key={config.id} labId={config.id} title={config.title} subject={config.subject} objective={config.objective} academicLevel={config.academicLevel} content={config.learningContent} onComplete={onComplete}>
    <SimulatedLabContainer config={config} onComplete={onComplete} />
  </LabLearningWorkspace>;
}

function SimulatedLabContainer({ config, onComplete }: UniversalLabContainerProps) {
  // Parâmetros ajustáveis
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    config.parameters.forEach(p => {
      initial[p.id] = p.defaultValue;
    });
    return initial;
  });

  const [isRunning, setIsRunning] = useState(true);
  const [telemetryHistory, setTelemetryHistory] = useState<Record<string, number>[]>([]);
  const [rawTelemetryArray, setRawTelemetryArray] = useState<number[]>([]);
  const [currentTelemetry, setCurrentTelemetry] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'simulacao' | 'teoria' | 'avaliacao' | 'laudo'>('simulacao');

  // Questionário diagnóstico e TRI
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredSubmitted, setAnsweredSubmitted] = useState(false);
  const [_score, setScore] = useState(0);
  const [triResult, setTriResult] = useState<TriProficiencyResult | null>(null);

  // Estados dos novos módulos estratégicos
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(true);
  const [isNoiseActive, setIsNoiseActive] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isSplitCompareOpen, setIsSplitCompareOpen] = useState(false);
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [isPythonOpen, setIsPythonOpen] = useState(false);
  const [isSocraticOpen, setIsSocraticOpen] = useState(false);
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<'md' | 'tex' | null>(null);
  const [lastA11yMessage, setLastA11yMessage] = useState<string>('');
  const [isControlsOpenOnMobile, setIsControlsOpenOnMobile] = useState<boolean>(true);

  // Canvas e Loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<Record<string, any>>(config.initialState || {});
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Atualizar parâmetro individual
  const handleParamChange = (id: string, value: number) => {
    setParams(prev => ({ ...prev, [id]: value }));
    const p = config.parameters.find(param => param.id === id);
    if (p) {
      setLastA11yMessage(`${p.label} ajustado para ${value} ${p.unit}`);
    }
  };

  const handleReset = () => {
    stateRef.current = config.initialState ? { ...config.initialState } : {};
    setTelemetryHistory([]);
    setRawTelemetryArray([]);
    setCurrentTelemetry({});
    const initial: Record<string, number> = {};
    config.parameters.forEach(p => {
      initial[p.id] = p.defaultValue;
    });
    setParams(initial);
    setLastA11yMessage('Todos os parâmetros foram restaurados para os valores padrão.');
  };

  // Captura snapshot da imagem do canvas para o caderno do aluno
  const handleCaptureSnapshot = (): string | null => {
    if (canvasRef.current) {
      try {
        return canvasRef.current.toDataURL('image/png');
      } catch (_e) {
        return null;
      }
    }
    return null;
  };

  // Loop de Animação e Física
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let historyCounter = 0;

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (isRunning) {
        // Se o ruído experimental Monte Carlo estiver ativo, aplica perturbação gaussiana leve
        const effectiveParams = { ...params };
        if (isNoiseActive) {
          Object.keys(effectiveParams).forEach(k => {
            const noise = (Math.random() - 0.5) * 0.03 * effectiveParams[k];
            effectiveParams[k] = Number((effectiveParams[k] + noise).toFixed(3));
          });
        }

        const result = config.physicsStep(effectiveParams, stateRef.current, dt);
        stateRef.current = result.nextState;
        setCurrentTelemetry(result.telemetry);

        const firstVal = Object.values(result.telemetry)[0] ?? 10;
        if (!isSoundMuted) {
          sonifier.updateContinuousPitch(firstVal, 0, 100);
        }

        historyCounter++;
        if (historyCounter % 6 === 0) {
          setTelemetryHistory(prev => {
            const next = [...prev, { time: Number((now / 1000).toFixed(2)), ...result.telemetry }];
            return next.slice(-100);
          });
          setRawTelemetryArray(prev => [...prev, firstVal].slice(-100));
        }
      } else {
        sonifier.stopContinuousPitch();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      config.renderCanvas(ctx, stateRef.current, params, canvas.width, canvas.height);

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      sonifier.stopContinuousPitch();
    };
  }, [config, isRunning, params, isNoiseActive, isSoundMuted]);

  // Exportar dados para CSV
  const handleExportCSV = () => {
    if (telemetryHistory.length === 0) {
      alert('Nenhum dado de telemetria coletado ainda. Execute a simulação para gerar pontos.');
      return;
    }

    const headers = Object.keys(telemetryHistory[0]).join(',');
    const rows = telemetryHistory.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${config.id}_telemetria_kortex.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submissão do Quiz Diagnóstico com cálculo TRI
  const handleSubmitEvaluation = () => {
    if (!config.questions || config.questions.length === 0) return;
    let correctCount = 0;
    const answersRecord: TriAnswerRecord[] = [];

    config.questions.forEach((q, idx) => {
      const selectedIdx = selectedAnswers[idx];
      const isCorrect = selectedIdx !== undefined && q.options[selectedIdx]?.correct;
      if (isCorrect) correctCount++;

      answersRecord.push({
        itemId: `${config.id}_q${idx + 1}`,
        correct: Boolean(isCorrect),
        itemParams: getCalibratedTriParametersForLab(config.id, config.academicLevel)
      });
    });

    const finalScore = Math.round((correctCount / config.questions.length) * 10);
    setScore(finalScore);
    setAnsweredSubmitted(true);

    // Avaliação Psicométrica TRI
    const tri = estimateStudentProficiency(answersRecord);
    setTriResult(tri);

    // Chime sonoro de sucesso
    sonifier.playSuccessChime();

    // Sincronização offline outbox
    offlineSyncService.enqueueSubmission({
      labId: config.id,
      studentId: 'estudante_ativo',
      timestamp: new Date().toISOString(),
      parameters: params,
      telemetry: currentTelemetry,
      diagnosticAnswer: {
        questionText: config.questions[0]?.question || '',
        selectedOption: config.questions[0]?.options[selectedAnswers[0] ?? 0]?.text || '',
        correct: correctCount === config.questions.length
      }
    });

    if (onComplete) {
      onComplete({ score: finalScore, telemetryRows: telemetryHistory.length });
    }
  };

  // Geração de Relatório de Bancada Formal
  const handlePrintReport = () => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    triggerPrintLabReport({
      labId: config.id,
      labTitle: config.title,
      academicLevel: config.academicLevel,
      subject: config.subject,
      studentName: 'Estudante Kortex',
      date: new Date().toLocaleDateString('pt-BR'),
      durationSeconds: duration,
      parametersUsed: params,
      parameterDefinitions: config.parameters.map(p => ({ id: p.id, label: p.label, unit: p.unit })),
      telemetrySnapshot: currentTelemetry,
      diagnosticQuestionText: config.questions?.[0]?.question,
      selectedAnswerText: config.questions?.[0]?.options[selectedAnswers[0] ?? 0]?.text,
      isCorrect: config.questions?.[0]?.options[selectedAnswers[0] ?? 0]?.correct,
      scorePct: triResult ? Math.round((triResult.scoreEnem / 1000) * 100) : 100
    });
  };

  const handleCopyMarkdownReport = () => {
    const md = generateLabReportMarkdown({
      labId: config.id,
      labTitle: config.title,
      academicLevel: config.academicLevel,
      subject: config.subject,
      studentName: 'Estudante Kortex',
      date: new Date().toLocaleDateString('pt-BR'),
      durationSeconds: Math.round((Date.now() - startTimeRef.current) / 1000),
      parametersUsed: params,
      parameterDefinitions: config.parameters.map(p => ({ id: p.id, label: p.label, unit: p.unit })),
      telemetrySnapshot: currentTelemetry
    });
    navigator.clipboard.writeText(md);
    setCopiedFormat('md');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleCopyLatexReport = () => {
    const tex = generateLabReportLatex({
      labId: config.id,
      labTitle: config.title,
      academicLevel: config.academicLevel,
      subject: config.subject,
      studentName: 'Estudante Kortex',
      date: new Date().toLocaleDateString('pt-BR'),
      durationSeconds: Math.round((Date.now() - startTimeRef.current) / 1000),
      parametersUsed: params,
      parameterDefinitions: config.parameters.map(p => ({ id: p.id, label: p.label, unit: p.unit })),
      telemetrySnapshot: currentTelemetry
    });
    navigator.clipboard.writeText(tex);
    setCopiedFormat('tex');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const socraticContext = config.socraticPromptContext 
    ? config.socraticPromptContext(params, stateRef.current)
    : `O estudante está no laboratório "${config.title}" com parâmetros: ${JSON.stringify(params)}. Telemetria atual: ${JSON.stringify(currentTelemetry)}.`;

  return (
    <div 
      className={`fade-in ${isHighContrast ? 'bg-black text-yellow-300' : ''}`} 
      style={{
        background: isHighContrast ? '#000' : 'var(--bg-card)',
        borderRadius: '16px',
        border: isHighContrast ? '2px solid #eab308' : '1px solid var(--border-color)',
        fontFamily: isDyslexicFont ? 'OpenDyslexic, Comic Sans MS, sans-serif' : 'inherit',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.25rem',
        position: 'relative'
      }}
    >
      {/* Barra Superior: Cabeçalho & Acessibilidade AAA */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(228, 104, 63, 0.12)',
              color: 'var(--color-primary, #E4683F)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {config.subject} · {learningLevelLabel(config.academicLevel)}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              ID: {config.id}
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            {config.title}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            {config.objective}
          </p>
        </div>

        {/* Barra de Ferramentas de Acessibilidade & Controles de Modo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <LabAccessibilityToolbar
            isHighContrast={isHighContrast}
            isDyslexicFont={isDyslexicFont}
            isSoundMuted={isSoundMuted}
            onToggleHighContrast={setIsHighContrast}
            onToggleDyslexicFont={setIsDyslexicFont}
            onToggleSound={() => {
              const next = !isSoundMuted;
              setIsSoundMuted(next);
              sonifier.setMuted(next);
            }}
            onKeyboardShortcut={(act) => {
              if (act === 'toggle_play') setIsRunning(!isRunning);
              else if (act === 'reset') handleReset();
              else if (act === 'open_notebook') setIsNotebookOpen(true);
              else if (act === 'open_compare') setIsSplitCompareOpen(true);
            }}
          />

          {/* Abas Superiores */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.3rem', borderRadius: '10px' }}>
            {(['simulacao', 'teoria', 'avaliacao', 'laudo'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === tab ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'simulacao' ? '⚗️ Simulação' : tab === 'teoria' ? '📖 Teoria' : tab === 'avaliacao' ? '📝 Avaliação TRI' : '📄 Laudo Técnico'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de Ações Rápidas do Laboratório */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.4)', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setIsNotebookOpen(true)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          title="Abrir Caderno de Laboratório Digital do Estudante"
        >
          <BookOpen style={{ width: '13px', height: '13px', color: '#E4683F' }} />
          <span>Caderno de Notas</span>
        </button>

        <button
          onClick={() => setIsSplitCompareOpen(true)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          title="Comparar dois cenários com parâmetros distintos"
        >
          <Columns2 style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
          <span>Comparar A/B</span>
        </button>

        <button
          onClick={() => setShowTimeTravel(!showTimeTravel)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem', background: showTimeTravel ? 'rgba(56, 189, 248, 0.15)' : 'transparent' }}
          title="Ativar linha do tempo de replay"
        >
          <History style={{ width: '13px', height: '13px', color: '#a855f7' }} />
          <span>Time-Travel Replay</span>
        </button>

        <button
          onClick={() => setIsPythonOpen(true)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          title="Abrir Terminal Python Científico com Pyodide"
        >
          <Terminal style={{ width: '13px', height: '13px', color: '#10b981' }} />
          <span>Terminal Python</span>
        </button>

        <button
          onClick={() => setIsSocraticOpen(true)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          title="Conversar com o Tutor Socrático por Chat e Voz"
        >
          <Bot style={{ width: '13px', height: '13px', color: '#f59e0b' }} />
          <span>Tutor IA por Voz</span>
        </button>

        <button
          onClick={() => setIsExamOpen(true)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          title="Modo Prova com Tela Cheia e Auditoria"
        >
          <ShieldAlert style={{ width: '13px', height: '13px', color: '#ef4444' }} />
          <span>Modo Exame Seguro</span>
        </button>

        <button
          onClick={() => setIs3DMode(!is3DMode)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem', background: is3DMode ? 'rgba(228, 104, 63, 0.15)' : 'transparent' }}
          title="Alternar entre visualização 2D e 3D Espacial"
        >
          <Box style={{ width: '13px', height: '13px', color: '#E4683F' }} />
          <span>{is3DMode ? 'Voltar para 2D' : 'Visão 3D WebGPU'}</span>
        </button>

        <button
          onClick={() => setIsNoiseActive(!isNoiseActive)}
          className="btn-outline"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem', background: isNoiseActive ? 'rgba(234, 179, 8, 0.15)' : 'transparent' }}
          title="Injetar ruído gaussiano Monte Carlo para simular instrumentos reais"
        >
          <span style={{ fontSize: '11px' }}>🎲</span>
          <span>{isNoiseActive ? 'Ruído Real Ativo' : 'Adicionar Ruído'}</span>
        </button>
      </div>

      {/* Barra de Replay Time-Travel se ativa */}
      {showTimeTravel && (
        <LabTimeTravelReplay
          history={rawTelemetryArray}
          currentTime={telemetryHistory.length * 0.05}
          onScrubToTime={(targetIdx) => {
            // Retrocede estado
            stateRef.current.val = rawTelemetryArray[targetIdx] ?? stateRef.current.val;
          }}
          isRunning={isRunning}
        />
      )}

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'simulacao' && (
        <div className="lab-workspace-grid">
          {/* Painel do Canvas e Controles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              background: '#0d131a',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '420px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {is3DMode ? (
                <div style={{ width: '100%', height: '100%', padding: '1rem' }}>
                  <Lab3DRenderer
                    telemetryVal={Object.values(currentTelemetry)[0] ?? 20}
                    width={680}
                    height={380}
                    label={`Modelo 3D Tridimensional: ${config.title}`}
                  />
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={420}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              )}

              {/* Botões Flutuantes de Ação no Canvas */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                display: 'flex',
                gap: '0.5rem',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.65rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  style={{
                    background: isRunning ? '#eab308' : '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {isRunning ? <Pause style={{ width: '14px', height: '14px' }} /> : <Play style={{ width: '14px', height: '14px' }} />}
                  {isRunning ? 'Pausar' : 'Iniciar'}
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RotateCcw style={{ width: '14px', height: '14px' }} />
                  Reiniciar
                </button>
              </div>

              {/* Badge de Telemetria Ativa no Topo */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '0.85rem',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                color: '#38bdf8'
              }}>
                {Object.entries(currentTelemetry).map(([key, val]) => (
                  <span key={key}>
                    {key}: <strong style={{ color: '#fff' }}>{typeof val === 'number' ? val.toFixed(2) : val}</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Ações Inferiores: Exportação de Dados */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Pontos de telemetria gravados: <strong>{telemetryHistory.length}</strong>
              </span>

              <button
                onClick={handleExportCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <Download style={{ width: '14px', height: '14px' }} />
                Exportar Dados (.CSV / Python)
              </button>
            </div>
          </div>

          {/* Anunciador A11y Live Region para Leitores de Tela */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0
            }}
          >
            {lastA11yMessage}
          </div>

          {/* Botão de Alternância em Telas Menores */}
          <div className="mobile-only" style={{ width: '100%' }}>
            <button
              onClick={() => setIsControlsOpenOnMobile(prev => !prev)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sliders style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
                Controles & Variáveis do Experimento ({config.parameters.length})
              </span>
              <span>{isControlsOpenOnMobile ? 'Recolher Painel ▲' : 'Expandir Painel ▼'}</span>
            </button>
          </div>

          {/* Painel Lateral: Parâmetros da Bancada */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            padding: '1.1rem',
            display: isControlsOpenOnMobile ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
              <Sliders style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Variáveis Experimentais
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {config.parameters.map(param => (
                <div key={param.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{param.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <input
                        type="number"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={params[param.id] ?? param.defaultValue}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            handleParamChange(param.id, Math.max(param.min, Math.min(param.max, val)));
                          }
                        }}
                        style={{
                          width: '62px',
                          padding: '0.15rem 0.35rem',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          color: 'var(--text-main)',
                          fontFamily: 'monospace',
                          fontSize: '0.78rem',
                          textAlign: 'right'
                        }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '22px' }}>
                        {param.unit}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={params[param.id] ?? param.defaultValue}
                    onChange={e => handleParamChange(param.id, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>{param.min} {param.unit}</span>
                    <span>{param.max} {param.unit}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  const defaults: Record<string, number> = {};
                  config.parameters.forEach(p => { defaults[p.id] = p.defaultValue; });
                  setParams(defaults);
                }}
                className="btn-outline"
                style={{
                  marginTop: '0.25rem',
                  padding: '0.45rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
                title="Redefinir todas as variáveis para a configuração inicial recomendada"
              >
                <RotateCcw style={{ width: '12px', height: '12px' }} />
                <span>Restaurar Valores Padrão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aba de Teoria e Fundamentação Científica */}
      {activeTab === 'teoria' && (
        <div style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          lineHeight: '1.6',
          color: 'var(--text-main)',
          fontSize: '0.92rem'
        }}>
          <h3 style={{ marginTop: 0, color: 'var(--color-primary)', fontSize: '1.2rem', fontWeight: 700 }}>
            Fundamentação Teórica & Equações Constitutivas
          </h3>
          <p style={{ whiteSpace: 'pre-line' }}>{config.theoreticalBackground}</p>
        </div>
      )}

      {/* Aba de Avaliação Diagnóstica com TRI */}
      {activeTab === 'avaliacao' && (
        <div style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                Avaliação Diagnóstica & Psicométrica (Padrão TRI ENEM/ENADE)
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Responda com base nas observações e medições da bancada virtual.
              </p>
            </div>
            {triResult && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {triResult.scoreEnem} pts
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }}>
                  Classificação: {triResult.classification}
                </span>
              </div>
            )}
          </div>

          {(config.questions || []).map((q, qIdx) => (
            <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {qIdx + 1}. {q.question}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  let optStyle: React.CSSProperties = {
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(228, 104, 63, 0.1)' : 'transparent',
                    cursor: answeredSubmitted ? 'default' : 'pointer',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-main)'
                  };

                  if (answeredSubmitted) {
                    if (opt.correct) {
                      optStyle.border = '1px solid #22c55e';
                      optStyle.background = 'rgba(34, 197, 94, 0.12)';
                    } else if (isSelected && !opt.correct) {
                      optStyle.border = '1px solid #ef4444';
                      optStyle.background = 'rgba(239, 68, 68, 0.12)';
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      style={optStyle}
                      onClick={() => !answeredSubmitted && setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={answeredSubmitted}
                      />
                      <span>{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              {answeredSubmitted && (
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  borderLeft: '3px solid var(--color-primary)'
                }}>
                  💡 <strong>Justificativa:</strong> {q.options[selectedAnswers[qIdx] ?? 0]?.explanation || 'Consulte a teoria.'}
                </div>
              )}
            </div>
          ))}

          {!answeredSubmitted ? (
            <button
              onClick={handleSubmitEvaluation}
              style={{
                alignSelf: 'flex-start',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Enviar Respostas e Calcular Proficiência TRI
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 style={{ width: '18px', height: '18px' }} />
              Avaliação concluída com sucesso! Sincronizado com a plataforma Kortex.
            </div>
          )}
        </div>
      )}

      {/* Aba de Laudo Técnico Formal */}
      {activeTab === 'laudo' && (
        <div style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                RELATÓRIO EXPERIMENTAL DE LABORATÓRIO (PADRÃO ABNT / IEEE)
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Plataforma Kortex · Ambiente Virtual de Aprendizagem Prática
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCopyMarkdownReport}
                className="btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Copiar relatório formatado em Markdown"
              >
                {copiedFormat === 'md' ? <Check style={{ width: '12px', height: '12px', color: '#22c55e' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                <span>{copiedFormat === 'md' ? 'Copiado!' : 'Copiar .md'}</span>
              </button>

              <button
                onClick={handleCopyLatexReport}
                className="btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Copiar código-fonte LaTeX do relatório"
              >
                {copiedFormat === 'tex' ? <Check style={{ width: '12px', height: '12px', color: '#22c55e' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                <span>{copiedFormat === 'tex' ? 'Copiado!' : 'LaTeX'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div><strong>Experimento:</strong> {config.title}</div>
            <div><strong>Área / Nível:</strong> {config.subject} ({learningLevelLabel(config.academicLevel)})</div>
            <div><strong>Status:</strong> {isRunning ? 'Em Andamento' : 'Concluído'}</div>
            <div><strong>Amostras de Telemetria:</strong> {telemetryHistory.length} pontos</div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>1. Parâmetros Utilizados na Bancada</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', textAlign: 'left' }}>
                  <th style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }}>Variável</th>
                  <th style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }}>Valor Configurado</th>
                  <th style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }}>Unidade</th>
                </tr>
              </thead>
              <tbody>
                {config.parameters.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }}>{p.label}</td>
                    <td style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }}>{params[p.id]}</td>
                    <td style={{ padding: '0.4rem', border: '1px solid var(--border-color)' }}>{p.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handlePrintReport}
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginTop: '0.5rem'
            }}
          >
            <FileText style={{ width: '15px', height: '15px' }} />
            Imprimir / Salvar Laudo em PDF
          </button>
        </div>
      )}

      {/* Modais das 20 Novas Ferramentas Estratégicas */}
      <LabNotebookDrawer
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        labId={config.id}
        labTitle={config.title}
        onCaptureCanvasSnapshot={handleCaptureSnapshot}
      />

      <LabSplitScreenComparator
        isOpen={isSplitCompareOpen}
        onClose={() => setIsSplitCompareOpen(false)}
        parameters={config.parameters}
        primaryParams={params}
        onApplyScenarioB={(bParams) => setParams(bParams)}
      />

      <LabPythonRunnerModal
        isOpen={isPythonOpen}
        onClose={() => setIsPythonOpen(false)}
        labTitle={config.title}
        telemetry={currentTelemetry}
        history={rawTelemetryArray}
      />

      <LabSocraticTutorModal
        isOpen={isSocraticOpen}
        onClose={() => setIsSocraticOpen(false)}
        labTitle={config.title}
        topic={config.topic}
        parameters={params}
        telemetry={currentTelemetry}
      />

      <SecureExamModal
        isOpen={isExamOpen}
        onClose={() => setIsExamOpen(false)}
        labTitle={config.title}
        durationMinutes={20}
        onFinishExam={(incidents) => {
          alert(`Avaliação finalizada com sucesso! Registro de auditoria: ${incidents} ocorrência(s).`);
          handleSubmitEvaluation();
        }}
      />

      {/* Widget do Tutor Socrático Integrado */}
      <SocraticTutorWidget
        customContext={socraticContext}
        studentName="Estudante"
        currentModule={config.subject}
      />
    </div>
  );
}
