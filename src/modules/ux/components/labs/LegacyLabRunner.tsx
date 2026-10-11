import type { ComponentType } from 'react';
import { ALL_MODULES } from '../../../core/constants/dashboardConstants';
import { getLearningLab } from '../../../core/constants/learningCatalog';
import { getLabLearningContent } from '../../../core/content/labLearningContent';
import { LabLearningWorkspace } from './LabLearningWorkspace';

interface LegacyLabRunnerProps {
  labId: string;
  onComplete?: (report: { score: number; telemetryRows: number }) => void;
}

// Loaded dynamically by Simulacao: the bench registry itself imports Simulacao.
export default function LegacyLabRunner({ labId, onComplete }: LegacyLabRunnerProps) {
  const descriptor = getLearningLab(labId);
  const lab = ALL_MODULES.map(module => module.labs.find(item => item.id === labId)).find(item => item !== undefined);
  if (!lab || !descriptor || descriptor.source !== 'legacy') return <p role="alert">Bancada não encontrada.</p>;
  const Bench = lab.component as ComponentType<{ labId: string; labTitle: string; onComplete: (score: number) => void }>;
  return <LabLearningWorkspace key={labId} labId={labId} title={descriptor.title} subject={descriptor.subject} objective={descriptor.objective} academicLevel={descriptor.academicLevel} content={getLabLearningContent(labId)} onComplete={onComplete}>
    <Bench {...lab.props} labId={labId} labTitle={descriptor.title} onComplete={score => onComplete?.({ score: Math.round(score / 10), telemetryRows: 0 })} />
  </LabLearningWorkspace>;
}
