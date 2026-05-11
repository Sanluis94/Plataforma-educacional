import { readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FIREBASE_SOURCE,
  defaultOutputDir,
  defaultSource,
  loadDotEnv,
  parseArgs,
  resolveRepoPath,
  resolveSource,
} from './config.mjs';

const ROLE_MAP = new Map([
  ['admin', 'admin'],
  ['administrador', 'admin'],
  ['professor', 'professor'],
  ['teacher', 'professor'],
  ['estudante', 'estudante'],
  ['student', 'estudante'],
  ['aluno', 'estudante'],
]);

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({
    status: 'error',
    message: error instanceof Error ? error.message : String(error),
  }, null, 2));
  process.exitCode = 1;
}

async function main() {
  await loadDotEnv();

  const args = parseArgs(process.argv.slice(2));
  const source = resolveSource(args.source ?? process.env.ETL_SOURCE ?? defaultSource);
  const outputDir = resolveRepoPath(args.output ?? process.env.ETL_OUTPUT_DIR ?? defaultOutputDir);

  const rawPayload = await extract(source);
  const snapshot = transform(rawPayload, source);
  await load(snapshot, outputDir);

  console.log(JSON.stringify({
    status: 'ok',
    source,
    outputDir,
    generatedAt: snapshot.generatedAt,
    totals: snapshot.metrics.summary,
  }, null, 2));
}

async function extract(sourceLocation) {
  if (sourceLocation === FIREBASE_SOURCE) {
    return extractFirebase();
  }

  if (/^https?:\/\//i.test(sourceLocation)) {
    const response = await fetch(sourceLocation, {
      headers: {
        accept: 'application/json',
        'user-agent': 'plataforma-educacional-local-etl/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`ETL extraction failed with HTTP ${response.status} from ${sourceLocation}`);
    }

    return response.json();
  }

  const filePath = sourceLocation.startsWith('file://')
    ? fileURLToPath(sourceLocation)
    : sourceLocation;

  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function extractFirebase() {
  const { initializeApp, applicationDefault, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, Timestamp, GeoPoint, DocumentReference } = await import('firebase-admin/firestore');
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const credential = await resolveFirebaseCredential({ applicationDefault, cert });

  if (getApps().length === 0) {
    initializeApp({
      credential,
      ...(projectId ? { projectId } : {}),
    });
  }

  const db = getFirestore();
  const extractedAt = new Date().toISOString();
  const [usersSnap, classesSnap, activitiesSnap, progressSnap, logsSnap] = await Promise.all([
    db.collection('users').get(),
    db.collection('classes').get(),
    db.collection('activities').get(),
    db.collection('progress').get(),
    db.collection('system_logs').get(),
  ]);

  return {
    metadata: {
      source: FIREBASE_SOURCE,
      projectId: projectId ?? null,
      extractedAt,
      collectionCounts: {
        users: usersSnap.size,
        classes: classesSnap.size,
        activities: activitiesSnap.size,
        progress: progressSnap.size,
        systemLogs: logsSnap.size,
      },
    },
    collections: {
      users: docsToRecords(usersSnap, convertFirestoreValue),
      classes: docsToRecords(classesSnap, convertFirestoreValue),
      activities: docsToRecords(activitiesSnap, convertFirestoreValue),
      progress: docsToRecords(progressSnap, convertFirestoreValue).map((entry) => ({
        studentId: entry.studentId ?? entry.userId ?? entry.id,
        ...entry,
      })),
      systemLogs: docsToRecords(logsSnap, convertFirestoreValue),
    },
  };

  function convertFirestoreValue(value) {
    if (value instanceof Timestamp) {
      return value.toDate().toISOString();
    }

    if (value instanceof GeoPoint) {
      return {
        latitude: value.latitude,
        longitude: value.longitude,
      };
    }

    if (value instanceof DocumentReference) {
      return value.path;
    }

    if (Array.isArray(value)) {
      return value.map(convertFirestoreValue);
    }

    if (isRecord(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, convertFirestoreValue(nestedValue)]),
      );
    }

    return value;
  }
}

async function resolveFirebaseCredential({ applicationDefault, cert }) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath) {
    const content = await readFile(resolveRepoPath(serviceAccountPath), 'utf8');
    return cert(JSON.parse(content));
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return applicationDefault();
  }

  throw new Error(
    'Firebase ETL requires FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.',
  );
}

function docsToRecords(snapshot, convertValue) {
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertValue(doc.data()),
  }));
}

function transform(payload, sourceLocation) {
  const generatedAt = new Date().toISOString();
  const rawUsers = collectionFrom(payload, 'users');
  const rawClasses = collectionFrom(payload, 'classes');
  const rawActivities = collectionFrom(payload, 'activities');
  const rawProgress = progressFrom(payload);
  const rawLogs = collectionFrom(payload, 'systemLogs', 'logs');

  if (rawUsers.length === 0) {
    throw new Error('ETL transform failed: source must contain at least one user.');
  }

  const users = rawUsers.map((rawUser, index) => normalizeUser(rawUser, index, generatedAt));
  const usersById = new Map(users.map((user) => [user.id, user]));

  const classes = rawClasses.map((rawClass, index) => normalizeClass(rawClass, index, usersById, generatedAt));
  const classesById = new Map(classes.map((classData) => [classData.id, classData]));

  const activityResult = normalizeActivities(rawActivities, usersById, classesById, generatedAt);
  const progress = normalizeProgress(rawProgress, users, activityResult.learningEvents, generatedAt);
  const systemLogs = normalizeSystemLogs(rawLogs, generatedAt);
  const metrics = buildMetrics(users, classes, activityResult.activities, progress, systemLogs, activityResult.learningEvents);

  return {
    version: 'local-etl-v1',
    source: sourceLocation,
    generatedAt,
    collections: {
      users,
      classes,
      activities: activityResult.activities,
      progress,
      systemLogs,
      learningEvents: activityResult.learningEvents,
    },
    metrics,
  };
}

function collectionFrom(payload, key, alternativeKey) {
  const collections = isRecord(payload.collections) ? payload.collections : {};
  const value = collections[key] ?? payload[key] ?? (alternativeKey ? payload[alternativeKey] : undefined) ?? [];

  if (!Array.isArray(value)) {
    throw new Error(`ETL transform failed: "${key}" must be an array.`);
  }

  return value;
}

function progressFrom(payload) {
  const collections = isRecord(payload.collections) ? payload.collections : {};
  const value = collections.progress ?? payload.progress ?? [];

  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    return Object.entries(value).map(([studentId, progress]) => ({
      studentId,
      ...(isRecord(progress) ? progress : {}),
    }));
  }

  throw new Error('ETL transform failed: "progress" must be an array or object.');
}

function normalizeUser(rawUser, index, generatedAt) {
  assertRecord(rawUser, `users[${index}]`);

  const id = requiredString(rawUser, ['id', 'uid'], `users[${index}].id`);
  const role = normalizeRole(requiredString(rawUser, ['role', 'type'], `users[${index}].role`));

  return {
    id,
    name: requiredString(rawUser, ['name', 'displayName'], `users[${index}].name`),
    email: requiredString(rawUser, ['email'], `users[${index}].email`),
    role,
    gradeLevel: optionalString(rawUser, ['gradeLevel', 'grade']),
    createdAt: toIsoDate(rawUser.createdAt, generatedAt),
    updatedAt: toIsoDate(rawUser.updatedAt, rawUser.createdAt ?? generatedAt),
    lastLoginAt: rawUser.lastLoginAt ? toIsoDate(rawUser.lastLoginAt, generatedAt) : undefined,
  };
}

function normalizeRole(value) {
  const normalized = ROLE_MAP.get(value.trim().toLowerCase());

  if (!normalized) {
    throw new Error(`ETL transform failed: invalid user role "${value}".`);
  }

  return normalized;
}

function normalizeClass(rawClass, index, usersById, generatedAt) {
  assertRecord(rawClass, `classes[${index}]`);

  const id = requiredString(rawClass, ['id'], `classes[${index}].id`);
  const professorId = requiredString(rawClass, ['professorId', 'teacherId'], `classes[${index}].professorId`);
  const professor = usersById.get(professorId);
  const studentIds = uniqueStrings(rawClass.studentIds ?? rawClass.students ?? []);
  const studentsCount = studentIds.length || Math.max(0, Math.floor(numberValue(rawClass.studentsCount, 0)));

  if (professor && professor.role !== 'professor') {
    throw new Error(`ETL transform failed: class ${id} references a non-professor user.`);
  }

  for (const studentId of studentIds) {
    const student = usersById.get(studentId);

    if (student && student.role !== 'estudante') {
      throw new Error(`ETL transform failed: class ${id} references non-student user ${studentId}.`);
    }
  }

  return {
    id,
    name: requiredString(rawClass, ['name', 'title'], `classes[${index}].name`),
    professorId,
    professorName: professor?.name ?? optionalString(rawClass, ['professorName', 'teacherName']) ?? 'Professor',
    studentsCount,
    studentIds,
    createdAt: toIsoDate(rawClass.createdAt, generatedAt),
    updatedAt: toIsoDate(rawClass.updatedAt, rawClass.createdAt ?? generatedAt),
  };
}

function normalizeActivities(rawActivities, usersById, classesById, generatedAt) {
  const activities = [];
  const learningEvents = [];

  rawActivities.forEach((rawActivity, index) => {
    assertRecord(rawActivity, `activities[${index}]`);

    const id = requiredString(rawActivity, ['id'], `activities[${index}].id`);
    const professorId = requiredString(rawActivity, ['professorId', 'teacherId'], `activities[${index}].professorId`);
    const classId = optionalString(rawActivity, ['classId']);
    const professor = usersById.get(professorId);

    if (professor && professor.role !== 'professor') {
      throw new Error(`ETL transform failed: activity ${id} references a non-professor user.`);
    }

    if (classId && !classesById.has(classId)) {
      throw new Error(`ETL transform failed: activity ${id} references unknown class ${classId}.`);
    }

    const config = isRecord(rawActivity.config) ? { ...rawActivity.config } : {};
    const module = optionalString(rawActivity, ['module', 'subject']);
    const difficulty = optionalString(rawActivity, ['difficulty']);

    if (module && !config.module) {
      config.module = module;
    }

    if (difficulty && !config.difficulty) {
      config.difficulty = difficulty;
    }

    const activity = {
      id,
      title: requiredString(rawActivity, ['title', 'name'], `activities[${index}].title`),
      type: requiredString(rawActivity, ['type'], `activities[${index}].type`).toLowerCase(),
      config,
      ...(classId ? { classId } : {}),
      professorId,
      createdAt: toIsoDate(rawActivity.createdAt, generatedAt),
      status: rawActivity.status === 'draft' ? 'draft' : 'published',
    };

    activities.push(activity);

    const submissions = Array.isArray(rawActivity.submissions) ? rawActivity.submissions : [];

    submissions.forEach((submission, submissionIndex) => {
      assertRecord(submission, `activities[${index}].submissions[${submissionIndex}]`);

      const studentId = requiredString(
        submission,
        ['studentId', 'userId'],
        `activities[${index}].submissions[${submissionIndex}].studentId`,
      );
      const student = usersById.get(studentId);

      if (student && student.role !== 'estudante') {
        throw new Error(`ETL transform failed: activity ${id} has submission from non-student user ${studentId}.`);
      }

      learningEvents.push({
        id: `${id}-${studentId}-${submissionIndex + 1}`,
        activityId: id,
        studentId,
        professorId,
        classId: classId ?? null,
        module: String(config.module ?? activity.type),
        score: numberValue(submission.score, 0),
        status: submission.status === 'started' ? 'started' : 'completed',
        timeSpentMinutes: numberValue(submission.timeSpentMinutes, 0),
        completedAt: toIsoDate(submission.completedAt ?? submission.updatedAt, activity.createdAt),
      });
    });
  });

  return { activities, learningEvents };
}

function normalizeProgress(rawProgress, users, learningEvents, generatedAt) {
  const students = users.filter((user) => user.role === 'estudante');
  const eventsByStudent = groupBy(learningEvents, (event) => event.studentId);
  const progressByStudent = new Map();

  rawProgress.forEach((rawProgressEntry, index) => {
    assertRecord(rawProgressEntry, `progress[${index}]`);

    const studentId = requiredString(rawProgressEntry, ['studentId', 'userId', 'id'], `progress[${index}].studentId`);
    const xp = Math.max(0, Math.floor(numberValue(rawProgressEntry.xp, 0)));
    const level = Math.max(1, Math.floor(numberValue(rawProgressEntry.level, calculateLevel(xp))));

    progressByStudent.set(studentId, {
      level,
      xp,
      coins: Math.max(0, Math.floor(numberValue(rawProgressEntry.coins, 0))),
      completedModules: uniqueStrings(rawProgressEntry.completedModules ?? []),
      purchasedItems: uniqueStrings(rawProgressEntry.purchasedItems ?? []),
      updatedAt: toIsoDate(rawProgressEntry.updatedAt, generatedAt),
    });
  });

  for (const student of students) {
    const studentEvents = eventsByStudent.get(student.id) ?? [];
    const inferredXp = studentEvents.reduce((total, event) => total + Math.floor(event.score * 8), 0);
    const inferredCoins = studentEvents.reduce((total, event) => total + Math.floor(event.score * 0.3), 0);
    const progress = progressByStudent.get(student.id) ?? {
      level: calculateLevel(inferredXp),
      xp: inferredXp,
      coins: inferredCoins,
      completedModules: [],
      purchasedItems: [],
      updatedAt: latestDate(studentEvents.map((event) => event.completedAt), generatedAt),
    };

    for (const event of studentEvents) {
      if (event.status === 'completed') {
        addUnique(progress.completedModules, event.module);
      }
    }

    progress.level = Math.max(progress.level, calculateLevel(progress.xp));
    progressByStudent.set(student.id, progress);
  }

  return Object.fromEntries([...progressByStudent.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function normalizeSystemLogs(rawLogs, generatedAt) {
  const logs = rawLogs.map((rawLog, index) => {
    assertRecord(rawLog, `systemLogs[${index}]`);

    return {
      id: optionalString(rawLog, ['id']) ?? `local-log-${index + 1}`,
      timestamp: toIsoDate(rawLog.timestamp ?? rawLog.createdAt, generatedAt),
      type: normalizeLogType(optionalString(rawLog, ['type']) ?? 'system'),
      message: requiredString(rawLog, ['message'], `systemLogs[${index}].message`),
      userId: optionalString(rawLog, ['userId']),
      metadata: isRecord(rawLog.metadata) ? rawLog.metadata : undefined,
    };
  });

  logs.push({
    id: `local-etl-${Date.now()}`,
    timestamp: generatedAt,
    type: 'system',
    message: 'ETL local executado e dados educacionais normalizados.',
    metadata: {
      source: 'local-etl',
    },
  });

  return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function normalizeLogType(type) {
  return ['auth', 'ai', 'error', 'activity', 'system'].includes(type) ? type : 'system';
}

function buildMetrics(users, classes, activities, progress, systemLogs, learningEvents) {
  const students = users.filter((user) => user.role === 'estudante');
  const teachers = users.filter((user) => user.role === 'professor');
  const admins = users.filter((user) => user.role === 'admin');
  const completedEvents = learningEvents.filter((event) => event.status === 'completed');
  const progressValues = Object.values(progress);
  const averageXp = average(progressValues.map((entry) => entry.xp));
  const possibleCompletions = Math.max(students.length * activities.length, 1);
  const completionRate = round((completedEvents.length / possibleCompletions) * 100);

  return {
    summary: {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalAdmins: admins.length,
      totalClasses: classes.length,
      totalActivities: activities.length,
      totalPublishedActivities: activities.filter((activity) => activity.status === 'published').length,
      totalLogs: systemLogs.length,
      totalCompletedModules: progressValues.reduce((total, entry) => total + entry.completedModules.length, 0),
      averageXp,
      completionRate,
    },
    teacherPerformance: teachers.map((teacher) => buildTeacherMetric(teacher, classes, activities, learningEvents)),
    studentPerformance: students.map((student) => buildStudentMetric(student, progress[student.id], learningEvents)),
    subjectEngagement: buildSubjectEngagement(learningEvents),
  };
}

function buildTeacherMetric(teacher, classes, activities, learningEvents) {
  const teacherClasses = classes.filter((classData) => classData.professorId === teacher.id);
  const teacherActivities = activities.filter((activity) => activity.professorId === teacher.id);
  const teacherActivityIds = new Set(teacherActivities.map((activity) => activity.id));
  const teacherEvents = learningEvents.filter((event) => teacherActivityIds.has(event.activityId));
  const studentIds = new Set(teacherClasses.flatMap((classData) => classData.studentIds));
  const inferredStudentsCount = teacherClasses.reduce((total, classData) => total + classData.studentsCount, 0);

  return {
    teacherId: teacher.id,
    teacherName: teacher.name,
    email: teacher.email,
    classesCount: teacherClasses.length,
    studentsCount: studentIds.size || inferredStudentsCount,
    activitiesCount: teacherActivities.length,
    averageScore: average(teacherEvents.map((event) => event.score)),
  };
}

function buildStudentMetric(student, progress, learningEvents) {
  const studentEvents = learningEvents.filter((event) => event.studentId === student.id);

  return {
    studentId: student.id,
    studentName: student.name,
    email: student.email,
    gradeLevel: student.gradeLevel ?? null,
    level: progress?.level ?? 1,
    xp: progress?.xp ?? 0,
    coins: progress?.coins ?? 0,
    completedModulesCount: progress?.completedModules.length ?? 0,
    averageScore: average(studentEvents.map((event) => event.score)),
    lastActive: latestDate(studentEvents.map((event) => event.completedAt), progress?.updatedAt),
  };
}

function buildSubjectEngagement(learningEvents) {
  return [...groupBy(learningEvents, (event) => event.module).entries()]
    .map(([module, events]) => ({
      module,
      eventsCount: events.length,
      completedCount: events.filter((event) => event.status === 'completed').length,
      averageScore: average(events.map((event) => event.score)),
      totalTimeSpentMinutes: events.reduce((total, event) => total + event.timeSpentMinutes, 0),
    }))
    .sort((a, b) => b.eventsCount - a.eventsCount);
}

async function load(snapshot, outputPath) {
  await rm(outputPath, { recursive: true, force: true });
  await mkdir(join(outputPath, 'collections'), { recursive: true });
  await mkdir(join(outputPath, 'metrics'), { recursive: true });

  await writeJson(join(outputPath, 'index.json'), snapshot);

  for (const [name, value] of Object.entries(snapshot.collections)) {
    await writeJson(join(outputPath, 'collections', `${name}.json`), value);
  }

  for (const [name, value] of Object.entries(snapshot.metrics)) {
    await writeJson(join(outputPath, 'metrics', `${toKebabCase(name)}.json`), value);
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function assertRecord(value, label) {
  if (!isRecord(value)) {
    throw new Error(`ETL transform failed: ${label} must be an object.`);
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(record, keys, label) {
  const value = optionalString(record, keys);

  if (!value) {
    throw new Error(`ETL transform failed: ${label} is required.`);
  }

  return value;
}

function optionalString(record, keys) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
}

function addUnique(list, value) {
  if (value && !list.includes(value)) {
    list.push(value);
  }
}

function numberValue(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function toIsoDate(value, fallback) {
  const date = new Date(value ?? fallback);

  if (Number.isNaN(date.getTime())) {
    return new Date(fallback).toISOString();
  }

  return date.toISOString();
}

function latestDate(values, fallback) {
  const validDates = values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return validDates[0]?.toISOString() ?? fallback;
}

function calculateLevel(xp) {
  return Math.max(1, Math.floor(xp / 500) + 1);
}

function average(values) {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (validValues.length === 0) {
    return 0;
  }

  return round(validValues.reduce((total, value) => total + value, 0) / validValues.length);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function groupBy(values, getKey) {
  return values.reduce((groups, value) => {
    const key = getKey(value);
    const current = groups.get(key) ?? [];
    current.push(value);
    groups.set(key, current);
    return groups;
  }, new Map());
}

function toKebabCase(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
