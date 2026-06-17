import { ReviewSchedule } from "./review-schedule";

export interface ReviewRepository {
  getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ReviewSchedule | null>;
  getByPlayerAndSubject(playerId: string, subjectId: string): Promise<ReviewSchedule[]>;
  getOverdueReviews(playerId: string, before: Date): Promise<ReviewSchedule[]>;
  getDueReviews(playerId: string, before: Date): Promise<ReviewSchedule[]>;
  save(schedule: ReviewSchedule): Promise<ReviewSchedule>;
  delete(playerId: string, conceptId: string): Promise<void>;
}
