import { Achievement, PlayerAchievement } from "../domain/achievement";
import { AchievementRepository } from "../domain/achievement-repository";

const DEFINED_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-steps",
    name: "First Steps",
    description: "Complete your first mission",
    category: "milestone",
    iconId: "🌱",
    hidden: false,
    condition: { type: "missions_completed", threshold: 1 },
    reward: { type: "xp_bonus", value: "50" },
  },
  {
    id: "diligent",
    name: "Diligent",
    description: "Complete 25 missions",
    category: "milestone",
    iconId: "📋",
    hidden: false,
    condition: { type: "missions_completed", threshold: 25 },
    reward: { type: "title", value: "Diligent" },
  },
  {
    id: "persistent",
    name: "Persistent",
    description: "Complete 100 missions",
    category: "milestone",
    iconId: "🏋",
    hidden: false,
    condition: { type: "missions_completed", threshold: 100 },
    reward: { type: "title", value: "Persistent" },
  },
  {
    id: "scholar",
    name: "Scholar",
    description: "Master 5 concepts",
    category: "mastery",
    iconId: "📚",
    hidden: false,
    condition: { type: "concepts_mastered", threshold: 5 },
    reward: null,
  },
  {
    id: "sage",
    name: "Sage",
    description: "Master 25 concepts",
    category: "mastery",
    iconId: "🦉",
    hidden: false,
    condition: { type: "concepts_mastered", threshold: 25 },
    reward: { type: "title", value: "Sage" },
  },
  {
    id: "polymath",
    name: "Polymath",
    description: "Master 50 concepts",
    category: "mastery",
    iconId: "🧠",
    hidden: false,
    condition: { type: "concepts_mastered", threshold: 50 },
    reward: { type: "title", value: "Polymath" },
  },
  {
    id: "on-a-roll",
    name: "On a Roll",
    description: "Maintain a 5-day streak",
    category: "streak",
    iconId: "🔥",
    hidden: false,
    condition: { type: "streak_days", threshold: 5 },
    reward: null,
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Maintain a 15-day streak",
    category: "streak",
    iconId: "⚡",
    hidden: false,
    condition: { type: "streak_days", threshold: 15 },
    reward: { type: "title", value: "Unstoppable" },
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Answer 10 questions correctly in under 3 seconds",
    category: "challenge",
    iconId: "💨",
    hidden: false,
    condition: { type: "speed_demon", threshold: 10 },
    reward: { type: "title", value: "Speed Demon" },
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete a mission with 100% accuracy",
    category: "challenge",
    iconId: "💎",
    hidden: false,
    condition: { type: "perfect_mission", threshold: 1 },
    reward: null,
  },
  {
    id: "boss-slayer",
    name: "Boss Slayer",
    description: "Defeat your first boss encounter",
    category: "challenge",
    iconId: "🗡",
    hidden: false,
    condition: { type: "bosses_defeated", threshold: 1 },
    reward: { type: "title", value: "Boss Slayer" },
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Unlock 3 regions",
    category: "exploration",
    iconId: "🗺",
    hidden: false,
    condition: { type: "regions_unlocked", threshold: 3 },
    reward: null,
  },
  {
    id: "globetrotter",
    name: "Globetrotter",
    description: "Unlock all 13 regions",
    category: "exploration",
    iconId: "🌍",
    hidden: false,
    condition: { type: "regions_unlocked", threshold: 13 },
    reward: { type: "title", value: "Globetrotter" },
  },
  {
    id: "apprentice",
    name: "Apprentice",
    description: "Reach level 5",
    category: "milestone",
    iconId: "⭐",
    hidden: false,
    condition: { type: "level_reached", threshold: 5 },
    reward: null,
  },
  {
    id: "adept-engineer",
    name: "Adept Engineer",
    description: "Reach level 10",
    category: "milestone",
    iconId: "🌟",
    hidden: false,
    condition: { type: "level_reached", threshold: 10 },
    reward: { type: "title", value: "Adept Engineer" },
  },
];

export class InMemoryAchievementRepository implements AchievementRepository {
  private achievements: Map<string, Achievement>;
  private playerAchievements: Map<string, PlayerAchievement[]>;

  constructor() {
    this.achievements = new Map(DEFINED_ACHIEVEMENTS.map((a) => [a.id, a]));
    this.playerAchievements = new Map();
  }

  async getAchievementById(id: string): Promise<Achievement | null> {
    return this.achievements.get(id) ?? null;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getPlayerAchievements(playerId: string): Promise<PlayerAchievement[]> {
    return this.playerAchievements.get(playerId) ?? [];
  }

  async getPlayerAchievement(
    playerId: string,
    achievementId: string,
  ): Promise<PlayerAchievement | null> {
    const list = this.playerAchievements.get(playerId) ?? [];
    return list.find((pa) => pa.achievementId === achievementId) ?? null;
  }

  async save(playerAchievement: PlayerAchievement): Promise<PlayerAchievement> {
    const list = this.playerAchievements.get(playerAchievement.playerId) ?? [];
    const existing = list.findIndex((pa) => pa.achievementId === playerAchievement.achievementId);
    if (existing >= 0) {
      list[existing] = playerAchievement;
    } else {
      list.push(playerAchievement);
    }
    this.playerAchievements.set(playerAchievement.playerId, list);
    return playerAchievement;
  }

  async getSeen(playerId: string): Promise<PlayerAchievement[]> {
    const list = this.playerAchievements.get(playerId) ?? [];
    return list.filter((pa) => pa.seen);
  }

  async markSeen(id: string): Promise<void> {
    for (const [, list] of this.playerAchievements) {
      const entry = list.find((pa) => pa.id === id);
      if (entry) {
        entry.seen = true;
        return;
      }
    }
  }
}
