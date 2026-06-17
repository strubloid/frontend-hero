import { describe, it, expect } from "vitest";
import { RetentionScore } from "@/modules/mastery/domain/retention-score";

describe("RetentionScore", () => {
  it("creates from a valid value", () => {
    expect(RetentionScore.from(0.7).toNumber()).toBe(0.7);
  });

  it("throws for negative values", () => {
    expect(() => RetentionScore.from(-0.1)).toThrow();
  });

  it("rounds to 3 decimals", () => {
    expect(RetentionScore.from(0.12345).toNumber()).toBe(0.123);
  });

  it("zero() returns 0", () => {
    expect(RetentionScore.zero().toNumber()).toBe(0);
  });

  it("computeDecay applies exponential forgetting curve", () => {
    // After 0 hours, no decay
    const result = RetentionScore.computeDecay(1.0, 0, 24);
    expect(result.toNumber()).toBeCloseTo(1.0, 2);

    // After 24 hours (1 half-life), retention should halve
    const result2 = RetentionScore.computeDecay(1.0, 24, 24);
    expect(result2.toNumber()).toBeCloseTo(0.5, 1);

    // After 48 hours (2 half-lives), retention should quarter
    const result3 = RetentionScore.computeDecay(1.0, 48, 24);
    expect(result3.toNumber()).toBeCloseTo(0.25, 1);

    // Starting from 0.8, after 1 half-life
    const result4 = RetentionScore.computeDecay(0.8, 24, 24);
    expect(result4.toNumber()).toBeCloseTo(0.4, 1);
  });
});
