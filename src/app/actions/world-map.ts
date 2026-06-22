"use server";

import { auth } from "@/modules/authentication/infrastructure/auth.config";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";
import { DrizzleWorldRegionRepository } from "@/modules/game-world/infrastructure/drizzle-world-region-repository";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import { DrizzleMasteryRepository } from "@/modules/mastery/infrastructure/drizzle-mastery-repository";
import { WorldMapApplicationService } from "@/modules/game-world/application/world-map-application-service";
import type { WorldMapDisplay } from "@/modules/game-world/application/world-map-application-service";

function createWorldMapService() {
  const sqlite = getSqliteConnection();
  return new WorldMapApplicationService(
    new DrizzleWorldRegionRepository(sqlite),
    new DrizzleSubjectRepository(sqlite),
    new DrizzleMasteryRepository(sqlite),
  );
}

/**
 * Load the world map for the currently authenticated user.
 */
export async function loadWorldMap(subjectId: string = "nextjs"): Promise<WorldMapDisplay | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const service = createWorldMapService();
    return await service.getWorldMap(session.user.id, subjectId);
  } catch (err) {
    console.error("Failed to load world map:", err);
    return null;
  }
}

/**
 * Get tasks for a specific region.
 */
export async function loadRegionTasks(regionId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const service = createWorldMapService();
    return await service.getRegionTasks(session.user.id, regionId);
  } catch (err) {
    console.error("Failed to load region tasks:", err);
    return null;
  }
}

/**
 * Get a specific region with player progress.
 */
export async function loadRegionWithProgress(regionId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const service = createWorldMapService();
    return await service.getRegionWithProgress(session.user.id, regionId);
  } catch (err) {
    console.error("Failed to load region:", err);
    return null;
  }
}

/**
 * Ensure regions are seeded for a subject (called on first access).
 */
export async function ensureWorldRegions(subjectId: string = "nextjs"): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  try {
    const service = createWorldMapService();
    await service.ensureRegions(session.user.id, subjectId);
  } catch (err) {
    console.error("Failed to ensure world regions:", err);
  }
}
