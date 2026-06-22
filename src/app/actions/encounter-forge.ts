"use server";

import { BigPickleGateway } from "@/modules/artificial-intelligence/infrastructure/big-pickle-gateway";
import { GenerateQuestionsUseCase } from "@/modules/questions/application/generate-questions-use-case";
import { QuestionInventoryService } from "@/modules/questions/application/question-inventory-service";
import { DrizzleQuestionRepository } from "@/modules/questions/infrastructure/drizzle-question-repository";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
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

export interface LevelInventoryDto {
  readonly level: number;
  readonly title: string;
  readonly totalApproved: number;
  readonly health: string;
  readonly byConcept: readonly {
    readonly conceptId: string;
    readonly approved: number;
    readonly health: string;
  }[];
}

export interface EncounterForgeGenerateRequest {
  readonly subjectId: string;
  readonly count: number;
}

export interface EncounterForgeGenerateResult {
  readonly success: boolean;
  readonly generatedCount: number;
  readonly persistedQuestionIds: readonly string[];
  readonly errors: readonly string[];
}

export interface SubjectSummaryDto {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface ConceptSummaryDto {
  readonly id: string;
  readonly name: string;
  readonly domainName: string;
  readonly difficulty: number;
}

function createQuestionRepository(): DrizzleQuestionRepository {
  return new DrizzleQuestionRepository(getSqliteConnection());
}

function createSubjectRepository(): DrizzleSubjectRepository {
  return new DrizzleSubjectRepository(getSqliteConnection());
}

/**
 * Load all available subjects from the database.
 */
export async function getAvailableSubjects(): Promise<readonly SubjectSummaryDto[]> {
  const repo = createSubjectRepository();
  const subjects = await repo.findAll();
  return subjects.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
  }));
}

/**
 * Load all concepts for a given subject from the database.
 */
export async function getConceptsForSubject(
  subjectId: string,
): Promise<readonly ConceptSummaryDto[]> {
  const repo = createSubjectRepository();
  const subject = await repo.getById(subjectId);
  if (!subject) return [];

  return subject.domains.flatMap((d) =>
    d.concepts.map((c) => ({
      id: c.id,
      name: c.name,
      domainName: d.name,
      difficulty: c.difficulty,
    })),
  );
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

/**
 * Get per-level inventory breakdown for the Encounter Forge dashboard.
 * Each level's health is computed from its assigned concepts.
 */
export async function getEncounterForgeLevelInventory(
  subjectId: string = "nextjs",
): Promise<readonly LevelInventoryDto[]> {
  const subjectRepo = createSubjectRepository();
  const subject = await subjectRepo.getById(subjectId);
  if (!subject || !subject.progression) return [];

  const inventoryService = new QuestionInventoryService(createQuestionRepository());
  const results: LevelInventoryDto[] = [];

  for (const levelDef of subject.progression.levels) {
    const levelConcepts = [...levelDef.concepts];
    const status = await inventoryService.getInventoryStatusByLevel(
      subjectId,
      levelDef.level,
      levelDef.title,
      levelConcepts,
    );
    results.push({
      level: status.level,
      title: status.title,
      totalApproved: status.totalApproved,
      health: status.health,
      byConcept: status.byConcept.map((c) => ({
        conceptId: c.conceptId,
        approved: c.approved,
        health: c.health,
      })),
    });
  }

  return results;
}

export async function generateEncounterForgeQuestions(
  request: EncounterForgeGenerateRequest,
): Promise<EncounterForgeGenerateResult> {
  const gateway = new BigPickleGateway();
  gateway.isAvailableFlag = true;

  const useCase = new GenerateQuestionsUseCase(
    gateway,
    createQuestionRepository(),
    createSubjectRepository(),
  );

  const result = await useCase.execute({
    subjectId: request.subjectId,
    count: request.count,
  });

  return result;
}
