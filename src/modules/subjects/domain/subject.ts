import { Entity } from "@/shared/domain/entity";

export type SubjectLevel = "foundation" | "intermediate" | "advanced" | "senior";

import { SubjectProgression } from "./subject-level";

export interface Subject extends Entity {
  id: string; // e.g. 'nextjs'
  title: string;
  description: string;
  version: number;
  schemaVersion: number;
  minimumGameVersion: string;
  progression: SubjectProgression;
  domains: Domain[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Domain {
  name: string;
  concepts: Concept[];
}

export interface Concept {
  id: string; // e.g. 'javascript.event-loop'
  name: string;
  domainName: string;
  subjectId: string;
  level: SubjectLevel;
  difficulty: number; // 1-5
  prerequisites: string[]; // concept IDs
  tags: string[];
  outcomes: string[];
  knowledge: string;
  commonMisconceptions: string[];
  examples: string[];
  questionSeeds: QuestionSeed[];
  practicalChallenges: PracticalChallenge[];
  interviewPrompts: InterviewPrompt[];
}

export interface QuestionSeed {
  seedId: string;
  type: QuestionType;
  difficulty: number;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type QuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "true-false"
  | "fill-blank"
  | "code-prediction"
  | "bug-hunt"
  | "matching"
  | "ordering"
  | "explain-it";

export interface PracticalChallenge {
  challengeId: string;
  type: string;
  difficulty: number;
  prompt: string;
  solution: string;
}

export interface InterviewPrompt {
  promptId: string;
  prompt: string;
  evaluationCriteria: string[];
}
