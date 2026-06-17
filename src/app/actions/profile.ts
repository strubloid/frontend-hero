"use server";

import type { PlayerRepository } from "@/modules/players/domain/player-repository";
import type { AchievementCategory } from "@/modules/rewards/domain/achievement";
import type { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import { InMemoryMasteryRepository } from "@/modules/mastery/infrastructure/in-memory-mastery-repository";
import type {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import type { AchievementRepository } from "@/modules/rewards/domain/achievement-repository";
import { InMemoryAchievementRepository } from "@/modules/rewards/infrastructure/in-memory-achievement-repository";
import { AchievementService } from "@/modules/rewards/application/achievement-service";
import { InMemorySubjectRepository } from "@/modules/subjects/infrastructure/in-memory-subject-repository";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import { StreakStatusService } from "@/modules/players/application/streak-status.service";

// ---------------------------------------------------------------------------
// Shared repositories (singletons)
// ---------------------------------------------------------------------------

let playerRepository: PlayerRepository | null = null;
const masteryRepository = new InMemoryMasteryRepository();
const subjectRepository = new InMemorySubjectRepository();
const achievementRepository: AchievementRepository = new InMemoryAchievementRepository();
const streakStatusService = new StreakStatusService();

// These will be wired from the missions action module at runtime
let missionRepository: MissionRepository | null = null;
let missionAttemptRepository: MissionAttemptRepository | null = null;
let achievementService: AchievementService | null = null;

export async function wireDependencies(deps: {
  missionRepository: MissionRepository;
  missionAttemptRepository: MissionAttemptRepository;
}): Promise<void> {
  missionRepository = deps.missionRepository;
  missionAttemptRepository = deps.missionAttemptRepository;
  achievementService = new AchievementService(
    achievementRepository,
    playerRepository as unknown as PlayerRepository,
    masteryRepository,
    deps.missionRepository,
    deps.missionAttemptRepository,
  );
}

// ---------------------------------------------------------------------------
// Domain → region mapping (shared with world-map action)
// ---------------------------------------------------------------------------

const DOMAIN_ICON_MAP: Record<string, string> = {
  "JavaScript Foundations": "⚡",
  "TypeScript Citadel": "🛡",
  "React Reactor": "⚛",
  "Rendering Frontier": "🌐",
  "Next.js Nexus": "▲",
  "State Labyrinth": "🌀",
  "Network Depths": "🔗",
  "Testing Grounds": "🧪",
  "Performance Wastes": "📊",
  "Security Fortress": "🔒",
  "Architecture Council": "🏛",
  "Production Abyss": "🌋",
  "Senior Summit": "🏔",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlayerProfileData {
  player: {
    id: string;
    name: string;
    level: number;
    experiencePoints: number;
    experienceToNextLevel: number;
    experienceProgress: number; // 0-100
    title: string;
  };
  stats: {
    conceptsMastered: number;
    missionsCompleted: number;
    correctAnswers: number;
    totalAttempts: number;
    longestStreak: number;
    speedDemonAnswers: number;
    totalXp: number;
    accuracy: number;
    currentStreak: number;
    graceDaysRemaining: number;
    bossesDefeated: number;
    regionsUnlocked: number;
    regionsCompleted: number;
    level: number;
    perfectMissions: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string | null;
    isNew: boolean;
  }>;
  masteryByDomain: Array<{
    name: string;
    icon: string;
    averageMastery: number;
    conceptsCount: number;
    masteredCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: "mission" | "achievement" | "level-up";
    label: string;
    timestamp: string;
  }>;
  progression: {
    weeklyConsistencyDays: number;
    weeklyConsistencyTarget: number;
    recoveryMissionAvailable: boolean;
    returnBonusEligible: boolean;
    returnBonusMultiplier: number;
    welcomeBackMessage: string | null;
    unlockedTitles: string[];
    equippedTitle: string;
    selectedTheme: string;
    workshopTier: number;
    nextCosmeticUnlock: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLevelTitle(level: number): string {
  if (level <= 5) return "Apprentice Adventurer";
  if (level <= 10) return "Journey Coder";
  if (level <= 20) return "Script Knight";
  if (level <= 35) return "Component Lord";
  if (level <= 50) return "Framework Sage";
  if (level <= 70) return "React Archmage";
  if (level <= 90) return "Frontend Guardian";
  return "Realms Master";
}

function getUnlockedTitles(level: number, streakDays: number): string[] {
  const titles = ["Apprentice Adventurer"];
  if (level >= 5) titles.push("Journey Coder");
  if (level >= 10) titles.push("Script Knight");
  if (level >= 20) titles.push("Component Lord");
  if (level >= 35) titles.push("Framework Sage");
  if (streakDays >= 7) titles.push("Consistent Architect");
  if (streakDays >= 30) titles.push("Phoenix Engineer");
  return titles;
}

function getNextCosmeticUnlock(level: number): string {
  if (level < 5) return "Theme pack unlock at Level 5";
  if (level < 10) return "Workshop glow at Level 10";
  if (level < 20) return "Map hologram style at Level 20";
  return "Legend title variants and aura cosmetics";
}

async function ensureSubjectLoaded(): Promise<void> {
  const existing = await subjectRepository.getById("nextjs");
  if (existing) return;

  const { SubjectImportService } =
    await import("@/modules/subjects/application/subject-import-service");
  const { SubjectFileReader } = await import("@/modules/subjects/application/subject-file-reader");
  const { SubjectFrontmatterParser } =
    await import("@/modules/subjects/application/subject-frontmatter-parser");
  const { SubjectSectionParser } =
    await import("@/modules/subjects/application/subject-section-parser");
  const { ConceptParser } = await import("@/modules/subjects/application/concept-parser");
  const { PrerequisiteGraphBuilder } =
    await import("@/modules/subjects/application/prerequisite-graph-builder");
  const { SubjectSchemaValidator } =
    await import("@/modules/subjects/application/subject-schema-validator");

  const subjectImportService = new SubjectImportService(
    new SubjectFileReader("subjects"),
    new SubjectFrontmatterParser(),
    new SubjectSectionParser(),
    new ConceptParser(),
    new SubjectSchemaValidator(),
    new PrerequisiteGraphBuilder(),
  );

  await subjectImportService.import("nextjs");
}

// ---------------------------------------------------------------------------
// Exported server actions
// ---------------------------------------------------------------------------

export async function getPlayerProfile(playerId: string): Promise<PlayerProfileData> {
  await ensureSubjectLoaded();

  const player = (await playerRepository?.getById(playerId)) ?? null;

  if (!player) {
    // Return an empty profile for new players
    return {
      player: {
        id: playerId,
        name: "Adventurer",
        level: 1,
        experiencePoints: 0,
        experienceToNextLevel: 100,
        experienceProgress: 0,
        title: "Apprentice Adventurer",
      },
      stats: {
        conceptsMastered: 0,
        missionsCompleted: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        longestStreak: 0,
        speedDemonAnswers: 0,
        totalXp: 0,
        accuracy: 0,
        currentStreak: 0,
        graceDaysRemaining: 3,
        bossesDefeated: 0,
        regionsUnlocked: 0,
        regionsCompleted: 0,
        level: 1,
        perfectMissions: 0,
      },
      achievements: [],
      masteryByDomain: [],
      recentActivity: [],
      progression: {
        weeklyConsistencyDays: 0,
        weeklyConsistencyTarget: 5,
        recoveryMissionAvailable: false,
        returnBonusEligible: false,
        returnBonusMultiplier: 1,
        welcomeBackMessage: null,
        unlockedTitles: ["Apprentice Adventurer"],
        equippedTitle: "Apprentice Adventurer",
        selectedTheme: "Default Realm",
        workshopTier: 1,
        nextCosmeticUnlock: "Theme pack unlock at Level 5",
      },
    };
  }

  // Calculate XP to next level
  const experienceToNextLevel = player.level * 100;
  const experienceProgress = Math.min(
    100,
    Math.round((player.experiencePoints / experienceToNextLevel) * 100),
  );

  // Fetch masteries and mission stats
  const masteries = await masteryRepository.getByPlayer(playerId);
  const missionsCompleted = missionRepository
    ? await missionRepository.getCompletedByPlayer(playerId)
    : [];
  const allAttempts = missionAttemptRepository
    ? await missionAttemptRepository.getByPlayer(playerId)
    : [];

  const conceptsMastered = masteries.filter((m) => m.masteryScore >= 0.7).length;
  const correctAnswers = allAttempts.filter((a) => a.isCorrect).length;
  const totalAttempts = allAttempts.length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

  // Longest answer streak
  let longestStreak = 0;
  let currentAnswerStreak = 0;
  const sortedAttempts = [...allAttempts].sort(
    (a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime(),
  );
  for (const attempt of sortedAttempts) {
    if (attempt.isCorrect) {
      currentAnswerStreak++;
      longestStreak = Math.max(longestStreak, currentAnswerStreak);
    } else {
      currentAnswerStreak = 0;
    }
  }

  const streakStatus = streakStatusService.calculate(
    missionsCompleted
      .map((mission) => mission.completedAt)
      .filter((completedAt): completedAt is Date => completedAt instanceof Date),
  );

  const speedDemonAnswers = allAttempts.filter(
    (a) => a.isCorrect && a.timeSpentSeconds <= 3,
  ).length;
  const unlockedTitles = getUnlockedTitles(player.level, streakStatus.currentStreakDays);
  const equippedTitle = player.selectedTitle ?? unlockedTitles[unlockedTitles.length - 1];
  const selectedTheme = player.selectedTheme ?? "Default Realm";

  // Achievements
  let playerAchievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string | null;
    isNew: boolean;
  }> = [];

  if (achievementService) {
    // Check for newly-earned achievements
    await achievementService.checkAndAwardAchievements(playerId);
  }

  if (achievementRepository) {
    const allAchievements = await achievementRepository.getAllAchievements();
    const earned = await achievementRepository.getPlayerAchievements(playerId);
    const earnedMap = new Map(earned.map((e) => [e.achievementId, e]));

    playerAchievements = allAchievements.map((a) => {
      const earnedEntry = earnedMap.get(a.id);
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.iconId,
        earnedAt: earnedEntry?.earnedAt.toISOString() ?? null,
        isNew: earnedEntry ? !earnedEntry.seen : false,
      };
    });
  }

  // Mastery by domain
  const subject = await subjectRepository.getById("nextjs");
  const masteryByDomain = subject
    ? subject.domains.map((domain) => {
        const domainConcepts = domain.concepts;
        const domainMasteries = domainConcepts.map(
          (c) => masteries.find((m) => m.conceptId === c.id)?.masteryScore ?? 0,
        );
        const averageMastery =
          domainMasteries.length > 0
            ? Math.round(
                (domainMasteries.reduce((sum, m) => sum + m, 0) / domainMasteries.length) * 100,
              ) / 100
            : 0;
        const masteredCount = domainConcepts.filter(
          (c) => masteries.find((m) => m.conceptId === c.id)?.masteryScore ?? 0 >= 0.7,
        ).length;

        return {
          name: domain.name,
          icon: DOMAIN_ICON_MAP[domain.name] ?? "📘",
          averageMastery,
          conceptsCount: domainConcepts.length,
          masteredCount,
        };
      })
    : [];

  // Recent activity (last 5 completed missions + achievements)
  const recentActivity: PlayerProfileData["recentActivity"] = [];

  for (const mission of missionsCompleted.slice(-3).reverse()) {
    recentActivity.push({
      id: mission.id,
      type: "mission",
      label: `Completed ${mission.type} mission`,
      timestamp: (mission.completedAt ?? mission.updatedAt).toISOString(),
    });
  }

  return {
    player: {
      id: player.id,
      name: player.name,
      level: player.level,
      experiencePoints: player.experiencePoints,
      experienceToNextLevel,
      experienceProgress,
      title: equippedTitle,
    },
    stats: {
      conceptsMastered,
      missionsCompleted: missionsCompleted.length,
      correctAnswers,
      totalAttempts,
      longestStreak,
      speedDemonAnswers,
      totalXp: player.experiencePoints,
      accuracy,
      currentStreak: streakStatus.currentStreakDays,
      graceDaysRemaining: streakStatus.graceDaysRemaining,
      bossesDefeated: 0,
      regionsUnlocked: 0,
      regionsCompleted: 0,
      level: player.level,
      perfectMissions: 0,
    },
    achievements: playerAchievements,
    masteryByDomain,
    recentActivity,
    progression: {
      weeklyConsistencyDays: streakStatus.weeklyConsistencyDays,
      weeklyConsistencyTarget: streakStatus.weeklyConsistencyTarget,
      recoveryMissionAvailable: streakStatus.recoveryMissionAvailable,
      returnBonusEligible: streakStatus.returnBonusEligible,
      returnBonusMultiplier: streakStatus.returnBonusMultiplier,
      welcomeBackMessage: streakStatus.welcomeBackMessage,
      unlockedTitles,
      equippedTitle,
      selectedTheme,
      workshopTier: player.workshopTier,
      nextCosmeticUnlock: getNextCosmeticUnlock(player.level),
    },
  };
}

// ---------------------------------------------------------------------------
// Collections data (shared singletons via wireDependencies)
// ---------------------------------------------------------------------------

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  iconId: string;
  hidden: boolean;
  earned: boolean;
  earnedAt: string | null;
  rewardType: string | null;
  rewardValue: string | null;
}

export interface CollectionsData {
  all: CollectionItem[];
  earned: number;
  total: number;
  categories: {
    category: AchievementCategory;
    label: string;
    items: CollectionItem[];
  }[];
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  milestone: "Milestones",
  mastery: "Mastery",
  streak: "Streaks",
  challenge: "Challenges",
  exploration: "Exploration",
  hidden: "Secrets",
};

export async function getCollections(playerId: string): Promise<CollectionsData> {
  const allAchievements = await achievementRepository.getAllAchievements();
  const playerAchievements = await achievementRepository.getPlayerAchievements(playerId);
  const earnedMap = new Set(playerAchievements.map((pa) => pa.achievementId));
  const earnedAtMap = new Map(
    playerAchievements.map((pa) => [pa.achievementId, pa.earnedAt.toISOString()]),
  );

  const items: CollectionItem[] = allAchievements.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    category: a.category,
    iconId: a.iconId,
    hidden: a.hidden,
    earned: earnedMap.has(a.id),
    earnedAt: earnedAtMap.get(a.id) ?? null,
    rewardType: a.reward?.type ?? null,
    rewardValue: a.reward?.value ?? null,
  }));

  const categoryOrder: AchievementCategory[] = [
    "milestone",
    "mastery",
    "streak",
    "challenge",
    "exploration",
    "hidden",
  ];
  const categories = categoryOrder
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: items.filter((i) => i.category === category),
    }))
    .filter((c) => c.items.length > 0);

  return {
    all: items,
    earned: items.filter((i) => i.earned).length,
    total: items.length,
    categories,
  };
}

export async function getAchievementProgress(playerId: string): Promise<{
  earned: number;
  total: number;
  recentEarned: CollectionItem[];
}> {
  const data = await getCollections(playerId);
  const recentEarned = data.all
    .filter((i) => i.earned)
    .sort((a, b) => new Date(b.earnedAt ?? 0).getTime() - new Date(a.earnedAt ?? 0).getTime())
    .slice(0, 3);

  return {
    earned: data.earned,
    total: data.total,
    recentEarned,
  };
}

// ---------------------------------------------------------------------------
// Title & cosmetic selection
// ---------------------------------------------------------------------------

const THEME_OPTIONS = [
  { id: "default", name: "Default Realm", icon: "🏰", description: "Classic dark theme" },
  { id: "forest", name: "Enchanted Forest", icon: "🌲", description: "Green-tinted accents" },
  { id: "volcano", name: "Fire Peak", icon: "🌋", description: "Warm orange/red glow" },
  { id: "frost", name: "Frost Valley", icon: "❄", description: "Cool blue tones" },
  { id: "cosmic", name: "Cosmic Void", icon: "🌌", description: "Deep purple galaxy" },
];

export async function equipTitle(playerId: string, title: string): Promise<void> {
  const player = await playerRepository?.getById(playerId);
  if (!player) return;
  player.selectedTitle = title;
  await playerRepository?.save(player);
}

export async function setTheme(playerId: string, theme: string): Promise<void> {
  const player = await playerRepository?.getById(playerId);
  if (!player) return;
  const validTheme = THEME_OPTIONS.some((option) => option.name === theme);
  player.selectedTheme = validTheme ? theme : "Default Realm";
  await playerRepository?.save(player);
}
