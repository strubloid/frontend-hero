import type { WorldNodeState } from "./world-node-state";
import type { WorldNodeType } from "./world-node-type";
import type { WorldNodePosition } from "./world-node-position";
import type { UnlockRequirementViewModel } from "./unlock-requirement-view-model";

/**
 * A single node rendered on the world map.
 */
export interface WorldNodeViewModel {
  readonly nodeId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly state: WorldNodeState;
  readonly nodeType: WorldNodeType;
  readonly position: WorldNodePosition;
  readonly completion: number; // 0-100
  readonly masteryContribution: number; // 0-100
  readonly unlockRequirements: UnlockRequirementViewModel[];
}
