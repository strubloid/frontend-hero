import { describe, it, expect } from "vitest";
import { BossService } from "@/modules/missions/application/boss.service";
import {
  InMemoryBossEncounterRepository,
  InMemoryBossProgressRepository,
} from "@/modules/missions/infrastructure/in-memory-boss-repository";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { PlayerRepository } from "@/modules/players/domain/player-repository";
import type { Player } from "@/modules/players/domain/player";
import type { Question } from "@/modules/questions/domain/question";
import type { BossEncounterService } from "@/modules/missions/application/boss-encounter.service";

// -----------------------------------------------------------------------
// Fakes
// -----------------------------------------------------------------------

class RecordingQuestionRepository implements QuestionRepository {
  private store = new Map<string, Question>();
  private idCounter = 0;

  async getById(id: string): Promise<Question | null> {
    return this.store.get(id) ?? null;
  }

  async create(question: Question): Promise<Question> {
    const q = { ...question, id: `q-${++this.idCounter}` };
    this.store.set(q.id, q);
    return q;
  }

  async getByConceptId(conceptId: string): Promise<Question[]> {
    return Array.from(this.store.values()).filter((q) => q.conceptId === conceptId);
  }

  async getRandomBySubjectId(subjectId: string, limit: number): Promise<Question[]> {
    const all = Array.from(this.store.values()).filter((q) => q.subjectId === subjectId);
    return all.slice(0, limit);
  }

  async getBySeedAndSubject(): Promise<Question | null> {
    return null;
  }
}

class StaticPlayerRepository implements PlayerRepository {
  private players = new Map<string, Player>();

  async getById(id: string): Promise<Player | null> {
    return (
      this.players.get(id) ?? {
        id,
        name: "Adventurer",
        level: 1,
        experiencePoints: 0,
        masteryPoints: 0,
        currentSubjectId: null,
        currentRegionId: null,
        lastActiveAt: null,
        lastReturnBonusClaimedAt: null,
        selectedTitle: null,
        selectedTheme: null,
        email: null,
        passwordHash: null,
        emailVerified: null,
        image: null,
        workshopTier: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  }

  async create(player: Player): Promise<Player> {
    this.players.set(player.id, player);
    return player;
  }

  async save(player: Player): Promise<Player> {
    this.players.set(player.id, player);
    return player;
  }
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("BossService", () => {
  function createService(
    overrides?: Partial<{
      bossRepo: InMemoryBossEncounterRepository;
      progressRepo: InMemoryBossProgressRepository;
      encounterService: BossEncounterService;
      questionRepo: QuestionRepository;
      playerRepo: PlayerRepository;
    }>,
  ): BossService {
    return new BossService(
      overrides?.bossRepo ?? new InMemoryBossEncounterRepository(),
      overrides?.progressRepo ?? new InMemoryBossProgressRepository(),
      overrides?.encounterService ?? ({} as BossEncounterService),
      overrides?.questionRepo ?? new RecordingQuestionRepository(),
      overrides?.playerRepo ?? new StaticPlayerRepository(),
    );
  }

  it("returns retreat status when the player has retreated", async () => {
    const bossRepo = new InMemoryBossEncounterRepository();
    const progressRepo = new InMemoryBossProgressRepository();
    const questionRepo = new RecordingQuestionRepository();
    const playerRepo = new StaticPlayerRepository();

    const boss = await bossRepo.getByRegion("nextjs");
    expect(boss).not.toBeNull();

    await progressRepo.save({
      id: "progress-1",
      playerId: "player-1",
      bossId: boss!.id,
      currentPhaseIndex: 0,
      completedPhaseIds: [],
      phaseAttempts: [],
      status: "retreat",
      startedAt: new Date(),
      completedAt: null,
    });

    const service = createService({ bossRepo, progressRepo, questionRepo, playerRepo });
    const state = await service.getState("player-1", "nextjs");

    expect(state.status).toBe("retreat");
    expect(state.bossDefeated).toBe(false);
    expect(state.question).toBeNull();
  });

  it("throws when no boss exists for the region", async () => {
    const service = createService();

    await expect(service.getState("player-1", "unknown-region")).rejects.toThrow(
      "No boss encounter found for region: unknown-region",
    );
  });

  it("returns active status with intro data on first encounter", async () => {
    const bossRepo = new InMemoryBossEncounterRepository();
    const progressRepo = new InMemoryBossProgressRepository();

    const service = createService({ bossRepo, progressRepo });
    const state = await service.getState("player-1", "nextjs");

    expect(state.status).toBe("active");
    expect(state.question).toBeNull(); // No questions seeded yet
    expect(state.bossDefeated).toBe(false);
    expect(state.bossId).toBe("boss-app-router");
    expect(state.name).toBe("The App Router Wyrm");
    expect(state.totalPhases).toBeGreaterThanOrEqual(4);
    expect(state.currentPhaseIndex).toBe(0);
    expect(state.narrativeIntro).toBeTruthy();
  });

  it("returns defeated status when progress status is defeated", async () => {
    const bossRepo = new InMemoryBossEncounterRepository();
    const progressRepo = new InMemoryBossProgressRepository();

    const boss = await bossRepo.getByRegion("nextjs");
    expect(boss).not.toBeNull();

    await progressRepo.save({
      id: "progress-2",
      playerId: "player-1",
      bossId: boss!.id,
      currentPhaseIndex: 3,
      completedPhaseIds: boss!.phases.map((p) => p.id),
      phaseAttempts: [],
      status: "defeated",
      startedAt: new Date(),
      completedAt: new Date(),
    });

    const service = createService({ bossRepo, progressRepo });
    const state = await service.getState("player-1", "nextjs");

    expect(state.status).toBe("victory");
    expect(state.bossDefeated).toBe(true);
    expect(state.question).toBeNull();
  });

  it("returns completed phase IDs when progress exists but is active", async () => {
    const bossRepo = new InMemoryBossEncounterRepository();
    const progressRepo = new InMemoryBossProgressRepository();

    const boss = await bossRepo.getByRegion("nextjs");
    expect(boss).not.toBeNull();

    await progressRepo.save({
      id: "progress-3",
      playerId: "player-1",
      bossId: boss!.id,
      currentPhaseIndex: 1,
      completedPhaseIds: [boss!.phases[0].id],
      phaseAttempts: [],
      status: "active",
      startedAt: new Date(),
      completedAt: null,
    });

    const service = createService({ bossRepo, progressRepo });
    const state = await service.getState("player-1", "nextjs");

    expect(state.status).toBe("active");
    expect(state.currentPhaseIndex).toBe(1);
    expect(state.completedPhaseIds).toEqual([boss!.phases[0].id]);
    expect(state.phaseName).toBeTruthy();
    expect(state.phasePrompt).toBeTruthy();
  });

  it("returns question when questions exist for the current phase concept", async () => {
    const bossRepo = new InMemoryBossEncounterRepository();
    const progressRepo = new InMemoryBossProgressRepository();
    const questionRepo = new RecordingQuestionRepository();

    const boss = await bossRepo.getByRegion("nextjs");
    expect(boss).not.toBeNull();

    // Seed a question matching the first phase's first concept ID
    const seeded = await questionRepo.create({
      id: "q-boss-1",
      subjectId: "nextjs",
      conceptId: boss!.phases[0].conceptIds[0],
      seedId: "boss-seed-1",
      type: "multiple-choice",
      difficulty: 2,
      stem: "What is layout nesting?",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "Layout nesting is key.",
      timesShown: 0,
      lastShownAt: null,
      qualityRating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const service = createService({ bossRepo, progressRepo, questionRepo });
    const state = await service.getState("player-1", "nextjs");

    expect(state.question).not.toBeNull();
    expect(state.question!.questionId).toBe(seeded.id);
    expect(state.question!.stem).toBe("What is layout nesting?");
    expect(state.question!.options).toHaveLength(4);
  });

  it("retreat persists retreat status", async () => {
    const bossRepo = new InMemoryBossEncounterRepository();
    const progressRepo = new InMemoryBossProgressRepository();

    const boss = await bossRepo.getByRegion("nextjs");
    expect(boss).not.toBeNull();

    await progressRepo.save({
      id: "progress-retreat",
      playerId: "player-1",
      bossId: boss!.id,
      currentPhaseIndex: 1,
      completedPhaseIds: [boss!.phases[0].id],
      phaseAttempts: [],
      status: "active",
      startedAt: new Date(),
      completedAt: null,
    });

    const service = createService({ bossRepo, progressRepo });
    await service.retreat("player-1", "nextjs");

    const updated = await progressRepo.getByPlayerAndBoss("player-1", boss!.id);
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe("retreat");
  });

  it("startBoss persists progress and returns state", async () => {
    const bossRepo = new InMemoryBossEncounterRepository();
    const progressRepo = new InMemoryBossProgressRepository();
    const playerRepo = new StaticPlayerRepository();

    // Create a minimal BossEncounterService that just creates progress
    const encounterService = {
      startBossEncounter: async (
        playerId: string,
        boss: import("@/modules/missions/domain/boss-encounter").BossEncounter,
      ) => {
        const progress: import("@/modules/missions/domain/boss-encounter").PlayerBossProgress = {
          id: "ephemeral-progress",
          playerId,
          bossId: boss.id,
          currentPhaseIndex: 0,
          completedPhaseIds: [],
          phaseAttempts: [],
          status: "active",
          startedAt: new Date(),
          completedAt: null,
        };
        return {
          mission: null as any,
          bossProgress: progress,
        };
      },
      submitAttack: async () => {
        throw new Error("Not implemented — use submitAnswer instead");
      },
    } as unknown as BossEncounterService;

    const service = createService({
      bossRepo,
      progressRepo,
      encounterService,
      playerRepo,
    });

    const state = await service.startBoss("player-1", "nextjs");

    // After start, state should be active with boss info
    expect(state.status).toBe("active");
    expect(state.bossId).toBe("boss-app-router");
    expect(state.bossDefeated).toBe(false);

    // Progress should be persisted
    const progress = await progressRepo.getByPlayerAndBoss("player-1", "boss-app-router");
    expect(progress).not.toBeNull();
    expect(progress!.status).toBe("active");
    expect(progress!.currentPhaseIndex).toBe(0);
  });
});
