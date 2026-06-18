/**
 * A requirement that must be met before a node can be accessed.
 */
export interface UnlockRequirementViewModel {
  readonly description: string;
  readonly met: boolean;
  readonly current: number;
  readonly required: number;
}
