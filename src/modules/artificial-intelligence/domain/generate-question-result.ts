/**
 * A single generated question item.
 */
export interface QuestionItem {
  readonly stem: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanation: string;
  readonly type: string;
  readonly difficulty: number;
}

/**
 * Result returned after generating individual questions.
 */
export interface GenerateQuestionResult {
  readonly questions: readonly QuestionItem[];
  readonly success: boolean;
  readonly errorMessage?: string;
}
