/**
 * The context in which a player demonstrated their knowledge.
 * Tracks variety of assessment to confirm genuine understanding.
 */
export interface DemonstratedContext {
  missionType: string;
  demonstratedAt: Date;
  wasCorrect: boolean;
}

/**
 * Enhanced mastery state for a single concept.
 *
 * Key design decisions:
 * - `masteryScore` (0–1) is the primary indicator synthesising correctness history.
 * - `confidenceScore` (0–1) measures how certain the system is that the score
 *   reflects genuine knowledge (vs. lucky guesses or pattern-matching).
 * - `retentionScore` (0–1) decays over time using an exponential forgetting curve.
 * - `demonstratedContexts` track which mission types the player has shown
 *   understanding through (single-concept ≠ architecture decision ≠ debugging).
 */
export interface ConceptMastery {
  id: string;
  playerId: string;
  conceptId: string;
  subjectId: string;

  /** Normalised [0, 1] — overall how well this concept is known. */
  masteryScore: number;

  /** [0, 1] — how certain the system is of the mastery estimate. */
  confidenceScore: number;

  /** [0, 1] — estimated retention after accounting for time decay. */
  retentionScore: number;

  /** Count of correct attempts across all sessions. */
  correctAttempts: number;

  /** Count of incorrect attempts across all sessions. */
  incorrectAttempts: number;

  /** Running streak of consecutive correct answers (resets on error). */
  consecutiveCorrectAnswers: number;

  /** Timestamp of the most recent attempt (any outcome). */
  lastAttemptedAt: Date | null;

  /** When the system recommends this concept be reviewed next. */
  nextReviewAt: Date | null;

  /** Contexts in which understanding was demonstrated. */
  demonstratedContexts: DemonstratedContext[];

  /** Common mistake types recorded for this concept (categorised). */
  commonMistakes: string[];
}
