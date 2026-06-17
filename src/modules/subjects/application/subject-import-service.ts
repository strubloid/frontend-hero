import { Subject } from "@/modules/subjects/domain/subject";
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
    const subject: Subject = {
      id: (frontmatter.id as string) || subjectId,
      title: (frontmatter.title as string) || subjectId,
      description: (frontmatter.description as string) || "",
      version: (frontmatter.version as number) || 1,
      schemaVersion: (frontmatter.schemaVersion as number) || 1,
      minimumGameVersion: (frontmatter.minimumGameVersion as string) || "1.0.0",
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
}
