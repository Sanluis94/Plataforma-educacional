import { getProfessorClasses } from '../../data/repositories/classRepository';
import { getSubmissionsByStudent, getSubmissionsByStudentInClass } from '../../data/repositories/submissionRepository';
import { getStudentProgress } from '../../data/repositories/studentRepository';
import { getLearningLab } from '../constants/learningCatalog';
import { LEARNING_LEVELS, learningLevelLabel, type LearningLevel } from '../constants/learningLevels';
import { normalizeLearningEvidence, learningTimestamp } from '../../data/services/learningAnalytics';
import type { SubmissionData } from '../../data/types';
import { getCertificateRecordsByStudent, getPublicCertificate, getPrivateCertificateRecord, revokeCertificateRecord, saveCertificateRecord, type CertificateRecord, type CertificateRequirements, type PublicCertificate } from '../../data/repositories/certificateRepository';
export type { CertificateRequirements, PublicCertificate } from '../../data/repositories/certificateRepository';

export interface Certificate {
  id: string; alunoId: string; alunoNome: string; tituloCurso: string; cargaHorariaHoras: number;
  dataEmissao: string; codigoValidacao: string; instituicao: string;
  kind: CertificateRecord['kind']; status: CertificateRecord['status']; observedSeconds: number | null; verificationUrl: string;
  requirements: CertificateRequirements; completedCount: number;
}
export interface LabCertificate {
  certificateId: string; studentId: string; studentName: string; institutionName: string; academicLevelLabel: string;
  totalSimulatedHours: number; completedLabsCount: number; issueDate: string; verificationHash: string; verificationUrl: string;
  observedSeconds: number | null; status: CertificateRecord['status'];
}

const verificationUrl = (id: string) => `${typeof location === 'undefined' ? 'https://plataforma-educacional-73df6.web.app' : location.origin}/verificar-certificado?codigo=${encodeURIComponent(id)}`;
const classic = (record: CertificateRecord): Certificate => ({ id: record.id, alunoId: record.studentId, alunoNome: record.studentName, tituloCurso: record.title,
  cargaHorariaHoras: record.authorizedCourseHours ?? 0, dataEmissao: record.issuedAt, codigoValidacao: record.publicCode, instituicao: record.issuerLabel,
  kind: record.kind, status: record.status, observedSeconds: record.observedSeconds, verificationUrl: verificationUrl(record.publicCode), requirements: record.requirements, completedCount: record.completedItemIds.length,
});

/** Integrity checksum; authenticity is confirmed by the persisted registry. */
export async function generateCertificateHash(payload: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('Este navegador não oferece o recurso de integridade necessário para emitir o comprovante.');
  const hash = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function qualifyingCertificateEvidence(submissions: SubmissionData[], studentId: string, requirements: CertificateRequirements, labIds?: Set<string>): SubmissionData[] {
  const latest = new Map<string, SubmissionData>();
  for (const submission of submissions) {
    const evidence = normalizeLearningEvidence(submission.evidence);
    if (!submission.id || submission.studentId !== studentId || submission.status !== 'completed' || evidence?.stage !== 'assessment' || !['lab', 'activity'].includes(evidence.source) || !evidence.questions?.length || !learningTimestamp(submission.submittedAt)) continue;
    const itemId = evidence.labId || submission.activityId;
    if (labIds && (evidence.source !== 'lab' || !labIds.has(itemId))) continue;
    if (requirements.subject && evidence.subject?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() !== requirements.subject.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) continue;
    const key = `${evidence.source}:${itemId}`;
    const previous = latest.get(key);
    if (!previous || Date.parse(submission.submittedAt) > Date.parse(previous.submittedAt)) latest.set(key, { ...submission, evidence });
  }
  return [...latest.values()].filter(submission => {
    const questions = submission.evidence!.questions!;
    if (questions.some(question => typeof question.correct !== 'boolean')) return false;
    const measured = Math.round(questions.filter(question => question.correct).length / questions.length * 100);
    return Number.isFinite(submission.score) && submission.score >= requirements.minScore && submission.score <= 100 && Math.abs(submission.score - measured) <= 1;
  }).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

function validRequirements(requirements: CertificateRequirements) {
  if (!Number.isInteger(requirements.minimumCompleted) || requirements.minimumCompleted < 1 || requirements.minimumCompleted > 8 || !Number.isFinite(requirements.minScore) || requirements.minScore < 0 || requirements.minScore > 100) throw new Error('Defina de 1 a 8 atividades e aproveitamento entre 0 e 100%.');
}
async function persist(studentId: string, studentName: string, title: string, issuerId: string, classId: string, kind: CertificateRecord['kind'], authorizedCourseHours: number | null, requirements: CertificateRequirements, evidence: SubmissionData[], academicLevelLabel?: string): Promise<CertificateRecord> {
  validRequirements(requirements);
  if (!studentId || !studentName.trim() || !title.trim() || evidence.length < requirements.minimumCompleted) throw new Error(`Os requisitos ainda não foram cumpridos: ${evidence.length} de ${requirements.minimumCompleted} atividades elegíveis.`);
  const selected = evidence.slice(0, 8);
  const completedItemIds = selected.map(entry => entry.evidence?.labId || entry.activityId);
  const existing = (await getCertificateRecordsByStudent(studentId,classId||undefined)).find(record => record.status === 'active' && record.kind === kind && record.classId === classId && record.title === title.trim() && record.authorizedCourseHours === authorizedCourseHours && JSON.stringify(record.completedItemIds) === JSON.stringify(completedItemIds) && JSON.stringify(record.requirements) === JSON.stringify(requirements) && JSON.stringify(record.evidenceSubmissionIds) === JSON.stringify(selected.map(entry=>entry.id)));
  if (existing) return existing;
  const id = crypto.randomUUID();
  const times = selected.map(entry => entry.evidence?.activeSeconds).filter((time): time is number => time !== undefined);
  const record: CertificateRecord = { id, publicCode: id, studentId, studentName: studentName.trim(), classId, issuerId, kind, title: title.trim(),
    issuerLabel: kind === 'course' ? 'Professor responsável pela turma · Edu-Interact' : 'Registro de prática · Edu-Interact',
    issuedAt: new Date().toISOString(), status: 'active', authorizedCourseHours, observedSeconds: times.length === selected.length ? times.reduce((sum, value) => sum + value, 0) : null,
    completedItemIds, evidenceSubmissionIds: selected.map(entry => entry.id!), requirements, integrityHash: '', ...(academicLevelLabel ? { academicLevelLabel } : {}),
  };
  record.integrityHash = await generateCertificateHash(JSON.stringify({ ...record, integrityHash: undefined }));
  return saveCertificateRecord(record);
}

export async function issueCertificate(studentId: string, studentName: string, title: string, authorizedCourseHours: number, options: { classId: string; issuerId: string; requirements: CertificateRequirements }): Promise<Certificate> {
  if (!options?.classId || !options.issuerId || !Number.isFinite(authorizedCourseHours) || authorizedCourseHours <= 0 || authorizedCourseHours > 1000) throw new Error('O professor deve definir a turma, os requisitos e a carga horária autorizada do curso.');
  validRequirements(options.requirements);
  const classes = await getProfessorClasses(options.issuerId);
  const classData = classes.find(entry => entry.id === options.classId);
  if (!classData || !classData.studentIds?.includes(studentId)) throw new Error('Somente o professor responsável pode emitir para um aluno matriculado nesta turma.');
  const submissions = await getSubmissionsByStudentInClass(studentId, options.classId);
  const eligible = qualifyingCertificateEvidence(submissions, studentId, options.requirements);
  return classic(await persist(studentId, studentName, title, options.issuerId, options.classId, 'course', authorizedCourseHours, options.requirements, eligible));
}
export async function getStudentCertificates(studentId: string): Promise<Certificate[]> { return (await getCertificateRecordsByStudent(studentId)).map(classic); }
export async function verifyCertificate(code: string): Promise<PublicCertificate | null> { return getPublicCertificate(code.trim()); }
export async function revokeCertificate(id: string, issuerId: string, reason: string): Promise<void> {
  const record = await getPrivateCertificateRecord(id);
  if (!record || record.issuerId !== issuerId || record.kind !== 'course' || !reason.trim()) throw new Error('A revogação exige o professor emissor e um motivo.');
  await revokeCertificateRecord(id, reason.trim());
}

export async function getLabCertificateEligibility(studentId: string, academicLevel: LearningLevel) {
  const [progress, submissions] = await Promise.all([getStudentProgress(studentId), getSubmissionsByStudent(studentId)]);
  const labIds = new Set(progress.completedModules.filter(id => getLearningLab(id)?.academicLevel === academicLevel));
  const requirements: CertificateRequirements = { minimumCompleted: 1, minScore: 0 };
  return qualifyingCertificateEvidence(submissions, studentId, requirements, labIds).slice(0, 8);
}
export async function issueLabCertificate(params: { studentId: string; studentName: string; academicLevel?: LearningLevel; academicLevelLabel: string; completedLabsCount?: number; totalSimulatedHours?: number; institutionName?: string }): Promise<LabCertificate> {
  const academicLevel = params.academicLevel ?? LEARNING_LEVELS.find(level => learningLevelLabel(level.id) === params.academicLevelLabel)?.id;
  if (!academicLevel) throw new Error('Selecione um nível de aprendizagem válido.');
  const eligible = await getLabCertificateEligibility(params.studentId, academicLevel);
  const record = await persist(params.studentId, params.studentName, `Atividades de aprendizagem · ${learningLevelLabel(academicLevel)}`, params.studentId, '', 'lab-record', null, { minimumCompleted: 1, minScore: 0 }, eligible, learningLevelLabel(academicLevel));
  return { certificateId: record.id, studentId: record.studentId, studentName: record.studentName, institutionName: record.issuerLabel,
    academicLevelLabel: record.academicLevelLabel!, totalSimulatedHours: 0, completedLabsCount: record.completedItemIds.length, issueDate: record.issuedAt,
    verificationHash: record.integrityHash, verificationUrl: verificationUrl(record.publicCode), observedSeconds: record.observedSeconds, status: record.status,
  };
}
export async function verifyCertificateAuthenticity(certificate: LabCertificate): Promise<boolean> {
  const registered = await getPublicCertificate(certificate.certificateId);
  return registered?.status === 'active' && registered.integrityHash === certificate.verificationHash && registered.completedCount === certificate.completedLabsCount;
}
