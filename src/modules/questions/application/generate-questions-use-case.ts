import { v4 as uuidv4 } from "uuid";
import type { ArtificialIntelligenceGateway } from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { Question } from "@/modules/questions/domain/question";
import type { QuestionType } from "@/modules/subjects/domain/subject";

export interface GenerateQuestionsUseCaseRequest {
  readonly subjectId: string;
  readonly conceptIds: readonly string[];
  readonly difficultyRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly questionTypes: readonly string[];
  readonly count: number;
}

export interface GenerateQuestionsUseCaseResult {
  readonly success: boolean;
  readonly generatedCount: number;
  readonly persistedQuestionIds: readonly string[];
  readonly errors: readonly string[];
}

export class GenerateQuestionsUseCase {
  constructor(
    private readonly artificialIntelligenceGateway: ArtificialIntelligenceGateway,
    private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(request: GenerateQuestionsUseCaseRequest): Promise<GenerateQuestionsUseCaseResult> {
    if (request.conceptIds.length === 0) {
      return {
        success: false,
        generatedCount: 0,
        persistedQuestionIds: [],
        errors: ["At least one concept is required for question generation."],
      };
    }

    const countPerConcept = Math.max(1, Math.ceil(request.count / request.conceptIds.length));
    const persistedQuestionIds: string[] = [];
    const errors: string[] = [];

    for (const conceptId of request.conceptIds) {
      const result = await this.artificialIntelligenceGateway.generateQuestion({
        subjectId: request.subjectId,
        conceptId,
        difficulty: request.difficultyRange.min,
        questionType: request.questionTypes[0] ?? "multiple-choice",
        count: countPerConcept,
      });

      if (!result.success) {
        errors.push(result.errorMessage ?? `Generation failed for ${conceptId}`);
        continue;
      }

      for (const generated of result.questions) {
        if (persistedQuestionIds.length >= request.count) break;

        const now = new Date();
        const question: Question = {
          id: uuidv4(),
          subjectId: request.subjectId,
          conceptId,
          seedId: `generated-${conceptId}-${Date.now()}-${persistedQuestionIds.length}`,
          type: generated.type as QuestionType,
          difficulty: generated.difficulty,
          stem: generated.stem,
          options: [...generated.options],
          correctIndex: generated.correctIndex,
          explanation: generated.explanation,
          timesShown: 0,
          lastShownAt: null,
          qualityRating: 4,
          createdAt: now,
          updatedAt: now,
        };

        const saved = await this.questionRepository.create(question);
        persistedQuestionIds.push(saved.id);
      }
    }

    return {
      success: errors.length === 0,
      generatedCount: persistedQuestionIds.length,
      persistedQuestionIds,
      errors,
    };
  }
}
