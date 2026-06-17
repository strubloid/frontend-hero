import {
  BossEncounter,
  BossPhase,
  PlayerBossProgress,
  BossPhaseAttempt,
} from "../domain/boss-encounter";
import { BossEncounterRepository, BossProgressRepository } from "../domain/boss-repository";

// -----------------------------------------------------------------------
// Boss definitions
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
// In-memory repository
// -----------------------------------------------------------------------

export class InMemoryBossEncounterRepository implements BossEncounterRepository {
  private store = new Map<string, BossEncounter>();

  constructor() {
    for (const boss of BOSS_DEFINITIONS) {
      this.store.set(boss.id, boss);
    }
  }

  async getById(id: string): Promise<BossEncounter | null> {
    return this.store.get(id) ?? null;
  }

  async getByRegion(regionId: string): Promise<BossEncounter | null> {
    for (const boss of this.store.values()) {
      if (boss.regionId === regionId) return boss;
    }
    return null;
  }

  async getAll(): Promise<BossEncounter[]> {
    return Array.from(this.store.values());
  }

  async save(encounter: BossEncounter): Promise<void> {
    this.store.set(encounter.id, encounter);
  }
}

export class InMemoryBossProgressRepository implements BossProgressRepository {
  private store = new Map<string, PlayerBossProgress>();

  async getByPlayerAndBoss(playerId: string, bossId: string): Promise<PlayerBossProgress | null> {
    const key = `${playerId}:${bossId}`;
    return this.store.get(key) ?? null;
  }

  async save(progress: PlayerBossProgress): Promise<void> {
    const key = `${progress.playerId}:${progress.bossId}`;
    this.store.set(key, progress);
  }
}
