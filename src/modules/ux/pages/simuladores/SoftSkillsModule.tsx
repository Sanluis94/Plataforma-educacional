import { useState } from 'react';

interface Scenario {
  id: string;
  title: string;
  context: string;
  choices: { text: string; outcome: string; score: number; xp: number }[];
}

const MODE_SCENARIOS: Record<string, Scenario[]> = {
  communication: [
    {
      id: 'comm_1',
      title: 'Feedback Construtivo',
      context: 'Um membro do time cometeu um erro que atrasou a entrega de um relatório. Você precisa dar um feedback para que isso não volte a acontecer. Como você aborda a situação?',
      choices: [
        { text: 'Chamar a pessoa em particular, pontuar o fato com dados objetivos e propor um plano de ação conjunto.', outcome: '🏆 Excelente! Comunicação não-violenta (CNV) e foco na solução construtiva.', score: 100, xp: 80 },
        { text: 'Enviar um e-mail com cópia para todo o time apontando o erro para servir de exemplo.', outcome: '❌ Exposição desnecessária e prejudicial ao clima psicológico de segurança.', score: 10, xp: 5 },
        { text: 'Não falar nada para evitar constrangimento e refazer você mesmo o relatório.', outcome: '⚠️ Sobrecarga pessoal e ausência de desenvolvimento do colega.', score: 30, xp: 20 },
      ]
    }
  ],
  leadership: [
    {
      id: 'lead_1',
      title: 'Delegação e Autonomia',
      context: 'Sua equipe recebeu um projeto de alta complexidade. Você tem grande domínio técnico sobre o assunto. Como você gerencia as tarefas?',
      choices: [
        { text: 'Definir claramente os objetivos e entregáveis, delegando autonomia técnica e fazendo alinhamentos periódicos.', outcome: '🏆 Liderança inspiradora e empoderadora!', score: 100, xp: 100 },
        { text: 'Centralizar todas as decisões críticas e ditar o passo a passo de cada tarefa.', outcome: '⚠️ Microgerenciamento: sufoca a iniciativa e gera gargalos.', score: 40, xp: 25 },
        { text: 'Deixar o time completamente livre sem metas definidas ou suporte.', outcome: '❌ Ausência de liderança e direcionamento estratégico.', score: 20, xp: 10 },
      ]
    }
  ],
  time_management: [
    {
      id: 'time_1',
      title: 'Matriz de Eisenhower e Priorização',
      context: 'Você tem 10 tarefas acumuladas hoje, incluindo uma emergência de cliente, reuniões de rotina e o planejamento estratégico do próximo trimestre. O que faz primeiro?',
      choices: [
        { text: 'Classificar por Urgência vs Importância: resolver a crise urgente e bloquear tempo protegido para o estratégico.', outcome: '🏆 Domínio da Matriz de Eisenhower e alta eficácia!', score: 100, xp: 90 },
        { text: 'Fazer as tarefas mais fáceis e rápidas primeiro, empurrando as complexas para o fim do dia.', outcome: '⚠️ Ilusão de produtividade: as tarefas estratégicas acabam não sendo feitas.', score: 45, xp: 30 },
        { text: 'Tentar fazer tudo simultaneamente em multitarefa contínua.', outcome: '❌ Queda comprovada de 40% na produtividade e aumento do estresse.', score: 15, xp: 10 },
      ]
    }
  ],
  emotional_intelligence: [
    {
      id: 'eq_1',
      title: 'Autocontrole sob Pressão',
      context: 'Durante uma apresentação importante, um cliente critica duramente seu trabalho usando um tom agressivo e irônico. Qual sua reação imediata?',
      choices: [
        { text: 'Respirar fundo, acolher a preocupação do cliente sem rebater agressividade e focar nos pontos práticos a ajustar.', outcome: '🏆 Inteligência Emocional avançada (autorregulação e empatia de Goleman)!', score: 100, xp: 85 },
        { text: 'Responder no mesmo tom irônico para não se mostrar frágil.', outcome: '❌ Escalada do conflito e perda de profissionalismo.', score: 10, xp: 5 },
        { text: 'Ficar em silêncio absoluto e encerrar a reunião abruptamente.', outcome: '⚠️ Reação de fuga: prejudica a relação comercial.', score: 35, xp: 20 },
      ]
    }
  ],
  conflict_resolution: [
    {
      id: 'conf_1',
      title: 'O Conflito na Reunião',
      context: 'Dois colegas de trabalho discutem sobre responsabilidades e começam a elevar o tom na frente de outros setores. O que você faz?',
      choices: [
        { text: 'Suspender a discussão coletiva, acolher as partes em separado e mediar um acordo ganha-ganha.', outcome: '🏆 Mediação de conflito exemplar!', score: 100, xp: 80 },
        { text: 'Tomar partido de quem parece ter mais razão naquele momento.', outcome: '❌ Parcialidade destrutiva.', score: 10, xp: 5 },
        { text: 'Deixar que discutam até que alguém ceda.', outcome: '⚠️ Omissão prejudicial à segurança psicológica da equipe.', score: 30, xp: 20 },
      ]
    }
  ],
  teamwork: [
    {
      id: 'team_1',
      title: 'Colaboração Interdisciplinar',
      context: 'O time de design e o de desenvolvimento discordam sobre a viabilidade de uma tela no app. Os prazos estão apertados. Como você atua?',
      choices: [
        { text: 'Promover uma sessão de co-criação rápida (Design Sprint) para encontrar uma solução viável e visualmente elegante.', outcome: '🏆 Sinergia interdisciplinar e foco na entrega de valor!', score: 100, xp: 95 },
        { text: 'Fazer o programador implementar exatamente o que o designer pediu sem questionar.', outcome: '⚠️ Pode inviabilizar o prazo técnico ou a performance.', score: 40, xp: 25 },
        { text: 'Cortar todo o design visual e entregar apenas telas brutas.', outcome: '❌ Prejudica a experiência do usuário final.', score: 20, xp: 15 },
      ]
    }
  ]
};

export function SoftSkillsModule({ mode = 'communication', labTitle, onComplete }: { mode?: string; labTitle?: string; labId?: string; onComplete?: (score: number) => void }) {
  const scenariosList = MODE_SCENARIOS[mode] || MODE_SCENARIOS['communication'];
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [finished, setFinished] = useState(false);

  const scenario = scenariosList[scenarioIdx];

  const handleChoice = (idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    setTotalXP(x => x + scenario.choices[idx].xp);
  };

  const next = () => {
    if (scenarioIdx < scenariosList.length - 1) {
      setScenarioIdx(i => i + 1);
      setChosen(null);
    } else {
      setFinished(true);
    }
  };

  const reset = () => { setScenarioIdx(0); setChosen(null); setTotalXP(0); setFinished(false); };

  if (finished) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌟</div>
        <h2 style={{ color: 'var(--text-main)' }}>Trilha de Soft Skills Concluída!</h2>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: '0.5rem 0' }}>+{totalXP} XP</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {totalXP >= 70 ? 'Excelente! Você demonstrou maturidade comportamental e liderança avançada.' : 'Bom progresso! Continue desenvolvendo suas soft skills com mais cenários.'}
        </p>
        <button onClick={reset} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
          Refazer Trilha
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>💼 {labTitle || 'Laboratório de Habilidades Socioemocionais'}</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cenário {scenarioIdx + 1}/{scenariosList.length}</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>⚡ {totalXP} XP</span>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem' }}>{scenario.title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>{scenario.context}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
        {scenario.choices.map((c, i) => {
          const isChosen = chosen === i;
          const isAny = chosen !== null;
          return (
            <button key={i} onClick={() => handleChoice(i)}
              style={{
                textAlign: 'left', padding: '0.9rem 1rem', borderRadius: '10px',
                border: isChosen ? `1px solid ${c.score >= 80 ? '#4caf50' : c.score >= 50 ? '#ffa726' : '#f44336'}` : '1px solid rgba(255,255,255,0.12)',
                background: isChosen ? (c.score >= 80 ? 'rgba(76,175,80,0.1)' : c.score >= 50 ? 'rgba(255,167,38,0.1)' : 'rgba(244,67,54,0.1)') : 'var(--bg-secondary)',
                color: 'var(--text-main)', cursor: isAny ? 'default' : 'pointer',
                transition: 'all 0.25s', fontSize: '0.9rem', lineHeight: '1.5',
              }}>
              {c.text}
            </button>
          );
        })}
      </div>

      {chosen !== null && (
        <div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', borderLeft: '3px solid var(--color-primary)' }}>
            <strong style={{ color: 'var(--color-primary)' }}>Feedback da IA:</strong>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0', fontSize: '0.88rem', lineHeight: '1.6' }}>{scenario.choices[chosen].outcome}</p>
            <div style={{ marginTop: '0.5rem', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.82rem' }}>
              +{scenario.choices[chosen].xp} XP conquistados
            </div>
          </div>
          <button onClick={next} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            {scenarioIdx < scenariosList.length - 1 ? 'Próximo Cenário →' : 'Finalizar Trilha'}
          </button>
        </div>
      )}

      <div style={{ marginTop: '1.25rem', padding: '0.85rem', borderRadius: '10px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
        <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.2rem' }}>🤖 AVALIAÇÃO DE IA COMPORTAMENTAL</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
          {chosen !== null
            ? `Decisão analisada para a competência ${mode.toUpperCase()}: +${scenario.choices[chosen].xp} XP computada!`
            : `Pratique competências de ${mode.replace('_', ' ')} através de tomada de decisão contextualizada.`}
        </p>
      </div>

      {onComplete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => onComplete(100)}
            className="btn-gradient"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 15px rgba(16,185,129,0.3)', fontWeight: 'bold' }}
          >
            🏆 Concluir Laboratório (+50 XP & +10 Moedas)
          </button>
        </div>
      )}
    </div>
  );
}
