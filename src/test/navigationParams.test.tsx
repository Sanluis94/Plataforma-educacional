import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useNavigationParams } from '../modules/ux/hooks/useNavigationParams';
afterEach(cleanup);
function Filters() {
  const [params, update] = useNavigationParams();
  const navigate = useNavigate();
  return <><p data-testid="filters">{params.toString()}</p>
    <button onClick={() => {
      update(previous => { previous.set('bimester', '3º Bimestre'); return previous; });
      update(previous => { previous.set('level', 'pos_graduacao'); return previous; });
    }}>Escolher período e nível</button>
    <button onClick={() => update(previous => { previous.set('class', 'qa-class-b'); return previous; })}>Trocar turma</button>
    <button onClick={() => navigate(-1)}>Voltar</button>
  </>;
}
it('keeps both selections when navigation updates occur before rendering finishes', () => {
  render(<MemoryRouter initialEntries={['/professor?tab=lesson_plans&class=qa-class-a']}><Filters /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Escolher período e nível' }));
  const params = new URLSearchParams(screen.getByTestId('filters').textContent!);
  expect(params.get('bimester')).toBe('3º Bimestre');
  expect(params.get('level')).toBe('pos_graduacao');
  expect(params.get('tab')).toBe('lesson_plans');
  expect(params.get('class')).toBe('qa-class-a');
});
it('uses the restored history entry for subsequent changes', () => {
  render(<MemoryRouter initialEntries={['/professor?tab=reports&class=qa-class-a', '/professor?tab=lesson_plans&class=qa-class-b']}><Filters /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Escolher período e nível' }));
  const params = new URLSearchParams(screen.getByTestId('filters').textContent!);
  expect(params.get('tab')).toBe('reports');
  expect(params.get('class')).toBe('qa-class-a');
});
