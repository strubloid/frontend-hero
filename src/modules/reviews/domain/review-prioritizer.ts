import { ReviewSchedule } from "./review-schedule";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";

/**
 * A prioritised review entry with urgency score.
 */
export interface PrioritisedReview {
  schedule: ReviewSchedule;
  mastery: ConceptMastery | null;
  urgency: number; // higher = more urgent
}

/**
 * Priorities reviews based on:
 * 1. Overdue reviews (past nextReviewAt) — most urgent
 * 2. Due today reviews
 * 3. Due soon reviews (within 2 days)
 * 4. Low-retention concepts even if not yet due
 * 5. Lowest mastery first within each category
 */
export class ReviewPrioritizer {
  private static readonly OVERDUE_URGENCY_BASE = 100;
  private static readonly DUE_TODAY_URGENCY_BASE = 60;
  private static readonly DUE_SOON_URGENCY_BASE = 30;

  prioritise(
    schedules: ReviewSchedule[],
    masteries: Map<string, ConceptMastery>,
    limit: number = 5,
  ): PrioritisedReview[] {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(endOfToday.getTime() + 2 * 24 * 60 * 60 * 1000);

    const scored: PrioritisedReview[] = schedules.map((schedule) => {
      const mastery = masteries.get(schedule.conceptId) ?? null;
      let urgency = 0;

      if (schedule.nextReviewAt) {
        if (schedule.nextReviewAt < now) {
          // Overdue: base urgency increases with how overdue
          const daysOverdue =
            (now.getTime() - schedule.nextReviewAt.getTime()) / (24 * 60 * 60 * 1000);
          urgency = ReviewPrioritizer.OVERDUE_URGENCY_BASE + Math.round(daysOverdue * 10);
        } else if (schedule.nextReviewAt <= endOfToday) {
          urgency = ReviewPrioritizer.DUE_TODAY_URGENCY_BASE;
        } else if (schedule.nextReviewAt <= twoDaysFromNow) {
          urgency = ReviewPrioritizer.DUE_SOON_URGENCY_BASE;
        }
      }

      // Boost urgency for low retention
      if (mastery && mastery.retentionScore < 0.4) {
        urgency += 20;
      }

      // Penalty factor: higher mastery = lower urgency within same category
      const masteryPenalty = mastery ? Math.round(mastery.masteryScore * 20) : 0;
      urgency = Math.max(0, urgency - masteryPenalty);

      return { schedule, mastery, urgency };
    });

    // Sort by urgency descending, then by nextReviewAt ascending
    scored.sort((a, b) => {
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;
      const aTime = a.schedule.nextReviewAt?.getTime() ?? 0;
      const bTime = b.schedule.nextReviewAt?.getTime() ?? 0;
      return aTime - bTime;
    });

    return scored.slice(0, limit);
  }
}
