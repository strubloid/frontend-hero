/**
 * Per-player-per-subject progress entity.
 *
 * Tracks a player's independent journey through a subject campaign.
 * Player level and subject level are separate systems.
 */

import { SubjectBossStatus } from "./subject-level";
import type { Subject } from "./subject";
import { Entity } from "@/shared/domain/entity";

export interface PlayerSubjectProgressEntity extends Entity {
  playerId: string;
  subjectId: string;
  currentLevel: number;
  maximumLevel: number;
  masteryScore: number;
  retentionScore: number;
  successfulEncounterCount: number;
  reviewEncounterCount: number;
  practicalEncounterCount: number;
  distinctStudySessionCount: number;
  bossStatus: SubjectBossStatus;
  startedAt: Date;
  completedAt: Date | null;
}

/**
 * Creates a new player subject progress record for a fresh start.
 */
export function createPlayerSubjectProgress(
  playerId: string,
  subject: Subject,
): PlayerSubjectProgressEntity {
  const now = new Date();
  return {
    id: `${playerId}-${subject.id}-${now.getTime()}`,
    playerId,
    subjectId: subject.id,
    currentLevel: subject.progression?.minimumLevel ?? 1,
    maximumLevel: subject.progression?.maximumLevel ?? 10,
    masteryScore: 0,
    retentionScore: 0,
    successfulEncounterCount: 0,
    reviewEncounterCount: 0,
    practicalEncounterCount: 0,
    distinctStudySessionCount: 0,
    bossStatus: "locked",
    startedAt: now,
    completedAt: null,
  };
}

/**
 * Records a successful encounter for a subject level.
 */
export function recordSuccessfulEncounter(
  progress: PlayerSubjectProgressEntity,
): PlayerSubjectProgressEntity {
  return {
    ...progress,
    successfulEncounterCount: progress.successfulEncounterCount + 1,
  };
}

/**
 * Records a review encounter.
 */
export function recordReviewEncounter(
  progress: PlayerSubjectProgressEntity,
): PlayerSubjectProgressEntity {
  return {
    ...progress,
    reviewEncounterCount: progress.reviewEncounterCount + 1,
  };
}

/**
 * Records a practical encounter.
 */
export function recordPracticalEncounter(
  progress: PlayerSubjectProgressEntity,
): PlayerSubjectProgressEntity {
  return {
    ...progress,
    practicalEncounterCount: progress.practicalEncounterCount + 1,
  };
}

/**
 * Updates mastery score for the subject based on concept masteries.
 */
export function updateSubjectMasteryScore(
  progress: PlayerSubjectProgressEntity,
  conceptMasteries: { masteryScore: number; retentionScore: number }[],
): PlayerSubjectProgressEntity {
  const avgMastery =
    conceptMasteries.length > 0
      ? conceptMasteries.reduce((a, b) => a + b.masteryScore, 0) / conceptMasteries.length
      : 0;

  const avgRetention =
    conceptMasteries.length > 0
      ? conceptMasteries.reduce((a, b) => a + b.retentionScore, 0) / conceptMasteries.length
      : 0;

  return {
    ...progress,
    masteryScore: avgMastery,
    retentionScore: avgRetention,
  };
}

/**
 * Advances the player to the next subject level.
 */
export function advanceSubjectLevel(
  progress: PlayerSubjectProgressEntity,
): PlayerSubjectProgressEntity {
  const nextLevel = progress.currentLevel + 1;
  const isComplete = nextLevel > progress.maximumLevel;

  return {
    ...progress,
    currentLevel: isComplete ? progress.maximumLevel : nextLevel,
    completedAt: isComplete ? new Date() : null,
    bossStatus: isComplete ? "defeated" : progress.bossStatus,
  };
}

/**
 * Unlocks the subject boss when the player reaches maximum level.
 */
export function unlockSubjectBoss(
  progress: PlayerSubjectProgressEntity,
): PlayerSubjectProgressEntity {
  return {
    ...progress,
    bossStatus: "available",
  };
}
