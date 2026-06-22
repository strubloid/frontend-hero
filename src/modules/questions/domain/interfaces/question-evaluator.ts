import type { Question } from "../question";

export interface PlayerAnswer {
  value: unknown;
  selectedIndex: number;
  answerTimeMs: number;
}

export interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctIndex: number;
}

export interface QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult;
  getExpectedInputType(): "selection" | "text" | "code" | "order" | "explanation";
}
