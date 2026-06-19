import { InventoryHealth, InventoryStatus } from "./inventory-health";

/**
 * Service for monitoring and reporting on question inventory health.
 */
export interface QuestionInventoryService {
  getInventoryStatus(subjectId: string): Promise<InventoryStatus>;
  getInventoryHealthByConcept(subjectId: string, conceptId: string): Promise<InventoryHealth>;
  isHealthy(subjectId: string): Promise<boolean>;
  getConceptsNeedingGeneration(subjectId: string, minPerConcept: number): Promise<string[]>;
}
