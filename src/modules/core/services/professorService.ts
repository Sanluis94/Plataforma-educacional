import type { Turma } from '../../data/repositories/classRepository';
import { saveClass } from '../../data/repositories/classRepository';

export const createNewClass = async (name: string): Promise<Turma> => {
  return await saveClass(name);
};

export const validateClassName = (name: string) => {
  return name.trim() !== '';
};
