import React, { useState, useEffect } from 'react';
import { BookOpen, Camera, Download, Trash2, X, Check } from 'lucide-react';

interface LabNotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  labTitle: string;
  onCaptureCanvasSnapshot?: () => string | null;
}

export const LabNotebookDrawer: React.FC<LabNotebookDrawerProps> = ({
  isOpen,
  onClose,
  labId,
  labTitle,
  onCaptureCanvasSnapshot
}) => {
  const storageKey = `kortex_notebook_${labId}`;
  const [notes, setNotes] = useState<string>('');
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(storageKey);
      if (savedNotes) setNotes(savedNotes);
      const savedSnaps = localStorage.getItem(`${storageKey}_snaps`);
      if (savedSnaps) setSnapshots(JSON.parse(savedSnaps));
    } catch (_e) {}
  }, [labId]);

  const handleNotesChange = (val: string) => {
    setNotes(val);
    try {
      localStorage.setItem(storageKey, val);
    } catch (_e) {}
  };

  const handleTakeSnapshot = () => {
    if (!onCaptureCanvasSnapshot) return;
    const snap = onCaptureCanvasSnapshot();
    if (snap) {
      const updated = [snap, ...snapshots.slice(0, 3)];
      setSnapshots(updated);
      try {
        localStorage.setItem(`${storageKey}_snaps`, JSON.stringify(updated));
      } catch (_e) {}
    }
  };

  const handleClearSnapshots = () => {
    setSnapshots([]);
    try {
      localStorage.removeItem(`${storageKey}_snaps`);
    } catch (_e) {}
  };

  const handleExportText = () => {
    const blob = new Blob([notes], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Caderno_${labId}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#E4683F]" />
          <div>
            <h3 className="font-bold text-sm text-white">Caderno de Laboratório</h3>
            <p className="text-xs text-slate-400 truncate max-w-[240px]">{labTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTakeSnapshot}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
            title="Capturar imagem atual da tela do laboratório"
          >
            <Camera className="w-3.5 h-3.5 text-[#E4683F]" />
            <span>Foto da Bancada</span>
          </button>
          <button
            onClick={handleCopyNotes}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
        <button
          onClick={handleExportText}
          className="flex items-center space-x-1 px-2.5 py-1 bg-[#E4683F]/20 hover:bg-[#E4683F]/30 text-[#E4683F] font-medium rounded"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar .md</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-4 flex flex-col space-y-3 overflow-y-auto">
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-semibold text-slate-400 mb-1">
            Suas Notas de Hipóteses, Deduções e Cálculos:
          </label>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={`# Minhas Anotações de Bancada\n\n- Hipótese inicial:\n- Variável independente testada:\n- Comportamento observado:\n- Conclusão da prática:`}
            className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#E4683F] resize-none leading-relaxed"
          />
        </div>

        {/* Snapshots Gallery */}
        {snapshots.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">
                Snapshots Capturados ({snapshots.length}/4)
              </span>
              <button
                onClick={handleClearSnapshots}
                className="text-xs text-rose-400 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {snapshots.map((src, i) => (
                <div key={i} className="relative rounded border border-slate-700 overflow-hidden bg-slate-950">
                  <img src={src} alt={`Snapshot ${i + 1}`} className="w-full h-24 object-cover" />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 px-1 py-0.5 rounded text-[9px] text-slate-300">
                    #{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Salvo localmente de forma automática &bull; Suporta formatação em Markdown
      </div>
    </div>
  );
};
