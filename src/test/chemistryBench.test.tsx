import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ChemistryLab } from '../modules/ux/pages/simuladores/ChemistryLab';

afterEach(cleanup);

describe('Consistência conceitual da bancada de química', () => {
  it('não calcula pH de mistura pela média nem deduz neutralização sem quantidades', () => {
    render(<ChemistryLab />);
    fireEvent.click(screen.getByRole('button', { name: /Ácido Clorídrico/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar reagente ao tubo 1' }));
    expect(screen.getByText('pH 1.0')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Hidróxido de Sódio/ }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Adicionar reagente ao tubo 1' }), { key: 'Enter' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Misturar' })[0]);
    expect(screen.getByText('pH indeterminado')).toBeVisible();
    expect(screen.getByText(/Faltam volumes, concentrações e dados de equilíbrio/)).toBeVisible();
    expect(screen.queryByText('pH 7.0')).toBeNull();
    expect(screen.queryByText(/equilíbrio químico alcançado/)).toBeNull();
  });

  it('distingue equivalência ácido forte/base forte da viragem básica do indicador', () => {
    render(<ChemistryLab mode="titration" />);
    expect(screen.getByText('pH = 7,0 (fenolftaleína incolor)')).toBeVisible();
    expect(screen.getByText(/1,25 mmol de cada/)).toBeVisible();
  });

  it('identifica quem sofre oxidação e quem atua como agente oxidante na pilha', () => {
    render(<ChemistryLab mode="electrochemistry" />);
    expect(screen.getByText(/Zn é o agente redutor/)).toBeVisible();
    expect(screen.getByText(/Cu²⁺ é o agente oxidante/)).toBeVisible();
  });
});
