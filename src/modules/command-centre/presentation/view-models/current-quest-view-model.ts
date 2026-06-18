import type { QuestCategory } from "./quest-category";
import type { QuestDifficulty } from "./quest-difficulty";
import type { QuestProgressViewModel } from "./quest-progress-view-model";
import type { QuestRewardViewModel } from "./quest-reward-view-model";
import type { QuestActionViewModel } from "./quest-action-view-model";

/**
 * The player's currently active quest, displayed front-and-centre.
 * null when no quest is active.
 */
export interface CurrentQuestViewModel {
  readonly questId: string;
  readonly category: QuestCategory;
  readonly title: string;
  readonly narrative: string;
  readonly objective: string;
  readonly estimatedDuration: string;
  readonly difficulty: QuestDifficulty;
  readonly progress: QuestProgressViewModel;
  readonly rewards: QuestRewardViewModel[];
  readonly primaryAction: QuestActionViewModel;
}
