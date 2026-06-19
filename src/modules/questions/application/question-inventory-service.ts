import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { QuestionInventoryService as QuestionInventoryServiceContract } from "@/modules/questions/domain/question-inventory-service";
import { InventoryHealth } from "@/modules/questions/domain/inventory-health";
import type { InventoryStatus } from "@/modules/questions/domain/inventory-health";

const HEALTHY_THRESHOLD = 40;
const LOW_THRESHOLD = 10;
const RECENT_DAYS = 7;
const MAX_SUBJECT_QUESTIONS_TO_SCAN = 10_000;

export class QuestionInventoryService implements QuestionInventoryServiceContract {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async getInventoryStatus(subjectId: string): Promise<InventoryStatus> {
    const questions = await this.questionRepository.getRandomBySubjectId(
      subjectId,
      MAX_SUBJECT_QUESTIONS_TO_SCAN,
    );
    const byConcept = new Map<string, { approved: number; health: InventoryHealth }>();
    const conceptCounts = new Map<string, number>();
    const byDifficulty: Record<number, number> = {};
    const recentCutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;

    let totalUnseen = 0;
    let totalRecentlySeen = 0;

    for (const question of questions) {
      conceptCounts.set(question.conceptId, (conceptCounts.get(question.conceptId) ?? 0) + 1);
      byDifficulty[question.difficulty] = (byDifficulty[question.difficulty] ?? 0) + 1;

      if (!question.lastShownAt || question.timesShown === 0) {
        totalUnseen += 1;
      } else if (question.lastShownAt.getTime() >= recentCutoff) {
        totalRecentlySeen += 1;
      }
    }

    for (const [conceptId, approved] of conceptCounts.entries()) {
      byConcept.set(conceptId, {
        approved,
        health: this.determineHealth(approved),
      });
    }

    return {
      subjectId,
      totalApproved: questions.length,
      totalUnseen,
      totalRecentlySeen,
      health: this.determineHealth(questions.length),
      byConcept,
      byDifficulty,
      lastCheckedAt: new Date(),
    };
  }

  async getInventoryHealthByConcept(
    _subjectId: string,
    conceptId: string,
  ): Promise<InventoryHealth> {
    const questions = await this.questionRepository.getByConceptId(conceptId);
    return this.determineHealth(questions.length);
  }

  async isHealthy(subjectId: string): Promise<boolean> {
    const status = await this.getInventoryStatus(subjectId);
    return status.health === InventoryHealth.HEALTHY;
  }

  async getConceptsNeedingGeneration(subjectId: string, minPerConcept: number): Promise<string[]> {
    const status = await this.getInventoryStatus(subjectId);
    const conceptsNeedingGeneration: string[] = [];

    for (const [conceptId, conceptStatus] of status.byConcept.entries()) {
      if (conceptStatus.approved < minPerConcept) {
        conceptsNeedingGeneration.push(conceptId);
      }
    }

    return conceptsNeedingGeneration;
  }

  private determineHealth(approved: number): InventoryHealth {
    if (approved >= HEALTHY_THRESHOLD) return InventoryHealth.HEALTHY;
    if (approved >= LOW_THRESHOLD) return InventoryHealth.LOW;
    if (approved > 0) return InventoryHealth.CRITICAL;
    return InventoryHealth.EMPTY;
  }
}
