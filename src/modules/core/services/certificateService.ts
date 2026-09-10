/**
 * Certificate Service — Emissão e Validação de Certificados Digitais Acadêmicos.
 * Gera códigos hash de verificação de autenticidade padrão MEC/LTI.
 */
import type { DigitalCertificate } from '../../data/types';

const LOCAL_CERTS_KEY = 'edu_local_certificates';

function getLocalCertificates(): DigitalCertificate[] {
  try {
    const raw = localStorage.getItem(LOCAL_CERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCertificates(certs: DigitalCertificate[]) {
  try {
    localStorage.setItem(LOCAL_CERTS_KEY, JSON.stringify(certs));
  } catch (err) {
    console.error('Erro ao salvar certificados locais:', err);
  }
}

/**
 * Gera código hash único de autenticidade (ex: EDU-2026-F1A8-7B9C).
 */
export function generateCertificateCode(studentId: string, subject: string): string {
  const seed = `${studentId}:${subject}:${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `EDU-2026-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/**
 * Emite um novo certificado de conclusão de módulo ou disciplina.
 */
export function issueCertificate(
  studentId: string,
  studentName: string,
  courseOrSubject: string,
  hours = 40
): DigitalCertificate {
  const certs = getLocalCertificates();
  
  // Evita duplicatas para a mesma disciplina
  const existing = certs.find(c => c.alunoId === studentId && c.tituloCurso === courseOrSubject);
  if (existing) return existing;

  const newCert: DigitalCertificate = {
    id: `cert_${Date.now()}`,
    alunoId: studentId,
    alunoNome: studentName,
    tituloCurso: courseOrSubject,
    cargaHorariaHoras: hours,
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    codigoValidacao: generateCertificateCode(studentId, courseOrSubject)
  };

  certs.unshift(newCert);
  saveLocalCertificates(certs);
  return newCert;
}

/**
 * Retorna todos os certificados de um aluno.
 */
export function getStudentCertificates(studentId: string): DigitalCertificate[] {
  return getLocalCertificates().filter(c => c.alunoId === studentId);
}

/**
 * Valida a autenticidade de um certificado por seu código de validação.
 */
export function verifyCertificate(validationCode: string): DigitalCertificate | null {
  const certs = getLocalCertificates();
  return certs.find(c => c.codigoValidacao.toUpperCase() === validationCode.trim().toUpperCase()) || null;
}
