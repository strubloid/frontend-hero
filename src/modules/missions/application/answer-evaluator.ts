import type { QuestionTypeRegistry } from "@/modules/questions/infrastructure/question-type-registry";

export interface EvaluationResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
}

export class AnswerEvaluator {
  constructor(private readonly registry?: QuestionTypeRegistry) {}

  evaluate(
    selectedIndex: number,
    correctIndex: number,
    explanation: string,
    questionType: string = "multiple-choice",
  ): EvaluationResult {
    // Try to use the registry-based evaluator for the question type
    if (this.registry && this.registry.hasModule(questionType)) {
      const module = this.registry.getModule(questionType);
      const evaluator = module.createEvaluator();
      const result = evaluator.evaluate(
        {
          id: "",
          subjectId: "",
          conceptId: "",
          seedId: "",
          type: questionType,
          difficulty: 1,
          stem: "",
          options: [],
          correctIndex,
          explanation,
          timesShown: 0,
          lastShownAt: null,
          qualityRating: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { value: selectedIndex, selectedIndex, answerTimeMs: 0 },
      );
      return {
        isCorrect: result.isCorrect,
        correctIndex: result.correctIndex,
        explanation: result.feedback || explanation,
      };
    }

    // Fallback: exact index match for all types
    const isCorrect = selectedIndex === correctIndex;

    return {
      isCorrect,
      correctIndex,
      explanation,
    };
  }
}
