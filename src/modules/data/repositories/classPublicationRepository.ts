import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { sanitizeForFirestore } from '../../core/services/firestoreUtils';
import { getLocalEtlActivitiesByProfessor, saveLocalActivity } from '../services/localEtlClient';
import type { ActivityData } from '../types';

/** A stable publication token makes acknowledgement retries idempotent. */
export async function publishClassActivity(professorId: string, payload: Partial<ActivityData>): Promise<ActivityData> {
  const publicationId = String(payload.config?.publicationId ?? '');
  if (!professorId || !payload.classId || !payload.title?.trim() || !payload.description?.trim() || !publicationId || publicationId.length > 100) throw new Error('Preencha turma, título e instrução antes de publicar.');
  const activity: Omit<ActivityData, 'id'> = sanitizeForFirestore({ title: payload.title.trim(), description: payload.description.trim(), professorId, classId: payload.classId, className: payload.className, subject: payload.subject?.trim(), questions: payload.questions ?? [], type: payload.type ?? 'quiz', config: { ...payload.config, publicationId }, dueDate: payload.dueDate, createdAt: new Date().toISOString(), status: 'published' });
  function acknowledged(existing: ActivityData): ActivityData {
    const keys = ['title', 'description', 'classId', 'professorId', 'questions', 'type', 'dueDate'] as const;
    if (keys.some(key => JSON.stringify(existing[key] ?? null) !== JSON.stringify(activity[key] ?? null))) throw new Error('Esta publicação já foi confirmada com outro conteúdo. Confira a atividade publicada antes de criar uma nova versão.');
    return existing;
  }
  if (!db) { const existing = (await getLocalEtlActivitiesByProfessor(professorId)).find(item => item.config.publicationId === publicationId); return existing ? acknowledged(existing) : saveLocalActivity(activity); }
  const database=db;
  const reference = doc(database, 'activities', `activity-${encodeURIComponent(professorId)}-${encodeURIComponent(publicationId)}`);
  return runTransaction(database, async transaction => {
    const classSnapshot = await transaction.get(doc(database, 'classes', payload.classId!));
    const snapshot = await transaction.get(reference);
    if (!classSnapshot.exists() || classSnapshot.data().professorId !== professorId) throw new Error('Você só pode publicar atividades para as turmas pelas quais é responsável.');
    if (snapshot.exists()) return acknowledged({ ...snapshot.data(), id: snapshot.id } as ActivityData);
    transaction.set(reference, activity);
    return { ...activity, id: reference.id };
  });
}
