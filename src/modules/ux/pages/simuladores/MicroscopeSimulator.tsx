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

const renderCellContent = (slideId: string, zoomLevel: number) => {
  return (
    <svg width="240" height="240" viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="animal-cyto" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4338ca" stopOpacity="0.2" />
          <stop offset="85%" stopColor="#6366f1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.65" />
        </radialGradient>
        <radialGradient id="animal-nuc" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="70%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </radialGradient>
        <radialGradient id="vegetal-cyto" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#065f46" stopOpacity="0.15" />
          <stop offset="80%" stopColor="#059669" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id="bacteria-cyto" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#78350f" stopOpacity="0.15" />
          <stop offset="85%" stopColor="#d97706" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {slideId === 'celula_animal' && (
        <g>
          {zoomLevel === 10 ? (
            <g transform="scale(0.55) translate(40, 40)">
              <g transform="translate(80, 80)">
                <circle cx="0" cy="0" r="45" fill="url(#animal-cyto)" stroke="#818cf8" strokeWidth="1.5" />
                <circle cx="-5" cy="-5" r="15" fill="url(#animal-nuc)" stroke="#0891b2" strokeWidth="1" />
              </g>
              <g transform="translate(160, 50)">
                <circle cx="0" cy="0" r="40" fill="url(#animal-cyto)" stroke="#818cf8" strokeWidth="1.5" />
                <circle cx="2" cy="-2" r="13" fill="url(#animal-nuc)" stroke="#0891b2" strokeWidth="1" />
              </g>
              <g transform="translate(40, 140)">
                <circle cx="0" cy="0" r="38" fill="url(#animal-cyto)" stroke="#818cf8" strokeWidth="1.5" />
                <circle cx="-3" cy="3" r="12" fill="url(#animal-nuc)" stroke="#0891b2" strokeWidth="1" />
              </g>
              <g transform="translate(140, 140)">
                <circle cx="0" cy="0" r="42" fill="url(#animal-cyto)" stroke="#818cf8" strokeWidth="1.5" />
                <circle cx="0" cy="-4" r="14" fill="url(#animal-nuc)" stroke="#0891b2" strokeWidth="1" />
              </g>
            </g>
          ) : (
            <g transform="translate(100, 100)">
              <circle cx="0" cy="0" r="80" fill="url(#animal-cyto)" stroke="#8b5cf6" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.35))' }} />
              
              <g transform="translate(-45, -35) rotate(25)" style={{ opacity: zoomLevel >= 40 ? 1 : 0 }}>
                <rect x="-16" y="-8" width="32" height="16" rx="8" fill="#ef5350" stroke="#ff8a80" strokeWidth="1" />
                <path d="M-10,0 Q-5,-4 0,0 T10,0" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
              </g>
              <g transform="translate(45, 45) rotate(-35)" style={{ opacity: zoomLevel >= 40 ? 1 : 0 }}>
                <rect x="-16" y="-8" width="32" height="16" rx="8" fill="#ef5350" stroke="#ff8a80" strokeWidth="1" />
                <path d="M-10,0 Q-5,-4 0,0 T10,0" fill="none" stroke="#fff" strokeWidth="1" opacity="0.7" />
              </g>

              <g style={{ opacity: zoomLevel >= 100 ? 0.9 : 0.4 }}>
                <path d="M-50,15 C-40,30 -20,30 -10,15 C0,0 20,0 30,15 C40,30 50,30 60,15" fill="none" stroke="#a21caf" strokeWidth="3" opacity="0.7" />
                <path d="M-45,22 C-38,34 -22,34 -13,22 C-3,10 17,10 27,22 C37,34 45,34 55,22" fill="none" stroke="#a21caf" strokeWidth="2" opacity="0.5" />
                {zoomLevel >= 100 && (
                  <g fill="#fff">
                    <circle cx="-45" cy="20" r="1.5" />
                    <circle cx="-30" cy="26" r="1.5" />
                    <circle cx="-10" cy="18" r="1.5" />
                    <circle cx="10" cy="8" r="1.5" />
                    <circle cx="25" cy="18" r="1.5" />
                    <circle cx="45" cy="26" r="1.5" />
                  </g>
                )}
              </g>

              <circle cx="-35" cy="30" r="5" fill="#f59e0b" style={{ opacity: zoomLevel >= 40 ? 0.8 : 0 }} />
              <circle cx="50" cy="-30" r="6" fill="#10b981" style={{ opacity: zoomLevel >= 40 ? 0.8 : 0 }} />

              <g transform="translate(0, -10)" style={{ transform: zoomLevel === 400 ? 'scale(1.35) translate(0, 5px)' : 'none', transition: 'transform 0.4s' }}>
                <circle cx="0" cy="0" r="28" fill="url(#animal-nuc)" stroke="#06b6d4" strokeWidth="2" />
                <circle cx="5" cy="-5" r="9" fill="#0c4a6e" />
                {zoomLevel >= 100 && (
                  <path d="M-15,-5 Q-5,-10 0,-15 M-10,12 Q5,5 15,10 M-18,5 Q-8,0 -5,8" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                )}
              </g>

              <g transform="translate(-25, 45)" style={{ opacity: zoomLevel >= 100 ? 0.85 : 0 }}>
                <rect x="-8" y="-3" width="16" height="6" fill="none" stroke="#f472b6" strokeWidth="2" />
                <rect x="-3" y="-8" width="6" height="16" fill="none" stroke="#f472b6" strokeWidth="2" transform="rotate(90)" />
              </g>
            </g>
          )}
        </g>
      )}

      {slideId === 'celula_vegetal' && (
        <g>
          {zoomLevel === 10 ? (
            <g transform="scale(0.55) translate(40, 40)">
              <polygon points="90,15 150,45 150,115 90,145 30,115 30,45" fill="url(#vegetal-cyto)" stroke="#059669" strokeWidth="2" />
              <circle cx="90" cy="80" r="25" fill="rgba(33,150,243,0.1)" stroke="#2196f3" strokeWidth="1.5" strokeDasharray="2" />
              <circle cx="120" cy="95" r="12" fill="url(#animal-nuc)" stroke="#0891b2" strokeWidth="1" />

              <polygon points="150,45 210,15 270,45 270,115 210,145 150,115" fill="url(#vegetal-cyto)" stroke="#059669" strokeWidth="2" />
              <polygon points="30,115 90,145 90,215 30,245 -30,215 -30,145" fill="url(#vegetal-cyto)" stroke="#059669" strokeWidth="2" />
            </g>
          ) : (
            <g transform="translate(100, 100)">
              <polygon points="0,-85 75,-45 75,45 0,85 -75,45 -75,-45" fill="url(#vegetal-cyto)" stroke="#10b981" strokeWidth="4.5" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }} />
              <polygon points="0,-80 70,-42 70,42 0,80 -70,42 -70,-42" fill="none" stroke="#059669" strokeWidth="1.5" opacity="0.6" />

              <path d="M-45,-25 C-15,-55 15,-55 45,-25 C55,10 45,45 0,55 C-45,45 -55,10 -45,-25 Z" fill="rgba(14,165,233,0.12)" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="3 3" />
              {zoomLevel >= 100 && (
                <g fill="#38bdf8" opacity="0.6">
                  <circle cx="-15" cy="-10" r="1.5" />
                  <circle cx="15" cy="15" r="1.5" />
                  <circle cx="0" cy="-25" r="1" />
                </g>
              )}

              <g style={{ opacity: zoomLevel >= 40 ? 1 : 0 }}>
                <g transform="translate(-55, -45) rotate(35)">
                  <ellipse cx="0" cy="0" rx="14" ry="9" fill="#047857" stroke="#34d399" strokeWidth="1" />
                  {zoomLevel >= 100 && (
                    <g stroke="#6ee7b7" strokeWidth="1" opacity="0.8">
                      <line x1="-8" y1="-3" x2="-8" y2="3" />
                      <line x1="-3" y1="-4" x2="-3" y2="4" />
                      <line x1="2" y1="-4" x2="2" y2="4" />
                      <line x1="7" y1="-3" x2="7" y2="3" />
                    </g>
                  )}
                </g>
                <g transform="translate(-60, 15) rotate(-55)">
                  <ellipse cx="0" cy="0" rx="14" ry="9" fill="#047857" stroke="#34d399" strokeWidth="1" />
                  {zoomLevel >= 100 && (
                    <g stroke="#6ee7b7" strokeWidth="1" opacity="0.8">
                      <line x1="-5" y1="-3" x2="-5" y2="3" />
                      <line x1="0" y1="-4" x2="0" y2="4" />
                      <line x1="5" y1="-3" x2="5" y2="3" />
                    </g>
                  )}
                </g>
                <g transform="translate(55, -40) rotate(-20)">
                  <ellipse cx="0" cy="0" rx="13" ry="8" fill="#047857" stroke="#34d399" strokeWidth="1" />
                </g>
                <g transform="translate(30, 55) rotate(45)">
                  <ellipse cx="0" cy="0" rx="14" ry="9" fill="#047857" stroke="#34d399" strokeWidth="1" />
                </g>
              </g>

              <g transform="translate(42, 18)" style={{ transform: zoomLevel === 400 ? 'scale(1.4) translate(10px, 5px)' : 'none', transition: 'transform 0.4s' }}>
                <circle cx="0" cy="0" r="18" fill="url(#animal-nuc)" stroke="#0284c7" strokeWidth="1.5" />
                <circle cx="3" cy="-3" r="6" fill="#0c4a6e" />
              </g>
            </g>
          )}
        </g>
      )}

      {slideId === 'bacteria' && (
        <g>
          {zoomLevel === 10 ? (
            <g transform="scale(0.55) translate(40, 40)">
              <g transform="translate(60, 60) rotate(15)">
                <rect x="-35" y="-18" width="70" height="36" rx="18" fill="url(#bacteria-cyto)" stroke="#d97706" strokeWidth="1.5" />
              </g>
              <g transform="translate(150, 80) rotate(-35)">
                <rect x="-35" y="-18" width="70" height="36" rx="18" fill="url(#bacteria-cyto)" stroke="#d97706" strokeWidth="1.5" />
              </g>
              <g transform="translate(90, 140) rotate(70)">
                <rect x="-35" y="-18" width="70" height="36" rx="18" fill="url(#bacteria-cyto)" stroke="#d97706" strokeWidth="1.5" />
              </g>
            </g>
          ) : (
            <g transform="translate(100, 100)">
              <rect x="-65" y="-38" width="130" height="76" rx="38" fill="url(#bacteria-cyto)" stroke="#f59e0b" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.4))' }} />
              <rect x="-60" y="-33" width="120" height="66" rx="33" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.5" />

              <path d="M-65,0 C-90,-10 -105,15 -130,5 C-145,-5 -155,10 -175,0" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />

              <g stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
                <line x1="-30" y1="-38" x2="-35" y2="-46" />
                <line x1="0" y1="-38" x2="0" y2="-47" />
                <line x1="30" y1="-38" x2="35" y2="-46" />
                <line x1="-30" y1="38" x2="-35" y2="46" />
                <line x1="0" y1="38" x2="0" y2="47" />
                <line x1="30" y1="38" x2="35" y2="46" />
                <line x1="65" y1="-10" x2="74" y2="-15" />
                <line x1="65" y1="10" x2="74" y2="15" />
                <line x1="60" y1="-25" x2="68" y2="-32" />
                <line x1="60" y1="25" x2="68" y2="32" />
              </g>

              <path d="M-40,-5 C-40,-25 -10,-30 5,-15 C20,0 40,-5 40,15 C40,30 10,25 -5,15 C-20,5 -40,15 -40,-5 Z M-25,-8 C-10,-5 10,-20 20,-8 C30,4 15,20 0,10 C-15,0 -20,20 -25,-8 Z" fill="none" stroke="#26a69a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              <g style={{ opacity: zoomLevel >= 40 ? 1 : 0 }}>
                <circle cx="-30" cy="-20" r="7" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
                <circle cx="35" cy="20" r="5.5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
              </g>

              <g fill="#fff" opacity="0.8" style={{ display: zoomLevel >= 100 ? 'block' : 'none' }}>
                <circle cx="-42" cy="18" r="1.5" />
                <circle cx="-15" cy="-22" r="1.5" />
                <circle cx="22" cy="-18" r="1.5" />
                <circle cx="35" cy="-5" r="1.5" />
                <circle cx="10" cy="22" r="1.5" />
                <circle cx="-10" cy="2" r="1.5" />
              </g>
            </g>
          )}
        </g>
      )}

      {slideId === 'sangue' && (
        <g>
          {zoomLevel === 10 ? (
            <g transform="scale(0.55) translate(40, 40)">
              {[
                { x: 40, y: 40 }, { x: 90, y: 35 }, { x: 140, y: 45 },
                { x: 60, y: 90 }, { x: 110, y: 85 }, { x: 160, y: 100 },
                { x: 35, y: 140 }, { x: 85, y: 135 }, { x: 135, y: 150 }
              ].map((pos, idx) => (
                <g key={idx} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle cx="0" cy="0" r="18" fill="#c62828" stroke="#8e0000" strokeWidth="1" />
                  <circle cx="0" cy="0" r="8" fill="#e53935" opacity="0.6" />
                </g>
              ))}
            </g>
          ) : (
            <g transform="translate(100, 100)">
              <g transform="translate(0, -10)">
                <circle cx="0" cy="0" r="32" fill="#c62828" stroke="#8e0000" strokeWidth="2" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }} />
                <circle cx="0" cy="0" r="14" fill="#ef5350" opacity="0.75" />
              </g>
              <g transform="translate(-50, 45) rotate(20) scale(0.85)">
                <circle cx="0" cy="0" r="32" fill="#c62828" stroke="#8e0000" strokeWidth="2" />
                <circle cx="0" cy="0" r="14" fill="#ef5350" opacity="0.75" />
              </g>
              <g transform="translate(50, -45) rotate(-35) scale(0.9)">
                <circle cx="0" cy="0" r="32" fill="#c62828" stroke="#8e0000" strokeWidth="2" />
                <circle cx="0" cy="0" r="14" fill="#ef5350" opacity="0.75" />
              </g>
              <g transform="translate(55, 35) rotate(15) scale(0.75)">
                <circle cx="0" cy="0" r="32" fill="#c62828" stroke="#8e0000" strokeWidth="2" />
                <circle cx="0" cy="0" r="14" fill="#ef5350" opacity="0.75" />
              </g>

              <g transform="translate(-40, -40)" style={{ display: zoomLevel >= 40 ? 'block' : 'none' }}>
                <circle cx="0" cy="0" r="36" fill="rgba(217, 70, 239, 0.15)" stroke="#d946ef" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px rgba(217,70,239,0.3))' }} />
                <g fill="#701a75" opacity="0.9">
                  <circle cx="-8" cy="-5" r="9" />
                  <circle cx="8" cy="-5" r="8" />
                  <circle cx="0" cy="8" r="9" />
                  <path d="M-8,-5 L8,-5 L0,8 Z" stroke="#701a75" strokeWidth="4" />
                </g>
                {zoomLevel >= 100 && (
                  <g fill="#f472b6" opacity="0.5">
                    <circle cx="-18" cy="-12" r="1.5" />
                    <circle cx="-22" cy="5" r="1" />
                    <circle cx="18" cy="12" r="1.5" />
                    <circle cx="22" cy="-6" r="1" />
                    <circle cx="5" cy="18" r="1.5" />
                  </g>
                )}
              </g>

              <g style={{ display: zoomLevel >= 100 ? 'block' : 'none' }}>
                <g transform="translate(10, 50) scale(0.9)">
                  <path d="M0,-8 L2,-2 L8,-2 L3,2 L5,8 L0,4 L-5,8 L-3,2 L-8,-2 L-2,-2 Z" fill="#b91c1c" opacity="0.8" />
                </g>
                <g transform="translate(-80, 5) scale(0.7) rotate(45)">
                  <path d="M0,-8 L2,-2 L8,-2 L3,2 L5,8 L0,4 L-5,8 L-3,2 L-8,-2 L-2,-2 Z" fill="#b91c1c" opacity="0.8" />
                </g>
              </g>
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

export function MicroscopeSimulator({ mode: _mode = 'microscopy', labTitle, onComplete }: { mode?: string; labTitle?: string; labId?: string; onComplete?: (score: number) => void }) {
  const [selectedSlide, setSelectedSlide] = useState<Slide>(SLIDES[0]);
  const [zoom, setZoom] = useState(10); // 10x, 40x, 100x, 400x
  const [focusOffset, setFocusOffset] = useState(0);

  const ZOOM_LEVELS = [10, 40, 100, 400];

  const blurAmount = Math.abs(focusOffset) * 0.3;
  const cellScale = zoom <= 10 ? 0.6 : zoom <= 40 ? 1.0 : zoom <= 100 ? 1.6 : 2.4;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🔬 {labTitle || 'Microscópio Virtual'}</h2>
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
          }}>
            {/* Célula visual - blurAmount applied only to content */}
            <div style={{ 
              transform: `scale(${cellScale})`, 
              transition: 'transform 0.4s ease',
              filter: `blur(${blurAmount}px)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {renderCellContent(selectedSlide.id, zoom)}
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

            {/* AI Diagnostics Box */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <div style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, marginBottom: '0.2rem' }}>🤖 DICA DA IA BIOLÓGICA</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                {focusOffset === 0 
                  ? `Foco micrométrico nítido! Em ${zoom}× você está observando a amostra de ${selectedSlide.name}.`
                  : 'Ajuste o controle de foco micrométrico para remover a distorção da imagem.'}
              </p>
            </div>
          </div>
        </div>
      </div>
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
