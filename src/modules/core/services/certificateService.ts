/**
 * Serviço Unificado de Emissão e Validação de Certificados Digitais Kortex
 * Suporta Certificados Clássicos de Curso (Padrão LMS/Moodle) e
 * Certificados Criptográficos de Laboratório com Hash SHA-256 e QR Code.
 */

// ─── MODELO CLÁSSICO (LMS / BOLETIM / Moodle) ───────────────────────

export interface Certificate {
  id: string;
  alunoId: string;
  alunoNome: string;
  tituloCurso: string;
  cargaHorariaHoras: number;
  dataEmissao: string;
  codigoValidacao: string;
  instituicao: string;
}

export function issueCertificate(
  alunoId: string,
  alunoNome: string,
  tituloCurso: string,
  cargaHorariaHoras = 40
): Certificate {
  const codigo = `EDU-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const cert: Certificate = {
    id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    alunoId,
    alunoNome,
    tituloCurso,
    cargaHorariaHoras,
    dataEmissao: new Date().toLocaleDateString('pt-BR'),
    codigoValidacao: codigo,
    instituicao: 'Kortex Plataforma Educacional Integrada'
  };

  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('kortex_certificates') : null;
    const list: Certificate[] = raw ? JSON.parse(raw) : [];
    list.unshift(cert);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('kortex_certificates', JSON.stringify(list));
    }
  } catch (_e) {
    // Storage fallback
  }

  return cert;
}

export function getStudentCertificates(alunoId: string): Certificate[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('kortex_certificates') : null;
    const list: Certificate[] = raw ? JSON.parse(raw) : [];
    return list.filter(c => c.alunoId === alunoId);
  } catch (_e) {
    return [];
  }
}

export function verifyCertificate(codigo: string): Certificate | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('kortex_certificates') : null;
    const list: Certificate[] = raw ? JSON.parse(raw) : [];
    return list.find(c => c.codigoValidacao.trim().toUpperCase() === codigo.trim().toUpperCase()) || null;
  } catch (_e) {
    return null;
  }
}

// ─── MODELO CRIPTOGRÁFICO AVANÇADO (LABS VIRTUAIS COM HASH SHA-256) ──

export interface LabCertificate {
  certificateId: string;
  studentId: string;
  studentName: string;
  institutionName: string;
  academicLevelLabel: string;
  totalSimulatedHours: number;
  completedLabsCount: number;
  issueDate: string;
  verificationHash: string;
  verificationUrl: string;
}

/**
 * Gera um hash SHA-256 no navegador ou ambiente Node
 */
export async function generateCertificateHash(payload: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32).toUpperCase();
    }
  } catch (_e) {
    // Fallback determinístico
  }

  // Fallback FNV-1a / DJB2
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return 'KTX-' + Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
}

/**
 * Cria o registro do certificado formal de conclusão de práticas de laboratório
 */
export async function issueLabCertificate(params: {
  studentId: string;
  studentName: string;
  academicLevelLabel: string;
  completedLabsCount: number;
  totalSimulatedHours: number;
  institutionName?: string;
}): Promise<LabCertificate> {
  const issueDate = new Date().toLocaleDateString('pt-BR');
  const certificateId = `CERT-KTX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  const payloadToSign = `${certificateId}|${params.studentId}|${params.studentName}|${params.totalSimulatedHours}|${issueDate}`;
  const verificationHash = await generateCertificateHash(payloadToSign);
  const verificationUrl = `https://plataforma-educacional-73df6.web.app/verificar-certificado?id=${certificateId}&hash=${verificationHash}`;

  const cert: LabCertificate = {
    certificateId,
    studentId: params.studentId,
    studentName: params.studentName,
    institutionName: params.institutionName || 'Kortex Plataforma Educacional & Laboratórios Virtuais',
    academicLevelLabel: params.academicLevelLabel,
    totalSimulatedHours: params.totalSimulatedHours,
    completedLabsCount: params.completedLabsCount,
    issueDate,
    verificationHash,
    verificationUrl
  };

  // Salva no armazenamento local para consulta offline imediata
  try {
    if (typeof localStorage !== 'undefined') {
      const existingRaw = localStorage.getItem('kortex_user_certificates');
      const existingList: LabCertificate[] = existingRaw ? JSON.parse(existingRaw) : [];
      existingList.unshift(cert);
      localStorage.setItem('kortex_user_certificates', JSON.stringify(existingList.slice(0, 20)));
    }
  } catch (_e) {
    // Sem localStorage
  }

  return cert;
}

/**
 * Valida se um hash de certificado confere com a assinatura esperada
 */
export async function verifyCertificateAuthenticity(cert: LabCertificate): Promise<boolean> {
  const payloadToSign = `${cert.certificateId}|${cert.studentId}|${cert.studentName}|${cert.totalSimulatedHours}|${cert.issueDate}`;
  const calculatedHash = await generateCertificateHash(payloadToSign);
  return calculatedHash === cert.verificationHash;
}
