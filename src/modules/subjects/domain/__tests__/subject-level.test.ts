import { describe, it, expect } from "vitest";
import {
  assignConceptsToLevel,
  mapSubjectLevelStringToNumber,
  getLevelDefinition,
  findLevelForDifficulty,
} from "@/modules/subjects/domain/subject-level";
import type {
  SubjectProgression,
  SubjectLevelDefinition,
} from "@/modules/subjects/domain/subject-level";
import { Subject } from "@/modules/subjects/domain/subject";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildTestProgression(): SubjectProgression {
  return {
    minimumLevel: 1,
    maximumLevel: 10,
    estimatedDaysPerLevel: 7,
    bossRequired: true,
    levels: [
      {
        level: 1,
        title: "Foundations",
        description: "",
        difficultyRange: { minimum: 1, maximum: 2 },
        requiredMastery: 65,
        requiredSuccessfulEncounters: 20,
        requiredReviewEncounters: 5,
        concepts: ["concept.a", "concept.b"],
        allowedChallengeTypes: ["multiple-choice"],
      },
      {
        level: 2,
        title: "Routing Initiate",
        description: "",
        difficultyRange: { minimum: 2, maximum: 3 },
        requiredMastery: 68,
        requiredSuccessfulEncounters: 24,
        requiredReviewEncounters: 6,
        concepts: ["concept.c"],
        allowedChallengeTypes: ["multiple-choice", "code-prediction"],
      },
      {
        level: 5,
        title: "Rendering Explorer",
        description: "",
        difficultyRange: { minimum: 3, maximum: 5 },
        requiredMastery: 72,
        requiredSuccessfulEncounters: 30,
        requiredReviewEncounters: 8,
        concepts: ["concept.d"],
        allowedChallengeTypes: ["code-prediction"],
      },
      {
        level: 10,
        title: "Production Commander",
        description: "",
        difficultyRange: { minimum: 7, maximum: 9 },
        requiredMastery: 82,
        requiredSuccessfulEncounters: 40,
        requiredReviewEncounters: 10,
        concepts: ["concept.e"],
        allowedChallengeTypes: ["architecture-decision"],
      },
    ],
  };
}

function buildTestSubject(progression: SubjectProgression): Subject {
  return {
    id: "test",
    title: "Test",
    description: "Test subject",
    version: 1,
    schemaVersion: 1,
    minimumGameVersion: "1.0.0",
    progression,
    domains: [
      {
        name: "Domain A",
        concepts: [
          {
            id: "concept.a",
            name: "Concept A",
            domainName: "Domain A",
            subjectId: "test",
            level: "foundation",
            difficulty: 1,
            prerequisites: [],
            tags: [],
            outcomes: [],
            knowledge: "",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: [],
            practicalChallenges: [],
            interviewPrompts: [],
          },
          {
            id: "concept.b",
            name: "Concept B",
            domainName: "Domain A",
            subjectId: "test",
            level: "foundation",
            difficulty: 2,
            prerequisites: [],
            tags: [],
            outcomes: [],
            knowledge: "",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: [],
            practicalChallenges: [],
            interviewPrompts: [],
          },
          {
            id: "concept.c",
            name: "Concept C",
            domainName: "Domain A",
            subjectId: "test",
            level: "intermediate",
            difficulty: 3,
            prerequisites: [],
            tags: [],
            outcomes: [],
            knowledge: "",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: [],
            practicalChallenges: [],
            interviewPrompts: [],
          },
          {
            id: "concept.d",
            name: "Concept D",
            domainName: "Domain A",
            subjectId: "test",
            level: "advanced",
            difficulty: 4,
            prerequisites: [],
            tags: [],
            outcomes: [],
            knowledge: "",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: [],
            practicalChallenges: [],
            interviewPrompts: [],
          },
          {
            id: "concept.e",
            name: "Concept E",
            domainName: "Domain A",
            subjectId: "test",
            level: "senior",
            difficulty: 5,
            prerequisites: [],
            tags: [],
            outcomes: [],
            knowledge: "",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: [],
            practicalChallenges: [],
            interviewPrompts: [],
          },
        ],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("assignConceptsToLevel", () => {
  it("maps concepts to numeric levels based on their string level", () => {
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const result = assignConceptsToLevel(subject, progression);

    // foundation -> level 1
    expect(result.get(1)).toContain("concept.a");
    expect(result.get(1)).toContain("concept.b");

    // intermediate -> level 3 (min + floor(10 * 0.3) = 1 + 3 = 4... actually let me calculate)
    // mapSubjectLevelStringToNumber("intermediate", {min=1, max=10}) => 1 + Math.floor(10 * 0.3) = 1 + 3 = 4
    // But wait, range = 10-1+1 = 10. So intermediate = 1 + max(1, floor(10*0.3)) = 1 + max(1, 3) = 4
    // Since level 4 isn't in the test levels... but it still maps there
    expect(result.get(4)).toContain("concept.c");

    // advanced -> 1 + max(2, floor(10*0.6)) = 1 + max(2, 6) = 7
    expect(result.get(7)).toContain("concept.d");

    // senior -> 10
    expect(result.get(10)).toContain("concept.e");
  });

  it("returns empty arrays for levels with no concepts", () => {
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const result = assignConceptsToLevel(subject, progression);

    expect(result.get(3)).toEqual([]);
    expect(result.has(6)).toBe(true);
    expect(result.get(6)).toEqual([]);
  });

  it("creates entries for every level in the range", () => {
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const result = assignConceptsToLevel(subject, progression);

    for (let i = 1; i <= 10; i++) {
      expect(result.has(i)).toBe(true);
    }
  });
});

describe("mapSubjectLevelStringToNumber", () => {
  const wide: SubjectProgression = {
    minimumLevel: 1,
    maximumLevel: 20,
    estimatedDaysPerLevel: 7,
    bossRequired: true,
    levels: [],
  };
  const narrow: SubjectProgression = {
    minimumLevel: 1,
    maximumLevel: 3,
    estimatedDaysPerLevel: 7,
    bossRequired: true,
    levels: [],
  };

  it("maps foundation to minimumLevel", () => {
    expect(mapSubjectLevelStringToNumber("foundation", wide)).toBe(1);
    expect(mapSubjectLevelStringToNumber("foundation", narrow)).toBe(1);
  });

  it("maps intermediate above foundation", () => {
    const result = mapSubjectLevelStringToNumber("intermediate", wide);
    expect(result).toBeGreaterThan(1);
    expect(result).toBeLessThan(20);
  });

  it("maps senior to maximumLevel", () => {
    expect(mapSubjectLevelStringToNumber("senior", wide)).toBe(20);
    expect(mapSubjectLevelStringToNumber("senior", narrow)).toBe(3);
  });

  it("falls back to minimum for unknown level strings", () => {
    expect(mapSubjectLevelStringToNumber("unknown-level", wide)).toBe(1);
  });
});

describe("getLevelDefinition", () => {
  it("returns the definition for a known level", () => {
    const progression = buildTestProgression();
    const def = getLevelDefinition(progression, 5);
    expect(def).toBeDefined();
    expect(def!.title).toBe("Rendering Explorer");
  });

  it("returns undefined for a level without a definition", () => {
    const progression = buildTestProgression();
    const def = getLevelDefinition(progression, 3);
    expect(def).toBeUndefined();
  });

  it("returns undefined for out-of-range level", () => {
    const progression = buildTestProgression();
    expect(getLevelDefinition(progression, 0)).toBeUndefined();
    expect(getLevelDefinition(progression, 11)).toBeUndefined();
  });
});

describe("findLevelForDifficulty", () => {
  it("finds the level whose difficulty range covers the given value", () => {
    const progression = buildTestProgression();
    const def = findLevelForDifficulty(progression, 4);
    expect(def).toBeDefined();
    expect(def!.title).toBe("Rendering Explorer"); // range 3-5
  });

  it("returns the highest level for difficulties above all ranges", () => {
    const progression = buildTestProgression();
    const def = findLevelForDifficulty(progression, 10);
    expect(def).toBeDefined();
    expect(def!.level).toBe(10);
  });

  it("returns the first level for difficulties below all ranges", () => {
    const progression = buildTestProgression();
    const def = findLevelForDifficulty(progression, 0);
    expect(def).toBeDefined();
    expect(def!.level).toBe(1);
  });
});

describe("player-subject-progress", () => {
  it("creates initial progress at level 1 with zero scores", async () => {
    const { createPlayerSubjectProgress } =
      await import("@/modules/subjects/domain/player-subject-progress");
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const progress = createPlayerSubjectProgress("player-1", subject);

    expect(progress.playerId).toBe("player-1");
    expect(progress.subjectId).toBe("test");
    expect(progress.currentLevel).toBe(1);
    expect(progress.masteryScore).toBe(0);
    expect(progress.bossStatus).toBe("locked");
    expect(progress.completedAt).toBeNull();
  });

  it("records successful encounters", async () => {
    const { createPlayerSubjectProgress, recordSuccessfulEncounter } =
      await import("@/modules/subjects/domain/player-subject-progress");
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const progress = createPlayerSubjectProgress("player-1", subject);

    const updated = recordSuccessfulEncounter(progress);
    expect(updated.successfulEncounterCount).toBe(1);
    expect(updated.reviewEncounterCount).toBe(0);
    // Original should be unchanged (immutability)
    expect(progress.successfulEncounterCount).toBe(0);
  });

  it("records review encounters", async () => {
    const { createPlayerSubjectProgress, recordReviewEncounter } =
      await import("@/modules/subjects/domain/player-subject-progress");
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const progress = createPlayerSubjectProgress("player-1", subject);

    const updated = recordReviewEncounter(progress);
    expect(updated.reviewEncounterCount).toBe(1);
  });

  it("updates mastery and retention scores from concept masteries", async () => {
    const { createPlayerSubjectProgress, updateSubjectMasteryScore } =
      await import("@/modules/subjects/domain/player-subject-progress");
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const progress = createPlayerSubjectProgress("player-1", subject);

    const masteries = [
      { masteryScore: 0.8, retentionScore: 0.7 },
      { masteryScore: 0.6, retentionScore: 0.5 },
    ];

    const updated = updateSubjectMasteryScore(progress, masteries);
    expect(updated.masteryScore).toBeCloseTo(0.7);
    expect(updated.retentionScore).toBeCloseTo(0.6);
  });

  it("advances subject level", async () => {
    const { createPlayerSubjectProgress, advanceSubjectLevel } =
      await import("@/modules/subjects/domain/player-subject-progress");
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const progress = createPlayerSubjectProgress("player-1", subject);

    const advanced = advanceSubjectLevel(progress);
    expect(advanced.currentLevel).toBe(2);
    expect(advanced.completedAt).toBeNull(); // not at max level yet
  });

  it("marks subject complete when advancing past max level", async () => {
    const { createPlayerSubjectProgress, advanceSubjectLevel } =
      await import("@/modules/subjects/domain/player-subject-progress");
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    let progress = createPlayerSubjectProgress("player-1", subject);

    // Advance from level 1 to 2-10
    for (let i = 0; i < 9; i++) {
      progress = advanceSubjectLevel(progress);
    }
    expect(progress.currentLevel).toBe(10);
    expect(progress.completedAt).toBeNull();

    // Advance past 10 — should complete
    const final = advanceSubjectLevel(progress);
    expect(final.currentLevel).toBe(10); // capped at max
    expect(final.completedAt).not.toBeNull();
  });

  it("unlocks subject boss", async () => {
    const { createPlayerSubjectProgress, unlockSubjectBoss } =
      await import("@/modules/subjects/domain/player-subject-progress");
    const progression = buildTestProgression();
    const subject = buildTestSubject(progression);
    const progress = createPlayerSubjectProgress("player-1", subject);

    const unlocked = unlockSubjectBoss(progress);
    expect(unlocked.bossStatus).toBe("available");
  });
});
