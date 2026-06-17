"use server";

import { Subject } from "@/modules/subjects/domain/subject";

// Module-level cache
let cachedSubjects: Subject[] | null = null;

export async function getAvailableSubjects(): Promise<Subject[]> {
  if (cachedSubjects) return cachedSubjects;

  const { InMemorySubjectRepository } =
    await import("@/modules/subjects/infrastructure/in-memory-subject-repository");
  const repo = new InMemorySubjectRepository();

  // Try to load from seed data first
  const { SubjectImportService } =
    await import("@/modules/subjects/application/subject-import-service");
  const { SubjectFileReader } = await import("@/modules/subjects/application/subject-file-reader");
  const { SubjectFrontmatterParser } =
    await import("@/modules/subjects/application/subject-frontmatter-parser");
  const { SubjectSectionParser } =
    await import("@/modules/subjects/application/subject-section-parser");
  const { ConceptParser } = await import("@/modules/subjects/application/concept-parser");
  const { SubjectSchemaValidator } =
    await import("@/modules/subjects/application/subject-schema-validator");
  const { PrerequisiteGraphBuilder } =
    await import("@/modules/subjects/application/prerequisite-graph-builder");

  const importService = new SubjectImportService(
    new SubjectFileReader("subjects"),
    new SubjectFrontmatterParser(),
    new SubjectSectionParser(),
    new ConceptParser(),
    new SubjectSchemaValidator(),
    new PrerequisiteGraphBuilder(),
  );

  // Read available subject files from the subjects directory
  const fs = await import("fs");
  const path = await import("path");

  const subjectsDir = path.join(process.cwd(), "subjects");
  let files: string[];
  try {
    files = fs.readdirSync(subjectsDir).filter((f: string) => f.endsWith(".md"));
  } catch {
    cachedSubjects = [];
    return [];
  }

  const subjects: Subject[] = [];
  for (const file of files) {
    const subjectId = file.replace(/\.md$/, "");
    try {
      const result = await importService.import(subjectId);
      repo.set(result.subject);
      subjects.push(result.subject);
    } catch {
      // Skip malformed subjects silently
      continue;
    }
  }

  cachedSubjects = subjects;
  return subjects;
}

export interface SubjectSummary {
  id: string;
  title: string;
  description: string;
  version: number;
  schemaVersion: number;
  domainCount: number;
  conceptCount: number;
}

export async function getSubjectSummaries(): Promise<SubjectSummary[]> {
  const subjects = await getAvailableSubjects();
  return subjects.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    version: s.version,
    schemaVersion: s.schemaVersion,
    domainCount: s.domains.length,
    conceptCount: s.domains.reduce((sum, d) => sum + d.concepts.length, 0),
  }));
}
