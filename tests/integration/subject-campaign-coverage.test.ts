import { describe, expect, it } from "vitest";
import { ConceptParser } from "@/modules/subjects/application/concept-parser";
import { PrerequisiteGraphBuilder } from "@/modules/subjects/application/prerequisite-graph-builder";
import { SubjectFileReader } from "@/modules/subjects/application/subject-file-reader";
import { SubjectFrontmatterParser } from "@/modules/subjects/application/subject-frontmatter-parser";
import { SubjectImportService } from "@/modules/subjects/application/subject-import-service";
import { SubjectSchemaValidator } from "@/modules/subjects/application/subject-schema-validator";
import { SubjectSectionParser } from "@/modules/subjects/application/subject-section-parser";

const MIN_SEEDS_PER_PLAYABLE_CONCEPT = 3;
const MIN_SEEDS_PER_LEVEL = 9;

function createImportService(): SubjectImportService {
  return new SubjectImportService(
    new SubjectFileReader("subjects"),
    new SubjectFrontmatterParser(),
    new SubjectSectionParser(),
    new ConceptParser(),
    new SubjectSchemaValidator(),
    new PrerequisiteGraphBuilder(),
  );
}

describe("subject campaign coverage", () => {
  it("keeps the Next.js progression map aligned with playable concept bodies and seed supply", async () => {
    const result = await createImportService().import("nextjs");

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.subject.progression).toBeDefined();

    const levels = result.subject.progression?.levels ?? [];
    const bodyConcepts = result.subject.domains.flatMap((domain) => domain.concepts);
    const bodyConceptIds = new Set(bodyConcepts.map((concept) => concept.id));
    const progressionConceptIds = new Set(levels.flatMap((level) => level.concepts));

    for (const level of levels) {
      const missingConcepts = level.concepts.filter((conceptId) => !bodyConceptIds.has(conceptId));
      expect(missingConcepts, `level ${level.level} has missing concept bodies`).toEqual([]);

      const levelSeedCount = level.concepts.reduce((total, conceptId) => {
        const concept = bodyConcepts.find((candidate) => candidate.id === conceptId);
        return total + (concept?.questionSeeds.length ?? 0);
      }, 0);
      expect(
        levelSeedCount,
        `level ${level.level} needs playable seed coverage`,
      ).toBeGreaterThanOrEqual(MIN_SEEDS_PER_LEVEL);
    }

    const unusedBodyConceptIds = bodyConcepts
      .map((concept) => concept.id)
      .filter((conceptId) => !progressionConceptIds.has(conceptId));
    expect(unusedBodyConceptIds, "body concepts must be used by progression").toEqual([]);

    const underSeededConceptIds = bodyConcepts
      .filter((concept) => concept.questionSeeds.length < MIN_SEEDS_PER_PLAYABLE_CONCEPT)
      .map((concept) => concept.id);
    expect(underSeededConceptIds, "playable concepts need at least 3 seeds").toEqual([]);
  });
});
