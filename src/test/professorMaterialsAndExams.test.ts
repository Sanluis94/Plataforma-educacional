import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../modules/core/services/firebaseConfig', () => ({
  db: null
}));

import { sanitizeForFirestore } from '../modules/core/services/firestoreUtils';
import { saveExam, getExamsByProfessor, getExamsByClass } from '../modules/data/repositories/examRepository';
import {
  addEnhancedMaterial,
  getEnhancedMaterials,
  createClassNotice,
  getClassNotices,
  deduplicateNotices,
  deduplicateMaterials
} from '../modules/data/repositories/classRepository';

describe('Professor Materials and Exam Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('sanitizeForFirestore', () => {
    it('deve remover chaves undefined de objetos de topo e aninhados', () => {
      const input = {
        title: 'Material 1',
        url: undefined,
        metadata: {
          author: 'Prof',
          notes: undefined
        },
        duration: undefined
      };

      const result = sanitizeForFirestore(input);
      expect(result).not.toHaveProperty('url');
      expect(result).not.toHaveProperty('duration');
      expect(result.metadata).not.toHaveProperty('notes');
      expect(result.title).toBe('Material 1');
      expect(result.metadata.author).toBe('Prof');
    });
  });

  describe('Exam Creation & Fallback', () => {
    it('deve salvar e recuperar provas mesmo com campos opcionais undefined', async () => {
      const exam = await saveExam({
        professorId: 'prof_test_123',
        professorName: 'Prof. Teste',
        titulo: 'Avaliação de Termodinâmica',
        descricao: 'Exame bimestral',
        disciplina: 'F�ica',
        turmaId: 'turma_a',
        turmaNome: undefined,
        duracaoMinutos: 50,
        dataLimite: undefined,
        status: 'Aberta',
        pesoTotal: 10,
        questoes: [
          {
            enunciado: 'Qual � a 1º Lei da Termodinâmica?',
            tema: 'Termologia',
            nivelDificuldade: 'Médio',
            valorPeso: 5,
            justificativa: 'Conservação de Energia',
            opcoes: [
              { texto: 'deltaU = Q - W', isCorreta: true },
              { texto: 'PV = nRT', isCorreta: false }
            ]
          }
        ],
        criadoEm: new Date().toISOString()
      });

      expect(exam.id).toBeDefined();
      expect(exam.titulo).toBe('Avaliação de Termodinâmica');

      const profExams = await getExamsByProfessor('prof_test_123');
      expect(profExams.length).toBeGreaterThanOrEqual(1);
      expect(profExams[0].titulo).toBe('Avaliação de Termodinâmica');

      const classExams = await getExamsByClass('turma_a');
      expect(classExams.length).toBeGreaterThanOrEqual(1);
      expect(classExams[0].questoes[0].opcoes[0].isCorreta).toBe(true);
    });
  });

  describe('Polymorphic Materials Upload (Texto, Link e Arquivo)', () => {
    it('deve adicionar e listar materiais didáticos de texto com integridade', async () => {
      const matTexto = await addEnhancedMaterial('turma_mat_1', {
        title: 'Resumo da Teoria Atômica',
        description: 'Orientações de estudo',
        tipo: 'texto',
        linkOuConteudo: 'O modelo de Bohr postula órbitas quantizadas.',
        disciplina: 'Química',
        periodo: '1ª Bimestre',
        professorId: 'prof_test'
      });

      expect(matTexto.id).toBeDefined();
      expect(matTexto.tipo).toBe('texto');

      const mats = await getEnhancedMaterials('turma_mat_1');
      expect(mats.length).toBe(1);
      expect(mats[0].tipo).toBe('texto');
      expect(mats[0].linkOuConteudo).toContain('modelo de Bohr');
    });

    it('deve adicionar materiais de link com URL externa', async () => {
      const matLink = await addEnhancedMaterial('turma_mat_2', {
        title: 'Vídeo da Simulação no YouTube',
        description: 'Vídeo explicativo',
        tipo: 'link',
        linkOuConteudo: 'https://youtube.com/watch?v=exemplo',
        disciplina: 'F�ica',
        periodo: '2ª Bimestre',
        professorId: 'prof_test'
      });

      expect(matLink.tipo).toBe('link');
      const mats = await getEnhancedMaterials('turma_mat_2');
      expect(mats[0].linkOuConteudo).toBe('https://youtube.com/watch?v=exemplo');
    });

    it('deve adicionar materiais de arquivo mantendo metadados de nome e tamanho', async () => {
      const matArquivo = await addEnhancedMaterial('turma_mat_3', {
        title: 'Apostila Completa em PDF',
        description: 'Material complementar',
        tipo: 'pdf',
        linkOuConteudo: 'data:application/pdf;base64,JVBEREg0LjQqL',
        nomeArquivo: 'apostila_mecanica.pdf',
        tamanhoFormatado: '2.4 MB',
        disciplina: 'F�sica',
        periodo: '1º Bimestre',
        professorId: 'prof_test'
      });

      expect(matArquivo.nomeArquivo).toBe('apostila_mecanica.pdf');
      const matsClass = await getEnhancedMaterials('turma_mat_3');
      expect(matsClass[0].nomeArquivo).toBe('apostila_mecanica.pdf');
      expect(matsClass[0].tamanhoFormatado).toBe('2.4 MB');
    });
  });

  describe('Deduplicação de Avisos e Materiais (Eliminação de Duplicatas)', () => {
    it('deve deduplicar avisos com mesmo ID ou mesmo conteúdo composto (título + texto)', () => {
      const rawNotices = [
        { id: 'notice_1', titulo: 'Aviso de Prova', texto: 'A prova ocorrerá na sexta-feira.', criadoEm: '2026-09-19T10:00:00Z' },
        { id: 'notice_1', titulo: 'Aviso de Prova', texto: 'A prova ocorrerá na sexta-feira.', criadoEm: '2026-09-19T10:00:00Z' },
        { id: 'notice_2', titulo: 'Aviso de Prova', texto: 'A prova ocorrerá na sexta-feira.', criadoEm: '2026-09-19T10:01:00Z' },
        { id: 'notice_3', titulo: 'Novo Material', texto: 'Slides adicionados.', criadoEm: '2026-09-19T10:02:00Z' }
      ];

      const deduped = deduplicateNotices(rawNotices);
      expect(deduped).toHaveLength(2);
      expect(deduped.map(n => n.titulo)).toEqual(['Aviso de Prova', 'Novo Material']);
    });

    it('deve salvar aviso e não duplicar quando publicado múltiplas vezes com mesmo conteúdo', async () => {
      const classId = 'turma_notice_test_1';
      await createClassNotice(classId, 'prof_1', 'Prof. Carlos', 'Atenção aos Prazos', 'Entrega do relatório até domingo.');
      await createClassNotice(classId, 'prof_1', 'Prof. Carlos', 'Atenção aos Prazos', 'Entrega do relatório até domingo.');

      const notices = await getClassNotices(classId);
      expect(notices).toHaveLength(1);
      expect(notices[0].titulo).toBe('Atenção aos Prazos');
    });

    it('deve deduplicar materiais com mesmo ID ou mesmo título e conteúdo', () => {
      const rawMaterials = [
        { id: 'mat_1', title: 'Guia de Estudo', nomeArquivo: 'guia.pdf', tipo: 'pdf' },
        { id: 'mat_1', title: 'Guia de Estudo', nomeArquivo: 'guia.pdf', tipo: 'pdf' },
        { id: 'mat_local_123', title: 'Guia de Estudo', nomeArquivo: 'guia.pdf', tipo: 'pdf' },
        { id: 'mat_2', title: 'Simulador Online', linkOuConteudo: 'https://sim.edu', tipo: 'link' }
      ];

      const deduped = deduplicateMaterials(rawMaterials);
      expect(deduped).toHaveLength(2);
      expect(deduped[0].title).toBe('Guia de Estudo');
      expect(deduped[1].title).toBe('Simulador Online');
    });
  });
});

