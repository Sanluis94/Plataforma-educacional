import { useState } from 'react';
import {
  HelpCircle, Sparkles, CheckCircle2, ChevronRight,
  RotateCcw, Award, BookOpen, Lightbulb, Compass, Send
} from 'lucide-react';
import { callGeminiWithKey } from '../../core/services/geminiService';

interface SocraticTutorWidgetProps {
  labTitle?: string;
  subject?: string;
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
      badgeColor: '#06b6d4',
      badgeBg: 'rgba(6,182,212,0.15)',
      icon: Compass,
      phaseTitle: 'Fase 1: Observação Empírica & Sensorial',
      guidingQuestion: 'Antes de calcular fórmulas: o que você percebe acontecendo com os objetos na tela quando altera os controles?',
      hint: 'Concentre-se nos sentidos e no comportamento visual do sistema (velocidade, trajetória, intensidade).'
    },
    {
      philosopher: 'Sócrates',
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139,92,246,0.15)',
      icon: Lightbulb,
      phaseTitle: 'Fase 2: Maiêutica — Causa e Efeito',
      guidingQuestion: 'Se você dobrar uma das variáveis principais, o resultado também dobra ou algo inesperado acontece? Por que você acha que isso ocorre?',
      hint: 'Busque a contradição. O que governa essa transformação? Há alguma força invisível ou resistência atuando?'
    },
    {
      philosopher: 'Paulo Freire',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16,185,129,0.15)',
      icon: BookOpen,
      phaseTitle: 'Fase 3: Problematização no Mundo Real',
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
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          className="hover:border-cyan-400"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.5rem',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a78bfa',
              }}
            >
              <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Tutor Socrático & Freiriano
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
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06b6d4',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Iniciar Investigação <ChevronRight style={{ width: '0.9rem', height: '0.9rem' }} />
          </div>
        </div>
      ) : (
        /* Active Dialogue Card */
        <div
          className="fade-in glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '0.85rem',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            background: 'var(--bg-card, #111827)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
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
                      ? '#10b981'
                      : idx === currentStepIndex
                      ? step.badgeColor
                      : 'rgba(255,255,255,0.1)',
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
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <HelpCircle style={{ width: '1rem', height: '1rem', color: currentStep.badgeColor, flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Pistas do Professor:</strong> {currentStep.hint}
                </span>
              </div>

              {/* Student Hypothesis Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Sua Hipótese / O que você descobriu:
                </label>
                <textarea
                  rows={3}
                  value={studentHypothesis}
                  onChange={(e) => setStudentHypothesis(e.target.value)}
                  placeholder="Escreva com suas próprias palavras o que observou ou concluiu..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* AI Feedback if generated */}
              {loadingAiFeedback && (
                <div style={{ fontSize: '0.8rem', color: '#06b6d4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Sparkles style={{ width: '0.9rem', height: '0.9rem', animation: 'spin 1.5s linear infinite' }} />
                  O Tutor Socrático está analisando seu raciocínio...
                </div>
              )}

              {aiFeedback && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    marginBottom: '1rem',
                    fontSize: '0.84rem',
                    color: '#c4b5fd',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <Sparkles style={{ width: '1.1rem', height: '1.1rem', color: '#a78bfa', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#fff' }}>Reflexão do Tutor IA:</strong>
                    {aiFeedback}
                  </div>
                </div>
              )}

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  onClick={handleNextStep}
                  disabled={!studentHypothesis.trim() || loadingAiFeedback}
                  className="btn-gradient"
                  style={{
                    padding: '0.6rem 1.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: !studentHypothesis.trim() ? 0.6 : 1,
                  }}
                >
                  {currentStepIndex < steps.length - 1 ? (
                    <>
                      Confirmar Hipótese <Send style={{ width: '0.85rem', height: '0.85rem' }} />
                    </>
                  ) : (
                    <>
                      Concluir Investigação <CheckCircle2 style={{ width: '0.9rem', height: '0.9rem' }} />
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
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid #10b981',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Award style={{ width: '2rem', height: '2rem' }} />
              </div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Investigação Ativa Concluída!
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
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                }}
              >
                <Sparkles style={{ width: '1rem', height: '1rem' }} /> +50 XP de Investigação Científica
              </div>

              <div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-outline-cyan"
                  style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                >
                  Continuar Explorando o Laboratório
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
