/**
 * Core types for per-subject level progression.
 *
 * Every subject defines its own campaign of levels (1–X).
 * Player level and subject level are independent systems.
 */

import type { Subject } from "./subject";

// ---------------------------------------------------------------------------
// Subject Progression — metadata defined in the subject file
// ---------------------------------------------------------------------------

/**
 * Progression configuration embedded in a subject definition.
 */
export interface SubjectProgression {
  readonly minimumLevel: number;
  readonly maximumLevel: number;
  readonly estimatedDaysPerLevel: number;
  readonly bossRequired: boolean;
  readonly levels: readonly SubjectLevelDefinition[];
}

/**
 * Definition of a single subject level (e.g., "Level 3 — Component Boundaries").
 */
export interface SubjectLevelDefinition {
  readonly level: number;
  readonly title: string;
  readonly description: string;
  readonly difficultyRange: DifficultyRange;
  readonly requiredMastery: number;
  readonly requiredSuccessfulEncounters: number;
  readonly requiredReviewEncounters: number;
  readonly concepts: readonly string[];
  readonly allowedChallengeTypes: readonly string[];
  readonly introduction?: string;
}

export interface DifficultyRange {
  readonly minimum: number;
  readonly maximum: number;
}

// ---------------------------------------------------------------------------
// Requirement evaluators — per-level gate checks
// ---------------------------------------------------------------------------

/**
 * Aggregated requirements that a player must meet to advance a subject level.
 */
export interface SubjectLevelRequirements {
  readonly minimumSuccessfulEncounters: number;
  readonly minimumDistinctConceptCoverage: number;
  readonly minimumMasteryScore: number;
  readonly minimumRetentionScore: number;
  readonly minimumReviewEncounters: number;
  readonly minimumPracticalEncounters: number;
  readonly minimumExplanationEncounters: number;
  readonly minimumDistinctStudySessions: number;
  readonly criticalConceptMinimumScore: number;
  readonly bossRequired: boolean;
}

/**
 * Result of evaluating readiness for level advancement.
 */
export interface LevelReadinessResult {
  readonly level: number;
  readonly isReady: boolean;
  readonly requirements: LevelRequirementResult[];
  readonly overallMasteryScore: number;
  readonly overallRetentionScore: number;
  readonly conceptCoveragePercentage: number;
  readonly totalEncountersCompleted: number;
  readonly totalReviewsCompleted: number;
}

export interface LevelRequirementResult {
  readonly name: string;
  readonly met: boolean;
  readonly current: number;
  readonly required: number;
  readonly details?: string;
}

// ---------------------------------------------------------------------------
// Subject boss configuration
// ---------------------------------------------------------------------------

export interface SubjectBossConfig {
  readonly bossDefeated: boolean;
  readonly phases: readonly SubjectBossPhaseConfig[];
}

export interface SubjectBossPhaseConfig {
  readonly phaseIndex: number;
  readonly name: string;
  readonly description: string;
  readonly difficulty: number;
  readonly conceptIds: string[];
}

// ---------------------------------------------------------------------------
// Player subject progress — persisted per-player-per-subject
// ---------------------------------------------------------------------------

export type SubjectBossStatus = "locked" | "available" | "active" | "defeated" | "retreat";

export interface PlayerSubjectProgress {
  readonly playerId: string;
  readonly subjectId: string;
  readonly currentLevel: number;
  readonly maximumLevel: number;
  readonly masteryScore: number;
  readonly retentionScore: number;
  readonly successfulEncounterCount: number;
  readonly reviewEncounterCount: number;
  readonly practicalEncounterCount: number;
  readonly distinctStudySessionCount: number;
  readonly bossStatus: SubjectBossStatus;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
}

// ---------------------------------------------------------------------------
// Subject-level helper — assign concepts to levels
// ---------------------------------------------------------------------------

/**
 * Maps concepts to their subject level by scanning their `level` string
 * against the subject's numeric level definitions.
 *
 * This is a pure domain function — no database calls.
 */
export function assignConceptsToLevel(
  subject: Subject,
  progression: SubjectProgression,
): Map<number, string[]> {
  const levelMap = new Map<number, string[]>();

  for (let i = progression.minimumLevel; i <= progression.maximumLevel; i++) {
    levelMap.set(i, []);
  }

  for (const domain of subject.domains) {
    for (const concept of domain.concepts) {
      const numericLevel = mapSubjectLevelStringToNumber(concept.level, progression);
      const existing = levelMap.get(numericLevel) ?? [];
      existing.push(concept.id);
      levelMap.set(numericLevel, existing);
    }
  }

  return levelMap;
}

/**
 * Maps a string SubjectLevel ("foundation", "intermediate", etc.)
 * to a numeric level within the subject's progression range.
 */
export function mapSubjectLevelStringToNumber(
  level: string,
  progression: SubjectProgression,
): number {
  const max = progression.maximumLevel;
  const min = progression.minimumLevel;
  const range = max - min + 1;

  switch (level) {
    case "foundation":
      return min;
    case "intermediate":
      return min + Math.max(1, Math.floor(range * 0.3));
    case "advanced":
      return min + Math.max(2, Math.floor(range * 0.6));
    case "senior":
      return max;
    default:
      return min;
  }
}

/**
 * Gets the level definition for a specific numeric level.
 */
export function getLevelDefinition(
  progression: SubjectProgression,
  level: number,
): SubjectLevelDefinition | undefined {
  return progression.levels.find((l) => l.level === level);
}

/**
 * Returns the level definition whose difficulty range covers the given difficulty value.
 */
export function findLevelForDifficulty(
  progression: SubjectProgression,
  difficulty: number,
): SubjectLevelDefinition | undefined {
  const sorted = [...progression.levels].sort((a, b) => a.level - b.level);
  for (const def of sorted) {
    if (difficulty >= def.difficultyRange.minimum && difficulty <= def.difficultyRange.maximum) {
      return def;
    }
  }

  // No exact match — return nearest level
  if (difficulty < sorted[0].difficultyRange.minimum) {
    return sorted[0];
  }
  return sorted[sorted.length - 1];
}
