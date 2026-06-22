import type {
  WorldRegion,
  RegionTask,
  RegionAdjacency,
  PlayerRegionProgress,
} from "./world-region";

/**
 * Repository for world regions, tasks, and player progress.
 */
export interface WorldRegionRepository {
  // ─── Region CRUD ──────────────────────────────────────────────
  getById(id: string): Promise<WorldRegion | null>;
  getBySubject(subjectId: string): Promise<WorldRegion[]>;
  getByPlayerAndSubject(playerId: string, subjectId: string): Promise<WorldRegion[]>;
  save(region: WorldRegion): Promise<void>;
  createMany(regions: WorldRegion[]): Promise<void>;
  deleteAllBySubject(subjectId: string): Promise<void>;

  // ─── Task CRUD ────────────────────────────────────────────────
  getTasksByRegion(regionId: string): Promise<RegionTask[]>;
  getTasksByPlayerAndRegion(playerId: string, regionId: string): Promise<RegionTask[]>;
  saveTask(task: RegionTask): Promise<void>;
  createManyTasks(tasks: RegionTask[]): Promise<void>;
  deleteTasksByRegion(regionId: string): Promise<void>;

  // ─── Adjacency ────────────────────────────────────────────────
  getAdjacencyBySubject(subjectId: string): Promise<RegionAdjacency[]>;
  saveAdjacency(adjacency: RegionAdjacency): Promise<void>;
  createManyAdjacencies(adjacencies: RegionAdjacency[]): Promise<void>;
  deleteAdjacenciesBySubject(subjectId: string): Promise<void>;

  // ─── Player Progress ──────────────────────────────────────────
  getPlayerProgress(playerId: string, regionId: string): Promise<PlayerRegionProgress | null>;
  getAllPlayerProgress(playerId: string, subjectId: string): Promise<PlayerRegionProgress[]>;
  savePlayerProgress(progress: PlayerRegionProgress): Promise<void>;
}
