import { and, eq, gt, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type { ReviewRepository } from "../domain/review-repository";
import type { ReviewSchedule } from "../domain/review-schedule";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzleReviewRepository implements ReviewRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ReviewSchedule | null> {
    const rows = await this.db
      .select()
      .from(schema.reviewSchedules)
      .where(
        and(
          eq(schema.reviewSchedules.playerId, playerId),
          eq(schema.reviewSchedules.conceptId, conceptId),
        ),
      )
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async getByPlayerAndSubject(playerId: string, subjectId: string): Promise<ReviewSchedule[]> {
    const rows = await this.db
      .select()
      .from(schema.reviewSchedules)
      .where(
        and(
          eq(schema.reviewSchedules.playerId, playerId),
          eq(schema.reviewSchedules.subjectId, subjectId),
        ),
      );

    return rows.map((row) => this.toDomain(row));
  }

  async getOverdueReviews(playerId: string, before: Date): Promise<ReviewSchedule[]> {
    const rows = await this.db
      .select()
      .from(schema.reviewSchedules)
      .where(
        and(
          eq(schema.reviewSchedules.playerId, playerId),
          lte(schema.reviewSchedules.nextReviewAt, before.toISOString()),
        ),
      );

    return rows.filter((row) => row.nextReviewAt !== null).map((row) => this.toDomain(row));
  }

  async getDueReviews(playerId: string, before: Date): Promise<ReviewSchedule[]> {
    const oneDayBefore = new Date(before.getTime() - 24 * 60 * 60 * 1000);
    const rows = await this.db
      .select()
      .from(schema.reviewSchedules)
      .where(
        and(
          eq(schema.reviewSchedules.playerId, playerId),
          lte(schema.reviewSchedules.nextReviewAt, before.toISOString()),
          gt(schema.reviewSchedules.nextReviewAt, oneDayBefore.toISOString()),
        ),
      );

    return rows.filter((row) => row.nextReviewAt !== null).map((row) => this.toDomain(row));
  }

  async save(schedule: ReviewSchedule): Promise<ReviewSchedule> {
    const row = this.toPersistence(schedule);
    await this.db.insert(schema.reviewSchedules).values(row).onConflictDoUpdate({
      target: schema.reviewSchedules.id,
      set: row,
    });

    return schedule;
  }

  async delete(playerId: string, conceptId: string): Promise<void> {
    await this.db
      .delete(schema.reviewSchedules)
      .where(
        and(
          eq(schema.reviewSchedules.playerId, playerId),
          eq(schema.reviewSchedules.conceptId, conceptId),
        ),
      );
  }

  private toDomain(row: typeof schema.reviewSchedules.$inferSelect): ReviewSchedule {
    return {
      id: row.id,
      playerId: row.playerId,
      conceptId: row.conceptId,
      subjectId: row.subjectId,
      easinessFactor: row.easinessFactor,
      intervalDays: row.intervalDays,
      repetitions: row.repetitions,
      lastReviewedAt: row.lastReviewedAt ? new Date(row.lastReviewedAt) : null,
      nextReviewAt: row.nextReviewAt ? new Date(row.nextReviewAt) : null,
      qualityScore: row.qualityScore,
      totalReviews: row.totalReviews,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toPersistence(schedule: ReviewSchedule): typeof schema.reviewSchedules.$inferInsert {
    return {
      id: schedule.id,
      playerId: schedule.playerId,
      conceptId: schedule.conceptId,
      subjectId: schedule.subjectId,
      easinessFactor: schedule.easinessFactor,
      intervalDays: schedule.intervalDays,
      repetitions: schedule.repetitions,
      lastReviewedAt: schedule.lastReviewedAt?.toISOString() ?? null,
      nextReviewAt: schedule.nextReviewAt?.toISOString() ?? null,
      qualityScore: schedule.qualityScore,
      totalReviews: schedule.totalReviews,
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    };
  }
}
