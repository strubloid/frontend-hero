import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type Database from "better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type {
  BossEncounter,
  BossPhase,
  BossPhaseAttempt,
  PlayerBossProgress,
} from "../domain/boss-encounter";
import type { BossEncounterRepository, BossProgressRepository } from "../domain/boss-repository";

type DbInstance = BetterSQLite3Database<typeof schema>;

// -----------------------------------------------------------------------
// Boss definitions — seeded into the database on init
// -----------------------------------------------------------------------

const BOSS_DEFINITIONS: BossEncounter[] = [
  {
    id: "boss-app-router",
    subjectId: "nextjs",
    name: "The App Router Wyrm",
    title: "Ancient guardian of the /app directory",
    regionId: "nextjs",
    description: "A serpent of nested layouts and server components",
    narrativeIntro:
      "A massive wyrm coils around the app directory. Its scales shimmer with the patterns of route groups and layouts. To pass, you must prove mastery over the App Router's secrets.",
    narrativeVictory:
      "The wyrm dissolves into streams of compiled code, leaving the /app directory open before you. The realm responds — layouts hydrate, routes resolve.",
    defeatMessage:
      "The wyrm tightens its coils. Your understanding of the App Router must grow stronger before challenging this guardian again.",
    phases: [
      {
        id: "boss-app-router-ph1",
        bossId: "boss-app-router",
        order: 0,
        type: "recognize-symptoms",
        conceptIds: ["layout-files", "nested-layouts"],
        prompt: "Layout nesting: recognize how layouts compose across the tree",
        context: null,
        difficulty: 2,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
      {
        id: "boss-app-router-ph2",
        bossId: "boss-app-router",
        order: 1,
        type: "identify-cause",
        conceptIds: ["route-groups", "loading-ui"],
        prompt: "Identify how route groups and loading files organize sections",
        context: null,
        difficulty: 2,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
      {
        id: "boss-app-router-ph3",
        bossId: "boss-app-router",
        order: 2,
        type: "choose-repair",
        conceptIds: ["error-handling", "not-found"],
        prompt: "Choose the right patterns for error boundaries and 404 pages",
        context: null,
        difficulty: 3,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
      {
        id: "boss-app-router-ph4",
        bossId: "boss-app-router",
        order: 3,
        type: "explain-tradeoff",
        conceptIds: ["data-fetching", "server-components"],
        prompt: "Explain the tradeoffs between fetch strategies in the App Router",
        context: null,
        difficulty: 3,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
    ],
    requiredDifficulty: 2,
    requiredConceptIds: [
      "layout-files",
      "nested-layouts",
      "route-groups",
      "loading-ui",
      "error-handling",
      "data-fetching",
      "server-components",
    ],
    rewardTitle: "App Router Champion",
    rewardAchievementId: null,
    cooldownDays: 1,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "boss-data-fetching",
    subjectId: "nextjs",
    name: "The Fetch Kraken",
    title: "Tentacled beast of the data layer",
    regionId: "nextjs",
    description: "A many-tentacled beast controlling data flow",
    narrativeIntro:
      "The waters around your app churn. The Fetch Kraken rises — each tentacle a different data-fetching strategy. Untangle its patterns to calm the data layer.",
    narrativeVictory:
      "The kraken submerges, data flowing smoothly through your application. Caching works; hydration completes.",
    defeatMessage:
      "The kraken drags you under. Study the different fetch patterns and caching strategies before challenging it again.",
    phases: [
      {
        id: "boss-data-fetching-ph1",
        bossId: "boss-data-fetching",
        order: 0,
        type: "recognize-symptoms",
        conceptIds: ["data-fetching", "server-actions"],
        prompt: "Recognize which data-fetching pattern fits each scenario",
        context: null,
        difficulty: 2,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
      {
        id: "boss-data-fetching-ph2",
        bossId: "boss-data-fetching",
        order: 1,
        type: "identify-cause",
        conceptIds: ["caching", "revalidation"],
        prompt: "Identify caching issues and revalidation strategies",
        context: null,
        difficulty: 3,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
      {
        id: "boss-data-fetching-ph3",
        bossId: "boss-data-fetching",
        order: 2,
        type: "choose-repair",
        conceptIds: ["server-actions", "data-fetching"],
        prompt: "Choose the right server action pattern for mutations",
        context: null,
        difficulty: 3,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
      {
        id: "boss-data-fetching-ph4",
        bossId: "boss-data-fetching",
        order: 3,
        type: "prevent-regression",
        conceptIds: ["revalidation", "caching"],
        prompt: "Prevent stale data issues with proper revalidation",
        context: null,
        difficulty: 3,
        minCorrectCount: 2,
        maxAttempts: 3,
      },
    ],
    requiredDifficulty: 2,
    requiredConceptIds: ["data-fetching", "server-actions", "caching", "revalidation"],
    rewardTitle: "Data Master",
    rewardAchievementId: null,
    cooldownDays: 1,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
];

// -----------------------------------------------------------------------
// DrizzleBossEncounterRepository
// -----------------------------------------------------------------------

export class DrizzleBossEncounterRepository implements BossEncounterRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
    this.seedBosses();
  }

  private seedBosses(): void {
    for (const boss of BOSS_DEFINITIONS) {
      const row = this.toPersistence(boss);
      this.db
        .insert(schema.bossEncounters)
        .values(row)
        .onConflictDoNothing({ target: schema.bossEncounters.id })
        .run();
    }
  }

  async getById(id: string): Promise<BossEncounter | null> {
    const rows = await this.db
      .select()
      .from(schema.bossEncounters)
      .where(eq(schema.bossEncounters.id, id))
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async getByRegion(regionId: string): Promise<BossEncounter | null> {
    const rows = await this.db
      .select()
      .from(schema.bossEncounters)
      .where(eq(schema.bossEncounters.regionId, regionId))
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async getAll(): Promise<BossEncounter[]> {
    const rows = await this.db.select().from(schema.bossEncounters);
    return rows.map((row) => this.toDomain(row));
  }

  async save(encounter: BossEncounter): Promise<void> {
    const row = this.toPersistence(encounter);
    await this.db.insert(schema.bossEncounters).values(row).onConflictDoUpdate({
      target: schema.bossEncounters.id,
      set: row,
    });
  }

  private toDomain(row: typeof schema.bossEncounters.$inferSelect): BossEncounter {
    return {
      id: row.id,
      subjectId: row.subjectId,
      name: row.name,
      title: row.title,
      regionId: row.regionId,
      description: row.description,
      narrativeIntro: row.narrativeIntro,
      narrativeVictory: row.narrativeVictory,
      defeatMessage: row.defeatMessage,
      phases: parsePhases(row.phases),
      requiredDifficulty: row.requiredDifficulty,
      requiredConceptIds: parseJson<string[]>(row.requiredConceptIds, []),
      rewardTitle: row.rewardTitle,
      rewardAchievementId: row.rewardAchievementId,
      cooldownDays: row.cooldownDays,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private toPersistence(encounter: BossEncounter): typeof schema.bossEncounters.$inferInsert {
    return {
      id: encounter.id,
      subjectId: encounter.subjectId,
      name: encounter.name,
      title: encounter.title,
      regionId: encounter.regionId,
      description: encounter.description,
      narrativeIntro: encounter.narrativeIntro,
      narrativeVictory: encounter.narrativeVictory,
      defeatMessage: encounter.defeatMessage,
      phases: JSON.stringify(encounter.phases),
      requiredDifficulty: encounter.requiredDifficulty,
      requiredConceptIds: JSON.stringify(encounter.requiredConceptIds),
      rewardTitle: encounter.rewardTitle,
      rewardAchievementId: encounter.rewardAchievementId,
      cooldownDays: encounter.cooldownDays,
      createdAt: encounter.createdAt.toISOString(),
      updatedAt: encounter.updatedAt.toISOString(),
    };
  }
}

// -----------------------------------------------------------------------
// DrizzleBossProgressRepository
// -----------------------------------------------------------------------

export class DrizzleBossProgressRepository implements BossProgressRepository {
  private readonly db: DbInstance;

  constructor(sqlite: Database.Database) {
    this.db = drizzle(sqlite, { schema });
  }

  async getByPlayerAndBoss(playerId: string, bossId: string): Promise<PlayerBossProgress | null> {
    const rows = await this.db
      .select()
      .from(schema.bossProgress)
      .where(
        and(eq(schema.bossProgress.playerId, playerId), eq(schema.bossProgress.bossId, bossId)),
      )
      .limit(1);

    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async save(progress: PlayerBossProgress): Promise<void> {
    const row = this.toPersistence(progress);
    await this.db.insert(schema.bossProgress).values(row).onConflictDoUpdate({
      target: schema.bossProgress.id,
      set: row,
    });
  }

  private toDomain(row: typeof schema.bossProgress.$inferSelect): PlayerBossProgress {
    return {
      id: row.id,
      playerId: row.playerId,
      bossId: row.bossId,
      currentPhaseIndex: row.currentPhaseIndex,
      completedPhaseIds: parseJson<string[]>(row.completedPhaseIds, []),
      phaseAttempts: parsePhaseAttempts(row.phaseAttempts),
      status: row.status as "active" | "defeated" | "retreat",
      startedAt: new Date(row.startedAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : null,
    };
  }

  private toPersistence(progress: PlayerBossProgress): typeof schema.bossProgress.$inferInsert {
    return {
      id: progress.id,
      playerId: progress.playerId,
      bossId: progress.bossId,
      currentPhaseIndex: progress.currentPhaseIndex,
      completedPhaseIds: JSON.stringify(progress.completedPhaseIds),
      phaseAttempts: JSON.stringify(
        progress.phaseAttempts.map((a) => ({
          ...a,
          completedAt: a.completedAt?.toISOString() ?? null,
        })),
      ),
      status: progress.status,
      startedAt: progress.startedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString() ?? null,
    };
  }
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function parsePhases(value: string): BossPhase[] {
  try {
    return JSON.parse(value) as BossPhase[];
  } catch {
    return [];
  }
}

function parsePhaseAttempts(value: string): BossPhaseAttempt[] {
  try {
    const parsed = JSON.parse(value) as any[];
    return parsed.map((a) => ({
      ...a,
      completedAt: a.completedAt ? new Date(a.completedAt) : null,
    }));
  } catch {
    return [];
  }
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
