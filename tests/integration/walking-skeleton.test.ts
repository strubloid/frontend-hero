import { describe, it, expect } from "vitest";
import { v4 as uuid } from "uuid";
import Database from "better-sqlite3";
import { createTables } from "../fixtures/create-tables";

// Real Drizzle repositories (NOT in-memory fakes)
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import {
  DrizzleMissionRepository,
  DrizzleMissionAttemptRepository,
} from "@/modules/missions/infrastructure/drizzle-mission-repository";
import { DrizzleQuestionRepository } from "@/modules/questions/infrastructure/drizzle-question-repository";
import { DrizzleMasteryRepository } from "@/modules/mastery/infrastructure/drizzle-mastery-repository";
import { DrizzleReviewRepository } from "@/modules/reviews/infrastructure/drizzle-review-repository";

// Application use cases + services
import { MissionSelector } from "@/modules/missions/application/mission-selector";
import { AnswerEvaluator } from "@/modules/missions/application/answer-evaluator";
import { QuestionProvider } from "@/modules/questions/application/question-provider";
import { StartMissionUseCase } from "@/modules/missions/application/start-mission.use-case";
import { SubmitAnswerUseCase } from "@/modules/missions/application/submit-answer.use-case";
import { SubjectImportService } from "@/modules/subjects/application/subject-import-service";
import { SubjectFileReader } from "@/modules/subjects/application/subject-file-reader";
import { SubjectFrontmatterParser } from "@/modules/subjects/application/subject-frontmatter-parser";
import { SubjectSectionParser } from "@/modules/subjects/application/subject-section-parser";
import { ConceptParser } from "@/modules/subjects/application/concept-parser";
import { PrerequisiteGraphBuilder } from "@/modules/subjects/application/prerequisite-graph-builder";
import { SubjectSchemaValidator } from "@/modules/subjects/application/subject-schema-validator";
import { xpToLevel } from "@/modules/progression/domain/player-progression";

const SUBJECTS_DIR = "subjects";

describe("Walking skeleton (real SQLite) — full flow", () => {
  it("loads subject → seeds questions → starts mission → submits answer → persists XP and level through raw SQL", async () => {
    // ── 1. Set up REAL SQLite database ──────────────────────────────────────
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    createTables(sqlite);

    const playerRepo = new DrizzlePlayerRepository(sqlite);
    const subjectRepo = new DrizzleSubjectRepository(sqlite);
    const missionRepo = new DrizzleMissionRepository(sqlite);
    const missionAttemptRepo = new DrizzleMissionAttemptRepository(sqlite);
    const questionRepo = new DrizzleQuestionRepository(sqlite);
    const masteryRepo = new DrizzleMasteryRepository(sqlite);
    const reviewRepo = new DrizzleReviewRepository(sqlite);

    // ── 2. Import the subject from file system ──────────────────────────────
    const subjectImportService = new SubjectImportService(
      new SubjectFileReader(SUBJECTS_DIR),
      new SubjectFrontmatterParser(),
      new SubjectSectionParser(),
      new ConceptParser(),
      new SubjectSchemaValidator(),
      new PrerequisiteGraphBuilder(),
    );
    const importResult = await subjectImportService.import("nextjs");
    expect(importResult.valid).toBe(true);
    expect(importResult.errors).toEqual([]);
    const subject = importResult.subject!;
    expect(subject.id).toBe("nextjs");

    // Save to real DB
    await subjectRepo.create(subject);

    // Verify raw SQL persistence
    const subjectRow = sqlite
      .prepare("SELECT id, title, version FROM subjects WHERE id = ?")
      .get("nextjs") as { id: string; title: string; version: number } | undefined;
    expect(subjectRow).toBeDefined();
    expect(subjectRow!.title).toBeTruthy();

    // Verify concepts stored
    const conceptRows = sqlite
      .prepare("SELECT id, domainName FROM concepts WHERE subjectId = ? ORDER BY id")
      .all("nextjs") as { id: string; domainName: string }[];
    expect(conceptRows.length).toBeGreaterThan(2);

    // ── 3. Load subject back through repo (round-trip) ──────────────────────
    const loadedSubject = await subjectRepo.getById("nextjs");
    expect(loadedSubject).not.toBeNull();
    expect(loadedSubject!.domains.length).toBeGreaterThan(0);
    const firstDomain = loadedSubject!.domains[0];
    expect(firstDomain.concepts.length).toBeGreaterThan(0);
    const firstConcept = firstDomain.concepts[0];

    // ── 4. Create a player via real DB ──────────────────────────────────────
    const playerId = uuid();
    const now = new Date();
    await playerRepo.create({
      id: playerId,
      name: "Test Adventurer",
      level: 1,
      experiencePoints: 0,
      masteryPoints: 0,
      currentSubjectId: null,
      currentRegionId: null,
      lastActiveAt: null,
      lastReturnBonusClaimedAt: null,
      selectedTitle: null,
      selectedTheme: null,
      email: null,
      passwordHash: null,
      emailVerified: null,
      image: null,
      workshopTier: 1,
      createdAt: now,
      updatedAt: now,
    });

    // Verify raw persistence
    const playerRow = sqlite
      .prepare("SELECT id, level, experiencePoints FROM players WHERE id = ?")
      .get(playerId) as { id: string; level: number; experiencePoints: number };
    expect(playerRow.level).toBe(1);
    expect(playerRow.experiencePoints).toBe(0);

    // ── 5. Seed questions for the first concept ─────────────────────────────
    const questionProvider = new QuestionProvider(questionRepo);
    await questionProvider.provideForConcept(firstConcept!, subject.id);

    // Verify questions persisted in real DB
    const questionRows = sqlite
      .prepare("SELECT id, conceptId, stem, correctIndex FROM questions WHERE conceptId = ?")
      .all(firstConcept!.id) as {
      id: string;
      conceptId: string;
      stem: string;
      correctIndex: number;
    }[];
    expect(questionRows.length).toBeGreaterThan(0);
    expect(questionRows[0].conceptId).toBe(firstConcept!.id);
    expect(questionRows[0].stem).toBeTruthy();
    expect(questionRows[0].correctIndex).toBeGreaterThanOrEqual(0);

    // ── 6. Start a mission ─────────────────────────────────────────────────
    const startMissionUseCase = new StartMissionUseCase(
      playerRepo,
      subjectRepo,
      missionRepo,
      new MissionSelector(),
      new QuestionProvider(questionRepo),
      new PrerequisiteGraphBuilder(),
      masteryRepo,
      reviewRepo,
    );

    const missionResult = await startMissionUseCase.execute({
      playerId,
      subjectId: "nextjs",
      type: "encounter",
    });

    if (!missionResult.success) {
      throw new Error(`Mission start failed: ${missionResult.reason}`);
    }

    expect(missionResult.mission).toBeDefined();
    expect(missionResult.mission.status).toBe("active");
    expect(missionResult.mission.questionIds.length).toBeGreaterThan(0);
    expect(missionResult.mission.score).toBe(0);

    // Verify mission in raw DB
    const missionRow = sqlite
      .prepare("SELECT id, playerId, status, score FROM missions WHERE id = ?")
      .get(missionResult.mission.id) as {
      id: string;
      playerId: string;
      status: string;
      score: number;
    };
    expect(missionRow).toBeDefined();
    expect(missionRow.status).toBe("active");
    expect(missionRow.score).toBe(0);

    // ── 7. Get the first question ──────────────────────────────────────────
    const firstQuestionId = missionResult.mission.questionIds[0];
    const firstQuestion = await questionRepo.getById(firstQuestionId);
    expect(firstQuestion).not.toBeNull();
    expect(firstQuestion!.stem).toBeTruthy();
    expect(firstQuestion!.options.length).toBeGreaterThan(1);

    // ── 8. Submit a correct answer ─────────────────────────────────────────
    const submitAnswerUseCase = new SubmitAnswerUseCase(
      playerRepo,
      missionRepo,
      missionAttemptRepo,
      questionRepo,
      masteryRepo,
      reviewRepo,
      new AnswerEvaluator(),
    );

    const correctResult = await submitAnswerUseCase.execute({
      missionId: missionResult.mission.id,
      playerId,
      questionId: firstQuestionId,
      selectedIndex: firstQuestion!.correctIndex,
      timeSpentSeconds: 5,
    });

    expect(correctResult.isCorrect).toBe(true);
    expect(correctResult.xpAwarded).toBeGreaterThan(0);
    expect(correctResult.score).toBe(1);
    expect(correctResult.updatedMastery).toBeGreaterThan(0);

    // ── 9. Verify player XP + LEVEL persisted in raw SQL ───────────────────
    const afterCorrect = sqlite
      .prepare("SELECT id, experiencePoints, level FROM players WHERE id = ?")
      .get(playerId) as { id: string; experiencePoints: number; level: number };
    expect(afterCorrect.experiencePoints).toBe(correctResult.xpAwarded);

    // CRITICAL: Level must be recalculated (tests my fix to submit-answer.use-case.ts)
    const { level: expectedLevelAfterCorrect } = xpToLevel(afterCorrect.experiencePoints);
    expect(afterCorrect.level).toBe(expectedLevelAfterCorrect);
    expect(afterCorrect.level).toBeGreaterThanOrEqual(1);

    // ── 10. Verify mastery persisted in raw DB ──────────────────────────────
    const masteryRow = sqlite
      .prepare(
        "SELECT playerId, conceptId, correctAttempts FROM conceptMastery WHERE playerId = ? AND conceptId = ?",
      )
      .get(playerId, firstQuestion!.conceptId) as
      | { playerId: string; conceptId: string; correctAttempts: number }
      | undefined;
    expect(masteryRow).toBeDefined();
    expect(masteryRow!.correctAttempts).toBe(1);

    // ── 11. Verify mission attempt persisted ────────────────────────────────
    const attemptRows = sqlite
      .prepare("SELECT id, isCorrect FROM missionAttempts WHERE missionId = ?")
      .all(missionResult.mission.id) as { id: string; isCorrect: number }[];
    expect(attemptRows.length).toBe(1);
    expect(attemptRows[0].isCorrect).toBe(1);

    // ── 12. Submit an incorrect answer ─────────────────────────────────────
    const wrongIndex = firstQuestion!.correctIndex === 0 ? 1 : firstQuestion!.correctIndex - 1;
    const incorrectResult = await submitAnswerUseCase.execute({
      missionId: missionResult.mission.id,
      playerId,
      questionId: firstQuestionId,
      selectedIndex: wrongIndex,
      timeSpentSeconds: 3,
    });

    expect(incorrectResult.isCorrect).toBe(false);
    expect(incorrectResult.updatedMastery).toBeLessThan(correctResult.updatedMastery);

    // ── 13. Verify both attempts in raw DB ──────────────────────────────────
    const allAttempts = sqlite
      .prepare("SELECT id, isCorrect FROM missionAttempts WHERE missionId = ? ORDER BY attemptedAt")
      .all(missionResult.mission.id) as { id: string; isCorrect: number }[];
    expect(allAttempts.length).toBe(2);
    expect(allAttempts[0].isCorrect).toBe(1);
    expect(allAttempts[1].isCorrect).toBe(0);

    // ── 14. Verify final player state contains correct XP and level ─────────
    // After incorrect answer, some partial XP may have been awarded too
    const afterIncorrect = sqlite
      .prepare("SELECT experiencePoints, level FROM players WHERE id = ?")
      .get(playerId) as { experiencePoints: number; level: number };
    expect(afterIncorrect.experiencePoints).toBeGreaterThanOrEqual(afterCorrect.experiencePoints);
    const { level: expectedLevelAfterIncorrect } = xpToLevel(afterIncorrect.experiencePoints);
    expect(afterIncorrect.level).toBe(expectedLevelAfterIncorrect);

    // ── 15. Verify player state read back through repo API matches raw SQL ──
    const repoPlayer = await playerRepo.getById(playerId);
    expect(repoPlayer).not.toBeNull();
    expect(repoPlayer!.experiencePoints).toBe(afterIncorrect.experiencePoints);
    expect(repoPlayer!.level).toBe(afterIncorrect.level);
    expect(repoPlayer!.createdAt).toBeInstanceOf(Date);
  });

  it("handles missing player gracefully through real DB", async () => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    createTables(sqlite);

    const playerRepo = new DrizzlePlayerRepository(sqlite);
    const subjectRepo = new DrizzleSubjectRepository(sqlite);
    const missionRepo = new DrizzleMissionRepository(sqlite);
    const questionRepo = new DrizzleQuestionRepository(sqlite);
    const masteryRepo = new DrizzleMasteryRepository(sqlite);
    const reviewRepo = new DrizzleReviewRepository(sqlite);

    // No player created — should throw

    const useCase = new StartMissionUseCase(
      playerRepo,
      subjectRepo,
      missionRepo,
      new MissionSelector(),
      new QuestionProvider(questionRepo),
      new PrerequisiteGraphBuilder(),
      masteryRepo,
      reviewRepo,
    );

    await expect(
      useCase.execute({
        playerId: "nonexistent",
        subjectId: "nextjs",
        type: "encounter",
      }),
    ).rejects.toThrow("Player not found");
  });
});
