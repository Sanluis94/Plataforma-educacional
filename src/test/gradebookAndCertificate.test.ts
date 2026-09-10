import { describe, it, expect, vi } from 'vitest';

vi.mock('../modules/core/services/firebaseConfig', () => ({
  db: null
}));

const {
  calculateStudentGrade,
  calculateStudentAttendanceRate,
  saveAttendanceRecord,
  getAttendanceByClass,
  saveForumTopic,
  getForumTopicsByClass,
  addForumReply
} = await import('../modules/data/repositories/gradebookRepository');

const {
  issueCertificate,
  getStudentCertificates,
  verifyCertificate
} = await import('../modules/core/services/certificateService');

describe('Gradebook & Attendance (Moodle Pattern)', () => {
  it('should correctly calculate weighted final grade and academic status', () => {
    // Student with 8.0 on exams (40%), 9.0 on labs (30%), 7.0 on activities (20%), 10 on participation (10%)
    const result = calculateStudentGrade({
      notaProvas: 8.0,
      notaLabs: 9.0,
      notaAtividades: 7.0,
      notaParticipacao: 10.0
    });

    // Weighted sum = (8*0.4) + (9*0.3) + (7*0.2) + (10*0.1) = 3.2 + 2.7 + 1.4 + 1.0 = 8.3
    expect(result.mediaFinal).toBe(8.3);
    expect(result.situacao).toBe('Aprovado');
  });

  it('should identify recovery status when grade is between 4.0 and 5.9', () => {
    const result = calculateStudentGrade({
      notaProvas: 5.0,
      notaLabs: 5.0,
      notaAtividades: 5.0,
      notaParticipacao: 5.0
    });
    expect(result.mediaFinal).toBe(5.0);
    expect(result.situacao).toBe('Recuperação');
  });

  it('should record attendance and calculate attendance rate with LDB alert', async () => {
    const classId = `class_att_${Date.now()}`;
    const studentId = 'student-123';

    // Aula 1: presente
    await saveAttendanceRecord({
      turmaId: classId,
      data: '2026-09-01',
      registros: [{ studentId, studentName: 'Lucas', status: 'presente' }],
      criadoEm: new Date().toISOString()
    });

    // Aula 2: falta
    await saveAttendanceRecord({
      turmaId: classId,
      data: '2026-09-02',
      registros: [{ studentId, studentName: 'Lucas', status: 'falta' }],
      criadoEm: new Date().toISOString()
    });

    const records = await getAttendanceByClass(classId);
    expect(records).toHaveLength(2);

    const attRate = calculateStudentAttendanceRate(studentId, records);
    expect(attRate.totalAulas).toBe(2);
    expect(attRate.presencas).toBe(1);
    expect(attRate.faltas).toBe(1);
    expect(attRate.taxaPercentual).toBe(50);
    expect(attRate.alertaLDB).toBe(true); // < 75% triggers warning
  });

  it('should manage pedagogical forum topics and peer replies', async () => {
    const classId = `class_forum_${Date.now()}`;

    const topic = await saveForumTopic({
      turmaId: classId,
      autorId: 'prof-1',
      autorNome: 'Prof. Marcos',
      autorRole: 'professor',
      titulo: 'Como interpretar o efeito fotoelétrico?',
      conteudo: 'Discutam como a energia dos fótons ejeta fotoelétrons.',
      disciplina: 'Física'
    });

    expect(topic.id).toBeDefined();

    await addForumReply(classId, topic.id!, {
      autorId: 'aluno-1',
      autorNome: 'Ana',
      autorRole: 'estudante',
      texto: 'A energia cinética do elétron é dada por K = hf - função trabalho.',
      isMelhorResposta: true,
      moedasGanhas: 15
    });

    const topics = await getForumTopicsByClass(classId);
    expect(topics).toHaveLength(1);
    expect(topics[0].respostas).toHaveLength(1);
    expect(topics[0].respostas[0].autorNome).toBe('Ana');
  });
});

describe('Digital Certificate Service', () => {
  it('should issue digital certificate with verifiable authentication code', () => {
    const cert = issueCertificate('student-99', 'Mariana Silva', 'Física Moderna', 40);
    expect(cert.codigoValidacao).toContain('EDU-2026-');
    expect(cert.alunoNome).toBe('Mariana Silva');
    expect(cert.cargaHorariaHoras).toBe(40);

    const list = getStudentCertificates('student-99');
    expect(list).toHaveLength(1);

    const verified = verifyCertificate(cert.codigoValidacao);
    expect(verified).not.toBeNull();
    expect(verified?.alunoNome).toBe('Mariana Silva');
  });
});
