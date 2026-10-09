import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Download, 
  FileText, CheckCircle2, Sliders 
} from 'lucide-react';
import { SocraticTutorWidget } from '../components/SocraticTutorWidget';

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
  academicLevel: 'fundamental_1' | 'fundamental_2' | 'medio' | 'graduacao' | 'pos_graduacao';
  subject: string;
  topic: string;
  objective: string;
  theoreticalBackground: string;
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
  const [currentTelemetry, setCurrentTelemetry] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'simulacao' | 'teoria' | 'avaliacao' | 'laudo'>('simulacao');

  // Questionário diagnóstico
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredSubmitted, setAnsweredSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Canvas e Loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<Record<string, any>>(config.initialState || {});
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameId = useRef<number | null>(null);

  // Atualizar parâmetro individual
  const handleParamChange = (id: string, value: number) => {
    setParams(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    stateRef.current = config.initialState ? { ...config.initialState } : {};
    setTelemetryHistory([]);
    setCurrentTelemetry({});
    const initial: Record<string, number> = {};
    config.parameters.forEach(p => {
      initial[p.id] = p.defaultValue;
    });
    setParams(initial);
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
        const result = config.physicsStep(params, stateRef.current, dt);
        stateRef.current = result.nextState;
        setCurrentTelemetry(result.telemetry);

        historyCounter++;
        if (historyCounter % 6 === 0) {
          setTelemetryHistory(prev => {
            const next = [...prev, { time: Number((now / 1000).toFixed(2)), ...result.telemetry }];
            return next.slice(-100);
          });
        }
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
    };
  }, [config, isRunning, params]);

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

  // Submissão do Quiz Diagnóstico
  const handleSubmitEvaluation = () => {
    if (!config.questions || config.questions.length === 0) return;
    let correctCount = 0;
    config.questions.forEach((q, idx) => {
      const selectedIdx = selectedAnswers[idx];
      if (selectedIdx !== undefined && q.options[selectedIdx]?.correct) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / config.questions.length) * 10);
    setScore(finalScore);
    setAnsweredSubmitted(true);
    if (onComplete) {
      onComplete({ score: finalScore, telemetryRows: telemetryHistory.length });
    }
  };

  const socraticContext = config.socraticPromptContext 
    ? config.socraticPromptContext(params, stateRef.current)
    : `O estudante está no laboratório "${config.title}" com parâmetros: ${JSON.stringify(params)}. Telemetria atual: ${JSON.stringify(currentTelemetry)}.`;

  return (
    <div className="fade-in" style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1.25rem',
      position: 'relative'
    }}>
      {/* Cabeçalho do Laboratório */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
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
              {config.subject} · {config.academicLevel.replace('_', ' ')}
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
              {tab === 'simulacao' ? '⚗️ Simulação' : tab === 'teoria' ? '📖 Teoria' : tab === 'avaliacao' ? '📝 Avaliação' : '📄 Laudo Técnico'}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === 'simulacao' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 340px', gap: '1.25rem' }}>
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
              <canvas
                ref={canvasRef}
                width={700}
                height={420}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />

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

          {/* Painel Lateral: Parâmetros da Bancada */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
              <Sliders style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                Parâmetros Físicos
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '420px', paddingRight: '0.25rem' }}>
              {config.parameters.map(param => (
                <div key={param.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {param.label}
                    </span>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                      {params[param.id]} {param.unit}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={params[param.id]}
                    onChange={e => handleParamChange(param.id, parseFloat(e.target.value))}
                    style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />

                  {param.description && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {param.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Aba de Teoria e Fundamentos */}
      {activeTab === 'teoria' && (
        <div style={{
          background: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          lineHeight: '1.7',
          color: 'var(--text-main)'
        }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Fundamentação Teórica & Metodologia
          </h3>
          <div style={{ fontSize: '0.92rem', whiteSpace: 'pre-line' }}>
            {config.theoreticalBackground}
          </div>
        </div>
      )}

      {/* Aba de Avaliação e Desafios Diagnósticos */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>
              Questões Diagnósticas & Investigação Científica
            </h3>
            {answeredSubmitted && (
              <span style={{
                background: score >= 7 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: score >= 7 ? '#22c55e' : '#ef4444',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                Nota Obtida: {score} / 10
              </span>
            )}
          </div>

          {config.questions?.map((q, qIdx) => (
            <div key={qIdx} style={{
              background: 'var(--bg-card)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
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
              Enviar Respostas e Salvar Nota
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 style={{ width: '18px', height: '18px' }} />
              Avaliação concluída com sucesso!
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
          <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
              RELATÓRIO EXPERIMENTAL DE LABORATÓRIO (PADRÃO ABNT / IEEE)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Plataforma Kortex · Ambiente Virtual de Aprendizagem Prática
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div><strong>Experimento:</strong> {config.title}</div>
            <div><strong>Área / Nível:</strong> {config.subject} ({config.academicLevel})</div>
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
            onClick={() => window.print()}
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

      {/* Widget do Tutor Socrático Integrado */}
      <SocraticTutorWidget
        customContext={socraticContext}
        studentName="Estudante"
        currentModule={config.subject}
      />
    </div>
  );
}
