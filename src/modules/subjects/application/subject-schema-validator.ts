import {
  Subject,
  Concept,
  SubjectLevel,
  QuestionSeed,
  QuestionType,
} from "@/modules/subjects/domain/subject";
import { ParseError, lineNumberAt, getLine } from "@/modules/subjects/domain/parse-error";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Extends ValidationResult with line-level detail.
 */
export interface DetailedValidationResult extends ValidationResult {
  parseErrors: ParseError[];
}

export class SubjectSchemaValidator {
  private static readonly VALID_LEVELS: SubjectLevel[] = [
    "foundation",
    "intermediate",
    "advanced",
    "senior",
  ];

  private static readonly VALID_QUESTION_TYPES: QuestionType[] = [
    "multiple-choice",
    "multiple-select",
    "true-false",
    "fill-blank",
    "code-prediction",
    "matching",
    "ordering",
  ];

  private static readonly MAX_DIFFICULTY = 5;
  private static readonly MIN_DIFFICULTY = 1;

  validate(subject: Subject): ValidationResult {
    return this.toLegacy(this.validateDetailed(subject, ""));
  }

  validateDetailed(subject: Subject, rawText: string): DetailedValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const parseErrors: ParseError[] = [];

    // --- Subject-level checks ---
    if (!subject.id) {
      const pe: ParseError = {
        message: "Subject id is required",
        severity: "error",
        code: "SUBJECT_ID_REQUIRED",
      };
      errors.push(pe.message);
      parseErrors.push(pe);
    }
    if (!subject.title) {
      const pe: ParseError = {
        message: "Subject title is required",
        severity: "error",
        code: "SUBJECT_TITLE_REQUIRED",
      };
      warnings.push(pe.message);
      parseErrors.push(pe);
    }
    if (subject.schemaVersion < 1) {
      const pe: ParseError = {
        message: `schemaVersion must be >= 1, got ${subject.schemaVersion}`,
        severity: "error",
        code: "INVALID_SCHEMA_VERSION",
      };
      errors.push(pe.message);
      parseErrors.push(pe);
    }
    if (subject.domains.length === 0) {
      const pe: ParseError = {
        message: "Subject has no domains; at least one domain required",
        severity: "warning",
        code: "NO_DOMAINS",
      };
      warnings.push(pe.message);
      parseErrors.push(pe);
    }

    // --- Domain checks ---
    const domainNames = new Set<string>();
    for (const domain of subject.domains) {
      if (domainNames.has(domain.name)) {
        const pe: ParseError = {
          message: `Duplicate domain name: "${domain.name}"`,
          severity: "error",
          code: "DUPLICATE_DOMAIN",
        };
        errors.push(pe.message);
        parseErrors.push(pe);
      }
      domainNames.add(domain.name);

      if (domain.concepts.length === 0) {
        const pe: ParseError = {
          message: `Domain "${domain.name}" has no concepts`,
          severity: "warning",
          code: "DOMAIN_NO_CONCEPTS",
        };
        warnings.push(pe.message);
        parseErrors.push(pe);
      }
    }

    // --- Concept checks ---
    const conceptIds = new Set<string>();
    for (const domain of subject.domains) {
      for (const concept of domain.concepts) {
        // Duplicate concept ID
        if (conceptIds.has(concept.id)) {
          const pe: ParseError = {
            message: `Duplicate concept id: "${concept.id}"`,
            severity: "error",
            section: `Domain: ${domain.name}`,
            code: "DUPLICATE_CONCEPT_ID",
          };
          errors.push(pe.message);
          parseErrors.push(pe);
        }
        conceptIds.add(concept.id);

        // Level
        if (!SubjectSchemaValidator.VALID_LEVELS.includes(concept.level)) {
          const pe: ParseError = {
            message: `Invalid level "${concept.level}" for concept "${concept.id}". Valid: ${SubjectSchemaValidator.VALID_LEVELS.join(", ")}`,
            severity: "error",
            section: `Domain: ${domain.name}`,
            context: concept.id,
            code: "INVALID_LEVEL",
          };
          errors.push(pe.message);
          parseErrors.push(pe);
        }

        // Difficulty range
        if (
          concept.difficulty < SubjectSchemaValidator.MIN_DIFFICULTY ||
          concept.difficulty > SubjectSchemaValidator.MAX_DIFFICULTY
        ) {
          const pe: ParseError = {
            message: `difficulty ${concept.difficulty} out of range [${SubjectSchemaValidator.MIN_DIFFICULTY}-${SubjectSchemaValidator.MAX_DIFFICULTY}] for concept "${concept.id}"`,
            severity: "error",
            section: `Domain: ${domain.name}`,
            context: concept.id,
            code: "DIFFICULTY_OUT_OF_RANGE",
          };
          errors.push(pe.message);
          parseErrors.push(pe);
        }

        // Prerequisites that reference nonexistent concepts
        for (const prereq of concept.prerequisites) {
          if (!conceptIds.has(prereq) && prereq !== concept.id) {
            const pe: ParseError = {
              message: `Concept "${concept.id}" references unknown prerequisite "${prereq}"`,
              severity: "warning",
              section: `Domain: ${domain.name}`,
              context: concept.id,
              code: "UNKNOWN_PREREQUISITE",
            };
            warnings.push(pe.message);
            parseErrors.push(pe);
          }
        }

        // Self-referencing prerequisite
        if (concept.prerequisites.includes(concept.id)) {
          const pe: ParseError = {
            message: `Concept "${concept.id}" lists itself as a prerequisite`,
            severity: "error",
            section: `Domain: ${domain.name}`,
            context: concept.id,
            code: "SELF_PREREQUISITE",
          };
          errors.push(pe.message);
          parseErrors.push(pe);
        }

        // Empty knowledge
        if (!concept.knowledge || concept.knowledge.trim().length === 0) {
          const pe: ParseError = {
            message: `Concept "${concept.id}" has no knowledge content`,
            severity: "warning",
            section: `Domain: ${domain.name}`,
            context: concept.id,
            code: "NO_KNOWLEDGE",
          };
          warnings.push(pe.message);
          parseErrors.push(pe);
        }
      }
    }

    // --- Question seed checks ---
    const seedIds = new Set<string>();
    for (const domain of subject.domains) {
      for (const concept of domain.concepts) {
        for (const seed of concept.questionSeeds) {
          if (seed.type && !SubjectSchemaValidator.VALID_QUESTION_TYPES.includes(seed.type)) {
            const pe: ParseError = {
              message: `Invalid question type "${seed.type}" in concept "${concept.id}"`,
              severity: "error",
              section: `Domain: ${domain.name}`,
              context: concept.id,
              code: "INVALID_QUESTION_TYPE",
            };
            errors.push(pe.message);
            parseErrors.push(pe);
          }

          // Validate options structure
          if (
            (seed.type === "multiple-choice" || seed.type === "multiple-select") &&
            (!seed.options || seed.options.length < 2)
          ) {
            const pe: ParseError = {
              message: `Question of type "${seed.type}" in concept "${concept.id}" must have at least 2 options`,
              severity: "error",
              section: `Domain: ${domain.name}`,
              context: concept.id,
              code: "INSUFFICIENT_OPTIONS",
            };
            errors.push(pe.message);
            parseErrors.push(pe);
          }

          // Validate correctIndex present
          if (seed.correctIndex === undefined || seed.correctIndex === null) {
            const pe: ParseError = {
              message: `Question seed in concept "${concept.id}" is missing correctIndex`,
              severity: "error",
              section: `Domain: ${domain.name}`,
              context: concept.id,
              code: "MISSING_CORRECT_INDEX",
            };
            errors.push(pe.message);
            parseErrors.push(pe);
          } else if (
            seed.options &&
            (seed.correctIndex < 0 || seed.correctIndex >= seed.options.length)
          ) {
            const pe: ParseError = {
              message: `Question seed in concept "${concept.id}" has correctIndex ${seed.correctIndex} but only ${seed.options.length} options`,
              severity: "error",
              section: `Domain: ${domain.name}`,
              context: concept.id,
              code: "INVALID_CORRECT_INDEX",
            };
            errors.push(pe.message);
            parseErrors.push(pe);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings, parseErrors };
  }

  /**
   * Add line-number annotations to ParseErrors by matching raw text fragments.
   */
  annotateWithLineNumbers(errors: ParseError[], rawText: string): ParseError[] {
    return errors.map((err) => {
      if (err.line) return err; // already annotated
      if (err.rawFragment) {
        const idx = rawText.indexOf(err.rawFragment);
        if (idx !== -1) {
          return { ...err, line: lineNumberAt(rawText, idx) };
        }
      }
      return err;
    });
  }

  private toLegacy(detailed: DetailedValidationResult): ValidationResult {
    return { valid: detailed.valid, errors: detailed.errors, warnings: detailed.warnings };
  }
}

/**
 * Returns a human-readable diff of validation issues.
 */
export function formatValidationFailures(result: ValidationResult): string {
  const parts: string[] = [];
  if (!result.valid) {
    parts.push(`Validation FAILED: ${result.errors.length} error(s)`);
  }
  for (const err of result.errors) {
    parts.push(`  ERROR: ${err}`);
  }
  for (const warn of result.warnings) {
    parts.push(`  WARN:  ${warn}`);
  }
  if (result.valid && result.warnings.length === 0) {
    parts.push("Validation passed — no issues.");
  }
  return parts.join("\n");
}
