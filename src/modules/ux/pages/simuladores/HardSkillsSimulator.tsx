import { useState } from 'react';

type Step = { instruction: string; hint: string };
type Program = { title: string; icon: string; steps: Step[]; result: string };

const PROGRAMS: Record<string, Program> = {
  excel: {
    title: 'Excel Básico',
    icon: '📊',
    steps: [
      { instruction: 'Clique na célula A1 e digite "Produto"', hint: 'Células são identificadas por letra (coluna) + número (linha).' },
      { instruction: 'Pressione Tab e na célula B1 escreva "Preço (R$)"', hint: 'Tab avança para a próxima coluna; Enter vai para a linha abaixo.' },
      { instruction: 'Na célula A2 escreva "Caneta" e em B2 escreva "3.50"', hint: 'Valores numéricos sem aspas são interpretados como números.' },
      { instruction: 'Na célula B4 escreva a fórmula: =SOMA(B2:B3)', hint: 'Fórmulas sempre começam com "=". SOMA() adiciona os valores de um intervalo.' },
    ],
    result: 'Parabéns! Você aprendeu a criar uma tabela simples e usar a fórmula SOMA no Excel.',
  },
  coding: {
    title: 'Lógica de Programação',
    icon: '💻',
    steps: [
      { instruction: 'Um algoritmo é uma sequência de passos. Escreva em pseudocódigo: "INÍCIO → LER nome → ESCREVER Olá, nome → FIM"', hint: 'Pseudocódigo usa linguagem natural para descrever a lógica antes de codificar.' },
      { instruction: 'Identify the structure: IF (nota >= 6) THEN "Aprovado" ELSE "Reprovado"', hint: 'Estruturas condicionais (IF/ELSE) permitem que o programa tome decisões.' },
      { instruction: 'Crie um loop: PARA i DE 1 ATÉ 5, FAÇA: ESCREVER i × 2', hint: 'Loops (PARA, ENQUANTO) repetem um bloco de código várias vezes.' },
      { instruction: 'Combine: leia uma lista de notas e calcule a MÉDIA usando soma e contagem.', hint: 'Algoritmos complexos são formados pela combinação de variáveis, condicionais e loops.' },
    ],
    result: 'Você dominou os fundamentos da lógica de programação: sequência, decisão, repetição e variáveis!',
  },
};

export function HardSkillsSimulator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  const program = selected ? PROGRAMS[selected] : null;

  const next = () => {
    if (!program) return;
    if (step < program.steps.length - 1) {
      setStep(s => s + 1);
      setInput('');
    } else {
      setDone(true);
    }
  };

  const reset = () => { setStep(0); setInput(''); setDone(false); };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🖥️ Ferramentas Digitais (Hard Skills)</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Simuladores de software corporativo e fundamentos de programação.</p>

      {!selected ? (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {Object.entries(PROGRAMS).map(([key, prog]) => (
            <button key={key} onClick={() => { setSelected(key); reset(); }}
              style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'var(--bg-secondary)',
                color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left', minWidth: '200px', flex: '1',
                transition: 'all 0.2s' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{prog.icon}</div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{prog.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{prog.steps.length} passos práticos</div>
            </button>
          ))}
        </div>
      ) : program && !done ? (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.85rem' }}>
            ← Voltar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{program.icon}</span>
            <h3 style={{ color: 'var(--text-main)', margin: 0 }}>{program.title}</h3>
            <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Passo {step + 1}/{program.steps.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '1.25rem' }}>
            <div style={{ height: '100%', background: 'var(--color-primary)', borderRadius: '2px', width: `${((step) / program.steps.length) * 100}%`, transition: 'width 0.4s' }} />
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Instrução:</h4>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '1rem' }}>{program.steps[step].instruction}</p>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--color-secondary)' }}>
              💡 <strong>Dica:</strong> {program.steps[step].hint}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Descreva o que você faria (ou o resultado esperado):</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
              placeholder="Escreva aqui sua resposta ou raciocínio..."
              style={{ width: '100%', borderRadius: '8px', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-main)', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          <button onClick={next} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            {step < program.steps.length - 1 ? 'Próximo Passo →' : 'Concluir Módulo'}
          </button>
        </div>
      ) : program && done ? (
        <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem' }}>Módulo Concluído!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{program.result}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={reset} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Refazer
            </button>
            <button onClick={() => { setSelected(null); reset(); }} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              Outros Módulos
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
