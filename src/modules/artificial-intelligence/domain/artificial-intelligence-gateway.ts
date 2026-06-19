import type { GenerateQuestionRequest } from "./generate-question-request";
import type { GenerateQuestionResult } from "./generate-question-result";
import type { GenerateQuestionBatchRequest } from "./generate-question-batch-request";
import type { GenerateQuestionBatchResult } from "./generate-question-batch-result";
import type { QuestionItem } from "./generate-question-result";

// ── Evaluate Answer ──────────────────────────────────────────────────────────

export interface EvaluateAnswerRequest {
  readonly questionStem: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly selectedIndex: number;
  readonly timeSpentSeconds?: number;
}

export interface EvaluateAnswerResult {
  readonly isCorrect: boolean;
  readonly correctIndex: number;
  readonly explanation: string;
  readonly score: number;
}

// ── Generate Explanation ─────────────────────────────────────────────────────

export interface GenerateExplanationRequest {
  readonly conceptId: string;
  readonly questionStem: string;
  readonly correctAnswer: string;
  readonly difficulty: number;
}

export interface GenerateExplanationResult {
  readonly explanation: string;
  readonly keyPoints: readonly string[];
  readonly relatedConcepts: readonly string[];
}

// ── Generate Hint ────────────────────────────────────────────────────────────

export interface GenerateHintRequest {
  readonly conceptId: string;
  readonly questionStem: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly hintLevel: number; // 1–3, where 1 is most subtle
}

export interface GenerateHintResult {
  readonly hint: string;
  readonly hintLevel: number;
}

// ── Generate Mission ─────────────────────────────────────────────────────────

export interface GenerateMissionRequest {
  readonly subjectId: string;
  readonly conceptIds?: readonly string[];
  readonly difficulty: number;
  readonly questionCount: number;
}

export interface GenerateMissionResult {
  readonly questions: readonly QuestionItem[];
  readonly missionId?: string;
  readonly success: boolean;
  readonly errorMessage?: string;
}

// ── Gateway Interface ────────────────────────────────────────────────────────

export interface ArtificialIntelligenceGateway {
  generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResult>;
  generateQuestionBatch(
    request: GenerateQuestionBatchRequest,
  ): Promise<GenerateQuestionBatchResult>;
  evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluateAnswerResult>;
  generateExplanation(request: GenerateExplanationRequest): Promise<GenerateExplanationResult>;
  generateHint(request: GenerateHintRequest): Promise<GenerateHintResult>;
  generateMission(request: GenerateMissionRequest): Promise<GenerateMissionResult>;
  isAvailable(): boolean;
  getProviderName(): string;
}
