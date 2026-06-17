export interface FrontmatterData {
  [key: string]: string | number | boolean;
}

export class SubjectFrontmatterParser {
  /**
   * Extracts the YAML frontmatter block (between --- delimiters) from raw
   * markdown content and parses it into a flat key-value map.
   *
   * Supports:
   *   - Simple key: value pairs
   *   - Quoted string values
   *   - Numeric and boolean coercion
   */
  parse(content: string): FrontmatterData {
    const trimmed = content.trimStart();

    // Must start with ---
    if (!trimmed.startsWith("---")) {
      return {};
    }

    const endIndex = trimmed.indexOf("---", 3);
    if (endIndex === -1) {
      return {};
    }

    const raw = trimmed.slice(3, endIndex).trim();
    const data: FrontmatterData = {};

    for (const line of raw.split("\n")) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const colonIndex = trimmedLine.indexOf(":");
      if (colonIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, colonIndex).trim();
      let value: string = trimmedLine.slice(colonIndex + 1).trim();

      if (!key) {
        continue;
      }

      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      data[key] = this.coerceValue(value);
    }

    return data;
  }

  /**
   * Returns the body content after the frontmatter block (everything after
   * the closing ---).
   */
  extractBody(content: string): string {
    const trimmed = content.trimStart();

    if (!trimmed.startsWith("---")) {
      return trimmed;
    }

    const endIndex = trimmed.indexOf("---", 3);
    if (endIndex === -1) {
      return trimmed;
    }

    return trimmed.slice(endIndex + 3).trimStart();
  }

  private coerceValue(value: string): string | number | boolean {
    if (value === "true") return true;
    if (value === "false") return false;

    const num = Number(value);
    if (!isNaN(num) && value.trim() !== "") {
      return num;
    }

    return value;
  }
}
