import { eq, and, desc } from "drizzle-orm";
import * as schema from "@/shared/infrastructure/database/schema";
import type {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import type { Mission, MissionAttempt } from "@/modules/missions/domain/mission";
import type Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzleMissionRepository implements MissionRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getById(id: string): Promise<Mission | null> {
    const rows = await this.db
      .select()
      .from(schema.missions)
      .where(eq(schema.missions.id, id))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.toDomain(rows[0]);
  }

  async create(mission: Mission): Promise<Mission> {
    await this.db.insert(schema.missions).values(this.toPersistence(mission));
    return mission;
  }

  async save(mission: Mission): Promise<Mission> {
    await this.db
      .update(schema.missions)
      .set(this.toPersistence(mission))
      .where(eq(schema.missions.id, mission.id));
    return mission;
  }

  async getActiveByPlayer(playerId: string): Promise<Mission | null> {
    const rows = await this.db
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.playerId, playerId), eq(schema.missions.status, "active")))
      .orderBy(desc(schema.missions.startedAt))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return this.toDomain(rows[0]);
  }

  async getCompletedByPlayer(playerId: string): Promise<Mission[]> {
    const rows = await this.db
      .select()
      .from(schema.missions)
      .where(and(eq(schema.missions.playerId, playerId), eq(schema.missions.status, "completed")));

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: typeof schema.missions.$inferSelect): Mission {
    return {
      id: row.id,
      playerId: row.playerId,
      subjectId: row.subjectId,
      type: row.type as Mission["type"],
      status: row.status as Mission["status"],
      questionIds: JSON.parse(row.questionIds) as string[],
      currentQuestionIndex: row.currentQuestionIndex,
      score: row.score,
      maxScore: row.maxScore,
      startedAt: new Date(row.startedAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toPersistence(mission: Mission): typeof schema.missions.$inferInsert {
    return {
      id: mission.id,
      playerId: mission.playerId,
      subjectId: mission.subjectId,
      type: mission.type,
      status: mission.status,
      questionIds: JSON.stringify(mission.questionIds),
      currentQuestionIndex: mission.currentQuestionIndex,
      score: mission.score,
      maxScore: mission.maxScore,
      startedAt: mission.startedAt.toISOString(),
      completedAt: mission.completedAt ? mission.completedAt.toISOString() : null,
      createdAt: mission.createdAt.toISOString(),
      updatedAt: mission.updatedAt.toISOString(),
    };
  }
}

export class DrizzleMissionAttemptRepository implements MissionAttemptRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async create(attempt: MissionAttempt): Promise<MissionAttempt> {
    await this.db.insert(schema.missionAttempts).values(this.toPersistence(attempt));
    return attempt;
  }

  async getByMission(missionId: string): Promise<MissionAttempt[]> {
    const rows = await this.db
      .select()
      .from(schema.missionAttempts)
      .where(eq(schema.missionAttempts.missionId, missionId));

    return rows.map((row) => this.toDomain(row));
  }

  async getByPlayer(playerId: string): Promise<MissionAttempt[]> {
    const rows = await this.db
      .select()
      .from(schema.missionAttempts)
      .where(eq(schema.missionAttempts.playerId, playerId));

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: typeof schema.missionAttempts.$inferSelect): MissionAttempt {
    return {
      id: row.id,
      missionId: row.missionId,
      playerId: row.playerId,
      questionId: row.questionId,
      selectedIndex: row.selectedIndex,
      isCorrect: row.isCorrect === 1,
      timeSpentSeconds: row.timeSpentSeconds,
      hintsUsed: row.hintsUsed,
      attemptedAt: new Date(row.attemptedAt),
    };
  }

  private toPersistence(attempt: MissionAttempt): typeof schema.missionAttempts.$inferInsert {
    return {
      id: attempt.id,
      missionId: attempt.missionId,
      playerId: attempt.playerId,
      questionId: attempt.questionId,
      selectedIndex: attempt.selectedIndex,
      isCorrect: attempt.isCorrect ? 1 : 0,
      timeSpentSeconds: attempt.timeSpentSeconds,
      hintsUsed: attempt.hintsUsed,
      attemptedAt: attempt.attemptedAt.toISOString(),
    };
  }
}
