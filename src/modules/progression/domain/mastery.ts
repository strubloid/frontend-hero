export interface ConceptMastery {
  id: string;
  playerId: string;
  conceptId: string;
  subjectId: string;
  masteryScore: number; // 0-100
  confidenceScore: number; // 0-100
  retentionScore: number; // 0-100
  correctAttempts: number;
  incorrectAttempts: number;
  consecutiveCorrectAnswers: number;
  lastAttemptedAt: Date | null;
  nextReviewAt: Date | null;
}
