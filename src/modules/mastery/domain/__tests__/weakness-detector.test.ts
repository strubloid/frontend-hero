import { describe, it, expect, beforeEach } from "vitest";
import { WeaknessDetector } from "@/modules/mastery/domain/weakness-detector";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";
import { Concept } from "@/modules/subjects/domain/subject";

function makeMastery(overrides: Partial<ConceptMastery>): ConceptMastery {
  return {
    id: "test",
    playerId: "player-1",
    conceptId: overrides.conceptId ?? "test-concept",
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

function makeConcept(overrides: Partial<Concept>): Concept {
  return {
    id: "test-concept",
    name: "Test Concept",
    domainName: "Test Domain",
    level: "foundation" as const,
    difficulty: 2,
    subjectId: "nextjs",
    prerequisites: [],
    tags: [],
    outcomes: [],
    knowledge: "",
    commonMisconceptions: [],
    examples: [],
    questionSeeds: [],
    practicalChallenges: [],
    interviewPrompts: [],
    ...overrides,
  };
}

describe("WeaknessDetector", () => {
  let detector: WeaknessDetector;

  beforeEach(() => {
    detector = new WeaknessDetector();
  });

  it("detects LOW_MASTERY when score is below threshold", () => {
    const reports = detector.detect(
      [makeMastery({ conceptId: "c1", masteryScore: 0.3 })],
      [makeConcept({ id: "c1" })],
    );
    expect(reports.some((r) => r.reason === "LOW_MASTERY")).toBe(true);
  });

  it("ignores concepts with sufficient mastery", () => {
    const reports = detector.detect(
      [makeMastery({ conceptId: "c1", masteryScore: 0.8 })],
      [makeConcept({ id: "c1" })],
    );
    expect(reports.every((r) => r.reason !== "LOW_MASTERY")).toBe(true);
  });

  it("detects never-attempted concepts", () => {
    const reports = detector.detect(
      [],
      [makeConcept({ id: "c1" })],
    );
    expect(reports.some((r) => r.reason === "NEVER_ATTEMPTED" && r.conceptId === "c1")).toBe(true);
  });

  it("detects consecutive error pattern", () => {
    const reports = detector.detect(
      [makeMastery({
        conceptId: "c1",
        masteryScore: 0.3,
        incorrectAttempts: 3,
        consecutiveCorrectAnswers: 0,
      })],
      [makeConcept({ id: "c1" })],
    );
    expect(reports.some((r) => r.reason === "CONSECUTIVE_ERRORS")).toBe(true);
  });

  it("getTopWeakness returns null for empty reports", () => {
    expect(detector.getTopWeakness([])).toBeNull();
  });

  it("getTopWeakness prefers CONSECUTIVE_ERRORS over LOW_MASTERY", () => {
    const reports = [
      { conceptId: "c1", conceptName: "C1", domainName: "D", masteryScore: 0.3, confidenceScore: 0.3, retentionScore: 0.3, reason: "LOW_MASTERY" },
      { conceptId: "c2", conceptName: "C2", domainName: "D", masteryScore: 0.4, confidenceScore: 0.4, retentionScore: 0.4, reason: "CONSECUTIVE_ERRORS" },
    ];
    const top = detector.getTopWeakness(reports);
    expect(top?.reason).toBe("CONSECUTIVE_ERRORS");
  });

  it("getTopWeakness prefers LOW_MASTERY over DECAYING_RETENTION", () => {
    const reports = [
      { conceptId: "c1", conceptName: "C1", domainName: "D", masteryScore: 0.7, confidenceScore: 0.7, retentionScore: 0.2, reason: "DECAYING_RETENTION" },
      { conceptId: "c2", conceptName: "C2", domainName: "D", masteryScore: 0.3, confidenceScore: 0.3, retentionScore: 0.3, reason: "LOW_MASTERY" },
    ];
    const top = detector.getTopWeakness(reports);
    expect(top?.reason).toBe("LOW_MASTERY");
  });

  it("detects DECAYING_RETENTION when retention is low but mastery is adequate", () => {
    const reports = detector.detect(
      [makeMastery({ conceptId: "c1", masteryScore: 0.7, retentionScore: 0.2 })],
      [makeConcept({ id: "c1" })],
    );
    expect(reports.some((r) => r.reason === "DECAYING_RETENTION")).toBe(true);
  });
});
