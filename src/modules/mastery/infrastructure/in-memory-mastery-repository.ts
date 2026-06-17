import { ConceptMastery } from "../domain/concept-mastery";
import { MasteryRepository } from "../domain/mastery-repository";

export class InMemoryMasteryRepository implements MasteryRepository {
  private store = new Map<string, ConceptMastery>();

  private key(playerId: string, conceptId: string): string {
    return `${playerId}:${conceptId}`;
  }

  async getByPlayerAndConcept(playerId: string, conceptId: string): Promise<ConceptMastery | null> {
    return this.store.get(this.key(playerId, conceptId)) ?? null;
  }

  async getByPlayerAndSubject(playerId: string, subjectId: string): Promise<ConceptMastery[]> {
    return Array.from(this.store.values()).filter(
      (m) => m.playerId === playerId && m.subjectId === subjectId,
    );
  }

  async getByPlayer(playerId: string): Promise<ConceptMastery[]> {
    return Array.from(this.store.values()).filter((m) => m.playerId === playerId);
  }

  async save(mastery: ConceptMastery): Promise<ConceptMastery> {
    this.store.set(this.key(mastery.playerId, mastery.conceptId), mastery);
    return mastery;
  }

  async delete(playerId: string, conceptId: string): Promise<void> {
    this.store.delete(this.key(playerId, conceptId));
  }
}
