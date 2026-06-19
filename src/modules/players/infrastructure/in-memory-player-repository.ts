import type { Player } from "../domain/player";
import type { PlayerRepository } from "../domain/player-repository";

export class InMemoryPlayerRepository implements PlayerRepository {
  private store = new Map<string, Player>();

  async getById(id: string): Promise<Player | null> {
    return this.store.get(id) ?? null;
  }

  async create(player: Player): Promise<Player> {
    if (this.store.has(player.id)) {
      throw new Error(`Player already exists: ${player.id}`);
    }
    this.store.set(player.id, { ...player });
    return player;
  }

  async save(player: Player): Promise<Player> {
    this.store.set(player.id, { ...player });
    return player;
  }

  /** Convenience for test setup. */
  set(player: Player): void {
    this.store.set(player.id, { ...player });
  }

  /** Get raw count (for assertions). */
  get count(): number {
    return this.store.size;
  }
}
