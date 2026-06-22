import type { Question } from "@/modules/questions/domain/question";
import type {
  QuestionEvaluator,
  EvaluationResult,
  PlayerAnswer,
} from "@/modules/questions/domain/interfaces/question-evaluator";

export class MultipleSelectEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const selected = this.parseAnswer(answer);
    const correct = this.parseCorrectIndices(question);

    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...correct].sort();

    const isCorrect =
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((val, idx) => val === sortedCorrect[idx]);

    const incorrectSelections = sortedSelected.filter((s) => !sortedCorrect.includes(s));
    const missedSelections = sortedCorrect.filter((c) => !sortedSelected.includes(c));

    const parts: string[] = [];
    if (incorrectSelections.length > 0) {
      parts.push(`Incorrect selections: ${incorrectSelections.join(", ")}`);
    }
    if (missedSelections.length > 0) {
      parts.push(`Missing selections: ${missedSelections.join(", ")}`);
    }

    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect ? "All correct options selected!" : parts.join(". "),
      correctIndex: sortedCorrect[0] ?? 0,
    };
  }

  getExpectedInputType(): "selection" {
    return "selection";
  }

  private parseAnswer(answer: PlayerAnswer): number[] {
    if (typeof answer.value === "string") {
      try {
        const parsed = JSON.parse(answer.value);
        if (Array.isArray(parsed)) return parsed.map(Number);
      } catch {
        return [Number(answer.value)].filter((n) => !isNaN(n));
      }
    }
    if (Array.isArray(answer.value)) return answer.value.map(Number);
    return [Number(answer.value)].filter((n) => !isNaN(n));
  }

  private parseCorrectIndices(question: Question): number[] {
    const raw = question.correctIndex;
    return String(raw)
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
  }
}
