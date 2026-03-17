import { useState } from 'react';

const COMPETENCIAS = [
  { id: 1, name: 'Domínio da Língua Escrita', desc: 'Gramática, ortografia, pontuação e uso culto da língua.' },
  { id: 2, name: 'Compreensão do Tema', desc: 'Pertinência ao tema proposto e respeito às limitações temáticas.' },
  { id: 3, name: 'Organização Argumentativa', desc: 'Coesão, coerência e desenvolvimento dos argumentos com repertório sociocultural.' },
  { id: 4, name: 'Conhecimento dos Mecanismos Linguísticos', desc: 'Conectivos, progressão textual e articulação das ideias.' },
  { id: 5, name: 'Proposta de Intervenção', desc: 'Proposta detalhada, respeitando os direitos humanos e a realidade social.' },
];

export function EssayModule() {
  const [essay, setEssay] = useState('');
  const [theme, setTheme] = useState('A influência das redes sociais na saúde mental dos jovens');
  const [feedback, setFeedback] = useState<null | { score: number; comments: string[] }>(null);
  const [loading, setLoading] = useState(false);

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  const analyzeEssay = async () => {
    if (wordCount < 40) return;
    setLoading(true);
    // Mock analysis (IA real dependeria da API Gemini configurada)
    await new Promise(r => setTimeout(r, 1500));
    const hasIntroduction = essay.length > 100;
    const hasSocioculturalRef = /inventor|cientista|lei|pesquisa|dado|sociedade|estudo/i.test(essay);
    const hasIntervention = /portanto|dessa forma|propõe-se|é necessário|deve-se|medida|solução/i.test(essay);
    const hasConnectives = /além disso|entretanto|no entanto|portanto|ademais|visto que/i.test(essay);

    const scores = [
      Math.min(200, 120 + (hasIntroduction ? 40 : 0) + (wordCount > 150 ? 40 : 0)),
      Math.min(200, theme.split(' ').filter(w => essay.toLowerCase().includes(w.toLowerCase())).length * 30),
      Math.min(200, 80 + (hasSocioculturalRef ? 80 : 0) + (hasConnectives ? 40 : 0)),
      Math.min(200, 100 + (hasConnectives ? 100 : 0)),
      Math.min(200, hasIntervention ? 180 : 60),
    ];
    const total = scores.reduce((a, b) => a + b, 0);
    const comments = COMPETENCIAS.map((c, i) => `C${c.id} (${c.name}): ${scores[i]}/200 pts — ${scores[i] >= 160 ? '✅ Ótimo' : scores[i] >= 100 ? '⚠️ Regular' : '❌ Necessita revisão'}`);
    setFeedback({ score: total, comments });
    setLoading(false);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>✍️ Redação Orientada por IA</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Escreva sua redação abaixo e receba análise baseada nas 5 competências do ENEM.</p>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.4rem' }}>Tema da Redação:</label>
        <input value={theme} onChange={e => setTheme(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'bold', outline: 'none' }} />
      </div>

      <textarea value={essay} onChange={e => setEssay(e.target.value)} rows={12}
        placeholder="Escreva sua redação dissertativo-argumentativa aqui. Desenvolva uma introdução, dois ou três argumentos com repertório sociocultural e uma proposta de intervenção detalhada..."
        style={{
          width: '100%', borderRadius: '10px', padding: '1rem', fontSize: '0.95rem',
          background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'var(--text-main)', resize: 'vertical', outline: 'none', lineHeight: '1.7', fontFamily: 'inherit', boxSizing: 'border-box',
        }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ color: wordCount < 40 ? '#f44336' : wordCount > 200 ? '#4caf50' : '#ffa726', fontSize: '0.85rem' }}>
          {wordCount} palavras {wordCount < 40 ? '(mínimo 40 para análise)' : wordCount > 200 ? '✅ Tamanho adequado' : '(tente chegar a 200+)'}
        </span>
        <button onClick={analyzeEssay} disabled={wordCount < 40 || loading}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: wordCount >= 40 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
            border: 'none', color: 'white', cursor: wordCount >= 40 ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
          {loading ? '⏳ Analisando...' : '🤖 Analisar com IA'}
        </button>
      </div>

      {feedback && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: feedback.score >= 800 ? '#4caf50' : feedback.score >= 500 ? '#ffa726' : '#f44336' }}>
              {feedback.score}
            </div>
            <div>
              <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Nota Total / 1000</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {feedback.score >= 800 ? '🏆 Excelente! Texto bem elaborado.' : feedback.score >= 500 ? '📈 Bom potencial, com pontos a melhorar.' : '📚 Revise os fundamentos da dissertação argumentativa.'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {feedback.comments.map((c, i) => (
              <div key={i} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
