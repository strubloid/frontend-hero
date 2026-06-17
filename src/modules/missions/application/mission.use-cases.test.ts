import { describe, it, expect } from "vitest";
import { StartMissionUseCase, StartMissionResult } from "./start-mission.use-case";
import { SubmitAnswerUseCase, SubmitAnswerResult } from "./submit-answer.use-case";
import { MissionSelector } from "./mission-selector";
import { AnswerEvaluator } from "./answer-evaluator";
import { QuestionProvider } from "@/modules/questions/application/question-provider";
import { Player } from "@/modules/players/domain/player";
import { Subject, Domain, Concept, QuestionSeed } from "@/modules/subjects/domain/subject";
import { Question } from "@/modules/questions/domain/question";
import {
  Mission,
  MissionAttempt,
  StartMissionInput,
  SubmitAnswerInput,
} from "@/modules/missions/domain/mission";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { ConceptMasteryRepository } from "@/modules/progression/domain/concept-mastery-repository";
import { ConceptMastery } from "@/modules/progression/domain/mastery";

// ---------------------------------------------------------------------------
// Mock implementations
// ---------------------------------------------------------------------------

class MockPlayerRepository implements PlayerRepository {
  private store = new Map<string, Player>();

  set(player: Player): void {
    this.store.set(player.id, player);
  }

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

class MockSubjectRepository implements SubjectRepository {
  private store = new Map<string, Subject>();

  set(subject: Subject): void {
    this.store.set(subject.id, subject);
  }

  async getById(id: string): Promise<Subject | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Subject[]> {
    return Array.from(this.store.values());
  }

  async save(subject: Subject): Promise<void> {
    this.store.set(subject.id, { ...subject, updatedAt: new Date() });
  }

  async create(subject: Subject): Promise<void> {
    this.store.set(subject.id, subject);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }
}

class MockMissionRepository implements MissionRepository {
  private store = new Map<string, Mission>();
  private activeByPlayer = new Map<string, string>();

  set(mission: Mission): void {
    this.store.set(mission.id, mission);
  }

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

class MockMissionAttemptRepository implements MissionAttemptRepository {
  private store = new Map<string, MissionAttempt>();

  async create(attempt: MissionAttempt): Promise<MissionAttempt> {
    this.store.set(attempt.id, attempt);
    return attempt;
  }

  async getByMission(missionId: string): Promise<MissionAttempt[]> {
    return Array.from(this.store.values()).filter((a) => a.missionId === missionId);
  }
}

class MockQuestionRepository implements QuestionRepository {
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

class MockConceptMasteryRepository implements ConceptMasteryRepository {
  private store = new Map<string, ConceptMastery>();

  set(mastery: ConceptMastery): void {
    this.store.set(`${mastery.playerId}:${mastery.conceptId}`, mastery);
  }

  async getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ConceptMastery | null> {
    return this.store.get(`${playerId}:${conceptId}`) ?? null;
  }

  async save(mastery: ConceptMastery): Promise<ConceptMastery> {
    this.store.set(`${mastery.playerId}:${mastery.conceptId}`, mastery);
    return mastery;
  }
}

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const playerId = "player-1";
const subjectId = "subject-1";
const conceptId = "concept-1";

function createTestPlayer(): Player {
  return {
    id: playerId,
    name: "Test Player",
    level: 1,
    experiencePoints: 0,
    masteryPoints: 0,
    currentSubjectId: null,
    currentRegionId: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };
}

function createTestSubject(): Subject {
  const seeds: QuestionSeed[] = [
    {
      seedId: "seed-1",
      type: "multiple-choice",
      difficulty: 1,
      stem: "What is React?",
      options: ["Library", "Framework", "Language", "Database"],
      correctIndex: 0,
      explanation: "React is a UI library.",
    },
    {
      seedId: "seed-2",
      type: "multiple-choice",
      difficulty: 1,
      stem: "What is JSX?",
      options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "None"],
      correctIndex: 0,
      explanation: "JSX is JavaScript XML.",
    },
  ];

  return {
    id: subjectId,
    title: "Test Subject",
    description: "A test subject",
    version: 1,
    schemaVersion: 1,
    minimumGameVersion: "0.1.0",
    domains: [
      {
        name: "Domain 1",
        concepts: [
          {
            id: conceptId,
            name: "Test Concept",
            domainName: "Domain 1",
            subjectId,
            level: "foundation",
            difficulty: 1,
            prerequisites: [],
            tags: ["test"],
            outcomes: ["Learn testing"],
            knowledge: "Test knowledge",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: seeds,
            practicalChallenges: [],
            interviewPrompts: [],
          },
        ],
      },
    ],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("StartMissionUseCase", () => {
  it("creates a mission and returns it with questions", async () => {
    const playerRepo = new MockPlayerRepository();
    playerRepo.set(createTestPlayer());

    const subjectRepo = new MockSubjectRepository();
    subjectRepo.set(createTestSubject());

    const missionRepo = new MockMissionRepository();
    const missionSelector = new MissionSelector();
    const questionRepo = new MockQuestionRepository();
    const questionProvider = new QuestionProvider(questionRepo);

    const useCase = new StartMissionUseCase(
      playerRepo,
      subjectRepo,
      missionRepo,
      missionSelector,
      questionProvider,
    );

    const input: StartMissionInput = {
      playerId,
      subjectId,
      type: "encounter",
    };

    const result = await useCase.execute(input);

    expect(result.mission).toBeDefined();
    expect(result.mission.id).toBeTruthy();
    expect(result.mission.playerId).toBe(playerId);
    expect(result.mission.subjectId).toBe(subjectId);
    expect(result.mission.type).toBe("encounter");
    expect(result.mission.status).toBe("active");
    expect(result.mission.score).toBe(0);
    expect(result.mission.maxScore).toBe(2); // 2 question seeds
    expect(result.mission.questionIds).toHaveLength(2);
  });

  it("throws when player is not found", async () => {
    const playerRepo = new MockPlayerRepository();
    const subjectRepo = new MockSubjectRepository();
    const missionRepo = new MockMissionRepository();

    const useCase = new StartMissionUseCase(
      playerRepo,
      subjectRepo,
      missionRepo,
      new MissionSelector(),
      new QuestionProvider(new MockQuestionRepository()),
    );

    const input: StartMissionInput = {
      playerId: "nonexistent",
      subjectId,
      type: "encounter",
    };

    await expect(useCase.execute(input)).rejects.toThrow("Player not found: nonexistent");
  });
});

describe("SubmitAnswerUseCase", () => {
  async function setupTestData() {
    const player = createTestPlayer();
    const subject = createTestSubject();
    const question: Question = {
      id: "question-1",
      subjectId,
      conceptId,
      seedId: "seed-1",
      type: "multiple-choice",
      difficulty: 1,
      stem: "What is React?",
      options: ["Library", "Framework", "Language", "Database"],
      correctIndex: 0,
      explanation: "React is a UI library.",
      timesShown: 0,
      lastShownAt: null,
      qualityRating: 1,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    const questionRepo = new MockQuestionRepository();
    const questionProvider = new QuestionProvider(questionRepo);
    const questions = await questionProvider.provideFor(
      { subjectId, conceptId, type: "encounter" },
      subject,
    );

    const mission: Mission = {
      id: "mission-1",
      playerId: playerId,
      subjectId,
      type: "encounter",
      status: "active",
      questionIds: questions.map((q) => q.id),
      currentQuestionIndex: 0,
      score: 0,
      maxScore: questions.length,
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return { player, subject, question, mission, questions };
  }

  it("correct answer returns isCorrect=true and updates XP", async () => {
    const { player, question, mission } = await setupTestData();

    const playerRepo = new MockPlayerRepository();
    playerRepo.set(player);

    const missionRepo = new MockMissionRepository();
    missionRepo.set(mission);

    const missionAttemptRepo = new MockMissionAttemptRepository();

    const questionRepo = new MockQuestionRepository();
    questionRepo.set(question);

    const masteryRepo = new MockConceptMasteryRepository();

    const useCase = new SubmitAnswerUseCase(
      playerRepo,
      missionRepo,
      missionAttemptRepo,
      questionRepo,
      masteryRepo,
      new AnswerEvaluator(),
    );

    const input: SubmitAnswerInput = {
      missionId: mission.id,
      playerId: player.id,
      questionId: question.id,
      selectedIndex: 0, // correct
      timeSpentSeconds: 10,
    };

    const result = await useCase.execute(input);

    expect(result.isCorrect).toBe(true);
    expect(result.correctIndex).toBe(0);
    expect(result.explanation).toBe("React is a UI library.");
    expect(result.xpAwarded).toBeGreaterThan(0);
    expect(result.score).toBe(1);
    expect(result.maxScore).toBe(mission.maxScore);
    expect(result.updatedMastery).toBeGreaterThan(0);

    // Verify XP was actually saved
    const updatedPlayer = await playerRepo.getById(player.id);
    expect(updatedPlayer!.experiencePoints).toBe(result.xpAwarded);
  });

  it("incorrect answer returns isCorrect=false and does not penalize XP to zero", async () => {
    const { player, question, mission } = await setupTestData();

    // Give player some existing XP
    player.experiencePoints = 50;

    const playerRepo = new MockPlayerRepository();
    playerRepo.set(player);

    const missionRepo = new MockMissionRepository();
    missionRepo.set(mission);

    const missionAttemptRepo = new MockMissionAttemptRepository();

    const questionRepo = new MockQuestionRepository();
    questionRepo.set(question);

    const masteryRepo = new MockConceptMasteryRepository();

    const useCase = new SubmitAnswerUseCase(
      playerRepo,
      missionRepo,
      missionAttemptRepo,
      questionRepo,
      masteryRepo,
      new AnswerEvaluator(),
    );

    const input: SubmitAnswerInput = {
      missionId: mission.id,
      playerId: player.id,
      questionId: question.id,
      selectedIndex: 1, // incorrect
      timeSpentSeconds: 15,
    };

    const result = await useCase.execute(input);

    expect(result.isCorrect).toBe(false);
    expect(result.correctIndex).toBe(0);
    expect(result.score).toBe(0); // no points added
    expect(result.maxScore).toBe(mission.maxScore);

    // XP awarded for incorrect answer (5 base - 0 hints = 5)
    expect(result.xpAwarded).toBe(5);

    // Verify player XP is not zero (existing 50 + 5 = 55)
    const updatedPlayer = await playerRepo.getById(player.id);
    expect(updatedPlayer!.experiencePoints).toBe(55);
  });
});
