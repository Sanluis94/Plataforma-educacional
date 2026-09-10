/**
 * Security Service — Utilitários de segurança para validação, sanitização
 * e controle de integridade de dados (prevenção contra XSS, SSRF e injeção).
 */

/**
 * Remove tags potencialmente maliciosas e scripts de strings enviadas pelo usuário
 * (prevenção XSS em fóruns, murais e enunciados de avaliações).
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  let sanitized = input;

  // 1. Remove tags script, iframe, object, embed, applet e frameset
  sanitized = sanitized.replace(/<\s*(script|iframe|object|embed|applet|frameset)[^>]*>.*?<\s*\/\s*\1\s*>/gis, '');
  sanitized = sanitized.replace(/<\s*(script|iframe|object|embed|applet|frameset)[^>]*\/?>/gis, '');

  // 2. Remove handlers de eventos inline (onload, onclick, onerror, etc.)
  sanitized = sanitized.replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gis, '');

  // 3. Remove esquemas de pseudo-protocolo perigosos (javascript:, vbscript:, data:text/html)
  sanitized = sanitized.replace(/javascript\s*:/gis, 'unsafe-protocol:');
  sanitized = sanitized.replace(/vbscript\s*:/gis, 'unsafe-protocol:');
  sanitized = sanitized.replace(/data\s*:\s*text\/html/gis, 'unsafe-protocol:');

  return sanitized.trim();
}

/**
 * Valida se uma URL fornecida para materiais complementares ou links externos é segura.
 * Rejeita esquemas perigosos como javascript:, file:, data:text/html.
 */
export function isValidSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim().toLowerCase();

  // Bloqueia esquemas perigosos
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('data:text/html') ||
    trimmed.startsWith('data:text/javascript')
  ) {
    return false;
  }

  // Permite protocolos web seguros
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Permite uploads de base64 seguros (imagens e pdfs)
  if (
    trimmed.startsWith('data:image/png;') ||
    trimmed.startsWith('data:image/jpeg;') ||
    trimmed.startsWith('data:image/webp;') ||
    trimmed.startsWith('data:application/pdf;')
  ) {
    return true;
  }

  return false;
}

/**
 * Valida a força de uma senha segundo padrões modernos de segurança.
 */
export function validatePasswordStrength(password: string): {
  isStrong: boolean;
  score: number; // 0 a 4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length < 8) {
    feedback.push('A senha deve conter no mínimo 8 caracteres.');
  } else {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Inclua ao menos uma letra maiúscula.');
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Inclua ao menos um número.');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Inclua ao menos um caractere especial (ex: @, #, $).');
  }

  return {
    isStrong: score >= 3,
    score,
    feedback
  };
}

/**
 * Mascara e-mails para proteção de privacidade em logs e relatórios compartilhados.
 * Ex: 'marina.azevedo@escola.gov.br' -> 'ma***do@escola.gov.br'
 */
export function maskSensitiveEmail(email: string): string {
  if (!email || !email.includes('@')) return '***';

  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`;
  }

  const start = username.slice(0, 2);
  const end = username.slice(-1);
  return `${start}***${end}@${domain}`;
}

/**
 * Verifica se um cargo é autorizado perante uma lista de permissões.
 */
export function isAuthorizedRole(
  userRole: string | undefined | null,
  allowedRoles: string[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
