import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

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
});
