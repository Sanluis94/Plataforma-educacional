import type { ActivityData, ClassData, LogType, ProgressData, SystemLog, UserData, UserRole, SubmissionData, ExamData, ExamAttempt, LessonPlanItem } from '../types';
import { buildClassLearningReport } from './learningAnalytics';
import type { ClassLearningReport } from '../learningAnalyticsTypes';
import { learningDocumentId, newLearningSessionId } from './learningCapture';

const LOCAL_ETL_BASE_URL = '/local-data/etl';
const LOCAL_DB_KEY = 'edu_local_db';

type LocalEtlSummary = {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalActivities: number;
};

type LocalTeacherMetric = {
  teacherName: string;
  email: string;
  classesCount: number;
  studentsCount: number;
};

type LocalLearningEvent = {
  id: string;
  activityId: string;
  studentId: string;
  professorId: string;
  classId: string | null;
  module: string;
  score: number;
  status: 'started' | 'completed';
  timeSpentMinutes: number;
  completedAt: string;
};

type LocalCollections = {
  users: Required<UserData>[];
  classes: Required<ClassData>[];
  activities: ActivityData[];
  progress: Record<string, ProgressData>;
  systemLogs: SystemLog[];
  learningEvents: LocalLearningEvent[];
  submissions?: SubmissionData[];
  exams?: ExamData[];
  examAttempts?: ExamAttempt[];
  lessonPlans?: LessonPlanItem[];
};

type LocalEtlSnapshot = {
  collections: LocalCollections;
  metrics: {
    summary: LocalEtlSummary;
    teacherPerformance: LocalTeacherMetric[];
  };
};

type LocalTeacher = {
  name: string;
  email: string;
  classes: number;
  students: number;
};

type LocalLogEntry = {
  time: string;
  type: LogType;
  message: string;
};

type LocalGlobalStats = {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalActivities: number;
};

export type LocalComplementaryMaterial = {
  id: string;
  title: string;
  description: string;
  link: string;
  createdAt: string;
};

export type LocalStudentMessage = {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  replied: boolean;
  replyText?: string;
  createdAt: string;
  repliedAt?: string;
};

export type LocalClassReport = ClassLearningReport;

// ─── LÓGICA DE PERSISTÊNCIA EM LOCALSTORAGE ─────────────────────────

const getLocalDb = async (): Promise<any> => {
  let dbStr = localStorage.getItem(LOCAL_DB_KEY);
  if (!dbStr) {
    const snapshot = await fetchLocalJson<LocalEtlSnapshot>('/index.json');
    const initialDb = {
      users: snapshot?.collections?.users ?? [],
      classes: snapshot?.collections?.classes ?? [],
      activities: snapshot?.collections?.activities ?? [],
      progress: snapshot?.collections?.progress ?? {},
      systemLogs: snapshot?.collections?.systemLogs ?? [],
      learningEvents: snapshot?.collections?.learningEvents ?? [],
      submissions: snapshot?.collections?.submissions ?? [],
      exams: snapshot?.collections?.exams ?? [],
      examAttempts: snapshot?.collections?.examAttempts ?? [],
      lessonPlans: snapshot?.collections?.lessonPlans ?? [],
      complementaryMaterials: {} as Record<string, LocalComplementaryMaterial[]>,
      messages: {} as Record<string, LocalStudentMessage[]>
    };
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(initialDb));
    return initialDb;
  }
  return JSON.parse(dbStr);
};

const saveLocalDb = (db: any) => {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
};

// ─── LEITURAS RECENTES DO BANCO DE DADOS LOCAL ──────────────────────

export const getLocalEtlTeachers = async (): Promise<LocalTeacher[]> => {
  const db = await getLocalDb();
  const teachers = db.users.filter((user: UserData) => user.role === 'professor');
  return teachers.map((teacher: UserData) => {
    const classes = db.classes.filter((c: ClassData) => c.professorId === teacher.id);
    const studentCount = classes.reduce((sum: number, c: ClassData) => sum + (c.studentIds?.length || 0), 0);
    return {
      name: teacher.name,
      email: teacher.email,
      classes: classes.length,
      students: studentCount
    };
  });
};

export const getLocalEtlUsers = async (): Promise<Required<UserData>[]> => {
  const db = await getLocalDb();
  return db.users;
};

export const getLocalEtlUserByRole = async (role: UserRole): Promise<Required<UserData> | null> => {
  const users = await getLocalEtlUsers();
  return users.find((user) => user.role === role) ?? null;
};

export const getLocalEtlClassesByProfessor = async (professorId?: string) => {
  if (!professorId) return [];
  const db = await getLocalDb();
  return db.classes
    .filter((classData: ClassData) => classData.professorId === professorId)
    .map((classData: ClassData) => ({
      id: classData.id!,
      name: classData.name,
      code: classData.code || classData.id?.slice(0, 6).toUpperCase(),
      studentsCount: classData.studentIds?.length || 0,
      studentIds: classData.studentIds || [],
      gradeLevel: classData.gradeLevel,
      academicLevel: classData.academicLevel,
    }));
};

export const getLocalStudentClasses = async (studentId: string): Promise<any[]> => {
  const db = await getLocalDb();
  return db.classes
    .filter((classData: ClassData) => classData.studentIds?.includes(studentId))
    .map((classData: ClassData) => ({
      id: classData.id!,
      name: classData.name,
      code: classData.code || classData.id?.slice(0, 6).toUpperCase(),
      studentsCount: classData.studentIds?.length || 0,
      professorName: classData.professorName || 'Professor',
      gradeLevel: classData.gradeLevel,
      academicLevel: classData.academicLevel,
    }));
};

export const getLocalEtlActivitiesByProfessor = async (professorId: string): Promise<ActivityData[]> => {
  const db = await getLocalDb();
  return db.activities.filter((activity: ActivityData) => activity.professorId === professorId);
};

export const getLocalEtlActivitiesByClass = async (classId: string): Promise<ActivityData[]> => {
  const db = await getLocalDb();
  return db.activities.filter((activity: ActivityData) => activity.classId === classId);
};

export const getLocalEtlProgress = async (studentId?: string): Promise<ProgressData | null> => {
  if (!studentId) return null;
  const db = await getLocalDb();
  return db.progress[studentId] ?? null;
};

function cachedRecords<T extends { id?: string }>(key: string, seeded: T[] = []): T[] {
  const value = localStorage.getItem(key);
  const cached = value ? JSON.parse(value) : [];
  if (!Array.isArray(cached)) throw new Error('Dados locais de aprendizagem inválidos.');
  return [...new Map([...seeded, ...cached].map(item => [item.id, item])).values()] as T[];
}

export const getLocalEtlClassReport = async (classId: string): Promise<LocalClassReport | null> => {
  const database = await getLocalDb();
  const classData = database.classes.find((entry: ClassData) => entry.id === classId);
  if (!classData) return null;
  const submissions: SubmissionData[] = database.submissions ?? [];
  const savedIds = new Set(submissions.map(submission => submission.id));
  const legacy = (database.learningEvents ?? []).filter((event: LocalLearningEvent) => !savedIds.has(event.id)).map((event: LocalLearningEvent) => ({
    id: event.id, activityId: event.activityId, activityTitle: event.module,
    classId: event.classId || '', studentId: event.studentId,
    studentName: database.users.find((user: UserData) => user.id === event.studentId)?.name || '',
    score: event.score, status: event.status === 'completed' ? 'completed' as const : 'pending' as const,
    submittedAt: event.completedAt,
  }));
  return buildClassLearningReport({
    classData, users: database.users, progress: database.progress, activities: database.activities,
    submissions: [...submissions, ...legacy],
    exams: cachedRecords<ExamData>('edu_local_exams', database.exams),
    examAttempts: cachedRecords<ExamAttempt>('edu_local_exam_attempts', database.examAttempts),
    lessonPlans: cachedRecords<LessonPlanItem>('edu_local_lesson_plans', database.lessonPlans),
    source: 'local',
  });
};

export const getLocalEtlLogs = async (maxResults = 50): Promise<LocalLogEntry[]> => {
  const db = await getLocalDb();
  return db.systemLogs
    .slice(0, maxResults)
    .map((log: SystemLog) => ({
      time: formatTime(log.timestamp),
      type: log.type,
      message: log.message,
    }));
};

export const getLocalEtlGlobalStats = async (): Promise<LocalGlobalStats> => {
  const db = await getLocalDb();
  return {
    totalStudents: db.users.filter((u: UserData) => u.role === 'estudante').length,
    totalTeachers: db.users.filter((u: UserData) => u.role === 'professor').length,
    totalClasses: db.classes.length,
    totalActivities: db.activities.length,
  };
};

export const getLocalEtlSnapshot = async (): Promise<LocalEtlSnapshot | null> => {
  const db = await getLocalDb();
  const summary = {
    totalStudents: db.users.filter((u: UserData) => u.role === 'estudante').length,
    totalTeachers: db.users.filter((u: UserData) => u.role === 'professor').length,
    totalClasses: db.classes.length,
    totalActivities: db.activities.length,
  };
  return {
    collections: db,
    metrics: {
      summary,
      teacherPerformance: []
    }
  };
};

// ─── OPERAÇÕES DE ESCRITA NO LOCALSTORAGE (MUTATIONS) ────────────────

export const saveLocalClass = async (
  name: string,
  professorId?: string,
  professorName?: string,
  customCode?: string
): Promise<ClassData> => {
  const db = await getLocalDb();
  const newClass: ClassData = {
    id: `local-class-${Date.now()}`,
    name,
    code: customCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
    professorId: professorId || 'local-prof',
    professorName: professorName || 'Professor Local',
    studentsCount: 0,
    studentIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.classes.push(newClass);
  saveLocalDb(db);
  return newClass;
};

export const enrollLocalStudent = async (classCodeOrId: string, studentId: string): Promise<void> => {
  const db = await getLocalDb();
  const search = classCodeOrId.trim().toUpperCase();
  const classData = db.classes.find((c: ClassData) => 
    c.id === classCodeOrId.trim() || 
    (c.code && c.code.toUpperCase() === search) || 
    (!c.code && search.length === 6 && c.id?.slice(0, 6).toUpperCase() === search)
  );
  if (!classData) throw new Error('Código de turma não encontrado.');
  if (classData) {
    if (!classData.studentIds) classData.studentIds = [];
    if (!classData.studentIds.includes(studentId)) {
      classData.studentIds.push(studentId);
      classData.studentsCount = classData.studentIds.length;
      classData.updatedAt = new Date().toISOString();
      saveLocalDb(db);
    }
  }
};

export const unenrollLocalStudent = async (classId: string, studentId: string): Promise<void> => {
  const db = await getLocalDb();
  const classData = db.classes.find((c: ClassData) => c.id === classId);
  if (classData && classData.studentIds) {
    classData.studentIds = classData.studentIds.filter((id: string) => id !== studentId);
    classData.studentsCount = classData.studentIds.length;
    classData.updatedAt = new Date().toISOString();
    saveLocalDb(db);
  }
};

export const saveLocalSubmission = async (
  submission: Omit<SubmissionData, 'id'>
): Promise<SubmissionData> => {
  const db = await getLocalDb();
  db.submissions ??= [];
  const id = submission.evidence?.sessionId
    ? learningDocumentId(submission.studentId, submission.evidence.sessionId, `${submission.classId}-${submission.evidence.stage ?? 'assessment'}`)
    : `local-sub-${newLearningSessionId()}`;
  const existing = db.submissions.find((entry: SubmissionData) => entry.id === id);
  if (existing) return existing;
  const newSub: SubmissionData = {
    ...submission,
    id,
  };
  // Preserve the actual evidence. Rewards are recorded separately and once.
  db.submissions.push(newSub);
  saveLocalDb(db);
  return newSub;
};

export const getLocalSubmissionsByStudent = async (studentId: string): Promise<SubmissionData[]> => {
  const db = await getLocalDb();
  const current: SubmissionData[] = (db.submissions ?? []).filter((entry: SubmissionData) => !studentId || entry.studentId === studentId);
  const currentIds = new Set(current.map(entry => entry.id));
  const legacy = db.learningEvents
    .filter((event: LocalLearningEvent) => (!studentId || event.studentId === studentId) && !currentIds.has(event.id))
    .map((event: LocalLearningEvent) => ({
      id: event.id,
      activityId: event.activityId,
      activityTitle: event.module,
      classId: event.classId || '',
      studentId: event.studentId,
      studentName: 'Estudante',
      score: event.score,
      submittedAt: event.completedAt,
      status: event.status === 'completed' ? 'completed' : 'pending',
    }));
  return [...current, ...legacy].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
};

export const getLocalSubmissionsByClass = async (classId: string): Promise<SubmissionData[]> => {
  return (await getLocalSubmissionsByStudent('')).filter(entry => entry.classId === classId);
};

export const saveLocalProgress = async (
  studentId: string,
  progress: Partial<ProgressData>
): Promise<void> => {
  const db = await getLocalDb();
  const oldProgress = db.progress[studentId] || {
    level: 1,
    xp: 0,
    coins: 0,
    completedModules: [],
    purchasedItems: [],
    enrolledClasses: [],
    updatedAt: new Date().toISOString()
  };
  db.progress[studentId] = {
    ...oldProgress,
    ...progress,
    updatedAt: new Date().toISOString()
  };
  saveLocalDb(db);
};

export const saveLocalActivity = async (activity: Omit<ActivityData, 'id'>): Promise<ActivityData> => {
  const db = await getLocalDb();
  const newActivity: ActivityData = {
    ...activity,
    id: `local-act-${Date.now()}`
  };
  db.activities.push(newActivity);
  saveLocalDb(db);
  return newActivity;
};

export const updateLocalActivity = async (id: string, data: Partial<Omit<ActivityData, 'id'>>): Promise<void> => {
  const db = await getLocalDb();
  const idx = db.activities.findIndex((act: ActivityData) => act.id === id);
  if (idx !== -1) {
    db.activities[idx] = { ...db.activities[idx], ...data };
    saveLocalDb(db);
  }
};

export const deleteLocalActivity = async (id: string): Promise<void> => {
  const db = await getLocalDb();
  db.activities = db.activities.filter((act: ActivityData) => act.id !== id);
  saveLocalDb(db);
};

// ─── OPERAÇÕES PARA MENSAGENS E MATERIAIS COMPLEMENTARES ────────────

export const saveLocalComplementaryMaterial = async (
  classId: string,
  material: Omit<LocalComplementaryMaterial, 'id' | 'createdAt'>
): Promise<LocalComplementaryMaterial> => {
  const db = await getLocalDb();
  if (!db.complementaryMaterials) db.complementaryMaterials = {};
  if (!db.complementaryMaterials[classId]) db.complementaryMaterials[classId] = [];

  const newMat: LocalComplementaryMaterial = {
    ...material,
    id: `mat-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  db.complementaryMaterials[classId].push(newMat);
  saveLocalDb(db);
  return newMat;
};

export const getLocalComplementaryMaterials = async (classId: string): Promise<LocalComplementaryMaterial[]> => {
  const db = await getLocalDb();
  if (!db.complementaryMaterials) return [];
  return db.complementaryMaterials[classId] || [];
};

export const saveLocalStudentMessage = async (
  classId: string,
  message: Omit<LocalStudentMessage, 'id' | 'createdAt' | 'replied'>
): Promise<LocalStudentMessage> => {
  const db = await getLocalDb();
  if (!db.messages) db.messages = {};
  if (!db.messages[classId]) db.messages[classId] = [];

  const newMsg: LocalStudentMessage = {
    ...message,
    id: `msg-${Date.now()}`,
    replied: false,
    createdAt: new Date().toISOString()
  };

  db.messages[classId].push(newMsg);
  saveLocalDb(db);
  return newMsg;
};

export const getLocalStudentMessages = async (classId: string): Promise<LocalStudentMessage[]> => {
  const db = await getLocalDb();
  if (!db.messages) return [];
  return db.messages[classId] || [];
};

export const replyLocalStudentMessage = async (
  classId: string,
  messageId: string,
  replyText: string,
  bonusCoins = 0,
  bonusXp = 0,
  studentId?: string
): Promise<void> => {
  const db = await getLocalDb();
  if (!db.messages || !db.messages[classId]) return;

  const msg = db.messages[classId].find((m: LocalStudentMessage) => m.id === messageId);
  if (msg) {
    msg.replied = true;
    msg.replyText = replyText;
    msg.repliedAt = new Date().toISOString();

    // Adiciona XP e Moedas se houver recompensa
    if (studentId && (bonusCoins > 0 || bonusXp > 0)) {
      const studProgress = db.progress[studentId] || {
        level: 1,
        xp: 0,
        coins: 0,
        completedModules: [],
        purchasedItems: [],
        enrolledClasses: [],
        updatedAt: new Date().toISOString()
      };
      studProgress.xp += bonusXp;
      studProgress.coins += bonusCoins;
      studProgress.level = Math.floor(studProgress.xp / 500) + 1;
      studProgress.updatedAt = new Date().toISOString();
      db.progress[studentId] = studProgress;
    }

    saveLocalDb(db);
  }
};

// ─── FUNÇÕES AUXILIARES DE RENDERIZAÇÃO E CÁLCULO ────────────────────

async function fetchLocalJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${LOCAL_ETL_BASE_URL}${path}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json() as T;
  } catch (error) {
    console.warn('[LocalEtlClient] Dados locais do ETL indisponiveis.', error);
    return null;
  }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--:--:--';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
