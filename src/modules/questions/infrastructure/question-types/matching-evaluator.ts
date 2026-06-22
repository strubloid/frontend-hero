import type { Question } from "@/modules/questions/domain/question";
import type {
  QuestionEvaluator,
  EvaluationResult,
  PlayerAnswer,
} from "@/modules/questions/domain/interfaces/question-evaluator";

export class MatchingEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const isCorrect = answer.selectedIndex === question.correctIndex;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect
        ? `Correct match! ${question.explanation}`
        : `The correct match is "${question.options[question.correctIndex]}". ${question.explanation}`,
      correctIndex: question.correctIndex,
    };
  }

  getExpectedInputType(): "selection" {
    return "selection";
  }
}
