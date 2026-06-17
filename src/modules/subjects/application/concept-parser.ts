import {
  Concept,
  QuestionSeed,
  PracticalChallenge,
  InterviewPrompt,
  SubjectLevel,
} from "@/modules/subjects/domain/subject";
import { ParsedConcept } from "./subject-section-parser";

/**
 * Parses the structured sections within a parsed concept and builds a domain
 * Concept object with all fields populated.
 */
export class ConceptParser {
  private static readonly VALID_LEVELS: SubjectLevel[] = [
    "foundation",
    "intermediate",
    "advanced",
    "senior",
  ];

  parse(parsed: ParsedConcept, subjectId: string, domainName: string): Concept {
    const subsections = parsed.subsections;

    // Extract metadata
    const metadata = this.parseMetadata(this.getSubsectionContent(subsections, "Metadata"));

    const knowledge = this.getSubsectionContent(subsections, "Knowledge").trim();
    const commonMisconceptions = this.parseBulletList(
      this.getSubsectionContent(subsections, "Common Misconceptions"),
    );
    const examples = this.parseCodeBlocks(this.getSubsectionContent(subsections, "Examples"));
    const questionSeeds = this.parseQuestionSeeds(
      this.getSubsectionContent(subsections, "Question Seeds"),
    );
    const practicalChallenges = this.parsePracticalChallenges(
      this.getSubsectionContent(subsections, "Practical Challenges"),
    );
    const interviewPrompts = this.parseInterviewPrompts(
      this.getSubsectionContent(subsections, "Interview Prompts"),
    );

    const id = this.getString(metadata.id) || this.slugify(parsed.name);
    const level = this.resolveLevel(metadata.level);

    return {
      id,
      name: parsed.name,
      domainName,
      subjectId,
      level,
      difficulty: this.resolveDifficulty(metadata.difficulty),
      prerequisites: this.getStringArray(metadata.prerequisites),
      tags: this.getStringArray(metadata.tags),
      outcomes: this.getStringArray(metadata.outcomes),
      knowledge,
      commonMisconceptions,
      examples,
      questionSeeds,
      practicalChallenges,
      interviewPrompts,
    };
  }

  private getString(val: unknown): string | undefined {
    return typeof val === "string" && val.length > 0 ? val : undefined;
  }

  private getStringArray(val: unknown): string[] {
    if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
    return [];
  }

  private getSubsectionContent(
    subsections: { title: string; content: string }[],
    title: string,
  ): string {
    const sub = subsections.find((s) => s.title.toLowerCase() === title.toLowerCase());
    return sub ? sub.content.trim() : "";
  }

  /* ------------------------------------------------------------------ */
  /*  Metadata parsing                                                    */
  /* ------------------------------------------------------------------ */

  private parseMetadata(raw: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = raw.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trimEnd();

      // Skip empty lines
      if (!line) {
        i++;
        continue;
      }

      // Must start with "- "
      const bulletMatch = line.match(/^-\s+(.+)$/);
      if (!bulletMatch) {
        i++;
        continue;
      }

      const bullet = bulletMatch[1].trim();
      const colonIndex = bullet.indexOf(":");

      if (colonIndex === -1) {
        // Plain bullet value — skip
        i++;
        continue;
      }

      const key = bullet.slice(0, colonIndex).trim();
      let valuePart = bullet.slice(colonIndex + 1).trim();

      // Check if value is empty, meaning a nested list follows
      if (!valuePart) {
        const listItems: string[] = [];
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trimEnd();
          const nestedMatch = nextLine.match(/^\s+-\s+(.+)$/);
          if (!nestedMatch) break;
          listItems.push(nestedMatch[1].trim());
          i++;
        }
        result[key] = listItems;
        continue;
      }

      // Value is inline
      result[key] = this.parseInlineValue(valuePart);
      i++;
    }

    return result;
  }

  private parseInlineValue(value: string): unknown {
    // Array syntax: ["a", "b", "c"]
    if (value.startsWith("[") && value.endsWith("]")) {
      return this.parseArrayValue(value);
    }

    // Boolean
    if (value === "true") return true;
    if (value === "false") return false;

    // Number
    const num = Number(value);
    if (!isNaN(num) && value !== "") return num;

    // String — remove surrounding quotes if present
    return value.replace(/^["']|["']$/g, "").trim();
  }

  private parseArrayValue(raw: string): string[] {
    // Remove brackets
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];

    const items: string[] = [];
    let current = "";
    let inQuote = false;

    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (ch === '"' || ch === "'") {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        items.push(current.replace(/^["']|["']$/g, "").trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current) {
      items.push(current.replace(/^["']|["']$/g, "").trim());
    }

    return items;
  }

  /* ------------------------------------------------------------------ */
  /*  Bullet list parsing                                                  */
  /* ------------------------------------------------------------------ */

  private parseBulletList(raw: string): string[] {
    if (!raw) return [];
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("-"))
      .map((l) => l.slice(1).trim());
  }

  /* ------------------------------------------------------------------ */
  /*  Code block parsing                                                    */
  /* ------------------------------------------------------------------ */

  private parseCodeBlocks(raw: string): string[] {
    if (!raw) return [];
    const blocks: string[] = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(raw)) !== null) {
      // Include language tag if present
      const lang = match[1] ? `${match[1]}\n` : "";
      blocks.push(lang + match[2].trim());
    }
    return blocks;
  }

  /* ------------------------------------------------------------------ */
  /*  Question seeds                                                       */
  /* ------------------------------------------------------------------ */

  private parseQuestionSeeds(raw: string): QuestionSeed[] {
    if (!raw) return [];
    const seeds: QuestionSeed[] = [];

    // Prepend a sentinel newline so the first seed entry (which may start at
    // position 0 with no leading \n) is captured by the regex.
    const normalized = "\n" + raw;
    const seedBlocks = normalized.split(/\n\*\*(seed-[\w-]+)\*\*:\s*\n/);
    // Result: ['' (before 1st match), seedId-1, body-1, seedId-2, body-2, ...]
    for (let i = 1; i < seedBlocks.length - 1; i += 2) {
      const seedId = seedBlocks[i].trim();
      const body = seedBlocks[i + 1].trim();
      const parsed = this.parseSeedBlock(body);
      if (parsed) {
        seeds.push({
          seedId,
          type: parsed.type as QuestionSeed["type"],
          difficulty: parsed.difficulty as number,
          stem: parsed.stem as string,
          options: parsed.options as string[],
          correctIndex: parsed.correctIndex as number,
          explanation: parsed.explanation as string,
        });
      }
    }

    return seeds;
  }

  private parseSeedBlock(body: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("- ")) continue;

      const bullet = trimmed.slice(2).trim();
      const colonIndex = bullet.indexOf(":");
      if (colonIndex === -1) continue;

      const key = bullet.slice(0, colonIndex).trim();
      let value = bullet.slice(colonIndex + 1).trim();

      // Handle array values
      if (value.startsWith("[") && value.endsWith("]")) {
        result[key] = this.parseArrayValue(value);
      } else {
        const coerced = this.parseInlineValue(value);
        result[key] = coerced;
      }
    }
    return result;
  }

  /* ------------------------------------------------------------------ */
  /*  Practical challenges                                                  */
  /* ------------------------------------------------------------------ */

  private parsePracticalChallenges(raw: string): PracticalChallenge[] {
    if (!raw) return [];

    const challenges: PracticalChallenge[] = [];
    const normalized = "\n" + raw;
    const blocks = normalized.split(/\n\*\*(challenge-[\w-]+)\*\*:\s*\n/);

    for (let i = 1; i < blocks.length - 1; i += 2) {
      const challengeId = blocks[i].trim();
      const body = blocks[i + 1].trim();
      const parsed = this.parseSeedBlock(body);
      if (parsed) {
        challenges.push({
          challengeId,
          type: (parsed.type as string) || "",
          difficulty: (parsed.difficulty as number) || 1,
          prompt: (parsed.prompt as string) || "",
          solution: (parsed.solution as string) || "",
        });
      }
    }

    return challenges;
  }

  /* ------------------------------------------------------------------ */
  /*  Interview prompts                                                     */
  /* ------------------------------------------------------------------ */

  private parseInterviewPrompts(raw: string): InterviewPrompt[] {
    if (!raw) return [];

    const prompts: InterviewPrompt[] = [];
    const normalized = "\n" + raw;
    const blocks = normalized.split(/\n\*\*(interview-[\w-]+)\*\*:\s*\n/);

    for (let i = 1; i < blocks.length - 1; i += 2) {
      const promptId = blocks[i].trim();
      const body = blocks[i + 1].trim();
      const parsed = this.parseSeedBlock(body);
      if (parsed) {
        prompts.push({
          promptId,
          prompt: (parsed.prompt as string) || "",
          evaluationCriteria: (parsed.evaluationCriteria as string[]) || [],
        });
      }
    }

    return prompts;
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                              */
  /* ------------------------------------------------------------------ */

  private resolveLevel(raw: unknown): SubjectLevel {
    if (typeof raw === "string") {
      const lower = raw.toLowerCase() as SubjectLevel;
      if (ConceptParser.VALID_LEVELS.includes(lower)) return lower;
    }
    return "foundation";
  }

  private resolveDifficulty(raw: unknown): number {
    if (typeof raw === "number") return Math.max(1, Math.min(5, Math.round(raw)));
    if (typeof raw === "string") {
      const n = parseInt(raw, 10);
      if (!isNaN(n)) return Math.max(1, Math.min(5, n));
    }
    return 1;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}
