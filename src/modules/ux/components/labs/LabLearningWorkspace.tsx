import { useState, type ReactNode } from 'react';
import type { LabLearningContent } from '../../../core/content/labLearningContent';
import { GuidedLabActivity } from './GuidedLabActivity';

interface LabLearningWorkspaceProps {
  labId: string;
  title: string;
  subject: string;
  objective: string;
  content?: LabLearningContent;
  onComplete?: (report: { score: number; telemetryRows: number }) => void;
  children: ReactNode;
}

// Existing benches keep their own models and controls. An authored lesson adds
// investigation and assessment without replacing the underlying bench.
export function LabLearningWorkspace({ labId, title, subject, objective, content, onComplete, children }: LabLearningWorkspaceProps) {
  const [view, setView] = useState<'lesson' | 'bench'>('lesson');
  if (!content) return children;

  return <div className="lab-learning-workspace">
    <nav className="guided-lab-tabs" aria-label="Roteiro e bancada">
      <button type="button" aria-pressed={view === 'lesson'} onClick={() => setView('lesson')}>Roteiro e avaliação</button>
      <button type="button" aria-pressed={view === 'bench'} onClick={() => setView('bench')}>Abrir bancada</button>
    </nav>
    {view === 'bench' && <p className="guided-lab-hint">Ao voltar ao roteiro, esta execução da bancada será encerrada. Suas anotações do roteiro serão mantidas.</p>}
    <div hidden={view !== 'lesson'}>
      <GuidedLabActivity labId={labId} title={title} subject={subject} objective={objective} content={content} onComplete={onComplete} />
    </div>
    {view === 'bench' && children}
  </div>;
}
