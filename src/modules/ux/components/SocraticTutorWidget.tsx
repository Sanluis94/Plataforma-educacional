import { useState } from 'react';
import {
  HelpCircle, Sparkles, CheckCircle2, ChevronRight,
  RotateCcw, Award, BookOpen, Lightbulb, Compass, Send
} from 'lucide-react';
import { callGeminiWithKey } from '../../core/services/geminiService';

interface SocraticTutorWidgetProps {
  labTitle?: string;
  subject?: string;
  customContext?: string;
  studentName?: string;
  currentModule?: string;
  onRewardXP?: (xp: number) => void;
}

interface SocraticStep {
  philosopher: 'Aristóteles' | 'Sócrates' | 'Paulo Freire';
  badgeColor: string;
  badgeBg: string;
  icon: typeof Compass;
  phaseTitle: string;
  guidingQuestion: string;
  hint: string;
}

const DEFAULT_QUESTIONS: Record<string, SocraticStep[]> = {
  default: [
    {
      philosopher: 'Aristóteles',
      badgeColor: '#293E24',
      badgeBg: 'rgba(41,62,36,0.1)',
      icon: Compass,
      phaseTitle: 'Fase 1: Observação empírica e sensorial',
      guidingQuestion: 'Antes de calcular fórmulas: o que você percebe acontecendo com os objetos na tela quando altera os controles?',
      hint: 'Concentre-se nos sentidos e no comportamento visual do sistema (velocidade, trajetória, intensidade).'
    },
    {
      philosopher: 'Sócrates',
      badgeColor: '#B8441F',
      badgeBg: 'rgba(228,104,63,0.12)',
      icon: Lightbulb,
      phaseTitle: 'Fase 2: Maiêutica — Causa e efeito',
      guidingQuestion: 'Se você dobrar uma das variáveis principais, o resultado também dobra ou algo inesperado acontece? Por que você acha que isso ocorre?',
      hint: 'Busque a contradição. O que governa essa transformação? Há alguma força invisível ou resistência atuando?'
    },
    {
      philosopher: 'Paulo Freire',
      badgeColor: '#172314',
      badgeBg: 'rgba(41,62,36,0.12)',
      icon: BookOpen,
      phaseTitle: 'Fase 3: Problematização no mundo real',
      guidingQuestion: 'Onde você observa esse mesmo fenômeno agindo no seu cotidiano, no transporte, na sua casa ou na tecnologia da sociedade?',
      hint: 'O conhecimento só liberta quando conectado com a realidade prática e transformadora da vida humana.'
    }
  ]
};

export function SocraticTutorWidget({ labTitle = 'Simulação Interativa', subject = 'Ciências da Natureza', onRewardXP }: SocraticTutorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [studentHypothesis, setStudentHypothesis] = useState('');
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loadingAiFeedback, setLoadingAiFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const steps = DEFAULT_QUESTIONS.default;
  const currentStep = steps[currentStepIndex];

  const handleNextStep = async () => {
    if (!studentHypothesis.trim()) return;

    const newAnswers = [...answers];
    newAnswers[currentStepIndex] = studentHypothesis.trim();
    setAnswers(newAnswers);

    // If Gemini key is available, get a quick encouraging reflection
    const apiKey = localStorage.getItem('gemini_api_key');
    if (apiKey) {
      try {
        setLoadingAiFeedback(true);
        const prompt = `Você é um tutor socrático e freiriano mediando um estudante no laboratório virtual "${labTitle}" (${subject}).
O estudante respondeu à seguinte pergunta da etapa ${currentStep.philosopher} ("${currentStep.guidingQuestion}"):
Resposta do aluno: "${studentHypothesis}"

Dê um feedback curto de 2 a 3 frases parabenizando a observação do estudante e lançando um questionamento socrático instigante para aprofundar o raciocínio sem dar a resposta pronta.`;
        const res = await callGeminiWithKey(apiKey, prompt);
        setAiFeedback(res);
      } catch {
        // Fallback silently if offline
      } finally {
        setLoadingAiFeedback(false);
      }
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setStudentHypothesis(answers[currentStepIndex + 1] || '');
    } else {
      setIsCompleted(true);
      if (onRewardXP) {
        onRewardXP(50);
      }
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setAnswers(['', '', '']);
    setStudentHypothesis('');
    setIsCompleted(false);
    setAiFeedback(null);
  };

  return (
    <div style={{ position: 'relative', marginTop: '1rem' }}>
      {/* Trigger Bar / Card */}
      {!isOpen ? (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            background: 'transparent',
            border: '1px solid var(--border-color, #E2D7C3)',
            borderRadius: 'var(--radius-lg, 14px)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          className="glass-card"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '10px',
                background: 'rgba(228, 104, 63, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-accessible, #B8441F)',
              }}
            >
              <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
                Tutor Socrático e Freiriano
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Construa sua própria descoberta através de observação ativa e questionamento reflexivo.
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
              background: 'rgba(228, 104, 63, 0.1)',
              border: '1px solid rgba(184, 68, 31, 0.25)',
              color: 'var(--color-primary-accessible, #B8441F)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Iniciar investigação <ChevronRight style={{ width: '0.9rem', height: '0.9rem' }} />
          </div>
        </div>
      ) : (
        /* Active Dialogue Card */
        <div
          className="fade-in card"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: currentStep.badgeBg,
                  color: currentStep.badgeColor,
                  border: `1px solid ${currentStep.badgeColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles style={{ width: '0.8rem', height: '0.8rem' }} />
                Método: {currentStep.philosopher}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Passo {currentStepIndex + 1} de {steps.length}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleRestart}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title="Reiniciar questionamento"
              >
                <RotateCcw style={{ width: '0.8rem', height: '0.8rem' }} />
                Reiniciar
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.25rem',
                }}
                title="Recolher tutor"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {steps.map((step, idx) => (
              <div
                key={step.phaseTitle}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '2px',
                  background:
                    idx < currentStepIndex || isCompleted
                      ? 'var(--color-verde-700)'
                      : idx === currentStepIndex
                      ? 'var(--color-primary)'
                      : 'rgba(41, 62, 36, 0.12)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Body Content */}
          {!isCompleted ? (
            <div>
              <div style={{ marginBottom: '0.75rem' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                  {currentStep.phaseTitle}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
                  {currentStep.guidingQuestion}
                </p>
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(41, 62, 36, 0.04)',
                  border: '1px dashed var(--border-color)',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <HelpCircle style={{ width: '1rem', height: '1rem', color: currentStep.badgeColor, flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Pistas do professor:</strong> {currentStep.hint}
                </span>
              </div>

              {/* Student Hypothesis Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Sua hipótese / o que você descobriu:
                </label>
                <textarea
                  rows={3}
                  value={studentHypothesis}
                  onChange={(e) => setStudentHypothesis(e.target.value)}
                  placeholder="Escreva com suas próprias palavras o que observou ou concluiu..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* AI Feedback if generated */}
              {loadingAiFeedback && (
                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-accessible, #B8441F)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles style={{ width: '0.9rem', height: '0.9rem', animation: 'spin 1.5s linear infinite' }} />
                  O tutor socrático está analisando seu raciocínio...
                </div>
              )}

              {aiFeedback && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(228, 104, 63, 0.08)',
                    border: '1px solid rgba(184, 68, 31, 0.25)',
                    marginBottom: '1rem',
                    fontSize: '0.84rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles style={{ width: '1.1rem', height: '1.1rem', color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--color-primary-accessible, #B8441F)' }}>Reflexão do tutor IA:</strong>
                    {aiFeedback}
                  </div>
                </div>
              )}

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  onClick={handleNextStep}
                  disabled={!studentHypothesis.trim() || loadingAiFeedback}
                  className="btn-primary"
                  style={{
                    padding: '0.6rem 1.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: !studentHypothesis.trim() ? 0.6 : 1,
                  }}
                >
                  {currentStepIndex < steps.length - 1 ? (
                    <>
                      Confirmar hipótese <Send style={{ width: '0.85rem', height: '0.85rem' }} />
                    </>
                  ) : (
                    <>
                      Concluir investigação <CheckCircle2 style={{ width: '0.9rem', height: '0.9rem' }} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Conclusion & Synthesis */
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'rgba(41, 62, 36, 0.1)',
                  border: '2px solid var(--color-verde-700)',
                  color: 'var(--color-verde-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Award style={{ width: '2rem', height: '2rem' }} />
              </div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Investigação ativa concluída!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
                Você vivenciou o ciclo empírico de Aristóteles, o questionamento socrático e a problematização de Paulo Freire. O conhecimento que você construiu agora é verdadeiramente seu.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(41, 62, 36, 0.1)',
                  border: '1px solid rgba(41, 62, 36, 0.25)',
                  color: 'var(--color-verde-700)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles style={{ width: '1rem', height: '1rem' }} /> +50 XP de investigação científica
              </div>

              <div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-outline"
                  style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                >
                  Continuar explorando o laboratório
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
