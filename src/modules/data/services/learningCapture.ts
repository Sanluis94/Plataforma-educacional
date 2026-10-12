import type { LearningEvidence } from '../learningAnalyticsTypes';

export interface LabCompletionReport {
  /** Percent correct, 0–100. Exploration is never interpreted as a grade. */
  score: number;
  telemetryRows: number;
  evidence: LearningEvidence;
  /** The activity owns its error/retry feedback, avoiding duplicate alerts. */
  handlesDeliveryFeedback?: boolean;
}
export type LabCompletionHandler = (report: LabCompletionReport) => unknown | Promise<unknown>;

export interface LabAssignment {
  classId: string;
  lessonPlanId: string;
}

export function newLearningSessionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Measures foreground use, stopping after one minute without interaction. */
export class ActiveLearningCapture {
  sessionId = newLearningSessionId();
  startedAt = new Date().toISOString();
  private activeMilliseconds = 0;
  private checkpoint = Date.now();
  private lastInteraction = this.checkpoint;
  private running = false;
  private visible = true;

  constructor(initial?: { activeSeconds?: number }) {
    if (initial?.activeSeconds !== undefined && Number.isFinite(initial.activeSeconds) && initial.activeSeconds >= 0) this.activeMilliseconds = initial.activeSeconds * 1000;
  }

  start(visible: boolean) {
    this.checkpoint = Date.now();
    this.visible = visible;
    this.running = true;
  }

  tick(now = Date.now()) {
    if (this.running && this.visible) {
      const until = Math.min(now, this.lastInteraction + 60_000);
      this.activeMilliseconds += Math.max(0, until - this.checkpoint);
    }
    this.checkpoint = now;
  }

  interact() { this.tick(); this.lastInteraction = Date.now(); }
  setVisible(visible: boolean) { this.tick(); this.visible = visible; }
  stop() { this.tick(); this.running = false; }
  reset() { this.sessionId = newLearningSessionId(); this.startedAt = new Date().toISOString(); this.activeMilliseconds = 0; this.checkpoint = this.lastInteraction = Date.now(); }
  get activeSeconds() { this.tick(); return Math.round(this.activeMilliseconds / 1000); }

  evidence(source: LearningEvidence['source'], details: Partial<LearningEvidence> = {}): LearningEvidence {
    return { schemaVersion: 1, source, sessionId: this.sessionId, startedAt: this.startedAt, activeSeconds: this.activeSeconds, ...details };
  }
}

export function learningDocumentId(studentId: string, sessionId: string, scope = ''): string {
  return `attempt-${encodeURIComponent(studentId)}-${encodeURIComponent(sessionId)}-${encodeURIComponent(scope)}`;
}
