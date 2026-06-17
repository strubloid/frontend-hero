import type Database from "better-sqlite3";

/**
 * Create the application tables for the current SQLite schema.
 *
 * Drizzle defines the typed table model, but it does not create SQLite tables at
 * runtime. This helper is intentionally idempotent so app startup, local
 * migration commands, and disposable test databases can all call it safely.
 */
export function createApplicationTables(sqlite: Database.Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1 NOT NULL,
      experiencePoints INTEGER DEFAULT 0 NOT NULL,
      masteryPoints INTEGER DEFAULT 0 NOT NULL,
      currentSubjectId TEXT,
      currentRegionId TEXT,
      lastActiveAt TEXT,
      lastReturnBonusClaimedAt TEXT,
      selectedTitle TEXT,
      selectedTheme TEXT,
      workshopTier INTEGER DEFAULT 1 NOT NULL,
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
      prerequisites TEXT DEFAULT '[]' NOT NULL,
      tags TEXT DEFAULT '[]' NOT NULL,
      outcomes TEXT DEFAULT '[]' NOT NULL,
      knowledge TEXT DEFAULT '' NOT NULL,
      commonMisconceptions TEXT DEFAULT '[]' NOT NULL,
      examples TEXT DEFAULT '[]' NOT NULL,
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
      timesShown INTEGER DEFAULT 0 NOT NULL,
      lastShownAt TEXT,
      qualityRating INTEGER DEFAULT 5 NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL,
      questionIds TEXT DEFAULT '[]' NOT NULL,
      currentQuestionIndex INTEGER DEFAULT 0 NOT NULL,
      score INTEGER DEFAULT 0 NOT NULL,
      maxScore INTEGER DEFAULT 0 NOT NULL,
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
      hintsUsed INTEGER DEFAULT 0 NOT NULL,
      attemptedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conceptMastery (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      conceptId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      masteryScore REAL DEFAULT 0 NOT NULL,
      confidenceScore REAL DEFAULT 0 NOT NULL,
      retentionScore REAL DEFAULT 0 NOT NULL,
      correctAttempts INTEGER DEFAULT 0 NOT NULL,
      incorrectAttempts INTEGER DEFAULT 0 NOT NULL,
      consecutiveCorrectAnswers INTEGER DEFAULT 0 NOT NULL,
      lastAttemptedAt TEXT,
      nextReviewAt TEXT
    );
  `);
}
