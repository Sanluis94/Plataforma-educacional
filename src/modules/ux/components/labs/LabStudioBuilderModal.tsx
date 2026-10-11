import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createStudioLab, emptyLearningContent, type StudioLab, type StudioLabDraft } from '../../../core/services/labStudioService';
import { LearningContentEditor } from './LearningContentEditor';
import './LabStudioBuilderModal.css';

interface LabStudioBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNewLab: (lab: StudioLab) => void;
  existingLabs?: StudioLab[];
}

const initialDraft = (): StudioLabDraft => ({ title: '', subject: '', academicLevel: 'medio', topic: '', objective: '', estimatedHours: 1, content: emptyLearningContent() });

export function LabStudioBuilderModal({ isOpen, onClose, onSaveNewLab, existingLabs = [] }: LabStudioBuilderModalProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = [...(dialog.current?.querySelectorAll<HTMLElement>('button, input, textarea, select') || [])].filter(element => !element.hasAttribute('disabled'));
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', handleKey); previousFocus?.focus(); };
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  function save(event: FormEvent) {
    event.preventDefault();
    try {
      const lab = createStudioLab(draft, existingLabs);
      onSaveNewLab(lab);
      setDraft(initialDraft());
      setError('');
      onClose();
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Confira o conteúdo antes de adicionar a atividade.'); }
  }

  const metadata = (label: string, field: 'title' | 'subject' | 'topic' | 'objective', minimum: number) => <label className="studio-field">
    <span>{label}</span><input value={draft[field]} required minLength={minimum} onChange={event => setDraft(previous => ({ ...previous, [field]: event.target.value }))} />
  </label>;

  return <div className="lab-studio-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="studio-title" className="lab-studio">
      <header><h2 id="studio-title">Criar atividade no Kortex Studio</h2><button type="button" onClick={onClose} aria-label="Fechar Studio">×</button></header>
      <p>Prepare um roteiro com explicação, exemplo, três cenários e duas questões com feedback. A atividade ficará disponível nesta sessão. Revise a correção do conteúdo antes de compartilhar com alunos.</p>
      {error && <p role="alert" className="studio-errors">{error}</p>}
      <form onSubmit={save}>
        <fieldset><legend>Identificação</legend>
          {metadata('Título do laboratório', 'title', 5)}
          {metadata('Disciplina', 'subject', 3)}
          {metadata('Tópico', 'topic', 3)}
          {metadata('Objetivo de aprendizagem', 'objective', 30)}
          <label className="studio-field"><span>Nível acadêmico</span>
            <select aria-label="Nível acadêmico" value={draft.academicLevel} onChange={event => setDraft(previous => ({ ...previous, academicLevel: event.target.value as StudioLabDraft['academicLevel'] }))}>
              <option value="fundamental_1">Fundamental I</option><option value="fundamental_2">Fundamental II</option><option value="medio">Ensino Médio</option><option value="graduacao">Graduação</option><option value="pos_graduacao">Pós-Graduação</option>
            </select>
          </label>
          <label className="studio-field"><span>Tempo de estudo estimado (horas)</span><input type="number" min="0.25" max="40" step="0.25" required value={draft.estimatedHours} onChange={event => setDraft(previous => ({ ...previous, estimatedHours: Number(event.target.value) }))} /></label>
        </fieldset>
        <LearningContentEditor content={draft.content} onChange={content => setDraft(previous => ({ ...previous, content }))} />
        <footer><button type="button" onClick={onClose}>Cancelar</button><button type="submit">Adicionar à sessão</button></footer>
      </form>
    </div>
  </div>;
}
