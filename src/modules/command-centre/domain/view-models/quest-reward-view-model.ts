/**
 * A reward the player will receive for completing a quest.
 */
export interface QuestRewardViewModel {
  readonly type: "xp" | "knowledge_shards" | "mastery" | "unlock" | "item";
  readonly amount: number;
  readonly label: string;
}
