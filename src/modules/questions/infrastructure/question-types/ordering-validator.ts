import type { Question } from "@/modules/questions/domain/question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";
import type {
  QuestionValidator,
  ValidationResult,
} from "@/modules/questions/domain/interfaces/question-validator";

export class OrderingValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];
    if (!question.options || question.options.length < 2) {
      errors.push("Ordering questions require at least 2 options as possible next steps.");
    }
    if (question.correctIndex < 0 || question.correctIndex >= (question.options?.length ?? 0)) {
      errors.push("Correct index must be within valid option range.");
    }
    return { isValid: errors.length === 0, errors };
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    const errors: string[] = [];
    if (!seed.options || seed.options.length < 2) {
      errors.push("Ordering seeds require at least 2 options.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
