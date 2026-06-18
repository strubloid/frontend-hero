import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type {
  Concept,
  Domain,
  InterviewPrompt,
  PracticalChallenge,
  QuestionSeed,
  Subject,
  SubjectLevel,
} from "@/modules/subjects/domain/subject";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import * as schema from "@/shared/infrastructure/database/schema";

type DbInstance = BetterSQLite3Database<typeof schema>;

type ConceptRow = typeof schema.concepts.$inferSelect;

export class DrizzleSubjectRepository implements SubjectRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getById(id: string): Promise<Subject | null> {
    const rows = await this.db
      .select()
      .from(schema.subjects)
      .where(eq(schema.subjects.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    const conceptRows = await this.db
      .select()
      .from(schema.concepts)
      .where(eq(schema.concepts.subjectId, id))
      .orderBy(asc(schema.concepts.domainName), asc(schema.concepts.id));

    return this.toDomain(rows[0], conceptRows);
  }

  async findAll(): Promise<Subject[]> {
    const subjectRows = await this.db
      .select()
      .from(schema.subjects)
      .orderBy(asc(schema.subjects.id));
    const subjects: Subject[] = [];

    for (const subjectRow of subjectRows) {
      const conceptRows = await this.db
        .select()
        .from(schema.concepts)
        .where(eq(schema.concepts.subjectId, subjectRow.id))
        .orderBy(asc(schema.concepts.domainName), asc(schema.concepts.id));

      subjects.push(this.toDomain(subjectRow, conceptRows));
    }

    return subjects;
  }

  async save(subject: Subject): Promise<void> {
    if (await this.exists(subject.id)) {
      await this.db
        .update(schema.subjects)
        .set(this.toSubjectPersistence({ ...subject, updatedAt: new Date() }))
        .where(eq(schema.subjects.id, subject.id));
      await this.replaceConcepts(subject);
      return;
    }

    await this.create(subject);
  }

  async create(subject: Subject): Promise<void> {
    if (await this.exists(subject.id)) {
      throw new Error(`Subject already exists: ${subject.id}`);
    }

    await this.db.insert(schema.subjects).values(this.toSubjectPersistence(subject));
    await this.insertConcepts(subject);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.concepts).where(eq(schema.concepts.subjectId, id));
    await this.db.delete(schema.subjects).where(eq(schema.subjects.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: schema.subjects.id })
      .from(schema.subjects)
      .where(eq(schema.subjects.id, id))
      .limit(1);

    return rows.length > 0;
  }

  private async replaceConcepts(subject: Subject): Promise<void> {
    await this.db.delete(schema.concepts).where(eq(schema.concepts.subjectId, subject.id));
    await this.insertConcepts(subject);
  }

  private async insertConcepts(subject: Subject): Promise<void> {
    const concepts = subject.domains.flatMap((domain) => domain.concepts);
    if (concepts.length === 0) return;

    await this.db
      .insert(schema.concepts)
      .values(concepts.map((concept) => this.toConceptPersistence(concept)));
  }

  private toDomain(
    subjectRow: typeof schema.subjects.$inferSelect,
    conceptRows: ConceptRow[],
  ): Subject {
    const domains = new Map<string, Domain>();

    for (const row of conceptRows) {
      const concept = this.toConceptDomain(row);
      const domain = domains.get(concept.domainName) ?? { name: concept.domainName, concepts: [] };
      domain.concepts.push(concept);
      domains.set(concept.domainName, domain);
    }

    return {
      id: subjectRow.id,
      title: subjectRow.title,
      description: subjectRow.description,
      version: subjectRow.version,
      schemaVersion: subjectRow.schemaVersion,
      minimumGameVersion: subjectRow.minimumGameVersion,
      domains: Array.from(domains.values()),
      createdAt: new Date(subjectRow.createdAt),
      updatedAt: new Date(subjectRow.updatedAt),
    };
  }

  private toSubjectPersistence(subject: Subject): typeof schema.subjects.$inferInsert {
    return {
      id: subject.id,
      title: subject.title,
      description: subject.description,
      version: subject.version,
      schemaVersion: subject.schemaVersion,
      minimumGameVersion: subject.minimumGameVersion,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    };
  }

  private toConceptDomain(row: ConceptRow): Concept {
    return {
      id: row.id,
      subjectId: row.subjectId,
      name: row.name,
      domainName: row.domainName,
      level: row.level as SubjectLevel,
      difficulty: row.difficulty,
      prerequisites: this.parseJson<string[]>(row.prerequisites, []),
      tags: this.parseJson<string[]>(row.tags, []),
      outcomes: this.parseJson<string[]>(row.outcomes, []),
      knowledge: row.knowledge,
      commonMisconceptions: this.parseJson<string[]>(row.commonMisconceptions, []),
      examples: this.parseJson<string[]>(row.examples, []),
      questionSeeds: this.parseJson<QuestionSeed[]>(row.questionSeeds, []),
      practicalChallenges: this.parseJson<PracticalChallenge[]>(row.practicalChallenges, []),
      interviewPrompts: this.parseJson<InterviewPrompt[]>(row.interviewPrompts, []),
    };
  }

  private toConceptPersistence(concept: Concept): typeof schema.concepts.$inferInsert {
    return {
      id: concept.id,
      subjectId: concept.subjectId,
      name: concept.name,
      domainName: concept.domainName,
      level: concept.level,
      difficulty: concept.difficulty,
      prerequisites: JSON.stringify(concept.prerequisites),
      tags: JSON.stringify(concept.tags),
      outcomes: JSON.stringify(concept.outcomes),
      knowledge: concept.knowledge,
      commonMisconceptions: JSON.stringify(concept.commonMisconceptions),
      examples: JSON.stringify(concept.examples),
      questionSeeds: JSON.stringify(concept.questionSeeds),
      practicalChallenges: JSON.stringify(concept.practicalChallenges),
      interviewPrompts: JSON.stringify(concept.interviewPrompts),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private parseJson<T>(value: string, fallback: T): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
}
