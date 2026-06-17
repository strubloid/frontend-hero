/**
 * Confidence in the player's knowledge of a concept.
 *
 * - `low`   — player likely guessed or is unsure
 * - `medium` — player shows reasonable understanding
 * - `high`  — player demonstrates consistent, reliable knowledge
 */
export type ConfidenceLevel = "low" | "medium" | "high";

export function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

export function confidenceScoreToLevel(confidenceScore: number): ConfidenceLevel {
  return confidenceLevelFromScore(confidenceScore);
}
