import { ConceptMastery } from "./concept-mastery";
import { Concept } from "@/modules/subjects/domain/subject";

export interface WeaknessReport {
  conceptId: string;
  conceptName: string;
  domainName: string;
  masteryScore: number;
  confidenceScore: number;
  retentionScore: number;
  reason: string;
}

/**
 * Identifies weak concepts based on mastery data and curriculum position.
 *
 * Weaknesses fall into several categories:
 * - LOW_MASTERY — score below threshold
 * - DECAYING_RETENTION — retention dropping, review overdue
 * - LOW_CONFIDENCE — system uncertain of the score
 * - CONSECUTIVE_ERRORS — player in a mistake spiral
 * - NEVER_ATTEMPTED — concept never practised
 * - BLOCKED_PREREQUISITE — weak foundational concept blocking advanced ones
 */
export type WeaknessCategory =
  | "LOW_MASTERY"
  | "DECAYING_RETENTION"
  | "LOW_CONFIDENCE"
  | "CONSECUTIVE_ERRORS"
  | "NEVER_ATTEMPTED"
  | "BLOCKED_PREREQUISITE";

export class WeaknessDetector {
  private static readonly MASTERY_THRESHOLD = 0.5;
  private static readonly RETENTION_THRESHOLD = 0.3;
  private static readonly CONFIDENCE_THRESHOLD = 0.3;
  private static readonly CONSECUTIVE_ERROR_THRESHOLD = 2;

  /**
   * Find all weak concepts for a player across a subject.
   */
  detect(allConceptMastery: ConceptMastery[], allConcepts: Concept[]): WeaknessReport[] {
    const reports: WeaknessReport[] = [];

    for (const mastery of allConceptMastery) {
      const concept = allConcepts.find((c) => c.id === mastery.conceptId);
      if (!concept) continue;

      // LOW_MASTERY
      if (mastery.masteryScore < WeaknessDetector.MASTERY_THRESHOLD) {
        reports.push({
          conceptId: mastery.conceptId,
          conceptName: concept.name,
          domainName: concept.domainName,
          masteryScore: mastery.masteryScore,
          confidenceScore: mastery.confidenceScore,
          retentionScore: mastery.retentionScore,
          reason: "LOW_MASTERY",
        });
      }

      // DECAYING_RETENTION
      if (
        mastery.retentionScore < WeaknessDetector.RETENTION_THRESHOLD &&
        mastery.masteryScore >= WeaknessDetector.MASTERY_THRESHOLD
      ) {
        reports.push({
          conceptId: mastery.conceptId,
          conceptName: concept.name,
          domainName: concept.domainName,
          masteryScore: mastery.masteryScore,
          confidenceScore: mastery.confidenceScore,
          retentionScore: mastery.retentionScore,
          reason: "DECAYING_RETENTION",
        });
      }

      // LOW_CONFIDENCE (only if mastery is reasonable — otherwise it's just LOW_MASTERY)
      if (
        mastery.confidenceScore < WeaknessDetector.CONFIDENCE_THRESHOLD &&
        mastery.masteryScore >= WeaknessDetector.MASTERY_THRESHOLD
      ) {
        reports.push({
          conceptId: mastery.conceptId,
          conceptName: concept.name,
          domainName: concept.domainName,
          masteryScore: mastery.masteryScore,
          confidenceScore: mastery.confidenceScore,
          retentionScore: mastery.retentionScore,
          reason: "LOW_CONFIDENCE",
        });
      }

      // CONSECUTIVE_ERRORS
      if (
        mastery.incorrectAttempts > 0 &&
        mastery.consecutiveCorrectAnswers === 0 &&
        mastery.incorrectAttempts >= WeaknessDetector.CONSECUTIVE_ERROR_THRESHOLD
      ) {
        reports.push({
          conceptId: mastery.conceptId,
          conceptName: concept.name,
          domainName: concept.domainName,
          masteryScore: mastery.masteryScore,
          confidenceScore: mastery.confidenceScore,
          retentionScore: mastery.retentionScore,
          reason: "CONSECUTIVE_ERRORS",
        });
      }
    }

    // NEVER_ATTEMPTED — concepts with no mastery record
    const attemptedIds = new Set(allConceptMastery.map((m) => m.conceptId));
    for (const concept of allConcepts) {
      if (!attemptedIds.has(concept.id)) {
        reports.push({
          conceptId: concept.id,
          conceptName: concept.name,
          domainName: concept.domainName,
          masteryScore: 0,
          confidenceScore: 0,
          retentionScore: 0,
          reason: "NEVER_ATTEMPTED",
        });
      }
    }

    return reports;
  }

  /**
   * Get the single most critical weakness to address first.
   */
  getTopWeakness(reports: WeaknessReport[]): WeaknessReport | null {
    if (reports.length === 0) return null;

    // Priority ordering: blocked prerequisites > consecutive errors > low mastery > decay > low confidence > never attempted
    const priority: Record<string, number> = {
      BLOCKED_PREREQUISITE: 0,
      CONSECUTIVE_ERRORS: 1,
      LOW_MASTERY: 2,
      DECAYING_RETENTION: 3,
      LOW_CONFIDENCE: 4,
      NEVER_ATTEMPTED: 5,
    };

    return reports.reduce((best, current) => {
      const bestP = priority[best.reason] ?? 99;
      const currP = priority[current.reason] ?? 99;
      if (currP < bestP) return current;
      if (currP === bestP && current.masteryScore < best.masteryScore) return current;
      return best;
    });
  }
}
