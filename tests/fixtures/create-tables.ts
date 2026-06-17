import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";

export function createTables(sqlite: Database.Database) {
  const db = drizzle(sqlite, { schema });

  // Create tables using raw SQL since Drizzle doesn't auto-create
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      experiencePoints INTEGER DEFAULT 0,
      masteryPoints INTEGER DEFAULT 0,
      currentSubjectId TEXT,
      currentRegionId TEXT,
      lastActiveAt TEXT,
      lastReturnBonusClaimedAt TEXT,
      selectedTitle TEXT,
      selectedTheme TEXT,
      workshopTier INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      version INTEGER NOT NULL,
      schemaVersion INTEGER NOT NULL,
      minimumGameVersion TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS concepts (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL REFERENCES subjects(id),
      name TEXT NOT NULL,
      domainName TEXT NOT NULL,
      level TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      prerequisites TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      outcomes TEXT DEFAULT '[]',
      knowledge TEXT DEFAULT '',
      commonMisconceptions TEXT DEFAULT '[]',
      examples TEXT DEFAULT '[]',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      conceptId TEXT,
      seedId TEXT,
      type TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      stem TEXT NOT NULL,
      options TEXT NOT NULL,
      correctIndex INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      timesShown INTEGER DEFAULT 0,
      lastShownAt TEXT,
      qualityRating INTEGER DEFAULT 5,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      questionIds TEXT DEFAULT '[]',
      currentQuestionIndex INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      maxScore INTEGER DEFAULT 0,
      startedAt TEXT NOT NULL,
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS missionAttempts (
      id TEXT PRIMARY KEY,
      missionId TEXT NOT NULL,
      playerId TEXT NOT NULL,
      questionId TEXT NOT NULL,
      selectedIndex INTEGER NOT NULL,
      isCorrect INTEGER NOT NULL,
      timeSpentSeconds INTEGER NOT NULL,
      hintsUsed INTEGER DEFAULT 0,
      attemptedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conceptMastery (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      conceptId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      masteryScore REAL DEFAULT 0,
      confidenceScore REAL DEFAULT 0,
      retentionScore REAL DEFAULT 0,
      correctAttempts INTEGER DEFAULT 0,
      incorrectAttempts INTEGER DEFAULT 0,
      consecutiveCorrectAnswers INTEGER DEFAULT 0,
      lastAttemptedAt TEXT,
      nextReviewAt TEXT
    );
  `);

  return db;
}
