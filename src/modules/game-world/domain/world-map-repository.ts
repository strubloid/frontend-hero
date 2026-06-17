import { WorldMap } from "./world-map";

export interface WorldMapRepository {
  getByPlayerAndSubject(playerId: string, subjectId: string): Promise<WorldMap | null>;
  save(worldMap: WorldMap): Promise<void>;
  create(worldMap: WorldMap): Promise<WorldMap>;
}
