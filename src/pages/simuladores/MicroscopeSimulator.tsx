import { useState } from 'react';

interface Slide {
  id: string;
  name: string;
  description: string;
  emoji: string;
  details: string[];
}

const SLIDES: Slide[] = [
  {
    id: 'celula_animal',
    name: 'Célula Animal',
    emoji: '🔴',
    description: 'Célula eucariota sem parede celular e com centríolos.',
    details: ['Membrana plasmática', 'Núcleo com nucléolo', 'Mitocôndrias', 'Centríolos', 'Retículo endoplasmático'],
  },
  {
    id: 'celula_vegetal',
    name: 'Célula Vegetal',
    emoji: '🟢',
    description: 'Célula eucariota com parede celulósica e cloroplastos.',
    details: ['Parede celular (celulose)', 'Cloroplastos', 'Vacúolo central', 'Plasmodesmos', 'Membrana plasmática'],
  },
  {
    id: 'bacteria',
    name: 'Bactéria (Procarionte)',
    emoji: '🟡',
    description: 'Organismo unicelular procariótico sem núcleo definido.',
    details: ['Nucleoide (DNA circular)', 'Ribossomos 70S', 'Parede de peptidoglicano', 'Cápsula', 'Flagelos'],
  },
  {
    id: 'sangue',
    name: 'Sangue Humano',
    emoji: '🔵',
    description: 'Esfregaço do sangue: eritrócitos, leucócitos e plaquetas.',
    details: ['Eritrócitos (glóbulos vermelhos)', 'Leucócitos (neutrófilos)', 'Linfócitos', 'Plaquetas (trombócitos)', 'Plasma'],
  },
];

export function MicroscopeSimulator() {
  const [selectedSlide, setSelectedSlide] = useState<Slide>(SLIDES[0]);
  const [zoom, setZoom] = useState(10); // 10x, 40x, 100x, 400x
  const [focusOffset, setFocusOffset] = useState(0);

  const ZOOM_LEVELS = [10, 40, 100, 400];

  const blurAmount = Math.abs(focusOffset) * 0.3;
  const cellScale = zoom <= 10 ? 0.6 : zoom <= 40 ? 1.0 : zoom <= 100 ? 1.6 : 2.4;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🔬 Microscópio Virtual</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Selecione uma lâmina, ajuste o zoom e o foco micrométrico para observar as estruturas celulares.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Controles */}
        <div style={{ flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Seletor de Lâminas */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Selecionar Lâmina</h4>
            {SLIDES.map(s => (
              <button key={s.id} onClick={() => setSelectedSlide(s)}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: '6px',
                  background: selectedSlide.id === s.id ? 'var(--color-primary)22' : 'transparent',
                  border: selectedSlide.id === s.id ? '1px solid var(--color-primary)66' : '1px solid transparent',
                  color: 'var(--text-main)', cursor: 'pointer', marginBottom: '0.25rem', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
                }}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Objetiva (Zoom)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {ZOOM_LEVELS.map(z => (
                <button key={z} onClick={() => setZoom(z)}
                  style={{
                    padding: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
                    background: zoom === z ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                    color: zoom === z ? 'white' : 'var(--text-secondary)',
                    fontWeight: zoom === z ? 'bold' : 'normal', transition: 'all 0.2s',
                  }}>
                  {z}× — {z === 10 ? 'Varredura' : z === 40 ? 'Baixo' : z === 100 ? 'Médio' : 'Alto'}
                </button>
              ))}
            </div>
          </div>

          {/* Foco Micrométrico */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              Parafuso Micrométrico: {focusOffset > 0 ? `+${focusOffset}` : focusOffset}
            </h4>
            <input type="range" min="-10" max="10" value={focusOffset} onChange={e => setFocusOffset(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {Math.abs(focusOffset) < 2 ? '✅ Foco Nítido' : Math.abs(focusOffset) < 5 ? '⚠️ Levemente desfocado' : '❌ Desfocado'}
            </div>
          </div>
        </div>

        {/* Ocular do microscópio */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            aspectRatio: '1/1', maxWidth: '400px', width: '100%', borderRadius: '50%',
            border: '8px solid #333', overflow: 'hidden',
            background: 'radial-gradient(circle at center, #1a1a2e 60%, #000 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.5)',
            position: 'relative',
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease',
          }}>
            {/* Célula visual simplificada */}
            <div style={{ transform: `scale(${cellScale})`, transition: 'transform 0.4s ease' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>

                {/* Membrana externa */}
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: selectedSlide.id === 'celula_vegetal' 
                    ? 'radial-gradient(circle, #2e7d3244, #1b5e2044)' 
                    : selectedSlide.id === 'bacteria'
                      ? 'radial-gradient(circle, #f9a82544, #e65c0044)'
                      : selectedSlide.id === 'sangue'
                        ? 'radial-gradient(circle, #c6282822, #b7000044)'
                        : 'radial-gradient(circle, #5c6bc044, #3949ab44)',
                  border: `2px solid ${selectedSlide.id === 'celula_vegetal' ? '#4caf50' : selectedSlide.id === 'bacteria' ? '#ffa726' : '#5c6bc0'}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} >
                  {/* Núcleo */}
                  {selectedSlide.id !== 'bacteria' && (
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'radial-gradient(circle, #7986cb, #3949ab)',
                      border: '1.5px solid #7986cb',
                    }} />
                  )}
                  {selectedSlide.id === 'bacteria' && (
                    <div style={{ width: '30px', height: '8px', borderRadius: '4px', background: '#ffcc02' }} />
                  )}
                </div>

                {/* Mitocôndrias / Cloroplastos (pequenas formas) */}
                {[30, 90, 150, 210].map((deg, i) => (
                  <div key={i} style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: '14px', height: '7px', borderRadius: '4px',
                    background: selectedSlide.id === 'celula_vegetal' ? '#4caf50' : '#ef9a9a',
                    transform: `rotate(${deg}deg) translateX(45px)`,
                    transformOrigin: '0 0',
                    opacity: 0.8,
                  }} />
                ))}
              </div>
            </div>

            {/* Crosshair */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.15)' }} />

            {/* Zoom badge */}
            <div style={{ position: 'absolute', bottom: '12%', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
              {zoom}×
            </div>
          </div>

          {/* Detalhes da lâmina */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{selectedSlide.emoji}</span>
              <h4 style={{ color: 'var(--text-main)', margin: 0 }}>{selectedSlide.name}</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{selectedSlide.description}</p>
            <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Estruturas identificáveis em {zoom}×:</h5>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.7' }}>
              {selectedSlide.details.slice(0, zoom >= 400 ? 5 : zoom >= 100 ? 4 : zoom >= 40 ? 3 : 1).map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            {zoom < 40 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontStyle: 'italic' }}>Aumente o zoom para ver mais detalhes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
