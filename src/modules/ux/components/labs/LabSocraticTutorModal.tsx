import React, { useState, useEffect } from 'react';
import { Bot, Send, Volume2, VolumeX, Mic, MicOff, X, Sparkles } from 'lucide-react';

interface LabSocraticTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  labTitle: string;
  topic: string;
  parameters: Record<string, number>;
  telemetry: Record<string, number>;
}

interface ChatMessage {
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
}

export const LabSocraticTutorModal: React.FC<LabSocraticTutorModalProps> = ({
  isOpen,
  onClose,
  labTitle,
  topic,
  parameters,
  telemetry
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Inicializa a primeira pergunta socrática do tutor
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const pEntries = Object.entries(parameters);
      const tEntries = Object.entries(telemetry || {});
      const firstParamStr = pEntries.length > 0 ? `${pEntries[0][0]} = ${pEntries[0][1]}` : 'parâmetros iniciais';
      const telemStr = tEntries.length > 0 ? ` (Leitura atual de ${tEntries[0][0]}: ${Number(tEntries[0][1]).toFixed(2)})` : '';
      
      const welcomeMsg: ChatMessage = {
        sender: 'tutor',
        text: `Olá! Sou seu Tutor Socrático de IA para o laboratório "${labTitle}". Vejo que você configurou ${firstParamStr}${telemStr}. Antes de alterar os valores, o que você espera que aconteça com as variáveis de resposta ao aumentarmos essa magnitude? Que lei física ou princípio rege essa transição?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMsg]);
      speakText(welcomeMsg.text);
    }
  }, [isOpen, labTitle]);

  const speakText = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (_e) {}
  };

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;

    const studentMsg: ChatMessage = {
      sender: 'student',
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, studentMsg]);
    setInputVal('');

    // Gera resposta reflexiva socrática inteligente
    setTimeout(() => {
      let reply = '';
      const lower = studentMsg.text.toLowerCase();
      if (lower.includes('aumenta') || lower.includes('cresce') || lower.includes('sobe')) {
        reply = `Interessante hipótese! Se a resposta cresce com essa perturbação, a relação é direta ou exponencial? Observe os dados de telemetria agora e me diga: o gráfico confirma uma reta linear ou apresenta saturação assintótica?`;
      } else if (lower.includes('diminui') || lower.includes('cai') || lower.includes('reduz')) {
        reply = `Muito bem pensado! Para onde vai a energia ou a massa conservada nesse processo para gerar essa diminuição? Qual grandeza compensa essa variação no sistema?`;
      } else {
        reply = `Excelente raciocínio sobre ${topic}! Como você testaria empiricamente essa conclusão manipulando os controles deslizantes da bancada agora mesmo?`;
      }

      const tutorMsg: ChatMessage = {
        sender: 'tutor',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, tutorMsg]);
      speakText(reply);
    }, 700);
  };

  const handleToggleMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de fala via Web Speech API.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (_e) {
      setIsListening(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="socratic-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full h-[520px] shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#E4683F]/20 text-[#E4683F] rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">Tutor Socrático de IA</h3>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Método Investigativo</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{labTitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                if (isVoiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={`p-1.5 rounded text-slate-400 hover:text-white ${isVoiceEnabled ? 'text-sky-400' : ''}`}
              title={isVoiceEnabled ? 'Desativar Voz do Tutor' : 'Ativar Voz do Tutor'}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'student' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                  m.sender === 'student'
                    ? 'bg-[#E4683F] text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
          <button
            onClick={handleToggleMic}
            className={`p-2 rounded-lg transition-colors ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Falar por microfone (Voz)"
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Responda ou formule uma pergunta reflexiva..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#E4683F]"
          />

          <button
            onClick={handleSendMessage}
            className="p-2 bg-[#E4683F] hover:bg-[#E4683F]/90 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
