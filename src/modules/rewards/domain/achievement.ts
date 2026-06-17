/**
 * An achievement the player can earn.
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  /** Icon identifier for rendering */
  iconId: string;
  /** Hidden achievements don't show until earned */
  hidden: boolean;
  /** The conditions to check */
  condition: AchievementCondition;
  /** Reward granted on earning */
  reward: RewardGrant | null;
}

export type AchievementCategory =
  | "milestone"
  | "mastery"
  | "streak"
  | "challenge"
  | "exploration"
  | "hidden";

/**
 * Conditions for unlocking an achievement.
 */
export interface AchievementCondition {
  type: AchievementConditionType;
  /** Target value to reach */
  threshold: number;
  /** Optional concept or mission type filter */
  filter?: string;
}

export type AchievementConditionType =
  | "concepts_mastered"
  | "missions_completed"
  | "correct_answers"
  | "streak_days"
  | "level_reached"
  | "bosses_defeated"
  | "regions_unlocked"
  | "total_xp"
  | "perfect_mission"
  | "speed_demon"
  | "persistence"
  | "region_complete";

/**
 * A reward granted when an achievement is unlocked.
 */
export interface RewardGrant {
  type: "title" | "cosmetic" | "xp_bonus";
  value: string; // title name, cosmetic id, or XP amount
}

/**
 * An achievement earned by a specific player.
 */
export interface PlayerAchievement {
  id: string;
  playerId: string;
  achievementId: string;
  earnedAt: Date;
  seen: boolean; // has the player viewed this?
}

/**
 * A title the player can display.
 */
export interface PlayerTitle {
  id: string;
  playerId: string;
  title: string;
  equipped: boolean;
  earnedAt: Date;
}

/**
 * Check whether a player has earned an achievement based on their stats.
 */
export function checkAchievementCondition(
  condition: AchievementCondition,
  stats: PlayerAchievementStats,
): boolean {
  switch (condition.type) {
    case "concepts_mastered":
      return stats.conceptsMastered >= condition.threshold;
    case "missions_completed":
      return stats.missionsCompleted >= condition.threshold;
    case "correct_answers":
      return stats.correctAnswers >= condition.threshold;
    case "streak_days":
      return stats.longestStreak >= condition.threshold;
    case "level_reached":
      return stats.level >= condition.threshold;
    case "bosses_defeated":
      return stats.bossesDefeated >= condition.threshold;
    case "regions_unlocked":
      return stats.regionsUnlocked >= condition.threshold;
    case "total_xp":
      return stats.totalXp >= condition.threshold;
    case "perfect_mission":
      return stats.perfectMissions >= condition.threshold;
    case "speed_demon":
      return stats.speedDemonAnswers >= condition.threshold;
    case "persistence":
      return stats.totalAttempts >= condition.threshold;
    case "region_complete":
      return stats.regionsCompleted >= condition.threshold;
    default:
      return false;
  }
}

/**
 * Aggregate stats used for achievement checking.
 */
export interface PlayerAchievementStats {
  conceptsMastered: number;
  missionsCompleted: number;
  correctAnswers: number;
  longestStreak: number;
  level: number;
  bossesDefeated: number;
  regionsUnlocked: number;
  totalXp: number;
  perfectMissions: number;
  speedDemonAnswers: number;
  totalAttempts: number;
  regionsCompleted: number;
}
