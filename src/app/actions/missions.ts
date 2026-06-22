"use server";

import { auth } from "@/modules/authentication/infrastructure/auth.config";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import { DrizzleMasteryRepository } from "@/modules/mastery/infrastructure/drizzle-mastery-repository";
import { DrizzleReviewRepository } from "@/modules/reviews/infrastructure/drizzle-review-repository";
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import {
  DrizzleMissionAttemptRepository,
  DrizzleMissionRepository,
} from "@/modules/missions/infrastructure/drizzle-mission-repository";
import { DrizzleQuestionRepository } from "@/modules/questions/infrastructure/drizzle-question-repository";
import { QuestionInventoryService } from "@/modules/questions/application/question-inventory-service";
import { DrizzleQuestRepository } from "@/modules/missions/infrastructure/drizzle-quest-repository";
import { QuestService } from "@/modules/missions/application/quest-service";
import { RecordSubjectEncounterUseCase } from "@/modules/subjects/application/record-subject-encounter/record-subject-encounter.use-case";
import { DrizzlePlayerSubjectProgressRepository } from "@/modules/subjects/infrastructure/drizzle-player-subject-progress-repository";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";
import { PrerequisiteGraphBuilder } from "@/modules/subjects/application/prerequisite-graph-builder";
import { MissionSelector } from "@/modules/missions/application/mission-selector";
import { AnswerEvaluator } from "@/modules/missions/application/answer-evaluator";
import { QuestionProvider } from "@/modules/questions/application/question-provider";
import { BigPickleGateway } from "@/modules/artificial-intelligence/infrastructure/big-pickle-gateway";
import { createDefaultQuestionTypeRegistry } from "@/modules/questions/infrastructure/create-default-registry";
import {
  StartMissionUseCase,
  StartMissionResult,
} from "@/modules/missions/application/start-mission.use-case";
import {
  SubmitAnswerUseCase,
  SubmitAnswerResult,
} from "@/modules/missions/application/submit-answer.use-case";
import { StartMissionInput, SubmitAnswerInput, Mission } from "@/modules/missions/domain/mission";
import { Subject } from "@/modules/subjects/domain/subject";
import { Question } from "@/modules/questions/domain/question";

interface MissionActionWiring {
  playerRepository: DrizzlePlayerRepository;
  subjectRepository: DrizzleSubjectRepository;
  missionRepository: DrizzleMissionRepository;
  questionRepository: DrizzleQuestionRepository;
  questionProvider: QuestionProvider;
  startMissionUseCase: StartMissionUseCase;
  submitAnswerUseCase: SubmitAnswerUseCase;
}

let wiringPromise: Promise<MissionActionWiring> | null = null;

async function wireDependencies(): Promise<MissionActionWiring> {
  if (wiringPromise) return wiringPromise;

  wiringPromise = Promise.resolve().then(() => {
    const sqlite = getSqliteConnection();
    const playerRepository = new DrizzlePlayerRepository(sqlite);
    const subjectRepository = new DrizzleSubjectRepository(sqlite);
    const missionRepository = new DrizzleMissionRepository(sqlite);
    const missionAttemptRepository = new DrizzleMissionAttemptRepository(sqlite);
    const questionRepository = new DrizzleQuestionRepository(sqlite);
    const subjectProgressRepository = new DrizzlePlayerSubjectProgressRepository(sqlite);
    const masteryRepository = new DrizzleMasteryRepository(sqlite);
    const reviewRepository = new DrizzleReviewRepository(sqlite);
    const questRepository = new DrizzleQuestRepository(sqlite);
    const questService = new QuestService(questRepository, missionRepository);
    const graphBuilder = new PrerequisiteGraphBuilder();
    const missionSelector = new MissionSelector();
    const answerEvaluator = new AnswerEvaluator(createDefaultQuestionTypeRegistry());
    const inventoryService = new QuestionInventoryService(questionRepository);
    const questionProvider = new QuestionProvider(
      questionRepository,
      3,
      10,
      async (concept, subjectId, count) => {
        const gateway = new BigPickleGateway();
        const result = await gateway.generateQuestion({
          subjectId,
          conceptId: concept.id,
          difficulty: concept.difficulty,
          questionType: "multiple-choice",
          count,
        });
        if (!result.success || result.questions.length === 0) return [];
        return result.questions.map((q) => ({
          seedId: `auto-${concept.id}-${Date.now()}`,
          subjectId,
          conceptId: concept.id,
          type: (q.type as Question["type"]) ?? "multiple-choice",
          difficulty: q.difficulty,
          stem: q.stem,
          options: [...q.options],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          qualityRating: 4,
        }));
      },
    );

    return {
      playerRepository,
      subjectRepository,
      missionRepository,
      questionRepository,
      questionProvider,
      inventoryService,
      startMissionUseCase: new StartMissionUseCase(
        playerRepository,
        subjectRepository,
        missionRepository,
        missionSelector,
        questionProvider,
        graphBuilder,
        masteryRepository,
        reviewRepository,
        inventoryService,
        questionRepository,
      ),
      submitAnswerUseCase: new SubmitAnswerUseCase(
        playerRepository,
        missionRepository,
        missionAttemptRepository,
        questionRepository,
        masteryRepository,
        reviewRepository,
        answerEvaluator,
        undefined,
        undefined,
        new RecordSubjectEncounterUseCase(
          subjectRepository,
          subjectProgressRepository,
          masteryRepository,
        ),
        questService,
      ),
    };
  });

  return wiringPromise;
}

export async function resetWiringCache(): Promise<void> {
  wiringPromise = null;
}

// ---------------------------------------------------------------------------
// Seed data: create a default player and load the Next.js subject
// ---------------------------------------------------------------------------

async function loadAndSeedSubject(
  wiring: MissionActionWiring,
): Promise<import("@/modules/subjects/domain/subject").Subject> {
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

  const result = await subjectImportService.import("nextjs");
  await wiring.subjectRepository.save(result.subject);

  // Pre-generate questions for ALL concepts in the subject
  // (provideForConcept creates seed questions and supplements with forge-generated ones)
  for (const domain of result.subject.domains) {
    for (const concept of domain.concepts) {
      await wiring.questionProvider.provideForConcept(concept, result.subject.id);
    }
  }

  return result.subject;
}

async function ensureSeeded(wiring: MissionActionWiring): Promise<void> {
  const existing = await wiring.playerRepository.getById("default-player");

  if (!existing) {
    const now = new Date();
    await wiring.playerRepository.create({
      id: "default-player",
      name: "Adventurer",
      email: null,
      passwordHash: null,
      emailVerified: null,
      image: null,
      level: 1,
      experiencePoints: 0,
      masteryPoints: 0,
      currentSubjectId: null,
      currentRegionId: null,
      lastActiveAt: null,
      lastReturnBonusClaimedAt: null,
      selectedTitle: null,
      selectedTheme: null,
      workshopTier: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Check whether the subject already exists in the DB
  const seededSubject = await wiring.subjectRepository.getById("nextjs");
  if (!seededSubject) {
    await loadAndSeedSubject(wiring);
    return;
  }

  // Subject exists — check file frontmatter version to detect stale cache
  const { SubjectFileReader: Reader } =
    await import("@/modules/subjects/application/subject-file-reader");
  const { SubjectFrontmatterParser: FmParser } =
    await import("@/modules/subjects/application/subject-frontmatter-parser");

  const reader = new Reader("subjects");
  const parser = new FmParser();
  const raw = await reader.read("nextjs");
  const fm = parser.parse(raw);
  const fileVersion =
    typeof fm.version === "number"
      ? fm.version
      : typeof fm.version === "string"
        ? Number(fm.version)
        : 0;
  const dbVersion = seededSubject.version;

  if (fileVersion > dbVersion) {
    console.log(`Subject version bumped: file=${fileVersion} db=${dbVersion}, re-importing`);
    await loadAndSeedSubject(wiring);
  }
}

// ---------------------------------------------------------------------------
// Exported server actions
// ---------------------------------------------------------------------------

export async function startMission(input: StartMissionInput): Promise<StartMissionResult> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);
  return wiring.startMissionUseCase.execute(input);
}

export async function submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
  const wiring = await wireDependencies();
  return wiring.submitAnswerUseCase.execute(input);
}

export async function getDefaultPlayerId(): Promise<string> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);
  return "default-player";
}

export async function getCurrentPlayerId(): Promise<string> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);

  const session = await auth();
  return session?.user?.id ?? "default-player";
}

export async function getDefaultSubject(): Promise<Subject | null> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);
  return wiring.subjectRepository.getById("nextjs");
}

export async function getActiveMission(playerId: string): Promise<Mission | null> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);
  return wiring.missionRepository.getActiveByPlayer(playerId);
}

export async function getLastMission(playerId: string): Promise<Mission | null> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);
  return wiring.missionRepository.getLastByPlayer(playerId);
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);
  return wiring.questionRepository.getById(questionId);
}
