import { Entity } from "@/shared/domain/entity";
import { QuestionType } from "@/modules/subjects/domain/subject";

export interface Question extends Entity {
  id: string;
  subjectId: string;
  conceptId: string;
  seedId: string;
  type: QuestionType;
  difficulty: number;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timesShown: number;
  lastShownAt: Date | null;
  qualityRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionFromSeedInput {
  subjectId: string;
  conceptId: string;
  seedId: string;
  type: QuestionType;
  difficulty: number;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const GENERATION_JOB_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type GenerationJobStatus =
  (typeof GENERATION_JOB_STATUS)[keyof typeof GENERATION_JOB_STATUS];
