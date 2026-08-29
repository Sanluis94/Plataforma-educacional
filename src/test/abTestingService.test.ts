import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashUserToVariant,
  getExperimentVariant,
  trackExperimentImpression,
  trackExperimentConversion,
  getExperimentMetrics,
  resetExperimentStore,
  ACTIVE_EXPERIMENTS,
} from '../modules/core/services/abTestingService';

describe('A/B Testing Service', () => {
  beforeEach(() => {
    resetExperimentStore();
  });

  it('should have all 3 active experiments configured', () => {
    expect(Object.keys(ACTIVE_EXPERIMENTS)).toHaveLength(3);
    expect(ACTIVE_EXPERIMENTS['exp_interactive_feedback']).toBeDefined();
    expect(ACTIVE_EXPERIMENTS['exp_gamified_rewards']).toBeDefined();
    expect(ACTIVE_EXPERIMENTS['exp_lab_onboarding']).toBeDefined();
  });

  it('should deterministically assign the same variant to the same user', () => {
    const user1 = 'student-alpha-123';
    const user2 = 'student-beta-456';

    const v1First = getExperimentVariant('exp_interactive_feedback', user1);
    const v1Second = getExperimentVariant('exp_interactive_feedback', user1);
    expect(v1First).toBe(v1Second);

    const v2First = getExperimentVariant('exp_interactive_feedback', user2);
    const v2Second = getExperimentVariant('exp_interactive_feedback', user2);
    expect(v2First).toBe(v2Second);
  });

  it('should balance variant assignment across a sample of users (~50/50)', () => {
    let countA = 0;
    let countB = 0;
    const totalUsers = 1000;

    for (let i = 0; i < totalUsers; i++) {
      const variant = hashUserToVariant('exp_interactive_feedback', `user-${i}`);
      if (variant === 'A') countA++;
      else countB++;
    }

    // Expect distribution to be roughly 50/50 within a 10% margin of error
    expect(countA).toBeGreaterThan(400);
    expect(countB).toBeGreaterThan(400);
    expect(countA + countB).toBe(totalUsers);
  });

  it('should accurately track impressions and conversions for variants A and B', () => {
    const expId = 'exp_interactive_feedback';

    // Track impressions for 4 users
    const users = ['user_1', 'user_2', 'user_3', 'user_4'];
    const assignedVariants = users.map(u => trackExperimentImpression(expId, u));

    // Convert users with scores
    assignedVariants.forEach((_, idx) => {
      trackExperimentConversion(expId, users[idx], 85 + idx * 5);
    });

    const metrics = getExperimentMetrics(expId);
    expect(metrics.experimentId).toBe(expId);

    const totalImp = metrics.variantA.impressions + metrics.variantB.impressions;
    const totalConv = metrics.variantA.conversions + metrics.variantB.conversions;

    expect(totalImp).toBe(4);
    expect(totalConv).toBe(4);
    expect(metrics.variantA.averageScore).toBeGreaterThanOrEqual(0);
    expect(metrics.variantB.averageScore).toBeGreaterThanOrEqual(0);
  });

  it('should calculate conversion rates correctly', () => {
    const expId = 'exp_gamified_rewards';

    // Simulate 10 impressions
    const u1 = 'student_fixed_A';
    const u2 = 'student_fixed_B';

    trackExperimentImpression(expId, u1);
    trackExperimentImpression(expId, u2);

    // Only convert 1
    const v1 = getExperimentVariant(expId, u1);
    trackExperimentConversion(expId, u1, 100);

    const metrics = getExperimentMetrics(expId);
    if (v1 === 'A') {
      expect(metrics.variantA.conversionRate).toBe(100);
    } else {
      expect(metrics.variantB.conversionRate).toBe(100);
    }
  });
});
