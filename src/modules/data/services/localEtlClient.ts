import type { ActivityData, ClassData, LogType, ProgressData, SystemLog, UserData, UserRole, SubmissionData } from '../types';

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

export type LocalClassReport = {
  classId: string;
  className: string;
  professorName: string;
  studentsCount: number;
  activitiesCount: number;
  completedActivitiesCount: number;
  averageScore: number;
  averageTimeSpentMinutes: number;
  completionRate: number;
  topModule: string;
  atRiskStudents: string[];
  modules: {
    module: string;
    eventsCount: number;
    averageScore: number;
    totalTimeSpentMinutes: number;
  }[];
  students: {
    studentId: string;
    studentName: string;
    level: number;
    xp: number;
    coins: number;
    completedModulesCount: number;
    averageScore: number;
    lastActive: string;
    status: 'em_destaque' | 'regular' | 'precisa_apoio';
  }[];
};

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
      studentsCount: classData.studentIds?.length || 0,
      studentIds: classData.studentIds || []
    }));
};

export const getLocalStudentClasses = async (studentId: string): Promise<any[]> => {
  const db = await getLocalDb();
  return db.classes
    .filter((classData: ClassData) => classData.studentIds?.includes(studentId))
    .map((classData: ClassData) => ({
      id: classData.id!,
      name: classData.name,
      studentsCount: classData.studentIds?.length || 0,
      professorName: classData.professorName || 'Professor'
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

export const getLocalEtlClassReport = async (classId: string): Promise<LocalClassReport | null> => {
  const db = await getLocalDb();
  const classData = db.classes.find((entry: ClassData) => entry.id === classId);
  if (!classData) return null;

  const users = db.users;
  const progress = db.progress;
  const activities = db.activities.filter((activity: ActivityData) => activity.classId === classId);
  const activityIds = new Set(activities.map((activity: ActivityData) => activity.id).filter(Boolean));
  
  const events = db.learningEvents.filter((event: LocalLearningEvent) => (
    event.classId === classId || activityIds.has(event.activityId)
  ));
  
  const studentIds: string[] = classData.studentIds || [];
  const students = studentIds
    .map((studentId) => users.find((user: UserData) => user.id === studentId))
    .filter((user: any): user is Required<UserData> => Boolean(user));
    
  const professor = users.find((user: UserData) => user.id === classData.professorId);
  const modules = buildModuleMetrics(events);
  const studentReports = students.map((student) => buildStudentClassReport(student, progress[student.id], events));
  const averageScore = average(events.map((event: any) => event.score));
  const completedActivitiesCount = events.filter((event: any) => event.status === 'completed').length;
  const expectedCompletions = Math.max(students.length * activities.filter((activity: any) => activity.status === 'published').length, 1);

  return {
    classId: classData.id!,
    className: classData.name,
    professorName: professor?.name ?? classData.professorName,
    studentsCount: students.length,
    activitiesCount: activities.length,
    completedActivitiesCount,
    averageScore,
    averageTimeSpentMinutes: average(events.map((event: any) => event.timeSpentMinutes)),
    completionRate: round((completedActivitiesCount / expectedCompletions) * 100),
    topModule: modules[0]?.module ?? 'Sem dados',
    atRiskStudents: studentReports
      .filter((student) => student.status === 'precisa_apoio')
      .map((student) => student.studentName),
    modules,
    students: studentReports,
  };
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
  professorName?: string
): Promise<ClassData> => {
  const db = await getLocalDb();
  const newClass: ClassData = {
    id: `local-class-${Date.now()}`,
    name,
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

export const enrollLocalStudent = async (classId: string, studentId: string): Promise<void> => {
  const db = await getLocalDb();
  const classData = db.classes.find((c: ClassData) => c.id === classId);
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
  const newSub: SubmissionData = {
    ...submission,
    id: `local-sub-${Date.now()}`
  };
  
  // Registrar em learningEvents para atualizar relatórios
  const newEvent: LocalLearningEvent = {
    id: newSub.id!,
    activityId: newSub.activityId,
    studentId: newSub.studentId,
    professorId: 'local-prof',
    classId: newSub.classId || null,
    module: newSub.activityTitle,
    score: newSub.score,
    status: 'completed',
    timeSpentMinutes: Math.floor(Math.random() * 8) + 4,
    completedAt: newSub.submittedAt
  };
  db.learningEvents.push(newEvent);
  
  // Atualizar moedas e XP no progresso local do estudante
  const studProgress = db.progress[newSub.studentId] || {
    level: 1,
    xp: 0,
    coins: 0,
    completedModules: [],
    purchasedItems: [],
    enrolledClasses: [],
    updatedAt: new Date().toISOString()
  };
  
  studProgress.xp += 100;
  studProgress.coins += 25;
  if (!studProgress.completedModules.includes(newSub.activityId)) {
    studProgress.completedModules.push(newSub.activityId);
  }
  studProgress.level = Math.floor(studProgress.xp / 500) + 1;
  studProgress.updatedAt = new Date().toISOString();
  db.progress[newSub.studentId] = studProgress;

  saveLocalDb(db);
  return newSub;
};

export const getLocalSubmissionsByStudent = async (studentId: string): Promise<SubmissionData[]> => {
  const db = await getLocalDb();
  return db.learningEvents
    .filter((event: LocalLearningEvent) => event.studentId === studentId)
    .map((event: LocalLearningEvent) => ({
      id: event.id,
      activityId: event.activityId,
      activityTitle: event.module,
      classId: event.classId || 'local-class',
      studentId: event.studentId,
      studentName: 'Estudante',
      score: event.score,
      submittedAt: event.completedAt,
      status: 'completed'
    }));
};

export const getLocalSubmissionsByClass = async (classId: string): Promise<SubmissionData[]> => {
  const db = await getLocalDb();
  const users = db.users;
  return db.learningEvents
    .filter((event: LocalLearningEvent) => event.classId === classId)
    .map((event: LocalLearningEvent) => {
      const student = users.find((u: UserData) => u.id === event.studentId);
      return {
        id: event.id,
        activityId: event.activityId,
        activityTitle: event.module,
        classId: event.classId || classId,
        studentId: event.studentId,
        studentName: student?.name || 'Estudante',
        score: event.score,
        submittedAt: event.completedAt,
        status: 'completed'
      };
    });
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

function buildStudentClassReport(
  student: Required<UserData>,
  progress: ProgressData | undefined,
  events: LocalLearningEvent[],
): LocalClassReport['students'][number] {
  const studentEvents = events.filter((event) => event.studentId === student.id);
  const averageScore = average(studentEvents.map((event) => event.score));
  const status = averageScore >= 85
    ? 'em_destaque'
    : averageScore > 0 && averageScore < 70
      ? 'precisa_apoio'
      : 'regular';

  return {
    studentId: student.id,
    studentName: student.name,
    level: progress?.level ?? 1,
    xp: progress?.xp ?? 0,
    coins: progress?.coins ?? 0,
    completedModulesCount: progress?.completedModules?.length ?? 0,
    averageScore,
    lastActive: latestDate(studentEvents.map((event) => event.completedAt), progress?.updatedAt),
    status,
  };
}

function buildModuleMetrics(events: LocalLearningEvent[]): LocalClassReport['modules'] {
  const groups = events.reduce((accumulator, event) => {
    const current = accumulator.get(event.module) ?? [];
    current.push(event);
    accumulator.set(event.module, current);
    return accumulator;
  }, new Map<string, LocalLearningEvent[]>());

  return [...groups.entries()]
    .map(([module, moduleEvents]) => ({
      module,
      eventsCount: moduleEvents.length,
      averageScore: average(moduleEvents.map((event) => event.score)),
      totalTimeSpentMinutes: moduleEvents.reduce((total, event) => total + event.timeSpentMinutes, 0),
    }))
    .sort((a, b) => b.eventsCount - a.eventsCount);
}

function average(values: number[]): number {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (validValues.length === 0) {
    return 0;
  }

  return round(validValues.reduce((total, value) => total + value, 0) / validValues.length);
}

function latestDate(values: (string | undefined)[], fallback?: string): string {
  const latest = values
    .map((value) => new Date(value ?? ''))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return latest?.toISOString() ?? fallback ?? '';
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
