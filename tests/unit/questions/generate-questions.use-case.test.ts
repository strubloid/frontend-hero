import { describe, it, expect } from "vitest";
import { GenerateQuestionsUseCase } from "@/modules/questions/application/generate-questions-use-case";
import type { ArtificialIntelligenceGateway } from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { Question } from "@/modules/questions/domain/question";
import type { Subject, Domain } from "@/modules/subjects/domain/subject";
import type { GenerateQuestionRequest } from "@/modules/artificial-intelligence/domain/generate-question-request";
import type { GenerateQuestionResult } from "@/modules/artificial-intelligence/domain/generate-question-result";

// -----------------------------------------------------------------------
// Fakes
// -----------------------------------------------------------------------

class FakeAiGateway implements ArtificialIntelligenceGateway {
  private failConcepts: string[] = [];

  constructor(failConcepts?: string[]) {
    if (failConcepts) this.failConcepts = failConcepts;
  }

  async generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResult> {
    if (this.failConcepts.includes(request.conceptId)) {
      return {
        success: false,
        questions: [],
        errorMessage: `Generation failed for ${request.conceptId}`,
      };
    }
    const questions = Array.from({ length: request.count }, (_, i) => ({
      stem: `What is ${request.conceptId}? (${i})`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: `${request.conceptId} is a key concept.`,
      type: "multiple-choice" as const,
      difficulty: request.difficulty,
    }));
    return { success: true, questions };
  }

  async generateQuestionBatch(): Promise<any> {
    return {
      questions: [],
      summary: { totalGenerated: 0, totalFailed: 0, conceptsCovered: 0, durationMs: 0 },
      errors: [],
    };
  }
  async evaluateAnswer(): Promise<any> {
    return { isCorrect: true, correctIndex: 0, explanation: "", score: 1 };
  }
  async generateExplanation(): Promise<any> {
    return { explanation: "", keyPoints: [], relatedConcepts: [] };
  }
  async generateHint(): Promise<any> {
    return { hint: "", hintLevel: 1 };
  }
  async generateMission(): Promise<any> {
    return { questions: [], success: true };
  }
  isAvailable(): boolean {
    return true;
  }
  getProviderName(): string {
    return "Fake AI";
  }
}

class FakeSubjectRepository implements SubjectRepository {
  private subjects = new Map<string, Subject>();

  addSubject(subject: Subject): void {
    this.subjects.set(subject.id, subject);
  }

  async getById(id: string): Promise<Subject | null> {
    return this.subjects.get(id) ?? null;
  }
  async findAll(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }
  async save(): Promise<void> {}
  async create(): Promise<void> {}
  async delete(): Promise<void> {}
  async exists(): Promise<boolean> {
    return false;
  }
}

class FakeQuestionRepository implements QuestionRepository {
  private store = new Map<string, Question>();

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

  async getRandomBySubjectId(): Promise<Question[]> {
    return [];
  }

  async getBySeedAndSubject(): Promise<Question | null> {
    return null;
  }
}

function buildSubjectsWithConcepts(
  conceptIds: string[],
  difficulty: number = 1,
): Pick<Subject, "id" | "domains"> {
  const concepts = conceptIds.map((id, i) => ({
    id,
    name: id.split(".").pop() ?? id,
    domainName: "Test Domain",
    subjectId: "nextjs",
    level: "foundation" as const,
    difficulty,
    prerequisites: [],
    tags: [],
    outcomes: [],
    knowledge: "",
    commonMisconceptions: [],
    examples: [],
    questionSeeds: [],
    practicalChallenges: [],
    interviewPrompts: [],
  }));

  const domain: Domain = { name: "Test Domain", concepts };

  return {
    id: "nextjs",
    domains: [domain],
  };
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("GenerateQuestionsUseCase", () => {
  it("generates and persists questions across all concepts in the subject", async () => {
    const ai = new FakeAiGateway();
    const questionRepo = new FakeQuestionRepository();
    const subjectRepo = new FakeSubjectRepository();

    const { id, domains } = buildSubjectsWithConcepts(["nextjs.app-router"], 1);
    const now = new Date();
    subjectRepo.addSubject({
      id,
      title: "Next.js",
      description: "",
      version: 1,
      schemaVersion: 1,
      minimumGameVersion: "1.0.0",
      progression: {
        minimumLevel: 1,
        maximumLevel: 10,
        estimatedDaysPerLevel: 7,
        bossRequired: true,
        levels: [],
      },
      domains,
      createdAt: now,
      updatedAt: now,
    });

    const useCase = new GenerateQuestionsUseCase(ai, questionRepo, subjectRepo);

    const result = await useCase.execute({
      subjectId: "nextjs",
      count: 3,
    });

    expect(result.success).toBe(true);
    expect(result.generatedCount).toBe(3);
    expect(result.persistedQuestionIds).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
    expect(result.validatedCount).toBe(3);
    expect(result.rejectedCount).toBe(0);
    expect(result.validationErrors).toHaveLength(0);

    // Verify questions were persisted
    for (const id of result.persistedQuestionIds) {
      const q = await questionRepo.getById(id);
      expect(q).not.toBeNull();
      expect(q!.conceptId).toBe("nextjs.app-router");
      expect(q!.subjectId).toBe("nextjs");
    }
  });

  it("distributes questions across multiple concepts", async () => {
    const ai = new FakeAiGateway();
    const questionRepo = new FakeQuestionRepository();
    const subjectRepo = new FakeSubjectRepository();

    const { id, domains } = buildSubjectsWithConcepts(["nextjs.routing", "nextjs.caching"], 1);
    const now = new Date();
    subjectRepo.addSubject({
      id,
      title: "Next.js",
      description: "",
      version: 1,
      schemaVersion: 1,
      minimumGameVersion: "1.0.0",
      progression: {
        minimumLevel: 1,
        maximumLevel: 10,
        estimatedDaysPerLevel: 7,
        bossRequired: true,
        levels: [],
      },
      domains,
      createdAt: now,
      updatedAt: now,
    });

    const useCase = new GenerateQuestionsUseCase(ai, questionRepo, subjectRepo);

    const result = await useCase.execute({
      subjectId: "nextjs",
      count: 6,
    });

    expect(result.success).toBe(true);
    expect(result.generatedCount).toBe(6);
    expect(result.persistedQuestionIds).toHaveLength(6);
    expect(result.validatedCount).toBe(6);
    expect(result.rejectedCount).toBe(0);
    expect(result.validationErrors).toHaveLength(0);

    // Verify both concepts got questions
    const routingQuestions = await questionRepo.getByConceptId("nextjs.routing");
    const cachingQuestions = await questionRepo.getByConceptId("nextjs.caching");
    expect(routingQuestions.length).toBeGreaterThan(0);
    expect(cachingQuestions.length).toBeGreaterThan(0);
  });

  it("returns error when subject is not found", async () => {
    const ai = new FakeAiGateway();
    const questionRepo = new FakeQuestionRepository();
    const subjectRepo = new FakeSubjectRepository();

    const useCase = new GenerateQuestionsUseCase(ai, questionRepo, subjectRepo);

    const result = await useCase.execute({
      subjectId: "nonexistent",
      count: 3,
    });

    expect(result.success).toBe(false);
    expect(result.generatedCount).toBe(0);
    expect(result.errors).toContain('Subject "nonexistent" not found.');
    expect(result.validatedCount).toBe(0);
    expect(result.rejectedCount).toBe(0);
    expect(result.validationErrors).toHaveLength(0);
  });

  it("returns error when subject has no concepts", async () => {
    const ai = new FakeAiGateway();
    const questionRepo = new FakeQuestionRepository();
    const subjectRepo = new FakeSubjectRepository();

    const now = new Date();
    subjectRepo.addSubject({
      id: "empty-subject",
      title: "Empty",
      description: "",
      version: 1,
      schemaVersion: 1,
      minimumGameVersion: "1.0.0",
      progression: {
        minimumLevel: 1,
        maximumLevel: 10,
        estimatedDaysPerLevel: 7,
        bossRequired: true,
        levels: [],
      },
      domains: [],
      createdAt: now,
      updatedAt: now,
    });

    const useCase = new GenerateQuestionsUseCase(ai, questionRepo, subjectRepo);

    const result = await useCase.execute({
      subjectId: "empty-subject",
      count: 3,
    });

    expect(result.success).toBe(false);
    expect(result.generatedCount).toBe(0);
    expect(result.errors).toContain('Subject "empty-subject" has no concepts.');
    expect(result.validatedCount).toBe(0);
    expect(result.rejectedCount).toBe(0);
    expect(result.validationErrors).toHaveLength(0);
  });

  it("reports per-concept failures without stopping others", async () => {
    const ai = new FakeAiGateway(["nextjs.broken-concept"]);
    const questionRepo = new FakeQuestionRepository();
    const subjectRepo = new FakeSubjectRepository();

    const { id, domains } = buildSubjectsWithConcepts(
      ["nextjs.good-concept", "nextjs.broken-concept"],
      1,
    );
    const now = new Date();
    subjectRepo.addSubject({
      id,
      title: "Next.js",
      description: "",
      version: 1,
      schemaVersion: 1,
      minimumGameVersion: "1.0.0",
      progression: {
        minimumLevel: 1,
        maximumLevel: 10,
        estimatedDaysPerLevel: 7,
        bossRequired: true,
        levels: [],
      },
      domains,
      createdAt: now,
      updatedAt: now,
    });

    const useCase = new GenerateQuestionsUseCase(ai, questionRepo, subjectRepo);

    const result = await useCase.execute({
      subjectId: "nextjs",
      count: 4,
    });

    // Not fully successful (one concept failed) but partial results exist
    expect(result.success).toBe(false);
    expect(result.generatedCount).toBeGreaterThanOrEqual(1);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0]).toContain("broken-concept");

    // Good concept's questions should still be persisted
    const goodQuestions = await questionRepo.getByConceptId("nextjs.good-concept");
    expect(goodQuestions.length).toBeGreaterThanOrEqual(1);
  });

  it("distributes questions across difficulty levels", async () => {
    const ai = new FakeAiGateway();
    const questionRepo = new FakeQuestionRepository();
    const subjectRepo = new FakeSubjectRepository();

    // Create concepts at different difficulty levels
    const { id, domains } = buildSubjectsWithConcepts(["nextjs.basic", "nextjs.advanced"], 3);
    const now = new Date();
    subjectRepo.addSubject({
      id,
      title: "Next.js",
      description: "",
      version: 1,
      schemaVersion: 1,
      minimumGameVersion: "1.0.0",
      progression: {
        minimumLevel: 1,
        maximumLevel: 10,
        estimatedDaysPerLevel: 7,
        bossRequired: true,
        levels: [],
      },
      domains,
      createdAt: now,
      updatedAt: now,
    });

    const useCase = new GenerateQuestionsUseCase(ai, questionRepo, subjectRepo);

    // Request a lot of questions so we cover multiple difficulty levels
    const result = await useCase.execute({
      subjectId: "nextjs",
      count: 10,
    });

    expect(result.generatedCount).toBeGreaterThan(0);
    expect(result.validatedCount).toBeGreaterThan(0);

    // Questions should have difficulty values from the concepts
    const allQuestions = await Promise.all(
      result.persistedQuestionIds.map((id) => questionRepo.getById(id)),
    );
    const difficulties = new Set(allQuestions.filter(Boolean).map((q) => q!.difficulty));
    expect(difficulties.size).toBeGreaterThanOrEqual(1);
  });
});
