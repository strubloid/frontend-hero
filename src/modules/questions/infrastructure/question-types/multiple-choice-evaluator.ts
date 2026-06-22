import type { Question } from "@/modules/questions/domain/question";
import type {
  QuestionEvaluator,
  EvaluationResult,
  PlayerAnswer,
} from "@/modules/questions/domain/interfaces/question-evaluator";

export class MultipleChoiceEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const isCorrect = answer.selectedIndex === question.correctIndex;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: question.explanation,
      correctIndex: question.correctIndex,
    };
  }

  getExpectedInputType(): "selection" {
    return "selection";
  }
}
