import { useRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useLearningCapture } from '../modules/ux/hooks/useLearningCapture';

function Activity({ id }: { id: string }) {
  const scope = useRef<HTMLElement | null>(null);
  const capture = useLearningCapture({ scope });
  const [seconds, setSeconds] = useState(0);
  return <article ref={scope}><input aria-label={`Interagir ${id}`} /><button onClick={() => setSeconds(capture.current.activeSeconds)}>Ler tempo {id}</button><output data-testid={id}>{seconds}</output></article>;
}
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('tempo medido da atividade usada', () => {
  it('não atribui a cada atividade da lista o mesmo tempo da página', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-12T10:00:00Z'));
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    render(<><Activity id="A" /><Activity id="B" /></>);
    fireEvent.focusIn(screen.getByLabelText('Interagir A'));
    vi.advanceTimersByTime(10_000);
    fireEvent.focusIn(screen.getByLabelText('Interagir B'));
    vi.advanceTimersByTime(5_000);
    fireEvent.click(screen.getByRole('button', { name: 'Ler tempo B' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ler tempo A' }));
    expect(screen.getByTestId('A')).toHaveTextContent('10');
    expect(screen.getByTestId('B')).toHaveTextContent('5');
  });
  it('atividades sem interação não recebem tempo apenas porque ficaram abertas', () => {
    vi.useFakeTimers(); vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    render(<Activity id="A" />);
    vi.advanceTimersByTime(30_000);
    fireEvent.click(screen.getByRole('button', { name: 'Ler tempo A' }));
    expect(screen.getByTestId('A')).toHaveTextContent('0');
  });
});
