/**
 * Tipos centrais da camada Data.
 * Definem a estrutura dos documentos no Cloud Firestore.
 */

// ─── Coleção: users ───────────────────────────────────────────
export type UserRole = 'admin' | 'professor' | 'estudante';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  gradeLevel?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// ─── Coleção: classes ─────────────────────────────────────────
export interface ClassData {
  id?: string;
  name: string;
  professorId: string;
  professorName: string;
  gradeLevel?: string;
  studentsCount: number;
  studentIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Coleção: activities ──────────────────────────────────────
export interface ActivityData {
  id?: string;
  title: string;
  type: string;
  config: Record<string, unknown>;
  classId?: string;
  className?: string;
  professorId: string;
  dueDate?: string;
  createdAt: string;
  status: 'published' | 'draft';
}

// ─── Coleção: submissions ─────────────────────────────────────
export interface SubmissionData {
  id?: string;
  activityId: string;
  activityTitle: string;
  classId: string;
  studentId: string;
  studentName: string;
  score: number;
  answers?: Record<string, unknown>;
  submittedAt: string;
  status: 'completed' | 'pending';
}

// ─── Coleção: progress ────────────────────────────────────────
export interface ProgressData {
  level: number;
  xp: number;
  coins: number;
  completedModules: string[];
  purchasedItems: string[];
  enrolledClasses?: string[];
  updatedAt: string;
}

// ─── Coleção: system_logs ─────────────────────────────────────
export type LogType = 'auth' | 'ai' | 'error' | 'activity' | 'system';

export interface SystemLog {
  id?: string;
  timestamp: string;
  type: LogType;
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ─── Constantes padrão ────────────────────────────────────────
export const DEFAULT_PROGRESS: ProgressData = {
  level: 1,
  xp: 0,
  coins: 0,
  completedModules: [],
  purchasedItems: [],
  enrolledClasses: [],
  updatedAt: new Date().toISOString(),
};
