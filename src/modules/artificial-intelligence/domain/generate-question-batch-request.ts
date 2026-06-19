/**
 * Request payload for batch-generating questions across multiple concepts.
 * If conceptIds is omitted, questions are generated for all concepts in the subject.
 */
export interface GenerateQuestionBatchRequest {
  readonly subjectId: string;
  readonly conceptIds?: readonly string[];
  readonly difficultyRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly countPerConcept: number;
  readonly questionTypes: readonly string[];
}
