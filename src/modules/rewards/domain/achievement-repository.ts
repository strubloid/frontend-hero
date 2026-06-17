import { PlayerAchievement, Achievement } from "./achievement";

export interface AchievementRepository {
  getAchievementById(id: string): Promise<Achievement | null>;
  getAllAchievements(): Promise<Achievement[]>;
  getPlayerAchievements(playerId: string): Promise<PlayerAchievement[]>;
  getPlayerAchievement(playerId: string, achievementId: string): Promise<PlayerAchievement | null>;
  save(playerAchievement: PlayerAchievement): Promise<PlayerAchievement>;
  getSeen(playerId: string): Promise<PlayerAchievement[]>;
  markSeen(id: string): Promise<void>;
}
