import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type { PlayerSubjectProgressEntity } from "../domain/player-subject-progress";
import type { PlayerSubjectProgressRepository } from "../domain/player-subject-progress-repository";
import { SubjectBossStatus } from "../domain/subject-level";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzlePlayerSubjectProgressRepository implements PlayerSubjectProgressRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async findByPlayerAndSubject(
    playerId: string,
    subjectId: string,
  ): Promise<PlayerSubjectProgressEntity | null> {
    const rows = await this.db
      .select()
      .from(schema.playerSubjectProgress)
      .where(
        and(
          eq(schema.playerSubjectProgress.playerId, playerId),
          eq(schema.playerSubjectProgress.subjectId, subjectId),
        ),
      )
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async findByPlayerId(playerId: string): Promise<PlayerSubjectProgressEntity[]> {
    const rows = await this.db
      .select()
      .from(schema.playerSubjectProgress)
      .where(eq(schema.playerSubjectProgress.playerId, playerId));

    return rows.map((row) => this.toDomain(row));
  }

  async save(progress: PlayerSubjectProgressEntity): Promise<PlayerSubjectProgressEntity> {
    const row = this.toPersistence(progress);
    await this.db.insert(schema.playerSubjectProgress).values(row).onConflictDoUpdate({
      target: schema.playerSubjectProgress.id,
      set: row,
    });

    return progress;
  }

  private toDomain(
    row: typeof schema.playerSubjectProgress.$inferSelect,
  ): PlayerSubjectProgressEntity {
    return {
      id: row.id,
      playerId: row.playerId,
      subjectId: row.subjectId,
      currentLevel: row.currentLevel,
      maximumLevel: row.maximumLevel,
      masteryScore: row.masteryScore,
      retentionScore: row.retentionScore,
      successfulEncounterCount: row.successfulEncounterCount,
      reviewEncounterCount: row.reviewEncounterCount,
      practicalEncounterCount: row.practicalEncounterCount,
      distinctStudySessionCount: row.distinctStudySessionCount,
      bossStatus: row.bossStatus as SubjectBossStatus,
      startedAt: new Date(row.startedAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
    };
  }

  private toPersistence(
    progress: PlayerSubjectProgressEntity,
  ): typeof schema.playerSubjectProgress.$inferInsert {
    return {
      id: progress.id,
      playerId: progress.playerId,
      subjectId: progress.subjectId,
      currentLevel: progress.currentLevel,
      maximumLevel: progress.maximumLevel,
      masteryScore: progress.masteryScore,
      retentionScore: progress.retentionScore,
      successfulEncounterCount: progress.successfulEncounterCount,
      reviewEncounterCount: progress.reviewEncounterCount,
      practicalEncounterCount: progress.practicalEncounterCount,
      distinctStudySessionCount: progress.distinctStudySessionCount,
      bossStatus: progress.bossStatus,
      startedAt: progress.startedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString() ?? null,
      updatedAt: new Date().toISOString(),
    };
  }
}
