import type { PrivacyRequestKind, PrivacyRequestStatus } from '../../../data/repositories/privacyRequestRepository';
export const REQUEST_KIND_LABELS: Record<PrivacyRequestKind, string> = {
  access: 'Consultar meus dados', correction: 'Corrigir uma informação', deletion: 'Solicitar exclusão',
  portability: 'Solicitar cópia ou portabilidade', objection: 'Opor-me a um tratamento',
  'consent-revocation': 'Revogar um consentimento', review: 'Revisar uma decisão automatizada', other: 'Outro pedido sobre meus dados',
};
export const REQUEST_STATUS_LABELS: Record<PrivacyRequestStatus, string> = {
  received: 'Registrada', processing: 'Em análise', completed: 'Respondida', declined: 'Pedido não atendido',
};
