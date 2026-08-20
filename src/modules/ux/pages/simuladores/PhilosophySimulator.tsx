import { useState } from 'react';

interface PhilosophySimulatorProps {
  mode?: string;
  labTitle?: string;
  labId?: string;
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

const MODE_DILEMMAS: Record<string, Dilemma[]> = {
  ethics: [
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
      scenario: 'Cientistas criaram uma máquina de simulação cerebral perfeita que lhe dará qualquer experiência prazerosa que você desejar para sempre. O único detalhe é que você deve permanecer flutuando em um tanque com eletrodos pelo resto da vida. Você aceitaria?',
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
  ],
  cave_myth: [
    {
      id: 1,
      title: 'A Ilusão das Sombras',
      scenario: 'Você está acorrentado desde a infância olhando para a parede do fundo de uma caverna escura, onde sombras de marionetes são projetadas por uma fogueira. Um dia, suas correntes se rompem. O que você decide fazer?',
      options: [
        {
          text: 'Permanecer sentado, pois as sombras são confortáveis e previsíveis.',
          philosophy: 'utilitarian',
          philosopher: 'Mundo Sensível (Doxa)',
          explanation: 'Ficar na ignorância confortável é a escolha dos prisioneiros acostumados com a opinião comum (doxa).',
          result: 'Você permaneceu no mundo sensível das aparências ilusórias.'
        },
        {
          text: 'Levantar-se e caminhar em direção à luz exterior, enfrentando a dor nos olhos.',
          philosophy: 'virtue',
          philosopher: 'Platão (Mundo Inteligível / Episteme)',
          explanation: 'O filósofo busca a verdade essencial (ideias perfeitas), mesmo com a dor e o ofuscamento inicial do Sol (Aletheia).',
          result: 'Você iniciou a ascensão dialética rumo ao Mundo das Ideias e à Verdade.'
        },
        {
          text: 'Voltar à caverna imediatamente após ver o sol para libertar os outros prisioneiros.',
          philosophy: 'deontology',
          philosopher: 'Dever Filosófico e Político',
          explanation: 'O imperativo moral e político do filósofo-rei: não guardar a verdade para si, mas educar a pólis.',
          result: 'Você assumiu o compromisso ético de libertar seus semelhantes da ignorância.'
        }
      ]
    },
    {
      id: 2,
      title: 'O Retorno à Caverna',
      scenario: 'Ao retornar para a caverna para contar aos outros que as sombras não são a realidade, eles zombam de você e ameaçam agredi-lo por perturbar sua paz. Qual sua postura?',
      options: [
        {
          text: 'Persistir pacientemente no diálogo socrático e na maiêutica para despertar a razão neles.',
          philosophy: 'virtue',
          philosopher: 'Sócrates (Maiêutica)',
          explanation: 'Fazer perguntas que façam os prisioneiros perceberem suas próprias contradições internas.',
          result: 'Você aplicou o método dialético para cultivar o despertar filosófico.'
        },
        {
          text: 'Impor a verdade pela força institucional para o bem deles.',
          philosophy: 'utilitarian',
          philosopher: 'Paternalismo Filosófico',
          explanation: 'Priorizar o resultado final (esclarecimento) acima da autonomia individual dos prisioneiros.',
          result: 'Você priorizou a saída da ignorância a qualquer custo.'
        },
        {
          text: 'Respeitar a liberdade de crença deles, mas manter seu testemunho da verdade intacto.',
          philosophy: 'deontology',
          philosopher: 'Liberdade de Consciência',
          explanation: 'O dever moral de não violentar a consciência alheia, servindo de exemplo vivo.',
          result: 'Você honrou o princípio deontológico da autonomia individual.'
        }
      ]
    }
  ],
  contractualism: [
    {
      id: 1,
      title: 'O Estado de Natureza',
      scenario: 'Imagine uma sociedade sem leis, governo, polícia ou constituição. Como você acredita que os seres humanos agiriam nesse estado primitivo primordial?',
      options: [
        {
          text: '"O homem é o lobo do homem" (Homo homini lupus): haveria guerra de todos contra todos por medo e ganância.',
          philosophy: 'utilitarian',
          philosopher: 'Thomas Hobbes (Leviatã)',
          explanation: 'Para Hobbes, sem um Estado forte e soberano para impor a ordem pelo medo, a vida é solitária, pobre, sórdida e curta.',
          result: 'Visão Hobbesiana: Você defende a necessidade de um poder central forte para garantir a autopreservação.'
        },
        {
          text: 'Os indivíduos viveriam em paz relativa, desfrutando de direitos naturais à vida, liberdade e propriedade.',
          philosophy: 'deontology',
          philosopher: 'John Locke (Segundo Tratado sobre o Governo Civil)',
          explanation: 'Para Locke, os seres humanos possuem direitos naturais inalienáveis pré-sociais que o Estado existe apenas para proteger.',
          result: 'Visão Lockeana: Você defende o liberalismo clássico e os direitos individuais invioláveis.'
        },
        {
          text: '"O homem nasce bom, mas a sociedade o corrompe": a criação da propriedade privada gerou a desigualdade.',
          philosophy: 'virtue',
          philosopher: 'Jean-Jacques Rousseau (Do Contrato Social)',
          explanation: 'Para Rousseau, o homem no estado de natureza é o "bom selvagem", vivendo em harmonia e compaixão natural.',
          result: 'Visão Rousseauísta: Você busca uma democracia participativa fundada na vontade geral.'
        }
      ]
    }
  ],
  logic: [
    {
      id: 1,
      title: 'Validade de Argumentos e Falácias',
      scenario: 'Considere o argumento: "Todos os humanos são mortais. Sócrates é humano. Logo, Sócrates é mortal." Como você classifica este raciocínio?',
      options: [
        {
          text: 'Um silogismo categórico dedutivo válido com premissas verdadeiras (argumento sólido).',
          philosophy: 'deontology',
          philosopher: 'Aristóteles (Órganon)',
          explanation: 'Se as premissas são verdadeiras e a estrutura lógica é perfeita, a conclusão decorre necessariamente.',
          result: 'Correto! Você identificou a estrutura clássica da dedução lógica formal aristotélica.'
        },
        {
          text: 'Um argumento indutivo probabilístico baseado em observações empíricas.',
          philosophy: 'utilitarian',
          philosopher: 'Francis Bacon & Empirismo',
          explanation: 'A indução parte do particular para o geral; o exemplo socrático é uma dedução estrita.',
          result: 'Análise revisada: A dedução parte da regra geral para o caso particular com certeza matemática.'
        },
        {
          text: 'Uma falácia ad hominem que ataca a pessoa de Sócrates.',
          philosophy: 'virtue',
          philosopher: 'Crítica de Falácias',
          explanation: 'Falácia ad hominem ataca o debatedor e não o argumento, o que não ocorre neste silogismo.',
          result: 'Análise de falácias: Não há ataques pessoais, apenas inferência lógica formal.'
        }
      ]
    }
  ],
  political_philosophy: [
    {
      id: 1,
      title: 'Os Fins Justificam os Meios?',
      scenario: 'Você é o governante de um país em crise. Para evitar uma guerra civil iminente, é necessário aplicar uma medida impopular e moralmente questionável. O que você faz?',
      options: [
        {
          text: 'Fazer o que for pragmático para manter a estabilidade do Estado e a paz pública (Virtù e Fortuna).',
          philosophy: 'utilitarian',
          philosopher: 'Nicolau Maquiavel (O Príncipe)',
          explanation: 'A política possui uma ética própria (realismo político) distinta da moral religiosa privada.',
          result: 'Postura Maquiavélica: Priorização da manutenção da ordem republicana e estabilidade do poder.'
        },
        {
          text: 'Nunca violar os princípios constitucionais e a divisão harmônica dos três poderes.',
          philosophy: 'deontology',
          philosopher: 'Montesquieu (O Espírito das Leis)',
          explanation: 'A tripartição dos poderes (Executivo, Legislativo, Judiciário) existe para impedir abusos absolutistas.',
          result: 'Postura Constitucionalista: O poder deve frear o próprio poder mediante leis fundamentais.'
        },
        {
          text: 'Conclamar o debate no espaço público aberto para deliberação com a cidadania.',
          philosophy: 'virtue',
          philosopher: 'Hannah Arendt (A Condição Humana)',
          explanation: 'O poder autêntico nasce do agir e do falar conjunto de cidadãos livres no espaço público.',
          result: 'Postura Republicana Democrática: Valorização da ação cívica e da pluralidade humana.'
        }
      ]
    }
  ],
  epistemology: [
    {
      id: 1,
      title: 'A Origem do Conhecimento Humano',
      scenario: 'Como temos certeza de que aquilo que pensamos ser verdade realmente corresponde à realidade exterior?',
      options: [
        {
          text: '"Penso, logo existo" (Cogito ergo sum): a razão pura e a dúvida metódica são a única base indubitável.',
          philosophy: 'deontology',
          philosopher: 'René Descartes (Racionalismo)',
          explanation: 'Os sentidos podem nos enganar; apenas as ideias inatas claras e distintas da razão trazem certeza.',
          result: 'Postura Racionalista: O intelecto é a fonte primária de todo o conhecimento seguro.'
        },
        {
          text: 'A mente é uma "tábula rasa" e todo o conhecimento provém exclusivamente da experiência sensorial.',
          philosophy: 'utilitarian',
          philosopher: 'John Locke & David Hume (Empirismo)',
          explanation: 'Nada está no intelecto que não tenha passado antes pelos sentidos físicos da percepção.',
          result: 'Postura Empirista: A observação e o experimento são as âncoras da ciência e do saber.'
        },
        {
          text: 'Sintetizar: os sentidos fornecem os dados brutos e as estruturas a priori da mente os organizam.',
          philosophy: 'virtue',
          philosopher: 'Immanuel Kant (Idealismo Transcendental / Crítica da Razão Pura)',
          explanation: 'Conceitos sem intuições sensíveis são vazios; intuições sem conceitos são cegas.',
          result: 'Postura Crítica Kantiana: A revolução copernicana da epistemologia moderna.'
        }
      ]
    }
  ]
};

export function PhilosophySimulator({ mode = 'ethics', labTitle, onComplete }: PhilosophySimulatorProps) {
  const dilemmasList = MODE_DILEMMAS[mode] || MODE_DILEMMAS['ethics'];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [profile, setProfile] = useState<Record<string, number>>({
    utilitarian: 0,
    deontology: 0,
    virtue: 0
  });
  const [completed, setCompleted] = useState(false);

  const dilemma = dilemmasList[currentIdx];

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

    if (currentIdx < dilemmasList.length - 1) {
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
        🏛️ {labTitle || (
          mode === 'ethics' ? 'Laboratório de Ética: Dilemas Morais' :
          mode === 'cave_myth' ? 'O Mito da Caverna & Teoria das Ideias' :
          mode === 'contractualism' ? 'Teoria Contratualista & Estado' :
          mode === 'logic' ? 'Lógica Formal & Silogismos' :
          mode === 'political_philosophy' ? 'Filosofia Política & Poder' : 'Epistemologia & Teoria do Conhecimento'
        )}
      </h3>

      {!completed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Cabeçalho do Dilema */}
          <div className="premium-glass-panel p-4" style={{ borderRadius: '8px', borderLeft: '4px solid var(--color-primary)', background: 'rgba(255,255,255,0.01)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Dilema {dilemma.id} de {dilemmasList.length}
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
                    <div style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Escola / Filósofo: {opt.philosopher}</div>
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
            {currentIdx < dilemmasList.length - 1 ? 'Próximo Dilema' : 'Ver Diagnóstico Filosófico'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '3rem' }}>⚖️</div>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1.3rem' }}>Análise Filosófica de Caráter & Razão</h4>
          
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Suas escolhas apontam que seu perfil reflexivo dominante é o de **
            {dominantPhilosophy === 'utilitarian' && 'Pragmatismo & Consequencialismo'}
            {dominantPhilosophy === 'deontology' && 'Racionalismo & Deontologia'}
            {dominantPhilosophy === 'virtue' && 'Ética das Virtudes & Dialética'}
            **.
          </p>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', width: '100%', maxWidth: '400px', margin: '1rem 0' }}>
            <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONSEQUÊNCIAS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#06b6d4' }}>{profile.utilitarian} pts</div>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DEVER / PRINCÍPIOS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6' }}>{profile.deontology} pts</div>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VIRTUDE / RAZÃO</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffb300' }}>{profile.virtue} pts</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '10px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', width: '100%', maxWidth: '500px' }}>
            <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.2rem' }}>🤖 DIAGNÓSTICO FILOSÓFICO DE IA</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
              Perfil reflexivo verificado para o modo {mode.toUpperCase()}: Você pondera argumentos com rigor lógico e discernimento conceitual.
            </p>
          </div>

          <button 
            className="premium-btn btn-primary mt-4" 
            style={{ width: '240px', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.3)', fontWeight: 'bold' }}
            onClick={handleFinish}
          >
            🏆 Concluir Laboratório (+50 XP & +10 Moedas)
          </button>
        </div>
      )}
    </div>
  );
}
