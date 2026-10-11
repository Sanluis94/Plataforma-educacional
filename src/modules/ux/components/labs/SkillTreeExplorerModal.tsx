import { useEffect } from 'react';
import { GitBranch, CheckCircle2, X, ChevronRight } from 'lucide-react';
import { searchLearningLabs } from '../../../core/constants/learningCatalog';
import { learningLevelLabel, type LearningLevel } from '../../../core/constants/learningLevels';

interface SkillTreeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLab: (labId: string) => void;
  completedLabIds?: string[];
  academicLevel?: LearningLevel;
  subject?: string;
  query?: string;
}

export function SkillTreeExplorerModal({ isOpen, onClose, onSelectLab, completedLabIds = [], academicLevel = 'medio', subject, query }: SkillTreeExplorerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const labs = searchLearningLabs({ academicLevel, subject, query });
  const subjects = [...new Set(labs.map(lab => lab.subject))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return <div role="dialog" aria-modal="true" aria-labelledby="learning-map-title" onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full h-[620px] shadow-2xl flex flex-col text-slate-100">
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex items-start justify-between gap-3">
        <div>
          <h2 id="learning-map-title" className="font-bold flex items-center gap-2"><GitBranch className="w-5 h-5" /> Mapa de atividades por disciplina</h2>
          <p className="text-sm text-slate-300">{learningLevelLabel(academicLevel)}{subject ? ` · ${subject}` : ''} · {labs.length} atividades</p>
          <p className="text-xs text-slate-400 mt-1">Explore os tópicos do nível selecionado e escolha uma atividade para estudar.</p>
        </div>
        <button type="button" aria-label="Fechar mapa de atividades" onClick={onClose}><X className="w-5 h-5" /></button>
      </header>
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {subjects.map(name => <section key={name} aria-label={name}>
          <h3 className="font-bold mb-3">{name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {labs.filter(lab => lab.subject === name).map(lab => <button key={lab.id} type="button" onClick={() => { onSelectLab(lab.id); onClose(); }} className="text-left p-3 rounded-lg border border-slate-700 bg-slate-800 hover:border-orange-400 flex items-start justify-between gap-2">
              <span><strong className="block text-sm">{lab.title}</strong><span className="text-xs text-slate-300">{lab.topic}</span>{completedLabIds.includes(lab.id) && <span className="block text-xs text-emerald-300">Concluída nesta sessão</span>}</span>
              {completedLabIds.includes(lab.id) ? <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
            </button>)}
          </div>
        </section>)}
        {labs.length === 0 && <p>Nenhuma atividade corresponde aos filtros atuais.</p>}
      </div>
    </div>
  </div>;
}
