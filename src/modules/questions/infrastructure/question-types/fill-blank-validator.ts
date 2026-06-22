import type { Question } from "@/modules/questions/domain/question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";
import type {
  QuestionValidator,
  ValidationResult,
} from "@/modules/questions/domain/interfaces/question-validator";

export class FillBlankValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];
    if (!question.options || question.options.length < 2) {
      errors.push("Fill-blank questions require at least 2 options as possible answers.");
    }
    if (question.correctIndex < 0 || question.correctIndex >= (question.options?.length ?? 0)) {
      errors.push("Correct index must be within valid option range.");
    }
    if (!question.stem.includes("___") && !question.stem.includes("_ ")) {
      errors.push("Fill-blank questions should contain a blank indicator (___) in the stem.");
    }
    return { isValid: errors.length === 0, errors };
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    const errors: string[] = [];
    if (!seed.options || seed.options.length < 2) {
      errors.push("Fill-blank seeds require at least 2 options.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
