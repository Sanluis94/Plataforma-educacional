import { describe, expect, it } from 'vitest';
import { productionEnvironment } from '../../scripts/dev/productionEnvironment';

const project = 'production-fixture';
const validEnvironment = {
  VITE_FIREBASE_API_KEY: 'firebase-public-fixture',
  VITE_FIREBASE_AUTH_DOMAIN: 'production-fixture.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: project,
  VITE_FIREBASE_STORAGE_BUCKET: 'production-fixture.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
  VITE_FIREBASE_APP_ID: '1:1234567890:web:fixture',
};

describe('ambiente repetível da compilação de produção', () => {
  it.each(Object.keys(validEnvironment))('recusa o campo obrigatório ausente ou vazio %s', field => {
    for (const value of [undefined, '', '   ']) {
      const source = { ...validEnvironment, [field]: value };
      expect(() => productionEnvironment(source, project)).toThrow(field);
    }
  });

  it('recusa um projeto diferente do alias production sem imprimir seus valores', () => {
    const source = { ...validEnvironment, VITE_FIREBASE_PROJECT_ID: 'wrong-private-project' };
    expect(() => productionEnvironment(source, project)).toThrow('não corresponde ao alias production');
    try { productionEnvironment(source, project); } catch (error) {
      expect(String(error)).not.toContain(source.VITE_FIREBASE_PROJECT_ID);
      expect(String(error)).not.toContain(source.VITE_FIREBASE_API_KEY);
    }
  });

  it('recusa valores fictícios do exemplo de configuração', () => {
    expect(() => productionEnvironment({ ...validEnvironment, VITE_FIREBASE_API_KEY: 'SUA_CHAVE' }, project))
      .toThrow('Configuração Firebase fictícia: VITE_FIREBASE_API_KEY');
  });

  it.each([undefined, null, '', '   ', 'demo-kortex'])('recusa um alias production inválido: %j', alias => {
    expect(() => productionEnvironment(validEnvironment, alias)).toThrow('alias production');
  });

  it('limpa a chave privada e desativa emuladores sem modificar o ambiente recebido', () => {
    const source = Object.freeze({
      ...validEnvironment,
      NODE_ENV: 'development',
      VITE_USE_FIREBASE_EMULATORS: 'true',
      VITE_GEMINI_API_KEY: 'private-fixture-never-publish',
      PATH: 'preserve-runtime-path',
    });
    const result = productionEnvironment(source, project);
    expect(result).toMatchObject({
      ...validEnvironment, NODE_ENV: 'production', VITE_USE_FIREBASE_EMULATORS: 'false',
      VITE_GEMINI_API_KEY: '', VITE_DISABLE_AI: 'false', PATH: source.PATH,
    });
    expect(source.NODE_ENV).toBe('development');
    expect(source.VITE_USE_FIREBASE_EMULATORS).toBe('true');
    expect(source.VITE_GEMINI_API_KEY).toBe('private-fixture-never-publish');
    expect(source).not.toHaveProperty('VITE_DISABLE_AI');
    expect(result).not.toBe(source);
  });

  it.each([undefined, '', 'false', 'TRUE', 'true'])('preserva a desativação explícita de IA para %j', flag => {
    const result = productionEnvironment({ ...validEnvironment, VITE_DISABLE_AI: flag }, project);
    expect(result.VITE_DISABLE_AI).toBe(flag === 'true' ? 'true' : 'false');
    expect(result.VITE_GEMINI_API_KEY).toBe('');
  });
});
