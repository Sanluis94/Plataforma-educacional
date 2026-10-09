import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react';

interface SecureExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  labTitle: string;
  durationMinutes?: number;
  onFinishExam: (incidentsCount: number) => void;
}

export const SecureExamModal: React.FC<SecureExamModalProps> = ({
  isOpen,
  onClose,
  labTitle,
  durationMinutes = 30,
  onFinishExam
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);
  const [incidentLogs, setIncidentLogs] = useState<string[]>([]);
  const [isFullscreenActive, setIsFullscreenActive] = useState<boolean>(false);
  const [examStarted, setExamStarted] = useState<boolean>(false);

  // Monitora troca de janelas ou abas (blur)
  useEffect(() => {
    if (!examStarted) return;

    const handleBlur = () => {
      const log = `[${new Date().toLocaleTimeString()}] Perda de foco: Janela ou aba foi alterada.`;
      setIncidentLogs(prev => [...prev, log]);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [examStarted]);

  // Temporizador regressivo
  useEffect(() => {
    let timer: any;
    if (examStarted && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, secondsRemaining]);

  const handleStartExam = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
        setIsFullscreenActive(true);
      }
    } catch (_e) {}
    setExamStarted(true);
  };

  const handleComplete = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (_e) {}
    onFinishExam(incidentLogs.length);
    onClose();
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Modo Avaliação Segura (Lockdown)</h3>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{labTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!examStarted ? (
          <div className="space-y-4 my-2 text-xs">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-amber-200 space-y-1.5">
              <div className="font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Protocolo de Integridade Acadêmica:</span>
              </div>
              <p className="leading-relaxed text-slate-300">
                1. A avaliação será executada em tela cheia obrigatória.<br />
                2. Trocas de aba, saída de janela ou atalhos de sistema serão auditados.<br />
                3. O tempo limite desta prova é de <strong>{durationMinutes} minutos</strong>.
              </p>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-[#E4683F] hover:opacity-90 font-bold text-white rounded-lg flex items-center justify-center space-x-2 shadow-lg"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar em Modo Seguro e Iniciar Prova</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {/* Timer Banner */}
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-center space-x-2 text-slate-300 text-xs">
                <Clock className="w-4 h-4 text-[#E4683F]" />
                <span>Tempo Restante {isFullscreenActive ? '(Tela Cheia Ativa)' : ''}:</span>
              </div>
              <span className="font-mono text-xl font-bold text-[#E4683F]">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Incidents Auditor */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Auditoria de Foco em Tempo Real:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${incidentLogs.length === 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                  {incidentLogs.length === 0 ? 'Zero Ocorrências' : `${incidentLogs.length} Ocorrência(s)`}
                </span>
              </div>
              <div className="max-h-24 overflow-y-auto text-[11px] font-mono text-slate-400 space-y-1">
                {incidentLogs.length === 0 ? (
                  <p className="text-emerald-500">Nenhuma irregularidade detectada na sessão.</p>
                ) : (
                  incidentLogs.map((log, i) => <p key={i} className="text-rose-400">{log}</p>)
                )}
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs rounded-lg flex items-center justify-center space-x-1.5 shadow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar Avaliação e Salvar Respostas</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
