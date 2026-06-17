"use server";

import { PlayerRepository } from "@/modules/players/domain/player-repository";
import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { ConceptMasteryRepository } from "@/modules/progression/domain/concept-mastery-repository";
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
import { Player } from "@/modules/players/domain/player";
import { Subject } from "@/modules/subjects/domain/subject";
import { Question } from "@/modules/questions/domain/question";
import { ConceptMastery } from "@/modules/progression/domain/mastery";
import { MissionAttempt } from "@/modules/missions/domain/mission";

// ---------------------------------------------------------------------------
// In-memory repositories — replace with Drizzle in Phase 2
// ---------------------------------------------------------------------------

class InMemoryPlayerRepository implements PlayerRepository {
  private store = new Map<string, Player>();

  async getById(id: string): Promise<Player | null> {
    return this.store.get(id) ?? null;
  }

  async create(player: Player): Promise<Player> {
    this.store.set(player.id, player);
    return player;
  }

  async save(player: Player): Promise<Player> {
    this.store.set(player.id, player);
    return player;
  }
}

class InMemorySubjectRepository implements SubjectRepository {
  private store = new Map<string, Subject>();

  set(subject: Subject): void {
    this.store.set(subject.id, subject);
  }

  async getById(id: string): Promise<Subject | null> {
    return this.store.get(id) ?? null;
  }
}

class InMemoryMissionRepository implements MissionRepository {
  private store = new Map<string, Mission>();
  private activeByPlayer = new Map<string, string>();

  async getById(id: string): Promise<Mission | null> {
    return this.store.get(id) ?? null;
  }

  async create(mission: Mission): Promise<Mission> {
    this.store.set(mission.id, mission);
    this.activeByPlayer.set(mission.playerId, mission.id);
    return mission;
  }

  async save(mission: Mission): Promise<Mission> {
    this.store.set(mission.id, mission);
    return mission;
  }

  async getActiveByPlayer(playerId: string): Promise<Mission | null> {
    const id = this.activeByPlayer.get(playerId);
    if (!id) return null;
    return this.store.get(id) ?? null;
  }
}

class InMemoryMissionAttemptRepository implements MissionAttemptRepository {
  private store = new Map<string, MissionAttempt>();

  async create(attempt: MissionAttempt): Promise<MissionAttempt> {
    this.store.set(attempt.id, attempt);
    return attempt;
  }

  async getByMission(missionId: string): Promise<MissionAttempt[]> {
    return Array.from(this.store.values()).filter((a) => a.missionId === missionId);
  }
}

class InMemoryQuestionRepository implements QuestionRepository {
  private store = new Map<string, Question>();

  set(question: Question): void {
    this.store.set(question.id, question);
  }

  async getById(id: string): Promise<Question | null> {
    return this.store.get(id) ?? null;
  }

  async create(question: Question): Promise<Question> {
    this.store.set(question.id, question);
    return question;
  }

  async getByConceptId(conceptId: string): Promise<Question[]> {
    return Array.from(this.store.values()).filter((q) => q.conceptId === conceptId);
  }

  async getRandomBySubjectId(subjectId: string, limit: number): Promise<Question[]> {
    return Array.from(this.store.values())
      .filter((q) => q.subjectId === subjectId)
      .slice(0, limit);
  }

  async getBySeedAndSubject(seedId: string, subjectId: string): Promise<Question | null> {
    return (
      Array.from(this.store.values()).find(
        (q) => q.seedId === seedId && q.subjectId === subjectId,
      ) ?? null
    );
  }
}

class InMemoryConceptMasteryRepository implements ConceptMasteryRepository {
  private store = new Map<string, ConceptMastery>();

  async getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ConceptMastery | null> {
    return this.store.get(`${playerId}:${conceptId}`) ?? null;
  }

  async save(mastery: ConceptMastery): Promise<ConceptMastery> {
    this.store.set(`${mastery.playerId}:${mastery.conceptId}`, mastery);
    return mastery;
  }
}

// ---------------------------------------------------------------------------
// Singleton instances
// ---------------------------------------------------------------------------

const playerRepository = new InMemoryPlayerRepository();
const subjectRepository = new InMemorySubjectRepository();
const missionRepository = new InMemoryMissionRepository();
const missionAttemptRepository = new InMemoryMissionAttemptRepository();
const questionRepository = new InMemoryQuestionRepository();
const conceptMasteryRepository = new InMemoryConceptMasteryRepository();

const missionSelector = new MissionSelector();
const answerEvaluator = new AnswerEvaluator();
const questionProvider = new QuestionProvider(questionRepository);

const startMissionUseCase = new StartMissionUseCase(
  playerRepository,
  subjectRepository,
  missionRepository,
  missionSelector,
  questionProvider,
);

const submitAnswerUseCase = new SubmitAnswerUseCase(
  playerRepository,
  missionRepository,
  missionAttemptRepository,
  questionRepository,
  conceptMasteryRepository,
  answerEvaluator,
);

// ---------------------------------------------------------------------------
// Seed data: create a default player and load the Next.js subject
// ---------------------------------------------------------------------------

async function ensureSeeded(): Promise<void> {
  const existing = await playerRepository.getById("default-player");
  if (existing) return;

  // Create a default player
  const now = new Date();
  await playerRepository.create({
    id: "default-player",
    name: "Adventurer",
    level: 1,
    experiencePoints: 0,
    masteryPoints: 0,
    currentSubjectId: null,
    currentRegionId: null,
    createdAt: now,
    updatedAt: now,
  });

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
  subjectRepository.set(result.subject);

  // Pre-generate questions for the first concept
  const firstDomain = result.subject.domains[0];
  if (firstDomain) {
    const firstConcept = firstDomain.concepts[0];
    if (firstConcept) {
      await questionProvider.provideForConcept(firstConcept, result.subject.id);
    }
  }
}

// ---------------------------------------------------------------------------
// Exported server actions
// ---------------------------------------------------------------------------

export async function startMission(input: StartMissionInput): Promise<StartMissionResult> {
  await ensureSeeded();
  return startMissionUseCase.execute(input);
}

export async function submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
  return submitAnswerUseCase.execute(input);
}

export async function getDefaultPlayerId(): Promise<string> {
  await ensureSeeded();
  return "default-player";
}

export async function getDefaultSubject(): Promise<Subject | null> {
  await ensureSeeded();
  return subjectRepository.getById("nextjs");
}

export async function getActiveMission(playerId: string): Promise<Mission | null> {
  await ensureSeeded();
  return missionRepository.getActiveByPlayer(playerId);
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  await ensureSeeded();
  return questionRepository.getById(questionId);
}
