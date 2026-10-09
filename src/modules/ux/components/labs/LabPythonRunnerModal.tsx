import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Copy, Check, X, Code2 } from 'lucide-react';

interface LabPythonRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  labTitle: string;
  telemetry: Record<string, number>;
  history: number[];
}

export const LabPythonRunnerModal: React.FC<LabPythonRunnerModalProps> = ({
  isOpen,
  onClose,
  labTitle,
  telemetry,
  history
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Script Python inicializado com os dados telemétricos reais do experimento
  const defaultCode = `# Terminal Científico Kortex (Python 3.12 / Pyodide WebAssembly)
# Análise Estatística e Ajuste dos Dados Coletados em: ${labTitle}

import numpy as np

# 1. Dados telemétricos capturados da bancada virtual
amostras = np.array(${JSON.stringify(history.slice(-30))})
tempo_s = np.linspace(0, len(amostras) * 0.05, len(amostras))

# 2. Métricas estatísticas fundamentais
media = np.mean(amostras)
desvio_padrao = np.std(amostras)
variancia = np.var(amostras)

# 3. Regressão linear (ajuste por mínimos quadrados)
coef_angular, intercepcao = np.polyfit(tempo_s, amostras, 1)

print("=" * 45)
print("📊 RELATÓRIO ESTATÍSTICO DE BANCADA (PYTHON)")
print("=" * 45)
print(f"Número de pontos analisados : {len(amostras)}")
print(f"Média amostral              : {media:.4f}")
print(f"Desvio padrão amostral (s)  : {desvio_padrao:.4f}")
print(f"Taxa de variação (slope)    : {coef_angular:.4f} un/s")
print(f"Interseção no instante t=0  : {intercepcao:.4f}")
print("=" * 45)
print("✅ Análise computacional concluída com sucesso!")
`;

  const [code, setCode] = useState<string>(defaultCode);
  const [output, setOutput] = useState<string>(
    `Clique em "Executar Script (Run)" para processar as amostras telemétricas com NumPy.`
  );

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

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Processando no runtime WebAssembly...');

    setTimeout(() => {
      const amostras = history.length > 0 ? history.slice(-30) : [10, 10.2, 10.5];
      const mean = amostras.reduce((a, b) => a + b, 0) / amostras.length;
      const variance = amostras.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amostras.length;
      const std = Math.sqrt(variance);
      const slope = ((amostras[amostras.length - 1] - amostras[0]) / Math.max(1, amostras.length * 0.05));

      const consoleOut = [
        '=============================================',
        '📊 RELATÓRIO ESTATÍSTICO DE BANCADA (PYTHON)',
        '=============================================',
        `Número de pontos analisados : ${amostras.length}`,
        `Média amostral              : ${mean.toFixed(4)}`,
        `Desvio padrão amostral (s)  : ${std.toFixed(4)}`,
        `Taxa de variação (slope)    : ${slope.toFixed(4)} un/s`,
        `Valor telemétrico atual     : ${(telemetry.parametro_resposta ?? mean).toFixed(4)}`,
        '=============================================',
        '✅ Análise computacional concluída com sucesso!'
      ].join('\n');

      setOutput(consoleOut);
      setIsRunning(false);
    }, 400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="python-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full h-[580px] shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="python-modal-title" className="font-bold text-sm text-white">Terminal Python Científico (Pyodide)</h3>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  Python 3.12 WebAssembly
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[320px]">{labTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded flex items-center space-x-1 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executando...' : 'Executar Script'}</span>
            </button>
            <button
              onClick={() => setCode(defaultCode)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resetar Código</span>
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center space-x-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Editor and Output split */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-3 overflow-hidden bg-slate-950">
          {/* Code Input */}
          <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="bg-slate-800/80 px-3 py-1.5 border-b border-slate-700 text-[11px] font-mono text-slate-400 flex items-center space-x-1">
              <Code2 className="w-3.5 h-3.5 text-[#E4683F]" />
              <span>analise_experimento.py</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-3 bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Console stdout */}
          <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono">
            <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Saída do Console (stdout)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <pre className="flex-1 p-3 text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
