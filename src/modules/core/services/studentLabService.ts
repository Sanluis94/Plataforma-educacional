import { completeStudentLabProgress } from '../../data/repositories/studentRepository';
import { writeLog } from '../../data/repositories/logRepository';
import type { UserRole } from '../../data/types';

export interface CompletedLearningLab {
  id: string;
  title: string;
}

/** Free laboratory exploration rewards students without creating class work. */
export async function completeStudentLab(studentId: string | undefined, role: UserRole | undefined, lab: CompletedLearningLab, score: number) {
  if (!studentId || role !== 'estudante') return null;
  const completion = await completeStudentLabProgress(studentId, lab.id, score);
  if (!completion.alreadyCompleted) {
    await writeLog('activity', `Laboratório completado: "${lab.id}" — Score: ${score}`, studentId);
  }
  return completion;
}
