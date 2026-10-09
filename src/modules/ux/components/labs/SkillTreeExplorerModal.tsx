import React, { useState } from 'react';
import { GitBranch, CheckCircle2, Sparkles, X, ChevronRight } from 'lucide-react';
import { MASTER_LABS_CATALOG } from '../../../core/constants/masterLabsCatalog';

interface SkillTreeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLab: (labId: string) => void;
  completedLabIds?: string[];
}

export const SkillTreeExplorerModal: React.FC<SkillTreeExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectLab,
  completedLabIds = []
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('medio');

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

  // Filtra laboratórios do nível selecionado
  const labs = MASTER_LABS_CATALOG.filter(l => l.academicLevel === selectedLevel);

  // Divide em 3 Tiers de progressão na árvore
  const tier1 = labs.slice(0, Math.ceil(labs.length * 0.35));
  const tier2 = labs.slice(Math.ceil(labs.length * 0.35), Math.ceil(labs.length * 0.7));
  const tier3 = labs.slice(Math.ceil(labs.length * 0.7));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-tree-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full h-[620px] shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#E4683F]/20 text-[#E4683F] rounded-lg">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">Árvore de Competências & Trilhas de Aprendizagem</h3>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Progressão Gamificada</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Pré-requisitos, desbloqueio de competências e maestria experimental</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Filters */}
        <div className="px-4 py-2 bg-slate-800/40 border-b border-slate-700/60 flex items-center space-x-2 overflow-x-auto text-xs">
          {[
            { id: 'fundamental_1', label: 'Fundamental I' },
            { id: 'fundamental_2', label: 'Fundamental II' },
            { id: 'medio', label: 'Ensino Médio & ENEM' },
            { id: 'graduacao', label: 'Graduação' },
            { id: 'pos_graduacao', label: 'Pós-Graduação' }
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                selectedLevel === lvl.id
                  ? 'bg-[#E4683F] text-white font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Tree Canvas/Layout */}
        <div className="flex-1 p-6 overflow-y-auto space-y-8 bg-slate-950/60">
          {/* TIER 1 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Nível 1 &bull; Fundamentos e Conceitos Base (Entrada Livre)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tier1.map(lab => {
                const isDone = completedLabIds.includes(lab.id);
                return (
                  <div
                    key={lab.id}
                    onClick={() => {
                      onSelectLab(lab.id);
                      onClose();
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] flex items-start justify-between ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-800/80 hover:border-emerald-500'
                        : 'bg-slate-900 border-slate-800 hover:border-[#E4683F]'
                    }`}
                  >
                    <div className="pr-2">
                      <span className="text-[10px] text-slate-400 block">{lab.subject}</span>
                      <h5 className="font-bold text-xs text-white line-clamp-1">{lab.title}</h5>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{lab.topic}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TIER 2 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Nível 2 &bull; Aplicação Quantitativa e Transposição
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tier2.map(lab => {
                const isDone = completedLabIds.includes(lab.id);
                return (
                  <div
                    key={lab.id}
                    onClick={() => {
                      onSelectLab(lab.id);
                      onClose();
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] flex items-start justify-between ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-800/80 hover:border-emerald-500'
                        : 'bg-slate-900 border-slate-800 hover:border-sky-500'
                    }`}
                  >
                    <div className="pr-2">
                      <span className="text-[10px] text-slate-400 block">{lab.subject}</span>
                      <h5 className="font-bold text-xs text-white line-clamp-1">{lab.title}</h5>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{lab.topic}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TIER 3 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Nível 3 &bull; Maestria Avançada e Otimização
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tier3.map(lab => {
                const isDone = completedLabIds.includes(lab.id);
                return (
                  <div
                    key={lab.id}
                    onClick={() => {
                      onSelectLab(lab.id);
                      onClose();
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] flex items-start justify-between ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-800/80 hover:border-emerald-500'
                        : 'bg-slate-900 border-slate-800 hover:border-amber-500'
                    }`}
                  >
                    <div className="pr-2">
                      <span className="text-[10px] text-slate-400 block">{lab.subject}</span>
                      <h5 className="font-bold text-xs text-white line-clamp-1">{lab.title}</h5>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{lab.topic}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
