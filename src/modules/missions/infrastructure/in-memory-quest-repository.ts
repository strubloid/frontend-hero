import { v4 as uuid } from "uuid";
import { Quest, PlayerQuestProgress, QuestTemplate } from "../domain/quest";
import { QuestRepository } from "../domain/quest-repository";

const DAILY_TEMPLATES: QuestTemplate[] = [
  {
    id: "daily-quick-fire",
    frequency: "daily",
    name: "Quick Fire",
    description: "Answer 5 questions in any subject",
    missionTypes: ["encounter", "review"],
    minDifficulty: 1,
    maxDifficulty: 5,
    requiredCount: 5,
    rewardXp: 25,
    weight: 3,
  },
  {
    id: "daily-concept-deep",
    frequency: "daily",
    name: "Deep Focus",
    description: "Complete 3 encounters on a single concept",
    missionTypes: ["encounter"],
    minDifficulty: 2,
    maxDifficulty: 6,
    requiredCount: 3,
    rewardXp: 40,
    weight: 2,
  },
  {
    id: "daily-review",
    frequency: "daily",
    name: "Memory Refresh",
    description: "Complete 3 review missions",
    missionTypes: ["review"],
    minDifficulty: 1,
    maxDifficulty: 4,
    requiredCount: 3,
    rewardXp: 30,
    weight: 2,
  },
];

const WEEKLY_TEMPLATES: QuestTemplate[] = [
  {
    id: "weekly-master",
    frequency: "weekly",
    name: "Region Runner",
    description: "Complete 15 missions in any region",
    missionTypes: ["encounter", "review", "boss"],
    minDifficulty: 1,
    maxDifficulty: 7,
    requiredCount: 15,
    rewardXp: 150,
    weight: 2,
  },
  {
    id: "weekly-perfectionist",
    frequency: "weekly",
    name: "Flawless Week",
    description: "Score 100% on 5 missions",
    missionTypes: ["encounter", "review"],
    minDifficulty: 2,
    maxDifficulty: 7,
    requiredCount: 5,
    rewardXp: 200,
    weight: 1,
  },
  {
    id: "weekly-speed-runner",
    frequency: "weekly",
    name: "Speed Runner",
    description: "Answer 20 questions correctly in under 5 seconds",
    missionTypes: ["encounter", "review", "boss"],
    minDifficulty: 1,
    maxDifficulty: 7,
    requiredCount: 20,
    rewardXp: 180,
    weight: 1,
  },
  {
    id: "weekly-boss-hunter",
    frequency: "weekly",
    name: "Boss Hunter",
    description: "Defeat 3 boss encounters",
    missionTypes: ["boss"],
    minDifficulty: 3,
    maxDifficulty: 8,
    requiredCount: 3,
    rewardXp: 300,
    weight: 1,
  },
];

export class InMemoryQuestRepository implements QuestRepository {
  private quests: Map<string, Quest>;
  private progress: Map<string, PlayerQuestProgress[]>;

  constructor() {
    this.quests = new Map();
    this.progress = new Map();
  }

  async getQuestById(id: string): Promise<Quest | null> {
    return this.quests.get(id) ?? null;
  }

  async getActiveQuests(): Promise<Quest[]> {
    const now = new Date();
    return Array.from(this.quests.values()).filter(
      (q) => q.isActive && q.activeFrom <= now && (!q.activeUntil || q.activeUntil > now),
    );
  }

  async getPlayerProgress(playerId: string, questId: string): Promise<PlayerQuestProgress | null> {
    const list = this.progress.get(playerId) ?? [];
    return list.find((p) => p.questId === questId) ?? null;
  }

  async getAllPlayerProgress(playerId: string): Promise<PlayerQuestProgress[]> {
    return this.progress.get(playerId) ?? [];
  }

  async saveQuest(quest: Quest): Promise<Quest> {
    this.quests.set(quest.id, quest);
    return quest;
  }

  async saveProgress(progress: PlayerQuestProgress): Promise<PlayerQuestProgress> {
    const list = this.progress.get(progress.playerId) ?? [];
    const idx = list.findIndex((p) => p.id === progress.id);
    if (idx >= 0) {
      list[idx] = progress;
    } else {
      list.push(progress);
    }
    this.progress.set(progress.playerId, list);
    return progress;
  }

  /** Seed quests for the current period — called on app init */
  generateDailyQuests(): Quest[] {
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const generated: Quest[] = [];

    for (const tmpl of DAILY_TEMPLATES) {
      const quest = this.fromTemplate(tmpl, todayEnd);
      this.quests.set(quest.id, quest);
      generated.push(quest);
    }

    return generated;
  }

  /** Generate weekly quests (active from Monday 00:00 to Sunday 23:59) */
  generateWeeklyQuests(): Quest[] {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    weekEnd.setHours(23, 59, 59, 999);
    const generated: Quest[] = [];

    for (const tmpl of WEEKLY_TEMPLATES) {
      const quest = this.fromTemplate(tmpl, weekEnd);
      this.quests.set(quest.id, quest);
      generated.push(quest);
    }

    return generated;
  }

  getDailyTemplates(): QuestTemplate[] {
    return [...DAILY_TEMPLATES];
  }

  getWeeklyTemplates(): QuestTemplate[] {
    return [...WEEKLY_TEMPLATES];
  }

  private fromTemplate(tmpl: QuestTemplate, activeUntil: Date): Quest {
    return {
      id: `${tmpl.id}-${Date.now()}`,
      subjectId: null,
      frequency: tmpl.frequency,
      name: tmpl.name,
      description: tmpl.description,
      missionType: tmpl.missionTypes[0],
      conceptIds: [],
      minDifficulty: tmpl.minDifficulty,
      maxDifficulty: tmpl.maxDifficulty,
      requiredCount: tmpl.requiredCount,
      rewardXp: tmpl.rewardXp,
      rewardTitle: null,
      isActive: true,
      activeFrom: new Date(),
      activeUntil,
      createdAt: new Date(),
    };
  }
}
