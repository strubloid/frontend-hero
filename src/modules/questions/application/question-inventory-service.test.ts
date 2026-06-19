import { describe, expect, it } from "vitest";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { Question } from "@/modules/questions/domain/question";
import { InventoryHealth } from "@/modules/questions/domain/inventory-health";
import { QuestionInventoryService } from "./question-inventory-service";

class FakeQuestionRepository implements QuestionRepository {
  constructor(private readonly questions: Question[]) {}

  async getById(id: string): Promise<Question | null> {
    return this.questions.find((question) => question.id === id) ?? null;
  }

  async create(question: Question): Promise<Question> {
    this.questions.push(question);
    return question;
  }

  async getByConceptId(conceptId: string): Promise<Question[]> {
    return this.questions.filter((question) => question.conceptId === conceptId);
  }

  async getRandomBySubjectId(subjectId: string, _limit: number): Promise<Question[]> {
    return this.questions.filter((question) => question.subjectId === subjectId);
  }

  async getBySeedAndSubject(seedId: string, subjectId: string): Promise<Question | null> {
    return (
      this.questions.find(
        (question) => question.seedId === seedId && question.subjectId === subjectId,
      ) ?? null
    );
  }
}

function question(overrides: Partial<Question>): Question {
  const now = new Date();
  return {
    id: overrides.id ?? "q-1",
    subjectId: overrides.subjectId ?? "nextjs",
    conceptId: overrides.conceptId ?? "nextjs.routing",
    seedId: overrides.seedId ?? "seed-1",
    type: "multiple-choice",
    difficulty: overrides.difficulty ?? 1,
    stem: "Question?",
    options: ["A", "B", "C", "D"],
    correctIndex: 0,
    explanation: "Explanation",
    timesShown: overrides.timesShown ?? 0,
    lastShownAt: overrides.lastShownAt ?? null,
    qualityRating: 5,
    createdAt: now,
    updatedAt: now,
  };
}

describe("QuestionInventoryService", () => {
  it("marks empty subject inventory as empty", async () => {
    const service = new QuestionInventoryService(new FakeQuestionRepository([]));

    const status = await service.getInventoryStatus("nextjs");

    expect(status.health).toBe(InventoryHealth.EMPTY);
    expect(status.totalApproved).toBe(0);
  });

  it("calculates concept and difficulty inventory", async () => {
    const questions = [
      question({ id: "q1", conceptId: "nextjs.routing", difficulty: 1 }),
      question({ id: "q2", conceptId: "nextjs.routing", difficulty: 2 }),
      question({ id: "q3", conceptId: "nextjs.server-components", difficulty: 2 }),
    ];
    const service = new QuestionInventoryService(new FakeQuestionRepository(questions));

    const status = await service.getInventoryStatus("nextjs");

    expect(status.health).toBe(InventoryHealth.CRITICAL);
    expect(status.byConcept.get("nextjs.routing")?.approved).toBe(2);
    expect(status.byDifficulty[2]).toBe(2);
  });

  it("finds concepts below generation threshold", async () => {
    const questions = [question({ id: "q1", conceptId: "nextjs.routing" })];
    const service = new QuestionInventoryService(new FakeQuestionRepository(questions));

    const concepts = await service.getConceptsNeedingGeneration("nextjs", 10);

    expect(concepts).toEqual(["nextjs.routing"]);
  });
});
