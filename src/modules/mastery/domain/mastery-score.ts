/**
 * A normalized mastery score in the range [0, 1].
 *
 * 0.0 = not mastered at all
 * 1.0 = fully mastered
 *
 * The score synthesises correctness history, confidence, and retention decay.
 */
export class MasteryScore {
  private constructor(private readonly value: number) {
    if (value < 0 || value > 1 || !Number.isFinite(value)) {
      throw new Error(`MasteryScore must be a finite number in [0, 1]; got ${value}`);
    }
  }

  static from(value: number): MasteryScore {
    return new MasteryScore(Math.round(value * 1000) / 1000);
  }

  static zero(): MasteryScore {
    return new MasteryScore(0);
  }

  static max(): MasteryScore {
    return new MasteryScore(1);
  }

  toNumber(): number {
    return this.value;
  }

  isMastered(): boolean {
    return this.value >= 0.8;
  }

  isDecaying(): boolean {
    return this.value < 0.4;
  }

  add(delta: number): MasteryScore {
    return MasteryScore.from(Math.min(1, Math.max(0, this.value + delta)));
  }

  multiply(factor: number): MasteryScore {
    return MasteryScore.from(Math.min(1, Math.max(0, this.value * factor)));
  }
}
