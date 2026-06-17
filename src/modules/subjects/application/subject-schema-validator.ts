import { Subject, Concept, QuestionSeed, SubjectLevel } from "@/modules/subjects/domain/subject";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SubjectSchemaValidator {
  private static readonly VALID_LEVELS: SubjectLevel[] = [
    "foundation",
    "intermediate",
    "advanced",
    "senior",
  ];

  private static readonly VALID_QUESTION_TYPES = [
    "multiple-choice",
    "multiple-select",
    "true-false",
    "fill-blank",
    "code-prediction",
    "matching",
    "ordering",
  ];

  validate(subject: Subject): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Subject-level validation
    if (!subject.id || typeof subject.id !== "string") {
      errors.push("Subject id is required and must be a non-empty string");
    }

    if (!subject.title || typeof subject.title !== "string") {
      errors.push("Subject title is required");
    }

    if (typeof subject.version !== "number" || subject.version < 1) {
      errors.push("Subject version must be a positive number");
    }

    if (typeof subject.schemaVersion !== "number" || subject.schemaVersion < 1) {
      errors.push("Subject schemaVersion must be a positive number");
    }

    // Collect all concept IDs for cross-reference
    const allConceptIds = new Set<string>();
    for (const domain of subject.domains) {
      for (const concept of domain.concepts) {
        allConceptIds.add(concept.id);
      }
    }

    // Domain & concept validation
    if (!subject.domains || subject.domains.length === 0) {
      errors.push("Subject must have at least one domain");
    }

    for (const [di, domain] of subject.domains.entries()) {
      if (!domain.name) {
        errors.push(`Domain at index ${di} must have a name`);
      }

      if (!domain.concepts || domain.concepts.length === 0) {
        errors.push(`Domain "${domain.name || di}" must have at least one concept`);
      }

      for (const [ci, concept] of domain.concepts.entries()) {
        this.validateConcept(concept, allConceptIds, di, ci, errors, warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateConcept(
    concept: Concept,
    allConceptIds: Set<string>,
    domainIndex: number,
    conceptIndex: number,
    errors: string[],
    warnings: string[],
  ): void {
    const label = `Domain[${domainIndex}].Concept[${conceptIndex}] ("${concept.id}")`;

    if (!concept.id || typeof concept.id !== "string") {
      errors.push(`${label}: id is required and must be a non-empty string`);
    }

    if (!concept.name) {
      errors.push(`${label}: name is required`);
    }

    if (concept.difficulty < 1 || concept.difficulty > 5 || !Number.isInteger(concept.difficulty)) {
      errors.push(
        `${label}: difficulty must be an integer between 1 and 5, got ${concept.difficulty}`,
      );
    }

    if (!SubjectSchemaValidator.VALID_LEVELS.includes(concept.level)) {
      errors.push(
        `${label}: level must be one of ${SubjectSchemaValidator.VALID_LEVELS.join(", ")}, got "${concept.level}"`,
      );
    }

    // Prerequisites must reference existing concept IDs
    for (const prereq of concept.prerequisites) {
      if (!allConceptIds.has(prereq)) {
        warnings.push(
          `${label}: prerequisite "${prereq}" does not match any concept ID in this subject`,
        );
      }
    }

    // Question seeds validation
    for (const [si, seed] of concept.questionSeeds.entries()) {
      this.validateQuestionSeed(seed, label, si, errors);
    }
  }

  private validateQuestionSeed(
    seed: QuestionSeed,
    conceptLabel: string,
    seedIndex: number,
    errors: string[],
  ): void {
    const label = `${conceptLabel}.QuestionSeed[${seedIndex}]`;

    if (!seed.seedId) {
      errors.push(`${label}: seedId is required`);
    }

    if (!SubjectSchemaValidator.VALID_QUESTION_TYPES.includes(seed.type)) {
      errors.push(
        `${label}: type must be one of ${SubjectSchemaValidator.VALID_QUESTION_TYPES.join(", ")}, got "${seed.type}"`,
      );
    }

    if (seed.difficulty < 1 || seed.difficulty > 5) {
      errors.push(`${label}: difficulty must be between 1 and 5`);
    }

    if (!seed.stem) {
      errors.push(`${label}: stem is required`);
    }

    if (!seed.options || seed.options.length < 2) {
      errors.push(`${label}: must have at least 2 options`);
    }

    if (
      typeof seed.correctIndex !== "number" ||
      seed.correctIndex < 0 ||
      seed.correctIndex >= (seed.options || []).length
    ) {
      errors.push(`${label}: correctIndex must be a valid index into options`);
    }

    if (!seed.explanation) {
      errors.push(`${label}: explanation is required`);
    }
  }
}
