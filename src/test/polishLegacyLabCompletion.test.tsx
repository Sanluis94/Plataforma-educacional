import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HardSkillsSimulator } from '../modules/ux/pages/simuladores/HardSkillsSimulator';
import { SoftSkillsModule } from '../modules/ux/pages/simuladores/SoftSkillsModule';
import { EssayModule } from '../modules/ux/pages/simuladores/EssayModule';
import { MathSimulator } from '../modules/ux/pages/simuladores/MathSimulator';
import { PhilosophySimulator } from '../modules/ux/pages/simuladores/PhilosophySimulator';

vi.mock('../modules/core/services/geminiService', () => ({ analyzeEssayWithGemini: vi.fn().mockResolvedValue({ score: 420, comments: ['Orientação local'], source: 'local' }) }));
afterEach(cleanup);

it('a matemática só registra após interação e conserva retry quando o salvamento falha', async () => {
  const complete=vi.fn().mockRejectedValueOnce(new Error('sem conexão')).mockResolvedValueOnce(true);
  render(<MathSimulator mode="linear" onComplete={complete}/>);
  expect(screen.getByRole('button',{name:'Registrar exploração'})).toBeDisabled();
  fireEvent.change(screen.getAllByRole('slider')[0],{target:{value:'3'}});
  fireEvent.click(screen.getByRole('button',{name:'Registrar exploração'}));
  await screen.findByRole('alert');expect(complete).toHaveBeenLastCalledWith(0);
  fireEvent.click(screen.getByRole('button',{name:'Registrar exploração'}));
  await screen.findByRole('button',{name:'Exploração registrada'});
  expect(complete).toHaveBeenCalledTimes(2);
});

it('argumentação conserva os casos ao falhar o registro e só confirma após retry', async () => {
  const complete=vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(<PhilosophySimulator mode="ethics" onComplete={complete}/>);
  await screen.findByRole('heading',{name:/construção de argumentos/});
  expect(screen.getByRole('button',{name:'Registrar exploração'})).toBeDisabled();
  for(const button of screen.getAllByRole('button').filter(button=>button.hasAttribute('aria-pressed'))){
    fireEvent.click(button);for(const field of screen.getAllByRole('textbox'))fireEvent.change(field,{target:{value:'Argumento e observações suficientes para comparar os casos.'}});
  }
  fireEvent.click(screen.getByRole('button',{name:'Registrar exploração'}));await screen.findByRole('alert');
  expect(screen.getAllByRole('textbox')[0]).toHaveValue('Argumento e observações suficientes para comparar os casos.');
  fireEvent.click(screen.getByRole('button',{name:'Registrar exploração'}));await screen.findByRole('button',{name:'Exploração registrada'});
  expect(complete).toHaveBeenCalledTimes(2);expect(complete).toHaveBeenLastCalledWith(0);
});

it('o raciocínio técnico precisa das etapas e registro não promete XP nem nota perfeita', async () => {
  const complete = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(<HardSkillsSimulator onComplete={complete} />);
  expect(screen.getByRole('button', { name: 'Registrar exploração' })).toBeDisabled();
  for (let index = 0; index < 10 && screen.queryByRole('textbox'); index++) {
    fireEvent.change(screen.getByRole('textbox'), { target: { value: `Raciocínio da etapa ${index}` } });
    fireEvent.click(screen.getByRole('button', { name: /Próximo Passo|Concluir Desafio/ }));
  }
  const submit = screen.getByRole('button', { name: 'Registrar exploração' });
  expect(submit).toBeEnabled();
  fireEvent.click(submit);
  await screen.findByRole('alert');
  expect(screen.queryByRole('button', { name: 'Exploração registrada' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Registrar exploração' }));
  await screen.findByRole('button', { name: 'Exploração registrada' });
  expect(complete).toHaveBeenLastCalledWith(0);
  expect(screen.queryByText(/50 XP|10 Moedas/)).not.toBeInTheDocument();
});

it('o cenário socioemocional conserva a ação de registro depois da conclusão sem anunciar IA', async () => {
  const complete = vi.fn().mockResolvedValue(true);
  render(<SoftSkillsModule onComplete={complete} />);
  expect(screen.queryByText(/Avaliação de IA|Feedback da IA/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Chamar a pessoa em particular/ }));
  expect(screen.getByText(/não são XP nem moedas/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Finalizar Trilha' }));
  fireEvent.click(screen.getByRole('button', { name: 'Registrar exploração' }));
  await screen.findByRole('button', { name: 'Exploração registrada' });
  expect(complete).toHaveBeenCalledExactlyOnceWith(0);
});

it('redação só registra a exploração após uma análise, sem converter a estimativa em nota oficial', async () => {
  const complete = vi.fn().mockResolvedValue(true);
  render(<EssayModule onComplete={complete} />);
  expect(screen.getByRole('button', { name: 'Registrar exploração' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Minha redação' }), { target: { value: Array(45).fill('palavra').join(' ') } });
  fireEvent.click(screen.getByRole('button', { name: 'Analisar meu texto' }));
  await screen.findByText('Orientação local');
  fireEvent.click(screen.getByRole('button', { name: 'Registrar exploração' }));
  await screen.findByRole('button', { name: 'Exploração registrada' });
  expect(complete).toHaveBeenCalledExactlyOnceWith(0);
  expect(screen.getByText(/não.*nota oficial/)).toBeInTheDocument();
});
