import { Entity } from "@/shared/domain/entity";

export interface Player extends Entity {
  id: string;
  name: string;
  level: number;
  experiencePoints: number;
  masteryPoints: number;
  currentSubjectId: string | null;
  currentRegionId: string | null;
  lastActiveAt: Date | null;
  lastReturnBonusClaimedAt: Date | null;
  selectedTitle: string | null;
  selectedTheme: string | null;
  workshopTier: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlayerInput {
  name: string;
}
