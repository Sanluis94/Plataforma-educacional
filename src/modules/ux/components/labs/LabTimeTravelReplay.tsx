import { useEffect, useRef, useState } from 'react';
import { History, Play, Pause, Rewind } from 'lucide-react';

interface LabTimeTravelReplayProps {
  history: number[];
  currentTime: number;
  sampleTimes?: number[];
  onScrubToTime: (targetIndex: number) => void;
  isRunning: boolean;
}

export function LabTimeTravelReplay({ history, currentTime, sampleTimes, onScrubToTime, isRunning }: LabTimeTravelReplayProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [replaying, setReplaying] = useState(false);
  const selectedRef = useRef(Math.max(0, history.length - 1));
  const index = isRunning || selected === null ? Math.max(0, history.length - 1) : Math.min(selected, Math.max(0, history.length - 1));
  useEffect(() => { selectedRef.current = index; }, [index]);
  useEffect(() => {
    if (!replaying || isRunning || !history.length) return;
    const timer = window.setInterval(() => {
      const next = Math.min(history.length - 1, selectedRef.current + 1);
      selectedRef.current = next;
      setSelected(next);
      onScrubToTime(next);
      if (next === history.length - 1) setReplaying(false);
    }, 100);
    return () => window.clearInterval(timer);
  }, [replaying, isRunning, history.length, onScrubToTime]);
  const jump = (target: number) => { setReplaying(false); selectedRef.current = target; setSelected(target); onScrubToTime(target); };
  const toggleReplay = () => {
    if (replaying) { setReplaying(false); return; }
    if (index === history.length - 1) jump(0);
    setReplaying(true);
  };
  if (history.length < 5) return null;
  const time = sampleTimes?.[index];
  return <section aria-label="Reprodução das amostras registradas" className="bg-slate-900/90 border border-slate-700 rounded-lg p-3 my-2 text-slate-200">
    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
      <span className="flex items-center gap-2 font-semibold"><History className="w-4 h-4" />Rever amostras do experimento</span>
      <span className="font-mono">Amostra {index + 1}/{history.length} · {time === undefined ? `sessão: ${currentTime.toFixed(2)}` : time.toFixed(2)} s · Valor: {(history[index] ?? 0).toFixed(3)}</span>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => jump(0)} aria-label="Ir à primeira amostra" className="p-2"><Rewind className="w-4 h-4" /></button>
      <button onClick={toggleReplay} aria-label={replaying ? 'Pausar reprodução' : 'Reproduzir amostras'} className="p-2 bg-orange-700 rounded">{replaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
      <input type="range" aria-label="Amostra do experimento" min={0} max={history.length - 1} value={index} onChange={event => jump(Number(event.target.value))} className="w-full min-w-0 accent-orange-500" />
      <button onClick={() => jump(history.length - 1)} className="p-2 text-xs">Última</button>
    </div>
  </section>;
}
