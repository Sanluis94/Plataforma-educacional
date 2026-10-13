import { beforeEach, expect, it, vi } from 'vitest';
const transport = vi.hoisted(() => ({ read: vi.fn(), db: {} as object | null }));
vi.mock('../modules/core/services/firebaseConfig', () => ({ get db() { return transport.db; } }));
vi.mock('firebase/firestore', () => ({ doc: (_db: object, collection: string, id: string) => ({ collection, id }), getDocFromServer: transport.read }));
import { getConfirmedInstallationPolicy } from '../modules/data/repositories/installationPolicyRepository';
const expected = { mode: 'home' as const, installationId: 'household-fixture' };
const valid = { schemaVersion: 1, ...expected, staffRegistration: 'students-only' };
beforeEach(() => { transport.db = {}; transport.read.mockReset(); });
it('piloto compartilhado mantém fluxo legado sem exigir documento de instalação', async () => {
  expect(await getConfirmedInstallationPolicy({ mode: 'pilot', installationId: '' })).toBeNull();
  expect(transport.read).not.toHaveBeenCalled();
});
it('confere política pública no servidor a cada tentativa, sem confiar em cache local', async () => {
  transport.read.mockResolvedValue({ exists: () => true, data: () => valid });
  expect(await getConfirmedInstallationPolicy(expected)).toEqual(valid);
  expect(await getConfirmedInstallationPolicy(expected)).toEqual(valid);
  expect(transport.read).toHaveBeenCalledTimes(2);
  expect(transport.read).toHaveBeenCalledWith({ collection: 'installation_policy', id: 'public' });
});
it.each([null, { ...valid, schemaVersion: 2 }, { ...valid, installationId: 'other' }, { ...valid, mode: 'school' }, { ...valid, staffRegistration: 'assigned-only' }, { ...valid, email: 'extra@example.test' }])('bloqueia política ausente ou incompatível %j', async value => {
  transport.read.mockResolvedValue({ exists: () => value !== null, data: () => value });
  await expect(getConfirmedInstallationPolicy(expected)).rejects.toMatchObject({ code: 'auth/installation-policy-unavailable' });
});
it('falha de rede não usa uma política local inventada nem revela o erro de transporte', async () => {
  transport.read.mockRejectedValue(new Error('transporte privado'));
  await expect(getConfirmedInstallationPolicy(expected)).rejects.toMatchObject({ code: 'auth/installation-policy-unavailable' });
});
