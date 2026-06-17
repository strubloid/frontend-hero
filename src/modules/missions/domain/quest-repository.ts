import { Quest, PlayerQuestProgress } from "../domain/quest";

export interface QuestRepository {
  getQuestById(id: string): Promise<Quest | null>;
  getActiveQuests(): Promise<Quest[]>;
  getPlayerProgress(playerId: string, questId: string): Promise<PlayerQuestProgress | null>;
  getAllPlayerProgress(playerId: string): Promise<PlayerQuestProgress[]>;
  saveQuest(quest: Quest): Promise<Quest>;
  saveProgress(progress: PlayerQuestProgress): Promise<PlayerQuestProgress>;
}
