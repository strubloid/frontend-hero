import { eq, and, sql } from "drizzle-orm";
import * as schema from "@/shared/infrastructure/database/schema";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { Question } from "@/modules/questions/domain/question";
import type Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzleQuestionRepository implements QuestionRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getById(id: string): Promise<Question | null> {
    const rows = await this.db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.toDomain(rows[0]);
  }

  async create(question: Question): Promise<Question> {
    await this.db.insert(schema.questions).values(this.toPersistence(question));
    return question;
  }

  async getByConceptId(conceptId: string): Promise<Question[]> {
    const rows = await this.db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.conceptId, conceptId));

    return rows.map((row) => this.toDomain(row));
  }

  async getRandomBySubjectId(subjectId: string, limit: number): Promise<Question[]> {
    const rows = await this.db
      .select()
      .from(schema.questions)
      .where(eq(schema.questions.subjectId, subjectId))
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    return rows.map((row) => this.toDomain(row));
  }

  async getBySeedAndSubject(seedId: string, subjectId: string): Promise<Question | null> {
    const rows = await this.db
      .select()
      .from(schema.questions)
      .where(and(eq(schema.questions.seedId, seedId), eq(schema.questions.subjectId, subjectId)))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.toDomain(rows[0]);
  }

  private toDomain(row: typeof schema.questions.$inferSelect): Question {
    return {
      id: row.id,
      subjectId: row.subjectId,
      conceptId: row.conceptId ?? "",
      seedId: row.seedId ?? "",
      type: row.type as Question["type"],
      difficulty: row.difficulty,
      stem: row.stem,
      options: JSON.parse(row.options) as string[],
      correctIndex: row.correctIndex,
      explanation: row.explanation,
      timesShown: row.timesShown,
      lastShownAt: row.lastShownAt ? new Date(row.lastShownAt) : null,
      qualityRating: row.qualityRating,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toPersistence(question: Question): typeof schema.questions.$inferInsert {
    return {
      id: question.id,
      subjectId: question.subjectId,
      conceptId: question.conceptId,
      seedId: question.seedId,
      type: question.type,
      difficulty: question.difficulty,
      stem: question.stem,
      options: JSON.stringify(question.options),
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      timesShown: question.timesShown,
      lastShownAt: question.lastShownAt ? question.lastShownAt.toISOString() : null,
      qualityRating: question.qualityRating,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }
}
