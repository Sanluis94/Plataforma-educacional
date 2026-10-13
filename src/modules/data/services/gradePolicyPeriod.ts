import type { AttendanceRecord, ExamAttempt, SubmissionData } from '../types';

/** Period dates are inclusive in the school calendar, irrespective of browser timezone. */
export function gradePolicyDataInPeriod<T extends { submissions: SubmissionData[]; examAttempts: ExamAttempt[]; attendanceRecords: AttendanceRecord[] }>(policy: { startDate: string | null; endDate: string | null } | null, data: T): T {
  if (!policy?.startDate || !policy.endDate) return data;
  const inPeriod = (value: string) => {
    const date = value?.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= policy.startDate! && date <= policy.endDate!;
  };
  return { ...data, submissions: data.submissions.filter(entry => inPeriod(entry.submittedAt)), examAttempts: data.examAttempts.filter(entry => inPeriod(entry.dataEnvio)), attendanceRecords: data.attendanceRecords.filter(entry => inPeriod(entry.data)) };
}
