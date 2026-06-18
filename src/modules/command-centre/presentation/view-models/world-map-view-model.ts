import type { WorldNodeViewModel } from "./world-node-view-model";

/**
 * A connection between two nodes on the world map.
 */
export interface WorldConnection {
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly state: "active" | "inactive" | "completed";
}

/**
 * The full world map — nodes and their connections.
 */
export interface WorldMapViewModel {
  readonly nodes: WorldNodeViewModel[];
  readonly connections: WorldConnection[];
}
