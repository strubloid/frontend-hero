import { v4 as uuidv4 } from "uuid";
import type { ArtificialIntelligenceGateway } from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import type { Question } from "@/modules/questions/domain/question";
import type { QuestionType } from "@/modules/subjects/domain/subject";
import { GeneratedQuestionValidator } from "@/modules/questions/application/generated-question-validator";
import { GeneratedQuestionDeduper } from "@/modules/questions/application/generated-question-deduper";
import type { ValidationError } from "@/modules/questions/application/generated-question-validator";

/** Default options used when the AI gateway returns a type that isn't valid. */
const DEFAULT_QUESTION_TYPE: QuestionType = "multiple-choice";

/**
 * Request to generate questions.
 * The system auto-loads all concepts from the subject and
 * distributes questions across difficulty levels 1-5.
 */
export interface GenerateQuestionsUseCaseRequest {
  readonly subjectId: string;
  readonly count: number; // total questions to generate
}

export interface GenerateQuestionsUseCaseResult {
  readonly success: boolean;
  readonly generatedCount: number;
  readonly persistedQuestionIds: readonly string[];
  /** Validation errors (structural checks) keyed by question index in the batch */
  readonly validationErrors: readonly ValidationError[];
  /** Generation errors (AI gateway failures) */
  readonly errors: readonly string[];
  /** Number of questions that passed structural validation */
  readonly validatedCount: number;
  /** Number of questions rejected (validation failure + duplicate) */
  readonly rejectedCount: number;
}

export class GenerateQuestionsUseCase {
  private readonly validator = new GeneratedQuestionValidator();
  private readonly deduper = new GeneratedQuestionDeduper();

  constructor(
    private readonly artificialIntelligenceGateway: ArtificialIntelligenceGateway,
    private readonly questionRepository: QuestionRepository,
    private readonly subjectRepository: SubjectRepository,
  ) {}

  async execute(request: GenerateQuestionsUseCaseRequest): Promise<GenerateQuestionsUseCaseResult> {
    const errors: string[] = [];
    const validationErrors: ValidationError[] = [];
    const persistedQuestionIds: string[] = [];
    let validatedCount = 0;
    let rejectedCount = 0;

    // ── Load subject from DB to get all concepts ─────────────────────────
    const subject = await this.subjectRepository.getById(request.subjectId);
    if (!subject) {
      return {
        success: false,
        generatedCount: 0,
        persistedQuestionIds: [],
        validationErrors: [],
        errors: [`Subject "${request.subjectId}" not found.`],
        validatedCount: 0,
        rejectedCount: 0,
      };
    }

    const allConcepts = subject.domains.flatMap((d) => d.concepts);
    if (allConcepts.length === 0) {
      return {
        success: false,
        generatedCount: 0,
        persistedQuestionIds: [],
        validationErrors: [],
        errors: [`Subject "${request.subjectId}" has no concepts.`],
        validatedCount: 0,
        rejectedCount: 0,
      };
    }

    // ── Distributions across difficulty levels 1-5 ──────────────────────
    // Group concepts by difficulty level
    const byDifficulty = new Map<number, typeof allConcepts>();
    for (const concept of allConcepts) {
      const bucket = byDifficulty.get(concept.difficulty) ?? [];
      bucket.push(concept);
      byDifficulty.set(concept.difficulty, bucket);
    }

    const maxDifficulty = Math.max(...byDifficulty.keys(), 1);
    const minDifficulty = Math.min(...byDifficulty.keys(), 1);

    // Distribute count across difficulty levels
    const difficultyCount = maxDifficulty - minDifficulty + 1;
    const perDifficulty = Math.max(1, Math.floor(request.count / difficultyCount));
    let remaining = request.count;

    for (let diff = minDifficulty; diff <= maxDifficulty && remaining > 0; diff++) {
      const conceptsForLevel = byDifficulty.get(diff);
      if (!conceptsForLevel) continue;

      const countForThisDifficulty = Math.min(perDifficulty, remaining);
      if (countForThisDifficulty <= 0) continue;

      // Distribute within this difficulty across its concepts
      const perConcept = Math.max(1, Math.floor(countForThisDifficulty / conceptsForLevel.length));
      let diffRemaining = countForThisDifficulty;

      for (const concept of conceptsForLevel) {
        if (diffRemaining <= 0) break;

        const count = Math.min(perConcept, diffRemaining);

        const result = await this.artificialIntelligenceGateway.generateQuestion({
          subjectId: request.subjectId,
          conceptId: concept.id,
          difficulty: diff,
          questionType: "multiple-choice",
          count,
        });

        diffRemaining -= count;
        remaining -= count;

        if (!result.success) {
          errors.push(
            result.errorMessage ?? `Generation failed for ${concept.id} at level ${diff}`,
          );
          continue;
        }

        // ── Load existing questions for this concept for dedup ──────────
        const existingQuestions = await this.questionRepository.getByConceptId(concept.id);
        const fingerprintSet = this.deduper.buildFingerprintSet(existingQuestions);

        // ── Validate & deduplicate each generated question ──────────────
        for (let i = 0; i < result.questions.length; i++) {
          if (persistedQuestionIds.length >= request.count) break;

          const generated = result.questions[i];

          // 1. Structural validation
          const itemErrors = this.validator.validate(generated, i);
          if (itemErrors.length > 0) {
            validationErrors.push(...itemErrors);
            rejectedCount++;
            continue;
          }

          validatedCount++;

          // 2. Deduplication check
          const isDuplicate = this.deduper.isDuplicate(
            generated.stem,
            concept.id,
            generated.options,
            generated.correctIndex,
            fingerprintSet,
          );

          if (isDuplicate) {
            rejectedCount++;
            continue;
          }

          // 3. Persist
          const now = new Date();
          const rawType = generated.type as string;
          const type: QuestionType = isQuestionType(rawType) ? rawType : DEFAULT_QUESTION_TYPE;

          const question: Question = {
            id: uuidv4(),
            subjectId: request.subjectId,
            conceptId: concept.id,
            seedId: `generated-${concept.id}-${diff}-${persistedQuestionIds.length}`,
            type,
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
    }

    return {
      success: errors.length === 0 && validationErrors.length === 0,
      generatedCount: persistedQuestionIds.length,
      persistedQuestionIds,
      validationErrors,
      errors,
      validatedCount,
      rejectedCount,
    };
  }
}

/** Narrowing helper: check if a string is a known QuestionType. */
function isQuestionType(value: string): value is QuestionType {
  const validTypes: readonly QuestionType[] = [
    "multiple-choice",
    "multiple-select",
    "true-false",
    "fill-blank",
    "code-prediction",
    "matching",
    "ordering",
    "bug-hunt",
    "explain-it",
  ];
  return (validTypes as readonly string[]).includes(value);
}
