import { ConceptMastery } from "./mastery";

export interface ConceptMasteryRepository {
  getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ConceptMastery | null>;
  save(mastery: ConceptMastery): Promise<ConceptMastery>;
}
