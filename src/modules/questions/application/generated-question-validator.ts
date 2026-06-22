import type { QuestionItem } from "@/modules/artificial-intelligence/domain/generate-question-result";
import type { QuestionType } from "@/modules/subjects/domain/subject";

/**
 * A validation error for a single generated question.
 */
export interface ValidationError {
  /** 0-based index of the question within the generated batch */
  readonly questionIndex: number;
  /** Human-readable description of what failed */
  readonly message: string;
}

const VALID_QUESTION_TYPES: readonly QuestionType[] = [
  "multiple-choice",
  "multiple-select",
  "true-false",
  "fill-blank",
  "code-prediction",
  "matching",
  "ordering",
] as const;

function isValidQuestionType(value: string): value is QuestionType {
  return (VALID_QUESTION_TYPES as readonly string[]).includes(value);
}

/**
 * Validates a single generated question item before it is persisted.
 * Returns an array of ValidationError – empty means the question is valid.
 */
export class GeneratedQuestionValidator {
  /**
   * Validate a single generated question item.
   *
   * @param question - The question item to validate
   * @param index - The index of this question in the generation batch (for error reporting)
   * @returns An array of validation errors; empty array means the question is valid
   */
  validate(question: QuestionItem, index: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // ── stem is non-empty string ────────────────────────────────────────
    if (!question.stem || typeof question.stem !== "string" || question.stem.trim().length === 0) {
      errors.push({
        questionIndex: index,
        message: "Stem must be a non-empty string.",
      });
    }

    // ── options array has at least 2 items ──────────────────────────────
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push({
        questionIndex: index,
        message: `Options must have at least 2 items (got ${question.options?.length ?? 0}).`,
      });
    }

    // ── correctIndex is within options bounds ───────────────────────────
    if (
      Array.isArray(question.options) &&
      question.options.length > 0 &&
      (typeof question.correctIndex !== "number" ||
        question.correctIndex < 0 ||
        question.correctIndex >= question.options.length)
    ) {
      errors.push({
        questionIndex: index,
        message: `correctIndex (${question.correctIndex}) is out of bounds for ${question.options.length} options.`,
      });
    }

    // ── explanation is non-empty ────────────────────────────────────────
    if (
      !question.explanation ||
      typeof question.explanation !== "string" ||
      question.explanation.trim().length === 0
    ) {
      errors.push({
        questionIndex: index,
        message: "Explanation must be a non-empty string.",
      });
    }

    // ── difficulty is 1-5 ──────────────────────────────────────────────
    if (
      typeof question.difficulty !== "number" ||
      !Number.isInteger(question.difficulty) ||
      question.difficulty < 1 ||
      question.difficulty > 5
    ) {
      errors.push({
        questionIndex: index,
        message: `Difficulty must be an integer between 1 and 5 (got ${question.difficulty}).`,
      });
    }

    // ── type is a valid QuestionType ────────────────────────────────────
    if (typeof question.type !== "string" || !isValidQuestionType(question.type)) {
      errors.push({
        questionIndex: index,
        message: `Type "${question.type}" is not a valid QuestionType.`,
      });
    }

    // ── No duplicate options (case-insensitive) ─────────────────────────
    if (Array.isArray(question.options) && question.options.length >= 2) {
      const normalized = question.options.map((o) => o.toLowerCase().trim());
      const unique = new Set(normalized);
      if (unique.size !== normalized.length) {
        errors.push({
          questionIndex: index,
          message: "Options contain duplicates (case-insensitive).",
        });
      }
    }

    return errors;
  }

  /**
   * Validate multiple question items at once.
   * Returns a flat array of all validation errors.
   */
  validateMany(questions: readonly QuestionItem[]): ValidationError[] {
    const all: ValidationError[] = [];
    for (let i = 0; i < questions.length; i++) {
      all.push(...this.validate(questions[i], i));
    }
    return all;
  }
}
