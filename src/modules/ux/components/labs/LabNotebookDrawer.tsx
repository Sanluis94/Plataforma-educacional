import { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Camera, Download, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../../../core/contexts/AuthContext';

interface LabNotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  labId: string;
  labTitle: string;
  activityScope?: string;
  onCaptureCanvasSnapshot?: () => string | null;
  onNotesChange?: (notes: string) => void;
}

export function LabNotebookDrawer(props: LabNotebookDrawerProps) {
  const { currentUser } = useAuth();
  const suffix = props.activityScope && props.activityScope !== ':' ? `_${encodeURIComponent(props.activityScope)}` : '';
  const storageKey = currentUser?.uid ? `kortex_notebook_v2_${encodeURIComponent(currentUser.uid)}_${encodeURIComponent(props.labId)}${suffix}` : null;
  return <ScopedNotebook key={storageKey ?? `guest-${props.labId}`} {...props} storageKey={storageKey} />;
}

function ScopedNotebook({ isOpen, onClose, labTitle, labId, onCaptureCanvasSnapshot, onNotesChange, storageKey }: LabNotebookDrawerProps & { storageKey: string | null }) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [restored] = useState(() => {
    let notes = '';
    try {
      notes = storageKey ? (localStorage.getItem(storageKey) ?? '').slice(0, 20_000) : '';
      const saved: unknown = storageKey ? JSON.parse(localStorage.getItem(`${storageKey}_snaps`) ?? '[]') : [];
      if (!Array.isArray(saved)) throw new Error('Caderno inválido.');
      return {notes,snapshots:saved.filter((value): value is string => typeof value === 'string' && value.startsWith('data:image/png;base64,')).slice(0,4),failed:false,error:''};
    } catch { return {notes,snapshots:[] as string[],failed:true,error:'Não foi possível recuperar todo o caderno deste navegador. Exporte suas anotações antes de sair.'}; }
  });
  const [notes, setNotes] = useState(restored.notes);
  const [snapshots, setSnapshots] = useState<string[]>(restored.snapshots);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(restored.error);
  const [storageFailed, setStorageFailed] = useState(restored.failed);

  useEffect(() => { onNotesChange?.(notes); }, [notes, onNotesChange]);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), textarea');
      if (!items?.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keydown); previousFocus?.focus(); };
  }, [isOpen, onClose]);

  const save = (suffix: string, value: string) => {
    if (!storageKey) return;
    try { localStorage.setItem(`${storageKey}${suffix}`, value); setStorageFailed(false); setError(''); }
    catch { setStorageFailed(true); setError('O navegador não conseguiu salvar o caderno. Exporte suas notas antes de sair.'); }
  };
  const takeSnapshot = () => {
    const snapshot = onCaptureCanvasSnapshot?.();
    if (!snapshot) { setError('Abra a bancada em 2D para capturar uma imagem.'); return; }
    const updated = [snapshot, ...snapshots].slice(0, 4);
    setSnapshots(updated);
    setError('');
    save('_snaps', JSON.stringify(updated));
  };
  const clearSnapshots = () => { setSnapshots([]); save('_snaps', '[]'); };
  const exportNotes = () => {
    const content = `# Caderno: ${labTitle}\n\nLaboratório: ${labId}\n\n${notes}\n\n${snapshots.map((source, index) => `![Bancada capturada ${index + 1}](${source})`).join('\n\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Caderno_${labId}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const copyNotes = async () => {
    setCopied(false);
    setError('');
    try { await navigator.clipboard.writeText(notes); setCopied(true); }
    catch { setError('Não foi possível copiar. Use Exportar .md para guardar suas notas.'); }
  };
  if (!isOpen) return null;
  return <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col text-slate-100">
    <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0"><BookOpen className="w-5 h-5 text-[#E4683F] shrink-0" /><div className="min-w-0"><h3 id={`${id}-title`} className="font-bold text-sm">Caderno de laboratório</h3><p className="text-xs text-slate-400 truncate">{labTitle}</p></div></div>
      <button onClick={onClose} aria-label="Fechar caderno" className="p-1"><X className="w-5 h-5" /></button>
    </div>
    <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-slate-700 text-xs">
      <button onClick={takeSnapshot} className="flex items-center gap-1 px-2 py-2 bg-slate-700 rounded"><Camera className="w-4 h-4" />Foto da bancada</button>
      <button disabled={!notes} onClick={() => { void copyNotes(); }} className="flex items-center gap-1 px-2 py-2 bg-slate-700 rounded">{copied && <Check className="w-4 h-4" />}{copied ? 'Copiado!' : 'Copiar'}</button>
      <button disabled={!notes && snapshots.length === 0} onClick={exportNotes} className="flex items-center gap-1 px-2 py-2 bg-orange-950 rounded"><Download className="w-4 h-4" />Exportar .md</button>
    </div>
    <div className="flex-1 min-h-0 p-4 flex flex-col gap-3 overflow-y-auto">
      <label htmlFor={`${id}-notes`} className="text-xs font-semibold">Suas hipóteses, observações e conclusões</label>
      <textarea id={`${id}-notes`} maxLength={20_000} value={notes} onChange={event => { const value = event.target.value; setNotes(value); setCopied(false); save('', value); }} rows={12} placeholder="Registre o que você previu, o que mediu e o que concluiu." className="w-full flex-1 min-h-36 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200" />
      {error && <p role="alert" className="text-sm text-amber-300">{error}</p>}
      {snapshots.length > 0 && <div><div className="flex justify-between gap-2 text-xs mb-2"><span>Imagens capturadas ({snapshots.length}/4)</span><button onClick={clearSnapshots} className="flex items-center gap-1 text-rose-300"><Trash2 className="w-3 h-3" />Limpar imagens</button></div><div className="grid grid-cols-2 gap-2">{snapshots.map((source, index) => <a key={index} href={source} download={`${labId}-imagem-${index + 1}.png`} aria-label={`Baixar imagem ${index + 1}`}><img src={source} alt={`Bancada capturada ${index + 1}`} className="w-full rounded border border-slate-700" /></a>)}</div></div>}
    </div>
    <p role="status" className="p-3 text-xs text-slate-300 border-t border-slate-700">{storageFailed ? 'Há alterações sem salvar. Exporte as notas.' : storageKey ? 'Notas salvas neste navegador para sua conta. As imagens podem ser baixadas separadamente.' : 'Sem sessão: as notas ficam apenas nesta tela. Exporte antes de sair.'}</p>
  </div>;
}
