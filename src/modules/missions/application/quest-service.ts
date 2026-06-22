import { Quest, PlayerQuestProgress } from "../domain/quest";
import { QuestRepository } from "../domain/quest-repository";
import { MissionRepository } from "../domain/mission-repository";

export interface QuestDisplay {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly";
  missionType: string;
  requiredCount: number;
  completedCount: number;
  completed: boolean;
  rewarded: boolean;
  rewardXp: number;
  activeUntil: string;
}

/**
 * Service that generates daily/weekly quests from templates,
 * tracks player progress, and rewards completion.
 */
export class QuestService {
  constructor(
    private readonly questRepository: QuestRepository,
    private readonly missionRepository: MissionRepository,
  ) {}

  /**
   * Ensure quests exist for the current period, then return all active quests
   * with the player's progress.
   */
  async getPlayerQuests(playerId: string): Promise<QuestDisplay[]> {
    // Ensure daily/weekly quests exist
    const repo = this.questRepository as any;
    if (typeof repo.generateDailyQuests === "function") {
      repo.generateDailyQuests();
    }
    if (typeof repo.generateWeeklyQuests === "function") {
      repo.generateWeeklyQuests();
    }

    const activeQuests = await this.questRepository.getActiveQuests();
    const allProgress = await this.questRepository.getAllPlayerProgress(playerId);

    const displays: QuestDisplay[] = [];

    for (const quest of activeQuests) {
      const progress = allProgress.find((p) => p.questId === quest.id);

      // Refresh progress from actual mission data
      const currentCount = progress?.completedCount ?? 0;
      const isCompleted = currentCount >= quest.requiredCount;

      displays.push({
        id: quest.id,
        name: quest.name,
        description: quest.description,
        frequency: quest.frequency,
        missionType: quest.missionType,
        requiredCount: quest.requiredCount,
        completedCount: currentCount,
        completed: isCompleted,
        rewarded: progress?.rewarded ?? false,
        rewardXp: quest.rewardXp,
        activeUntil: quest.activeUntil?.toISOString() ?? "",
      });
    }

    return displays;
  }

  /**
   * Record progress toward a quest's required count.
   * Called when a mission is completed.
   */
  async recordProgress(playerId: string, questId: string, increment: number = 1): Promise<void> {
    const quest = await this.questRepository.getQuestById(questId);
    if (!quest || !quest.isActive) return;

    let progress = await this.questRepository.getPlayerProgress(playerId, questId);
    const now = new Date();

    if (progress) {
      progress.completedCount += increment;
      progress.updatedAt = now;
    } else {
      progress = {
        id: `${questId}-${playerId}-${Date.now()}`,
        playerId,
        questId,
        periodStart: quest.activeFrom,
        periodEnd: quest.activeUntil ?? new Date(now.getTime() + 86400000),
        completedCount: increment,
        requiredCount: quest.requiredCount,
        completed: false,
        rewarded: false,
        createdAt: now,
        updatedAt: now,
      };
    }

    progress.completed = progress.completedCount >= progress.requiredCount;
    await this.questRepository.saveProgress(progress);
  }

  /**
   * Reward a player for completing a quest.
   * Returns the XP granted.
   */
  async claimReward(playerId: string, questId: string): Promise<number> {
    const quest = await this.questRepository.getQuestById(questId);
    const progress = await this.questRepository.getPlayerProgress(playerId, questId);

    if (!quest || !progress || !progress.completed || progress.rewarded) {
      return 0;
    }

    progress.rewarded = true;
    progress.updatedAt = new Date();
    await this.questRepository.saveProgress(progress);

    return quest.rewardXp;
  }
}
