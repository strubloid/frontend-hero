import { ConceptMastery } from "./concept-mastery";
import { MasteryScore } from "./mastery-score";

export interface MasteryUpdateInput {
  playerId: string;
  conceptId: string;
  subjectId: string;
  isCorrect: boolean;
  difficulty: number;
  missionType: string;
  responseTimeMs: number;
  currentMastery: ConceptMastery | null;
}

export interface MasteryUpdateResult {
  mastery: ConceptMastery;
  masteryDelta: number;
  confidenceDelta: number;
  retentionDelta: number;
}

/**
 * Domain service for updating mastery scores after a question attempt.
 *
 * Design:
 * - Mastery gain scales inversely with current mastery (bigger gains near zero).
 * - Mastery loss on incorrect answers scales with difficulty (harder mistakes hurt more).
 * - Confidence rises with consecutive correct, drops sharply on incorrect.
 * - Retention is re-set upward on correct, and decays over time (applied by review scheduler).
 * - Response time under 3s is a bonus signal (fluency).
 */
export class MasteryCalculator {
  private static readonly BASE_MASTERY_GAIN = 0.08;
  private static readonly BASE_MASTERY_LOSS = 0.15;
  private static readonly CONFIDENCE_GAIN_PER_CORRECT = 0.05;
  private static readonly CONFIDENCE_LOSS_ON_ERROR = 0.20;
  private static readonly MAX_CONFIDENCE = 1.0;
  private static readonly MIN_CONFIDENCE = 0.1;
  private static readonly FLUENCY_THRESHOLD_MS = 3000;
  private static readonly FLUENCY_BONUS = 0.02;

  update(input: MasteryUpdateInput): MasteryUpdateResult {
    const prev = input.currentMastery;
    const prevScore = prev ? MasteryScore.from(prev.masteryScore) : MasteryScore.zero();
    const prevConfidence = prev?.confidenceScore ?? 0.3;
    const prevRetention = prev?.retentionScore ?? 0;

    // --- Mastery score ---
    let masteryDelta: number;
    if (input.isCorrect) {
      // Diminishing returns as mastery increases
      const gap = 1 - prevScore.toNumber();
      masteryDelta = MasteryCalculator.BASE_MASTERY_GAIN * gap * (1 + input.difficulty * 0.1);
      // Fluency bonus for fast answers
      if (input.responseTimeMs < MasteryCalculator.FLUENCY_THRESHOLD_MS) {
        masteryDelta += MasteryCalculator.FLUENCY_BONUS;
      }
    } else {
      // Loss scales with difficulty — harder concepts lose more on error
      masteryDelta = -(MasteryCalculator.BASE_MASTERY_LOSS * (1 + input.difficulty * 0.15));
    }

    const newScore = prevScore.add(masteryDelta);

    // --- Confidence ---
    let confidenceDelta: number;
    if (input.isCorrect) {
      const streak = prev?.consecutiveCorrectAnswers ?? 0;
      confidenceDelta = MasteryCalculator.CONFIDENCE_GAIN_PER_CORRECT * (1 + streak * 0.3);
    } else {
      confidenceDelta = -MasteryCalculator.CONFIDENCE_LOSS_ON_ERROR;
    }
    const newConfidence = Math.max(
      MasteryCalculator.MIN_CONFIDENCE,
      Math.min(MasteryCalculator.MAX_CONFIDENCE, prevConfidence + confidenceDelta),
    );

    // --- Retention ---
    // On correct: reset retention upward based on difficulty
    // On incorrect: retention drops
    let retentionDelta: number;
    if (input.isCorrect) {
      retentionDelta = 0.2 * (1 + input.difficulty * 0.1);
    } else {
      retentionDelta = -0.25;
    }
    const newRetention = Math.max(0, Math.min(1, prevRetention + retentionDelta));

    // --- Build result ---
    const now = new Date();
    const newMastery: ConceptMastery = {
      id: prev?.id ?? `${input.playerId}:${input.conceptId}`,
      playerId: input.playerId,
      conceptId: input.conceptId,
      subjectId: input.subjectId,
      masteryScore: newScore.toNumber(),
      confidenceScore: Math.round(newConfidence * 1000) / 1000,
      retentionScore: Math.round(newRetention * 1000) / 1000,
      correctAttempts: (prev?.correctAttempts ?? 0) + (input.isCorrect ? 1 : 0),
      incorrectAttempts: (prev?.incorrectAttempts ?? 0) + (input.isCorrect ? 0 : 1),
      consecutiveCorrectAnswers: input.isCorrect
        ? (prev?.consecutiveCorrectAnswers ?? 0) + 1
        : 0,
      lastAttemptedAt: now,
      nextReviewAt: prev?.nextReviewAt ?? null,
      demonstratedContexts: [
        ...(prev?.demonstratedContexts ?? []),
        { missionType: input.missionType, demonstratedAt: now, wasCorrect: input.isCorrect },
      ],
      commonMistakes: prev?.commonMistakes ?? [],
    };

    return {
      mastery: newMastery,
      masteryDelta: Math.round(masteryDelta * 1000) / 1000,
      confidenceDelta: Math.round(confidenceDelta * 1000) / 1000,
      retentionDelta: Math.round(retentionDelta * 1000) / 1000,
    };
  }
}
