import { ConceptMastery } from "./concept-mastery";

export interface MasteryRepository {
  getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ConceptMastery | null>;
  getByPlayerAndSubject(playerId: string, subjectId: string): Promise<ConceptMastery[]>;
  getByPlayer(playerId: string): Promise<ConceptMastery[]>;
  save(mastery: ConceptMastery): Promise<ConceptMastery>;
  delete(playerId: string, conceptId: string): Promise<void>;
}
