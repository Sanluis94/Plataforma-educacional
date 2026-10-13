import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { ProductDeployment } from '../../core/config/productDeployment';

export interface InstallationPolicy {
  schemaVersion: 1;
  installationId: string;
  mode: 'school' | 'home';
  staffRegistration: 'assigned-only' | 'students-only';
}

function unavailable(): Error & { code: string } {
  return Object.assign(new Error('A política de acesso desta instalação não pôde ser confirmada. Avise o responsável pela plataforma.'), { code: 'auth/installation-policy-unavailable' });
}

export async function getConfirmedInstallationPolicy(deployment: Pick<ProductDeployment, 'installationId' | 'mode'>): Promise<InstallationPolicy | null> {
  if (deployment.mode === 'pilot') return null;
  if (!db || !deployment.installationId) throw unavailable();
  let value: Record<string, unknown> | undefined;
  try {
    const snapshot = await getDocFromServer(doc(db, 'installation_policy', 'public'));
    if (snapshot.exists()) value = snapshot.data();
  } catch { throw unavailable(); }
  if (!value || Object.keys(value).length !== 4 || !['schemaVersion', 'installationId', 'mode', 'staffRegistration'].every(key => key in value) || value.schemaVersion !== 1 || value.installationId !== deployment.installationId || value.mode !== deployment.mode || value.staffRegistration !== (deployment.mode === 'school' ? 'assigned-only' : 'students-only')) throw unavailable();
  return value as unknown as InstallationPolicy;
}
