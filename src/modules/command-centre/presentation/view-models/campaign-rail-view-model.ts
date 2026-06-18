/**
 * A single campaign level rendered as a step on the campaign rail.
 */
export interface CampaignLevelViewModel {
  readonly level: number;
  readonly title: string;
  readonly state: import("./world-node-state").WorldNodeState;
}

/**
 * Vertical campaign rail showing a subject's level progression.
 */
export interface CampaignRailViewModel {
  readonly subjectId: string;
  readonly subjectTitle: string;
  readonly levels: CampaignLevelViewModel[];
}
