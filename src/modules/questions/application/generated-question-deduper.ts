import type { Question } from "@/modules/questions/domain/question";

/**
 * A normalized representation of a question used for deduplication checks.
 */
export interface QuestionFingerprint {
  /** Lowercased, trimmed, whitespace-collapsed stem */
  readonly stemHash: string;
  /** The concept this question belongs to */
  readonly conceptId: string;
  /** The correct answer text (lowercased, trimmed) */
  readonly correctAnswerHash: string;
}

/**
 * Creates a normalized fingerprint for a question used in dedup comparison.
 */
function createFingerprint(
  stem: string,
  conceptId: string,
  options: readonly string[],
  correctIndex: number,
): QuestionFingerprint {
  // Normalize stem: lowercase, trim, collapse multiple spaces
  const stemHash = stem.toLowerCase().trim().replace(/\s+/g, " ");
  const correctAnswerHash = (options[correctIndex] ?? "").toLowerCase().trim();

  return {
    stemHash,
    conceptId,
    correctAnswerHash,
  };
}

/**
 * Checks whether a newly-generated question is a duplicate of existing
 * questions in the repository, based on:
 *  - Normalized stem text
 *  - Same concept ID
 *  - Same correct answer
 */
export class GeneratedQuestionDeduper {
  /**
   * Build a set of fingerprints from existing questions for fast lookup.
   *
   * @param existingQuestions - Questions already persisted for the relevant concepts
   * @returns A Set of stemHash strings for O(1) duplicate checking
   */
  buildFingerprintSet(existingQuestions: readonly Question[]): Set<string> {
    const fingerprints = new Set<string>();
    for (const q of existingQuestions) {
      const fp = createFingerprint(q.stem, q.conceptId, q.options, q.correctIndex);
      fingerprints.add(fp.stemHash);
    }
    return fingerprints;
  }

  /**
   * Check whether a single generated question is a duplicate of any existing questions.
   *
   * @param stem - The question stem
   * @param conceptId - The concept ID
   * @param options - The list of options
   * @param correctIndex - The index of the correct answer
   * @param fingerprintSet - The set of existing fingerprints (from buildFingerprintSet)
   * @returns true if the question is a duplicate
   */
  isDuplicate(
    stem: string,
    conceptId: string,
    options: readonly string[],
    correctIndex: number,
    fingerprintSet: Set<string>,
  ): boolean {
    const fp = createFingerprint(stem, conceptId, options, correctIndex);
    return fingerprintSet.has(fp.stemHash);
  }

  /**
   * Convenience: filter a list of generated question items, keeping only
   * those that are NOT duplicates of the existing fingerprint set.
   * Returns the filtered array and the count of duplicates removed.
   */
  filterDuplicates(
    generatedStems: readonly string[],
    conceptId: string,
    optionsList: readonly (readonly string[])[],
    correctIndices: readonly number[],
    fingerprintSet: Set<string>,
  ): { keptIndices: number[]; duplicateCount: number } {
    const keptIndices: number[] = [];
    let duplicateCount = 0;

    for (let i = 0; i < generatedStems.length; i++) {
      if (
        this.isDuplicate(
          generatedStems[i],
          conceptId,
          optionsList[i],
          correctIndices[i],
          fingerprintSet,
        )
      ) {
        duplicateCount++;
      } else {
        keptIndices.push(i);
      }
    }

    return { keptIndices, duplicateCount };
  }
}
