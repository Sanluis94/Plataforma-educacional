import { useState, useEffect, useRef } from 'react';
import {
  VolumeX, Pause, Play, Eye, RotateCcw,
  Sparkles, Check, Accessibility
} from 'lucide-react';

interface AccessibilitySettings {
  fontSizePercent: 100 | 115 | 130;
  dyslexiaFont: boolean;
  focusMode: boolean;
}

const STORAGE_KEY = 'edu_interact_accessibility';

const defaultSettings: AccessibilitySettings = {
  fontSizePercent: 100,
  dyslexiaFont: false,
  focusMode: false,
};

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar preferências de acessibilidade:', e);
    }
    return defaultSettings;
  });

  // Text to speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply settings to DOM
  useEffect(() => {
    // 1. Font scale
    const root = document.documentElement;
    root.classList.remove('font-scale-100', 'font-scale-115', 'font-scale-130');
    root.classList.add(`font-scale-${settings.fontSizePercent}`);

    // 2. Dyslexia font
    if (settings.dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }

    // 3. Focus mode for ADHD / Autism
    if (settings.focusMode) {
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Speech synthesis handlers
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta a síntese de voz nativa.');
      return;
    }

    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    // Get text: check selection first, then main-content, then body
    let textToRead = window.getSelection()?.toString().trim();
    if (!textToRead) {
      const mainEl = document.getElementById('main-content') || document.querySelector('main') || document.body;
      textToRead = mainEl?.innerText?.slice(0, 4000) || '';
    }

    if (!textToRead) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    handleStopSpeech();
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          background: isOpen || settings.dyslexiaFont || settings.focusMode ? 'rgba(6, 182, 212, 0.15)' : 'none',
          border: isOpen || settings.dyslexiaFont || settings.focusMode ? '1px solid #06b6d4' : '1px solid var(--border-color)',
          color: isOpen || settings.dyslexiaFont || settings.focusMode ? '#06b6d4' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        title="Painel de Acessibilidade & Inclusão DUA"
        aria-label="Opções de acessibilidade e desenho universal para aprendizagem"
        aria-expanded={isOpen}
      >
        <Accessibility style={{ width: '1.15rem', height: '1.15rem' }} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className="slide-down"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            width: '320px',
            maxWidth: '90vw',
            background: 'var(--bg-card, #111827)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-card, rgba(6, 182, 212, 0.3))',
            borderRadius: '0.75rem',
            padding: '1.15rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontWeight: 700, fontSize: '0.85rem' }}>
              <Sparkles style={{ width: '1rem', height: '1rem' }} />
              Acessibilidade & Inclusão DUA
            </div>
            <button
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
              }}
              title="Restaurar padrões"
            >
              <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
              Padrão
            </button>
          </div>

          {/* Section 1: Tamanho do Texto */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Tamanho do Texto
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {([
                { val: 100, label: '100% (Padrão)', symbol: 'A' },
                { val: 115, label: '115% (Médio)', symbol: 'A+' },
                { val: 130, label: '130% (Grande)', symbol: 'A++' },
              ] as const).map((scale) => (
                <button
                  key={scale.val}
                  onClick={() => setSettings((s) => ({ ...s, fontSizePercent: scale.val }))}
                  style={{
                    padding: '0.4rem 0.5rem',
                    borderRadius: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: settings.fontSizePercent === scale.val ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                    background: settings.fontSizePercent === scale.val ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: settings.fontSizePercent === scale.val ? '#06b6d4' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  title={scale.label}
                >
                  {scale.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Tipografia Amigável para Dislexia */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setSettings((s) => ({ ...s, dyslexiaFont: !s.dyslexiaFont }))}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.5rem',
                border: settings.dyslexiaFont ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
                background: settings.dyslexiaFont ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: settings.dyslexiaFont ? '#a78bfa' : 'var(--text-main)' }}>
                  Fonte para Dislexia
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Aumenta espaçamento e peso das letras
                </div>
              </div>
              <div
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '0.25rem',
                  border: settings.dyslexiaFont ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
                  background: settings.dyslexiaFont ? '#8b5cf6' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {settings.dyslexiaFont && <Check style={{ width: '0.9rem', height: '0.9rem' }} />}
              </div>
            </button>
          </div>

          {/* Section 3: Modo Foco (TDAH e TEA) */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setSettings((s) => ({ ...s, focusMode: !s.focusMode }))}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.5rem',
                border: settings.focusMode ? '1px solid #10b981' : '1px solid var(--border-color)',
                background: settings.focusMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, color: settings.focusMode ? '#34d399' : 'var(--text-main)' }}>
                  <Eye style={{ width: '0.9rem', height: '0.9rem' }} />
                  Modo Foco (TDAH & TEA)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Elimina animações e excesso de estímulos visuais
                </div>
              </div>
              <div
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '0.25rem',
                  border: settings.focusMode ? '1px solid #10b981' : '1px solid var(--border-color)',
                  background: settings.focusMode ? '#10b981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {settings.focusMode && <Check style={{ width: '0.9rem', height: '0.9rem' }} />}
              </div>
            </button>
          </div>

          {/* Section 4: Leitor em Voz Alta (Web Speech API) */}
          <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Áudio-Guia / Leitor de Tela
              </div>
              {isSpeaking && (
                <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                  {isPaused ? 'Pausado' : 'Reproduzindo'}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleToggleSpeech}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid #06b6d4',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#06b6d4',
                  cursor: 'pointer',
                }}
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <Pause style={{ width: '0.85rem', height: '0.85rem' }} /> Pausar Leitura
                  </>
                ) : (
                  <>
                    <Play style={{ width: '0.85rem', height: '0.85rem' }} /> {isPaused ? 'Continuar' : 'Ler Tela / Seleção'}
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStopSpeech}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.4rem',
                    fontSize: '0.78rem',
                    border: '1px solid #ef4444',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                  title="Parar áudio"
                >
                  <VolumeX style={{ width: '0.9rem', height: '0.9rem' }} />
                </button>
              )}
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Dica: selecione qualquer parágrafo ou clique no botão para ouvir o texto com voz humanizada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
