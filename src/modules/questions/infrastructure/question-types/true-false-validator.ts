import type { Question } from "@/modules/questions/domain/question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";
import type {
  QuestionValidator,
  ValidationResult,
} from "@/modules/questions/domain/interfaces/question-validator";

export class TrueFalseValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];
    if (!question.options || question.options.length !== 2) {
      errors.push("True-false questions require exactly 2 options (True, False).");
    }
    if (question.correctIndex < 0 || question.correctIndex > 1) {
      errors.push("Correct index must be 0 (True) or 1 (False).");
    }
    return { isValid: errors.length === 0, errors };
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    const errors: string[] = [];
    if (!seed.options || seed.options.length !== 2) {
      errors.push("True-false seeds require exactly 2 options (True, False).");
    }
    return { isValid: errors.length === 0, errors };
  }
}
