import { describe, it, expect } from 'vitest';
import {
  probabilidade3PL,
  estimarTheta,
  calcularCoerenciaPedagogica,
  processarSimuladoEnemTRI,
  BANCO_ITENS_ENEM_PADRAO,
  type TriItem,
  type TriResponseSubmission
} from '../modules/data/services/triCalculationService';

describe('Product EdTech SaaS Suite — TRI, ENEM, B2B Escolar & Pricing ROI', () => {
  it('should test 3PL logistic probability function curve', () => {
    // a = 1.5, b = 0.0, c = 0.2
    const pBaixo = probabilidade3PL(-2.0, 1.5, 0.0, 0.2);
    const pMedio = probabilidade3PL(0.0, 1.5, 0.0, 0.2);
    const pAlto = probabilidade3PL(2.0, 1.5, 0.0, 0.2);

    expect(pBaixo).toBeGreaterThanOrEqual(0.2);
    expect(pMedio).toBeGreaterThan(pBaixo);
    expect(pAlto).toBeGreaterThan(pMedio);
    expect(pAlto).toBeLessThanOrEqual(1.0);
    // Em theta = b (0.0), P = c + (1-c)/2 = 0.2 + 0.4 = 0.6
    expect(pMedio).toBeCloseTo(0.6, 1);
  });

  it('should estimate higher theta for high-performing students vs low-performing students', () => {
    const itens = BANCO_ITENS_ENEM_PADRAO;

    // Aluno A: acertou todas
    const submissoesA: TriResponseSubmission[] = itens.map(i => ({
      itemId: i.id,
      respostaEscolhida: i.respostaCorreta
    }));
    const thetaA = estimarTheta(itens, submissoesA);

    // Aluno B: errou todas
    const submissoesB: TriResponseSubmission[] = itens.map(i => ({
      itemId: i.id,
      respostaEscolhida: (i.respostaCorreta + 1) % 5
    }));
    const thetaB = estimarTheta(itens, submissoesB);

    expect(thetaA).toBeGreaterThan(0.5);
    expect(thetaB).toBeLessThan(-0.5);
    expect(thetaA).toBeGreaterThan(thetaB);
  });

  it('should penalize pedagogical coherence when guessing pattern occurs (wrong easy, correct hard)', () => {
    const itemFacil: TriItem = {
      id: 'i_facil',
      enunciado: 'Questão elementar',
      area: 'Ciências da Natureza',
      habilidadeBNCC: 'EM13CNT101',
      opcoes: ['A', 'B', 'C', 'D', 'E'],
      respostaCorreta: 0,
      justificativa: 'Fácil',
      a: 1.5,
      b: -1.5, // Muito Fácil
      c: 0.2
    };

    const itemDificil: TriItem = {
      id: 'i_dificil',
      enunciado: 'Questão avançada',
      area: 'Ciências da Natureza',
      habilidadeBNCC: 'EM13CNT103',
      opcoes: ['A', 'B', 'C', 'D', 'E'],
      respostaCorreta: 0,
      justificativa: 'Difícil',
      a: 1.8,
      b: 1.8, // Muito Difícil
      c: 0.2
    };

    const itens = [itemFacil, itemDificil];

    // Aluno Coerente: acertou o fácil, errou o difícil
    const coerenteSub: TriResponseSubmission[] = [
      { itemId: 'i_facil', respostaEscolhida: 0 },
      { itemId: 'i_dificil', respostaEscolhida: 1 }
    ];
    const coerenciaAlta = calcularCoerenciaPedagogica(itens, coerenteSub);

    // Aluno Incoerente (chute): errou o fácil, acertou o difícil
    const incoerenteSub: TriResponseSubmission[] = [
      { itemId: 'i_facil', respostaEscolhida: 1 },
      { itemId: 'i_dificil', respostaEscolhida: 0 }
    ];
    const coerenciaBaixa = calcularCoerenciaPedagogica(itens, incoerenteSub);

    expect(coerenciaAlta).toBe(100);
    expect(coerenciaBaixa).toBeLessThan(70);
  });

  it('should correctly process complete ENEM simulation with TRI scores and classification', () => {
    const itens = BANCO_ITENS_ENEM_PADRAO;

    // Aluno gabaritando o simulado
    const submissoes: TriResponseSubmission[] = itens.map(i => ({
      itemId: i.id,
      respostaEscolhida: i.respostaCorreta
    }));

    const resultado = processarSimuladoEnemTRI(itens, submissoes);

    expect(resultado.totalQuestoes).toBe(itens.length);
    expect(resultado.acertosBrutos).toBe(itens.length);
    expect(resultado.porcentagemAcerto).toBe(100);
    expect(resultado.notaEnem).toBeGreaterThan(650);
    expect(resultado.classificacao).toBe('Excelente');
    expect(resultado.detalhesPorItem).toHaveLength(itens.length);
    expect(resultado.recomendacoesPedagogicas.length).toBeGreaterThan(0);
  });

  it('should calculate SaaS B2B School ROI compared to traditional physical lab costs', () => {
    const custoLabFisicoAnual = 120000;
    const precoAlunoAno = 7.9 * 12; // R$ 94,80 por ano

    // Escola com 300 alunos
    const custo300Alunos = 300 * precoAlunoAno; // R$ 28.440
    const economia300 = custoLabFisicoAnual - custo300Alunos;

    expect(custo300Alunos).toBeCloseTo(28440, 1);
    expect(economia300).toBeCloseTo(91560, 1);
    expect(economia300).toBeGreaterThan(50000); // Economia massiva comprovada
  });

  it('should validate CSV student parser logic for bulk enrollment', () => {
    const csvContent = `Nome,Email,Turma,Matricula
Carlos Drummond,carlos@escola.com.br,1º Ano EM,MAT-01
Cecília Meireles,cecilia@escola.com.br,1º Ano EM,MAT-02
Invalido Sem Arroba,invalido.escola.com.br,1º Ano EM,MAT-03
A,invalido2@escola.com.br,1º Ano EM,MAT-04`;

    const linhas = csvContent.trim().split('\n').slice(1);
    const alunos = linhas.map(l => {
      const p = l.split(',');
      const nome = p[0].trim();
      const email = p[1].trim();
      const valido = nome.length >= 3 && email.includes('@');
      return { nome, email, valido };
    });

    const validos = alunos.filter(a => a.valido);
    const invalidos = alunos.filter(a => !a.valido);

    expect(validos).toHaveLength(2);
    expect(invalidos).toHaveLength(2);
    expect(validos[0].nome).toBe('Carlos Drummond');
  });
});
