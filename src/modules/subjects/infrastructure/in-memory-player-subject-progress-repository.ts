import type { PlayerSubjectProgressEntity } from "../domain/player-subject-progress";
import type { PlayerSubjectProgressRepository } from "../domain/player-subject-progress-repository";

export class InMemoryPlayerSubjectProgressRepository implements PlayerSubjectProgressRepository {
  private store = new Map<string, PlayerSubjectProgressEntity>();

  async findByPlayerAndSubject(
    playerId: string,
    subjectId: string,
  ): Promise<PlayerSubjectProgressEntity | null> {
    for (const entry of this.store.values()) {
      if (entry.playerId === playerId && entry.subjectId === subjectId) {
        return entry;
      }
    }
    return null;
  }

  async findByPlayerId(playerId: string): Promise<PlayerSubjectProgressEntity[]> {
    return Array.from(this.store.values()).filter((p) => p.playerId === playerId);
  }

  async save(progress: PlayerSubjectProgressEntity): Promise<PlayerSubjectProgressEntity> {
    this.store.set(progress.id, { ...progress });
    return progress;
  }

  /** Convenience for test setup. */
  set(progress: PlayerSubjectProgressEntity): void {
    this.store.set(progress.id, { ...progress });
  }

  /** Get raw count (for assertions). */
  get count(): number {
    return this.store.size;
  }
}
