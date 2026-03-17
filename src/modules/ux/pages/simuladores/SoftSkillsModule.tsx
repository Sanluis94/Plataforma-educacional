import { useState } from 'react';

interface Scenario {
  id: string;
  title: string;
  context: string;
  choices: { text: string; outcome: string; score: number; xp: number }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'O Conflito na Reunião',
    context: 'Em uma reunião de equipe, dois colegas de trabalho discutem sobre responsabilidades e começam a elevar o tom. Como gestor(a), você precisa agir. O que você faz?',
    choices: [
      { text: 'Suspender a reunião, separar as partes e ouvir cada um individualmente.', outcome: '✅ Ação de liderança empática. Você desescalou o conflito e criou condições para uma resolução matura.', score: 100, xp: 80 },
      { text: 'Deixar que resolvam entre si sem interferir.', outcome: '⚠️ Omissão de liderança. Conflitos sem mediação tendem a piorar e prejudicar o ambiente de trabalho.', score: 30, xp: 20 },
      { text: 'Tomar partido de quem parece ter mais razão naquele momento.', outcome: '❌ Parcialidade sem dados completos. Essa ação gera desconfiança na equipe e percepção de injustiça.', score: 10, xp: 5 },
      { text: 'Encerrar a reunião e registrar o ocorrido para análise posterior com RH.', outcome: '✅ Adequado em contextos gravas, mas deixa o conflito em aberto. Mediação imediata seria mais eficaz.', score: 75, xp: 55 },
    ],
  },
  {
    id: 's2',
    title: 'O Prazo Impossível',
    context: 'Seu gestor acabou de atribuir um projeto a você com um prazo que você acredita ser impossível de cumprir com qualidade. O que você faz?',
    choices: [
      { text: 'Aceitar sem questionar para não parecer incapaz.', outcome: '❌ Aceitar prazos irrealistas gera stress, erros e pode comprometer a entrega. Comunicação assertiva é essencial.', score: 10, xp: 5 },
      { text: 'Apresentar ao gestor uma análise do escopo, cronograma realista e possíveis soluções (priorização, reforço de equipe).', outcome: '🏆 Postura profissional exemplar! Você demonstrou liderança, organização e comunicação assertiva.', score: 100, xp: 100 },
      { text: 'Recusar o projeto de forma direta.', outcome: '❌ Recusa sem alternativas pode ser vista como falta de comprometimento. Ofereça soluções antes de recusar.', score: 15, xp: 10 },
      { text: 'Pedir mais tempo à equipe sem consultar o gestor.', outcome: '⚠️ Iniciativa válida, mas decisões de prazo devem ser alinhadas com a hierarquia. Alinhe expectativas verticalmente.', score: 50, xp: 35 },
    ],
  },
];

export function SoftSkillsModule() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [finished, setFinished] = useState(false);

  const scenario = SCENARIOS[scenarioIdx];

  const handleChoice = (idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    setTotalXP(x => x + scenario.choices[idx].xp);
  };

  const next = () => {
    if (scenarioIdx < SCENARIOS.length - 1) {
      setScenarioIdx(i => i + 1);
      setChosen(null);
    } else {
      setFinished(true);
    }
  };

  const reset = () => { setScenarioIdx(0); setChosen(null); setTotalXP(0); setFinished(false); };

  if (finished) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🏆</div>
        <h2 style={{ color: 'var(--text-main)' }}>Trilha Concluída!</h2>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: '0.5rem 0' }}>+{totalXP} XP</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {totalXP >= 150 ? 'Excelente! Você demonstrou liderança e inteligência emocional avançadas.' : 'Bom progresso! Continue desenvolvendo suas soft skills com mais cenários.'}
        </p>
        <button onClick={reset} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
          Refazer Trilha
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>💼 Soft Skills — Liderança & Comportamento</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cenário {scenarioIdx + 1}/{SCENARIOS.length}</span>
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
            <strong style={{ color: 'var(--color-primary)' }}>Feedback:</strong>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0', fontSize: '0.88rem', lineHeight: '1.6' }}>{scenario.choices[chosen].outcome}</p>
            <div style={{ marginTop: '0.5rem', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.82rem' }}>
              +{scenario.choices[chosen].xp} XP conquistados
            </div>
          </div>
          <button onClick={next} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            {scenarioIdx < SCENARIOS.length - 1 ? 'Próximo Cenário →' : 'Finalizar Trilha'}
          </button>
        </div>
      )}
    </div>
  );
}
