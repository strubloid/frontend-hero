import type { Question } from "../question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface QuestionValidator {
  validate(question: Question): ValidationResult;
  validateSeed(seed: QuestionSeed): ValidationResult;
}
