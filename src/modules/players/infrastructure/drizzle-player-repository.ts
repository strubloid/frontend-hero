import { eq } from "drizzle-orm";
import * as schema from "@/shared/infrastructure/database/schema";
import type { PlayerRepository } from "@/modules/players/domain/player-repository";
import type { Player } from "@/modules/players/domain/player";
import type Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzlePlayerRepository implements PlayerRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getById(id: string): Promise<Player | null> {
    const rows = await this.db
      .select()
      .from(schema.players)
      .where(eq(schema.players.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.toDomain(rows[0]);
  }

  async create(player: Player): Promise<Player> {
    await this.db.insert(schema.players).values(this.toPersistence(player));

    return player;
  }

  async save(player: Player): Promise<Player> {
    await this.db
      .update(schema.players)
      .set(this.toPersistence(player))
      .where(eq(schema.players.id, player.id));

    return player;
  }

  private toDomain(row: typeof schema.players.$inferSelect): Player {
    return {
      id: row.id,
      name: row.name,
      level: row.level,
      experiencePoints: row.experiencePoints,
      masteryPoints: row.masteryPoints,
      currentSubjectId: row.currentSubjectId ?? null,
      currentRegionId: row.currentRegionId ?? null,
      lastActiveAt: row.lastActiveAt ? new Date(row.lastActiveAt) : null,
      lastReturnBonusClaimedAt: row.lastReturnBonusClaimedAt
        ? new Date(row.lastReturnBonusClaimedAt)
        : null,
      selectedTitle: row.selectedTitle ?? null,
      selectedTheme: row.selectedTheme ?? null,
      workshopTier: row.workshopTier,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toPersistence(player: Player): typeof schema.players.$inferInsert {
    return {
      id: player.id,
      name: player.name,
      level: player.level,
      experiencePoints: player.experiencePoints,
      masteryPoints: player.masteryPoints,
      currentSubjectId: player.currentSubjectId,
      currentRegionId: player.currentRegionId,
      lastActiveAt: player.lastActiveAt?.toISOString() ?? null,
      lastReturnBonusClaimedAt: player.lastReturnBonusClaimedAt?.toISOString() ?? null,
      selectedTitle: player.selectedTitle,
      selectedTheme: player.selectedTheme,
      workshopTier: player.workshopTier,
      createdAt: player.createdAt.toISOString(),
      updatedAt: player.updatedAt.toISOString(),
    };
  }
}
