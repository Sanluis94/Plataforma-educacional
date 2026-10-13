import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrivacyRequest } from '../modules/data/repositories/privacyRequestRepository';
const fixture = vi.hoisted(() => ({ remote: false, actor: { uid: 'student-a', name: 'Aluna', email: 'private@example.test', role: 'estudante', emailVerified: true }, failure: false, store: new Map<string, Record<string, unknown>>() }));
vi.mock('../modules/core/services/firebaseConfig', () => ({ get db() { return fixture.remote ? {} : null; } }));
vi.mock('../modules/data/repositories/repositoryActor', () => ({ getRepositoryActor: vi.fn(async () => fixture.actor) }));
vi.mock('firebase/firestore', () => {
  class Timestamp { private readonly value: Date; constructor(value: Date) { this.value = value; } toDate() { return this.value; } }
  const materialize = (value: unknown, at: Date): unknown => value && typeof value === 'object' && (value as { server?: boolean }).server ? new Timestamp(at) : Array.isArray(value) ? value.map(child => materialize(child, at)) : value && typeof value === 'object' && !(value instanceof Timestamp) ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, materialize(child, at)])) : value;
  return {
    Timestamp, serverTimestamp: () => ({ server: true }),
    doc: (_db: unknown, _collection: string, id: string) => ({ id }), collection: () => ({}), where: (_field: string, _operator: string, value: string) => ({ owner: value }), limit: (count: number) => ({ count }), query: (_ref: unknown, ...constraints: unknown[]) => ({ constraints }),
    getDocs: async (reference: { constraints?: { owner?: string; count?: number }[] }) => { if (fixture.failure) throw new Error('unavailable'); const owner = reference.constraints?.find(value => value.owner)?.owner, count = reference.constraints?.find(value => value.count)?.count ?? 200; return { docs: [...fixture.store].filter(([, value]) => !owner || value.ownerId === owner).slice(0, count).map(([id, value]) => ({ id, data: () => value })) }; },
    runTransaction: async (_db: unknown, run: (transaction: unknown) => unknown) => {
      if (fixture.failure) throw new Error('unavailable');
      const writes: (() => void)[] = [];
      const committedAt = new Date();
      const result = await run({
        get: async ({ id }: { id: string }) => ({ id, exists: () => fixture.store.has(id), data: () => fixture.store.get(id) }),
        set: ({ id }: { id: string }, value: Record<string, unknown>) => writes.push(() => fixture.store.set(id, materialize(value, committedAt) as Record<string, unknown>)),
        update: ({ id }: { id: string }, value: Record<string, unknown>) => writes.push(() => fixture.store.set(id, { ...fixture.store.get(id), ...materialize(value, committedAt) as Record<string, unknown> })),
      }); writes.forEach(write => write()); return result;
    },
  };
});
import { createPrivacyRequest, getMyPrivacyRequests, getPrivacyRequestsForAdmin, newPrivacyRequestId, updatePrivacyRequest, PRIVACY_REQUEST_LIST_LIMIT } from '../modules/data/repositories/privacyRequestRepository';
const details = 'Solicito uma cópia das minhas respostas e dados de aprendizado.';
beforeEach(() => { localStorage.clear(); fixture.remote = false; fixture.failure = false; fixture.store.clear(); fixture.actor = { uid: 'student-a', name: 'Aluna', email: 'private@example.test', role: 'estudante', emailVerified: true }; });
describe('solicitações privadas sobre dados pessoais', () => {
  it.each([false, true])('confirma protocolo pré-atribuído e retry não duplica o pedido (remoto=%s)', async remote => {
    fixture.remote = remote; const requestId = newPrivacyRequestId(fixture.actor.uid);
    const created = await createPrivacyRequest({ requestId, kind: 'access', details });
    const repeated = await createPrivacyRequest({ requestId, kind: 'access', details });
    expect(repeated).toEqual(created); expect((await getMyPrivacyRequests())).toHaveLength(1);
    expect(created.protocol).toMatch(/^DP-/); expect(created.createdAt).toMatch(/^\d{4}-/);
    expect(created).not.toHaveProperty('email'); expect(JSON.stringify(created)).not.toContain('private@example.test');
    await expect(createPrivacyRequest({ requestId, kind: 'deletion', details })).rejects.toThrow(/outro conteúdo/);
  });
  it('recusa criar pedido em nome de outra conta ou com texto inválido', async () => {
    const requestId = newPrivacyRequestId('peer');
    await expect(createPrivacyRequest({ requestId, kind: 'access', details })).rejects.toThrow(/não pertence/);
    await expect(createPrivacyRequest({ requestId: newPrivacyRequestId('student-a'), kind: 'access', details: 'curto' })).rejects.toThrow(/10 a 4.000/);
    expect(await getMyPrivacyRequests()).toEqual([]);
  });
  it('falha de storage não confirma solicitação e mantém retry com o mesmo identificador', async () => {
    const requestId = newPrivacyRequestId('student-a'); const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new Error('quota'); });
    await expect(createPrivacyRequest({ requestId, kind: 'access', details })).rejects.toThrow(/não foi confirmado/);
    write.mockRestore(); expect(await getMyPrivacyRequests()).toEqual([]);
    expect((await createPrivacyRequest({ requestId, kind: 'access', details })).id).toBe(requestId);
  });
  it('falha remota não cria pedido no storage local', async () => {
    fixture.remote = true; fixture.failure = true;
    await expect(createPrivacyRequest({ requestId: newPrivacyRequestId('student-a'), kind: 'access', details })).rejects.toThrow('unavailable');
    expect(localStorage.getItem('edu_privacy_requests_v1')).toBeNull(); expect(fixture.store.size).toBe(0);
  });
  it.each([false, true])('admin registra histórico, conflito não sobrescreve e encerramento exige resposta (remoto=%s)', async remote => {
    fixture.remote = remote; const created = await createPrivacyRequest({ requestId: newPrivacyRequestId('student-a'), kind: 'deletion', details });
    await expect(updatePrivacyRequest({ requestId: created.id, status: 'completed', resolution: 'não', expectedVersion: 1 })).rejects.toThrow(/Somente a administração/);
    fixture.actor = { ...fixture.actor, uid: 'admin-a', role: 'admin' };
    await expect(updatePrivacyRequest({ requestId: created.id, status: 'completed', resolution: '', expectedVersion: 1 })).rejects.toThrow(/10 a 4.000/);
    const processing = await updatePrivacyRequest({ requestId: created.id, status: 'processing', resolution: 'Estamos conferindo os registros e a retenção aplicável.', expectedVersion: 1 });
    expect(processing.history).toEqual([{ status: 'processing', by: 'admin-a', at: processing.updatedAt, resolution: processing.resolution }]);
    await expect(updatePrivacyRequest({ requestId: created.id, status: 'processing', resolution: processing.resolution, expectedVersion: 2 })).rejects.toThrow(/Nenhuma alteração/);
    await expect(updatePrivacyRequest({ requestId: created.id, status: 'completed', resolution: 'Resposta completa sobre as providências adotadas.', expectedVersion: 1 })).rejects.toThrow(/outra sessão/);
    const completed = await updatePrivacyRequest({ requestId: created.id, status: 'completed', resolution: 'Pedido analisado. Veja as providências e os dados que precisam ser conservados por obrigação legal.', expectedVersion: 2 });
    expect(completed.version).toBe(3); expect(completed.history[0]).toEqual(processing.history[0]); expect(completed.history).toHaveLength(2);
    expect(completed.details).toBe(details); expect(completed.createdAt).toBe(created.createdAt);
    await expect(updatePrivacyRequest({ requestId: created.id, status: 'processing', resolution: 'Reabrir.', expectedVersion: 3 })).rejects.toThrow(/já foi encerrado/);
  });
  it('lista pessoal exclui colegas e consulta global é exclusiva da administração', async () => {
    await createPrivacyRequest({ requestId: newPrivacyRequestId('student-a'), kind: 'access', details });
    fixture.actor.uid = 'peer'; expect(await getMyPrivacyRequests()).toEqual([]);
    await expect(getPrivacyRequestsForAdmin()).rejects.toThrow(/Somente a administração/);
    fixture.actor.role = 'admin'; expect(await getPrivacyRequestsForAdmin()).toHaveLength(1);
  });
  it('consulta administrativa tem limite explícito de 200 registros', async () => {
    fixture.actor.role = 'admin'; localStorage.setItem('edu_privacy_requests_v1', JSON.stringify(Array.from({ length: 201 }, (_, index) => ({ id: String(index), ownerId: 'peer', createdAt: String(index), updatedAt: String(index) } as PrivacyRequest))));
    expect(await getPrivacyRequestsForAdmin()).toHaveLength(PRIVACY_REQUEST_LIST_LIMIT);
  });
  it('duas sessões administrativas não substituem respostas registradas', async () => {
    const created = await createPrivacyRequest({ requestId: newPrivacyRequestId('student-a'), kind: 'correction', details });
    fixture.actor = { ...fixture.actor, uid: 'admin-a', role: 'admin' };
    const operations = await Promise.allSettled([
      updatePrivacyRequest({ requestId: created.id, status: 'processing', resolution: 'Primeira conferência registrada.', expectedVersion: 1 }),
      updatePrivacyRequest({ requestId: created.id, status: 'processing', resolution: 'Segunda conferência concorrente.', expectedVersion: 1 }),
    ]);
    expect(operations.filter(value => value.status === 'fulfilled')).toHaveLength(1);
    expect(operations.filter(value => value.status === 'rejected')).toHaveLength(1);
    expect((await getPrivacyRequestsForAdmin())[0].history).toHaveLength(1);
  });
});
