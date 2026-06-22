/**
 * Health level of question inventory for a subject or concept.
 *
 * - HEALTHY  — sufficient questions; no generation needed.
 * - LOW      — running low; generation should be considered.
 * - CRITICAL — very few questions; generation is strongly recommended.
 * - EMPTY    — no questions available.
 */
export enum InventoryHealth {
  HEALTHY = "HEALTHY",
  LOW = "LOW",
  CRITICAL = "CRITICAL",
  EMPTY = "EMPTY",
}

/**
 * Per-concept health within a subject-level assessment.
 */
export interface ConceptInventoryHealth {
  readonly conceptId: string;
  readonly approved: number;
  readonly health: InventoryHealth;
}

/**
 * Snapshot of question inventory health for a single subject level.
 */
export interface LevelInventoryStatus {
  readonly level: number;
  readonly title: string;
  readonly totalApproved: number;
  readonly health: InventoryHealth;
  readonly byConcept: readonly ConceptInventoryHealth[];
}

/**
 * Snapshot of question inventory health for a single subject.
 */
export interface InventoryStatus {
  readonly subjectId: string;
  readonly totalApproved: number;
  readonly totalUnseen: number;
  readonly totalRecentlySeen: number;
  readonly health: InventoryHealth;
  readonly byConcept: Map<string, { approved: number; health: InventoryHealth }>;
  readonly byDifficulty: Record<number, number>;
  readonly lastCheckedAt: Date;
}
