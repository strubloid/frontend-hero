import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type { Quest, PlayerQuestProgress, QuestTemplate } from "../domain/quest";
import type { QuestRepository } from "../domain/quest-repository";

type DbInstance = BetterSQLite3Database<typeof schema>;

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

export class DrizzleQuestRepository implements QuestRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getQuestById(id: string): Promise<Quest | null> {
    const rows = await this.db
      .select()
      .from(schema.quests)
      .where(eq(schema.quests.id, id))
      .limit(1);

    return rows[0] ? this.questToDomain(rows[0]) : null;
  }

  async getActiveQuests(): Promise<Quest[]> {
    const now = new Date().toISOString();
    const rows = await this.db
      .select()
      .from(schema.quests)
      .where(
        and(
          eq(schema.quests.isActive, 1),
          // activeFrom <= now
          // activeUntil is null OR activeUntil > now
        ),
      );

    return rows
      .filter((row) => row.activeFrom <= now && (!row.activeUntil || row.activeUntil > now))
      .map((row) => this.questToDomain(row));
  }

  async getPlayerProgress(playerId: string, questId: string): Promise<PlayerQuestProgress | null> {
    const rows = await this.db
      .select()
      .from(schema.questProgress)
      .where(
        and(eq(schema.questProgress.playerId, playerId), eq(schema.questProgress.questId, questId)),
      )
      .limit(1);

    return rows[0] ? this.progressToDomain(rows[0]) : null;
  }

  async getAllPlayerProgress(playerId: string): Promise<PlayerQuestProgress[]> {
    const rows = await this.db
      .select()
      .from(schema.questProgress)
      .where(eq(schema.questProgress.playerId, playerId));

    return rows.map((row) => this.progressToDomain(row));
  }

  async saveQuest(quest: Quest): Promise<Quest> {
    const row = this.questToPersistence(quest);
    await this.db.insert(schema.quests).values(row).onConflictDoUpdate({
      target: schema.quests.id,
      set: row,
    });

    return quest;
  }

  async saveProgress(progress: PlayerQuestProgress): Promise<PlayerQuestProgress> {
    const row = this.progressToPersistence(progress);
    await this.db.insert(schema.questProgress).values(row).onConflictDoUpdate({
      target: schema.questProgress.id,
      set: row,
    });

    return progress;
  }

  /** Seed quests for the current period — called on app init */
  async generateDailyQuests(): Promise<Quest[]> {
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const generated: Quest[] = [];

    for (const tmpl of DAILY_TEMPLATES) {
      const quest = this.fromTemplate(tmpl, todayEnd);
      await this.saveQuest(quest);
      generated.push(quest);
    }

    return generated;
  }

  /** Generate weekly quests (active from Monday 00:00 to Sunday 23:59) */
  async generateWeeklyQuests(): Promise<Quest[]> {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
    weekEnd.setHours(23, 59, 59, 999);
    const generated: Quest[] = [];

    for (const tmpl of WEEKLY_TEMPLATES) {
      const quest = this.fromTemplate(tmpl, weekEnd);
      await this.saveQuest(quest);
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

  private questToDomain(row: typeof schema.quests.$inferSelect): Quest {
    return {
      id: row.id,
      subjectId: row.subjectId,
      frequency: row.frequency as "daily" | "weekly",
      name: row.name,
      description: row.description,
      missionType: row.missionType,
      conceptIds: parseJson<string[]>(row.conceptIds, []),
      minDifficulty: row.minDifficulty,
      maxDifficulty: row.maxDifficulty,
      requiredCount: row.requiredCount,
      rewardXp: row.rewardXp,
      rewardTitle: row.rewardTitle,
      isActive: row.isActive === 1,
      activeFrom: new Date(row.activeFrom),
      activeUntil: row.activeUntil ? new Date(row.activeUntil) : null,
      createdAt: new Date(row.createdAt),
    };
  }

  private questToPersistence(quest: Quest): typeof schema.quests.$inferInsert {
    return {
      id: quest.id,
      subjectId: quest.subjectId,
      frequency: quest.frequency,
      name: quest.name,
      description: quest.description,
      missionType: quest.missionType,
      conceptIds: JSON.stringify(quest.conceptIds),
      minDifficulty: quest.minDifficulty,
      maxDifficulty: quest.maxDifficulty,
      requiredCount: quest.requiredCount,
      rewardXp: quest.rewardXp,
      rewardTitle: quest.rewardTitle,
      isActive: quest.isActive ? 1 : 0,
      activeFrom: quest.activeFrom.toISOString(),
      activeUntil: quest.activeUntil?.toISOString() ?? null,
      createdAt: quest.createdAt.toISOString(),
    };
  }

  private progressToDomain(row: typeof schema.questProgress.$inferSelect): PlayerQuestProgress {
    return {
      id: row.id,
      playerId: row.playerId,
      questId: row.questId,
      periodStart: new Date(row.periodStart),
      periodEnd: new Date(row.periodEnd),
      completedCount: row.completedCount,
      requiredCount: row.requiredCount,
      completed: row.completed === 1,
      rewarded: row.rewarded === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private progressToPersistence(
    progress: PlayerQuestProgress,
  ): typeof schema.questProgress.$inferInsert {
    return {
      id: progress.id,
      playerId: progress.playerId,
      questId: progress.questId,
      periodStart: progress.periodStart.toISOString(),
      periodEnd: progress.periodEnd.toISOString(),
      completedCount: progress.completedCount,
      requiredCount: progress.requiredCount,
      completed: progress.completed ? 1 : 0,
      rewarded: progress.rewarded ? 1 : 0,
      createdAt: progress.createdAt.toISOString(),
      updatedAt: progress.updatedAt.toISOString(),
    };
  }
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
