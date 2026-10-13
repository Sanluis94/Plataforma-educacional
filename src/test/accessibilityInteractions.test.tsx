import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { AccessibilityToolbar } from '../modules/ux/components/AccessibilityToolbar';
import { LabAccessibilityToolbar } from '../modules/ux/components/labs/LabAccessibilityToolbar';
import { ParentBridgeModal } from '../modules/ux/components/ParentBridgeModal';
import { PricingModal } from '../modules/ux/components/PricingModal';
import { UniversalLabContainer, type UniversalLabConfig } from '../modules/ux/components/UniversalLabContainer';

vi.mock('../modules/ux/components/SocraticTutorWidget', () => ({ SocraticTutorWidget: () => null }));

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.classList.remove('focus-mode-active', 'dyslexia-font');
  document.documentElement.classList.remove('font-scale-100', 'font-scale-115', 'font-scale-130');
});

describe('Interações acessíveis', () => {
  it('mantém os atalhos livres de controles, modificadores e diálogos', () => {
    const shortcut = vi.fn();
    render(<><div data-testid="bench-surface" tabIndex={0}>Bancada</div><select aria-label="Modo"><option>Real</option></select><LabAccessibilityToolbar isHighContrast={false} isDyslexicFont={false} isSoundMuted onToggleHighContrast={vi.fn()} onToggleDyslexicFont={vi.fn()} onToggleSound={vi.fn()} onKeyboardShortcut={shortcut} /></>);
    const surface = screen.getByTestId('bench-surface');
    const contrast = screen.getByRole('button', { name: 'Alto contraste' });
    contrast.focus();
    expect(fireEvent.keyDown(contrast, { key: ' ', code: 'Space' })).toBe(true);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'r', code: 'KeyR' });
    fireEvent.keyDown(surface, { key: 'r', code: 'KeyR', ctrlKey: true });
    expect(shortcut).not.toHaveBeenCalled();
    fireEvent.keyDown(surface, { key: 'r', code: 'KeyR' });
    expect(shortcut).toHaveBeenCalledExactlyOnceWith('reset');
    render(<div role="dialog" aria-modal="true" aria-label="Anotações">Notas</div>);
    fireEvent.keyDown(surface, { key: 'r', code: 'KeyR' });
    expect(shortcut).toHaveBeenCalledTimes(1);
  });

  it('anuncia opções selecionadas e devolve foco ao fechar a acessibilidade com Escape', () => {
    render(<AccessibilityToolbar />);
    const trigger = screen.getByRole('button', { name: 'Opções de acessibilidade' });
    fireEvent.click(trigger);
    const size = screen.getByRole('button', { name: 'Tamanho do texto: 130% (Grande)' });
    fireEvent.click(size);
    expect(size).toHaveAttribute('aria-pressed', 'true');
    const focusMode = screen.getByRole('button', { name: /Reduzir distrações/ });
    fireEvent.click(focusMode);
    expect(focusMode).toHaveAttribute('aria-pressed', 'true');
    focusMode.focus();
    fireEvent.keyDown(focusMode, { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('apresenta prévias familiares sem anunciar envio e restaura o foco ao sair', () => {
    function FamilyPreview() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Abrir família</button>{open && <ParentBridgeModal studentName="Ana" onClose={() => setOpen(false)} />}</>;
    }
    render(<FamilyPreview />);
    const trigger = screen.getByRole('button', { name: 'Abrir família' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Portal da família' });
    expect(screen.getByRole('button', { name: 'Fechar portal da família' })).toHaveFocus();
    expect(screen.getByRole('button',{name:'Entrar para acompanhar'})).toBeInTheDocument();
    expect(screen.getByText(/Somente os estudantes vinculados/)).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('compara planos sem iniciar cobrança nem prometer contato', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<PricingModal onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Planos para estudantes, escolas e redes' })).toHaveAccessibleDescription(/Valores e condições ilustrativos/);
    expect(screen.getByRole('slider', { name: /Número de alunos na escola/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver opção para rede' }));
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma solicitação de contato foi enviada.');
    expect(alert).not.toHaveBeenCalled();
  });

  it('nomeia parâmetros da bancada e permite escolher respostas pelo rótulo', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const config: UniversalLabConfig = {
      id: 'accessible-bench', title: 'Bancada de teste', subject: 'Física', academicLevel: 'medio', topic: 'Massa', objective: 'Investigar massa.',
      parameters: [{ id: 'mass', label: 'Massa', unit: 'kg', min: 1, max: 10, step: 1, defaultValue: 2 }],
      theoreticalBackground: 'Teste de bancada.', initialState: {}, physicsStep: () => ({ nextState: {}, telemetry: {} }), renderCanvas: () => {},
      questions: [{ question: 'Qual é a massa?', options: [{ text: 'Dois quilogramas', correct: true, explanation: 'A massa é 2 kg.' }, { text: 'Cinco quilogramas', correct: false, explanation: 'Confira o parâmetro.' }] }],
    };
    render(<UniversalLabContainer config={config} />);
    expect(screen.getByRole('spinbutton', { name: 'Massa (kg)' })).toHaveValue(2);
    expect(screen.getByRole('slider', { name: 'Massa (kg): ajuste deslizante' })).toHaveValue('2');
    fireEvent.click(screen.getByRole('button', { name: /Perguntas/ }));
    expect(screen.getByRole('group', { name: '1. Qual é a massa?' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Dois quilogramas'));
    expect(screen.getByRole('radio', { name: 'Dois quilogramas' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Cinco quilogramas' })).not.toBeChecked();
  });
});
