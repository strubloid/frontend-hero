import { describe, it, expect, beforeEach } from "vitest";
import { ReviewPrioritizer } from "@/modules/reviews/domain/review-prioritizer";
import { ReviewSchedule } from "@/modules/reviews/domain/review-schedule";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";

function makeSchedule(overrides: Partial<ReviewSchedule>): ReviewSchedule {
  return {
    id: "s1",
    playerId: "p1",
    conceptId: "c1",
    subjectId: "nextjs",
    easinessFactor: 2.5,
    intervalDays: 1,
    repetitions: 1,
    lastReviewedAt: new Date(),
    nextReviewAt: new Date(),
    qualityScore: 4,
    totalReviews: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMastery(overrides: Partial<ConceptMastery>): ConceptMastery {
  return {
    id: "m1",
    playerId: "p1",
    conceptId: overrides.conceptId ?? "c1",
    subjectId: "nextjs",
    masteryScore: 0.5,
    confidenceScore: 0.5,
    retentionScore: 0.5,
    correctAttempts: 0,
    incorrectAttempts: 0,
    consecutiveCorrectAnswers: 0,
    lastAttemptedAt: null,
    nextReviewAt: null,
    demonstratedContexts: [],
    commonMistakes: [],
    ...overrides,
  };
}

describe("ReviewPrioritizer", () => {
  let prioritizer: ReviewPrioritizer;

  beforeEach(() => {
    prioritizer = new ReviewPrioritizer();
  });

  it("returns empty for empty schedules", () => {
    const result = prioritizer.prioritise([], new Map(), 5);
    expect(result).toHaveLength(0);
  });

  it("ranks overdue reviews highest", () => {
    const past = new Date(Date.now() - 48 * 60 * 60 * 1000); // 2 days ago
    const future = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days from now
    const overdue = makeSchedule({ conceptId: "c1", nextReviewAt: past });
    const upcoming = makeSchedule({ conceptId: "c2", nextReviewAt: future });

    const result = prioritizer.prioritise([upcoming, overdue], new Map(), 5);
    expect(result[0].schedule.conceptId).toBe("c1");
  });

  it("ranks due today above due soon", () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueToday = new Date(startOfToday.getTime() + 12 * 60 * 60 * 1000);
    const dueTomorrow = new Date(startOfToday.getTime() + 36 * 60 * 60 * 1000);

    const todayItem = makeSchedule({ conceptId: "c1", nextReviewAt: dueToday });
    const tomorrowItem = makeSchedule({ conceptId: "c2", nextReviewAt: dueTomorrow });

    const result = prioritizer.prioritise([tomorrowItem, todayItem], new Map(), 5);
    expect(result[0].schedule.conceptId).toBe("c1");
  });

  it("boosts urgency for low retention concepts", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // a week out
    const normalMastery = makeMastery({ conceptId: "c1", retentionScore: 0.8 });
    const lowRetentionMastery = makeMastery({ conceptId: "c2", retentionScore: 0.2 });

    const item1 = makeSchedule({ conceptId: "c1", nextReviewAt: future });
    const item2 = makeSchedule({ conceptId: "c2", nextReviewAt: future });

    const masteries = new Map([
      ["c1", normalMastery],
      ["c2", lowRetentionMastery],
    ]);

    const result = prioritizer.prioritise([item1, item2], masteries, 5);
    // c2 (low retention) should rank higher despite same due date
    expect(result[0].schedule.conceptId).toBe("c2");
  });

  it("respects limit parameter", () => {
    const schedules = Array.from({ length: 10 }, (_, i) =>
      makeSchedule({
        id: `s${i}`,
        conceptId: `c${i}`,
        nextReviewAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      }),
    );

    const result = prioritizer.prioritise(schedules, new Map(), 3);
    expect(result).toHaveLength(3);
  });

  it("returns empty when no schedules provided", () => {
    const result = prioritizer.prioritise([], new Map(), 5);
    expect(result).toHaveLength(0);
  });
});
