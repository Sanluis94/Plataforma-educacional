import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActiveLearningCapture } from '../modules/data/services/learningCapture';
import type { LearningDelivery } from '../modules/core/services/offlineSyncService';

const transport = vi.hoisted(() => ({ submission: vi.fn(), exam: vi.fn(), reward: vi.fn() }));
vi.mock('../modules/data/repositories/submissionRepository', () => ({ saveSubmission: transport.submission }));
vi.mock('../modules/data/repositories/examRepository', () => ({ saveExamAttempt: transport.exam }));
vi.mock('../modules/data/repositories/studentRepository', () => ({ completeStudentLabProgress: transport.reward }));
import { OfflineSyncService } from '../modules/core/services/offlineSyncService';

function delivery(studentId = 'student-a', sessionId = 'attempt-a'): LearningDelivery {
  return { kind: 'submission', studentId, rewardId: 'lab-a', submission: { activityId: 'lab-a', activityTitle: 'Experimento fictício', classId: 'class-a', studentId, studentName: 'Aluno fictício', score: 67, status: 'completed', submittedAt: '2026-10-11T10:00:00Z', evidence: { schemaVersion: 1, source: 'lab', sessionId, stage: 'assessment', activeSeconds: 24, reflection: 'Minha conclusão real.' } } };
}

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); transport.submission.mockResolvedValue({}); transport.exam.mockResolvedValue({}); transport.reward.mockResolvedValue({}); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('Entrega real e fila por perfil', () => {
  it('preserva a fila antiga sem atribuir registros sem identidade ao perfil atual', async () => {
    const old = JSON.stringify([{ studentId: 'estudante_ativo', labId: 'legacy', parameters: { massa: 10 }, synced: false }]);
    localStorage.setItem('kortex_offline_outbox_v1', old);
    const service = new OfflineSyncService(); service.setCurrentStudent('student-a');
    await service.syncOutbox();
    expect(service.hasLegacyUnassignedRecords()).toBe(true);
    expect(localStorage.getItem('kortex_offline_outbox_v1')).toBe(old);
    expect(transport.submission).not.toHaveBeenCalled();
  });
  it('não apaga dados offline e enfileira a mesma tentativa apenas uma vez', async () => {
    const service = new OfflineSyncService(); service.setOnline(false);
    expect(await service.deliver(delivery())).toEqual({ queued: true });
    expect(await service.deliver(delivery())).toEqual({ queued: true });
    expect(service.getPendingSubmissions('student-a')).toHaveLength(1);
    expect(transport.submission).not.toHaveBeenCalled();
  });

  it('só retira a entrega depois de confirmar evidência e recompensa', async () => {
    const service = new OfflineSyncService(); service.setOnline(false);
    await service.deliver(delivery()); service.setOnline(true); await service.syncOutbox();
    expect(transport.submission).toHaveBeenCalledWith(expect.objectContaining({ score: 67, evidence: expect.objectContaining({ reflection: 'Minha conclusão real.', activeSeconds: 24 }) }));
    expect(transport.reward).toHaveBeenCalledWith('student-a', 'lab-a', 67);
    expect(service.getPendingSubmissions('student-a')).toHaveLength(0);
  });

  it('preserva e sinaliza erro de envio sem anunciar sucesso', async () => {
    transport.submission.mockRejectedValue(new Error('permission-denied'));
    const service = new OfflineSyncService();
    const result = await service.deliver(delivery());
    expect(result.queued).toBe(true);
    expect(service.getPendingSubmissions('student-a')[0].error).toBe('permission-denied');
    expect(transport.reward).not.toHaveBeenCalled();
    transport.submission.mockResolvedValue({}); await service.syncOutbox();
    expect(service.getPendingSubmissions('student-a')).toHaveLength(0);
  });

  it('mantém a evidência quando só a recompensa falha e usa o mesmo ID no reenvio', async () => {
    transport.reward.mockRejectedValue(new Error('retry-reward'));
    const service = new OfflineSyncService(); await service.deliver(delivery());
    expect(service.getPendingSubmissions('student-a')).toHaveLength(1);
    transport.reward.mockResolvedValue({}); await service.syncOutbox();
    const attempts = transport.submission.mock.calls.map(([value]) => value.evidence.sessionId);
    expect(new Set(attempts)).toEqual(new Set(['attempt-a']));
    expect(service.getPendingSubmissions('student-a')).toHaveLength(0);
  });

  it('não envia registros de outra conta ao reconectar', async () => {
    const service = new OfflineSyncService(); service.setOnline(false);
    await service.deliver(delivery('student-a', 'a')); service.setCurrentStudent('student-b'); await service.deliver(delivery('student-b', 'b'));
    service.setCurrentStudent('student-a'); service.setOnline(true); await service.syncOutbox();
    expect(transport.submission.mock.calls.every(([value]) => value.studentId === 'student-a')).toBe(true);
    expect(service.getPendingSubmissions('student-b')).toHaveLength(1);
  });

  it('mantém registros durante conexão sem perfil autenticado', async () => {
    const service = new OfflineSyncService(); service.setOnline(false); await service.deliver(delivery());
    service.setCurrentStudent(null); service.setOnline(true); await service.syncOutbox();
    expect(transport.submission).not.toHaveBeenCalled();
    expect(service.getPendingSubmissions('student-a')).toHaveLength(1);
  });
  it('um retorno atrasado não troca a conta atual para enviar a entrega antiga', async () => {
    const service = new OfflineSyncService(); service.setOnline(false); service.setCurrentStudent('student-b');
    await expect(service.deliver(delivery('student-a'))).rejects.toThrow('perfil mudou');
    expect(service.getPendingSubmissions('student-a')).toHaveLength(0);
    expect(transport.submission).not.toHaveBeenCalled();
  });

  it('falha explicitamente quando não consegue guardar no dispositivo', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    const service = new OfflineSyncService(); service.setOnline(false);
    await expect(service.deliver(delivery())).rejects.toThrow('Mantenha a atividade aberta');
    expect(transport.submission).not.toHaveBeenCalled();
  });

  it('não limpa uma fila corrompida', () => {
    localStorage.setItem('kortex_offline_outbox_v2', 'conteúdo preservado');
    const service = new OfflineSyncService();
    expect(() => service.getPendingSubmissions('student-a')).toThrow('preservados');
    expect(localStorage.getItem('kortex_offline_outbox_v2')).toBe('conteúdo preservado');
  });
});

describe('Tempo de uso medido', () => {
  it('exclui aba oculta, pausa e inatividade e usa nova tentativa após reset', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-11T10:00:00Z'));
    const capture = new ActiveLearningCapture(); const firstId = capture.sessionId; capture.start(true);
    vi.advanceTimersByTime(10_000); expect(capture.activeSeconds).toBe(10);
    capture.setVisible(false); vi.advanceTimersByTime(20_000); expect(capture.activeSeconds).toBe(10);
    capture.setVisible(true); capture.interact(); vi.advanceTimersByTime(90_000); expect(capture.activeSeconds).toBe(70);
    capture.stop(); vi.advanceTimersByTime(10_000); expect(capture.activeSeconds).toBe(70);
    capture.reset(); expect(capture.sessionId).not.toBe(firstId); expect(capture.activeSeconds).toBe(0);
  });
});
