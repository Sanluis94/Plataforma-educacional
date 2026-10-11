import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LabLearningWorkspace } from '../modules/ux/components/labs/LabLearningWorkspace';
import LegacyLabRunner from '../modules/ux/components/labs/LegacyLabRunner';
import { getLabLearningContent } from '../modules/core/content/labLearningContent';
import { resolveUniversalLab } from '../modules/core/constants/masterLabsCatalog';
import { NEW_ADVANCED_LABS } from '../modules/core/constants/advancedLabsRegistry';

vi.mock('../modules/core/constants/dashboardConstants', () => ({ ALL_MODULES: [{ labs: [{
  id: 'math_1', props: {}, component: ({ onComplete }: { onComplete: (score: number) => void }) => <button onClick={() => onComplete(67)}>Concluir bancada com 67</button>,
}] }] }));
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Regressões na integração das bancadas', () => {
  it('mantém parâmetros e dados, pausa efeitos fora da bancada e retoma ao voltar', () => {
    vi.useFakeTimers();
    const ticks = vi.fn();
    function Bench() {
      const [value, setValue] = useState('1');
      const [rows, setRows] = useState(0);
      useEffect(() => {
        const timer = setInterval(() => { ticks(); setRows(count => count + 1); }, 10);
        return () => clearInterval(timer);
      }, []);
      return <div><label>Massa de teste<input value={value} onChange={event => setValue(event.target.value)} /></label><output aria-label="Dados de teste">{rows}</output></div>;
    }
    render(<LabLearningWorkspace labId="math_1" title="Teste" subject="Matemática" objective="Investigar" content={getLabLearningContent('math_1')}><Bench /></LabLearningWorkspace>);
    expect(screen.queryByLabelText('Massa de teste')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir bancada' }));
    fireEvent.change(screen.getByLabelText('Massa de teste'), { target: { value: '3' } });
    act(() => vi.advanceTimersByTime(50));
    expect(screen.getByLabelText('Dados de teste')).toHaveTextContent('5');
    fireEvent.click(screen.getByRole('button', { name: 'Roteiro e avaliação' }));
    const before = ticks.mock.calls.length;
    act(() => vi.advanceTimersByTime(100));
    expect(ticks).toHaveBeenCalledTimes(before);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir bancada' }));
    expect(screen.getByLabelText('Massa de teste')).toHaveValue('3');
    expect(screen.getByLabelText('Dados de teste')).toHaveTextContent('5');
    act(() => vi.advanceTimersByTime(10));
    expect(screen.getByLabelText('Dados de teste')).toHaveTextContent('6');
  });

  it('preserva a nota 67 da bancada no contrato de relatório de 0 a 10', () => {
    const complete = vi.fn();
    render(<MemoryRouter><LegacyLabRunner labId="math_1" onComplete={complete} /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir bancada' }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir bancada com 67' }));
    expect(complete).toHaveBeenCalledExactlyOnceWith({ score: 6.7, telemetryRows: 0 });
  });

  it.each(Object.keys(NEW_ADVANCED_LABS))('mantém teoria e equações originais de %s junto ao roteiro novo', id => {
    const resolved = resolveUniversalLab(id);
    expect(resolved.theoreticalBackground).toContain(NEW_ADVANCED_LABS[id].theoreticalBackground);
    expect(resolved.theoreticalBackground).toContain(getLabLearningContent(id)!.workedExample);
    expect(resolved.physicsStep).toBe(NEW_ADVANCED_LABS[id].physicsStep);
    expect(resolved.parameters).toBe(NEW_ADVANCED_LABS[id].parameters);
  });
});
