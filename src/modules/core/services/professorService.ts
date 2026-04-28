/**
 * Professor Service — Lógica de negócio para operações do professor.
 * Criação de turmas, publicação de atividades, validações.
 */
import type { Turma } from '../../data/repositories/classRepository';
import { saveClass } from '../../data/repositories/classRepository';
import { saveActivity } from '../../data/repositories/activityRepository';
import { writeLog } from '../../data/repositories/logRepository';
import type { ActivityData } from '../../data/types';

/**
 * Cria uma nova turma vinculada ao professor autenticado.
 */
export const createNewClass = async (
  name: string,
  professorId?: string,
  professorName?: string
): Promise<Turma> => {
  const novaTurma = await saveClass(name, professorId, professorName);

  // Registra log de sistema
  await writeLog(
    'activity',
    `Nova turma criada: "${name}" por ${professorName || 'Professor'}`,
    professorId
  );

  return novaTurma;
};

/**
 * Publica uma atividade educacional criada pelo Construtor de Experiências.
 */
export const publishActivity = async (
  title: string,
  type: string,
  config: Record<string, unknown>,
  professorId: string
): Promise<ActivityData> => {
  const activityData: Omit<ActivityData, 'id'> = {
    title,
    type,
    config,
    professorId,
    createdAt: new Date().toISOString(),
    status: 'published',
  };

  const saved = await saveActivity(activityData);

  // Registra log
  await writeLog(
    'activity',
    `Atividade publicada: "${title}" (${type})`,
    professorId
  );

  return saved;
};

/**
 * Valida o nome da turma.
 */
export const validateClassName = (name: string) => {
  return name.trim() !== '';
};
