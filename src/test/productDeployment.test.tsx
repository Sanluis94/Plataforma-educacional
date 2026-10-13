import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { privacyRequestUrl, readProductDeployment } from '../modules/core/config/productDeployment';
import ProductInformation from '../modules/ux/pages/ProductInformation';

afterEach(cleanup);
describe('publicação responsável por instalação', () => {
  const commercial = { VITE_PUBLIC_RELEASE_STAGE: 'commercial', VITE_INSTALLATION_MODE: 'school', VITE_INSTALLATION_ID: 'school-fixture', VITE_DATA_CONTROLLER_NAME: 'Escola fictícia', VITE_PRIVACY_CONTACT_EMAIL: 'privacidade@example.test' };
  it('mantém um piloto sem inventar responsável ou endereço de atendimento', () => {
    const deployment = readProductDeployment({});
    expect(deployment.stage).toBe('pilot');
    expect(deployment.mode).toBe('pilot');
    expect(deployment.controllerName).toBe('');
    expect(deployment.privacyEmail).toBe('');
  });
  it.each(['VITE_INSTALLATION_ID', 'VITE_INSTALLATION_MODE', 'VITE_DATA_CONTROLLER_NAME', 'VITE_PRIVACY_CONTACT_EMAIL'])('bloqueia lançamento comercial sem %s', field => {
    expect(() => readProductDeployment({ ...commercial, [field]: '' })).toThrow('Publicação comercial exige');
  });
  it('permite configurar escola e uso doméstico sem exigir CNPJ fictício', () => {
    for (const mode of ['school', 'home']) {
      expect(readProductDeployment({ ...commercial, VITE_INSTALLATION_MODE: mode }).mode).toBe(mode);
    }
  });
  it('recusa contato inválido e etapa de publicação desconhecida', () => {
    expect(() => readProductDeployment({ VITE_PRIVACY_CONTACT_EMAIL: 'invalid\ncontact' })).toThrow('E-mail');
    expect(() => readProductDeployment({ VITE_PRIVACY_CONTACT_EMAIL: 'name?subject=other@example.test' })).toThrow('E-mail');
    expect(() => readProductDeployment({ VITE_PUBLIC_RELEASE_STAGE: 'ready' })).toThrow('Etapa');
    expect(() => readProductDeployment({ VITE_INSTALLATION_MODE: 'shared' })).toThrow('Tipo');
  });
  it('prepara contato sem afirmar que o pedido foi enviado', () => {
    const url = privacyRequestUrl('privacidade@example.test', 'rights', 'Escola & casa');
    expect(url.startsWith('mailto:privacidade@example.test?')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('body')).toContain('Escola & casa');
    expect(params.get('body')).toContain('Não envie senhas');
  });
  it.each(['privacy', 'terms', 'safety'] as const)('exibe %s sem login e sem canal de atendimento fictício', topic => {
    render(<MemoryRouter><ProductInformation topic={topic} /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
    expect(screen.getByText('Produto em preparação.')).toBeVisible();
    expect(screen.getAllByText(/canal de atendimento ainda será definido/).length).toBeGreaterThan(0);
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(screen.getByRole('navigation', { name: 'Informações do produto' })).toBeVisible();
  });
});
