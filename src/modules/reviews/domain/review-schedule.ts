/**
 * SM-2 spaced repetition algorithm (simplified for the mastery model).
 *
 * Tracks:
 * - `easinessFactor` — how easy the concept is to remember (1.3 – 2.5+)
 * - `intervalDays` — current inter-repetition interval in days
 * - `repetitions` — number of consecutive successful recalls
 * - `nextReviewAt` — when this concept should be reviewed next
 * - `lastReviewedAt` — when it was last reviewed
 * - `qualityScore` — the most recent quality rating (0–5)
 */
export interface ReviewSchedule {
  id: string;
  playerId: string;
  conceptId: string;
  subjectId: string;

  easinessFactor: number;
  intervalDays: number;
  repetitions: number;

  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;

  /** 0–5 quality of the most recent review. */
  qualityScore: number;

  /** Total number of reviews performed (all qualities). */
  totalReviews: number;

  /** Timestamp when this schedule entry was created. */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quality classification of a review response.
 */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Standard SM-2 quality-to-description mapping:
 * - 5: perfect response
 * - 4: correct after hesitation
 * - 3: correct with serious difficulty
 * - 2: incorrect; correct answer seemed easy to recall
 * - 1: incorrect; correct answer remembered upon seeing it
 * - 0: complete blackout
 */
export function isSuccessfulRecall(q: ReviewQuality): boolean {
  return q >= 3;
}

/**
 * SM-2 easiness factor update.
 */
export function updateEasinessFactor(currentEF: number, q: ReviewQuality): number {
  const newEF = currentEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return Math.max(1.3, newEF);
}

/**
 * SM-2 interval calculation.
 */
export function calculateInterval(repetitions: number, intervalDays: number, easinessFactor: number): number {
  if (repetitions === 0) return 1; // first successful recall — 1 day
  if (repetitions === 1) return 6; // second successful recall — 6 days
  return Math.round(intervalDays * easinessFactor); // subsequent
}

/**
 * Maps a mastery score [0, 1] to an SM-2 quality rating [0, 5].
 * Used when converting from our mastery model to SM-2.
 */
export function masteryScoreToQuality(masteryScore: number, isCorrect: boolean): ReviewQuality {
  if (!isCorrect) {
    if (masteryScore < 0.2) return 0;
    if (masteryScore < 0.4) return 1;
    return 2;
  }
  if (masteryScore >= 0.9) return 5;
  if (masteryScore >= 0.7) return 4;
  return 3;
}
