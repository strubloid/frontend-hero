import { MissionType } from "./mission";

/**
 * A mission chain is a sequential series of missions tied together
 * by a narrative thread. The player must complete each mission
 * before the next unlocks.
 */
export interface MissionChain {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  narrativePrologue: string;
  narrativeEpilogue: string | null;
  steps: MissionChainStep[];
  regionId: string | null;
  requiredLevel: number;
  rewardTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionChainStep {
  id: string;
  chainId: string;
  order: number;
  missionType: MissionType;
  conceptIds: string[];
  minDifficulty: number;
  maxDifficulty: number;
  objective: string;
  narrativeBeat: string | null;
  requiredCount: number;
}

export interface PlayerMissionChainProgress {
  id: string;
  playerId: string;
  chainId: string;
  currentStepIndex: number;
  completedStepIds: string[];
  startedAt: Date;
  completedAt: Date | null;
  isActive: boolean;
}
