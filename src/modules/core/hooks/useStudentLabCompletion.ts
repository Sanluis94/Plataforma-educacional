import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { completeStudentLab, type CompletedLearningLab } from '../services/studentLabService';
import type { LearningEvidence } from '../../data/learningAnalyticsTypes';

export function useStudentLabCompletion() {
  const { currentUser, userData } = useAuth();
  const completeLab = useCallback((lab: CompletedLearningLab, score: number, evidence: LearningEvidence) =>
    completeStudentLab(currentUser?.uid, userData?.role, lab, score, evidence, userData?.name ?? currentUser?.displayName ?? 'Estudante'), [currentUser?.uid, userData?.role, userData?.name, currentUser?.displayName]);
  return { completeLab };
}
