import { useState, useEffect, useRef, useId, type ReactNode } from 'react';
import {
  VolumeX, Pause, Play, Eye, RotateCcw, Accessibility,
  Type, Contrast, WrapText, Underline,
} from 'lucide-react';
import './AccessibilityToolbar.css';

interface AccessibilitySettings {
  fontSizePercent: 100 | 115 | 130;
  dyslexiaFont: boolean;
  focusMode: boolean;
  /** WCAG 1.4.12 — espaçamento de texto ampliado */
  textSpacing: boolean;
  /** Alto contraste: texto de apoio e bordas reforçados */
  highContrast: boolean;
  /** WCAG 1.4.1 — links identificáveis sem depender da cor */
  underlineLinks: boolean;
}

type ToggleKey = Exclude<keyof AccessibilitySettings, 'fontSizePercent'>;

const STORAGE_KEY = 'edu_interact_accessibility';

const defaultSettings: AccessibilitySettings = {
  fontSizePercent: 100,
  dyslexiaFont: false,
  focusMode: false,
  textSpacing: false,
  highContrast: false,
  underlineLinks: false,
};

/** Classe aplicada ao <body> para cada opção */
const BODY_CLASSES: Record<ToggleKey, string> = {
  dyslexiaFont: 'dyslexia-font',
  focusMode: 'focus-mode-active',
  textSpacing: 'text-spacing-active',
  highContrast: 'high-contrast-active',
  underlineLinks: 'underline-links-active',
};

const OPTIONS: { key: ToggleKey; name: string; hint: string; icon: ReactNode }[] = [
  { key: 'dyslexiaFont', name: 'Fonte de leitura facilitada', hint: 'Atkinson Hyperlegible, com mais espaço entre letras — ajuda na dislexia e na baixa visão', icon: <Type size={18} aria-hidden="true" /> },
  { key: 'textSpacing', name: 'Espaçamento ampliado', hint: 'Mais espaço entre linhas, palavras e parágrafos', icon: <WrapText size={18} aria-hidden="true" /> },
  { key: 'highContrast', name: 'Alto contraste', hint: 'Reforça textos de apoio e contornos', icon: <Contrast size={18} aria-hidden="true" /> },
  { key: 'underlineLinks', name: 'Sublinhar links', hint: 'Identifica links sem depender da cor', icon: <Underline size={18} aria-hidden="true" /> },
  { key: 'focusMode', name: 'Reduzir distrações', hint: 'Remove animações e efeitos visuais (TDAH, TEA, sensibilidade a movimento)', icon: <Eye size={18} aria-hidden="true" /> },
];

const SCALES = [
  { val: 100, label: '100% (Padrão)', symbol: 'A' },
  { val: 115, label: '115% (Médio)', symbol: 'A+' },
  { val: 130, label: '130% (Grande)', symbol: 'A++' },
] as const;

function loadSettings(): AccessibilitySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Mescla com o padrão: preferências salvas antes das novas opções continuam válidas
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch (e) {
    console.warn('Erro ao carregar preferências de acessibilidade:', e);
  }
  return defaultSettings;
}

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  // Text to speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechMessage, setSpeechMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-100', 'font-scale-115', 'font-scale-130');
    root.classList.add(`font-scale-${settings.fontSizePercent}`);

    (Object.keys(BODY_CLASSES) as ToggleKey[]).forEach((key) => {
      document.body.classList.toggle(BODY_CLASSES[key], Boolean(settings[key]));
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Click outside / Escape to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechMessage('Seu navegador não oferece leitura em voz alta.');
      return;
    }
    setSpeechMessage('');

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

  const toggle = (key: ToggleKey) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  const hasActiveOptions = settings.fontSizePercent !== 100 || (Object.keys(BODY_CLASSES) as ToggleKey[]).some((key) => settings[key]);

  return (
    <div className="a11y-toolbar" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`a11y-trigger${hasActiveOptions ? ' a11y-trigger--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Opções de acessibilidade"
        aria-label="Opções de acessibilidade"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <Accessibility size={20} aria-hidden="true" />
        {hasActiveOptions && <span className="a11y-trigger__dot" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-label="Opções de acessibilidade"
          className="a11y-panel slide-down"
        >
          <div className="a11y-panel__header">
            <h2 className="a11y-panel__title">
              <Accessibility size={18} aria-hidden="true" />
              Acessibilidade
            </h2>
            <button type="button" className="a11y-reset" onClick={handleReset} aria-label="Restaurar opções de acessibilidade">
              <RotateCcw size={14} aria-hidden="true" />
              Padrão
            </button>
          </div>

          <fieldset className="a11y-group">
            <legend className="a11y-group__label">Tamanho do texto</legend>
            <div className="a11y-scale">
              {SCALES.map((scale) => (
                <button
                  key={scale.val}
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, fontSizePercent: scale.val }))}
                  title={scale.label}
                  aria-label={`Tamanho do texto: ${scale.label}`}
                  aria-pressed={settings.fontSizePercent === scale.val}
                >
                  {scale.symbol}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="a11y-group">
            <legend className="a11y-group__label">Leitura e visualização</legend>
            <div className="a11y-options">
              {OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className="a11y-option"
                  onClick={() => toggle(option.key)}
                  aria-pressed={settings[option.key]}
                >
                  <span className="a11y-option__icon">{option.icon}</span>
                  <span className="a11y-option__text">
                    <span className="a11y-option__name">{option.name}</span>
                    <span className="a11y-option__hint">{option.hint}</span>
                  </span>
                  <span className="a11y-switch" aria-hidden="true" />
                </button>
              ))}
            </div>
          </fieldset>

          <div className="a11y-speech">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className="a11y-group__label" style={{ margin: 0 }}>Leitura em voz alta</span>
              <span className="a11y-speech__status" role="status">
                {isSpeaking ? (isPaused ? 'Pausado' : 'Reproduzindo') : ''}
              </span>
            </div>
            <div className="a11y-speech__row">
              <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={handleToggleSpeech}>
                {isSpeaking && !isPaused ? (
                  <><Pause size={16} aria-hidden="true" /> Pausar leitura</>
                ) : (
                  <><Play size={16} aria-hidden="true" /> {isPaused ? 'Continuar' : 'Ler tela'}</>
                )}
              </button>
              {isSpeaking && (
                <button type="button" className="a11y-speech__stop" onClick={handleStopSpeech} title="Parar áudio" aria-label="Parar leitura em voz alta">
                  <VolumeX size={18} aria-hidden="true" />
                </button>
              )}
            </div>
            {speechMessage && <p className="a11y-speech__hint" role="alert">{speechMessage}</p>}
            <p className="a11y-speech__hint">
              Selecione um trecho ou use Ler tela para ouvir o texto com a voz disponível no navegador.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
