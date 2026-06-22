import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { openSqliteDatabase } from "./connection";

const REQUIRED_TABLES = [
  "account",
  "bossEncounters",
  "bossProgress",
  "conceptMastery",
  "concepts",
  "missionAttempts",
  "missionChainProgress",
  "missionChains",
  "missions",
  "playerAchievements",
  "playerProgression",
  "playerRegionProgress",
  "playerSubjectProgress",
  "players",
  "questProgress",
  "questions",
  "quests",
  "regionAdjacency",
  "regionTasks",
  "reviewSchedules",
  "session",
  "subjects",
  "verificationToken",
  "worldRegions",
];

describe("database connection bootstrap", () => {
  it("creates parent directories and application tables for a new SQLite database", () => {
    const directory = mkdtempSync(join(tmpdir(), "frontend-realms-db-"));
    const dbPath = join(directory, "nested", "frontend-realms.db");

    try {
      const sqlite = openSqliteDatabase(dbPath);
      const tableRows = sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .all() as { name: string }[];

      expect(tableRows.map((row) => row.name)).toEqual(REQUIRED_TABLES);
      sqlite.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("is idempotent when bootstrap runs more than once against the same file", () => {
    const directory = mkdtempSync(join(tmpdir(), "frontend-realms-db-"));
    const dbPath = join(directory, "frontend-realms.db");

    try {
      const first = openSqliteDatabase(dbPath);
      first.close();

      const second = openSqliteDatabase(dbPath);
      const count = (
        second
          .prepare("SELECT COUNT(*) AS value FROM sqlite_master WHERE type = 'table'")
          .get() as { value: number }
      ).value;

      expect(count).toBe(REQUIRED_TABLES.length);
      second.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("creates player subject progress table with persistence columns", () => {
    const directory = mkdtempSync(join(tmpdir(), "frontend-realms-db-"));
    const dbPath = join(directory, "frontend-realms.db");

    try {
      const sqlite = openSqliteDatabase(dbPath);
      const table = sqlite
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
        .get("playerSubjectProgress") as { name: string } | undefined;
      const columns = sqlite.prepare("PRAGMA table_info(playerSubjectProgress)").all() as {
        name: string;
      }[];

      expect(table?.name).toBe("playerSubjectProgress");
      expect(columns.map((column) => column.name)).toEqual([
        "id",
        "playerId",
        "subjectId",
        "currentLevel",
        "maximumLevel",
        "masteryScore",
        "retentionScore",
        "successfulEncounterCount",
        "reviewEncounterCount",
        "practicalEncounterCount",
        "distinctStudySessionCount",
        "bossStatus",
        "startedAt",
        "completedAt",
        "updatedAt",
      ]);
      sqlite.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
