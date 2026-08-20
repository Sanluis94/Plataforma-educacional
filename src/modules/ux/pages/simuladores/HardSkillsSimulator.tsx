import { useState } from 'react';

type Step = { instruction: string; hint: string };
type Program = { title: string; icon: string; steps: Step[]; result: string };

const MODE_PROGRAMS: Record<string, Program> = {
  programming: {
    title: 'Lógica de Programação',
    icon: '💻',
    steps: [
      { instruction: 'Variáveis e Tipos: Declare uma variável "nome = \'Maria\'" e "idade = 17". Qual o tipo de dado de cada uma?', hint: '"Maria" é String (texto) e 17 é Integer (número inteiro).' },
      { instruction: 'Condicionais: Escreva a lógica "SE idade >= 18 ENTÃO \'Maior de idade\' SENÃO \'Menor de idade\'".', hint: 'Estruturas condicionais (IF/ELSE) desviam o fluxo de execução com base em booleanos.' },
      { instruction: 'Laços de Repetição: Como imprimir os números pares de 2 a 10 usando um laço FOR?', hint: 'FOR i de 2 até 10 com passo 2: imprima i.' },
      { instruction: 'Funções: Crie uma função calcularMedia(n1, n2) que retorne (n1 + n2) / 2.', hint: 'Funções encapsulam blocos lógicos reutilizáveis com parâmetros de entrada e retorno.' },
    ],
    result: 'Parabéns! Você dominou os fundamentos de lógica: variáveis, condicionais, repetições e funções!',
  },
  data_structures: {
    title: 'Estruturas de Dados',
    icon: '📚',
    steps: [
      { instruction: 'Pilhas (Stack - LIFO): Qual o resultado de push(10), push(20), pop()?', hint: 'Last In, First Out. O último elemento inserido (20) é o primeiro a sair pelo pop().' },
      { instruction: 'Filas (Queue - FIFO): Em uma fila de impressão com [docA, docB, docC], qual documento é impresso primeiro?', hint: 'First In, First Out. O primeiro que entra (docA) é o primeiro a ser processado.' },
      { instruction: 'Arrays e Listas: Como acessar o 3º elemento de uma lista indexada em 0 (zero-based)?', hint: 'O terceiro elemento fica no índice [2].' },
      { instruction: 'Árvores Binárias de Busca (BST): Onde é inserido um valor menor que a raiz?', hint: 'Na subárvore da esquerda (left child).' },
    ],
    result: 'Excelente! Você compreendeu a mecânica de Pilhas, Filas, Listas e Árvores!',
  },
  databases: {
    title: 'Banco de Dados & SQL',
    icon: '🗄️',
    steps: [
      { instruction: 'SELECT básico: Escreva uma consulta para buscar o nome e email de todos os alunos ativos da tabela "alunos".', hint: 'SELECT nome, email FROM alunos WHERE status = \'ativo\';' },
      { instruction: 'Filtros e Operadores: Como filtrar produtos com preço maior que 100 e categoria "Eletrônicos"?', hint: 'WHERE preco > 100 AND categoria = \'Eletronicos\'' },
      { instruction: 'Junções (JOIN): Como relacionar a tabela "pedidos" com a tabela "clientes" usando a chave estrangeira cliente_id?', hint: 'SELECT * FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id;' },
      { instruction: 'Agrupamento (GROUP BY): Como contar quantos alunos existem por turma?', hint: 'SELECT turma_id, COUNT(*) FROM alunos GROUP BY turma_id;' },
    ],
    result: 'Show! Você dominou comandos essenciais de consulta SQL relacional!',
  },
  web_dev: {
    title: 'Desenvolvimento Web',
    icon: '🌐',
    steps: [
      { instruction: 'HTML5 Semântico: Quais tags semânticas substituem as divs genéricas no cabeçalho e rodapé?', hint: 'Use <header> para o topo e <footer> para a base da página.' },
      { instruction: 'CSS Flexbox: Qual propriedade alinha itens horizontalmente no centro de um container flex?', hint: 'justify-content: center (no eixo principal) e align-items: center (no eixo cruzado).' },
      { instruction: 'JavaScript DOM: Como capturar o clique de um botão com id "btn-enviar"?', hint: 'document.getElementById("btn-enviar").addEventListener("click", () => { ... });' },
      { instruction: 'API REST & Fetch: Como enviar uma requisição GET para /api/dados em JSON?', hint: 'fetch("/api/dados").then(res => res.json()).then(data => console.log(data));' },
    ],
    result: 'Perfeito! Você fixou a trindade web: HTML5 estrutural, CSS3 flexível e JavaScript assíncrono!',
  },
  algorithms: {
    title: 'Algoritmos & Complexidade',
    icon: '⚡',
    steps: [
      { instruction: 'Busca Binária vs Linear: Em uma lista ordenada de 1.000.000 itens, quantos passos máximos a busca binária leva?', hint: 'log2(1.000.000) ≈ 20 passos, enquanto a linear levaria até 1.000.000!' },
      { instruction: 'Complexidade Big-O: Qual a complexidade de tempo do algoritmo de ordenação QuickSort no caso médio?', hint: 'O(N log N).' },
      { instruction: 'Recursão: O que acontece se uma função recursiva não tiver um caso base (condição de parada)?', hint: 'Ocorre um estouro de pilha de memória (Stack Overflow).' },
    ],
    result: 'Incrível! Você dominou noções cruciais de eficiência de algoritmos e notação Big-O!',
  },
  networks: {
    title: 'Redes de Computadores',
    icon: '📡',
    steps: [
      { instruction: 'Modelo TCP/IP: Qual a diferença fundamental entre TCP e UDP?', hint: 'TCP é orientado à conexão com garantia de entrega; UDP é não-confiável e veloz (ideal para streaming/jogos).' },
      { instruction: 'DNS (Domain Name System): Qual o papel do servidor DNS na navegação web?', hint: 'Traduz nomes de domínio humanamente legíveis (ex: google.com) para endereços IP numéricos.' },
      { instruction: 'HTTPS e TLS: O que garante a segurança da comunicação no protocolo HTTPS?', hint: 'Criptografia assimétrica via certificados SSL/TLS na porta 443.' },
    ],
    result: 'Excelente! Você conhece as bases de protocolos e segurança de redes de computadores!',
  },
};

export function HardSkillsSimulator({ mode = 'programming', labTitle, onComplete }: { mode?: string; labTitle?: string; labId?: string; onComplete?: (score: number) => void }) {
  const program = MODE_PROGRAMS[mode] || MODE_PROGRAMS['programming'];
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);

  const next = () => {
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
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🖥️ {labTitle || program.title}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Simulação prática e interativa de fundamentos tecnológicos.</p>

      {!done ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{program.icon}</span>
            <h3 style={{ color: 'var(--text-main)', margin: 0 }}>{program.title}</h3>
            <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Passo {step + 1}/{program.steps.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '1.25rem' }}>
            <div style={{ height: '100%', background: 'var(--color-primary)', borderRadius: '2px', width: `${((step + 1) / program.steps.length) * 100}%`, transition: 'width 0.4s' }} />
          </div>

          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Desafio Técnico:</h4>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '1rem' }}>{program.steps[step].instruction}</p>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--color-secondary)' }}>
              💡 <strong>Dica da IA:</strong> {program.steps[step].hint}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Escreva sua solução / raciocínio técnico:</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3}
              placeholder="Digite o código, comando ou explicação..."
              style={{ width: '100%', borderRadius: '8px', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-main)', resize: 'none', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
          </div>

          <button onClick={next} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            {step < program.steps.length - 1 ? 'Próximo Passo →' : 'Concluir Desafio'}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.75rem' }}>Módulo Concluído com Sucesso!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{program.result}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={reset} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Refazer Desafio
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.25rem', padding: '0.85rem', borderRadius: '10px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
        <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.2rem' }}>🤖 ANALISADOR DE IA DE CÓDIGO</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>
          Executando laboratório técnico de {program.title}. Pratique sintaxe limpa e boas práticas de arquitetura.
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
