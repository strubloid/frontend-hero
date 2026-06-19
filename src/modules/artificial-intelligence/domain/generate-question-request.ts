/**
 * Request payload for generating individual questions.
 */
export interface GenerateQuestionRequest {
  readonly subjectId: string;
  readonly conceptId: string;
  readonly difficulty: number; // 1–5
  readonly questionType: string;
  readonly count: number; // how many questions to generate
}
