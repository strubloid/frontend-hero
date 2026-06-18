import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import { Achievement, PlayerAchievement } from "../domain/achievement";
import { AchievementRepository } from "../domain/achievement-repository";

type DbInstance = BetterSQLite3Database<typeof schema>;

// ─── Static achievement definitions ──────────────────────────────────────────
// These are defined in code, not stored in the database. The DB only stores
// player achievements (who earned what and when).

const DEFINED_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first mission",
    category: "milestone",
    iconId: "🌱",
    hidden: false,
    condition: { type: "missions_completed", threshold: 1 },
    reward: { type: "xp_bonus", value: "50" },
  },
  {
    id: "diligent",
    name: "Diligent",
    description: "Complete 25 missions",
    category: "milestone",
    iconId: "📋",
    hidden: false,
    condition: { type: "missions_completed", threshold: 25 },
    reward: { type: "title", value: "Diligent" },
  },
  {
    id: "persistent",
    name: "Persistent",
    description: "Complete 100 missions",
    category: "milestone",
    iconId: "🏋",
    hidden: false,
    condition: { type: "missions_completed", threshold: 100 },
    reward: { type: "title", value: "Persistent" },
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Master 5 concepts",
    category: "mastery",
    iconId: "📚",
    hidden: false,
    condition: { type: "concepts_mastered", threshold: 5 },
    reward: null,
  },
  {
    id: "sage",
    name: "Sage",
    description: "Master 25 concepts",
    category: "mastery",
    iconId: "🦉",
    hidden: false,
    condition: { type: "concepts_mastered", threshold: 25 },
    reward: { type: "title", value: "Sage" },
  },
  {
    id: "polymath",
    name: "Polymath",
    description: "Master 50 concepts",
    category: "mastery",
    iconId: "🧠",
    hidden: false,
    condition: { type: "concepts_mastered", threshold: 50 },
    reward: { type: "title", value: "Polymath" },
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Maintain a 5-day streak",
    category: "streak",
    iconId: "🔥",
    hidden: false,
    condition: { type: "streak_days", threshold: 5 },
    reward: null,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Maintain a 15-day streak",
    category: "streak",
    iconId: "⚡",
    hidden: false,
    condition: { type: "streak_days", threshold: 15 },
    reward: { type: "title", value: "Unstoppable" },
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Answer 10 questions correctly in under 3 seconds",
    category: "challenge",
    iconId: "💨",
    hidden: false,
    condition: { type: "speed_demon", threshold: 10 },
    reward: { type: "title", value: "Speed Demon" },
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete a mission with 100% accuracy",
    category: "challenge",
    iconId: "💎",
    hidden: false,
    condition: { type: "perfect_mission", threshold: 1 },
    reward: null,
  },
  {
    id: "boss-slayer",
    name: "Boss Slayer",
    description: "Defeat your first boss encounter",
    category: "challenge",
    iconId: "🗡",
    hidden: false,
    condition: { type: "bosses_defeated", threshold: 1 },
    reward: { type: "title", value: "Boss Slayer" },
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Unlock 3 regions",
    category: "exploration",
    iconId: "🗺",
    hidden: false,
    condition: { type: "regions_unlocked", threshold: 3 },
    reward: null,
  },
  {
    id: "globetrotter",
    name: "Globetrotter",
    description: "Unlock all 13 regions",
    category: "exploration",
    iconId: "🌍",
    hidden: false,
    condition: { type: "regions_unlocked", threshold: 13 },
    reward: { type: "title", value: "Globetrotter" },
  },
  {
    id: "apprentice",
    name: "Apprentice",
    description: "Reach level 5",
    category: "milestone",
    iconId: "⭐",
    hidden: false,
    condition: { type: "level_reached", threshold: 5 },
    reward: null,
  },
  {
    id: "adept-engineer",
    name: "Adept Engineer",
    description: "Reach level 10",
    category: "milestone",
    iconId: "🌟",
    hidden: false,
    condition: { type: "level_reached", threshold: 10 },
    reward: { type: "title", value: "Adept Engineer" },
  },
];

// ─── Repository ──────────────────────────────────────────────────────────────

export class DrizzleAchievementRepository implements AchievementRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getAchievementById(id: string): Promise<Achievement | null> {
    return DEFINED_ACHIEVEMENTS.find((a) => a.id === id) ?? null;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return DEFINED_ACHIEVEMENTS;
  }

  async getPlayerAchievements(playerId: string): Promise<PlayerAchievement[]> {
    const rows = await this.db
      .select()
      .from(schema.playerAchievements)
      .where(eq(schema.playerAchievements.playerId, playerId));

    return rows.map((row) => this.toDomain(row));
  }

  async getPlayerAchievement(
    playerId: string,
    achievementId: string,
  ): Promise<PlayerAchievement | null> {
    const rows = await this.db
      .select()
      .from(schema.playerAchievements)
      .where(
        and(
          eq(schema.playerAchievements.playerId, playerId),
          eq(schema.playerAchievements.achievementId, achievementId),
        ),
      )
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async save(playerAchievement: PlayerAchievement): Promise<PlayerAchievement> {
    const row = this.toPersistence(playerAchievement);

    await this.db.insert(schema.playerAchievements).values(row).onConflictDoUpdate({
      target: schema.playerAchievements.id,
      set: row,
    });

    return playerAchievement;
  }

  async getSeen(playerId: string): Promise<PlayerAchievement[]> {
    const rows = await this.db
      .select()
      .from(schema.playerAchievements)
      .where(
        and(
          eq(schema.playerAchievements.playerId, playerId),
          eq(schema.playerAchievements.seen, 1),
        ),
      );

    return rows.map((row) => this.toDomain(row));
  }

  async markSeen(id: string): Promise<void> {
    await this.db
      .update(schema.playerAchievements)
      .set({ seen: 1 })
      .where(eq(schema.playerAchievements.id, id));
  }

  private toDomain(row: typeof schema.playerAchievements.$inferSelect): PlayerAchievement {
    return {
      id: row.id,
      playerId: row.playerId,
      achievementId: row.achievementId,
      earnedAt: new Date(row.earnedAt),
      seen: row.seen === 1,
    };
  }

  private toPersistence(pa: PlayerAchievement): typeof schema.playerAchievements.$inferInsert {
    return {
      id: pa.id,
      playerId: pa.playerId,
      achievementId: pa.achievementId,
      earnedAt: pa.earnedAt.toISOString(),
      seen: pa.seen ? 1 : 0,
    };
  }
}
