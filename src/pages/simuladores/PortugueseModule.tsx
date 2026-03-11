import { useState } from 'react';

const FRAGMENTS = [
  {
    id: 'drummond',
    title: 'No Meio do Caminho',
    author: 'Carlos Drummond de Andrade',
    text: `No meio do caminho tinha uma pedra
tinha uma pedra no meio do caminho
tinha uma pedra
no meio do caminho tinha uma pedra.`,
    questions: [
      {
        q: 'A repetição exaustiva da palavra "pedra" é um exemplo de qual figura de linguagem?',
        options: ['Metáfora', 'Anáfora', 'Hipérbole', 'Eufemismo'],
        answer: 1,
        explanation: 'Anáfora é a repetição de uma ou mais palavras no início de versos ou frases consecutivas, criando ênfase e ritmo.'
      },
      {
        q: 'A "pedra" no poema é entendida como um símbolo. Qual interpretação é mais coerente com o Modernismo?',
        options: ['Uma rocha literal no caminho do poeta', 'Os obstáculos e dificuldades da vida', 'Uma crítica à natureza', 'Um elogio ao trabalho manual'],
        answer: 1,
        explanation: 'O Modernismo valoriza o uso de símbolos do cotidiano para expressar questões existenciais e sociais.'
      }
    ]
  },
  {
    id: 'camoes',
    title: 'Amor é fogo que arde sem se ver',
    author: 'Luís de Camões',
    text: `Amor é fogo que arde sem se ver;
é ferida que dói e não se sente;
é um contentamento descontente;
é dor que desatina sem doer;`,
    questions: [
      {
        q: 'O poema é construído sobre figuras que apresentam ideias opostas. Como se chama esse recurso?',
        options: ['Metáfora', 'Oxímoro / Antítese', 'Metonímia', 'Prosopopeia'],
        answer: 1,
        explanation: 'Oxímoro é a reunião de palavras de sentidos opostos na mesma expressão ("fogo que arde sem se ver"). Antítese é a oposição entre ideias distintas.'
      }
    ]
  }
];

export function PortugueseModule() {
  const [selectedFragment, setSelectedFragment] = useState(FRAGMENTS[0]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = selectedFragment.questions[currentQ];

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === question.answer) setScore(s => s + 1);
  };

  const next = () => {
    if (currentQ < selectedFragment.questions.length - 1) {
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
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>📖 Português & Literatura</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        Leia o fragmento literário e responda ao quiz adaptativo com análise de figuras de linguagem.
      </p>

      {/* Seletor de fragmento */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {FRAGMENTS.map(f => (
          <button key={f.id} onClick={() => { setSelectedFragment(f); reset(); }}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
              background: selectedFragment.id === f.id ? 'var(--color-primary)' : 'var(--bg-secondary)',
              border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-main)',
              fontWeight: selectedFragment.id === f.id ? 'bold' : 'normal',
            }}>
            {f.title}
          </button>
        ))}
      </div>

      {/* Poema */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem',
        marginBottom: '1.25rem', borderLeft: '3px solid var(--color-primary)',
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {selectedFragment.author}
        </div>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem' }}>{selectedFragment.title}</h3>
        <pre style={{ fontFamily: 'Georgia, serif', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.9', fontStyle: 'italic' }}>
          {selectedFragment.text}
        </pre>
      </div>

      {/* Quiz */}
      {!showResult ? (
        <div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Questão {currentQ + 1}/{selectedFragment.questions.length}
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
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                💡 <strong>Feedback da IA:</strong> {question.explanation}
              </div>
            )}
            {answered !== null && (
              <button onClick={next} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                {currentQ < selectedFragment.questions.length - 1 ? 'Próxima Questão →' : 'Ver Resultado'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{score === selectedFragment.questions.length ? '🏆' : '📚'}</div>
          <h3 style={{ color: 'var(--text-main)' }}>Resultado: {score}/{selectedFragment.questions.length}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {score === selectedFragment.questions.length ? 'Excelente! Domínio completo das figuras de linguagem.' : 'Revise os conceitos e tente novamente!'}
          </p>
          <button onClick={reset} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer' }}>
            Refazer Quiz
          </button>
        </div>
      )}
    </div>
  );
}
