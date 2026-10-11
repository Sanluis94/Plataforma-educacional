import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createStudioLab, emptyLearningContent, type StudioLabDraft } from '../modules/core/services/labStudioService';
import { LAB_LEARNING_CONTENT } from '../modules/core/content/labLearningContent';
import { MASTER_LABS_CATALOG, createGuidedLabConfig } from '../modules/core/constants/masterLabsCatalog';
import { UniversalLabContainer } from '../modules/ux/components/UniversalLabContainer';
import { LabStudioBuilderModal } from '../modules/ux/components/labs/LabStudioBuilderModal';

afterEach(cleanup);

// Test-only variation checks the integration contract, not pedagogical quality.
function draft(): StudioLabDraft {
  const lesson = structuredClone(LAB_LEARNING_CONTENT.hard_1);
  const prefix = 'Roteiro da turma de teste: ';
  lesson.context = prefix + lesson.context;
  lesson.theory = prefix + lesson.theory;
  lesson.workedExample = prefix + lesson.workedExample;
  lesson.expectedEvidence = prefix + lesson.expectedEvidence;
  lesson.reflection = prefix + lesson.reflection;
  lesson.investigation = lesson.investigation.map(step => prefix + step);
  lesson.scenarios = lesson.scenarios.map(scenario => ({ ...scenario, situation: prefix + scenario.situation, observation: prefix + scenario.observation, explanation: prefix + scenario.explanation }));
  lesson.questions = lesson.questions.map(question => ({ ...question, question: prefix + question.question, options: question.options.map(option => ({ ...option, explanation: prefix + option.explanation })) }));
  return { title: 'Regra de retirada da turma', subject: 'Tecnologia', academicLevel: 'medio', topic: 'Condições booleanas', objective: 'Comparar condições de retirada com autorização e idade mínima.', estimatedHours: 0.5, content: lesson };
}

describe('Conteúdo obrigatório no Studio', () => {
  it('recusa roteiros vazios e não completa lacunas com respostas inventadas', () => {
    expect(() => createStudioLab({ ...draft(), content: emptyLearningContent() })).toThrow('teoria incompleto');
    const incomplete = draft();
    incomplete.content.questions[1].options.forEach(option => { option.explanation = ''; });
    expect(() => createStudioLab(incomplete)).toThrow('feedback da alternativa incompleto');
  });

  it('recusa cópia integral de conteúdo existente e permite somente uma alternativa correta', () => {
    expect(() => createStudioLab({ ...draft(), content: LAB_LEARNING_CONTENT.hard_1 })).toThrow('repete trechos completos');
    const ambiguous = draft();
    ambiguous.content.questions[0].options.forEach(option => { option.correct = true; });
    expect(() => createStudioLab(ambiguous)).toThrow('exatamente uma resposta correta');
  });

  it('abre o conteúdo criado sem alterar o catálogo incorporado nem usar um solver genérico', () => {
    const before = MASTER_LABS_CATALOG.map(lab => lab.id);
    const input = draft();
    const lab = createStudioLab(input);
    expect(MASTER_LABS_CATALOG.map(item => item.id)).toEqual(before);
    expect(lab.learningContent).not.toBe(input.content);
    const config = createGuidedLabConfig(lab, lab.learningContent);
    render(<UniversalLabContainer config={config} />);
    expect(screen.getByRole('region', { name: `Laboratório: ${input.title}` })).toBeVisible();
    expect(screen.getByText(input.content.context)).toBeVisible();
    expect(document.querySelector('canvas')).toBeNull();
    expect(() => createStudioLab(input, [lab])).toThrow('repete trechos completos');
  });

  it('informa conteúdo pendente no formulário e mantém a atividade fora do catálogo', () => {
    const save = vi.fn();
    render(<LabStudioBuilderModal isOpen onClose={vi.fn()} onSaveNewLab={save} />);
    fireEvent.submit(screen.getByRole('button', { name: 'Adicionar à sessão' }).closest('form')!);
    expect(save).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('teoria incompleto');
    expect(screen.getByRole('alert')).toHaveTextContent('questão 1 incompleto');
  });
});
