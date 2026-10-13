import type { ProductDeployment } from './productDeployment';

type RegistrationRole = 'estudante' | 'professor' | 'coordenador' | 'admin';

/** Product guidance for new profiles; authorization still belongs to backend rules. */
export function getInitialRegistrationRole(
  mode: ProductDeployment['mode'],
  selectedRole: RegistrationRole,
  purpose: 'learning' | 'family' = 'learning',
): RegistrationRole {
  if (mode === 'home' || purpose === 'family') return 'estudante';
  return selectedRole;
}
