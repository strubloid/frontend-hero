"use server";

import type { PlayerRepository } from "@/modules/players/domain/player-repository";
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

// ---------------------------------------------------------------------------
// Shared repositories (singletons)
// ---------------------------------------------------------------------------

let playerRepository: PlayerRepository | null = null;
const masteryRepository = new InMemoryMasteryRepository();
const subjectRepository = new InMemorySubjectRepository();
const achievementRepository: AchievementRepository = new InMemoryAchievementRepository();

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
        bossesDefeated: 0,
        regionsUnlocked: 0,
        regionsCompleted: 0,
        level: 1,
        perfectMissions: 0,
      },
      achievements: [],
      masteryByDomain: [],
      recentActivity: [],
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

  // Longest + current streak
  let longestStreak = 0;
  let currentStreak = 0;
  const sortedAttempts = [...allAttempts].sort(
    (a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime(),
  );
  for (const attempt of sortedAttempts) {
    if (attempt.isCorrect) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const speedDemonAnswers = allAttempts.filter(
    (a) => a.isCorrect && a.timeSpentSeconds <= 3,
  ).length;

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
      title: getLevelTitle(player.level),
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
      currentStreak,
      bossesDefeated: 0,
      regionsUnlocked: 0,
      regionsCompleted: 0,
      level: player.level,
      perfectMissions: 0,
    },
    achievements: playerAchievements,
    masteryByDomain,
    recentActivity,
  };
}
