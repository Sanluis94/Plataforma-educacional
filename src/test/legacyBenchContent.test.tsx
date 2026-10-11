import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MicroscopeSimulator } from '../modules/ux/pages/simuladores/MicroscopeSimulator';
import { LanguagesModule } from '../modules/ux/pages/simuladores/LanguagesModule';
import { PhilosophySimulator } from '../modules/ux/pages/simuladores/PhilosophySimulator';
import { LAB_LEARNING_CONTENT } from '../modules/core/content/labLearningContent';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Conteúdo específico nas bancadas da biblioteca inicial', () => {
  it.each([
    ['genetics', 'Sangue Humano', 'genótipos'],
    ['anatomy', 'Sangue Humano', 'tecido sanguíneo'],
    ['ecosystems', 'Bactéria (Procarionte)', 'funções ecológicas'],
    ['evolution', 'Bactéria (Procarionte)', 'populações e gerações'],
  ])('abre o esquema de apoio correto em %s e explica seu limite', (mode, selected, limit) => {
    render(<MicroscopeSimulator mode={mode} />);
    expect(screen.getByRole('button', { name: new RegExp(selected.replace(/[()]/g, '\\$&')) })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(new RegExp(limit))).toBeVisible();
    expect(screen.getByText('Ampliação gráfica do esquema')).toBeVisible();
    expect(screen.queryByText(/IA biológica/)).toBeNull();
  });

  it('pratica diálogos próprios, conclui a última expressão e reinicia ao trocar de idioma', () => {
    const completed = vi.fn();
    render(<LanguagesModule mode="conversation" onComplete={completed} />);
    expect(screen.getByText('Could you repeat that, please?')).toBeVisible();
    expect(screen.queryByText('Sustainable')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Registrar resultado do módulo' })).toBeNull();
    for (const [index, answer] of ['Você poderia repetir, por favor?', 'Onde fica a biblioteca?', 'Obrigado pela sua ajuda.'].entries()) {
      fireEvent.click(screen.getByRole('button', { name: answer }));
      expect(screen.getByText(new RegExp(`^Tradução: ${answer.replace(/[?.]/g, '\\$&')}$`))).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: index === 2 ? 'Ver resultado' : 'Próxima expressão →' }));
    }
    expect(screen.getByRole('heading', { name: 'Módulo concluído! 3/3 acertos' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Registrar resultado do módulo' }));
    expect(completed).toHaveBeenCalledExactlyOnceWith(100);
    fireEvent.click(screen.getByRole('button', { name: /Espanhol/ }));
    expect(screen.getByText('¿Podrías repetirlo, por favor?')).toBeVisible();
    expect(screen.queryByText(/Módulo concluído/)).toBeNull();
  });

  it('oferece leitura escrita quando não existe síntese de voz', () => {
    vi.stubGlobal('SpeechSynthesisUtterance', undefined);
    render(<LanguagesModule mode="listening" />);
    fireEvent.click(screen.getByRole('button', { name: /Ouvir Pronúncia/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Use a expressão e o exemplo escritos para continuar.');
  });

  it('liga cada modo filosófico aos casos do seu tópico, sem diagnosticar a personalidade', () => {
    for (const [index, mode] of ['ethics', 'cave_myth', 'contractualism', 'logic', 'political_philosophy', 'epistemology'].entries()) {
      const content = LAB_LEARNING_CONTENT[`fil_${index + 1}`];
      const view = render(<PhilosophySimulator mode={mode} />);
      expect(screen.getByText(content.scenarios[0].situation)).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Consultar comentário de referência' }));
      expect(screen.getByText(content.scenarios[0].explanation)).toBeVisible();
      expect(screen.queryByText(/perfil reflexivo|Diagnóstico filosófico/i)).toBeNull();
      view.unmount();
    }
  });

  it('mantém argumentos separados por caso e registra somente após explorar os três', () => {
    const completed = vi.fn();
    const content = LAB_LEARNING_CONTENT.fil_4;
    render(<PhilosophySimulator mode="logic" onComplete={completed} />);
    const finish = screen.getByRole('button', { name: 'Registrar exploração dos casos' });
    expect(finish).toBeDisabled();
    for (const [index, scenario] of content.scenarios.entries()) {
      fireEvent.click(screen.getByRole('button', { name: scenario.label }));
      expect(screen.getByLabelText('Minha posição sobre o caso')).toHaveValue('');
      for (const label of ['Minha posição sobre o caso', 'Razão ou premissa que sustenta minha posição', 'Uma objeção que minha posição precisa enfrentar', 'Minha resposta à objeção ou revisão da posição']) {
        fireEvent.change(screen.getByLabelText(label), { target: { value: `Argumento do caso ${index + 1}: ${label}.` } });
      }
    }
    fireEvent.click(screen.getByRole('button', { name: content.scenarios[0].label }));
    expect(screen.getByLabelText('Minha posição sobre o caso')).toHaveValue('Argumento do caso 1: Minha posição sobre o caso.');
    expect(screen.getByRole('status')).toHaveTextContent('3 de 3');
    fireEvent.click(finish);
    expect(completed).toHaveBeenCalledExactlyOnceWith(100);
    expect(screen.getByRole('button', { name: 'Exploração registrada' })).toBeDisabled();
  });
});
