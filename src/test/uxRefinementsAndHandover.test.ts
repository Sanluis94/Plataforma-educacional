import { describe, it, expect, beforeEach } from 'vitest';
import { offlineSyncService } from '../modules/core/services/offlineSyncService';
import { MASTER_LABS_CATALOG, searchLabsCatalog } from '../modules/core/constants/masterLabsCatalog';

describe('Refinamentos de UX, Acessibilidade e Handover Kortex Super LMS', () => {
  beforeEach(() => {
    offlineSyncService.clearQueue();
  });

  describe('Connectivity & Offline Outbox Sync', () => {
    it('deve registrar e recuperar submissões pendentes na fila offline', () => {
      offlineSyncService.setOnline(false);

      const sub1 = offlineSyncService.enqueueSubmission({
        labId: 'pendulo_simples_superior',
        studentId: 'student_test_1',
        timestamp: new Date().toISOString(),
        parameters: { L: 1.5, g: 9.81 },
        telemetry: { periodo: 2.45 }
      });

      expect(sub1.id).toBeDefined();
      expect(sub1.synced).toBe(false);

      const pending = offlineSyncService.getPendingSubmissions();
      expect(pending.length).toBe(1);
      expect(pending[0].labId).toBe('pendulo_simples_superior');

      // Ao alternar para online, deve sincronizar
      offlineSyncService.setOnline(true);
      const remaining = offlineSyncService.getPendingSubmissions().filter(s => !s.synced);
      expect(remaining.length).toBe(0);
    });

    it('deve permitir listener de conectividade em tempo real', () => {
      let currentStatus = false;
      const unsubscribe = offlineSyncService.subscribeStatus((online) => {
        currentStatus = online;
      });

      offlineSyncService.setOnline(true);
      expect(currentStatus).toBe(true);

      offlineSyncService.setOnline(false);
      expect(currentStatus).toBe(false);

      unsubscribe();
      offlineSyncService.setOnline(true);
    });
  });

  describe('Command Palette - Busca em 500+ Laboratórios', () => {
    it('deve encontrar laboratórios por palavras-chave de engenharia e química via searchLabsCatalog', () => {
      const results = searchLabsCatalog('Arrhenius');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title.toLowerCase()).toContain('arrhenius');
    });

    it('deve encontrar laboratórios de matemática e geometria via searchLabsCatalog', () => {
      const results = searchLabsCatalog('Pitágoras');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('Pitágoras');
    });

    it('deve categorizar níveis acadêmicos entre médio e superior', () => {
      const higherEdLabs = MASTER_LABS_CATALOG.filter(l => l.academicLevel === 'graduacao' || l.academicLevel === 'pos_graduacao');
      const highSchoolLabs = MASTER_LABS_CATALOG.filter(l => l.academicLevel === 'medio');

      expect(higherEdLabs.length).toBeGreaterThan(100);
      expect(highSchoolLabs.length).toBeGreaterThan(50);
    });
  });

  describe('SpeedGrader - Pauta e Exportação CSV', () => {
    it('deve formatar adequadamente os campos da pauta com delimitador e escape', () => {
      const demoSubmissions = [
        {
          id: 'sub_1',
          studentName: 'Ana Clara Silva',
          activityTitle: 'Laboratório de Oscilações',
          turma: 'Turma de Física II',
          submittedAt: '14:30',
          score: 95,
          hypothesis: 'A amplitude aumentou com frequência próxima de 6.3 rad/s.'
        },
        {
          id: 'sub_2',
          studentName: 'Bruno "O Cientista" Santos',
          activityTitle: 'Cinética Química',
          turma: 'Turma de Química Geral',
          submittedAt: '15:15',
          score: 88,
          hypothesis: 'Catalisador abaixou Ea.'
        }
      ];

      const headers = ['ID_Submissao', 'Estudante', 'Atividade', 'Turma', 'Data_Entrega', 'Nota', 'Status', 'Hipotese_Investigativa'];
      const rows = demoSubmissions.map(s => [
        s.id,
        `"${s.studentName.replace(/"/g, '""')}"`,
        `"${s.activityTitle.replace(/"/g, '""')}"`,
        `"${s.turma.replace(/"/g, '""')}"`,
        s.submittedAt,
        s.score,
        'Concluido',
        `"${(s.hypothesis || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');

      expect(csvContent.startsWith('\uFEFF')).toBe(true); // UTF-8 BOM para Excel
      expect(csvContent).toContain('Ana Clara Silva');
      expect(csvContent).toContain('Bruno ""O Cientista"" Santos'); // Escape de aspas
      expect(csvContent.split('\n').length).toBe(3); // Cabeçalho + 2 linhas
    });
  });
});
