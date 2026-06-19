import type { QuestionItem } from "./generate-question-result";

/**
 * Summary statistics for a batch generation run.
 */
export interface GenerateQuestionBatchSummary {
  readonly totalGenerated: number;
  readonly totalFailed: number;
  readonly conceptsCovered: number;
  readonly durationMs: number;
}

/**
 * Represents a single error from a concept that failed during batch generation.
 */
export interface BatchError {
  readonly conceptId: string;
  readonly errorMessage: string;
}

/**
 * Result returned after batch-generating questions for multiple concepts.
 */
export interface GenerateQuestionBatchResult {
  readonly questions: readonly QuestionItem[];
  readonly summary: GenerateQuestionBatchSummary;
  readonly errors: readonly BatchError[];
}
