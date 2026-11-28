import type { ExamData } from '../types';

function parseExamDate(value: string, endOfDay: boolean): number | null {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const time = endOfDay ? 'T23:59:59.999' : 'T00:00:00.000';
  const date = new Date(dateOnly ? value + time : value);
  if (!Number.isFinite(date.getTime())) return null;
  if (dateOnly) {
    const [year, month, day] = value.split('-').map(Number);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  }
  return date.getTime();
}

export function examDeadlineAt(exam: Pick<ExamData, 'dataLimite'>): number | null {
  if (!exam.dataLimite) return null;
  return parseExamDate(exam.dataLimite, true);
}

export function examAcceptingAnswers(exam: Pick<ExamData, 'status' | 'dataInicio' | 'dataLimite'>, now = Date.now()): boolean {
  if (exam.status !== 'Aberta' || !Number.isFinite(now)) return false;
  const start = exam.dataInicio ? parseExamDate(exam.dataInicio, false) : null;
  const deadline = examDeadlineAt(exam);
  if ((exam.dataLimite && deadline === null) || (exam.dataInicio && start === null)) return false;
  return (start === null || now >= start) && (deadline === null || now <= deadline);
}
