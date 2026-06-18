/**
 * Progress bar for the current quest.
 */
export interface QuestProgressViewModel {
  readonly current: number;
  readonly max: number;
  readonly percent: number; // 0-100
  readonly label: string; // e.g. "2 / 5 encounters"
}
