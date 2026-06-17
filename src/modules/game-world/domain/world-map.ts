import { Region } from "./region";

/**
 * The world map aggregate — the player's view of all regions
 * and their unlock status.
 */
export interface WorldMap {
  id: string;
  playerId: string;
  subjectId: string;
  regions: Region[];
  /** The highest region order the player has access to */
  currentRegionOrder: number;
  /** When the world map was first created */
  createdAt: Date;
  /** Last time the map was updated */
  updatedAt: Date;
}

/**
 * Result of checking unlock eligibility for a region.
 */
export interface UnlockCheckResult {
  regionId: string;
  regionName: string;
  unlocked: boolean;
  blockedBy: string[]; // concept IDs that don't meet the threshold
  requiredMastery: number;
}

/**
 * Progress summary across all regions.
 */
export interface WorldMapProgress {
  totalRegions: number;
  unlockedRegions: number;
  completedRegions: number; // boss defeated
  currentRegionId: string | null;
  nextRegionId: string | null;
}
