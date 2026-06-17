/**
 * Represents a single parse error or warning with position information.
 *
 * Position tracking is best-effort — some parsers may not know the exact
 * line when reconstructing content from regex matches without the original
 * line map. Where possible, `line` and `column` are populated.
 */
export interface ParseError {
  /** Human-readable error message. */
  message: string;
  /** Severity level. */
  severity: "error" | "warning";
  /** 1-based line number in the source file, if known. */
  line?: number;
  /** 1-based column number, if known. */
  column?: number;
  /** The source section where the error occurred (e.g. "frontmatter", "Domain: JavaScript"). */
  section?: string;
  /** The concept or element being parsed when the error occurred. */
  context?: string;
  /** Error code for programmatic handling. */
  code?: string;
  /** The original raw text fragment that caused the error, truncated to 200 chars. */
  rawFragment?: string;
}

/**
 * Result from a parse operation that may contain multiple errors.
 */
export interface ParseResult<T> {
  /** The parsed value, which may be partial when errors exist. */
  value: T;
  /** Errors that prevented correct parsing. */
  errors: ParseError[];
  /** Warnings about recoverable issues. */
  warnings: ParseError[];
}

/**
 * Thrown when a parse operation has fatal errors that prevent any
 * meaningful result from being produced.
 */
export class ParseFailure extends Error {
  public readonly errors: ParseError[];

  constructor(message: string, errors: ParseError[]) {
    super(message);
    this.name = "ParseFailure";
    this.errors = errors;
  }
}

/**
 * Utility to count lines in a text up to a given position.
 */
export function lineNumberAt(text: string, charIndex: number): number {
  if (charIndex <= 0) return 1;
  let line = 1;
  for (let i = 0; i < charIndex && i < text.length; i++) {
    if (text[i] === "\n") line++;
  }
  return line;
}

/**
 * Extract a line from text by its 1-based line number.
 */
export function getLine(text: string, lineNumber: number): string {
  const lines = text.split("\n");
  if (lineNumber < 1 || lineNumber > lines.length) return "";
  return lines[lineNumber - 1];
}
