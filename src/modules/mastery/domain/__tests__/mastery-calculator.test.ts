import { describe, it, expect, beforeEach } from "vitest";
import { MasteryCalculator, MasteryUpdateInput } from "@/modules/mastery/domain/mastery-calculator";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";

describe("MasteryCalculator", () => {
  let calculator: MasteryCalculator;
  let baseInput: MasteryUpdateInput;

  beforeEach(() => {
    calculator = new MasteryCalculator();
    baseInput = {
      playerId: "player-1",
      conceptId: "event-loop",
      subjectId: "nextjs",
      isCorrect: true,
      difficulty: 2,
      missionType: "encounter",
      responseTimeMs: 5000,
      currentMastery: null,
    };
  });

  it("initial mastery starts from zero", () => {
    const result = calculator.update(baseInput);
    expect(result.mastery.masteryScore).toBeGreaterThan(0);
    expect(result.mastery.masteryScore).toBeLessThanOrEqual(0.2);
  });

  it("correct answer increases mastery", () => {
    const first = calculator.update(baseInput);
    const second = calculator.update({ ...baseInput, currentMastery: first.mastery });
    expect(second.mastery.masteryScore).toBeGreaterThan(first.mastery.masteryScore);
  });

  it("incorrect answer decreases mastery", () => {
    const incorrect = calculator.update({ ...baseInput, isCorrect: false });
    expect(incorrect.mastery.masteryScore).toBeLessThan(0.3);
    expect(incorrect.mastery.incorrectAttempts).toBe(1);
  });

  it("consecutive correct answers increase confidence", () => {
    let mastery: ConceptMastery | null = null;
    let result;
    for (let i = 0; i < 5; i++) {
      result = calculator.update({ ...baseInput, currentMastery: mastery });
      mastery = result.mastery;
    }
    expect(result!.mastery.confidenceScore).toBeGreaterThan(0.5);
    expect(result!.mastery.consecutiveCorrectAnswers).toBe(5);
  });

  it("incorrect after streak resets consecutive counter", () => {
    let mastery: ConceptMastery | null = null;
    for (let i = 0; i < 3; i++) {
      const result = calculator.update({ ...baseInput, currentMastery: mastery });
      mastery = result.mastery;
    }
    expect(mastery!.consecutiveCorrectAnswers).toBe(3);

    const failResult = calculator.update({
      ...baseInput,
      isCorrect: false,
      currentMastery: mastery,
    });
    expect(failResult.mastery.consecutiveCorrectAnswers).toBe(0);
  });

  it("fluency bonus for fast correct answers (< 3s)", () => {
    const slow = calculator.update({ ...baseInput, responseTimeMs: 5000 });
    const fast = calculator.update({ ...baseInput, responseTimeMs: 2000 });
    expect(fast.mastery.masteryScore).toBeGreaterThan(slow.mastery.masteryScore);
  });

  it("harder difficulty increases mastery gain on correct", () => {
    const easy = calculator.update({ ...baseInput, difficulty: 1 });
    const hard = calculator.update({ ...baseInput, difficulty: 5 });
    expect(hard.mastery.masteryScore).toBeGreaterThan(easy.mastery.masteryScore);
  });

  it("harder difficulty increases mastery loss on incorrect", () => {
    // Build up to a decent mastery first
    let m = null;
    for (let i = 0; i < 5; i++) {
      const r = calculator.update({ ...baseInput, currentMastery: m });
      m = r.mastery;
    }
    const easyFail = calculator.update({
      ...baseInput,
      isCorrect: false,
      difficulty: 1,
      currentMastery: m,
    });
    const hardFail = calculator.update({
      ...baseInput,
      isCorrect: false,
      difficulty: 5,
      currentMastery: m,
    });
    expect(easyFail.mastery.masteryScore).toBeGreaterThan(hardFail.mastery.masteryScore);
  });

  it("demonstratedContexts tracks mission types", () => {
    const r1 = calculator.update({ ...baseInput, missionType: "encounter" });
    const r2 = calculator.update({
      ...baseInput,
      missionType: "review",
      currentMastery: r1.mastery,
    });
    expect(r2.mastery.demonstratedContexts).toHaveLength(2);
    expect(r2.mastery.demonstratedContexts[0].missionType).toBe("encounter");
    expect(r2.mastery.demonstratedContexts[1].missionType).toBe("review");
  });

  it("returns deltas", () => {
    const result = calculator.update(baseInput);
    expect(result.masteryDelta).toBeDefined();
    expect(result.confidenceDelta).toBeDefined();
    expect(result.retentionDelta).toBeDefined();
  });
});
