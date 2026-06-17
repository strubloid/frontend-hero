export class XpCalculator {
  static calculate(isCorrect: boolean, difficulty: number, hintsUsed: number): number {
    if (!isCorrect) return Math.max(0, 5 - hintsUsed * 2);
    const baseXp = 10 * difficulty;
    const hintPenalty = hintsUsed * 3;
    return Math.max(5, baseXp - hintPenalty);
  }
}
