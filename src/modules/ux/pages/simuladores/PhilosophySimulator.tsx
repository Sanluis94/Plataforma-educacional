import { useState } from 'react';

interface PhilosophySimulatorProps {
  onComplete?: (score: number) => void;
}

interface Dilemma {
  id: number;
  title: string;
  scenario: string;
  options: {
    text: string;
    philosophy: 'utilitarian' | 'deontology' | 'virtue';
    philosopher: string;
    explanation: string;
    result: string;
  }[];
}

const DILEMMAS: Dilemma[] = [
  {
    id: 1,
    title: 'O Dilema do Bonde (Trolley Problem)',
    scenario: 'Um bonde descontrolado caminha em direção a 5 pessoas presas nos trilhos. Você está ao lado de uma alavanca que pode desviar o bonde para uma rota alternativa, onde há apenas 1 pessoa presa. O que você faz?',
    options: [
      {
        text: 'Puxar a alavanca para salvar 5 vidas sacrificando 1.',
        philosophy: 'utilitarian',
        philosopher: 'Jeremy Bentham & John Stuart Mill',
        explanation: 'Foco nas consequências. O bem maior para o maior número de pessoas justifica desviar o rumo da ação.',
        result: 'Ação Utilitarista: 5 pessoas sobrevivem, 1 falece. Você agiu para maximizar o bem líquido geral.'
      },
      {
        text: 'Não puxar a alavanca, pois matar ativamente é um erro moral absoluto.',
        philosophy: 'deontology',
        philosopher: 'Immanuel Kant',
        explanation: 'Foco no dever moral e regras intrínsecas. O imperativo categórico dita que você nunca deve ativamente matar uma pessoa como meio para um fim.',
        result: 'Ação Deontológica: O curso natural é mantido. 5 pessoas falecem, mas você não violou o dever moral de não assassinar.'
      },
      {
        text: 'Agir com base na virtude da compaixão, hesitando e tentando intervir de forma justa.',
        philosophy: 'virtue',
        philosopher: 'Aristóteles',
        explanation: 'Foco no caráter do agente moral. O caminho correto é buscar a eudaimonia e cultivar virtudes como prudência (phronesis) e justiça situacional.',
        result: 'Ação baseada na Ética das Virtudes: Foco nas suas intenções virtuosas e no caráter equilibrado perante a tragédia inevitável.'
      }
    ]
  },
  {
    id: 2,
    title: 'A Máquina de Experiência',
    scenario: 'Cientistas criaram uma máquina de simulação cerebral perfeita que lhe dará qualquer experiência prazerosa que você desejar (escrever um livro clássico, amar, etc) para sempre. O único detalhe é que você deve permanecer flutuando em um tanque com eletrodos pelo resto da vida. Você aceitaria?',
    options: [
      {
        text: 'Sim, pois o prazer e a felicidade são os únicos valores intrínsecos reais.',
        philosophy: 'utilitarian',
        philosopher: 'Epicuro & Hedonismo Clássico',
        explanation: 'Hedonismo quantitativo. A ausência de dor física e o prazer constante são os estados ideais de bem-estar.',
        result: 'Ação Hedonista/Utilitarista: Você priorizou o acúmulo de felicidade subjetiva em detrimento de verdades concretas.'
      },
      {
        text: 'Não, pois viver com integridade na realidade é um dever consigo mesmo.',
        philosophy: 'deontology',
        philosopher: 'Immanuel Kant',
        explanation: 'Respeito pela dignidade humana racional. Reduzir-se a uma máquina passiva de sensações destrói a autonomia racional da pessoa.',
        result: 'Ação Deontológica: Você escolheu a verdade e a autonomia moral em vez de uma ilusão confortável e programada.'
      },
      {
        text: 'Não, pois o bem da vida humana exige a conquista de virtudes reais no mundo real.',
        philosophy: 'virtue',
        philosopher: 'Aristóteles',
        explanation: 'A eudaimonia exige atividade racional e a prática virtuosa no mundo físico e social, e não apenas sensações mentais simuladas.',
        result: 'Ação de Virtude: Você escolheu o florescimento humano real e o caráter moldado pela superação de desafios reais.'
      }
    ]
  }
];

export function PhilosophySimulator({ onComplete }: PhilosophySimulatorProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [profile, setProfile] = useState<Record<string, number>>({
    utilitarian: 0,
    deontology: 0,
    virtue: 0
  });
  const [completed, setCompleted] = useState(false);

  const dilemma = DILEMMAS[currentIdx];

  const handleSelectOption = (idx: number) => {
    setSelectedOptionIdx(idx);
  };

  const handleNext = () => {
    if (selectedOptionIdx === null) return;
    
    const choice = dilemma.options[selectedOptionIdx];
    setProfile(prev => ({
      ...prev,
      [choice.philosophy]: prev[choice.philosophy] + 1
    }));

    if (currentIdx < DILEMMAS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
    } else {
      setCompleted(true);
    }
  };

  const handleFinish = () => {
    if (onComplete) onComplete(100);
  };

  const dominantPhilosophy = Object.keys(profile).reduce((a, b) => profile[a] > profile[b] ? a : b);

  return (
    <div className="philosophy-simulator p-4 premium-glass-card" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)' }}>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '1.25rem' }}>
        Laboratório de Ética: Dilemas Filosóficos
      </h3>

      {!completed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Cabeçalho do Dilema */}
          <div className="premium-glass-panel p-4" style={{ borderRadius: '8px', borderLeft: '4px solid var(--color-primary)', background: 'rgba(255,255,255,0.01)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Dilema {dilemma.id} de {DILEMMAS.length}
            </span>
            <h4 style={{ color: 'var(--text-main)', margin: '0.4rem 0 0.8rem 0', fontSize: '1.2rem' }}>{dilemma.title}</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{dilemma.scenario}</p>
          </div>

          {/* Opções */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dilemma.options.map((opt, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelectOption(idx)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: selectedOptionIdx === idx ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                  background: selectedOptionIdx === idx ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: '2px solid',
                    borderColor: selectedOptionIdx === idx ? '#06b6d4' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {selectedOptionIdx === idx && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06b6d4' }} />}
                  </div>
                  <span style={{ color: selectedOptionIdx === idx ? 'var(--text-main)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {opt.text}
                  </span>
                </div>

                {selectedOptionIdx === idx && (
                  <div style={{ marginTop: '0.8rem', paddingLeft: '1.75rem', fontSize: '0.8rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.6rem' }}>
                    <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Escola: {opt.philosopher}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>{opt.explanation}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button 
            disabled={selectedOptionIdx === null}
            onClick={handleNext}
            className="premium-btn btn-primary"
            style={{ width: 'fit-content', alignSelf: 'flex-end', padding: '0.6rem 2rem' }}
          >
            {currentIdx < DILEMMAS.length - 1 ? 'Próximo Dilema' : 'Ver Meu Perfil Ético'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '3rem' }}>⚖️</div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1.3rem' }}>Análise Filosófica de Caráter</h4>
          
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Suas escolhas apontam que seu perfil ético dominante é o de **
            {dominantPhilosophy === 'utilitarian' && 'Utilitarismo'}
            {dominantPhilosophy === 'deontology' && 'Deontologia'}
            {dominantPhilosophy === 'virtue' && 'Ética das Virtudes'}
            **.
          </p>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', width: '100%', maxWidth: '400px', margin: '1rem 0' }}>
            <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UTILITARISMO</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#06b6d4' }}>{profile.utilitarian} pts</div>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DEONTOLOGIA</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6' }}>{profile.deontology} pts</div>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VIRTUDE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffb300' }}>{profile.virtue} pts</div>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '500px', lineHeight: 1.5 }}>
            {dominantPhilosophy === 'utilitarian' && 'Você toma decisões baseando-se no cálculo do impacto final. Acredita que as consequências de uma ação determinam se ela é correta, focando na maximização do bem-estar geral.'}
            {dominantPhilosophy === 'deontology' && 'Você acredita na existência de imperativos morais absolutos e inquebráveis. A retidão de uma escolha está na própria ação e na obediência ao dever de respeitar os outros.'}
            {dominantPhilosophy === 'virtue' && 'Para você, a moralidade não é um conjunto de regras ou cálculos matemáticos de prazer, mas sim a expressão de um caráter virtuoso e equilibrado focado no bem comum.'}
          </p>

          <button 
            className="premium-btn btn-primary mt-4" 
            style={{ width: '200px' }}
            onClick={handleFinish}
          >
            Concluir Laboratório
          </button>
        </div>
      )}
    </div>
  );
}
