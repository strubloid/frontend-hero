import type { GenerationJobStatus } from "@/modules/questions/domain/question";

/**
 * A request to generate a batch of questions for a subject,
 * typically triggered when inventory runs low on certain concepts.
 */
export interface GenerationJob {
  readonly id: string;
  readonly subjectId: string;
  readonly requestedBy: string;
  readonly status: GenerationJobStatus;
  readonly conceptIds: readonly string[];
  readonly difficultyRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly questionTypes: readonly string[];
  readonly countRequested: number;
  readonly countGenerated: number;
  readonly countFailed: number;
  readonly progressPercent: number;
  readonly errors: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
