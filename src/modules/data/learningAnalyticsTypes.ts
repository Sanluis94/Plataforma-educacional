import type { ActivityData, ClassData, ExamAttempt, ExamData, LessonPlanItem, ProgressData, SubmissionData, UserData } from './types';

export type LearningSource = 'activity' | 'lab' | 'exam' | 'enem';
export interface LearningEvidence {
  schemaVersion: 1;
  source: LearningSource;
  sessionId: string;
  startedAt?: string;
  activeSeconds?: number;
  subject?: string;
  labId?: string;
  lessonPlanId?: string;
  stage?: 'exploration' | 'assessment' | 'response';
  questions?: { questionId: string; question: string; selectedOption: number | null; selectedText?: string; expectedText?: string; explanation?: string; correct: boolean | null; topic?: string }[];
  observations?: { scenarioId: string; scenarioLabel?: string; observed?: boolean; hypothesis: string }[];
  reflection?: string;
  estimatedScore?: { value: number; model: 'tri-practice'; scaleMax: 1000 };
  experiment?: { parameters: Record<string, number>; telemetry: Record<string, number>; parameterUnits?: Record<string, string>; telemetryUnits?: Record<string, string>; parameterLabels?: Record<string, string>; telemetryLabels?: Record<string, string>; samples: number };
}

export type LearningStatus = 'sem_dados' | 'em_destaque' | 'regular' | 'precisa_apoio';
export interface LearningRecord {
  id: string;
  itemId: string;
  title: string;
  source: LearningSource;
  subject: string | null;
  studentId: string;
  studentName: string;
  score: number | null;
  completed: boolean;
  submittedAt: string;
  activeSeconds: number | null;
  evidence?: LearningEvidence;
  assigned: boolean;
}

export interface ClassLearningReport {
  classId: string;
  className: string;
  professorName: string;
  generatedAt: string;
  source: 'local' | 'firestore' | 'batch';
  studentsCount: number;
  activitiesCount: number;
  expectedCompletions: number;
  completedActivitiesCount: number;
  averageScore: number | null;
  averageTimeSpentMinutes: number | null;
  completionRate: number | null;
  participationRate: number | null;
  studentsWithEvidence: number;
  assessedStudentsCount: number;
  scoredRecordsCount: number;
  measuredTimeRecordsCount: number;
  topModule: string;
  atRiskStudents: string[];
  quality: { received: number; accepted: number; duplicates: number; retries: number; excluded: number; missingScores: number; missingTimes: number; warnings: string[] };
  modules: {
    itemId: string; module: string; source: LearningSource; subject: string | null; assigned: boolean;
    eventsCount: number; attemptsCount: number; studentsCount: number; averageScore: number | null;
    completionRate: number | null; totalTimeSpentMinutes: number | null;
    questions: { questionId: string; question: string; responses: number; correct: number; accuracy: number | null }[];
  }[];
  students: {
    studentId: string; studentName: string; level: number; xp: number; coins: number;
    completedModulesCount: number; completedAssignedCount: number; expectedCount: number;
    averageScore: number | null; lastActive: string | null; status: LearningStatus;
    supportReasons: string[]; records: LearningRecord[];
  }[];
}

export interface ClassReportInput {
  classData: ClassData & { id: string };
  users: UserData[];
  progress?: Record<string, ProgressData>;
  activities: ActivityData[];
  submissions: SubmissionData[];
  exams?: ExamData[];
  examAttempts?: ExamAttempt[];
  lessonPlans?: LessonPlanItem[];
  source: ClassLearningReport['source'];
  now?: string;
}
