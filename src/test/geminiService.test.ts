import { describe, it, expect } from 'vitest';
import { generateCompleteLessonWithAI, generatePedagogicalDiagnosis } from '../modules/core/services/geminiService';

describe('Gemini Service - Pedagogical AI & Lesson Generator', () => {
  it('should generate a complete structured lesson with questions and theory (with fallback)', async () => {
    const lesson = await generateCompleteLessonWithAI({
      topic: 'Leis da Termodinâmica',
      subject: 'Física',
      gradeLevel: 'Ensino Médio',
      activityType: 'quiz'
    });

    expect(lesson.title).toBeDefined();
    expect(lesson.title.length).toBeGreaterThan(0);
    expect(lesson.description).toBeDefined();
    expect(lesson.theoryContent).toBeDefined();
    expect(lesson.theoryContent.length).toBeGreaterThan(20);
    expect(lesson.questions).toBeDefined();
    expect(lesson.questions.length).toBeGreaterThanOrEqual(1);
    expect(lesson.questions[0].options).toHaveLength(4);
    expect(lesson.questions[0].explanation).toBeDefined();
    expect(lesson.xpReward).toBeGreaterThan(0);
    expect(lesson.coinReward).toBeGreaterThan(0);
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
