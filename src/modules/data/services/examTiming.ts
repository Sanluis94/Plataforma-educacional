import type { ExamData } from '../types';

export function examDeadlineAt(exam: Pick<ExamData, 'dataLimite'>): number | null {
  if (!exam.dataLimite) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(exam.dataLimite);
  const date = new Date(dateOnly ? exam.dataLimite + 'T23:59:59.999' : exam.dataLimite);
  if (!Number.isFinite(date.getTime())) return null;
  if (dateOnly) {
    const [year, month, day] = exam.dataLimite.split('-').map(Number);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  }
  return date.getTime();
}

export function examAcceptingAnswers(exam: Pick<ExamData, 'status' | 'dataInicio' | 'dataLimite'>, now = Date.now()): boolean {
  if (exam.status !== 'Aberta') return false;
  const start = exam.dataInicio ? Date.parse(exam.dataInicio) : null;
  const deadline = examDeadlineAt(exam);
  if ((exam.dataLimite && deadline === null) || (start !== null && !Number.isFinite(start))) return false;
  return (start === null || now >= start) && (deadline === null || now <= deadline);
}
