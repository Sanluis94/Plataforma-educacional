import { describe, it, expect, beforeEach } from 'vitest';
import { generateShortClassCode } from '../modules/data/repositories/classRepository';
import { saveLocalClass, enrollLocalStudent, getLocalStudentClasses } from '../modules/data/services/localEtlClient';

describe('Short Class Code (6 Dígitos) - Validação e Matrícula', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generateShortClassCode deve produzir código de exatamente 6 caracteres seguros', () => {
    const validChars = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

    for (let i = 0; i < 50; i++) {
      const code = generateShortClassCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(validChars);
      // Não deve conter caracteres visualmente ambíguos
      expect(code).not.toContain('0');
      expect(code).not.toContain('O');
      expect(code).not.toContain('1');
      expect(code).not.toContain('I');
    }
  });

  it('saveLocalClass deve incluir código de 6 caracteres na criação da turma', async () => {
    const novaTurma = await saveLocalClass('3º Ano A - Matemática', 'prof-001', 'Prof. Carlos');

    expect(novaTurma.id).toBeDefined();
    expect(novaTurma.name).toBe('3º Ano A - Matemática');
    expect(novaTurma.code).toBeDefined();
    expect(novaTurma.code).toHaveLength(6);
    expect(novaTurma.studentsCount).toBe(0);
  });

  it('enrollLocalStudent deve matricular estudante usando o código de 6 dígitos', async () => {
    const customCode = 'MAT101';
    const novaTurma = await saveLocalClass('1º Ano B - Física', 'prof-002', 'Prof. Ana', customCode);

    expect(novaTurma.code).toBe('MAT101');

    // Matricular usando o código em minúsculo para validar insensibilidade a caixa
    await enrollLocalStudent('mat101', 'student-xyz');

    const studentClasses = await getLocalStudentClasses('student-xyz');
    expect(studentClasses).toHaveLength(1);
    expect(studentClasses[0].id).toBe(novaTurma.id);
    expect(studentClasses[0].name).toBe('1º Ano B - Física');
    expect(studentClasses[0].code).toBe('MAT101');
    expect(studentClasses[0].studentsCount).toBe(1);
  });

  it('enrollLocalStudent deve manter retrocompatibilidade com o id legado da turma', async () => {
    const novaTurma = await saveLocalClass('2º Ano C - Química', 'prof-003', 'Prof. Roberto');

    // Matricular usando o id direto
    await enrollLocalStudent(novaTurma.id!, 'student-legacy');

    const studentClasses = await getLocalStudentClasses('student-legacy');
    expect(studentClasses).toHaveLength(1);
    expect(studentClasses[0].id).toBe(novaTurma.id);
    expect(studentClasses[0].name).toBe('2º Ano C - Química');
    expect(studentClasses[0].code).toBeDefined();
  });
});
