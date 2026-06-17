/**
 * A player's level and XP progression.
 */
export interface PlayerProgression {
  id: string;
  playerId: string;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * XP award for completing a mission action.
 */
export interface XpAward {
  amount: number;
  reason: string;
  category: XpCategory;
  missionId: string;
  timestamp: Date;
}

export type XpCategory =
  | "correct_answer"
  | "streak_bonus"
  | "difficulty_bonus"
  | "mission_complete"
  | "boss_defeat"
  | "region_unlock"
  | "first_of_day"
  | "achievement";

/**
 * Calculate XP from a mission answer.
 * Base: 10 * difficulty for correct, 5 for incorrect
 * Streak: +5 per consecutive correct (max +20)
 * Hints: -3 per hint used
 * Speed bonus: +5 if under 5 seconds
 */
export function calculateAnswerXp(
  isCorrect: boolean,
  difficulty: number,
  consecutiveCorrect: number,
  hintsUsed: number,
  responseTimeMs: number,
): number {
  if (!isCorrect) return Math.max(2, 5 - hintsUsed * 2);

  const base = 10 * difficulty;
  const streakBonus = Math.min(consecutiveCorrect, 4) * 5;
  const hintPenalty = hintsUsed * 3;
  const speedBonus = responseTimeMs < 5000 ? 5 : 0;

  return Math.max(5, base + streakBonus - hintPenalty + speedBonus);
}

/**
 * Level thresholds.
 * Level 1 = 0 XP. Each level requires more XP than the last.
 */
export const LEVEL_THRESHOLDS: number[] = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  500, // Level 4
  800, // Level 5
  1200, // Level 6
  1700, // Level 7
  2300, // Level 8
  3000, // Level 9
  4000, // Level 10
  5200, // Level 11
  6600, // Level 12
  8200, // Level 13
  10000, // Level 14
  12000, // Level 15
];

/**
 * Calculate the level for a given total XP.
 */
export function xpToLevel(totalXp: number): { level: number; xpToNext: number } {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      const level = i + 1;
      const nextThreshold = LEVEL_THRESHOLDS[i + 1];
      const xpToNext = nextThreshold ? nextThreshold - totalXp : 0;
      return { level, xpToNext };
    }
  }
  return { level: 1, xpToNext: LEVEL_THRESHOLDS[1] };
}

/**
 * Add XP to progression, returning the updated progression
 * and any levels gained.
 */
export function addXp(
  progression: PlayerProgression,
  amount: number,
): {
  progression: PlayerProgression;
  levelsGained: number;
  newLevel: number;
} {
  const oldLevel = progression.level;
  const totalXp = progression.totalXpEarned + amount;
  const { level, xpToNext } = xpToLevel(totalXp);

  return {
    progression: {
      ...progression,
      currentXp: totalXp,
      xpToNextLevel: xpToNext,
      totalXpEarned: totalXp,
      level,
      updatedAt: new Date(),
    },
    levelsGained: level - oldLevel,
    newLevel: level,
  };
}
