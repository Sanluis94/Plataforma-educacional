import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCompleteLessonWithAI, generatePedagogicalDiagnosis } from '../modules/core/services/geminiService';

describe('Gemini Service - Pedagogical AI & Lesson Generator', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unit test network stub')));
  });
  it('does not present generic fallback questions as an AI-generated lesson', async () => {
    await expect(generateCompleteLessonWithAI({
      topic: 'Leis da Termodinâmica',
      subject: 'Física',
      gradeLevel: 'Ensino Médio',
      activityType: 'quiz'
    })).rejects.toThrow(/IA não está configurada|conectar ao Gemini/);
  });

  it('should generate structured pedagogical diagnosis for a class', async () => {
    const diagnosis = await generatePedagogicalDiagnosis({
      className: '3º Ano B - Física e Química',
      studentsCount: 25,
      completionRate: 78,
      averageScore: 82,
      atRiskStudents: ['Aluno A', 'Aluno B'],
      topModules: [
        { module: 'Termodinâmica', averageScore: 85, count: 20 },
        { module: 'Eletromagnetismo', averageScore: 68, count: 18 }
      ]
    });

    expect(diagnosis.summary).toBeDefined();
    expect(diagnosis.summary.length).toBeGreaterThan(10);
    expect(diagnosis.strengths).toBeInstanceOf(Array);
    expect(diagnosis.strengths.length).toBeGreaterThanOrEqual(1);
    expect(diagnosis.recommendations).toBeInstanceOf(Array);
    expect(diagnosis.recommendations.length).toBeGreaterThanOrEqual(1);
  });
});
