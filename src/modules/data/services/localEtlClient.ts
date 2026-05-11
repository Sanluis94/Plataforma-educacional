import type { ActivityData, ClassData, LogType, ProgressData, SystemLog, UserData, UserRole } from '../types';

const LOCAL_ETL_BASE_URL = '/local-data/etl';

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

export const getLocalEtlTeachers = async (): Promise<LocalTeacher[]> => {
  const teacherMetrics = await fetchLocalJson<LocalTeacherMetric[]>('/metrics/teacher-performance.json');

  return (teacherMetrics ?? []).map((teacher) => ({
    name: teacher.teacherName,
    email: teacher.email,
    classes: teacher.classesCount,
    students: teacher.studentsCount,
  }));
};

export const getLocalEtlUsers = async (): Promise<Required<UserData>[]> => {
  const users = await fetchLocalJson<Required<UserData>[]>('/collections/users.json');
  return users ?? [];
};

export const getLocalEtlUserByRole = async (role: UserRole): Promise<Required<UserData> | null> => {
  const users = await getLocalEtlUsers();
  return users.find((user) => user.role === role) ?? null;
};

export const getLocalEtlClassesByProfessor = async (professorId?: string) => {
  if (!professorId) return [];

  const classes = await fetchLocalJson<Required<ClassData>[]>('/collections/classes.json');

  return (classes ?? [])
    .filter((classData) => classData.professorId === professorId)
    .map((classData) => ({
      id: classData.id,
      name: classData.name,
      studentsCount: classData.studentsCount,
    }));
};

export const getLocalEtlActivitiesByProfessor = async (professorId: string): Promise<ActivityData[]> => {
  const activities = await fetchLocalJson<ActivityData[]>('/collections/activities.json');
  return (activities ?? []).filter((activity) => activity.professorId === professorId);
};

export const getLocalEtlActivitiesByClass = async (classId: string): Promise<ActivityData[]> => {
  const activities = await fetchLocalJson<ActivityData[]>('/collections/activities.json');
  return (activities ?? []).filter((activity) => activity.classId === classId);
};

export const getLocalEtlProgress = async (studentId?: string): Promise<ProgressData | null> => {
  if (!studentId) return null;

  const progress = await fetchLocalJson<Record<string, ProgressData>>('/collections/progress.json');
  return progress?.[studentId] ?? null;
};

export const getLocalEtlClassReport = async (classId: string): Promise<LocalClassReport | null> => {
  const snapshot = await getLocalEtlSnapshot();
  if (!snapshot) return null;

  const classData = snapshot.collections.classes.find((entry) => entry.id === classId);
  if (!classData) return null;

  const users = snapshot.collections.users;
  const progress = snapshot.collections.progress;
  const activities = snapshot.collections.activities.filter((activity) => activity.classId === classId);
  const activityIds = new Set(activities.map((activity) => activity.id).filter(Boolean));
  const events = snapshot.collections.learningEvents.filter((event) => (
    event.classId === classId || activityIds.has(event.activityId)
  ));
  const students = classData.studentIds
    .map((studentId) => users.find((user) => user.id === studentId))
    .filter((user): user is Required<UserData> => Boolean(user));
  const professor = users.find((user) => user.id === classData.professorId);
  const modules = buildModuleMetrics(events);
  const studentReports = students.map((student) => buildStudentClassReport(student, progress[student.id], events));
  const averageScore = average(events.map((event) => event.score));
  const completedActivitiesCount = events.filter((event) => event.status === 'completed').length;
  const expectedCompletions = Math.max(students.length * activities.filter((activity) => activity.status === 'published').length, 1);

  return {
    classId: classData.id,
    className: classData.name,
    professorName: professor?.name ?? classData.professorName,
    studentsCount: students.length,
    activitiesCount: activities.length,
    completedActivitiesCount,
    averageScore,
    averageTimeSpentMinutes: average(events.map((event) => event.timeSpentMinutes)),
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
  const logs = await fetchLocalJson<SystemLog[]>('/collections/systemLogs.json');

  return (logs ?? [])
    .slice(0, maxResults)
    .map((log) => ({
      time: formatTime(log.timestamp),
      type: log.type,
      message: log.message,
    }));
};

export const getLocalEtlGlobalStats = async (): Promise<LocalGlobalStats> => {
  const summary = await fetchLocalJson<LocalEtlSummary>('/metrics/summary.json');

  return {
    totalStudents: summary?.totalStudents ?? 0,
    totalTeachers: summary?.totalTeachers ?? 0,
    totalClasses: summary?.totalClasses ?? 0,
    totalActivities: summary?.totalActivities ?? 0,
  };
};

export const getLocalEtlSnapshot = async (): Promise<LocalEtlSnapshot | null> => {
  return fetchLocalJson<LocalEtlSnapshot>('/index.json');
};

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
    completedModulesCount: progress?.completedModules.length ?? 0,
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
