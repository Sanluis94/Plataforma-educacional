import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateLabReportMarkdown, generateLabReportLatex, type LabReportData } from '../modules/core/services/labReportService';
import { calculateItemProbability, estimateStudentProficiency, getCalibratedTriParametersForLab, type TriAnswerRecord } from '../modules/core/services/triEvaluationService';
import { generateCertificateHash, issueLabCertificate, verifyCertificateAuthenticity, issueCertificate, getStudentCertificates, verifyCertificate } from '../modules/core/services/certificateService';
import { evaluateStudentRisk, generateClassRetentionReport } from '../modules/core/services/earlyWarningService';
import { offlineSyncService } from '../modules/core/services/offlineSyncService';
import { LtiIntegrationBridge } from '../modules/core/services/ltiService';
import { sonifier } from '../modules/core/services/webAudioSonifier';

describe('20 Strategic Improvements Suite - Kortex Super LMS', () => {

  describe('1. Lab Report Service (Markdown & LaTeX Generation)', () => {
    const mockReportData: LabReportData = {
      labId: 'sup_fis_01',
      labTitle: 'Ressonância Mecânica em Oscilador Harmônico',
      studentName: 'Ana Beatriz Ramos',
      academicLevel: 'Ensino Superior (Engenharia)',
      subject: 'Física Geral II',
      durationSeconds: 1200,
      parametersUsed: { massa: 2.5, frequencia_excitacao: 1.45, amortecimento: 0.12 },
      telemetrySnapshot: { amplitude_maxima: 4.82, fator_qualidade_Q: 12.08 },
      studentNotes: 'Observado pico de ressonância agudo próximo da frequência natural omega_0.',
      date: '09/10/2026'
    };

    it('should generate structured Markdown report with parameters table', () => {
      const md = generateLabReportMarkdown(mockReportData);
      expect(md).toContain('# RELATÓRIO TÉCNICO DE LABORATÓRIO VIRTUAL');
      expect(md).toContain('Ressonância Mecânica');
      expect(md).toContain('Ana Beatriz Ramos');
      expect(md).toContain('massa');
      expect(md).toContain('fator_qualidade_Q');
      expect(md).toContain('Plataforma Kortex');
    });

    it('should generate compilable LaTeX academic report', () => {
      const latex = generateLabReportLatex(mockReportData);
      expect(latex).toContain('\\documentclass{article}');
      expect(latex).toContain('Ressonância Mecânica');
      expect(latex).toContain('\\begin{itemize}');
      expect(latex).toContain('\\end{document}');
    });
  });

  describe('2. Item Response Theory (TRI 3PL Evaluation Service)', () => {
    it('should calculate 3PL logistic probability correctly', () => {
      // Theta = b -> P(theta) = c + (1-c)/2
      const prob = calculateItemProbability(0, 1.0, 0, 0.2);
      expect(prob).toBeCloseTo(0.6, 2);

      // Very high theta -> P(theta) approaches 1.0
      const probHigh = calculateItemProbability(4.0, 1.5, 0, 0.2);
      expect(probHigh).toBeGreaterThan(0.99);

      // Very low theta -> P(theta) approaches pseudo-guessing parameter c
      const probLow = calculateItemProbability(-4.0, 1.5, 0, 0.2);
      expect(probLow).toBeCloseTo(0.2, 1);
    });

    it('should estimate EAP proficiency and map to ENEM scale (200 - 1000)', () => {
      const answersAllCorrect: TriAnswerRecord[] = [
        {
          itemId: 'q1',
          correct: true,
          itemParams: { itemId: 'q1', difficulty_b: -1.0, discrimination_a: 1.2, guessing_c: 0.2, domain: 'Física' }
        },
        {
          itemId: 'q2',
          correct: true,
          itemParams: { itemId: 'q2', difficulty_b: 0.0, discrimination_a: 1.5, guessing_c: 0.2, domain: 'Física' }
        },
        {
          itemId: 'q3',
          correct: true,
          itemParams: { itemId: 'q3', difficulty_b: 1.2, discrimination_a: 1.8, guessing_c: 0.2, domain: 'Física' }
        }
      ];

      const resultHigh = estimateStudentProficiency(answersAllCorrect);
      expect(resultHigh.scoreEnem).toBeGreaterThan(600);
      expect(resultHigh.standardError).toBeGreaterThan(0);
      expect(['Avançado', 'Excelente', 'Adequado']).toContain(resultHigh.classification);

      const answersAllWrong: TriAnswerRecord[] = [
        {
          itemId: 'q1',
          correct: false,
          itemParams: { itemId: 'q1', difficulty_b: -1.0, discrimination_a: 1.2, guessing_c: 0.2, domain: 'Física' }
        },
        {
          itemId: 'q2',
          correct: false,
          itemParams: { itemId: 'q2', difficulty_b: 0.0, discrimination_a: 1.5, guessing_c: 0.2, domain: 'Física' }
        },
        {
          itemId: 'q3',
          correct: false,
          itemParams: { itemId: 'q3', difficulty_b: 1.2, discrimination_a: 1.8, guessing_c: 0.2, domain: 'Física' }
        }
      ];

      const resultLow = estimateStudentProficiency(answersAllWrong);
      expect(resultLow.scoreEnem).toBeLessThan(500);
      expect(['Básico', 'Abaixo do Básico']).toContain(resultLow.classification);
    });

    it('should retrieve calibrated parameters for any lab in catalog', () => {
      const params = getCalibratedTriParametersForLab('sup_fis_01', 'graduacao');
      expect(params.difficulty_b).toBeDefined();
      expect(params.discrimination_a).toBeGreaterThan(0.5);
      expect(params.guessing_c).toBe(0.33);
    });
  });

  describe('3. Digital & Cryptographic Certificate Service', () => {
    it('should compute cryptographic hash and verify authenticity', async () => {
      const hash1 = await generateCertificateHash('test-payload-2026');
      const hash2 = await generateCertificateHash('test-payload-2026');
      const hashDiff = await generateCertificateHash('different-payload');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hashDiff);
    });

    it('should issue lab certificate and confirm verification URL', async () => {
      const cert = await issueLabCertificate({
        studentId: 'stud-554',
        studentName: 'Roberto Alencar',
        academicLevelLabel: 'Graduação em Física',
        completedLabsCount: 8,
        totalSimulatedHours: 80
      });

      expect(cert.certificateId).toContain('CERT-KTX-');
      expect(cert.studentName).toBe('Roberto Alencar');
      expect(cert.verificationUrl).toContain('plataforma-educacional-73df6.web.app');
      
      const isAuthentic = await verifyCertificateAuthenticity(cert);
      expect(isAuthentic).toBe(true);

      // Tampered certificate
      const tampered = { ...cert, totalSimulatedHours: 999 };
      const isFake = await verifyCertificateAuthenticity(tampered);
      expect(isFake).toBe(false);
    });

    it('should maintain backward compatibility with LMS classic certificate issuance', () => {
      const cert = issueCertificate('s-1', 'Maria Costa', 'Química Orgânica', 60);
      expect(cert.codigoValidacao).toContain('EDU-2026-');
      expect(cert.alunoNome).toBe('Maria Costa');

      const userCerts = getStudentCertificates('s-1');
      expect(userCerts.some(c => c.alunoNome === 'Maria Costa')).toBe(true);

      const verified = verifyCertificate(cert.codigoValidacao);
      expect(verified).not.toBeNull();
      expect(verified?.tituloCurso).toBe('Química Orgânica');
    });
  });

  describe('4. Early Warning Dropout & Retention Radar', () => {
    it('should classify high-risk students when disengaged', () => {
      const criticalStudent = evaluateStudentRisk({
        studentId: 'st-crit',
        studentName: 'Carlos Silveira',
        className: 'Física Geral 1',
        lastAccessDaysAgo: 18,
        completedLabsCount: 0,
        averageScorePct: 35,
        failedAttemptsCount: 6
      });

      expect(criticalStudent.riskLevel).toBe('Crítico');
      expect(criticalStudent.riskScore).toBeGreaterThanOrEqual(70);
      expect(criticalStudent.pedagogicalRecommendations.length).toBeGreaterThan(0);
    });

    it('should classify low-risk active students', () => {
      const diligentStudent = evaluateStudentRisk({
        studentId: 'st-good',
        studentName: 'Juliana Paes',
        className: 'Física Geral 1',
        lastAccessDaysAgo: 1,
        completedLabsCount: 15,
        averageScorePct: 92,
        failedAttemptsCount: 0
      });

      expect(diligentStudent.riskLevel).toBe('Baixo');
      expect(diligentStudent.riskScore).toBeLessThan(35);
    });

    it('should generate complete class retention report', () => {
      const students = [
        { studentId: '1', studentName: 'Aluno 1', className: 'Turma A', lastAccessDaysAgo: 15, completedLabsCount: 1, averageScorePct: 40, failedAttemptsCount: 4 },
        { studentId: '2', studentName: 'Aluno 2', className: 'Turma A', lastAccessDaysAgo: 2, completedLabsCount: 10, averageScorePct: 85, failedAttemptsCount: 1 }
      ];

      const report = generateClassRetentionReport('Turma A', students);
      expect(report.totalStudents).toBe(2);
      expect(report.studentsAtRiskCount).toBe(1);
      expect(report.classHealthScore).toBeGreaterThan(0);
    });
  });

  describe('5. Offline Sync Outbox Queue Service', () => {
    beforeEach(() => {
      offlineSyncService.clearQueue();
      offlineSyncService.setOnline(false); // Inicia modo offline para enfileiramento
    });

    it('should enqueue submissions and report queue length', () => {
      const item = {
        studentId: 'std-10',
        labId: 'sup_fis_01',
        timestamp: new Date().toISOString(),
        parameters: { angle: 45 },
        telemetry: { period: 2.1 }
      };

      offlineSyncService.enqueueSubmission(item);
      const queue = offlineSyncService.getPendingSubmissions();
      expect(queue.length).toBe(1);
      expect(queue[0].labId).toBe('sup_fis_01');
    });

    it('should process queue when online', async () => {
      offlineSyncService.enqueueSubmission({
        studentId: 'std-20',
        labId: 'sup_calc_01',
        timestamp: new Date().toISOString(),
        parameters: { n: 100 },
        telemetry: { area: 3.1415 }
      });

      expect(offlineSyncService.getPendingSubmissions().length).toBe(1);

      // Reconexão à internet aciona o auto-sync do outbox
      offlineSyncService.setOnline(true);
      expect(offlineSyncService.getPendingSubmissions().length).toBe(0);
    });
  });

  describe('6. LTI 1.3 Advantage Bridge Service', () => {
    it('should identify non-LTI environments safely', () => {
      const isLti = LtiIntegrationBridge.isLtiEmbedded();
      expect(typeof isLti).toBe('boolean');
    });

    it('should attempt grade sync via postMessage', () => {
      const postMessageSpy = vi.fn();
      const originalParent = window.parent;
      // @ts-ignore
      window.parent = { postMessage: postMessageSpy };

      LtiIntegrationBridge.syncGradeToLms({
        userId: 'user_123',
        scoreGiven: 95,
        scoreMaximum: 100,
        comment: 'Laboratório concluído com 95% de aproveitamento',
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded'
      });

      expect(postMessageSpy).toHaveBeenCalled();
      window.parent = originalParent;
    });
  });

  describe('7. Web Audio Sonifier & Haptic Feedback', () => {
    it('should trigger haptic feedback safely without throwing', () => {
      expect(() => sonifier.triggerHaptic(100)).not.toThrow();
    });

    it('should toggle audio muting cleanly', () => {
      const initial = sonifier.getMuted();
      sonifier.setMuted(!initial);
      expect(sonifier.getMuted()).toBe(!initial);
      sonifier.setMuted(initial);
    });
  });
});
