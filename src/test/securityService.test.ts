import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  isValidSafeUrl,
  validatePasswordStrength,
  maskSensitiveEmail,
  isAuthorizedRole
} from '../modules/core/services/securityService';

describe('Security Service — Prevenção XSS e Sanitização', () => {
  it('deve remover tags <script> maliciosas de textos e inputs', () => {
    const maliciousInput = 'Olá <script>alert("hack")</script> pessoal!';
    const cleaned = sanitizeText(maliciousInput);
    expect(cleaned).toBe('Olá  pessoal!');
    expect(cleaned).not.toContain('<script>');
  });

  it('deve remover tags <iframe>, <object> e <embed>', () => {
    const attack = 'Veja isso: <iframe src="http://evil.com"></iframe> e <embed src="evil.swf"/>';
    const cleaned = sanitizeText(attack);
    expect(cleaned).not.toContain('<iframe');
    expect(cleaned).not.toContain('<embed');
  });

  it('deve neutralizar handlers de eventos inline perigosos (onerror, onload, onclick)', () => {
    const attack = '<img src="invalid.jpg" onerror="alert(document.cookie)" onload="steal()" />';
    const cleaned = sanitizeText(attack);
    expect(cleaned).not.toContain('onerror');
    expect(cleaned).not.toContain('onload');
  });

  it('deve bloquear pseudo-protocolos javascript: e data:text/html', () => {
    const attack = '<a href="javascript:alert(1)">Clique aqui</a>';
    const cleaned = sanitizeText(attack);
    expect(cleaned).not.toContain('javascript:');
    expect(cleaned).toContain('unsafe-protocol:');
  });

  it('deve preservar textos e símbolos científicos legítimos', () => {
    const scientific = 'Equação: E = m*c^2 e F = G*(m1*m2)/r^2. H2O + CO2 -> H2CO3';
    expect(sanitizeText(scientific)).toBe(scientific);
  });
});

describe('Security Service — Validação de URLs Seguras', () => {
  it('deve aprovar URLs HTTPS e HTTP legítimas', () => {
    expect(isValidSafeUrl('https://phet.colorado.edu')).toBe(true);
    expect(isValidSafeUrl('http://mec.gov.br/artigo-educacional')).toBe(true);
    expect(isValidSafeUrl('https://pt.wikipedia.org/wiki/F%C3%ADsica')).toBe(true);
  });

  it('deve aprovar documentos base64 seguros (PDFs e Imagens)', () => {
    expect(isValidSafeUrl('data:application/pdf;base64,JVBERi0xLjQK...')).toBe(true);
    expect(isValidSafeUrl('data:image/png;base64,iVBORw0KGgoAAA...')).toBe(true);
    expect(isValidSafeUrl('data:image/jpeg;base64,/9j/4AAQSkZJRg...')).toBe(true);
  });

  it('deve rejeitar URLs perigosas com javascript:, vbscript: e file:', () => {
    expect(isValidSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isValidSafeUrl('javascript://alert(1)')).toBe(false);
    expect(isValidSafeUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isValidSafeUrl('file:///C:/Windows/System32/calc.exe')).toBe(false);
    expect(isValidSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('deve rejeitar entradas vazias ou strings inválidas', () => {
    expect(isValidSafeUrl('')).toBe(false);
    expect(isValidSafeUrl('not-a-valid-url')).toBe(false);
  });
});

describe('Security Service — Validação de Senha e Privacidade', () => {
  it('deve avaliar a força da senha corretamente', () => {
    const weak = validatePasswordStrength('12345');
    expect(weak.isStrong).toBe(false);
    expect(weak.feedback.length).toBeGreaterThan(0);

    const strong = validatePasswordStrength('Educ@Interact2026!');
    expect(strong.isStrong).toBe(true);
    expect(strong.score).toBe(4);
  });

  it('deve mascarar e-mails para proteção LGPD em auditoria', () => {
    expect(maskSensitiveEmail('marina.azevedo@edu-interact.test')).toBe('ma***o@edu-interact.test');
    expect(maskSensitiveEmail('prof@escola.gov.br')).toBe('pr***f@escola.gov.br');
    expect(maskSensitiveEmail('al@test.com')).toBe('a***@test.com');
  });

  it('deve verificar permissão de cargo (RBAC) com precisão', () => {
    expect(isAuthorizedRole('professor', ['professor', 'admin'])).toBe(true);
    expect(isAuthorizedRole('estudante', ['professor', 'admin'])).toBe(false);
    expect(isAuthorizedRole('admin', ['admin'])).toBe(true);
    expect(isAuthorizedRole(null, ['professor'])).toBe(false);
    expect(isAuthorizedRole(undefined, ['estudante'])).toBe(false);
  });
});
