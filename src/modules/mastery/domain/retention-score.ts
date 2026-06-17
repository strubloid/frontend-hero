/**
 * A retention score in [0, 1] estimating how well the player still retains
 * knowledge of a concept based on time since last review and past performance.
 *
 * 0.0 = completely forgotten
 * 1.0 = perfectly retained
 */
export class RetentionScore {
  private constructor(private readonly value: number) {
    if (value < 0 || value > 1 || !Number.isFinite(value)) {
      throw new Error(`RetentionScore must be a finite number in [0, 1]; got ${value}`);
    }
  }

  static from(value: number): RetentionScore {
    return new RetentionScore(Math.round(value * 1000) / 1000);
  }

  static zero(): RetentionScore {
    return new RetentionScore(0);
  }

  toNumber(): number {
    return this.value;
  }

  /**
   * Compute retention decay using an exponential forgetting curve.
   *
   * @param hoursSinceLastReview — elapsed time in hours.
   * @param stabilityHours — half-life in hours (how long until retention halves).
   */
  static computeDecay(score: number, hoursSinceLastReview: number, stabilityHours: number): RetentionScore {
    const decay = Math.exp(-(hoursSinceLastReview / stabilityHours) * Math.LN2);
    return RetentionScore.from(score * decay);
  }
}
