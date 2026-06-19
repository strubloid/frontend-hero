import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryPlayerRepository } from "@/modules/players/infrastructure/in-memory-player-repository";
import { InMemorySubjectRepository } from "@/modules/subjects/infrastructure/in-memory-subject-repository";
import { InMemoryPlayerSubjectProgressRepository } from "@/modules/subjects/infrastructure/in-memory-player-subject-progress-repository";
import { SelectSubjectUseCase } from "@/modules/subjects/application/select-subject/select-subject.use-case";
import type { SelectSubjectRequest } from "@/modules/subjects/application/select-subject/select-subject.request";
import type { Player } from "@/modules/players/domain/player";
import type { Subject } from "@/modules/subjects/domain/subject";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  const now = new Date();
  return {
    id: "player-1",
    name: "TestPlayer",
    email: "test@example.com",
    passwordHash: null,
    emailVerified: null,
    image: null,
    level: 1,
    experiencePoints: 0,
    masteryPoints: 0,
    currentSubjectId: null,
    currentRegionId: null,
    lastActiveAt: null,
    lastReturnBonusClaimedAt: null,
    selectedTitle: null,
    selectedTheme: null,
    workshopTier: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as Player;
}

function makeSubject(overrides: Partial<Subject> = {}): Subject {
  const now = new Date();
  return {
    id: "nextjs",
    title: "Next.js Deep Dive",
    description: "Master Next.js internals",
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
          allowedChallengeTypes: ["multiple-choice"],
        },
      ],
    },
    domains: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SelectSubjectUseCase", () => {
  let useCase: SelectSubjectUseCase;
  let playerRepo: InMemoryPlayerRepository;
  let subjectRepo: InMemorySubjectRepository;
  let progressRepo: InMemoryPlayerSubjectProgressRepository;
  let request: SelectSubjectRequest;

  beforeEach(() => {
    playerRepo = new InMemoryPlayerRepository();
    subjectRepo = new InMemorySubjectRepository();
    progressRepo = new InMemoryPlayerSubjectProgressRepository();
    useCase = new SelectSubjectUseCase(playerRepo, subjectRepo, progressRepo);

    playerRepo.set(makePlayer());
    subjectRepo.set(makeSubject());

    request = {
      playerId: "player-1",
      subjectId: "nextjs",
    };
  });

  it("creates new progress and sets currentSubjectId", async () => {
    const result = await useCase.execute(request);

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(result.subjectProgressId).toBeTruthy();

    // Player should have currentSubjectId set
    const player = await playerRepo.getById("player-1");
    expect(player?.currentSubjectId).toBe("nextjs");

    // Progress should exist
    const progress = await progressRepo.findByPlayerAndSubject("player-1", "nextjs");
    expect(progress).not.toBeNull();
    expect(progress!.currentLevel).toBe(1);
  });

  it("reuses existing progress if already started", async () => {
    // First call
    const first = await useCase.execute(request);
    // Second call
    const second = await useCase.execute(request);

    expect(second.success).toBe(true);
    expect(second.subjectProgressId).toBe(first.subjectProgressId);
  });

  it("returns error for non-existent player", async () => {
    const result = await useCase.execute({ playerId: "nobody", subjectId: "nextjs" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Player not found");
  });

  it("returns error for non-existent subject", async () => {
    const result = await useCase.execute({ playerId: "player-1", subjectId: "unknown" });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Subject not found");
  });
});
