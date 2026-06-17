import { PlayerProgression } from "../domain/player-progression";
import { ProgressionRepository } from "../domain/progression-repository";

export class InMemoryProgressionRepository implements ProgressionRepository {
  private store = new Map<string, PlayerProgression>();

  async getByPlayerId(playerId: string): Promise<PlayerProgression | null> {
    return this.store.get(playerId) ?? null;
  }

  async save(progression: PlayerProgression): Promise<PlayerProgression> {
    this.store.set(progression.playerId, progression);
    return progression;
  }

  async create(progression: PlayerProgression): Promise<PlayerProgression> {
    this.store.set(progression.playerId, progression);
    return progression;
  }
}
