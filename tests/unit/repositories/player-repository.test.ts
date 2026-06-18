import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import { createTables } from "../../fixtures/create-tables";
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import type { Player } from "@/modules/players/domain/player";

describe("DrizzlePlayerRepository", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let repository: DrizzlePlayerRepository;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    db = drizzle(sqlite, { schema });
    createTables(sqlite);
    repository = new DrizzlePlayerRepository(sqlite);
  });

  const createSamplePlayer = (overrides: Partial<Player> = {}): Player => ({
    id: overrides.id ?? "player-1",
    name: overrides.name ?? "Test Hero",
    level: overrides.level ?? 5,
    experiencePoints: overrides.experiencePoints ?? 1200,
    masteryPoints: overrides.masteryPoints ?? 350,
    currentSubjectId: overrides.currentSubjectId ?? "nextjs",
    currentRegionId: overrides.currentRegionId ?? "region-1",
    lastActiveAt: overrides.lastActiveAt ?? null,
    lastReturnBonusClaimedAt: overrides.lastReturnBonusClaimedAt ?? null,
    selectedTitle: overrides.selectedTitle ?? null,
    selectedTheme: overrides.selectedTheme ?? null,
    email: overrides.email ?? null,
    passwordHash: overrides.passwordHash ?? null,
    emailVerified: overrides.emailVerified ?? null,
    image: overrides.image ?? null,
    workshopTier: overrides.workshopTier ?? 1,
    createdAt: overrides.createdAt ?? new Date("2025-01-15T10:00:00Z"),
    updatedAt: overrides.updatedAt ?? new Date("2025-01-15T10:00:00Z"),
  });

  describe("create", () => {
    it("inserts a player and returns the player", async () => {
      const player = createSamplePlayer();
      const result = await repository.create(player);

      expect(result).toEqual(player);
    });

    it("persists all fields correctly", async () => {
      const player = createSamplePlayer();
      await repository.create(player);

      const rows = db.select().from(schema.players).all();
      expect(rows).toHaveLength(1);

      const row = rows[0];
      expect(row.id).toBe("player-1");
      expect(row.name).toBe("Test Hero");
      expect(row.level).toBe(5);
      expect(row.experiencePoints).toBe(1200);
      expect(row.masteryPoints).toBe(350);
      expect(row.currentSubjectId).toBe("nextjs");
      expect(row.currentRegionId).toBe("region-1");
    });

    it("stores dates as ISO strings", async () => {
      await repository.create(createSamplePlayer());

      const rows = db.select().from(schema.players).all();
      expect(rows[0].createdAt).toBe("2025-01-15T10:00:00.000Z");
      expect(rows[0].updatedAt).toBe("2025-01-15T10:00:00.000Z");
    });
  });

  describe("getById", () => {
    it("retrieves a player by ID with all fields converted to domain types", async () => {
      const player = createSamplePlayer();
      await repository.create(player);

      const result = await repository.getById("player-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("player-1");
      expect(result!.name).toBe("Test Hero");
      expect(result!.level).toBe(5);
      expect(result!.experiencePoints).toBe(1200);
      expect(result!.masteryPoints).toBe(350);
      expect(result!.currentSubjectId).toBe("nextjs");
      expect(result!.currentRegionId).toBe("region-1");
      expect(result!.createdAt).toBeInstanceOf(Date);
      expect(result!.updatedAt).toBeInstanceOf(Date);
      expect(result!.createdAt.toISOString()).toBe("2025-01-15T10:00:00.000Z");
    });

    it("returns null for a non-existent player ID", async () => {
      const result = await repository.getById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("updates an existing player and returns the updated player", async () => {
      const player = createSamplePlayer();
      await repository.create(player);

      const updated: Player = {
        ...player,
        level: 6,
        experiencePoints: 1800,
        updatedAt: new Date("2025-02-01T12:00:00Z"),
      };

      const result = await repository.save(updated);

      expect(result).toEqual(updated);

      const rows = db.select().from(schema.players).all();
      expect(rows).toHaveLength(1);
      expect(rows[0].level).toBe(6);
      expect(rows[0].experiencePoints).toBe(1800);
      expect(rows[0].updatedAt).toBe("2025-02-01T12:00:00.000Z");
    });
  });
});
