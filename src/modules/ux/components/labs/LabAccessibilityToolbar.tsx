import React, { useState, useEffect } from 'react';
import { Eye, Volume2, VolumeX, Keyboard, Sun } from 'lucide-react';

interface LabAccessibilityToolbarProps {
  onToggleHighContrast: (active: boolean) => void;
  onToggleDyslexicFont: (active: boolean) => void;
  isHighContrast: boolean;
  isDyslexicFont: boolean;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onKeyboardShortcut: (action: string) => void;
}

export const LabAccessibilityToolbar: React.FC<LabAccessibilityToolbarProps> = ({
  onToggleHighContrast,
  onToggleDyslexicFont,
  isHighContrast,
  isDyslexicFont,
  isSoundMuted,
  onToggleSound,
  onKeyboardShortcut
}) => {
  const [showKeyHelp, setShowKeyHelp] = useState<boolean>(false);

  // Escuta atalhos de teclado globais no laboratório
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input ou textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        onKeyboardShortcut('toggle_play');
      } else if (e.key === 'r' || e.key === 'R') {
        onKeyboardShortcut('reset');
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleSound();
      } else if (e.key === 'n' || e.key === 'N') {
        onKeyboardShortcut('open_notebook');
      } else if (e.key === 'c' || e.key === 'C') {
        onKeyboardShortcut('open_compare');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleSound, onKeyboardShortcut]);

  return (
    <div className="flex items-center space-x-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs shadow-sm">
      <span className="text-[10px] font-bold uppercase text-slate-400 px-1 hidden sm:inline">
        Acessibilidade AAA:
      </span>

      {/* Alto Contraste */}
      <button
        onClick={() => onToggleHighContrast(!isHighContrast)}
        className={`px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
          isHighContrast
            ? 'bg-yellow-400 text-black font-bold shadow'
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
        title="Alternar Modo Alto Contraste (WCAG 2.2 AAA)"
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Contraste</span>
      </button>

      {/* Fonte Dislexia */}
      <button
        onClick={() => onToggleDyslexicFont(!isDyslexicFont)}
        className={`px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
          isDyslexicFont
            ? 'bg-emerald-600 text-white font-bold'
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
        title="Alternar Fonte Adaptada para Leitura e Dislexia"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Legibilidade</span>
      </button>

      {/* Som / Sonificação */}
      <button
        onClick={onToggleSound}
        className={`px-2 py-1 rounded flex items-center space-x-1 transition-colors ${
          !isSoundMuted
            ? 'bg-sky-600 text-white font-bold'
            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
        }`}
        title={isSoundMuted ? 'Ativar Sonificação Científica' : 'Mutar Som'}
      >
        {isSoundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        <span className="hidden md:inline">{isSoundMuted ? 'Mudo' : 'Áudio'}</span>
      </button>

      {/* Guia de Atalhos */}
      <div className="relative">
        <button
          onClick={() => setShowKeyHelp(!showKeyHelp)}
          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          title="Atalhos de Teclado Disponíveis"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {showKeyHelp && (
          <div className="absolute right-0 bottom-8 w-60 p-3 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl z-50 text-[11px] text-slate-300 space-y-1.5">
            <div className="font-bold text-white border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
              <span>Atalhos de Teclado</span>
              <span className="text-[10px] text-[#E4683F]">WCAG AAA</span>
            </div>
            <div className="flex justify-between"><span>Espaço</span><span className="font-mono text-slate-400">Pausar / Rodar</span></div>
            <div className="flex justify-between"><span>Tecla R</span><span className="font-mono text-slate-400">Reiniciar Simulação</span></div>
            <div className="flex justify-between"><span>Tecla M</span><span className="font-mono text-slate-400">Ligar/Desligar Áudio</span></div>
            <div className="flex justify-between"><span>Tecla N</span><span className="font-mono text-slate-400">Abrir Caderno Notas</span></div>
            <div className="flex justify-between"><span>Tecla C</span><span className="font-mono text-slate-400">Comparador A/B</span></div>
          </div>
        )}
      </div>
    </div>
  );
};
