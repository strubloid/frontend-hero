import { describe, expect, it } from "vitest";
import { BigPickleGateway } from "./big-pickle-gateway";

describe("BigPickleGateway", () => {
  it("reports demo provider unavailable by default", () => {
    const gateway = new BigPickleGateway();

    expect(gateway.getProviderName()).toBe("Big Pickle (Demo Mode)");
    expect(gateway.isAvailable()).toBe(false);
  });

  it("generates varied questions for a concept", async () => {
    const gateway = new BigPickleGateway();

    const result = await gateway.generateQuestion({
      subjectId: "nextjs",
      conceptId: "nextjs.server-components",
      difficulty: 2,
      questionType: "multiple-choice",
      count: 3,
    });

    expect(result.success).toBe(true);
    expect(result.questions).toHaveLength(3);
    expect(new Set(result.questions.map((question) => question.stem)).size).toBe(3);
    expect(result.questions[0]?.options).toHaveLength(4);
    expect(result.questions.every((question) => question.correctIndex === 0)).toBe(true);
  });
});
