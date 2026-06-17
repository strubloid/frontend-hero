export class MasteryCalculator {
  static calculate(currentMastery: number, isCorrect: boolean, difficulty: number): number {
    if (isCorrect) {
      const gain = 5 + difficulty * 3;
      return Math.min(100, currentMastery + gain);
    }
    const loss = 10 + difficulty * 2;
    return Math.max(0, currentMastery - loss);
  }
}
