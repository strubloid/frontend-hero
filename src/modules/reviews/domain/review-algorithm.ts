import {
  ReviewSchedule,
  ReviewQuality,
  isSuccessfulRecall,
  updateEasinessFactor,
  calculateInterval,
  masteryScoreToQuality,
} from "./review-schedule";

export interface ReviewInput {
  playerId: string;
  conceptId: string;
  subjectId: string;
  isCorrect: boolean;
  masteryScore: number;
  currentSchedule: ReviewSchedule | null;
}

export interface ReviewOutput {
  schedule: ReviewSchedule;
  nextIntervalDays: number;
  quality: ReviewQuality;
}

/**
 * Domain service implementing SM-2 spaced repetition logic adapted for
 * the mastery model.
 *
 * This converts our mastery-score/correctness into an SM-2 quality rating,
 * then applies the standard SM-2 algorithm to produce the next review interval.
 */
export class ReviewAlgorithm {
  apply(input: ReviewInput): ReviewOutput {
    const prev = input.currentSchedule;
    const ef = prev?.easinessFactor ?? 2.5;
    const interval = prev?.intervalDays ?? 0;
    const reps = prev?.repetitions ?? 0;

    const quality = masteryScoreToQuality(input.masteryScore, input.isCorrect);
    const successful = isSuccessfulRecall(quality);

    let newReps: number;
    let newInterval: number;
    let newEF: number;

    if (successful) {
      newReps = reps + 1;
      newInterval = calculateInterval(reps, interval, ef);
      newEF = updateEasinessFactor(ef, quality);
    } else {
      // Failed recall — reset repetitions but keep EF (SM-2 standard)
      newReps = 0;
      newInterval = 1;
      newEF = updateEasinessFactor(ef, quality);
    }

    const now = new Date();
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    const schedule: ReviewSchedule = {
      id: prev?.id ?? `${input.playerId}:${input.conceptId}`,
      playerId: input.playerId,
      conceptId: input.conceptId,
      subjectId: input.subjectId,
      easinessFactor: Math.round(newEF * 100) / 100,
      intervalDays: newInterval,
      repetitions: newReps,
      lastReviewedAt: now,
      nextReviewAt: nextReview,
      qualityScore: quality,
      totalReviews: (prev?.totalReviews ?? 0) + 1,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };

    return { schedule, nextIntervalDays: newInterval, quality };
  }
}
