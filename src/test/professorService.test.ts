import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../modules/data/repositories/activityRepository', () => ({
  saveActivity: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'act-123', ...data })),
  getActivitiesByProfessor: vi.fn().mockResolvedValue([]),
  getActivitiesByClass: vi.fn().mockResolvedValue([]),
  deleteActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../modules/data/repositories/logRepository', () => ({
  writeLog: vi.fn().mockResolvedValue(undefined),
}));

const { publishActivity, validateClassName } = await import('../modules/core/services/professorService');

describe('Professor Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate class names properly', () => {
    expect(validateClassName('3º Ano A - Física')).toBe(true);
    expect(validateClassName('  ')).toBe(false);
    expect(validateClassName('')).toBe(false);
  });

  it('should publish basic activity with default status', async () => {
    const activity = await publishActivity(
      'Quiz de Eletromagnetismo',
      'quiz',
      { difficulty: 'medio' },
      'prof-123'
    );

    expect(activity.id).toBe('act-123');
    expect(activity.title).toBe('Quiz de Eletromagnetismo');
    expect(activity.type).toBe('quiz');
    expect(activity.status).toBe('published');
    expect(activity.professorId).toBe('prof-123');
  });

  it('should publish rich activity with theory and questions payload', async () => {
    const questions = [
      {
        q: 'O que é a Lei de Faraday?',
        options: ['Indução eletromagnética', 'Pressão de gases', 'Gravitação', 'Reação redox'],
        answer: 0,
        explanation: 'A variação de fluxo magnético induz uma força eletromotriz.'
      }
    ];

    const activity = await publishActivity(
      'Aula Especial de Faraday',
      'lesson_theory',
      { topic: 'Indução' },
      'prof-123',
      {
        subject: 'Física',
        description: 'Instruções de estudo',
        theoryContent: 'Texto explicativo completo...',
        questions,
        xpReward: 150,
        coinReward: 30,
        classId: 'class-abc'
      }
    );

    expect(activity.subject).toBe('Física');
    expect(activity.theoryContent).toBe('Texto explicativo completo...');
    expect(activity.questions).toHaveLength(1);
    expect(activity.xpReward).toBe(150);
    expect(activity.coinReward).toBe(30);
    expect(activity.classId).toBe('class-abc');
  });
});
