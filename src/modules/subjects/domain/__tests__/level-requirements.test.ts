import { describe, it, expect } from "vitest";
import {
  SubjectLevelRequirementEvaluator,
  EncounterCountRequirementEvaluator,
  ConceptCoverageRequirementEvaluator,
  MasteryRequirementEvaluator,
  ReviewRequirementEvaluator,
  SessionRequirementEvaluator,
} from "@/modules/subjects/domain/level-requirements";
import type { LevelRequirementEvaluator } from "@/modules/subjects/domain/level-requirements";
import type { PlayerSubjectProgress } from "@/modules/subjects/domain/subject-level";
import type { SubjectLevelDefinition } from "@/modules/subjects/domain/subject-level";
import type { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseLevelDef: SubjectLevelDefinition = {
  level: 1,
  title: "Foundations",
  description: "Core concepts",
  difficultyRange: { minimum: 1, maximum: 2 },
  requiredMastery: 65,
  requiredSuccessfulEncounters: 20,
  requiredReviewEncounters: 5,
  concepts: ["concept.a", "concept.b"],
  allowedChallengeTypes: ["multiple-choice"],
};

const basePlayerProgress: PlayerSubjectProgress = {
  playerId: "player-1",
  subjectId: "test",
  currentLevel: 1,
  maximumLevel: 10,
  masteryScore: 0.7,
  retentionScore: 0.6,
  successfulEncounterCount: 20,
  reviewEncounterCount: 5,
  practicalEncounterCount: 0,
  distinctStudySessionCount: 3,
  bossStatus: "locked",
  startedAt: new Date(),
  completedAt: null,
};

const emptyMasteries: ConceptMastery[] = [];

function makeConceptMastery(conceptId: string, score: number): ConceptMastery {
  return {
    id: `${conceptId}-mastery`,
    playerId: "player-1",
    subjectId: "test",
    conceptId,
    masteryScore: score,
    confidenceScore: 0.5,
    retentionScore: 0.5,
    correctAttempts: 0,
    incorrectAttempts: 0,
    consecutiveCorrectAnswers: 0,
    lastAttemptedAt: null,
    nextReviewAt: null,
    demonstratedContexts: [],
    commonMistakes: [],
  };
}

// ---------------------------------------------------------------------------
// Specialist Evaluators (declared as interface type to match 3-arg contract)
// ---------------------------------------------------------------------------

describe("EncounterCountRequirementEvaluator", () => {
  const evaluator: LevelRequirementEvaluator = new EncounterCountRequirementEvaluator();

  it("passes when encounter count meets requirement", () => {
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(true);
    expect(result.current).toBe(20);
    expect(result.required).toBe(20);
  });

  it("fails when encounter count is below requirement", () => {
    const lowProgress: PlayerSubjectProgress = {
      ...basePlayerProgress,
      successfulEncounterCount: 10,
    };
    const result = evaluator.evaluate(lowProgress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(false);
    expect(result.current).toBe(10);
  });
});

describe("ReviewRequirementEvaluator", () => {
  const evaluator: LevelRequirementEvaluator = new ReviewRequirementEvaluator();

  it("passes when review count meets requirement", () => {
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(true);
  });

  it("fails when review count is below requirement", () => {
    const lowProgress: PlayerSubjectProgress = { ...basePlayerProgress, reviewEncounterCount: 2 };
    const result = evaluator.evaluate(lowProgress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(false);
  });
});

describe("SessionRequirementEvaluator", () => {
  const evaluator: LevelRequirementEvaluator = new SessionRequirementEvaluator();

  it("passes with at least 3 distinct study sessions", () => {
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(true);
  });

  it("fails with fewer than 3 sessions", () => {
    const lowProgress: PlayerSubjectProgress = {
      ...basePlayerProgress,
      distinctStudySessionCount: 1,
    };
    const result = evaluator.evaluate(lowProgress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(false);
  });
});

describe("ConceptCoverageRequirementEvaluator", () => {
  const evaluator: LevelRequirementEvaluator = new ConceptCoverageRequirementEvaluator();

  it("passes when most required concepts have mastery", () => {
    const masteries = [makeConceptMastery("concept.a", 0.7), makeConceptMastery("concept.b", 0.6)];
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, masteries);
    expect(result.met).toBe(true);
    expect(result.current).toBeGreaterThanOrEqual(80);
  });

  it("fails when few concepts have been attempted", () => {
    const masteries = [makeConceptMastery("concept.a", 0.7)];
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, masteries);
    expect(result.met).toBe(false);
    expect(result.current).toBe(50); // 1/2 = 50%
  });
});

describe("MasteryRequirementEvaluator", () => {
  const evaluator: LevelRequirementEvaluator = new MasteryRequirementEvaluator();

  it("passes when mastery score is at least 70%", () => {
    const progress: PlayerSubjectProgress = { ...basePlayerProgress, masteryScore: 0.75 };
    const result = evaluator.evaluate(progress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(true);
    expect(result.current).toBe(75);
  });

  it("fails when mastery score is below 70%", () => {
    const progress: PlayerSubjectProgress = { ...basePlayerProgress, masteryScore: 0.5 };
    const result = evaluator.evaluate(progress, baseLevelDef, emptyMasteries);
    expect(result.met).toBe(false);
    expect(result.current).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// Main Orchestrator
// ---------------------------------------------------------------------------

describe("SubjectLevelRequirementEvaluator", () => {
  it("reports ready when all requirements are met", () => {
    const evaluator = new SubjectLevelRequirementEvaluator();
    const masteries = [makeConceptMastery("concept.a", 0.7), makeConceptMastery("concept.b", 0.7)];
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, masteries);
    expect(result.isReady).toBe(true);
    expect(result.level).toBe(1);
    expect(result.requirements).toHaveLength(5);
  });

  it("reports not ready when any requirement fails", () => {
    const evaluator = new SubjectLevelRequirementEvaluator();
    const lowProgress: PlayerSubjectProgress = {
      ...basePlayerProgress,
      successfulEncounterCount: 5,
    };
    const result = evaluator.evaluate(lowProgress, baseLevelDef, []);
    expect(result.isReady).toBe(false);
    expect(result.requirements.filter((r) => !r.met).length).toBeGreaterThan(0);
  });

  it("reports detailed requirement results", () => {
    const evaluator = new SubjectLevelRequirementEvaluator();
    const masteries = [makeConceptMastery("concept.a", 0.7), makeConceptMastery("concept.b", 0.7)];
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, masteries);

    for (const req of result.requirements) {
      expect(req.name).toBeTruthy();
      expect(typeof req.met).toBe("boolean");
      expect(typeof req.current).toBe("number");
      expect(typeof req.required).toBe("number");
    }
  });

  it("calculates overall mastery scores from concept masteries", () => {
    const evaluator = new SubjectLevelRequirementEvaluator();
    const masteries = [makeConceptMastery("concept.a", 0.8), makeConceptMastery("concept.b", 0.6)];
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, masteries);
    expect(result.overallMasteryScore).toBeCloseTo(0.7);
    expect(result.conceptCoveragePercentage).toBe(100);
  });

  it("handles empty concept mastery list", () => {
    const evaluator = new SubjectLevelRequirementEvaluator();
    const result = evaluator.evaluate(basePlayerProgress, baseLevelDef, []);
    expect(result.overallMasteryScore).toBe(0);
    expect(result.conceptCoveragePercentage).toBe(0);
  });
});
