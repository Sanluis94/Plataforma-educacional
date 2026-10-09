import React, { useState } from 'react';
import { Columns2, Play, RefreshCw, X, TrendingUp } from 'lucide-react';
import type { LabParameter } from '../UniversalLabContainer';

interface LabSplitScreenComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: LabParameter[];
  primaryParams: Record<string, number>;
  onApplyScenarioB: (scenarioParams: Record<string, number>) => void;
}

export const LabSplitScreenComparator: React.FC<LabSplitScreenComparatorProps> = ({
  isOpen,
  onClose,
  parameters,
  primaryParams,
  onApplyScenarioB
}) => {
  // Cenário B começa clonando Cenário A com uma leve variação no primeiro parâmetro
  const [scenarioBParams, setScenarioBParams] = useState<Record<string, number>>(() => {
    const copy = { ...primaryParams };
    const firstKey = Object.keys(copy)[0];
    if (firstKey) {
      const def = parameters.find(p => p.id === firstKey);
      if (def) {
        copy[firstKey] = Math.min(def.max, Number((copy[firstKey] * 1.5).toFixed(2)));
      }
    }
    return copy;
  });

  if (!isOpen) return null;

  const handleSliderBChange = (id: string, val: number) => {
    setScenarioBParams(prev => ({ ...prev, [id]: val }));
  };

  const handleResetToA = () => {
    setScenarioBParams({ ...primaryParams });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#E4683F]/20 text-[#E4683F] rounded-lg">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Modo Comparativo A/B (Split-Screen)</h3>
              <p className="text-xs text-slate-400">Contraste de hipóteses e análise direta de sensibilidade paramétrica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
          {/* Cenário A (Ativo) */}
          <div className="p-4 bg-slate-950/60 border border-sky-900/40 rounded-lg">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase text-sky-400 tracking-wider flex items-center space-x-1">
                <span>Cenário Base (A)</span>
              </span>
              <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                Ativo no Experimento
              </span>
            </div>
            <div className="space-y-3">
              {parameters.map(p => (
                <div key={p.id} className="text-xs flex justify-between items-center bg-slate-900/80 p-2 rounded">
                  <span className="text-slate-300 truncate max-w-[170px]">{p.label}:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {primaryParams[p.id] ?? p.defaultValue} {p.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cenário B (Contraste) */}
          <div className="p-4 bg-slate-950/60 border border-amber-900/40 rounded-lg">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center space-x-1">
                <span>Cenário Alternativo (B)</span>
              </span>
              <button
                onClick={handleResetToA}
                className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded flex items-center space-x-1"
                title="Clonar parâmetros do Cenário A"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Clonar A</span>
              </button>
            </div>
            <div className="space-y-3">
              {parameters.map(p => {
                const valB = scenarioBParams[p.id] ?? p.defaultValue;
                const valA = primaryParams[p.id] ?? p.defaultValue;
                const diff = valB - valA;
                const diffPct = valA !== 0 ? ((diff / valA) * 100).toFixed(1) : '0';

                return (
                  <div key={p.id} className="text-xs bg-slate-900/80 p-2 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 truncate max-w-[150px]">{p.label}:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-400">
                          {valB} {p.unit}
                        </span>
                        {diff !== 0 && (
                          <span className={`text-[10px] font-mono px-1 rounded ${diff > 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                            {diff > 0 ? `+${diffPct}%` : `${diffPct}%`}
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="range"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={valB}
                      onChange={(e) => handleSliderBChange(p.id, Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Insights & Actions */}
        <div className="mt-4 p-3 bg-slate-800/40 border border-slate-700/60 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <TrendingUp className="w-4 h-4 text-[#E4683F]" />
            <span>Permite simular o impacto de perturbações e contrastar hipóteses causais instantaneamente.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                onApplyScenarioB(scenarioBParams);
                onClose();
              }}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-[#E4683F] hover:opacity-90 rounded text-xs font-bold text-white flex items-center space-x-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Executar com Cenário B</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
