import React, { useState, useEffect } from 'react';
import { History, Play, Pause, Rewind } from 'lucide-react';

interface LabTimeTravelReplayProps {
  history: number[]; // Histórico de valores telemétricos gravados
  currentTime: number;
  onScrubToTime: (targetIndex: number) => void;
  isRunning: boolean;
}

export const LabTimeTravelReplay: React.FC<LabTimeTravelReplayProps> = ({
  history,
  currentTime,
  onScrubToTime,
  isRunning
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(history.length - 1);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  useEffect(() => {
    if (isRunning) {
      setSelectedIndex(history.length - 1);
    }
  }, [history.length, isRunning]);

  useEffect(() => {
    let timer: any;
    if (isReplaying && history.length > 0) {
      timer = setInterval(() => {
        setSelectedIndex(prev => {
          if (prev >= history.length - 1) {
            setIsReplaying(false);
            return history.length - 1;
          }
          const next = prev + 1;
          onScrubToTime(next);
          return next;
        });
      }, 80);
    }
    return () => clearInterval(timer);
  }, [isReplaying, history.length]);

  const handleSliderChange = (idx: number) => {
    setIsReplaying(false);
    setSelectedIndex(idx);
    onScrubToTime(idx);
  };

  const handleJumpStart = () => {
    setIsReplaying(false);
    setSelectedIndex(0);
    onScrubToTime(0);
  };

  const handleJumpLive = () => {
    setIsReplaying(false);
    const last = Math.max(0, history.length - 1);
    setSelectedIndex(last);
    onScrubToTime(last);
  };

  if (!history || history.length < 5) return null;

  const currentVal = history[selectedIndex] ?? 0;

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3 my-2 text-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <History className="w-4 h-4 text-[#E4683F]" />
          <span>Linha do Tempo Experimental (Time-Travel Replay)</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-mono text-slate-400">Ponto: #{selectedIndex + 1}/{history.length} ({currentTime.toFixed(1)}s)</span>
          <span className="font-mono text-sky-400 font-bold">Valor: {currentVal.toFixed(3)}</span>
        </div>
      </div>

      {/* Scrub Bar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleJumpStart}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          title="Início do Experimento"
        >
          <Rewind className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setIsReplaying(!isReplaying)}
          className={`p-1.5 rounded text-white ${isReplaying ? 'bg-amber-600' : 'bg-[#E4683F]'}`}
          title={isReplaying ? 'Pausar Replay' : 'Iniciar Replay'}
        >
          {isReplaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(1, history.length - 1)}
          value={selectedIndex}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full accent-[#E4683F] cursor-pointer h-1.5 bg-slate-800 rounded"
        />

        <button
          onClick={handleJumpLive}
          className={`px-2 py-0.5 rounded text-[11px] font-bold ${selectedIndex === history.length - 1 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
          title="Ir para o tempo presente"
        >
          AO VIVO
        </button>
      </div>
    </div>
  );
};
