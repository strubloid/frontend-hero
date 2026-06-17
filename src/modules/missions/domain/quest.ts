/**
 * Daily quests and weekly challenges — short recurring missions
 * that encourage consistent practice.
 */

export type QuestFrequency = "daily" | "weekly";

export interface Quest {
  id: string;
  subjectId: string | null;
  frequency: QuestFrequency;
  name: string;
  description: string;
  missionType: string;
  conceptIds: string[];
  minDifficulty: number;
  maxDifficulty: number;
  requiredCount: number;
  rewardXp: number;
  rewardTitle: string | null;
  isActive: boolean;
  activeFrom: Date;
  activeUntil: Date | null;
  createdAt: Date;
}

export interface PlayerQuestProgress {
  id: string;
  playerId: string;
  questId: string;
  periodStart: Date;
  periodEnd: Date;
  completedCount: number;
  requiredCount: number;
  completed: boolean;
  rewarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Human-readable quest template definitions.
 * These are used to generate active quests for each period.
 */
export interface QuestTemplate {
  id: string;
  frequency: QuestFrequency;
  name: string;
  description: string;
  missionTypes: string[];
  minDifficulty: number;
  maxDifficulty: number;
  requiredCount: number;
  rewardXp: number;
  weight: number;
}
