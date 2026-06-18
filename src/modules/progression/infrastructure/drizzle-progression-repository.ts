import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type { PlayerProgression } from "../domain/player-progression";
import type { ProgressionRepository } from "../domain/progression-repository";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzleProgressionRepository implements ProgressionRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getByPlayerId(playerId: string): Promise<PlayerProgression | null> {
    const rows = await this.db
      .select()
      .from(schema.playerProgression)
      .where(eq(schema.playerProgression.playerId, playerId))
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async save(progression: PlayerProgression): Promise<PlayerProgression> {
    const row = this.toPersistence(progression);
    await this.db.insert(schema.playerProgression).values(row).onConflictDoUpdate({
      target: schema.playerProgression.id,
      set: row,
    });

    return progression;
  }

  async create(progression: PlayerProgression): Promise<PlayerProgression> {
    const row = this.toPersistence(progression);
    await this.db.insert(schema.playerProgression).values(row);

    return progression;
  }

  private toDomain(row: typeof schema.playerProgression.$inferSelect): PlayerProgression {
    return {
      id: row.id,
      playerId: row.playerId,
      level: row.level,
      currentXp: row.currentXp,
      xpToNextLevel: row.xpToNextLevel,
      totalXpEarned: row.totalXpEarned,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toPersistence(
    progression: PlayerProgression,
  ): typeof schema.playerProgression.$inferInsert {
    return {
      id: progression.id,
      playerId: progression.playerId,
      level: progression.level,
      currentXp: progression.currentXp,
      xpToNextLevel: progression.xpToNextLevel,
      totalXpEarned: progression.totalXpEarned,
      createdAt: progression.createdAt.toISOString(),
      updatedAt: progression.updatedAt.toISOString(),
    };
  }
}
