import { describe, it, expect } from "vitest";
import { MasteryScore } from "@/modules/mastery/domain/mastery-score";

describe("MasteryScore", () => {
  it("creates from a value in [0,1]", () => {
    expect(MasteryScore.from(0.5).toNumber()).toBe(0.5);
  });

  it("rounds to 3 decimal places", () => {
    expect(MasteryScore.from(0.1234).toNumber()).toBe(0.123);
  });

  it("throws for negative values", () => {
    expect(() => MasteryScore.from(-0.1)).toThrow();
  });

  it("throws for values above 1", () => {
    expect(() => MasteryScore.from(1.1)).toThrow();
  });

  it("throws for NaN", () => {
    expect(() => MasteryScore.from(NaN)).toThrow();
  });

  it("zero() returns 0", () => {
    expect(MasteryScore.zero().toNumber()).toBe(0);
  });

  it("max() returns 1", () => {
    expect(MasteryScore.max().toNumber()).toBe(1);
  });

  it("isMastered returns true when >= 0.8", () => {
    expect(MasteryScore.from(0.8).isMastered()).toBe(true);
    expect(MasteryScore.from(0.79).isMastered()).toBe(false);
  });

  it("isDecaying returns true when < 0.4", () => {
    expect(MasteryScore.from(0.39).isDecaying()).toBe(true);
    expect(MasteryScore.from(0.4).isDecaying()).toBe(false);
  });

  it("add clamps to [0,1]", () => {
    expect(MasteryScore.from(0.9).add(0.2).toNumber()).toBe(1);
    expect(MasteryScore.from(0.1).add(-0.2).toNumber()).toBe(0);
  });

  it("multiply clamps to [0,1]", () => {
    expect(MasteryScore.from(0.5).multiply(2).toNumber()).toBe(1);
    expect(MasteryScore.from(0.5).multiply(-1).toNumber()).toBe(0);
  });
});
