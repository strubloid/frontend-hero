import { PlayerProgression } from "./player-progression";

export interface ProgressionRepository {
  getByPlayerId(playerId: string): Promise<PlayerProgression | null>;
  save(progression: PlayerProgression): Promise<PlayerProgression>;
  create(progression: PlayerProgression): Promise<PlayerProgression>;
}
