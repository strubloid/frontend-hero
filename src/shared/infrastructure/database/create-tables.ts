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
      email TEXT,
      passwordHash TEXT,
      emailVerified INTEGER,
      image TEXT,
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
      questionSeeds TEXT DEFAULT '[]' NOT NULL,
      practicalChallenges TEXT DEFAULT '[]' NOT NULL,
      interviewPrompts TEXT DEFAULT '[]' NOT NULL,
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
      nextReviewAt TEXT,
      demonstratedContexts TEXT DEFAULT '[]' NOT NULL,
      commonMistakes TEXT DEFAULT '[]' NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviewSchedules (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      conceptId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      easinessFactor REAL DEFAULT 2.5 NOT NULL,
      intervalDays INTEGER DEFAULT 0 NOT NULL,
      repetitions INTEGER DEFAULT 0 NOT NULL,
      lastReviewedAt TEXT,
      nextReviewAt TEXT,
      qualityScore INTEGER DEFAULT 0 NOT NULL,
      totalReviews INTEGER DEFAULT 0 NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS playerAchievements (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      achievementId TEXT NOT NULL,
      earnedAt TEXT NOT NULL,
      seen INTEGER DEFAULT 0 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      subjectId TEXT,
      frequency TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      missionType TEXT NOT NULL,
      conceptIds TEXT DEFAULT '[]' NOT NULL,
      minDifficulty INTEGER NOT NULL,
      maxDifficulty INTEGER NOT NULL,
      requiredCount INTEGER NOT NULL,
      rewardXp INTEGER NOT NULL,
      rewardTitle TEXT,
      isActive INTEGER DEFAULT 1 NOT NULL,
      activeFrom TEXT NOT NULL,
      activeUntil TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questProgress (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      questId TEXT NOT NULL,
      periodStart TEXT NOT NULL,
      periodEnd TEXT NOT NULL,
      completedCount INTEGER DEFAULT 0 NOT NULL,
      requiredCount INTEGER NOT NULL,
      completed INTEGER DEFAULT 0 NOT NULL,
      rewarded INTEGER DEFAULT 0 NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS missionChains (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      narrativePrologue TEXT NOT NULL,
      narrativeEpilogue TEXT,
      steps TEXT DEFAULT '[]' NOT NULL,
      regionId TEXT,
      requiredLevel INTEGER DEFAULT 1 NOT NULL,
      rewardTitle TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS missionChainProgress (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      chainId TEXT NOT NULL,
      currentStepIndex INTEGER DEFAULT 0 NOT NULL,
      completedStepIds TEXT DEFAULT '[]' NOT NULL,
      startedAt TEXT NOT NULL,
      completedAt TEXT,
      updatedAt TEXT NOT NULL,
      isActive INTEGER DEFAULT 1 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bossEncounters (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      regionId TEXT NOT NULL,
      description TEXT NOT NULL,
      narrativeIntro TEXT NOT NULL,
      narrativeVictory TEXT NOT NULL,
      defeatMessage TEXT NOT NULL,
      phases TEXT DEFAULT '[]' NOT NULL,
      requiredDifficulty INTEGER DEFAULT 1 NOT NULL,
      requiredConceptIds TEXT DEFAULT '[]' NOT NULL,
      rewardTitle TEXT,
      rewardAchievementId TEXT,
      cooldownDays INTEGER DEFAULT 1 NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bossProgress (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      bossId TEXT NOT NULL,
      currentPhaseIndex INTEGER DEFAULT 0 NOT NULL,
      completedPhaseIds TEXT DEFAULT '[]' NOT NULL,
      phaseAttempts TEXT DEFAULT '[]' NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL,
      startedAt TEXT NOT NULL,
      completedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS playerProgression (
      id TEXT PRIMARY KEY,
      playerId TEXT NOT NULL,
      level INTEGER DEFAULT 1 NOT NULL,
      currentXp INTEGER DEFAULT 0 NOT NULL,
      xpToNextLevel INTEGER DEFAULT 100 NOT NULL,
      totalXpEarned INTEGER DEFAULT 0 NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  ensureColumn(sqlite, "concepts", "questionSeeds", "TEXT DEFAULT '[]' NOT NULL");
  ensureColumn(sqlite, "concepts", "practicalChallenges", "TEXT DEFAULT '[]' NOT NULL");
  ensureColumn(sqlite, "concepts", "interviewPrompts", "TEXT DEFAULT '[]' NOT NULL");
  ensureColumn(sqlite, "conceptMastery", "demonstratedContexts", "TEXT DEFAULT '[]' NOT NULL");
  ensureColumn(sqlite, "conceptMastery", "commonMistakes", "TEXT DEFAULT '[]' NOT NULL");

  // Auth columns added after initial table creation
  ensureColumn(sqlite, "players", "email", "TEXT");
  ensureColumn(sqlite, "players", "passwordHash", "TEXT");
  ensureColumn(sqlite, "players", "emailVerified", "INTEGER");
  ensureColumn(sqlite, "players", "image", "TEXT");

  // NextAuth tables (conditionally created)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS account (
      userId TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      PRIMARY KEY (provider, providerAccountId)
    );

    CREATE TABLE IF NOT EXISTS session (
      sessionToken TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      expires INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verificationToken (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL,
      expires INTEGER NOT NULL,
      PRIMARY KEY (identifier, token)
    );
  `);
}

function ensureColumn(
  sqlite: Database.Database,
  tableName: string,
  columnName: string,
  definition: string,
): void {
  const rows = sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
  const exists = rows.some((row) => row.name === columnName);

  if (!exists) {
    sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}
