import type { Question } from "@/modules/questions/domain/question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";
import type {
  QuestionValidator,
  ValidationResult,
} from "@/modules/questions/domain/interfaces/question-validator";

export class ExplainItValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];
    if (!question.stem || question.stem.trim().length < 10) {
      errors.push("Explain-it questions must have a descriptive stem.");
    }
    return { isValid: errors.length === 0, errors };
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    const errors: string[] = [];
    if (!seed.stem || seed.stem.trim().length < 10) {
      errors.push("Explain-it seeds must have a descriptive stem.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
