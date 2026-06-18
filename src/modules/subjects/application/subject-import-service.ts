import { Subject } from "@/modules/subjects/domain/subject";
import type { SubjectProgression } from "@/modules/subjects/domain/subject-level";
import { SubjectFileReader } from "./subject-file-reader";
import { SubjectFrontmatterParser } from "./subject-frontmatter-parser";
import { SubjectSectionParser } from "./subject-section-parser";
import { ConceptParser } from "./concept-parser";
import { SubjectSchemaValidator } from "./subject-schema-validator";
import { PrerequisiteGraphBuilder } from "./prerequisite-graph-builder";
import type { PrerequisiteGraph } from "./prerequisite-graph-builder";

export interface ImportResult {
  subject: Subject;
  graph: PrerequisiteGraph;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Orchestrator that coordinates the full subject import pipeline:
 *
 *   Reader → FrontmatterParser → SectionParser → ConceptParser →
 *   SchemaValidator → builds Subject + Graph
 */
export class SubjectImportService {
  constructor(
    private readonly reader: SubjectFileReader,
    private readonly frontmatterParser: SubjectFrontmatterParser,
    private readonly sectionParser: SubjectSectionParser,
    private readonly conceptParser: ConceptParser,
    private readonly validator: SubjectSchemaValidator,
    private readonly graphBuilder: PrerequisiteGraphBuilder,
  ) {}

  async import(subjectId: string): Promise<ImportResult> {
    // 1. Read raw file
    const raw = await this.reader.read(subjectId);

    // 2. Parse frontmatter
    const frontmatter = this.frontmatterParser.parse(raw);
    const body = this.frontmatterParser.extractBody(raw);

    // 3. Parse sections
    const domains = this.sectionParser.parse(body);

    // 4. Build Concept objects for each domain
    const subjectDomains = domains.map((d) => ({
      name: d.name,
      concepts: d.concepts.map((c) => this.conceptParser.parse(c, subjectId, d.name)),
    }));

    // 5. Assemble the Subject domain object
    const now = new Date();
    const progression = this.parseProgression(frontmatter);
    const subject: Subject = {
      id: (frontmatter.id as string) || subjectId,
      title: (frontmatter.title as string) || subjectId,
      description: (frontmatter.description as string) || "",
      version: (frontmatter.version as number) || 1,
      schemaVersion: (frontmatter.schemaVersion as number) || 1,
      minimumGameVersion: (frontmatter.minimumGameVersion as string) || "1.0.0",
      progression,
      domains: subjectDomains,
      createdAt: now,
      updatedAt: now,
    };

    // 6. Validate
    const validation = this.validator.validate(subject);

    // 7. Build prerequisite graph
    const allConcepts = subjectDomains.flatMap((d) => d.concepts);
    const graph = this.graphBuilder.build(allConcepts);

    return {
      subject,
      graph,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  /**
   * Parse progression definition from frontmatter.
   * Falls back to a minimal default if not provided or unparseable.
   */
  private parseProgression(frontmatter: Record<string, unknown>): SubjectProgression {
    const raw = frontmatter["progression"];

    if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
      const p = raw as Record<string, unknown>;

      // Map levels from raw - handle both array and missing
      const rawLevels = p["levels"];
      const levels = Array.isArray(rawLevels)
        ? rawLevels.map((l: unknown, i: number) => {
            const level = l as Record<string, unknown>;
            const difficultyRange = level["difficultyRange"] as Record<string, unknown> | undefined;
            const rawConcepts = level["concepts"];
            const rawChallengeTypes = level["allowedChallengeTypes"];

            return {
              level: (level["level"] as number) ?? i + 1,
              title: (level["title"] as string) ?? `Level ${i + 1}`,
              description: (level["description"] as string) ?? "",
              difficultyRange: {
                minimum: (difficultyRange?.["minimum"] as number) ?? 1,
                maximum: (difficultyRange?.["maximum"] as number) ?? 2,
              },
              requiredMastery: (level["requiredMastery"] as number) ?? 65,
              requiredSuccessfulEncounters: (level["requiredSuccessfulEncounters"] as number) ?? 20,
              requiredReviewEncounters: (level["requiredReviewEncounters"] as number) ?? 5,
              concepts: Array.isArray(rawConcepts) ? (rawConcepts as string[]) : [],
              allowedChallengeTypes: Array.isArray(rawChallengeTypes)
                ? (rawChallengeTypes as string[])
                : ["multiple-choice", "code-prediction"],
              introduction: level["introduction"] as string | undefined,
            };
          })
        : [];

      return {
        minimumLevel: (p["minimumLevel"] as number) ?? 1,
        maximumLevel: (p["maximumLevel"] as number) ?? Math.max(levels.length, 1),
        estimatedDaysPerLevel: (p["estimatedDaysPerLevel"] as number) ?? 7,
        bossRequired: (p["bossRequired"] as boolean) ?? true,
        levels,
      };
    }

    // Default fallback
    return {
      minimumLevel: 1,
      maximumLevel: 10,
      estimatedDaysPerLevel: 7,
      bossRequired: true,
      levels: [
        {
          level: 1,
          title: "Foundations",
          description: "Core concepts",
          difficultyRange: { minimum: 1, maximum: 2 },
          requiredMastery: 65,
          requiredSuccessfulEncounters: 20,
          requiredReviewEncounters: 5,
          concepts: [],
          allowedChallengeTypes: ["multiple-choice", "code-prediction"],
        },
      ],
    };
  }
}
