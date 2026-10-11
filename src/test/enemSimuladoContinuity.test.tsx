import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EnemSimuladoView } from '../modules/ux/pages/EnemSimuladoView';
import { BANCO_ITENS_ENEM_PADRAO, processarSimuladoEnemTRI } from '../modules/data/services/triCalculationService';
import { createEnemAttempt, ENEM_DURATION_SECONDS, enemAttemptStorageKey, readEnemAttempt } from '../modules/data/services/enemAttemptSession';

const auth = vi.hoisted(() => ({ currentUser: { uid: 'student-a' }, userData: { role: 'estudante', name: 'Nome privado', email: 'email-privado@example.test' } }));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => auth }));
const items = BANCO_ITENS_ENEM_PADRAO;
const now = new Date('2026-10-11T12:00:00Z').getTime();
const key = enemAttemptStorageKey('student-a');

function page(url = '/enem') {
  return <MemoryRouter initialEntries={[url]}><EnemSimuladoView /></MemoryRouter>;
}
function start() { fireEvent.click(screen.getByRole('button', { name: 'Começar simulado' })); }
function chooseAnswer(itemIndex: number, optionIndex = items[itemIndex].respostaCorreta) {
  fireEvent.click(screen.getByRole('radio', { name: `${String.fromCharCode(65 + optionIndex)}. ${items[itemIndex].opcoes[optionIndex]}` }));
}
function savedAttempt() { return JSON.parse(sessionStorage.getItem(key)!); }

beforeEach(() => {
  sessionStorage.clear();
  auth.currentUser.uid = 'student-a';
  auth.userData.role = 'estudante';
  vi.useFakeTimers();
  vi.setSystemTime(now);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('Continuidade e precisão do treino ENEM', () => {
  it('explica quantidade/duração e só inicia o prazo após começar', () => {
    render(page());
    expect(screen.getByText(`${items.length} questões · 30 minutos`)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(120_000));
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(key)).toBeNull();
    start();
    expect(screen.getByRole('timer', { name: 'Tempo restante' })).toHaveTextContent('30:00');
    expect(savedAttempt()).toMatchObject({ status: 'active', startedAt: now + 120_000, deadlineAt: now + 120_000 + ENEM_DURATION_SECONDS * 1000 });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('timer')).toHaveTextContent('29:59');
  });

  it('restaura respostas e questão após sair/atualizar sem reiniciar o prazo', () => {
    const view = render(page());
    start();
    chooseAnswer(0);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    chooseAnswer(1, 0);
    expect(savedAttempt()).toMatchObject({ currentIndex: 1, answers: { [items[0].id]: items[0].respostaCorreta, [items[1].id]: 0 } });
    expect(sessionStorage.getItem(key)).not.toMatch(/Nome privado|email-privado|userData|currentUser/);
    view.unmount();
    vi.setSystemTime(now + 120_000);
    render(page());
    expect(screen.getByRole('heading', { name: `Questão 2 de ${items.length}` })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: `A. ${items[1].opcoes[0]}` })).toBeChecked();
    expect(screen.getByRole('timer')).toHaveTextContent('28:00');
    expect(savedAttempt().deadlineAt).toBe(now + ENEM_DURATION_SECONDS * 1000);
  });

  it('separa tentativas por UID inclusive numa troca de conta sem desmontar a página', () => {
    const view = render(page());
    start();
    chooseAnswer(0);
    auth.currentUser.uid = 'student-b';
    view.rerender(page());
    expect(screen.getByRole('heading', { name: 'Antes de começar' })).toBeInTheDocument();
    expect(sessionStorage.getItem(enemAttemptStorageKey('student-b'))).toBeNull();
    start();
    chooseAnswer(0, (items[0].respostaCorreta + 1) % items[0].opcoes.length);
    auth.currentUser.uid = 'student-a';
    view.rerender(page());
    expect(screen.getByRole('radio', { name: `${String.fromCharCode(65 + items[0].respostaCorreta)}. ${items[0].opcoes[items[0].respostaCorreta]}` })).toBeChecked();
  });

  it('confirma faltantes com foco, ciclo de Tab e Escape restaurando o acionador', () => {
    render(page());
    start();
    const trigger = screen.getByRole('button', { name: 'Finalizar simulado' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Entregar com questões em branco?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription(`Faltam ${items.length} de ${items.length} respostas. Se entregar agora, elas serão registradas como não respondidas e não poderão ser alteradas nesta tentativa.`);
    const cancel = within(dialog).getByRole('button', { name: 'Continuar respondendo' });
    const submit = within(dialog).getByRole('button', { name: 'Entregar mesmo assim' });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true });
    expect(submit).toHaveFocus();
    fireEvent.keyDown(submit, { key: 'Tab' });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(cancel, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(savedAttempt().status).toBe('active');
  });

  it('entrega somente após confirmação, conserva resultado e reinicia na preparação', () => {
    const view = render(page('/enem?returnTo=%2Fsimulacao%3Flevel%3Dmedio'));
    start();
    chooseAnswer(0);
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar simulado' }));
    expect(screen.getByRole('dialog')).toHaveTextContent(`Faltam ${items.length - 1} de ${items.length} respostas`);
    fireEvent.click(screen.getByRole('button', { name: 'Entregar mesmo assim' }));
    expect(screen.getByRole('heading', { name: 'Resultado do treino' })).toHaveFocus();
    expect(screen.getByText('Nota estimada')).toBeInTheDocument();
    expect(savedAttempt()).toMatchObject({ status: 'finished', completionReason: 'submitted', result: { acertosBrutos: 1 } });
    const result = savedAttempt().result;
    expect(screen.getByRole('link', { name: 'Voltar para onde eu estava' })).toHaveAttribute('href', '/simulacao?level=medio');
    view.unmount();
    vi.setSystemTime(now + 7_200_000);
    render(page());
    expect(screen.getByRole('heading', { name: 'Resultado do treino' })).toBeInTheDocument();
    expect(savedAttempt().result).toEqual(result);
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fazer outro simulado' }));
    expect(screen.getByRole('button', { name: 'Começar simulado' })).toBeInTheDocument();
    expect(sessionStorage.getItem(key)).toBeNull();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('finaliza no prazo com as respostas mais recentes e fecha a confirmação aberta', () => {
    render(page());
    start();
    chooseAnswer(0);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    chooseAnswer(1);
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar simulado' }));
    vi.setSystemTime(now + ENEM_DURATION_SECONDS * 1000 - 1000);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('O tempo terminou');
    expect(savedAttempt()).toMatchObject({ completionReason: 'expired', result: { acertosBrutos: 2 } });
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('restaura tentativa vencida como resultado, sem acrescentar tempo ou respostas', () => {
    const view = render(page());
    start();
    chooseAnswer(0);
    view.unmount();
    vi.setSystemTime(now + ENEM_DURATION_SECONDS * 1000 + 60_000);
    render(page());
    expect(screen.getByRole('heading', { name: 'Resultado do treino' })).toBeInTheDocument();
    expect(savedAttempt()).toMatchObject({ completionReason: 'expired', result: { acertosBrutos: 1 } });
    expect(screen.queryByRole('button', { name: 'Começar simulado' })).not.toBeInTheDocument();
  });

  it('não permite marcar outra resposta depois do prazo mesmo antes do próximo tick', () => {
    render(page());
    start();
    chooseAnswer(0);
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    vi.setSystemTime(now + ENEM_DURATION_SECONDS * 1000 + 1);
    chooseAnswer(1);
    expect(savedAttempt().result.acertosBrutos).toBe(1);
    expect(savedAttempt().answers[items[1].id]).toBeUndefined();
  });

  it('entrega todas as respostas sem confirmação e mantém o resultado matemático', () => {
    render(page());
    start();
    items.forEach((item, index) => {
      chooseAnswer(index, item.respostaCorreta);
      if (index < items.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entregar simulado' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(savedAttempt().result).toEqual(processarSimuladoEnemTRI(items, items.map(item => ({ itemId: item.id, respostaEscolhida: item.respostaCorreta }))));
    expect(screen.queryByText(/Relatório Oficial|ENEM OFICIAL|algoritmo estatístico do INEP|Projeção de corte federal/)).not.toBeInTheDocument();
  });

  it.each([['estudante', '/estudante'], ['professor', '/professor'], ['coordenador', '/coordenacao'], ['admin', '/admin']])('retorna %s ao painel do perfil', (role, path) => {
    auth.userData.role = role;
    render(page());
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', path);
  });

  it.each(['/admin', '//example.test', '/enem?level=medio'])('descarta destino de retorno inválido, proibido ou circular: %s', (returnTo) => {
    render(page(`/enem?returnTo=${encodeURIComponent(returnTo)}`));
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/estudante');
  });

  it('avisa quando o navegador bloqueia o salvamento e permite continuar respondendo', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    render(page());
    start();
    chooseAnswer(0);
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar a tentativa nesta aba');
    expect(screen.getByRole('status')).toHaveTextContent('Respondidas: 1');
    expect(screen.getByRole('timer')).toHaveTextContent('30:00');
  });

  it('ignora dados corrompidos ou de outro banco e recupera apenas respostas válidas', () => {
    sessionStorage.setItem(key, '{broken');
    expect(readEnemAttempt('student-a').status).toBe('ready');
    const attempt = { ...createEnemAttempt(), status: 'active', startedAt: now, deadlineAt: now + ENEM_DURATION_SECONDS * 1000, currentIndex: 200, answers: { [items[0].id]: 0, [items[1].id]: 500, extra: 1 } };
    sessionStorage.setItem(key, JSON.stringify(attempt));
    expect(readEnemAttempt('student-a')).toMatchObject({ status: 'active', currentIndex: items.length - 1, answers: { [items[0].id]: 0 } });
    sessionStorage.setItem(key, JSON.stringify({ ...attempt, itemIds: ['other-bank'] }));
    expect(readEnemAttempt('student-a').status).toBe('ready');
  });
});
