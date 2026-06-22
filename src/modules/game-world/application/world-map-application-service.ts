import type Database from "better-sqlite3";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import type { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import type { WorldRegionRepository } from "../domain/world-region-repository";
import { RegionFactory } from "./region-factory";
import type { WorldRegion, RegionTask, PlayerRegionProgress } from "../domain/world-region";

/**
 * Result shape for the world map display.
 */
export interface WorldMapDisplayRegion {
  id: string;
  name: string;
  icon: string;
  description: string;
  narrative: string;
  order: number;
  status: "locked" | "available" | "in-progress" | "completed";
  progress: number; // 0-100
  totalTasks: number;
  completedTasks: number;
  hasBoss: boolean;
  bossDefeated: boolean;
  unlocked: boolean;
}

export interface WorldMapDisplay {
  regions: WorldMapDisplayRegion[];
  progress: {
    totalRegions: number;
    unlockedRegions: number;
    completedRegions: number;
    currentRegionId: string | null;
    nextRegionId: string | null;
  };
  subjectTitle: string;
}

/**
 * Application service for the world map.
 *
 * Orchestrates region seeding (creating regions from subject data),
 * retrieval with player progress overlay, and unlock calculations.
 *
 * Dependencies are injected through the constructor — not self-created.
 */
export class WorldMapApplicationService {
  private readonly regionRepo: WorldRegionRepository;
  private readonly subjectRepo: SubjectRepository;
  private readonly masteryRepo: MasteryRepository;
  private readonly factory: RegionFactory;

  constructor(
    regionRepo: WorldRegionRepository,
    subjectRepo: SubjectRepository,
    masteryRepo: MasteryRepository,
  ) {
    this.regionRepo = regionRepo;
    this.subjectRepo = subjectRepo;
    this.masteryRepo = masteryRepo;
    this.factory = new RegionFactory();
  }

  /**
   * Ensure regions exist for a subject. Seeds them from subject data if not present.
   */
  async ensureRegions(playerId: string, subjectId: string): Promise<void> {
    const existing = await this.regionRepo.getBySubject(subjectId);
    if (existing.length > 0) return;

    const subject = await this.subjectRepo.getById(subjectId);
    if (!subject) throw new Error(`Subject not found: ${subjectId}`);

    // Create regions
    const regions = this.factory.createRegions(subject);
    await this.regionRepo.createMany(regions);

    // Create tasks for each region
    const allConcepts = subject.domains.flatMap((d) => d.concepts);
    const levelDefs = subject.progression?.levels ?? [];
    for (const region of regions) {
      const tasks = this.factory.createTasks(region, allConcepts, [...levelDefs]);
      await this.regionRepo.createManyTasks(tasks);
    }

    // Create adjacency links
    const adjacency = this.factory.createAdjacencies(regions);
    await this.regionRepo.createManyAdjacencies(adjacency);

    // Create player progress entries
    const playerProgress = this.factory.createPlayerProgress(playerId, regions);
    for (const pp of playerProgress) {
      await this.regionRepo.savePlayerProgress(pp);
    }
  }

  /**
   * Get the world map display data for a player.
   */
  async getWorldMap(playerId: string, subjectId: string): Promise<WorldMapDisplay> {
    await this.ensureRegions(playerId, subjectId);

    const regions = await this.regionRepo.getBySubject(subjectId);
    const allProgress = await this.regionRepo.getAllPlayerProgress(playerId, subjectId);
    const subject = await this.subjectRepo.getById(subjectId);
    const masteries = (await this.masteryRepo.getByPlayerAndSubject(playerId, subjectId)) ?? [];

    const masteryMap = new Map(masteries.map((m) => [m.conceptId, m]));

    // Build progress map
    const progressMap = new Map(allProgress.map((p) => [p.regionId, p]));

    // Determine region statuses and calculate unlocks based on task completion
    const displayRegions: WorldMapDisplayRegion[] = regions.map((region) => {
      const progress = progressMap.get(region.id);

      // Calculate status based on progress and unlocks
      const isUnlocked = progress?.unlocked ?? false;
      const isCompleted = progress?.completed ?? false;
      const bossDefeated = progress?.bossDefeated ?? false;
      const completedTasks = progress?.completedTaskCount ?? 0;
      const totalTasks = region.totalTasks;

      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      let status: "locked" | "available" | "in-progress" | "completed";
      if (!isUnlocked) {
        status = "locked";
      } else if (isCompleted || (bossDefeated && progressPercent >= 100)) {
        status = "completed";
      } else if (completedTasks > 0) {
        status = "in-progress";
      } else {
        status = "available";
      }

      return {
        id: region.id,
        name: region.name,
        icon: region.icon,
        description: region.description,
        narrative: region.narrative,
        order: region.order,
        status,
        progress: progressPercent,
        totalTasks,
        completedTasks,
        hasBoss: region.hasBoss,
        bossDefeated,
        unlocked: isUnlocked,
      };
    });

    // Calculate adjacency-based unlock progression
    await this.updateUnlocks(regions, allProgress);

    // Refresh progress after unlock updates
    const updatedProgress = await this.regionRepo.getAllPlayerProgress(playerId, subjectId);
    const unlockedRegions = updatedProgress.filter((p) => p.unlocked).length;
    const completedRegions = updatedProgress.filter((p) => p.completed).length;

    // Find current and next region
    const sorted = [...displayRegions].sort((a, b) => a.order - b.order);
    let currentRegionId: string | null = null;
    let nextRegionId: string | null = null;

    for (const r of sorted) {
      if (r.status === "available" || r.status === "in-progress") {
        if (!currentRegionId) currentRegionId = r.id;
      } else if (r.status === "locked" && currentRegionId) {
        nextRegionId = r.id;
        break;
      }
    }

    // If no current found, next is the first locked
    if (!currentRegionId) {
      nextRegionId = sorted.find((r) => r.status === "locked")?.id ?? null;
    }

    return {
      regions: displayRegions,
      progress: {
        totalRegions: regions.length,
        unlockedRegions,
        completedRegions,
        currentRegionId,
        nextRegionId,
      },
      subjectTitle: subject?.title ?? "Unknown Subject",
    };
  }

  /**
   * Update unlocks based on adjacency and progress.
   */
  private async updateUnlocks(
    regions: WorldRegion[],
    allProgress: PlayerRegionProgress[],
  ): Promise<void> {
    const progressMap = new Map(allProgress.map((p) => [p.regionId, p]));
    const adjacency = await this.regionRepo.getAdjacencyBySubject(regions[0]?.subjectId ?? "");

    for (const link of adjacency) {
      const fromProgress = progressMap.get(link.fromRegionId);
      if (!fromProgress) continue;

      const toProgress = progressMap.get(link.toRegionId);
      if (!toProgress || toProgress.unlocked) continue;

      // Check if source region has enough progress to unlock the target
      const fromPercent =
        fromProgress.totalTaskCount > 0
          ? Math.round((fromProgress.completedTaskCount / fromProgress.totalTaskCount) * 100)
          : 0;

      if (fromPercent >= link.requiredProgressPercent) {
        toProgress.unlocked = true;
        toProgress.enteredAt = toProgress.enteredAt ?? new Date();
        await this.regionRepo.savePlayerProgress(toProgress);
      }
    }
  }

  /**
   * Get tasks for a specific region.
   */
  async getRegionTasks(playerId: string, regionId: string): Promise<RegionTask[]> {
    return this.regionRepo.getTasksByRegion(regionId);
  }

  /**
   * Get a specific region with player progress.
   */
  async getRegionWithProgress(
    playerId: string,
    regionId: string,
  ): Promise<{ region: WorldRegion; progress: PlayerRegionProgress | null } | null> {
    const region = await this.regionRepo.getById(regionId);
    if (!region) return null;

    const progress = await this.regionRepo.getPlayerProgress(playerId, regionId);
    return { region, progress };
  }

  /**
   * Mark a task as completed for a player.
   */
  async completeTask(playerId: string, regionId: string, taskId: string): Promise<void> {
    const progress = await this.regionRepo.getPlayerProgress(playerId, regionId);
    if (!progress) {
      // Create progress entry if it doesn't exist
      const region = await this.regionRepo.getById(regionId);
      if (!region) throw new Error(`Region not found: ${regionId}`);

      const newProgress = this.factory.createPlayerProgress(playerId, [region])[0];
      newProgress.unlocked = true;
      newProgress.enteredAt = new Date();
      newProgress.completedTaskIds = [taskId];
      newProgress.completedTaskCount = 1;
      newProgress.completed = 1 >= region.totalTasks; // only if all tasks done
      await this.regionRepo.savePlayerProgress(newProgress);
      return;
    }

    // Don't double-count
    if (progress.completedTaskIds.includes(taskId)) return;

    progress.completedTaskIds.push(taskId);
    progress.completedTaskCount = progress.completedTaskIds.length;

    // Check if all tasks are completed
    const totalTasks = progress.totalTaskCount;
    progress.completed = progress.completedTaskCount >= totalTasks;

    progress.updatedAt = new Date();
    await this.regionRepo.savePlayerProgress(progress);
  }
}
