import { describe, it, expect } from "vitest";
import { GenerateQuestionsUseCase } from "@/modules/questions/application/generate-questions-use-case";
import type { ArtificialIntelligenceGateway } from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { Question } from "@/modules/questions/domain/question";
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
      type: "multiple-choice",
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

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("GenerateQuestionsUseCase", () => {
  it("generates and persists questions for a single concept", async () => {
    const ai = new FakeAiGateway();
    const repo = new FakeQuestionRepository();
    const useCase = new GenerateQuestionsUseCase(ai, repo);

    const result = await useCase.execute({
      subjectId: "nextjs",
      conceptIds: ["nextjs.app-router-introduction"],
      difficultyRange: { min: 1, max: 4 },
      questionTypes: ["multiple-choice"],
      count: 3,
    });

    expect(result.success).toBe(true);
    expect(result.generatedCount).toBe(3);
    expect(result.persistedQuestionIds).toHaveLength(3);
    expect(result.errors).toHaveLength(0);

    // Verify questions were persisted
    for (const id of result.persistedQuestionIds) {
      const q = await repo.getById(id);
      expect(q).not.toBeNull();
      expect(q!.conceptId).toBe("nextjs.app-router-introduction");
      expect(q!.subjectId).toBe("nextjs");
    }
  });

  it("distributes count evenly across multiple concepts", async () => {
    const ai = new FakeAiGateway();
    const repo = new FakeQuestionRepository();
    const useCase = new GenerateQuestionsUseCase(ai, repo);

    const result = await useCase.execute({
      subjectId: "nextjs",
      conceptIds: ["nextjs.routing", "nextjs.caching"],
      difficultyRange: { min: 1, max: 4 },
      questionTypes: ["multiple-choice"],
      count: 6,
    });

    expect(result.success).toBe(true);
    expect(result.generatedCount).toBe(6);
    expect(result.persistedQuestionIds).toHaveLength(6);

    // Verify both concepts got questions
    const routingQuestions = await repo.getByConceptId("nextjs.routing");
    const cachingQuestions = await repo.getByConceptId("nextjs.caching");
    expect(routingQuestions.length).toBeGreaterThanOrEqual(3);
    expect(cachingQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it("returns error result when conceptIds is empty", async () => {
    const ai = new FakeAiGateway();
    const repo = new FakeQuestionRepository();
    const useCase = new GenerateQuestionsUseCase(ai, repo);

    const result = await useCase.execute({
      subjectId: "nextjs",
      conceptIds: [],
      difficultyRange: { min: 1, max: 4 },
      questionTypes: ["multiple-choice"],
      count: 3,
    });

    expect(result.success).toBe(false);
    expect(result.generatedCount).toBe(0);
    expect(result.errors).toContain("At least one concept is required for question generation.");
  });

  it("reports per-concept failures without stopping others", async () => {
    const ai = new FakeAiGateway(["nextjs.broken-concept"]);
    const repo = new FakeQuestionRepository();
    const useCase = new GenerateQuestionsUseCase(ai, repo);

    const result = await useCase.execute({
      subjectId: "nextjs",
      conceptIds: ["nextjs.good-concept", "nextjs.broken-concept"],
      difficultyRange: { min: 1, max: 4 },
      questionTypes: ["multiple-choice"],
      count: 4,
    });

    // Not fully successful (one concept failed) but partial results exist
    expect(result.success).toBe(false);
    expect(result.generatedCount).toBeGreaterThanOrEqual(2);
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.errors[0]).toContain("broken-concept");

    // Good concept's questions should still be persisted
    const goodQuestions = await repo.getByConceptId("nextjs.good-concept");
    expect(goodQuestions.length).toBeGreaterThanOrEqual(2);
  });

  it("respects the requested count limit per concept", async () => {
    const ai = new FakeAiGateway();
    const repo = new FakeQuestionRepository();
    const useCase = new GenerateQuestionsUseCase(ai, repo);

    // Request 1 question, even though the AI would generate more
    const result = await useCase.execute({
      subjectId: "nextjs",
      conceptIds: ["nextjs.data-fetching"],
      difficultyRange: { min: 1, max: 4 },
      questionTypes: ["multiple-choice"],
      count: 1,
    });

    expect(result.success).toBe(true);
    expect(result.generatedCount).toBe(1);
    expect(result.persistedQuestionIds).toHaveLength(1);
  });
});
