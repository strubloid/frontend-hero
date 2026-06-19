/**
 * Brief summary of what the player accomplished recently.
 */
export interface RecentProgressViewModel {
  readonly xpGained: number;
  readonly masteryChange: number | null; // percentage points
  readonly missionsCompleted: number;
  readonly conceptsMastered: number;
  readonly lastAction: string; // human-readable
}
