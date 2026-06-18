import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type { ConceptMastery, DemonstratedContext } from "../domain/concept-mastery";
import type { MasteryRepository } from "../domain/mastery-repository";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzleMasteryRepository implements MasteryRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ConceptMastery | null> {
    const rows = await this.db
      .select()
      .from(schema.conceptMastery)
      .where(
        and(
          eq(schema.conceptMastery.playerId, playerId),
          eq(schema.conceptMastery.conceptId, conceptId),
        ),
      )
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async getByPlayerAndSubject(playerId: string, subjectId: string): Promise<ConceptMastery[]> {
    const rows = await this.db
      .select()
      .from(schema.conceptMastery)
      .where(
        and(
          eq(schema.conceptMastery.playerId, playerId),
          eq(schema.conceptMastery.subjectId, subjectId),
        ),
      );

    return rows.map((row) => this.toDomain(row));
  }

  async getByPlayer(playerId: string): Promise<ConceptMastery[]> {
    const rows = await this.db
      .select()
      .from(schema.conceptMastery)
      .where(eq(schema.conceptMastery.playerId, playerId));

    return rows.map((row) => this.toDomain(row));
  }

  async save(mastery: ConceptMastery): Promise<ConceptMastery> {
    const row = this.toPersistence(mastery);
    await this.db.insert(schema.conceptMastery).values(row).onConflictDoUpdate({
      target: schema.conceptMastery.id,
      set: row,
    });

    return mastery;
  }

  async delete(playerId: string, conceptId: string): Promise<void> {
    await this.db
      .delete(schema.conceptMastery)
      .where(
        and(
          eq(schema.conceptMastery.playerId, playerId),
          eq(schema.conceptMastery.conceptId, conceptId),
        ),
      );
  }

  private toDomain(row: typeof schema.conceptMastery.$inferSelect): ConceptMastery {
    return {
      id: row.id,
      playerId: row.playerId,
      conceptId: row.conceptId,
      subjectId: row.subjectId,
      masteryScore: row.masteryScore,
      confidenceScore: row.confidenceScore,
      retentionScore: row.retentionScore,
      correctAttempts: row.correctAttempts,
      incorrectAttempts: row.incorrectAttempts,
      consecutiveCorrectAnswers: row.consecutiveCorrectAnswers,
      lastAttemptedAt: row.lastAttemptedAt ? new Date(row.lastAttemptedAt) : null,
      nextReviewAt: row.nextReviewAt ? new Date(row.nextReviewAt) : null,
      demonstratedContexts: parseDemonstratedContexts(row.demonstratedContexts),
      commonMistakes: parseJson<string[]>(row.commonMistakes, []),
    };
  }

  private toPersistence(mastery: ConceptMastery): typeof schema.conceptMastery.$inferInsert {
    return {
      id: mastery.id,
      playerId: mastery.playerId,
      conceptId: mastery.conceptId,
      subjectId: mastery.subjectId,
      masteryScore: mastery.masteryScore,
      confidenceScore: mastery.confidenceScore,
      retentionScore: mastery.retentionScore,
      correctAttempts: mastery.correctAttempts,
      incorrectAttempts: mastery.incorrectAttempts,
      consecutiveCorrectAnswers: mastery.consecutiveCorrectAnswers,
      lastAttemptedAt: mastery.lastAttemptedAt?.toISOString() ?? null,
      nextReviewAt: mastery.nextReviewAt?.toISOString() ?? null,
      demonstratedContexts: JSON.stringify(mastery.demonstratedContexts),
      commonMistakes: JSON.stringify(mastery.commonMistakes),
    };
  }
}

function parseDemonstratedContexts(value: string): DemonstratedContext[] {
  return parseJson<DemonstratedContext[]>(value, []).map((context) => ({
    ...context,
    demonstratedAt: new Date(context.demonstratedAt),
  }));
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
