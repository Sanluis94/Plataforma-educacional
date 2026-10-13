import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldAlert, Clock, X } from 'lucide-react';

interface SecureExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam?: () => void;
  labTitle: string;
  durationMinutes?: number;
  canFinish?: boolean;
  onFinishExam: (incidentsCount: number) => boolean | void | Promise<boolean | void>;
}

/** Browser focus events are observations, not proof of misconduct. */
export function SecureExamModal({ isOpen, onClose, onStartExam, labTitle, durationMinutes = 30, canFinish = true, onFinishExam }: SecureExamModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [incidents, setIncidents] = useState<string[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const deadline = useRef(0);
  const incidentsRef = useRef<string[]>([]);
  const finishing = useRef(false);
  const expired = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const ownsFullscreen = useRef(false);
  const mounted = useRef(true);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    setSaving(true);
    setMessage('');
    try {
      if (await onFinishExam(incidentsRef.current.length) === false) {
        setMessage('As respostas ainda não foram salvas. Tente finalizar novamente.');
        return;
      }
      if (mounted.current) onClose();
    } catch {
      setMessage('Não foi possível salvar as respostas. Tente finalizar novamente.');
    } finally {
      finishing.current = false;
      if (mounted.current) setSaving(false);
    }
  }, [onClose, onFinishExam]);

  useEffect(() => {
    if (!isOpen || started) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !starting) onClose();
      if (event.key !== 'Tab') return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!buttons?.length) return;
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previousFocus?.focus(); };
  }, [isOpen, started, starting, onClose]);

  useEffect(() => {
    if (!isOpen || !started) return;
    const blur = () => {
      const log = `${new Date().toLocaleTimeString('pt-BR')}: a janela perdeu o foco.`;
      incidentsRef.current = [...incidentsRef.current, log];
      setIncidents(incidentsRef.current);
    };
    const fullscreenChange = () => setFullscreen(!!document.fullscreenElement);
    window.addEventListener('blur', blur);
    document.addEventListener('fullscreenchange', fullscreenChange);
    return () => { window.removeEventListener('blur', blur); document.removeEventListener('fullscreenchange', fullscreenChange); };
  }, [isOpen, started]);

  useEffect(() => {
    if (!isOpen || !started) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0 && !expired.current) { expired.current = true; void finish(); }
    };
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, started, finish]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (ownsFullscreen.current && document.fullscreenElement && document.exitFullscreen) void Promise.resolve(document.exitFullscreen()).catch(() => {});
    };
  }, []);

  const start = async () => {
    if (starting) return;
    setStarting(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        ownsFullscreen.current = true;
        setFullscreen(!!document.fullscreenElement);
      }
    } catch {
      setMessage('Tela cheia indisponível. Você pode continuar a prática nesta janela.');
    }
      if (!mounted.current) {
        if (ownsFullscreen.current && document.fullscreenElement && document.exitFullscreen) void Promise.resolve(document.exitFullscreen()).catch(() => {});
        return;
      }
      deadline.current = Date.now() + durationMinutes * 60_000;
      expired.current = false;
      onStartExam?.();
      setStarted(true);
      setStarting(false);
  };

  if (!isOpen) return null;
  if (!started) return <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="timed-practice-title" aria-describedby="timed-practice-description" className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
      <div className="flex items-center justify-between gap-3">
        <h3 id="timed-practice-title" className="font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5" />Avaliação com tempo</h3>
        <button disabled={starting} onClick={onClose} aria-label="Fechar avaliação com tempo"><X className="w-5 h-5" /></button>
      </div>
      <p className="my-3">{labTitle}</p>
      <p id="timed-practice-description" className="text-sm text-slate-300">Você terá {durationMinutes} minutos para responder às perguntas da bancada. Ao terminar o tempo, as respostas serão enviadas; questões sem resposta contam como incorretas. A tela cheia é opcional. Perdas de foco são exibidas apenas nesta sessão e não comprovam irregularidade.</p>
      <button disabled={starting} onClick={() => { void start(); }} className="mt-4 w-full py-2.5 bg-rose-600 rounded-lg font-bold">{starting ? 'Preparando…' : 'Iniciar e responder às perguntas'}</button>
    </div>
  </div>;

  return <section aria-label="Sessão de avaliação com tempo" className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" />Tempo restante <span role="timer" className="font-mono font-bold">{String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:{String(secondsRemaining % 60).padStart(2, '0')}</span>{fullscreen && ' · Tela cheia ativa'}</p>
      <div className="flex flex-wrap gap-2">
        <button disabled={saving || (!canFinish && secondsRemaining > 0)} onClick={() => { void finish(); }} className="px-3 py-2 bg-emerald-700 rounded text-sm">{saving ? 'Salvando respostas…' : 'Finalizar e salvar respostas'}</button>
        <button disabled={saving} onClick={onClose} className="px-3 py-2 bg-slate-700 rounded text-sm">Sair sem finalizar</button>
      </div>
    </div>
    <p className="text-xs text-slate-300">Responda às perguntas abaixo. {incidents.length} perda(s) de foco observada(s) nesta sessão. Sair mantém suas respostas na tela, sem registrar uma entrega.</p>
    {incidents.length > 0 && <details className="mt-2 text-xs"><summary>Ver registro de foco desta sessão</summary>{incidents.map((entry, index) => <p key={index}>{entry}</p>)}</details>}
    {message && <p role="alert" className="mt-2 text-sm text-amber-300">{message}</p>}
  </section>;
}
