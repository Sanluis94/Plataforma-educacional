import { describe, it, expect, vi } from 'vitest';

vi.mock('../modules/core/services/firebaseConfig', () => ({
  db: null
}));

const {
  calculateExamQuestionAnalytics,
  saveExam
} = await import('../modules/data/repositories/examRepository');
import type { ExamData, ExamAttempt } from '../modules/data/types';

describe('Exam Repository & Analytics Service (Edu-Interact-v2 Pattern)', () => {
  const sampleExam: ExamData = {
    id: 'exam-101',
    professorId: 'prof-1',
    titulo: '1ª Avaliação de Física - Termodinâmica',
    disciplina: 'Física',
    turmaId: 'class-3A',
    turmaNome: '3º Ano A',
    status: 'Aberta',
    pesoTotal: 10,
    criadoEm: new Date().toISOString(),
    questoes: [
      {
        enunciado: 'O que define um processo adiabático?',
        tema: 'Termodinâmica',
        nivelDificuldade: 'Médio',
        valorPeso: 5,
        justificativa: 'Em um processo adiabático, não há troca de calor com o meio externo (Q = 0).',
        opcoes: [
          { texto: 'Troca de calor nula (Q = 0)', isCorreta: true },
          { texto: 'Temperatura constante', isCorreta: false },
          { texto: 'Pressão constante', isCorreta: false },
          { texto: 'Volume nulo', isCorreta: false },
        ]
      },
      {
        enunciado: 'Qual é o rendimento teórico máximo de uma máquina térmica?',
        tema: 'Ciclo de Carnot',
        nivelDificuldade: 'Difícil',
        valorPeso: 5,
        justificativa: 'O ciclo de Carnot estabelece o limite máximo de rendimento térmico.',
        opcoes: [
          { texto: '100% de rendimento', isCorreta: false },
          { texto: 'Dado pelo Ciclo de Carnot', isCorreta: true },
          { texto: 'Zero absoluto', isCorreta: false },
          { texto: 'Independe das temperaturas', isCorreta: false },
        ]
      }
    ]
  };

  it('should save a local exam properly with an id', async () => {
    const saved = await saveExam({
      professorId: 'prof-1',
      titulo: 'Prova de Teste',
      disciplina: 'Química',
      turmaId: 'class-test',
      status: 'Aberta',
      pesoTotal: 10,
      questoes: sampleExam.questoes,
      criadoEm: new Date().toISOString()
    });

    expect(saved.id).toBeDefined();
    expect(saved.titulo).toBe('Prova de Teste');
    expect(saved.questoes).toHaveLength(2);
  });

  it('should calculate analytics correctly with zero attempts', () => {
    const analytics = calculateExamQuestionAnalytics(sampleExam, []);
    expect(analytics.totalTentativas).toBe(0);
    expect(analytics.mediaTurmaPercentual).toBe(0);
    expect(analytics.analiseQuestoes).toHaveLength(2);
    expect(analytics.analiseQuestoes[0].alertaPedagogico).toBe(false);
  });

  it('should calculate question-level accuracy and trigger pedagogical alert when < 50%', () => {
    const attempts: ExamAttempt[] = [
      {
        id: 'att-1',
        examId: 'exam-101',
        examTitle: sampleExam.titulo,
        turmaId: 'class-3A',
        alunoId: 'aluno-1',
        alunoNome: 'Carlos',
        pontuacaoObtida: 10,
        pontuacaoMaxima: 10,
        porcentagemAproveitamento: 100,
        classificacao: 'Excelente',
        respostas: [
          { questaoIndex: 0, opcaoEscolhidaIndex: 0, acertou: true, pontosObtidos: 5 },
          { questaoIndex: 1, opcaoEscolhidaIndex: 1, acertou: true, pontosObtidos: 5 },
        ],
        dataEnvio: new Date().toISOString()
      },
      {
        id: 'att-2',
        examId: 'exam-101',
        examTitle: sampleExam.titulo,
        turmaId: 'class-3A',
        alunoId: 'aluno-2',
        alunoNome: 'Beatriz',
        pontuacaoObtida: 5,
        pontuacaoMaxima: 10,
        porcentagemAproveitamento: 50,
        classificacao: 'Regular',
        respostas: [
          { questaoIndex: 0, opcaoEscolhidaIndex: 0, acertou: true, pontosObtidos: 5 },
          { questaoIndex: 1, opcaoEscolhidaIndex: 0, acertou: false, pontosObtidos: 0 },
        ],
        dataEnvio: new Date().toISOString()
      },
      {
        id: 'att-3',
        examId: 'exam-101',
        examTitle: sampleExam.titulo,
        turmaId: 'class-3A',
        alunoId: 'aluno-3',
        alunoNome: 'Daniel',
        pontuacaoObtida: 5,
        pontuacaoMaxima: 10,
        porcentagemAproveitamento: 50,
        classificacao: 'Regular',
        respostas: [
          { questaoIndex: 0, opcaoEscolhidaIndex: 0, acertou: true, pontosObtidos: 5 },
          { questaoIndex: 1, opcaoEscolhidaIndex: 2, acertou: false, pontosObtidos: 0 },
        ],
        dataEnvio: new Date().toISOString()
      },
      {
        id: 'att-4',
        examId: 'exam-101',
        examTitle: sampleExam.titulo,
        turmaId: 'class-3A',
        alunoId: 'aluno-4',
        alunoNome: 'Eduarda',
        pontuacaoObtida: 0,
        pontuacaoMaxima: 10,
        porcentagemAproveitamento: 0,
        classificacao: 'Insuficiente',
        respostas: [
          { questaoIndex: 0, opcaoEscolhidaIndex: 1, acertou: false, pontosObtidos: 0 },
          { questaoIndex: 1, opcaoEscolhidaIndex: 3, acertou: false, pontosObtidos: 0 },
        ],
        dataEnvio: new Date().toISOString()
      }
    ];

    const analytics = calculateExamQuestionAnalytics(sampleExam, attempts);

    expect(analytics.totalTentativas).toBe(4);
    // Average score: (100 + 50 + 50 + 0) / 4 = 50%
    expect(analytics.mediaTurmaPercentual).toBe(50);
    expect(analytics.distribuicao.excelente).toBe(1);
    expect(analytics.distribuicao.regular).toBe(2);
    expect(analytics.distribuicao.insuficiente).toBe(1);

    // Question 0: 3 out of 4 correct = 75% -> no alert
    expect(analytics.analiseQuestoes[0].totalAcertos).toBe(3);
    expect(analytics.analiseQuestoes[0].taxaAcertoPercentual).toBe(75);
    expect(analytics.analiseQuestoes[0].alertaPedagogico).toBe(false);

    // Question 1: 1 out of 4 correct = 25% -> pedagogical alert triggered!
    expect(analytics.analiseQuestoes[1].totalAcertos).toBe(1);
    expect(analytics.analiseQuestoes[1].taxaAcertoPercentual).toBe(25);
    expect(analytics.analiseQuestoes[1].alertaPedagogico).toBe(true);
  });
});
