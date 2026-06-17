import {
  Achievement,
  PlayerAchievement,
  PlayerAchievementStats,
  checkAchievementCondition,
} from "../domain/achievement";
import { AchievementRepository } from "../domain/achievement-repository";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import { v4 as uuid } from "uuid";

/**
 * Service that checks all defined achievements against a player's current stats
 * and awards any newly-earned achievements.
 */
export class AchievementService {
  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly masteryRepository: MasteryRepository,
    private readonly missionRepository: MissionRepository,
    private readonly missionAttemptRepository: MissionAttemptRepository,
  ) {}

  /**
   * Build aggregate stats for a player from all available data sources.
   */
  async getPlayerStats(playerId: string): Promise<PlayerAchievementStats> {
    const player = await this.playerRepository.getById(playerId);
    if (!player) {
      return {
        conceptsMastered: 0,
        missionsCompleted: 0,
        correctAnswers: 0,
        longestStreak: 0,
        level: 1,
        bossesDefeated: 0,
        regionsUnlocked: 0,
        totalXp: 0,
        perfectMissions: 0,
        speedDemonAnswers: 0,
        totalAttempts: 0,
        regionsCompleted: 0,
      };
    }

    const masteries = await this.masteryRepository.getByPlayer(playerId);
    const missionsCompleted = (await this.missionRepository.getCompletedByPlayer(playerId)) ?? [];
    const allAttempts = await this.missionAttemptRepository.getByPlayer(playerId);

    const conceptsMastered = masteries.filter((m) => m.masteryScore >= 0.7).length;
    const correctAnswers = allAttempts.filter((a) => a.isCorrect).length;
    const totalAttempts = allAttempts.length;

    // Longest streak from consecutive correct
    let longestStreak = 0;
    let currentStreak = 0;
    for (const attempt of allAttempts.sort(
      (a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime(),
    )) {
      if (attempt.isCorrect) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Speed demon: correct answers under 3 seconds
    const speedDemonAnswers = allAttempts.filter(
      (a) => a.isCorrect && a.timeSpentSeconds <= 3,
    ).length;

    return {
      conceptsMastered,
      missionsCompleted: missionsCompleted.length,
      correctAnswers,
      longestStreak,
      level: player.level,
      bossesDefeated: 0, // Boss tracking added in later phases
      regionsUnlocked: 0, // Will be filled by world-map integration
      totalXp: player.experiencePoints,
      perfectMissions: 0, // Requires per-mission tracking
      speedDemonAnswers,
      totalAttempts,
      regionsCompleted: 0,
    };
  }

  /**
   * Check all achievements and award any that are newly earned.
   * Returns a list of newly-awarded achievements.
   */
  async checkAndAwardAchievements(playerId: string): Promise<Achievement[]> {
    const allAchievements = await this.achievementRepository.getAllAchievements();
    const existingPlayerAchievements =
      await this.achievementRepository.getPlayerAchievements(playerId);
    const existingIds = new Set(existingPlayerAchievements.map((pa) => pa.achievementId));
    const stats = await this.getPlayerStats(playerId);

    const newlyAwarded: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (existingIds.has(achievement.id)) continue;
      if (!checkAchievementCondition(achievement.condition, stats)) continue;

      const playerAchievement: PlayerAchievement = {
        id: uuid(),
        playerId,
        achievementId: achievement.id,
        earnedAt: new Date(),
        seen: false,
      };

      await this.achievementRepository.save(playerAchievement);
      newlyAwarded.push(achievement);
    }

    return newlyAwarded;
  }
}
