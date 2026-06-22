import { Question } from "./question";

export interface QuestionRepository {
  getById(id: string): Promise<Question | null>;
  create(question: Question): Promise<Question>;
  getByConceptId(conceptId: string): Promise<Question[]>;
  getRandomBySubjectId(subjectId: string, limit: number): Promise<Question[]>;
  getBySeedAndSubject(seedId: string, subjectId: string): Promise<Question | null>;
  markShown?(questionId: string, shownAt: Date): Promise<void>;
  getRecentlyShownByPlayer?(playerId: string, limit: number): Promise<string[]>;
}
