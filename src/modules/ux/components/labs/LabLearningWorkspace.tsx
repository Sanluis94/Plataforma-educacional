import { Activity, useState, type ReactNode } from 'react';
import type { LabLearningContent } from '../../../core/content/labLearningContent';
import { GuidedLabActivity } from './GuidedLabActivity';
import type { LearningLevel } from '../../../core/constants/learningLevels';

interface LabLearningWorkspaceProps {
  labId: string;
  title: string;
  subject: string;
  objective: string;
  academicLevel?: LearningLevel;
  content?: LabLearningContent;
  onComplete?: (report: { score: number; telemetryRows: number }) => void;
  children: ReactNode;
}

// Existing benches keep their own models and controls. An authored lesson adds
// investigation and assessment without replacing the underlying bench.
export function LabLearningWorkspace({ labId, title, subject, objective, academicLevel, content, onComplete, children }: LabLearningWorkspaceProps) {
  const [view, setView] = useState<'lesson' | 'bench'>('lesson');
  const [benchOpened, setBenchOpened] = useState(false);
  if (!content) return children;

  return <div className="lab-learning-workspace">
    <nav className="guided-lab-tabs" aria-label="Roteiro e bancada">
      <button type="button" aria-pressed={view === 'lesson'} onClick={() => setView('lesson')}>Roteiro e avaliação</button>
      <button type="button" aria-pressed={view === 'bench'} onClick={() => { setBenchOpened(true); setView('bench'); }}>Abrir bancada</button>
    </nav>
    {view === 'bench' && <p className="guided-lab-hint">Ao voltar ao roteiro, a execução da bancada fica pausada. Seus parâmetros, dados e anotações serão mantidos.</p>}
    <Activity mode={view === 'lesson' ? 'visible' : 'hidden'}>
      <GuidedLabActivity labId={labId} title={title} subject={subject} objective={objective} academicLevel={academicLevel} content={content} onComplete={onComplete} />
    </Activity>
    {benchOpened && <Activity mode={view === 'bench' ? 'visible' : 'hidden'}>{children}</Activity>}
  </div>;
}
