import { Entity } from "@/shared/domain/entity";

export type MissionStatus = "pending" | "active" | "completed" | "failed";
export type MissionType = "encounter" | "boss" | "side-quest" | "daily" | "review" | "interview";

export interface Mission extends Entity {
  id: string;
  playerId: string;
  subjectId: string;
  type: MissionType;
  status: MissionStatus;
  questionIds: string[]; // ordered list of question IDs
  currentQuestionIndex: number;
  score: number;
  maxScore: number;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MissionAttempt extends Entity {
  id: string;
  missionId: string;
  playerId: string;
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  hintsUsed: number;
  attemptedAt: Date;
}

export interface StartMissionInput {
  playerId: string;
  subjectId: string;
  type: MissionType;
}

export interface SubmitAnswerInput {
  missionId: string;
  playerId: string;
  questionId: string;
  selectedIndex: number;
  timeSpentSeconds: number;
}
