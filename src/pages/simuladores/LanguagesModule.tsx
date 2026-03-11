import { useState } from 'react';

const VOCABULARY = {
  english: [
    { word: 'Sustainable', translation: 'Sustentável', example: 'We need sustainable energy sources.', phonetic: '/səˈsteɪnəbl/' },
    { word: 'Resilience', translation: 'Resiliência', example: 'Her resilience helped her overcome hardship.', phonetic: '/rɪˈzɪliəns/' },
    { word: 'Innovation', translation: 'Inovação', example: 'Technological innovation drives progress.', phonetic: '/ˌɪnəˈveɪʃn/' },
    { word: 'Empathy', translation: 'Empatia', example: 'Empathy is crucial in social relationships.', phonetic: '/ˈempəθi/' },
    { word: 'Phenomenon', translation: 'Fenômeno', example: 'Climate change is a global phenomenon.', phonetic: '/fɪˈnɒmɪnən/' },
  ],
  spanish: [
    { word: 'Sostenible', translation: 'Sustentável', example: 'Necesitamos fuentes de energía sostenibles.', phonetic: '/sosteˈnible/' },
    { word: 'Resiliencia', translation: 'Resiliência', example: 'Su resiliencia la ayudó a superar dificultades.', phonetic: '/resiˈljenθja/' },
    { word: 'Innovación', translation: 'Inovação', example: 'La innovación tecnológica impulsa el progreso.', phonetic: '/inoβaˈθjon/' },
    { word: 'Empatía', translation: 'Empatia', example: 'La empatía es fundamental en las relaciones.', phonetic: '/empaˈtia/' },
    { word: 'Fenómeno', translation: 'Fenômeno', example: 'El cambio climático es un fenómeno global.', phonetic: '/feˈnomeno/' },
  ]
};

export function LanguagesModule() {
  const [lang, setLang] = useState<'english' | 'spanish'>('english');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const words = VOCABULARY[lang];
  const current = words[currentIdx];

  const speak = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const next = () => {
    if (currentIdx < words.length - 1) {
      setCurrentIdx(i => i + 1);
      setShowTranslation(false);
      setAnswered(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (!answered) {
      if (correct) setScore(s => s + 1);
      setAnswered(true);
      setShowTranslation(true);
    }
  };

  const reset = () => { setCurrentIdx(0); setScore(0); setShowTranslation(false); setAnswered(false); };

  // Generate multiple-choice options
  const otherWords = words.filter((_, i) => i !== currentIdx);
  const shuffled = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...shuffled, current].sort(() => Math.random() - 0.5);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🌐 Idiomas — Inglês & Espanhol</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Pratique vocabulário avançado com pronunciação nativa (Text-to-Speech).</p>

      {/* Lang selector */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {(['english', 'spanish'] as const).map(l => (
          <button key={l} onClick={() => { setLang(l); reset(); }}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: lang === l ? 'var(--color-primary)' : 'var(--bg-secondary)',
              color: lang === l ? 'white' : 'var(--text-secondary)', fontWeight: lang === l ? 'bold' : 'normal' }}>
            {l === 'english' ? '🇺🇸 Inglês' : '🇪🇸 Espanhol'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.85rem', alignSelf: 'center' }}>
          Acertos: <strong style={{ color: 'var(--color-primary)' }}>{score}/{currentIdx}</strong>
        </div>
      </div>

      {currentIdx < words.length ? (
        <div>
          {/* Card da palavra */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '2rem', marginBottom: '1.25rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
              {current.word}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{current.phonetic}</div>
            
            <button onClick={() => speak(current.word, lang === 'english' ? 'en-US' : 'es-ES')}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem' }}>
              🔊 Ouvir Pronúncia
            </button>

            {showTranslation && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(76,175,80,0.1)', borderRadius: '8px', border: '1px solid rgba(76,175,80,0.3)' }}>
                <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '0.25rem' }}>Tradução: {current.translation}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>"{current.example}"</div>
                <button onClick={() => speak(current.example, lang === 'english' ? 'en-US' : 'es-ES')}
                  style={{ marginTop: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(76,175,80,0.4)', background: 'transparent', color: '#4caf50', cursor: 'pointer', fontSize: '0.75rem' }}>
                  🔊 Ouvir Frase
                </button>
              </div>
            )}
          </div>

          {/* Multiple choice */}
          {!answered && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Qual é a tradução desta palavra?</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(opt.word === current.word)}
                    style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
                      background: 'var(--bg-secondary)', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem' }}>
                    {opt.translation}
                  </button>
                ))}
              </div>
            </div>
          )}

          {answered && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={next}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                Próxima Palavra →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3 style={{ color: 'var(--text-main)' }}>Módulo concluído! {score}/{words.length} acertos</h3>
          <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '8px', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer' }}>
            Refazer
          </button>
        </div>
      )}
    </div>
  );
}
