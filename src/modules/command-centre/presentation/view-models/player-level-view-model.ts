/**
 * XP level bar rendered in the HUD.
 */
export interface PlayerLevelViewModel {
  readonly level: number;
  readonly currentXp: number;
  readonly xpToNextLevel: number;
  readonly progressPercent: number; // 0-100
}
