export interface ProductDeployment {
  installationId: string;
  installationName: string;
  mode: 'school' | 'home' | 'pilot';
  stage: 'pilot' | 'commercial';
  controllerName: string;
  controllerDocument: string;
  privacyEmail: string;
}

/** Public configuration only. These values are compiled into the browser. */
export function readProductDeployment(source: Record<string, unknown>): ProductDeployment {
  const value = (key: string) => typeof source[key] === 'string' ? source[key].trim() : '';
  const stage = value('VITE_PUBLIC_RELEASE_STAGE') || 'pilot';
  const mode = value('VITE_INSTALLATION_MODE') || 'pilot';
  if (stage !== 'pilot' && stage !== 'commercial') throw new Error('Etapa de publicação inválida.');
  if (!['school', 'home', 'pilot'].includes(mode)) throw new Error('Tipo de instalação inválido.');
  const privacyEmail = value('VITE_PRIVACY_CONTACT_EMAIL');
  if (privacyEmail && !/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(privacyEmail)) {
    throw new Error('E-mail público de privacidade inválido.');
  }
  const controllerName = value('VITE_DATA_CONTROLLER_NAME');
  if (stage === 'commercial' && (!controllerName || !privacyEmail || mode === 'pilot' || !value('VITE_INSTALLATION_ID'))) {
    throw new Error('Publicação comercial exige instalação, responsável e canal público de privacidade definidos.');
  }
  return {
    installationId: value('VITE_INSTALLATION_ID'),
    installationName: value('VITE_INSTALLATION_NAME') || 'Edu-Interact',
    mode: mode as ProductDeployment['mode'],
    stage,
    controllerName,
    controllerDocument: value('VITE_DATA_CONTROLLER_DOCUMENT'),
    privacyEmail,
  };
}

export const productDeployment = readProductDeployment(import.meta.env || {});

export function privacyRequestUrl(email: string, kind: 'rights' | 'safety', installation: string): string {
  const subject = kind === 'safety' ? 'Relato de segurança na plataforma' : 'Solicitação sobre meus dados pessoais';
  const body = `Instalação: ${installation}\n\n${kind === 'safety' ? 'Descreva o ocorrido e informe o endereço ou código do conteúdo, se houver.' : 'Informe o pedido: acesso, correção, revisão de decisão, exclusão ou outro direito.'}\n\nNão envie senhas, documentos de identidade ou dados de outros estudantes neste primeiro contato.`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
