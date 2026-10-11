import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { completeStudentLab, type CompletedLearningLab } from '../services/studentLabService';

export function useStudentLabCompletion() {
  const { currentUser, userData } = useAuth();
  const completeLab = useCallback((lab: CompletedLearningLab, score: number) =>
    completeStudentLab(currentUser?.uid, userData?.role, lab, score), [currentUser?.uid, userData?.role]);
  return { completeLab };
}
