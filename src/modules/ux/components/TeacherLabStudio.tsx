import { useEffect, useRef, useState } from 'react';
import { LabStudioBuilderModal } from './labs/LabStudioBuilderModal';
import { GuidedLabActivity } from './labs/GuidedLabActivity';
import type { StudioLab } from '../../core/services/labStudioService';
import type { ActivityData } from '../../data/types';
import { publishClassActivity } from '../../data/repositories/classPublicationRepository';

/** Uses the same authoring and validation flow as the laboratory catalogue. */
export function TeacherLabStudio({ professorId, classId, className, onPublish, onShare }: { professorId: string; classId: string; className: string; onPublish?: (activity: Partial<ActivityData>) => Promise<ActivityData>; onShare?: () => void }) {
  const storageKey = `edu_teacher_studio_${professorId}`;
  const [open, setOpen] = useState(false);
  const [labs, setLabs] = useState<StudioLab[]>(() => {
    try { const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(saved) ? saved.filter((lab): lab is StudioLab => Boolean(lab && typeof lab === 'object' && typeof lab.id === 'string' && typeof lab.title === 'string' && lab.learningContent?.questions?.length)) : []; } catch { return []; }
  });
  const [selectedId, setSelectedId] = useState(labs[0]?.id ?? '');
  const [error, setError] = useState(''), [message, setMessage] = useState(''), [saving, setSaving] = useState(false);
  const [published, setPublished] = useState<Record<string, string>>({});
  const scope = `${professorId}:${classId}`;
  const scopeRef = useRef(scope); scopeRef.current = scope;
  useEffect(() => { setError(''); setMessage(''); setSaving(false); }, [scope]);
  const selected = labs.find(lab => lab.id === selectedId);
  const publicationKey = `${classId}:${selectedId}`;

  async function publish() {
    if (saving || !selected || !classId || !professorId) return;
    const requestScope = scope;
    setSaving(true); setError(''); setMessage('');
    try {
      const content = selected.learningContent;
      const theoryContent = [
        `Contexto\n${content.context}`, `Explicação\n${content.theory}`, `Exemplo explicado\n${content.workedExample}`,
        `Investigação\n${content.investigation.map((step, index) => `${index + 1}. ${step}`).join('\n')}`,
        `Cenários\n${content.scenarios.map(scenario => `${scenario.label}\n${scenario.situation}\nObservação: ${scenario.observation}\nExplicação: ${scenario.explanation}`).join('\n\n')}`,
        `Evidências esperadas\n${content.expectedEvidence}`, `Reflexão\n${content.reflection}`,
      ].join('\n\n');
      const activity = await (onPublish ?? (draft => publishClassActivity(professorId, draft)))({
        classId, className, title: selected.title, subject: selected.subject, type: 'quiz',
        description: `${selected.objective}\n\nLeia o material de estudo, percorra os cenários e responda às questões. Use a conclusão escrita para registrar as evidências e a reflexão solicitadas.`,
        theoryContent,
        questions: content.questions.map(question => ({ q: question.question, options: question.options.map(option => option.text), answer: question.options.findIndex(option => option.correct), explanation: question.options.map(option => `${option.text}: ${option.explanation}`).join('\n') })),
        config: { publicationId: `studio-${selected.id}-${classId}` },
      });
      if (scopeRef.current !== requestScope) return;
      setPublished(previous => ({ ...previous, [publicationKey]: activity.id || 'publicada' }));
      setMessage(`Atividade publicada para ${className}. Os alunos a encontrarão na aba Atividades; as entregas aparecem no relatório da turma.`);
    } catch (failure) { if (scopeRef.current === requestScope) setError(failure instanceof Error ? failure.message : 'A publicação não foi confirmada. O roteiro foi mantido; tente novamente.'); }
    finally { if (scopeRef.current === requestScope) setSaving(false); }
  }

  function saveDraft(lab: StudioLab) {
    const next = [lab, ...labs]; setLabs(next); setSelectedId(lab.id); setError(''); setMessage('');
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setError('O rascunho não foi guardado neste dispositivo. Mantenha a página aberta até publicar.'); }
  }

  return <section className="professor-workflow" aria-label="Studio de roteiros">
    <h2>Criar e revisar roteiro de laboratório</h2>
    <p>Prepare uma atividade guiada com explicação, três cenários e questões com feedback. O editor confere o conteúdo antes de abrir a prévia.</p>
    <p>O rascunho fica neste dispositivo. Confira a prévia e publique como atividade para a turma selecionada: {className || 'selecione uma turma'}.</p>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <div className="workflow-actions">
      <button type="button" className="btn-primary" disabled={saving} onClick={() => setOpen(true)}>Criar roteiro no Studio</button>
      {onShare && <button type="button" className="btn-outline" disabled={saving} onClick={onShare}>Abrir materiais da turma</button>}
    </div>
    {!!labs.length && <label>Roteiros neste dispositivo<select value={selectedId} disabled={saving} onChange={event => { setSelectedId(event.target.value); setError(''); setMessage(''); }}>{labs.map(lab => <option key={lab.id} value={lab.id}>{lab.title}</option>)}</select></label>}
    {selected && <div style={{ marginTop: '1.5rem' }}>
      <p role="status">Prévia de revisão: as respostas nesta tela não são entregas de estudantes nem geram nota.</p>
      <GuidedLabActivity key={selected.id} labId={selected.id} title={selected.title} subject={selected.subject} objective={selected.objective} academicLevel={selected.academicLevel} content={selected.learningContent} />
      <div className="workflow-actions"><button type="button" className="btn-primary" disabled={saving || !classId || !professorId || Boolean(published[publicationKey])} onClick={() => void publish()}>{saving ? 'Confirmando publicação…' : published[publicationKey] ? 'Publicada nesta turma' : 'Publicar como atividade da turma'}</button></div>
    </div>}
    <LabStudioBuilderModal isOpen={open} onClose={() => setOpen(false)} existingLabs={labs} onSaveNewLab={saveDraft} />
  </section>;
}
