import { describe, it, expect, beforeEach } from "vitest";
import { InMemorySubjectRepository } from "@/modules/subjects/infrastructure/in-memory-subject-repository";
import { InMemoryPlayerSubjectProgressRepository } from "@/modules/subjects/infrastructure/in-memory-player-subject-progress-repository";
import { InMemoryMasteryRepository } from "@/modules/mastery/infrastructure/in-memory-mastery-repository";
import { SubjectLevelRequirementEvaluator } from "@/modules/subjects/domain/level-requirements";
import { AdvanceSubjectLevelUseCase } from "@/modules/subjects/application/advance-subject-level/advance-subject-level.use-case";
import type { AdvanceSubjectLevelRequest } from "@/modules/subjects/application/advance-subject-level/advance-subject-level.request";
import type { PlayerSubjectProgressEntity } from "@/modules/subjects/domain/player-subject-progress";
import type { Subject } from "@/modules/subjects/domain/subject";
import type { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSubjectWithLevels(levelCount: number = 3, overrides: Partial<Subject> = {}): Subject {
  const now = new Date();
  const levels = Array.from({ length: levelCount }, (_, i) => ({
    level: i + 1,
    title: `Level ${i + 1}`,
    description: `Description for level ${i + 1}`,
    difficultyRange: { minimum: 1, maximum: 2 },
    requiredMastery: 65,
    requiredSuccessfulEncounters: 20,
    requiredReviewEncounters: 5,
    concepts: ["concept.a", "concept.b"],
    allowedChallengeTypes: ["multiple-choice"] as const,
  }));

  return {
    id: "nextjs",
    title: "Next.js Deep Dive",
    description: "Master Next.js internals",
    version: 1,
    schemaVersion: 1,
    minimumGameVersion: "1.0.0",
    progression: {
      minimumLevel: 1,
      maximumLevel: levelCount,
      estimatedDaysPerLevel: 7,
      bossRequired: true,
      levels,
    },
    domains: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Subject;
}

function makeProgressForLevel(
  currentLevel: number,
  maxLevel: number,
  overrides: Partial<PlayerSubjectProgressEntity> = {},
): PlayerSubjectProgressEntity {
  const now = new Date();
  return {
    id: `player-1-nextjs-${now.getTime()}`,
    playerId: "player-1",
    subjectId: "nextjs",
    currentLevel,
    maximumLevel: maxLevel,
    masteryScore: 0.85,
    retentionScore: 0.75,
    successfulEncounterCount: 25,
    reviewEncounterCount: 10,
    practicalEncounterCount: 5,
    distinctStudySessionCount: 5,
    bossStatus: "locked" as const,
    startedAt: now,
    completedAt: null,
    ...overrides,
  };
}

function makeConceptMastery(conceptId: string, masteryScore: number = 0.8): ConceptMastery {
  return {
    id: `${conceptId}-mastery`,
    playerId: "player-1",
    subjectId: "nextjs",
    conceptId,
    masteryScore,
    confidenceScore: 0.5,
    retentionScore: 0.5,
    correctAttempts: 10,
    incorrectAttempts: 2,
    consecutiveCorrectAnswers: 3,
    lastAttemptedAt: new Date(),
    nextReviewAt: null,
    demonstratedContexts: [],
    commonMistakes: [],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AdvanceSubjectLevelUseCase", () => {
  let useCase: AdvanceSubjectLevelUseCase;
  let subjectRepo: InMemorySubjectRepository;
  let progressRepo: InMemoryPlayerSubjectProgressRepository;
  let masteryRepo: InMemoryMasteryRepository;
  let request: AdvanceSubjectLevelRequest;

  beforeEach(() => {
    subjectRepo = new InMemorySubjectRepository();
    progressRepo = new InMemoryPlayerSubjectProgressRepository();
    masteryRepo = new InMemoryMasteryRepository();
    const evaluator = new SubjectLevelRequirementEvaluator();
    useCase = new AdvanceSubjectLevelUseCase(subjectRepo, progressRepo, masteryRepo, evaluator);

    subjectRepo.set(makeSubjectWithLevels(3));
    request = { playerId: "player-1", subjectId: "nextjs" };
  });

  it("advances level when all requirements are met", async () => {
    progressRepo.set(makeProgressForLevel(1, 3));
    masteryRepo.save(makeConceptMastery("concept.a", 0.8));
    masteryRepo.save(makeConceptMastery("concept.b", 0.8));

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(result.advanced).toBe(true);
    expect(result.newLevel).toBe(2);

    // Verify persistence
    const saved = await progressRepo.findByPlayerAndSubject("player-1", "nextjs");
    expect(saved?.currentLevel).toBe(2);
  });

  it("fails to advance when requirements not met", async () => {
    // Progress with zero encounters
    progressRepo.set(
      makeProgressForLevel(1, 3, {
        successfulEncounterCount: 0,
        reviewEncounterCount: 0,
        distinctStudySessionCount: 0,
      }),
    );

    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Requirements not met");
    expect(result.advanced).toBe(false);
    expect(result.newLevel).toBeNull();
    expect(result.requirements.length).toBeGreaterThan(0);
    // At least one requirement should fail
    expect(result.requirements.some((r) => !r.met)).toBe(true);
  });

  it("returns error when no progress found", async () => {
    const result = await useCase.execute(request);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Subject progress not found");
    expect(result.advanced).toBe(false);
  });

  it("returns error when subject not found", async () => {
    progressRepo.set(makeProgressForLevel(1, 3));

    const result = await useCase.execute({ playerId: "player-1", subjectId: "unknown" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Subject progress not found");
  });

  it("unlocks boss when advancing to second-to-last level", async () => {
    // Player at level 2 of 3 — advancing to 3 should unlock boss
    progressRepo.set(makeProgressForLevel(2, 3));
    masteryRepo.save(makeConceptMastery("concept.a", 0.8));
    masteryRepo.save(makeConceptMastery("concept.b", 0.8));

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    expect(result.advanced).toBe(true);
    expect(result.newLevel).toBe(3);

    const saved = await progressRepo.findByPlayerAndSubject("player-1", "nextjs");
    expect(saved?.bossStatus).toBe("available");
    expect(saved?.completedAt).toBeNull(); // still at max level, not past it
  });

  it("marks subject as completed when advancing past maximum level", async () => {
    // Player at level 3 of 3 — advancing should mark complete
    // We need a subject with 3 levels, player at level 3
    // Max level = 3, current = 3, so advanceSubjectLevel sets completedAt
    progressRepo.set(makeProgressForLevel(3, 3));
    masteryRepo.save(makeConceptMastery("concept.a", 0.8));
    masteryRepo.save(makeConceptMastery("concept.b", 0.8));

    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    expect(result.advanced).toBe(true);
    // currentLevel stays at max (3) but completedAt is set
    expect(result.newLevel).toBe(3);
    expect(result.progress?.completedAt).not.toBeNull();
    expect(result.progress?.bossStatus).toBe("defeated");
  });

  it("reports detailed requirement results even on failure", async () => {
    progressRepo.set(
      makeProgressForLevel(1, 3, {
        successfulEncounterCount: 0,
        reviewEncounterCount: 0,
        distinctStudySessionCount: 0,
      }),
    );

    const result = await useCase.execute(request);

    expect(result.requirements.length).toBeGreaterThan(0);
    for (const req of result.requirements) {
      expect(typeof req.name).toBe("string");
      expect(typeof req.met).toBe("boolean");
      expect(typeof req.current).toBe("number");
      expect(typeof req.required).toBe("number");
    }
  });
});
