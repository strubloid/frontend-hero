import { Concept, Subject } from "@/modules/subjects/domain/subject";
import { MissionType } from "@/modules/missions/domain/mission";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";
import { WeaknessDetector, WeaknessReport } from "@/modules/mastery/domain/weakness-detector";
import { ReviewSchedule } from "@/modules/reviews/domain/review-schedule";
import { ReviewPrioritizer, PrioritisedReview } from "@/modules/reviews/domain/review-prioritizer";

export interface MissionPlan {
  subjectId: string;
  conceptId: string;
  type: MissionType;
  reason: string;
}

export interface MissionSelectorInput {
  subject: Subject;
  masteries: ConceptMastery[];
  schedules: ReviewSchedule[];
  recentConceptIds: string[]; // last N concept IDs to avoid immediate repetition
  availableConceptIds: string[]; // concepts unlocked by prerequisites
}

/**
 * Selects the best concept and mission type for a player based on:
 * 1. Overdue reviews (spaced repetition)
 * 2. Weak concepts (low mastery, consecutive errors, decay)
 * 3. Prerequisite-available concepts (unlocked, never attempted)
 * 4. Recent history (avoid immediate repetition)
 */
export class MissionSelector {
  private readonly weaknessDetector = new WeaknessDetector();
  private readonly reviewPrioritizer = new ReviewPrioritizer();

  select(input: MissionSelectorInput): MissionPlan {
    const now = new Date();
    const recentSet = new Set(input.recentConceptIds);

    // --- Priority 1: Overdue reviews ---
    const masteriesMap = new Map(input.masteries.map((m) => [m.conceptId, m]));
    const fullSchedules = input.schedules.filter(
      (s) => s.nextReviewAt && s.nextReviewAt <= now,
    );
    const prioritised = this.reviewPrioritizer.prioritise(fullSchedules, masteriesMap, 3);

    // Pick the highest urgency review that isn't recent
    for (const p of prioritised) {
      if (!recentSet.has(p.schedule.conceptId)) {
        return {
          subjectId: input.subject.id,
          conceptId: p.schedule.conceptId,
          type: "review",
          reason: `overdue review (urgency ${p.urgency})`,
        };
      }
    }

    // --- Priority 2: Weak concepts ---
    const allConcepts = input.subject.domains.flatMap((d) => d.concepts);
    const validConcepts = allConcepts.filter(
      (c) => input.availableConceptIds.includes(c.id),
    );
    const validMasteries = input.masteries.filter(
      (m) => input.availableConceptIds.includes(m.conceptId),
    );

    const weakReports = this.weaknessDetector.detect(validMasteries, validConcepts);
    const topWeakness = this.weaknessDetector.getTopWeakness(weakReports);

    if (topWeakness && !recentSet.has(topWeakness.conceptId)) {
      const missionType: MissionType = topWeakness.reason === "CONSECUTIVE_ERRORS"
        ? "review"
        : "encounter";
      return {
        subjectId: input.subject.id,
        conceptId: topWeakness.conceptId,
        type: missionType,
        reason: topWeakness.reason,
      };
    }

    // --- Priority 3: Never attempted (unlocked, fresh concepts) ---
    const masteredIds = new Set(input.masteries.map((m) => m.conceptId));
    const freshConcepts = input.availableConceptIds.filter((id) => !masteredIds.has(id));

    if (freshConcepts.length > 0) {
      // Pick one not recently seen, preferring lower-difficulty first
      const scored = freshConcepts.map((id) => {
        const concept = allConcepts.find((c) => c.id === id);
        return { id, difficulty: concept?.difficulty ?? 1, name: concept?.name ?? id };
      });
      scored.sort((a, b) => {
        const aRecent = recentSet.has(a.id) ? 1 : 0;
        const bRecent = recentSet.has(b.id) ? 1 : 0;
        if (aRecent !== bRecent) return aRecent - bRecent;
        return a.difficulty - b.difficulty;
      });

      const chosen = scored[0];
      return {
        subjectId: input.subject.id,
        conceptId: chosen.id,
        type: "encounter",
        reason: `new concept: ${chosen.name}`,
      };
    }

    // --- Priority 4: Fallback — any available concept ---
    if (input.availableConceptIds.length > 0) {
      const fallbackConcept = allConcepts.find((c) => c.id === input.availableConceptIds[0]);
      return {
        subjectId: input.subject.id,
        conceptId: input.availableConceptIds[0],
        type: "encounter",
        reason: fallbackConcept ? `fallback: ${fallbackConcept.name}` : "fallback",
      };
    }

    throw new Error("No concepts available for mission selection");
  }
}
