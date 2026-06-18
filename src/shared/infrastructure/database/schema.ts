import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm";

// ─── Players ────────────────────────────────────────────────────────────────

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  level: integer("level").default(1).notNull(),
  experiencePoints: integer("experiencePoints").default(0).notNull(),
  masteryPoints: integer("masteryPoints").default(0).notNull(),
  currentSubjectId: text("currentSubjectId"),
  currentRegionId: text("currentRegionId"),
  lastActiveAt: text("lastActiveAt"),
  lastReturnBonusClaimedAt: text("lastReturnBonusClaimedAt"),
  selectedTitle: text("selectedTitle"),
  selectedTheme: text("selectedTheme"),
  workshopTier: integer("workshopTier").default(1).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// ─── Subjects ───────────────────────────────────────────────────────────────

export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  version: integer("version").notNull(),
  schemaVersion: integer("schemaVersion").notNull(),
  minimumGameVersion: text("minimumGameVersion").notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// ─── Concepts ───────────────────────────────────────────────────────────────

export const concepts = sqliteTable("concepts", {
  id: text("id").primaryKey(),
  subjectId: text("subjectId")
    .notNull()
    .references(() => subjects.id),
  name: text("name").notNull(),
  domainName: text("domainName").notNull(),
  level: text("level").notNull(),
  difficulty: integer("difficulty").notNull(),
  prerequisites: text("prerequisites").default("[]").notNull(),
  tags: text("tags").default("[]").notNull(),
  outcomes: text("outcomes").default("[]").notNull(),
  knowledge: text("knowledge").default("").notNull(),
  commonMisconceptions: text("commonMisconceptions").default("[]").notNull(),
  examples: text("examples").default("[]").notNull(),
  questionSeeds: text("questionSeeds").default("[]").notNull(),
  practicalChallenges: text("practicalChallenges").default("[]").notNull(),
  interviewPrompts: text("interviewPrompts").default("[]").notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// ─── Questions ──────────────────────────────────────────────────────────────

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  subjectId: text("subjectId").notNull(),
  conceptId: text("conceptId"),
  seedId: text("seedId"),
  type: text("type").notNull(),
  difficulty: integer("difficulty").notNull(),
  stem: text("stem").notNull(),
  options: text("options").notNull(),
  correctIndex: integer("correctIndex").notNull(),
  explanation: text("explanation").notNull(),
  timesShown: integer("timesShown").default(0).notNull(),
  lastShownAt: text("lastShownAt"),
  qualityRating: integer("qualityRating").default(5).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// ─── Missions ───────────────────────────────────────────────────────────────

export const missions = sqliteTable("missions", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  subjectId: text("subjectId").notNull(),
  type: text("type").notNull(),
  status: text("status").default("active").notNull(),
  questionIds: text("questionIds").default("[]").notNull(),
  currentQuestionIndex: integer("currentQuestionIndex").default(0).notNull(),
  score: integer("score").default(0).notNull(),
  maxScore: integer("maxScore").default(0).notNull(),
  startedAt: text("startedAt").notNull(),
  completedAt: text("completedAt"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// ─── Mission Attempts ───────────────────────────────────────────────────────

export const missionAttempts = sqliteTable("missionAttempts", {
  id: text("id").primaryKey(),
  missionId: text("missionId").notNull(),
  playerId: text("playerId").notNull(),
  questionId: text("questionId").notNull(),
  selectedIndex: integer("selectedIndex").notNull(),
  isCorrect: integer("isCorrect").notNull(),
  timeSpentSeconds: integer("timeSpentSeconds").notNull(),
  hintsUsed: integer("hintsUsed").default(0).notNull(),
  attemptedAt: text("attemptedAt").notNull(),
});

// ─── Concept Mastery ────────────────────────────────────────────────────────

export const conceptMastery = sqliteTable("conceptMastery", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  conceptId: text("conceptId").notNull(),
  subjectId: text("subjectId").notNull(),
  masteryScore: real("masteryScore").default(0).notNull(),
  confidenceScore: real("confidenceScore").default(0).notNull(),
  retentionScore: real("retentionScore").default(0).notNull(),
  correctAttempts: integer("correctAttempts").default(0).notNull(),
  incorrectAttempts: integer("incorrectAttempts").default(0).notNull(),
  consecutiveCorrectAnswers: integer("consecutiveCorrectAnswers").default(0).notNull(),
  lastAttemptedAt: text("lastAttemptedAt"),
  nextReviewAt: text("nextReviewAt"),
  demonstratedContexts: text("demonstratedContexts").default("[]").notNull(),
  commonMistakes: text("commonMistakes").default("[]").notNull(),
});

// ─── Review Schedules ───────────────────────────────────────────────────────

export const reviewSchedules = sqliteTable("reviewSchedules", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  conceptId: text("conceptId").notNull(),
  subjectId: text("subjectId").notNull(),
  easinessFactor: real("easinessFactor").default(2.5).notNull(),
  intervalDays: integer("intervalDays").default(0).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  lastReviewedAt: text("lastReviewedAt"),
  nextReviewAt: text("nextReviewAt"),
  qualityScore: integer("qualityScore").default(0).notNull(),
  totalReviews: integer("totalReviews").default(0).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// ─── Player Achievements ────────────────────────────────────────────────────

export const playerAchievements = sqliteTable("playerAchievements", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  achievementId: text("achievementId").notNull(),
  earnedAt: text("earnedAt").notNull(),
  seen: integer("seen").default(0).notNull(),
});

// ─── Quests ─────────────────────────────────────────────────────────────────

export const quests = sqliteTable("quests", {
  id: text("id").primaryKey(),
  subjectId: text("subjectId"),
  frequency: text("frequency").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  missionType: text("missionType").notNull(),
  conceptIds: text("conceptIds").default("[]").notNull(),
  minDifficulty: integer("minDifficulty").notNull(),
  maxDifficulty: integer("maxDifficulty").notNull(),
  requiredCount: integer("requiredCount").notNull(),
  rewardXp: integer("rewardXp").notNull(),
  rewardTitle: text("rewardTitle"),
  isActive: integer("isActive").default(1).notNull(),
  activeFrom: text("activeFrom").notNull(),
  activeUntil: text("activeUntil"),
  createdAt: text("createdAt").notNull(),
});

export const questProgress = sqliteTable("questProgress", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  questId: text("questId").notNull(),
  periodStart: text("periodStart").notNull(),
  periodEnd: text("periodEnd").notNull(),
  completedCount: integer("completedCount").default(0).notNull(),
  requiredCount: integer("requiredCount").notNull(),
  completed: integer("completed").default(0).notNull(),
  rewarded: integer("rewarded").default(0).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

// ─── Mission Chains ─────────────────────────────────────────────────────────

export const missionChains = sqliteTable("missionChains", {
  id: text("id").primaryKey(),
  subjectId: text("subjectId").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  narrativePrologue: text("narrativePrologue").notNull(),
  narrativeEpilogue: text("narrativeEpilogue"),
  steps: text("steps").default("[]").notNull(),
  regionId: text("regionId"),
  requiredLevel: integer("requiredLevel").default(1).notNull(),
  rewardTitle: text("rewardTitle"),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const missionChainProgress = sqliteTable("missionChainProgress", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  chainId: text("chainId").notNull(),
  currentStepIndex: integer("currentStepIndex").default(0).notNull(),
  completedStepIds: text("completedStepIds").default("[]").notNull(),
  startedAt: text("startedAt").notNull(),
  completedAt: text("completedAt"),
  updatedAt: text("updatedAt").notNull(),
  isActive: integer("isActive").default(1).notNull(),
});

// ─── Boss Encounters ────────────────────────────────────────────────────────

export const bossEncounters = sqliteTable("bossEncounters", {
  id: text("id").primaryKey(),
  subjectId: text("subjectId").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  regionId: text("regionId").notNull(),
  description: text("description").notNull(),
  narrativeIntro: text("narrativeIntro").notNull(),
  narrativeVictory: text("narrativeVictory").notNull(),
  defeatMessage: text("defeatMessage").notNull(),
  phases: text("phases").default("[]").notNull(),
  requiredDifficulty: integer("requiredDifficulty").default(1).notNull(),
  requiredConceptIds: text("requiredConceptIds").default("[]").notNull(),
  rewardTitle: text("rewardTitle"),
  rewardAchievementId: text("rewardAchievementId"),
  cooldownDays: integer("cooldownDays").default(1).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const bossProgress = sqliteTable("bossProgress", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  bossId: text("bossId").notNull(),
  currentPhaseIndex: integer("currentPhaseIndex").default(0).notNull(),
  completedPhaseIds: text("completedPhaseIds").default("[]").notNull(),
  phaseAttempts: text("phaseAttempts").default("[]").notNull(),
  status: text("status").default("active").notNull(),
  startedAt: text("startedAt").notNull(),
  completedAt: text("completedAt"),
});

// ─── Player Progression ─────────────────────────────────────────────────────

export const playerProgression = sqliteTable("playerProgression", {
  id: text("id").primaryKey(),
  playerId: text("playerId").notNull(),
  level: integer("level").default(1).notNull(),
  currentXp: integer("currentXp").default(0).notNull(),
  xpToNextLevel: integer("xpToNextLevel").default(100).notNull(),
  totalXpEarned: integer("totalXpEarned").default(0).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});
