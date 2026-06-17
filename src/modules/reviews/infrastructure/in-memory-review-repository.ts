import { ReviewSchedule } from "../domain/review-schedule";
import { ReviewRepository } from "../domain/review-repository";

export class InMemoryReviewRepository implements ReviewRepository {
  private store = new Map<string, ReviewSchedule>();

  private key(playerId: string, conceptId: string): string {
    return `${playerId}:${conceptId}`;
  }

  async getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ReviewSchedule | null> {
    return this.store.get(this.key(playerId, conceptId)) ?? null;
  }

  async getByPlayerAndSubject(playerId: string, subjectId: string): Promise<ReviewSchedule[]> {
    return Array.from(this.store.values()).filter(
      (s) => s.playerId === playerId && s.subjectId === subjectId,
    );
  }

  async getOverdueReviews(playerId: string, before: Date): Promise<ReviewSchedule[]> {
    return Array.from(this.store.values()).filter(
      (s): s is ReviewSchedule & { nextReviewAt: Date } =>
        s.playerId === playerId && s.nextReviewAt !== null && new Date(s.nextReviewAt) <= before,
    );
  }

  async getDueReviews(playerId: string, before: Date): Promise<ReviewSchedule[]> {
    const oneDayBefore = new Date(before.getTime() - 24 * 60 * 60 * 1000);
    return Array.from(this.store.values()).filter(
      (s): s is ReviewSchedule & { nextReviewAt: Date } =>
        s.playerId === playerId &&
        s.nextReviewAt !== null &&
        new Date(s.nextReviewAt) <= before &&
        new Date(s.nextReviewAt) > oneDayBefore,
    );
  }

  async save(schedule: ReviewSchedule): Promise<ReviewSchedule> {
    this.store.set(this.key(schedule.playerId, schedule.conceptId), schedule);
    return schedule;
  }

  async delete(playerId: string, conceptId: string): Promise<void> {
    this.store.delete(this.key(playerId, conceptId));
  }
}
