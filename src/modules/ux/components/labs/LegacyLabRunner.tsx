import type { ComponentType } from 'react';
import { ALL_MODULES } from '../../../core/constants/dashboardConstants';
import { getLearningLab } from '../../../core/constants/learningCatalog';
import { useLabLearningContent } from '../../hooks/useLabLearningContent';
import { LabLearningWorkspace } from './LabLearningWorkspace';
import type { LabCompletionHandler } from '../../../data/services/learningCapture';
import { useLearningCapture } from '../../hooks/useLearningCapture';

interface LegacyLabRunnerProps {
  labId: string;
  onComplete?: LabCompletionHandler;
}

// Loaded dynamically by Simulacao: the bench registry itself imports Simulacao.
export default function LegacyLabRunner({ labId, onComplete }: LegacyLabRunnerProps) {
  const capture = useLearningCapture();
  const {content,loading,error,retry} = useLabLearningContent(labId);
  const descriptor = getLearningLab(labId);
  const lab = ALL_MODULES.map(module => module.labs.find(item => item.id === labId)).find(item => item !== undefined);
  if (!lab || !descriptor || descriptor.source !== 'legacy') return <p role="alert">Bancada não encontrada.</p>;
  if (loading) return <p role="status">Carregando o roteiro desta atividade…</p>;
  if (error) return <div role="alert"><p>{error}</p><button type="button" onClick={retry}>Tentar novamente</button></div>;
  const Bench = lab.component as ComponentType<{ labId: string; labTitle: string; onComplete: (score: number) => void }>;
  return <LabLearningWorkspace key={labId} labId={labId} title={descriptor.title} subject={descriptor.subject} objective={descriptor.objective} academicLevel={descriptor.academicLevel} content={content} onComplete={onComplete}>
    <Bench {...lab.props} labId={labId} labTitle={descriptor.title} onComplete={() => onComplete?.({ score: 0, telemetryRows: 0, evidence: capture.current.evidence('lab', { labId, subject: descriptor.subject, stage: 'exploration' }) })} />
  </LabLearningWorkspace>;
}
