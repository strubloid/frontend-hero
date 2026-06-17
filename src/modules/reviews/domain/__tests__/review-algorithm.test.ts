import { describe, it, expect, beforeEach } from "vitest";
import { ReviewAlgorithm, ReviewInput } from "@/modules/reviews/domain/review-algorithm";
import {
  ReviewSchedule,
  masteryScoreToQuality,
  isSuccessfulRecall,
  updateEasinessFactor,
  calculateInterval,
} from "@/modules/reviews/domain/review-schedule";

describe("SM-2 helper functions", () => {
  it("masteryScoreToQuality maps correctly", () => {
    expect(masteryScoreToQuality(0.95, true)).toBe(5);
    expect(masteryScoreToQuality(0.8, true)).toBe(4);
    expect(masteryScoreToQuality(0.5, true)).toBe(3);
    expect(masteryScoreToQuality(0.1, false)).toBe(0);
    expect(masteryScoreToQuality(0.3, false)).toBe(1);
    expect(masteryScoreToQuality(0.5, false)).toBe(2);
  });

  it("isSuccessfulRecall returns true for quality >= 3", () => {
    expect(isSuccessfulRecall(3)).toBe(true);
    expect(isSuccessfulRecall(5)).toBe(true);
    expect(isSuccessfulRecall(2)).toBe(false);
  });

  it("updateEasinessFactor never goes below 1.3", () => {
    const ef = updateEasinessFactor(1.3, 0);
    expect(ef).toBeGreaterThanOrEqual(1.3);
  });

  it("calculateInterval returns expected SM-2 values", () => {
    expect(calculateInterval(0, 0, 2.5)).toBe(1);
    expect(calculateInterval(1, 1, 2.5)).toBe(6);
    expect(calculateInterval(2, 6, 2.5)).toBe(15);
  });
});

describe("ReviewAlgorithm", () => {
  let algorithm: ReviewAlgorithm;
  let baseInput: ReviewInput;

  beforeEach(() => {
    algorithm = new ReviewAlgorithm();
    baseInput = {
      playerId: "player-1",
      conceptId: "event-loop",
      subjectId: "nextjs",
      isCorrect: true,
      masteryScore: 0.9,
      currentSchedule: null,
    };
  });

  it("first successful review creates schedule with 1-day interval", () => {
    const result = algorithm.apply(baseInput);
    expect(result.schedule.intervalDays).toBe(1);
    expect(result.schedule.repetitions).toBe(1);
    expect(result.schedule.totalReviews).toBe(1);
  });

  it("second successful review extends interval to 6 days", () => {
    const first = algorithm.apply(baseInput);
    const second = algorithm.apply({ ...baseInput, currentSchedule: first.schedule });
    expect(second.schedule.intervalDays).toBe(6);
    expect(second.schedule.repetitions).toBe(2);
  });

  it("third successful review multiplies interval by EF", () => {
    const first = algorithm.apply(baseInput);
    const second = algorithm.apply({ ...baseInput, currentSchedule: first.schedule });
    const third = algorithm.apply({ ...baseInput, currentSchedule: second.schedule });
    expect(third.schedule.intervalDays).toBeGreaterThan(6);
    expect(third.schedule.repetitions).toBe(3);
  });

  it("failed review resets repetitions to 0", () => {
    const first = algorithm.apply(baseInput);
    const fail = algorithm.apply({
      ...baseInput,
      isCorrect: false,
      masteryScore: 0.2,
      currentSchedule: first.schedule,
    });
    expect(fail.schedule.repetitions).toBe(0);
    expect(fail.schedule.intervalDays).toBe(1);
  });

  it("multiple failures do not reset EF below 1.3", () => {
    let schedule: ReviewSchedule | null = null;
    for (let i = 0; i < 10; i++) {
      const result = algorithm.apply({
        ...baseInput,
        isCorrect: false,
        masteryScore: 0.1,
        currentSchedule: schedule,
      });
      schedule = result.schedule;
    }
    expect(schedule!.easinessFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("nextReviewAt is in the future for successful recall", () => {
    const result = algorithm.apply(baseInput);
    expect(result.schedule.nextReviewAt!.getTime()).toBeGreaterThan(Date.now());
  });
});
