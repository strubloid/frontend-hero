import type { Question } from "@/modules/questions/domain/question";
import type {
  QuestionEvaluator,
  EvaluationResult,
  PlayerAnswer,
} from "@/modules/questions/domain/interfaces/question-evaluator";

export class ExplainItEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const text = typeof answer.value === "string" ? answer.value : String(answer.value ?? "");
    const hasContent = text.trim().length > 5;

    return {
      isCorrect: hasContent,
      score: hasContent ? 1 : 0,
      feedback: hasContent
        ? "Thanks for your explanation! Review the model answer below to deepen your understanding."
        : "Please provide a more detailed explanation.",
      correctIndex: 0,
    };
  }

  getExpectedInputType(): "explanation" {
    return "explanation";
  }
}
