import { Player } from "./player";

export interface PlayerRepository {
  getById(id: string): Promise<Player | null>;
  create(player: Player): Promise<Player>;
  save(player: Player): Promise<Player>;
}
