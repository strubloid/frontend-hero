import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type {
  WorldRegion,
  RegionTask,
  RegionAdjacency,
  PlayerRegionProgress,
} from "../domain/world-region";
import type { WorldRegionRepository } from "../domain/world-region-repository";

type DbInstance = BetterSQLite3Database<typeof schema>;

export class DrizzleWorldRegionRepository implements WorldRegionRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  // ─── Region CRUD ──────────────────────────────────────────────

  async getById(id: string): Promise<WorldRegion | null> {
    const rows = await this.db
      .select()
      .from(schema.worldRegions)
      .where(eq(schema.worldRegions.id, id))
      .limit(1);
    return rows[0] ? this.toRegion(rows[0]) : null;
  }

  async getBySubject(subjectId: string): Promise<WorldRegion[]> {
    const rows = await this.db
      .select()
      .from(schema.worldRegions)
      .where(eq(schema.worldRegions.subjectId, subjectId))
      .orderBy(schema.worldRegions.order);
    return rows.map((r) => this.toRegion(r));
  }

  async getByPlayerAndSubject(playerId: string, subjectId: string): Promise<WorldRegion[]> {
    const rows = await this.db
      .select()
      .from(schema.worldRegions)
      .where(eq(schema.worldRegions.subjectId, subjectId))
      .orderBy(schema.worldRegions.order);
    return rows.map((r) => this.toRegion(r));
  }

  async save(region: WorldRegion): Promise<void> {
    const row = this.regionToPersistence(region);
    await this.db.insert(schema.worldRegions).values(row).onConflictDoUpdate({
      target: schema.worldRegions.id,
      set: row,
    });
  }

  async createMany(regions: WorldRegion[]): Promise<void> {
    if (regions.length === 0) return;
    const rows = regions.map((r) => this.regionToPersistence(r));
    await this.db.insert(schema.worldRegions).values(rows);
  }

  async deleteAllBySubject(subjectId: string): Promise<void> {
    await this.db.delete(schema.worldRegions).where(eq(schema.worldRegions.subjectId, subjectId));
  }

  // ─── Task CRUD ────────────────────────────────────────────────

  async getTasksByRegion(regionId: string): Promise<RegionTask[]> {
    const rows = await this.db
      .select()
      .from(schema.regionTasks)
      .where(eq(schema.regionTasks.regionId, regionId))
      .orderBy(schema.regionTasks.order);
    return rows.map((r) => this.toTask(r));
  }

  async getTasksByPlayerAndRegion(playerId: string, regionId: string): Promise<RegionTask[]> {
    // Tasks are not player-specific — always return all tasks for the region
    return this.getTasksByRegion(regionId);
  }

  async saveTask(task: RegionTask): Promise<void> {
    const row = this.taskToPersistence(task);
    await this.db.insert(schema.regionTasks).values(row).onConflictDoUpdate({
      target: schema.regionTasks.id,
      set: row,
    });
  }

  async createManyTasks(tasks: RegionTask[]): Promise<void> {
    if (tasks.length === 0) return;
    const rows = tasks.map((t) => this.taskToPersistence(t));
    await this.db.insert(schema.regionTasks).values(rows);
  }

  async deleteTasksByRegion(regionId: string): Promise<void> {
    await this.db.delete(schema.regionTasks).where(eq(schema.regionTasks.regionId, regionId));
  }

  // ─── Adjacency ────────────────────────────────────────────────

  async getAdjacencyBySubject(subjectId: string): Promise<RegionAdjacency[]> {
    // Join through regions to find adjacencies for a subject
    const rows = await this.db
      .select()
      .from(schema.regionAdjacency)
      .innerJoin(
        schema.worldRegions,
        eq(schema.regionAdjacency.fromRegionId, schema.worldRegions.id),
      )
      .where(eq(schema.worldRegions.subjectId, subjectId));
    return rows.map((r) => this.toAdjacency(r.regionAdjacency));
  }

  async saveAdjacency(adjacency: RegionAdjacency): Promise<void> {
    const row = this.adjacencyToPersistence(adjacency);
    await this.db.insert(schema.regionAdjacency).values(row).onConflictDoUpdate({
      target: schema.regionAdjacency.id,
      set: row,
    });
  }

  async createManyAdjacencies(adjacencies: RegionAdjacency[]): Promise<void> {
    if (adjacencies.length === 0) return;
    const rows = adjacencies.map((a) => this.adjacencyToPersistence(a));
    await this.db.insert(schema.regionAdjacency).values(rows);
  }

  async deleteAdjacenciesBySubject(subjectId: string): Promise<void> {
    const regions = await this.getBySubject(subjectId);
    if (regions.length === 0) return;
    const regionIds = regions.map((r) => r.id);
    for (const id of regionIds) {
      await this.db
        .delete(schema.regionAdjacency)
        .where(and(eq(schema.regionAdjacency.fromRegionId, id)));
      await this.db
        .delete(schema.regionAdjacency)
        .where(and(eq(schema.regionAdjacency.toRegionId, id)));
    }
  }

  // ─── Player Progress ──────────────────────────────────────────

  async getPlayerProgress(
    playerId: string,
    regionId: string,
  ): Promise<PlayerRegionProgress | null> {
    const rows = await this.db
      .select()
      .from(schema.playerRegionProgress)
      .where(
        and(
          eq(schema.playerRegionProgress.playerId, playerId),
          eq(schema.playerRegionProgress.regionId, regionId),
        ),
      )
      .limit(1);
    return rows[0] ? this.toPlayerProgress(rows[0]) : null;
  }

  async getAllPlayerProgress(playerId: string, subjectId: string): Promise<PlayerRegionProgress[]> {
    const rows = await this.db
      .select()
      .from(schema.playerRegionProgress)
      .innerJoin(
        schema.worldRegions,
        eq(schema.playerRegionProgress.regionId, schema.worldRegions.id),
      )
      .where(
        and(
          eq(schema.playerRegionProgress.playerId, playerId),
          eq(schema.worldRegions.subjectId, subjectId),
        ),
      );
    return rows.map((r) => this.toPlayerProgress(r.playerRegionProgress));
  }

  async savePlayerProgress(progress: PlayerRegionProgress): Promise<void> {
    const row = this.playerProgressToPersistence(progress);
    await this.db.insert(schema.playerRegionProgress).values(row).onConflictDoUpdate({
      target: schema.playerRegionProgress.id,
      set: row,
    });
  }

  // ─── Mapping Helpers ──────────────────────────────────────────

  private toRegion(row: typeof schema.worldRegions.$inferSelect): WorldRegion {
    return {
      id: row.id,
      subjectId: row.subjectId,
      name: row.name,
      description: row.description,
      narrative: row.narrative,
      domainName: row.domainName,
      icon: row.icon,
      order: row.order,
      totalTasks: row.totalTasks,
      unlockThresholdPercent: row.unlockThresholdPercent,
      hasBoss: row.hasBoss,
      bossEncounterId: row.bossEncounterId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private regionToPersistence(region: WorldRegion): typeof schema.worldRegions.$inferInsert {
    return {
      id: region.id,
      subjectId: region.subjectId,
      name: region.name,
      description: region.description,
      narrative: region.narrative,
      domainName: region.domainName,
      icon: region.icon,
      order: region.order,
      totalTasks: region.totalTasks,
      unlockThresholdPercent: region.unlockThresholdPercent,
      hasBoss: region.hasBoss,
      bossEncounterId: region.bossEncounterId,
      createdAt: region.createdAt.toISOString(),
      updatedAt: region.updatedAt.toISOString(),
    };
  }

  private toTask(row: typeof schema.regionTasks.$inferSelect): RegionTask {
    return {
      id: row.id,
      regionId: row.regionId,
      order: row.order,
      conceptId: row.conceptId,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      xpReward: row.xpReward,
      required: row.required,
      subjectLevel: row.subjectLevel,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private taskToPersistence(task: RegionTask): typeof schema.regionTasks.$inferInsert {
    return {
      id: task.id,
      regionId: task.regionId,
      order: task.order,
      conceptId: task.conceptId,
      title: task.title,
      description: task.description,
      difficulty: task.difficulty,
      xpReward: task.xpReward,
      required: task.required,
      subjectLevel: task.subjectLevel,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  private toAdjacency(row: typeof schema.regionAdjacency.$inferSelect): RegionAdjacency {
    return {
      id: row.id,
      fromRegionId: row.fromRegionId,
      toRegionId: row.toRegionId,
      bidirectional: row.bidirectional,
      requiredProgressPercent: row.requiredProgressPercent,
    };
  }

  private adjacencyToPersistence(
    adjacency: RegionAdjacency,
  ): typeof schema.regionAdjacency.$inferInsert {
    return {
      id: adjacency.id,
      fromRegionId: adjacency.fromRegionId,
      toRegionId: adjacency.toRegionId,
      bidirectional: adjacency.bidirectional,
      requiredProgressPercent: adjacency.requiredProgressPercent,
    };
  }

  private toPlayerProgress(
    row: typeof schema.playerRegionProgress.$inferSelect,
  ): PlayerRegionProgress {
    return {
      id: row.id,
      playerId: row.playerId,
      regionId: row.regionId,
      completedTaskCount: row.completedTaskCount,
      totalTaskCount: row.totalTaskCount,
      completedTaskIds: JSON.parse(row.completedTaskIds),
      bossDefeated: row.bossDefeated,
      unlocked: row.unlocked,
      completed: row.completed,
      enteredAt: row.enteredAt ? new Date(row.enteredAt) : null,
      updatedAt: new Date(row.updatedAt),
    };
  }

  private playerProgressToPersistence(
    progress: PlayerRegionProgress,
  ): typeof schema.playerRegionProgress.$inferInsert {
    return {
      id: progress.id,
      playerId: progress.playerId,
      regionId: progress.regionId,
      completedTaskCount: progress.completedTaskCount,
      totalTaskCount: progress.totalTaskCount,
      completedTaskIds: JSON.stringify(progress.completedTaskIds),
      bossDefeated: progress.bossDefeated,
      unlocked: progress.unlocked,
      completed: progress.completed,
      enteredAt: progress.enteredAt?.toISOString() ?? null,
      updatedAt: progress.updatedAt.toISOString(),
    };
  }
}
