import { InventoryHealth, InventoryStatus, LevelInventoryStatus } from "./inventory-health";

/**
 * Service for monitoring and reporting on question inventory health.
 */
export interface QuestionInventoryService {
  getInventoryStatus(subjectId: string): Promise<InventoryStatus>;
  getInventoryHealthByConcept(subjectId: string, conceptId: string): Promise<InventoryHealth>;
  isHealthy(subjectId: string): Promise<boolean>;
  getConceptsNeedingGeneration(subjectId: string, minPerConcept: number): Promise<string[]>;
  getInventoryStatusByLevel(
    subjectId: string,
    level: number,
    levelTitle: string,
    conceptIds: string[],
  ): Promise<LevelInventoryStatus>;
}
