import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import { createTables } from "../../fixtures/create-tables";
import {
  DrizzleMissionRepository,
  DrizzleMissionAttemptRepository,
} from "@/modules/missions/infrastructure/drizzle-mission-repository";
import type { Mission, MissionAttempt } from "@/modules/missions/domain/mission";

describe("DrizzleMissionRepository", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let repository: DrizzleMissionRepository;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
    createTables(sqlite);
    repository = new DrizzleMissionRepository(sqlite);
  });

  const createSampleMission = (overrides: Partial<Mission> = {}): Mission => ({
    id: "mission-1",
    playerId: "player-1",
    subjectId: "nextjs",
    type: "encounter",
    status: "active",
    questionIds: ["q-1", "q-2", "q-3"],
    currentQuestionIndex: 0,
    score: 0,
    maxScore: 3,
    startedAt: new Date("2025-01-15T10:00:00Z"),
    completedAt: null,
    createdAt: new Date("2025-01-15T10:00:00Z"),
    updatedAt: new Date("2025-01-15T10:00:00Z"),
    ...overrides,
  });

  describe("create", () => {
    it("inserts a mission and returns it", async () => {
      const mission = createSampleMission();
      const result = await repository.create(mission);

      expect(result).toEqual(mission);
    });

    it("stores questionIds as JSON text", async () => {
      const mission = createSampleMission({ id: "mission-json-test" });
      await repository.create(mission);

      const rows = db.select().from(schema.missions).all();
      expect(rows).toHaveLength(1);
      expect(rows[0].questionIds).toBe('["q-1","q-2","q-3"]');
    });

    it("stores dates as ISO strings", async () => {
      await repository.create(createSampleMission());

      const rows = db.select().from(schema.missions).all();
      expect(rows[0].startedAt).toBe("2025-01-15T10:00:00.000Z");
      expect(rows[0].completedAt).toBeNull();
    });
  });

  describe("getById", () => {
    it("retrieves a mission by ID with JSON fields parsed", async () => {
      await repository.create(createSampleMission());

      const result = await repository.getById("mission-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("mission-1");
      expect(result!.playerId).toBe("player-1");
      expect(result!.subjectId).toBe("nextjs");
      expect(result!.type).toBe("encounter");
      expect(result!.status).toBe("active");
      expect(result!.questionIds).toEqual(["q-1", "q-2", "q-3"]);
      expect(result!.currentQuestionIndex).toBe(0);
      expect(result!.score).toBe(0);
      expect(result!.maxScore).toBe(3);
      expect(result!.startedAt).toBeInstanceOf(Date);
      expect(result!.completedAt).toBeNull();
      expect(result!.createdAt).toBeInstanceOf(Date);
      expect(result!.updatedAt).toBeInstanceOf(Date);
    });

    it("returns null for missing ID", async () => {
      const result = await repository.getById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("getActiveByPlayer", () => {
    it("returns the active mission for a player", async () => {
      await repository.create(createSampleMission({ id: "mission-active", playerId: "player-1" }));

      const result = await repository.getActiveByPlayer("player-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("mission-active");
      expect(result!.status).toBe("active");
    });

    it("returns the most recently started active mission when several exist", async () => {
      await repository.create(
        createSampleMission({ id: "mission-old", startedAt: new Date("2025-01-15T10:00:00Z") }),
      );
      await repository.create(
        createSampleMission({ id: "mission-new", startedAt: new Date("2025-01-15T11:00:00Z") }),
      );

      const result = await repository.getActiveByPlayer("player-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("mission-new");
    });

    it("returns null when player has no active mission", async () => {
      await repository.create(
        createSampleMission({ id: "mission-completed", status: "completed" }),
      );

      const result = await repository.getActiveByPlayer("player-1");

      expect(result).toBeNull();
    });

    it("ignores active missions for other players", async () => {
      await repository.create(createSampleMission({ id: "mission-other", playerId: "player-2" }));

      const result = await repository.getActiveByPlayer("player-1");

      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("updates mission fields", async () => {
      await repository.create(createSampleMission());

      const updated: Mission = {
        ...createSampleMission(),
        status: "completed",
        score: 2,
        completedAt: new Date("2025-01-15T11:00:00Z"),
        updatedAt: new Date("2025-01-15T11:00:00Z"),
      };

      const result = await repository.save(updated);
      expect(result.status).toBe("completed");
      expect(result.score).toBe(2);

      const rows = db.select().from(schema.missions).all();
      expect(rows[0].status).toBe("completed");
      expect(rows[0].score).toBe(2);
      expect(rows[0].completedAt).toBe("2025-01-15T11:00:00.000Z");
    });
  });
});

describe("DrizzleMissionAttemptRepository", () => {
  let sqlite: Database.Database;
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let attemptRepository: DrizzleMissionAttemptRepository;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
    createTables(sqlite);
    attemptRepository = new DrizzleMissionAttemptRepository(sqlite);
  });

  const createSampleAttempt = (overrides: Partial<MissionAttempt> = {}): MissionAttempt => ({
    id: "attempt-1",
    missionId: "mission-1",
    playerId: "player-1",
    questionId: "q-1",
    selectedIndex: 2,
    isCorrect: true,
    timeSpentSeconds: 45,
    hintsUsed: 1,
    attemptedAt: new Date("2025-01-15T10:05:00Z"),
    ...overrides,
  });

  describe("create", () => {
    it("inserts an attempt with boolean isCorrect converted to integer", async () => {
      const attempt = createSampleAttempt();
      const result = await attemptRepository.create(attempt);

      expect(result).toEqual(attempt);

      const rows = db.select().from(schema.missionAttempts).all();
      expect(rows).toHaveLength(1);
      expect(rows[0].isCorrect).toBe(1);
    });

    it("stores false isCorrect as 0 in DB", async () => {
      await attemptRepository.create(
        createSampleAttempt({ id: "attempt-false", isCorrect: false }),
      );

      const rows = db.select().from(schema.missionAttempts).all();
      const attemptRow = rows.find((r) => r.id === "attempt-false");
      expect(attemptRow!.isCorrect).toBe(0);
    });
  });

  describe("getByMission", () => {
    it("retrieves all attempts for a mission with isCorrect converted back to boolean", async () => {
      await attemptRepository.create(createSampleAttempt({ id: "attempt-a" }));
      await attemptRepository.create(
        createSampleAttempt({ id: "attempt-b", questionId: "q-2", isCorrect: false }),
      );

      const results = await attemptRepository.getByMission("mission-1");

      expect(results).toHaveLength(2);
      expect(results[0].isCorrect).toBe(true);
      expect(results[1].isCorrect).toBe(false);
      expect(results[0].attemptedAt).toBeInstanceOf(Date);
      expect(results[1].attemptedAt).toBeInstanceOf(Date);
    });

    it("returns empty array when no attempts exist for a mission", async () => {
      const results = await attemptRepository.getByMission("non-existent");
      expect(results).toEqual([]);
    });
  });
});
