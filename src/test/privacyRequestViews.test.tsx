import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MyData from '../modules/ux/pages/MyData';
import { PrivacyRequestsAdmin } from '../modules/ux/components/privacy/PrivacyRequestsAdmin';
import type { PrivacyRequest } from '../modules/data/repositories/privacyRequestRepository';

const fixture = vi.hoisted(() => ({ uid: 'owner-a', getMy: vi.fn(), getAdmin: vi.fn(), create: vi.fn(), update: vi.fn(), id: vi.fn() }));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: fixture.uid }, isLocalAuthMode: true }) }));
vi.mock('../modules/data/repositories/privacyRequestRepository', () => ({ getMyPrivacyRequests: fixture.getMy, getPrivacyRequestsForAdmin: fixture.getAdmin, createPrivacyRequest: fixture.create, updatePrivacyRequest: fixture.update, newPrivacyRequestId: fixture.id, PRIVACY_REQUEST_LIST_LIMIT: 200 }));
const request: PrivacyRequest = { id: 'owner-a__fictitious-id', protocol: 'DP-fictitious', ownerId: 'owner-a', kind: 'deletion', details: 'Solicito a análise de exclusão dos meus registros.', status: 'received', createdAt: '2026-10-13T12:00:00Z', updatedAt: '2026-10-13T12:00:00Z', updatedBy: 'owner-a', version: 1, resolution: '', history: [] };
beforeEach(() => { vi.clearAllMocks(); fixture.uid = 'owner-a'; fixture.getMy.mockResolvedValue([]); fixture.getAdmin.mockResolvedValue([request]); fixture.create.mockResolvedValue(request); fixture.update.mockResolvedValue({ ...request, status: 'completed', version: 2, resolution: 'Resposta fictícia documentada.' }); fixture.id.mockReturnValue(request.id); });
afterEach(cleanup);
const openMine = () => render(<MemoryRouter><MyData /></MemoryRouter>);

describe('solicitações de privacidade acessíveis e verificáveis', () => {
  it('preserva o texto e o identificador ao repetir um envio não confirmado', async () => {
    let reject!: (error: Error) => void;
    fixture.create.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
    openMine(); await screen.findByText(/ainda não registrou pedidos/);
    fireEvent.change(screen.getByLabelText('O que você precisa?'), { target: { value: 'deletion' } });
    fireEvent.change(screen.getByLabelText('Descreva o pedido'), { target: { value: request.details } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar pedido' }));
    fireEvent.click(screen.getByRole('button', { name: 'Registrando…' }));
    expect(fixture.create).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Pedido registrado\. Protocolo/)).toBeNull();
    await act(async () => reject(new Error('unavailable')));
    expect(await screen.findByRole('alert')).toHaveTextContent('registro não foi confirmado');
    expect(screen.getByLabelText('Descreva o pedido')).toHaveValue(request.details);
    fireEvent.click(screen.getByRole('button', { name: 'Registrar pedido' }));
    expect(await screen.findByText(/Pedido registrado\. Protocolo/)).toHaveTextContent(request.protocol);
    expect(fixture.id).toHaveBeenCalledTimes(1);
    expect(fixture.create.mock.calls[0][0].requestId).toBe(fixture.create.mock.calls[1][0].requestId);
    expect(screen.getByLabelText('Descreva o pedido')).toHaveValue('');
    expect(screen.getByText(/não exclui sua conta nem altera seus registros automaticamente/)).toBeVisible();
  });
  it('mostra a falha de consulta sem afirmar que a pessoa não tem pedidos', async () => {
    fixture.getMy.mockRejectedValueOnce(new Error('unavailable')); openMine();
    expect(await screen.findByRole('alert')).toHaveTextContent('consultar seus pedidos');
    expect(screen.queryByText(/ainda não registrou pedidos/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar solicitações' }));
    expect(await screen.findByText(/ainda não registrou pedidos/)).toBeVisible();
  });
  it('troca de conta descarta o rascunho e ignora a resposta atrasada da conta anterior', async () => {
    let complete!: (items: PrivacyRequest[]) => void;
    fixture.getMy.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; })).mockResolvedValueOnce([]);
    const view = openMine();
    fireEvent.change(screen.getByLabelText('Descreva o pedido'), { target: { value: 'Rascunho privado da conta A.' } });
    fixture.uid = 'owner-b'; view.rerender(<MemoryRouter><MyData /></MemoryRouter>);
    expect(await screen.findByText(/ainda não registrou pedidos/)).toBeVisible();
    await act(async () => complete([request]));
    expect(screen.queryByText(request.protocol)).toBeNull();
    expect(screen.getByLabelText('Descreva o pedido')).toHaveValue('');
  });
  it('trata erro na atribuição de protocolo sem deixar o formulário preso em envio', async () => {
    fixture.id.mockImplementationOnce(() => { throw new Error('uuid unavailable'); }); openMine();
    fireEvent.change(screen.getByLabelText('Descreva o pedido'), { target: { value: request.details } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar pedido' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('registro não foi confirmado');
    expect(screen.getByRole('button', { name: 'Registrar pedido' })).toBeEnabled();
    expect(fixture.create).not.toHaveBeenCalled();
  });
  it('resposta final exige explicação e conserva o texto se a atualização falhar', async () => {
    fixture.update.mockRejectedValueOnce(new Error('version conflict')); render(<PrivacyRequestsAdmin />);
    await screen.findByText(`Protocolo: ${request.protocol}`);
    fireEvent.change(screen.getByLabelText('Atualizar atendimento'), { target: { value: 'completed' } });
    expect(screen.getByRole('button', { name: 'Salvar atendimento' })).toBeDisabled();
    const response = 'Foram realizadas as medidas descritas no atendimento.';
    fireEvent.change(screen.getByLabelText('Nota de acompanhamento ou resposta ao solicitante'), { target: { value: response } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar atendimento' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('versão atual');
    expect(screen.getByLabelText('Nota de acompanhamento ou resposta ao solicitante')).toHaveValue(response);
    expect(fixture.update).toHaveBeenCalledWith({ requestId: request.id, status: 'completed', resolution: response, expectedVersion: 1 });
    expect(screen.queryByText(/Atendimento salvo/)).toBeNull();
  });
  it('mostra resposta e histórico terminal sem oferecer nova edição ou executar exclusão', async () => {
    const closed = { ...request, status: 'completed', version: 2, resolution: 'Resposta confirmada da administração.', history: [{ status: 'completed', at: '2026-10-13T13:00:00Z', by: 'admin-a', resolution: 'Resposta confirmada da administração.' }] };
    fixture.getAdmin.mockResolvedValueOnce([closed]); render(<PrivacyRequestsAdmin />);
    expect(await screen.findByText(/Situação: Respondida/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Salvar atendimento' })).toBeNull();
    expect(screen.getByText('Histórico do atendimento (1)')).toBeVisible();
    expect(fixture.update).not.toHaveBeenCalled();
  });
  it('conteúdo de pedido é texto e não HTML executável', async () => {
    fixture.getMy.mockResolvedValueOnce([{ ...request, details: '<img src=x onerror=alert(1)>' }]); openMine();
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeVisible();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });
  it('confirma resposta somente depois de a atualização ser reconhecida', async () => {
    render(<PrivacyRequestsAdmin />); await screen.findByText(`Protocolo: ${request.protocol}`);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar atendimento' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Atendimento salvo'));
    expect(fixture.update).toHaveBeenCalledTimes(1);
  });
});
