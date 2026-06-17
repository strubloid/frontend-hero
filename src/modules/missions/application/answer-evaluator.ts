export interface EvaluationResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
}

export class AnswerEvaluator {
  evaluate(selectedIndex: number, correctIndex: number, explanation: string): EvaluationResult {
    return {
      isCorrect: selectedIndex === correctIndex,
      correctIndex,
      explanation,
    };
  }
}
