import { describe, it, expect, beforeEach } from "vitest";
import {
  MissionSelector,
  MissionSelectorInput,
} from "@/modules/missions/application/mission-selector";
import { Subject, Domain, Concept } from "@/modules/subjects/domain/subject";
import type { SubjectProgression } from "@/modules/subjects/domain/subject-level";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";
import { ReviewSchedule } from "@/modules/reviews/domain/review-schedule";

function makeConcept(id: string, name: string, difficulty: number = 2): Concept {
  return {
    id,
    name,
    domainName: "Test Domain",
    subjectId: "nextjs",
    level: "foundation" as const,
    difficulty,
    prerequisites: [],
    tags: [],
    outcomes: [],
    knowledge: "",
    commonMisconceptions: [],
    examples: [],
    questionSeeds: [],
    practicalChallenges: [],
    interviewPrompts: [],
  };
}

function makeSubject(concepts: Concept[]): Subject {
  return {
    id: "nextjs",
    title: "Next.js",
    description: "Test",
    version: 1,
    schemaVersion: 1,
    minimumGameVersion: "1.0.0",
    progression: {
      minimumLevel: 1,
      maximumLevel: 10,
      estimatedDaysPerLevel: 7,
      bossRequired: true,
      levels: [
        {
          level: 1,
          title: "Foundations",
          description: "Core concepts",
          difficultyRange: { minimum: 1, maximum: 2 },
          requiredMastery: 65,
          requiredSuccessfulEncounters: 20,
          requiredReviewEncounters: 5,
          concepts: [],
          allowedChallengeTypes: ["multiple-choice", "code-prediction"],
        },
      ],
    },
    domains: [{ name: "Test Domain", concepts }],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeMastery(overrides: Partial<ConceptMastery>): ConceptMastery {
  return {
    id: "m1",
    playerId: "p1",
    conceptId: "c1",
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

describe("MissionSelector", () => {
  let selector: MissionSelector;

  beforeEach(() => {
    selector = new MissionSelector();
  });

  it("selects an overdue review when available", () => {
    const subject = makeSubject([makeConcept("c1", "Concept 1"), makeConcept("c2", "Concept 2")]);
    const overdue = makeSchedule({
      conceptId: "c2",
      nextReviewAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    });
    const input: MissionSelectorInput = {
      subject,
      masteries: [],
      schedules: [overdue],
      recentConceptIds: [],
      availableConceptIds: ["c1", "c2"],
    };
    const plan = selector.select(input);
    expect(plan.conceptId).toBe("c2");
    expect(plan.reason).toContain("overdue review");
  });

  it("selects a weak concept when no reviews are overdue", () => {
    const subject = makeSubject([makeConcept("c1", "Concept 1"), makeConcept("c2", "Concept 2")]);
    const weakMastery = makeMastery({
      conceptId: "c1",
      masteryScore: 0.3,
      correctAttempts: 1,
      incorrectAttempts: 3,
      consecutiveCorrectAnswers: 0,
    });
    const input: MissionSelectorInput = {
      subject,
      masteries: [weakMastery],
      schedules: [],
      recentConceptIds: [],
      availableConceptIds: ["c1", "c2"],
    };
    const plan = selector.select(input);
    // c1 is weak, should be selected
    expect(plan.conceptId).toBe("c1");
  });

  it("selects a fresh concept when nothing is overdue or weak", () => {
    const subject = makeSubject([
      makeConcept("c1", "Concept 1", 3),
      makeConcept("c2", "Concept 2", 1),
    ]);
    const mastered = makeMastery({
      conceptId: "c1",
      masteryScore: 0.9,
    });
    const input: MissionSelectorInput = {
      subject,
      masteries: [mastered],
      schedules: [],
      recentConceptIds: [],
      availableConceptIds: ["c1", "c2"],
    };
    const plan = selector.select(input);
    // c2 is fresh (no mastery record), should be selected
    expect(plan.conceptId).toBe("c2");
  });

  it("skips recently seen concepts when alternative available", () => {
    const subject = makeSubject([makeConcept("c1", "Concept 1"), makeConcept("c2", "Concept 2")]);
    const overdue = makeSchedule({
      conceptId: "c1",
      nextReviewAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    const input: MissionSelectorInput = {
      subject,
      masteries: [],
      schedules: [overdue],
      recentConceptIds: ["c1"], // c1 was just seen
      availableConceptIds: ["c1", "c2"],
    };
    const plan = selector.select(input);
    // Should pick c2 (the non-recent concept) via fresh concept path
    expect(plan.conceptId).toBe("c2");
  });

  it("falls back to any available concept when all are mastered and no reviews", () => {
    const subject = makeSubject([makeConcept("c1", "Only Concept")]);
    const mastered = makeMastery({
      conceptId: "c1",
      masteryScore: 0.9,
      retentionScore: 0.9,
      correctAttempts: 5,
    });
    const input: MissionSelectorInput = {
      subject,
      masteries: [mastered],
      schedules: [],
      recentConceptIds: [],
      availableConceptIds: ["c1"],
    };
    const plan = selector.select(input);
    expect(plan.conceptId).toBe("c1");
    expect(plan.reason).toContain("fallback");
  });

  it("throws when no concepts are available", () => {
    const subject = makeSubject([makeConcept("c1", "Only Concept")]);
    const input: MissionSelectorInput = {
      subject,
      masteries: [],
      schedules: [],
      recentConceptIds: [],
      availableConceptIds: [],
    };
    expect(() => selector.select(input)).toThrow("No concepts available");
  });
});
