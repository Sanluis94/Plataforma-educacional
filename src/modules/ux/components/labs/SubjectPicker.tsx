import { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown } from 'lucide-react';

interface SubjectOption {
  name: string;
  count: number;
}

interface SubjectPickerProps {
  subjects: SubjectOption[];
  selected: string;
  onSelect: (subject: string) => void;
}

/** Mostra as matérias do nível atual sem sair da página do catálogo. */
export function SubjectPicker({ subjects, selected, onSelect }: SubjectPickerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const total = subjects.reduce((sum, subject) => sum + subject.count, 0);

  // Fecha o painel ao clicar fora, sem alterar a matéria escolhida.
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  function choose(name: string) {
    onSelect(name);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="lab-subject-picker" ref={rootRef} onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }}>
      <span className="lab-catalog__field-label">Matérias</span>
      <button
        ref={triggerRef}
        type="button"
        className="lab-subject-picker__trigger"
        aria-label="Escolher matéria"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(previous => !previous)}
      >
        <BookOpen size={19} aria-hidden="true" />
        <span className="lab-subject-picker__value">{selected || 'Todas as matérias'}</span>
        <ChevronDown size={18} className={open ? 'lab-subject-picker__chevron is-open' : 'lab-subject-picker__chevron'} aria-hidden="true" />
      </button>
      {open && (
        <div className="lab-subject-picker__panel" id={panelId}>
          <div className="lab-subject-picker__panel-heading">
            <strong>Escolha uma matéria</strong>
            <span>{subjects.length} opções nesta etapa</span>
          </div>
          <div className="lab-subject-picker__options" role="group" aria-label="Matérias disponíveis">
            {[{ name: '', count: total }, ...subjects].map(option => {
              const active = selected === option.name;
              const label = option.name || 'Todas as matérias';
              return (
                <button
                  key={option.name}
                  type="button"
                  className={active ? 'lab-subject-picker__option is-active' : 'lab-subject-picker__option'}
                  aria-label={`${label} (${option.count} laboratórios)`}
                  aria-pressed={active}
                  onClick={() => choose(option.name)}
                >
                  <span>{label}</span>
                  <span className="lab-subject-picker__option-meta">
                    <span>{option.count}</span>
                    {active && <Check size={16} aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
