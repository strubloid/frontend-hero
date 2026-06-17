export interface ParsedSubsection {
  title: string;
  content: string;
}

export interface ParsedConcept {
  name: string;
  subsections: ParsedSubsection[];
}

export interface ParsedDomain {
  name: string;
  concepts: ParsedConcept[];
}

export type ParsedSections = ParsedDomain[];

/**
 * Parses the body content (after frontmatter) of a subject markdown file into
 * structured domain → concept → subsection blocks.
 *
 * Heading conventions:
 *   # Domain: <Name>         — Level 1 heading identifies a domain
 *   ## Concept: <Name>       — Level 2 heading identifies a concept
 *   ### <Name>               — Level 3 heading identifies a subsection
 */
export class SubjectSectionParser {
  parse(body: string): ParsedSections {
    const lines = body.split("\n");
    const domains: ParsedDomain[] = [];

    let currentDomain: ParsedDomain | null = null;
    let currentConcept: ParsedConcept | null = null;

    for (const raw of lines) {
      const line = raw.trimEnd();

      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match) {
        // Finalize current concept/domain before starting new domain
        currentConcept = null;

        const name = h1Match[1].replace(/^Domain:\s*/i, "").trim();
        currentDomain = { name, concepts: [] };
        domains.push(currentDomain);
        continue;
      }

      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        if (!currentDomain) {
          // Orphan concept — create an implicit domain
          currentDomain = { name: "", concepts: [] };
          domains.push(currentDomain);
        }

        const name = h2Match[1].replace(/^Concept:\s*/i, "").trim();
        currentConcept = { name, subsections: [] };
        currentDomain.concepts.push(currentConcept);
        continue;
      }

      const h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        if (!currentConcept) {
          // Orphan subsection — skip
          continue;
        }

        const title = h3Match[1].trim();
        currentConcept.subsections.push({ title, content: "" });
        continue;
      }

      // Content line — append to current subsection or concept
      if (currentConcept && currentConcept.subsections.length > 0) {
        const last = currentConcept.subsections.length - 1;
        currentConcept.subsections[last].content +=
          (currentConcept.subsections[last].content ? "\n" : "") + line;
      }
    }

    return domains;
  }
}
