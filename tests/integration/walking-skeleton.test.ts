import { describe, it, expect } from "vitest";
import { v4 as uuid } from "uuid";
import { Player } from "@/modules/players/domain/player";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import { Subject } from "@/modules/subjects/domain/subject";
import { Question } from "@/modules/questions/domain/question";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { Mission, MissionAttempt } from "@/modules/missions/domain/mission";
import {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import { ConceptMastery } from "@/modules/progression/domain/mastery";
import { ConceptMasteryRepository } from "@/modules/progression/domain/concept-mastery-repository";
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

// ---------------------------------------------------------------------------
// In-memory repository implementations (same pattern as production actions)
// ---------------------------------------------------------------------------

class InMemoryPlayerRepository implements PlayerRepository {
  private store = new Map<string, Player>();
  async getById(id: string) {
    return this.store.get(id) ?? null;
  }
  async create(player: Player) {
    this.store.set(player.id, player);
    return player;
  }
  async save(player: Player) {
    this.store.set(player.id, player);
    return player;
  }
}

class InMemorySubjectRepository implements SubjectRepository {
  private store = new Map<string, Subject>();
  set(subject: Subject) {
    this.store.set(subject.id, subject);
  }
  async getById(id: string) {
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

class InMemoryMissionRepository implements MissionRepository {
  private store = new Map<string, Mission>();
  private activeByPlayer = new Map<string, string>();
  async getById(id: string) {
    return this.store.get(id) ?? null;
  }
  async create(mission: Mission) {
    this.store.set(mission.id, mission);
    this.activeByPlayer.set(mission.playerId, mission.id);
    return mission;
  }
  async save(mission: Mission) {
    this.store.set(mission.id, mission);
    return mission;
  }
  async getActiveByPlayer(playerId: string) {
    const id = this.activeByPlayer.get(playerId);
    if (!id) return null;
    return this.store.get(id) ?? null;
  }
}

class InMemoryMissionAttemptRepository implements MissionAttemptRepository {
  private store = new Map<string, MissionAttempt>();
  async create(attempt: MissionAttempt) {
    this.store.set(attempt.id, attempt);
    return attempt;
  }
  async getByMission(missionId: string) {
    return Array.from(this.store.values()).filter((a) => a.missionId === missionId);
  }
}

class InMemoryQuestionRepository implements QuestionRepository {
  private store = new Map<string, Question>();
  set(question: Question) {
    this.store.set(question.id, question);
  }
  async getById(id: string) {
    return this.store.get(id) ?? null;
  }
  async create(question: Question) {
    this.store.set(question.id, question);
    return question;
  }
  async getByConceptId(conceptId: string) {
    return Array.from(this.store.values()).filter((q) => q.conceptId === conceptId);
  }
  async getRandomBySubjectId(subjectId: string, limit: number) {
    return Array.from(this.store.values())
      .filter((q) => q.subjectId === subjectId)
      .slice(0, limit);
  }
  async getBySeedAndSubject(seedId: string, subjectId: string) {
    return (
      Array.from(this.store.values()).find(
        (q) => q.seedId === seedId && q.subjectId === subjectId,
      ) ?? null
    );
  }
}

class InMemoryConceptMasteryRepository implements ConceptMasteryRepository {
  private store = new Map<string, ConceptMastery>();
  async getByPlayerAndConcept(playerId: string, conceptId: string) {
    return this.store.get(`${playerId}:${conceptId}`) ?? null;
  }
  async save(mastery: ConceptMastery) {
    this.store.set(`${mastery.playerId}:${mastery.conceptId}`, mastery);
    return mastery;
  }
}

// ---------------------------------------------------------------------------
// Subject file path
// ---------------------------------------------------------------------------

const SUBJECTS_DIR = "subjects";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Walking skeleton — full flow", () => {
  it("loads subject → starts mission → submits answer → updates player", async () => {
    // 1. Set up repositories
    const playerRepo = new InMemoryPlayerRepository();
    const subjectRepo = new InMemorySubjectRepository();
    const missionRepo = new InMemoryMissionRepository();
    const missionAttemptRepo = new InMemoryMissionAttemptRepository();
    const questionRepo = new InMemoryQuestionRepository();
    const masteryRepo = new InMemoryConceptMasteryRepository();

    // 2. Import the subject from the file system
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
    const subject = importResult.subject;
    expect(subject.id).toBe("nextjs");
    expect(subject.domains.length).toBeGreaterThan(0);

    subjectRepo.set(subject);

    // 3. Create a player
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
      createdAt: now,
      updatedAt: now,
    });

    const savedPlayer = await playerRepo.getById(playerId);
    expect(savedPlayer).not.toBeNull();
    expect(savedPlayer!.experiencePoints).toBe(0);

    // 4. Pre-generate questions for the first concept
    const questionProvider = new QuestionProvider(questionRepo);
    const firstDomain = subject.domains[0];
    expect(firstDomain).toBeDefined();
    const firstConcept = firstDomain!.concepts[0];
    expect(firstConcept).toBeDefined();
    await questionProvider.provideForConcept(firstConcept!, subject.id);
    const questions = await questionRepo.getByConceptId(firstConcept!.id);
    expect(questions.length).toBeGreaterThan(0);

    // 5. Start a mission
    const startMissionUseCase = new StartMissionUseCase(
      playerRepo,
      subjectRepo,
      missionRepo,
      new MissionSelector(),
      new QuestionProvider(questionRepo),
    );

    const missionResult = await startMissionUseCase.execute({
      playerId,
      subjectId: "nextjs",
      type: "encounter",
    });

    expect(missionResult.mission).toBeDefined();
    expect(missionResult.mission.status).toBe("active");
    expect(missionResult.mission.questionIds.length).toBeGreaterThan(0);
    expect(missionResult.mission.score).toBe(0);

    // 6. Get the first question from the mission
    const firstQuestionId = missionResult.mission.questionIds[0];
    const firstQuestion = await questionRepo.getById(firstQuestionId);
    expect(firstQuestion).not.toBeNull();
    expect(firstQuestion!.stem).toBeTruthy();
    expect(firstQuestion!.options.length).toBeGreaterThan(1);

    // 7. Submit a correct answer
    const submitAnswerUseCase = new SubmitAnswerUseCase(
      playerRepo,
      missionRepo,
      missionAttemptRepo,
      questionRepo,
      masteryRepo,
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

    // 8. Verify player XP was updated
    const updatedPlayer = await playerRepo.getById(playerId);
    expect(updatedPlayer!.experiencePoints).toBe(correctResult.xpAwarded);

    // 9. Verify mastery was saved
    const mastery = await masteryRepo.getByPlayerAndConcept(playerId, firstQuestion!.conceptId);
    expect(mastery).not.toBeNull();
    expect(mastery!.correctAttempts).toBe(1);

    // 10. Submit an incorrect answer
    const wrongIndex = firstQuestion!.correctIndex === 0 ? 1 : firstQuestion!.correctIndex - 1;

    const incorrectResult = await submitAnswerUseCase.execute({
      missionId: missionResult.mission.id,
      playerId,
      questionId: firstQuestionId,
      selectedIndex: wrongIndex,
      timeSpentSeconds: 3,
    });

    expect(incorrectResult.isCorrect).toBe(false);
    // Should be at most the same XP as before (incorrect may earn partial XP)
    expect(incorrectResult.updatedMastery).toBeLessThan(correctResult.updatedMastery);

    // 11. Verify mission attempt was recorded
    const attempts = await missionAttemptRepo.getByMission(missionResult.mission.id);
    expect(attempts.length).toBe(2);
    expect(attempts[0].isCorrect).toBe(true);
    expect(attempts[1].isCorrect).toBe(false);
  });

  it("handles missing player gracefully", async () => {
    const playerRepo = new InMemoryPlayerRepository();
    const subjectRepo = new InMemorySubjectRepository();
    const missionRepo = new InMemoryMissionRepository();
    const questionRepo = new InMemoryQuestionRepository();
    const masteryRepo = new InMemoryConceptMasteryRepository();
    const missionAttemptRepo = new InMemoryMissionAttemptRepository();

    const useCase = new StartMissionUseCase(
      playerRepo,
      subjectRepo,
      missionRepo,
      new MissionSelector(),
      new QuestionProvider(questionRepo),
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
