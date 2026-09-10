import { describe, it, expect, vi } from 'vitest';

vi.mock('../modules/core/services/firebaseConfig', () => ({
  db: null
}));

const {
  saveLessonPlanItem,
  getLessonPlansByClass,
  updateLessonPlanItem,
  deleteLessonPlanItem
} = await import('../modules/data/repositories/lessonPlanRepository');

describe('Lesson Plan Repository (Bimester / Semester Planning)', () => {
  it('should save and retrieve lesson plans by class and bimester', async () => {
    const classId = `class_lp_${Date.now()}`;

    // Add item in 1º Bimestre
    await saveLessonPlanItem({
      professorId: 'prof-test',
      turmaId: classId,
      periodo: '1º Bimestre',
      ordemSemana: 1,
      topico: 'Cinemática Escalar',
      competenciasBNCC: 'EM13CNT101',
      metodologia: 'Aula com simulador de pêndulo e colisões.',
      laboratorioAssociadoId: 'fis_1',
      laboratorioTitulo: 'Cinemática do Pêndulo',
      status: 'planejada',
      criadoEm: new Date().toISOString()
    });

    // Add item in 2º Bimestre
    await saveLessonPlanItem({
      professorId: 'prof-test',
      turmaId: classId,
      periodo: '2º Bimestre',
      ordemSemana: 1,
      topico: 'Termologia e Calorimetria',
      competenciasBNCC: 'EM13CNT102',
      metodologia: 'Experimentos virtuais com gases ideais.',
      laboratorioAssociadoId: 'fis_5',
      laboratorioTitulo: 'Termodinâmica',
      status: 'planejada',
      criadoEm: new Date().toISOString()
    });

    // Retrieve all
    const allPlans = await getLessonPlansByClass(classId);
    expect(allPlans).toHaveLength(2);

    // Retrieve only 1º Bimestre
    const b1Plans = await getLessonPlansByClass(classId, '1º Bimestre');
    expect(b1Plans).toHaveLength(1);
    expect(b1Plans[0].topico).toBe('Cinemática Escalar');
    expect(b1Plans[0].laboratorioAssociadoId).toBe('fis_1');

    // Retrieve only 2º Bimestre
    const b2Plans = await getLessonPlansByClass(classId, '2º Bimestre');
    expect(b2Plans).toHaveLength(1);
    expect(b2Plans[0].topico).toBe('Termologia e Calorimetria');

    // Update status to 'concluida'
    await updateLessonPlanItem(b1Plans[0].id!, { status: 'concluida' });
    const updated = await getLessonPlansByClass(classId, '1º Bimestre');
    expect(updated[0].status).toBe('concluida');

    // Delete item
    await deleteLessonPlanItem(b1Plans[0].id!);
    const remaining = await getLessonPlansByClass(classId, '1º Bimestre');
    expect(remaining).toHaveLength(0);
  });
});
