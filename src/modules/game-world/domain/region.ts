/**
 * A region of the Frontend Realms world.
 *
 * Each region represents a major engineering domain the player must master.
 * Regions are unlocked sequentially by demonstrating concept mastery.
 */
export interface Region {
  id: string;
  name: string;
  description: string;
  /** Narrative flavour text shown when the region is first unlocked */
  unlockFlavor: string;
  /** Order in the critical path (1-based) */
  order: number;
  /** Which concept IDs must reach minimum mastery before this region is unlocked */
  requiredConceptIds: string[];
  /** Mastery threshold (0-1) required for each requiredConceptId */
  requiredMastery: number;
  /** The boss concept for this region (null = no boss) */
  bossConceptId: string | null;
  /** Whether the player has defeated the boss */
  bossDefeated: boolean;
  /** Whether this region is accessible */
  unlocked: boolean;
  /** Subject this region belongs to */
  subjectId: string;
}
