import { useState } from 'react';
import { analyzeEssayWithGemini } from '../../../core/services/geminiService';

const COMPETENCIAS = [
  { id: 1, name: 'Domínio da Língua Escrita', desc: 'Gramática, ortografia, pontuação e uso culto da língua.' },
  { id: 2, name: 'Compreensão do Tema', desc: 'Pertinência ao tema proposto e respeito às limitações temáticas.' },
  { id: 3, name: 'Organização Argumentativa', desc: 'Coesão, coerência e desenvolvimento dos argumentos com repertório sociocultural.' },
  { id: 4, name: 'Conhecimento dos Mecanismos Linguísticos', desc: 'Conectivos, progressão textual e articulação das ideias.' },
  { id: 5, name: 'Proposta de Intervenção', desc: 'Proposta detalhada, respeitando os direitos humanos e a realidade social.' },
];

export function EssayModule({ mode: _mode = 'structure', labTitle, onComplete }: { mode?: string; labTitle?: string; labId?: string; onComplete?: (score: number) => void }) {
  const [essay, setEssay] = useState('');
  const [theme, setTheme] = useState('A influência das redes sociais na saúde mental dos jovens');
  const [feedback, setFeedback] = useState<null | { score: number; comments: string[] }>(null);
  const [loading, setLoading] = useState(false);

  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

  const analyzeEssay = async () => {
    if (wordCount < 40) return;
    setLoading(true);
    const result = await analyzeEssayWithGemini(theme, essay);
    setFeedback(result);
    setLoading(false);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>✍️ {labTitle || 'Redação Orientada por IA'}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Escreva sua redação abaixo e receba análise baseada nas 5 competências do ENEM.</p>

      {/* Guia de Competências ENEM */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '0.25rem' }}>
        {COMPETENCIAS.map(c => (
          <div key={c.id} style={{ flex: '0 0 180px', padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#06b6d4', fontSize: '0.75rem', fontWeight: 700 }}>C{c.id} — {c.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>{c.desc}</div>
          </div>
        ))}
      </div>

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
      {onComplete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
          <button
            onClick={() => onComplete(100)}
            className="btn-gradient"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: '#10b981', borderColor: '#10b981' }}
          >
            ✓ Concluir Laboratório
          </button>
        </div>
      )}
    </div>
  );
}
