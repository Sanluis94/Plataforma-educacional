import { useState } from 'react';

interface Fragment {
  id: string;
  title: string;
  author: string;
  text: string;
  questions: { q: string; options: string[]; answer: number; explanation: string }[];
}

const MODE_FRAGMENTS: Record<string, Fragment[]> = {
  syntax: [
    {
      id: 'syntax_1',
      title: 'Análise Sintática — Período Composto',
      author: 'Machado de Assis (Dom Casmurro)',
      text: `Não consultes dicionários. Casmurro não está aqui no sentido que eles lhe dão,\nmas no que lhe pôs o vulgo de homem calado e metido consigo.`,
      questions: [
        { q: 'Na oração "que eles lhe dão", qual a função sintática de "lhe"?', options: ['Objeto direto', 'Objeto indireto', 'Adjunto adnominal', 'Sujeito'], answer: 1, explanation: '"Lhe" funciona como objeto indireto, pois substitui "a ele" — dão (algo) a ele.' },
        { q: 'Qual a classificação da oração "que eles lhe dão"?', options: ['Subordinada adjetiva restritiva', 'Subordinada substantiva objetiva direta', 'Coordenada sindética explicativa', 'Subordinada adverbial causal'], answer: 0, explanation: 'É uma subordinada adjetiva restritiva, pois restringe o sentido de "sentido" usando o pronome relativo "que".' }
      ]
    },
    {
      id: 'syntax_2',
      title: 'Sujeito e Predicado',
      author: 'Clarice Lispector (A Hora da Estrela)',
      text: `Tudo no mundo começou com um sim.\nUma molécula disse sim a outra molécula e nasceu a vida.`,
      questions: [
        { q: 'Na oração "nasceu a vida", qual é o sujeito?', options: ['"nasceu"', '"a vida"', 'Sujeito indeterminado', 'Oração sem sujeito'], answer: 1, explanation: '"A vida" é o sujeito simples posposto ao verbo "nasceu" (ordem inversa: verbo + sujeito).' }
      ]
    }
  ],
  morphology: [
    {
      id: 'morph_1',
      title: 'Classes de Palavras — Verbos e Advérbios',
      author: 'Fernando Pessoa (Autopsicografia)',
      text: `O poeta é um fingidor.\nFinge tão completamente\nQue chega a fingir que é dor\nA dor que deveras sente.`,
      questions: [
        { q: '"Completamente" é classificado morfologicamente como:', options: ['Adjetivo', 'Advérbio de modo', 'Substantivo abstrato', 'Conjunção'], answer: 1, explanation: '"Completamente" é advérbio de modo, pois modifica o verbo "finge", indicando a maneira como o poeta finge.' },
        { q: '"Fingidor" é formado por qual processo de derivação?', options: ['Derivação prefixal', 'Derivação sufixal', 'Composição por justaposição', 'Derivação parassintética'], answer: 1, explanation: '"Fingidor" vem de "fingir" + sufixo "-dor" (agente), um processo de derivação sufixal.' }
      ]
    },
    {
      id: 'morph_2',
      title: 'Pronomes e Conjunções',
      author: 'Vinícius de Moraes (Soneto de Fidelidade)',
      text: `Eu possa me dizer do amor (que tive):\nQue não seja imortal, posto que é chama\nMas que seja infinito enquanto dure.`,
      questions: [
        { q: '"Posto que" funciona no texto como:', options: ['Conjunção concessiva', 'Conjunção causal', 'Conjunção condicional', 'Preposição'], answer: 0, explanation: '"Posto que" é conjunção concessiva (= embora), indicando contraste: embora seja chama, que não seja imortal.' }
      ]
    }
  ],
  literature: [
    {
      id: 'lit_1',
      title: 'Romantismo Brasileiro — 1ª Geração',
      author: 'Gonçalves Dias (Canção do Exílio)',
      text: `Minha terra tem palmeiras,\nOnde canta o Sabiá;\nAs aves, que aqui gorjeiam,\nNão gorjeiam como lá.`,
      questions: [
        { q: 'Qual característica do Romantismo é predominante neste poema?', options: ['Objetivismo científico', 'Saudosismo e nacionalismo (exaltação da pátria)', 'Pessimismo ultrarromântico', 'Condoreirismo social'], answer: 1, explanation: 'A 1ª geração romântica (Indianista/Nacionalista) exalta a natureza e a pátria idealizada, como faz Gonçalves Dias.' },
        { q: 'O eu-lírico encontra-se em que situação?', options: ['Na terra natal, descrevendo-a', 'No exílio, saudoso da pátria', 'Em uma viagem marítima', 'Retornando ao Brasil'], answer: 1, explanation: 'O poema foi escrito em Coimbra, Portugal. O eu-lírico compara a terra estrangeira com o Brasil que deixou.' }
      ]
    },
    {
      id: 'lit_2',
      title: 'Realismo — Machado de Assis',
      author: 'Machado de Assis (Memórias Póstumas de Brás Cubas)',
      text: `Algum tempo hesitei se devia abrir estas memórias pelo princípio\nou pelo fim, isto é, se poria em primeiro lugar o meu nascimento\nou a minha morte.`,
      questions: [
        { q: 'A ironia machadiana manifesta-se neste trecho por meio de:', options: ['Linguagem rebuscada e formal', 'Um defunto-autor que narra sua própria história com humor', 'Referências científicas e positivistas', 'Descrição detalhada de ambientes'], answer: 1, explanation: 'A grande inovação de Machado é o narrador-defunto: alguém já morto que escreve com ironia e liberdade total.' }
      ]
    }
  ],
  figures: [
    {
      id: 'fig_1',
      title: 'No Meio do Caminho',
      author: 'Carlos Drummond de Andrade',
      text: `No meio do caminho tinha uma pedra\ntinha uma pedra no meio do caminho\ntinha uma pedra\nno meio do caminho tinha uma pedra.`,
      questions: [
        { q: 'A repetição exaustiva da palavra "pedra" é um exemplo de qual figura de linguagem?', options: ['Metáfora', 'Anáfora', 'Hipérbole', 'Eufemismo'], answer: 1, explanation: 'Anáfora é a repetição de uma ou mais palavras no início de versos ou frases consecutivas, criando ênfase e ritmo.' },
        { q: 'A "pedra" no poema é entendida como um símbolo. Qual interpretação é mais coerente com o Modernismo?', options: ['Uma rocha literal no caminho do poeta', 'Os obstáculos e dificuldades da vida', 'Uma crítica à natureza', 'Um elogio ao trabalho manual'], answer: 1, explanation: 'O Modernismo valoriza o uso de símbolos do cotidiano para expressar questões existenciais e sociais.' }
      ]
    },
    {
      id: 'fig_2',
      title: 'Amor é fogo que arde sem se ver',
      author: 'Luís de Camões',
      text: `Amor é fogo que arde sem se ver;\né ferida que dói e não se sente;\né um contentamento descontente;\né dor que desatina sem doer;`,
      questions: [
        { q: 'O poema é construído sobre figuras que apresentam ideias opostas. Como se chama esse recurso?', options: ['Metáfora', 'Oxímoro / Antítese', 'Metonímia', 'Prosopopeia'], answer: 1, explanation: 'Oxímoro é a reunião de palavras de sentidos opostos na mesma expressão ("fogo que arde sem se ver"). Antítese é a oposição entre ideias distintas.' },
        { q: '"Amor é fogo" é um exemplo de:', options: ['Comparação', 'Metáfora', 'Hipérbole', 'Sinestesia'], answer: 1, explanation: 'Metáfora é a comparação implícita, sem uso de conectivo (como, tal qual). O amor é diretamente igualado ao fogo.' }
      ]
    }
  ],
  comprehension: [
    {
      id: 'comp_1',
      title: 'Interpretação Textual — Crônica',
      author: 'Rubem Braga',
      text: `Acordo de manhã e a primeira coisa que faço é\nir até a janela. De vez em quando tenho sorte:\nalguém está passando e não parece ter nenhuma pressa.\nIsso me tranquiliza enormemente.`,
      questions: [
        { q: 'O que o narrador valoriza na cena observada?', options: ['A velocidade da vida urbana', 'A calma e a ausência de pressa no cotidiano', 'A beleza arquitetônica da rua', 'O barulho reconfortante da cidade'], answer: 1, explanation: 'O narrador se "tranquiliza" ao ver alguém sem pressa, valorizando a lentidão e a contemplação — tema típico da crônica de Rubem Braga.' },
        { q: 'A crônica como gênero textual se caracteriza por:', options: ['Argumentação formal e científica', 'Narrativa curta sobre temas cotidianos com reflexão pessoal', 'Estrutura dissertativa com tese e antítese', 'Linguagem técnica e impessoal'], answer: 1, explanation: 'A crônica é um gênero leve que parte do cotidiano para fazer reflexões pessoais, com linguagem simples e subjetiva.' }
      ]
    }
  ],
  phonetics: [
    {
      id: 'phon_1',
      title: 'Fonética e Fonologia — Sons da Língua',
      author: 'Exercício Dirigido',
      text: `"Exceção" — observe: /e.se.ˈsãw̃/\n"Fixo" — observe: /ˈfi.su/ ou /ˈfi.ksu/\n"Táxi" — observe: /ˈta.ksi/\n"Hexagonal" — observe: /e.za.go.ˈnaw/`,
      questions: [
        { q: 'Na palavra "exceção", o X tem som de:', options: ['/ʃ/ como em "xícara"', '/s/ como em "sopa"', '/ks/ como em "fixo"', '/z/ como em "exame"'], answer: 1, explanation: 'Em "exceção", o X tem som de /s/ (= "esseção"). É um caso de X com valor de S antes de consoante.' },
        { q: 'Os encontros consonantais "pr" (em "prato") e "ss" (em "pássaro") diferem porque:', options: ['Ambos são dígrafos', '"pr" é encontro consonantal e "ss" é dígrafo', 'Ambos são encontros consonantais', '"pr" é dígrafo e "ss" é encontro consonantal'], answer: 1, explanation: 'Em "pr", cada letra mantém seu som próprio (encontro consonantal). Em "ss", duas letras representam um único fonema /s/ (dígrafo).' }
      ]
    }
  ],
};

export function PortugueseModule({ mode = 'syntax', labTitle, onComplete }: { mode?: string; labTitle?: string; labId?: string; onComplete?: (score: number) => void }) {
  const FRAGMENTS = MODE_FRAGMENTS[mode] || MODE_FRAGMENTS['syntax'];
  const [selectedFragment, setSelectedFragment] = useState(FRAGMENTS[0]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = selectedFragment.questions[currentQ];

  const modeLabel =
    mode === 'syntax' ? 'Sintaxe Dinâmica' :
    mode === 'morphology' ? 'Morfologia' :
    mode === 'literature' ? 'Literatura Clássica' :
    mode === 'figures' ? 'Figuras de Linguagem' :
    mode === 'comprehension' ? 'Interpretação de Texto' :
    mode === 'phonetics' ? 'Fonética e Fonologia' : 'Português';

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
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>📖 {labTitle || modeLabel}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        {mode === 'syntax' ? 'Analise a estrutura sintática das orações e identifique funções gramaticais.' :
         mode === 'morphology' ? 'Classifique palavras e identifique processos de formação e classes gramaticais.' :
         mode === 'literature' ? 'Interprete textos clássicos e identifique movimentos literários e seus autores.' :
         mode === 'figures' ? 'Identifique e classifique figuras de linguagem em trechos literários.' :
         mode === 'comprehension' ? 'Leia os fragmentos com atenção e responda questões de interpretação textual.' :
         'Estude os sons da língua portuguesa, dígrafos, encontros consonantais e fonemas.'}
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
            {score === selectedFragment.questions.length ? `Excelente! Domínio completo de ${modeLabel}.` : 'Revise os conceitos e tente novamente!'}
          </p>
          <button onClick={reset} style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer' }}>
            Refazer Quiz
          </button>
        </div>
      )}
      {onComplete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
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
