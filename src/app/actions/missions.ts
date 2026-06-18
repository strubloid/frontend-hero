"use server";

import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import { DrizzleMasteryRepository } from "@/modules/mastery/infrastructure/drizzle-mastery-repository";
import { DrizzleReviewRepository } from "@/modules/reviews/infrastructure/drizzle-review-repository";
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import {
  DrizzleMissionAttemptRepository,
  DrizzleMissionRepository,
} from "@/modules/missions/infrastructure/drizzle-mission-repository";
import { DrizzleQuestionRepository } from "@/modules/questions/infrastructure/drizzle-question-repository";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";
import { PrerequisiteGraphBuilder } from "@/modules/subjects/application/prerequisite-graph-builder";
import { MissionSelector } from "@/modules/missions/application/mission-selector";
import { AnswerEvaluator } from "@/modules/missions/application/answer-evaluator";
import { QuestionProvider } from "@/modules/questions/application/question-provider";
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
    const masteryRepository = new DrizzleMasteryRepository(sqlite);
    const reviewRepository = new DrizzleReviewRepository(sqlite);
    const graphBuilder = new PrerequisiteGraphBuilder();
    const missionSelector = new MissionSelector();
    const answerEvaluator = new AnswerEvaluator();
    const questionProvider = new QuestionProvider(questionRepository);

    return {
      playerRepository,
      subjectRepository,
      missionRepository,
      questionRepository,
      questionProvider,
      startMissionUseCase: new StartMissionUseCase(
        playerRepository,
        subjectRepository,
        missionRepository,
        missionSelector,
        questionProvider,
        graphBuilder,
        masteryRepository,
        reviewRepository,
      ),
      submitAnswerUseCase: new SubmitAnswerUseCase(
        playerRepository,
        missionRepository,
        missionAttemptRepository,
        questionRepository,
        masteryRepository,
        reviewRepository,
        answerEvaluator,
      ),
    };
  });

  return wiringPromise;
}

// ---------------------------------------------------------------------------
// Seed data: create a default player and load the Next.js subject
// ---------------------------------------------------------------------------

async function ensureSeeded(wiring: MissionActionWiring): Promise<void> {
  const existing = await wiring.playerRepository.getById("default-player");

  if (!existing) {
    const now = new Date();
    await wiring.playerRepository.create({
      id: "default-player",
      name: "Adventurer",
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

  const seededSubject = await wiring.subjectRepository.getById("nextjs");
  if (seededSubject) return;

  // Load the Next.js subject from the file system
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

  // Pre-generate questions for the first concept
  const firstDomain = result.subject.domains[0];
  if (firstDomain) {
    const firstConcept = firstDomain.concepts[0];
    if (firstConcept) {
      await wiring.questionProvider.provideForConcept(firstConcept, result.subject.id);
    }
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

export async function getQuestion(questionId: string): Promise<Question | null> {
  const wiring = await wireDependencies();
  await ensureSeeded(wiring);
  return wiring.questionRepository.getById(questionId);
}
