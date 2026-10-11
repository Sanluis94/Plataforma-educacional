import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { GuidedLabActivity } from '../modules/ux/components/labs/GuidedLabActivity';
import { UniversalLabContainer } from '../modules/ux/components/UniversalLabContainer';
import { LabLearningWorkspace } from '../modules/ux/components/labs/LabLearningWorkspace';
import { LAB_LEARNING_CONTENT } from '../modules/core/content/labLearningContent';
import { MASTER_LABS_CATALOG, resolveUniversalLab } from '../modules/core/constants/masterLabsCatalog';
import { ALL_MODULES } from '../modules/core/constants/dashboardConstants';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const content = LAB_LEARNING_CONTENT.fund1_mat_01;
const props = { labId: 'fund1_mat_01', title: 'Ábaco e Sistema de Numeração Decimal', subject: 'Matemática', objective: 'Compor e decompor números.', content };
const guidedLabs = MASTER_LABS_CATALOG.map(({ id }) => ({ id, config: resolveUniversalLab(id) }))
  .filter(({ config }) => config.presentation === 'guided_activity');
const legacyLabs = ALL_MODULES.flatMap(module => module.labs.map(lab => ({ ...lab, subject: module.label })));

describe('Atividade guiada na bancada', () => {
  it.each(guidedLabs)('abre $id com seu roteiro sem inicializar a curva genérica', ({ config }) => {
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
    render(<UniversalLabContainer config={config} />);
    expect(screen.getByRole('heading', { level: 2, name: config.title })).toBeInTheDocument();
    expect(screen.getByText(config.learningContent!.context)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Conferir observação' })).toBeEnabled();
    expect(canvas).not.toHaveBeenCalled();
  });

  it.each(legacyLabs)('liga $id à bancada e preserva as anotações ao alternar', lab => {
    const lesson = LAB_LEARNING_CONTENT[lab.id];
    render(<LabLearningWorkspace labId={lab.id} title={lab.title} subject={lab.subject} objective="Investigue os casos." content={lesson}>
      <p>Bancada existente: {lab.id}</p>
    </LabLearningWorkspace>);
    expect(screen.getByRole('region', { name: `Laboratório: ${lab.title}` })).toBeVisible();
    fireEvent.change(screen.getByLabelText('Minha previsão e justificativa'), { target: { value: `Previsão de ${lab.id}` } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir bancada' }));
    expect(screen.getByText(`Bancada existente: ${lab.id}`)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Roteiro e avaliação' }));
    expect(screen.getByLabelText('Minha previsão e justificativa')).toHaveValue(`Previsão de ${lab.id}`);
  });

  it('mantém previsões independentes e permite comparar as observações dos casos', () => {
    render(<GuidedLabActivity {...props} />);
    fireEvent.change(screen.getByLabelText('Minha previsão e justificativa'), { target: { value: 'Cada dez unidades forma uma dezena.' } });
    expect(screen.queryByText(content.scenarios[0].observation)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Conferir observação' }));
    expect(screen.getByText(content.scenarios[0].observation)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: content.scenarios[1].label }));
    expect(screen.getByLabelText('Minha previsão e justificativa')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Minha previsão e justificativa'), { target: { value: 'No segundo caso, muda a posição.' } });
    fireEvent.click(screen.getByRole('button', { name: `${content.scenarios[0].label} ✓` }));
    expect(screen.getByLabelText('Minha previsão e justificativa')).toHaveValue('Cada dez unidades forma uma dezena.');
    expect(screen.getByText(content.scenarios[0].explanation)).toBeInTheDocument();
  });

  it('corrige somente após todas as respostas e fornece explicações específicas', () => {
    const onComplete = vi.fn();
    render(<GuidedLabActivity {...props} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Avaliar' }));
    expect(screen.getByRole('button', { name: 'Corrigir respostas' })).toBeDisabled();
    for (const question of content.questions) {
      fireEvent.click(screen.getByLabelText(question.options.find(option => option.correct)!.text));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Corrigir respostas' }));
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score: 10, telemetryRows: 0 });
    expect(screen.getByRole('status')).toHaveTextContent(`Você acertou ${content.questions.length} de ${content.questions.length} questões.`);
    expect(screen.getAllByText(content.questions[0].options[0].explanation).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Corrigir respostas' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('button', { name: 'Corrigir respostas' })).toBeDisabled();
  });

  it('não transfere a previsão ou a avaliação de um laboratório para outro', () => {
    const view = render(<UniversalLabContainer config={resolveUniversalLab('fund1_mat_01')} />);
    fireEvent.change(screen.getByLabelText('Minha previsão e justificativa'), { target: { value: 'Previsão do ábaco.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Avaliar' }));
    view.rerender(<UniversalLabContainer config={resolveUniversalLab('fund1_mat_02')} />);
    expect(screen.getByLabelText('Minha previsão e justificativa')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Investigar' })).toHaveAttribute('aria-pressed', 'true');
  });
});
