/**
 * A region (country) on the Frontend Realms world map.
 *
 * Each region represents a major engineering domain with its own set of
 * tasks (encounters) and a boss. Regions are connected by adjacency,
 * and the player must complete ≥80% of tasks in a region to unlock
 * adjacent regions. Completing all tasks triggers the boss encounter.
 */
export interface WorldRegion {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  /** Narrative flavour text shown when the region is first entered */
  narrative: string;
  /** The domain name this region maps to (e.g. "JavaScript Foundations") */
  domainName: string;
  /** Icon/emoji identifier for map display (e.g. "⚡") */
  icon: string;
  /** Order in the world map (1-based) */
  order: number;
  /** Total tasks required in this region */
  totalTasks: number;
  /** Minimum tasks completed (as percentage) to unlock adjacent regions */
  unlockThresholdPercent: number;
  /** Whether this region has a boss encounter */
  hasBoss: boolean;
  /** Boss encounter ID if hasBoss is true */
  bossEncounterId: string | null;
  /** When the region was first created */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * A single task within a region.
 *
 * Each region contains N tasks (typically 10). Tasks are individual
 * encounters or challenges the player must complete to progress
 * through the region.
 */
export interface RegionTask {
  id: string;
  regionId: string;
  /** Order within the region (1-based) */
  order: number;
  /** The concept this task tests */
  conceptId: string;
  /** Human-readable task title */
  title: string;
  /** Short narrative description of the task */
  description: string;
  /** Difficulty level (1-10) */
  difficulty: number;
  /** XP reward for completing this task */
  xpReward: number;
  /** Whether this task is optional or required for completion */
  required: boolean;
  /** The subject level this task draws from */
  subjectLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Adjacency relationship between two regions.
 *
 * Defines which regions are connected on the world map and under
 * what conditions the connection opens.
 */
export interface RegionAdjacency {
  id: string;
  /** Source region ID */
  fromRegionId: string;
  /** Target region ID */
  toRegionId: string;
  /** Whether this connection is directional or bidirectional */
  bidirectional: boolean;
  /** Minimum tasks (as percentage 0-100) needed in the source region to unlock this path */
  requiredProgressPercent: number;
}

/**
 * Player's progress within a single region.
 */
export interface PlayerRegionProgress {
  id: string;
  playerId: string;
  regionId: string;
  /** Number of tasks completed */
  completedTaskCount: number;
  /** Total tasks in the region */
  totalTaskCount: number;
  /** IDs of completed tasks */
  completedTaskIds: string[];
  /** Whether the boss for this region has been defeated */
  bossDefeated: boolean;
  /** Whether this region is unlocked for the player */
  unlocked: boolean;
  /** Whether all tasks are completed (region complete) */
  completed: boolean;
  /** When the player first entered this region */
  enteredAt: Date | null;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * The complete world map state for a player.
 */
export interface PlayerWorldMap {
  playerId: string;
  subjectId: string;
  regions: WorldRegion[];
  progress: Map<string, PlayerRegionProgress>;
  adjacency: RegionAdjacency[];
}
