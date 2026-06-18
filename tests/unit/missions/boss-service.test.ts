import { describe, it, expect } from "vitest";
import { BossService } from "@/modules/missions/application/boss.service";
import {
  InMemoryBossEncounterRepository,
  InMemoryBossProgressRepository,
} from "@/modules/missions/infrastructure/in-memory-boss-repository";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { PlayerRepository } from "@/modules/players/domain/player-repository";
import type { Player } from "@/modules/players/domain/player";
import type { BossEncounterService } from "@/modules/missions/application/boss-encounter.service";

class EmptyQuestionRepository implements QuestionRepository {
  async getById() {
    return null;
  }
  async create(question: any) {
    return question;
  }
  async getByConceptId() {
    return [];
  }
  async getRandomBySubjectId() {
    return [];
  }
  async getBySeedAndSubject() {
    return null;
  }
}

class StaticPlayerRepository implements PlayerRepository {
  async getById(id: string): Promise<Player | null> {
    return {
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
    };
  }
  async create(player: any) {
    return player;
  }
  async save(player: any) {
    return player;
  }
}

describe("BossService", () => {
  it("returns retreat status from getState when the player has retreated", async () => {
    const bossRepository = new InMemoryBossEncounterRepository();
    const progressRepository = new InMemoryBossProgressRepository();
    const questionRepository = new EmptyQuestionRepository();
    const playerRepository = new StaticPlayerRepository();

    const boss = await bossRepository.getByRegion("nextjs");
    expect(boss).not.toBeNull();

    await progressRepository.save({
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

    const service = new BossService(
      bossRepository,
      progressRepository,
      {} as BossEncounterService,
      questionRepository,
      playerRepository,
    );

    const state = await service.getState("player-1", "nextjs");

    expect(state.status).toBe("retreat");
    expect(state.bossDefeated).toBe(false);
    expect(state.question).toBeNull();
  });
});
