"use server";

import { BigPickleGateway } from "@/modules/artificial-intelligence/infrastructure/big-pickle-gateway";
import { GenerateQuestionsUseCase } from "@/modules/questions/application/generate-questions-use-case";
import { QuestionInventoryService } from "@/modules/questions/application/question-inventory-service";
import { DrizzleQuestionRepository } from "@/modules/questions/infrastructure/drizzle-question-repository";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";

export interface EncounterForgeInventoryDto {
  readonly subjectId: string;
  readonly totalApproved: number;
  readonly totalUnseen: number;
  readonly totalRecentlySeen: number;
  readonly health: string;
  readonly byConcept: readonly {
    readonly conceptId: string;
    readonly approved: number;
    readonly health: string;
  }[];
  readonly byDifficulty: Record<string, number>;
  readonly lastCheckedAt: string;
}

export interface EncounterForgeGenerateRequest {
  readonly subjectId: string;
  readonly conceptIds: readonly string[];
  readonly count: number;
}

export interface EncounterForgeGenerateResult {
  readonly success: boolean;
  readonly generatedCount: number;
  readonly persistedQuestionIds: readonly string[];
  readonly errors: readonly string[];
}

function createQuestionRepository(): DrizzleQuestionRepository {
  return new DrizzleQuestionRepository(getSqliteConnection());
}

export async function getEncounterForgeInventory(
  subjectId: string = "nextjs",
): Promise<EncounterForgeInventoryDto> {
  const inventoryService = new QuestionInventoryService(createQuestionRepository());
  const status = await inventoryService.getInventoryStatus(subjectId);

  return {
    subjectId: status.subjectId,
    totalApproved: status.totalApproved,
    totalUnseen: status.totalUnseen,
    totalRecentlySeen: status.totalRecentlySeen,
    health: status.health,
    byConcept: Array.from(status.byConcept.entries()).map(([conceptId, conceptStatus]) => ({
      conceptId,
      approved: conceptStatus.approved,
      health: conceptStatus.health,
    })),
    byDifficulty: Object.fromEntries(
      Object.entries(status.byDifficulty).map(([difficulty, count]) => [difficulty, count]),
    ),
    lastCheckedAt: status.lastCheckedAt.toISOString(),
  };
}

export async function generateEncounterForgeQuestions(
  request: EncounterForgeGenerateRequest,
): Promise<EncounterForgeGenerateResult> {
  const gateway = new BigPickleGateway();
  gateway.isAvailableFlag = true;

  const useCase = new GenerateQuestionsUseCase(gateway, createQuestionRepository());
  const result = await useCase.execute({
    subjectId: request.subjectId,
    conceptIds: request.conceptIds,
    difficultyRange: { min: 1, max: 4 },
    questionTypes: ["multiple-choice"],
    count: request.count,
  });

  return result;
}
