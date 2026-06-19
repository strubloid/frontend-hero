/**
 * Button Audit Test
 *
 * Static analysis that scans presentation-layer TSX files to ensure all
 * interactive elements (buttons and links) are wired up with proper
 * handlers or hrefs.
 *
 * Runs in the node environment (no jsdom required). Uses only built-in
 * Node modules — no glob dependency needed.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, statSync, readdirSync, existsSync } from "fs";
import path from "path";

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, "..");

/** Directories to scan for button/link analysis. */
const SCAN_DIRS = ["src/modules/command-centre/presentation/components", "src/app"];

/** Files under src/app/ that are just wrappers / server components — skip. */
const WRAPPER_FILES = new Set(["page.tsx", "layout.tsx"]);

/**
 * Recursively find all .tsx files under a directory.
 */
function findTsxFiles(dir: string, baseDir: string): { filePath: string; relativePath: string }[] {
  const results: { filePath: string; relativePath: string }[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTsxFiles(fullPath, baseDir));
    } else if (entry.name.endsWith(".tsx") && statSync(fullPath).isFile()) {
      const basename = path.basename(entry.name);
      if (WRAPPER_FILES.has(basename)) continue;
      if (basename.startsWith("layout.")) continue;
      results.push({
        filePath: fullPath,
        relativePath: path.relative(baseDir, fullPath),
      });
    }
  }
  return results;
}

/** Get 1-indexed line number for a character position. */
function getLineNumber(lines: string[], pos: number): number {
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1; // +1 for newline
    if (count > pos) return i + 1;
  }
  return lines.length;
}

/**
 * Check if a character position is inside a string literal (single/double/template quotes).
 */
function insideString(content: string, start: number, pos: number): boolean {
  const before = content.slice(start, pos);
  let inStr = false;
  let strChar = "";
  for (const ch of before) {
    if (inStr) {
      if (ch === strChar) inStr = false;
    } else if (ch === '"' || ch === "'") {
      inStr = true;
      strChar = ch;
    }
  }
  return inStr;
}

/**
 * Check if content contains an onClick, formAction, or type="submit" attribute.
 */
function hasClickHandler(tagContent: string): boolean {
  return (
    /\bonClick\s*=\s*\{/.test(tagContent) ||
    /\bformAction\s*=\s*\{/.test(tagContent) ||
    /\btype\s*=\s*["']submit["']/.test(tagContent)
  );
}

/**
 * Check if tag content is inside a `<form>` context by scanning backward.
 */
function findFormContext(content: string, buttonPos: number): boolean {
  const before = content.slice(0, buttonPos);
  const lastFormOpen = before.lastIndexOf("<form");
  const lastFormClose = before.lastIndexOf("</form>");
  return lastFormOpen > lastFormClose;
}

/**
 * Find all `<button` elements in content, returning their line numbers and snippets.
 */
function findButtons(content: string, filePath: string): { line: number; snippet: string }[] {
  const result: { line: number; snippet: string }[] = [];
  const lines = content.split("\n");
  let searchFrom = 0;

  while (true) {
    const idx = content.indexOf("<button", searchFrom);
    if (idx === -1) break;

    // Check it's JSX, not a comment or string
    if (insideString(content, Math.max(0, idx - 200), idx)) {
      searchFrom = idx + 1;
      continue;
    }

    // Find closing tag
    const closeTag = `</button>`;
    const closeIdx = content.indexOf(closeTag, idx);
    if (closeIdx === -1) {
      searchFrom = idx + 1;
      continue;
    }

    const tagContent = content.slice(idx, closeIdx + closeTag.length);
    const lineNum = getLineNumber(lines, idx);
    result.push({ line: lineNum, snippet: tagContent });
    searchFrom = closeIdx + closeTag.length;
  }

  return result;
}

/**
 * Find all `<Link` elements missing an href attribute.
 */
function findOrphanLinks(content: string): { line: number; snippet: string }[] {
  const result: { line: number; snippet: string }[] = [];
  const lines = content.split("\n");
  let searchFrom = 0;

  while (true) {
    const idx = content.indexOf("<Link", searchFrom);
    if (idx === -1) break;

    // Check it's JSX
    if (insideString(content, Math.max(0, idx - 200), idx)) {
      searchFrom = idx + 1;
      continue;
    }

    // Extract the opening tag
    const gtIdx = content.indexOf(">", idx);
    if (gtIdx === -1) {
      searchFrom = idx + 1;
      continue;
    }

    const openTag = content.slice(idx, gtIdx + 1);

    // Check if it's self-closing: <Link /> — if so, no children, must have href
    const isSelfClosing = openTag.endsWith("/>");

    // Check for href attribute
    const hasHref = /\bhref\s*=\s*[\{"'\/]/.test(openTag);

    if (!hasHref && !isSelfClosing) {
      // Non-self-closing <Link> without href — e.g. <Link href={...}>children</Link>
      // This could be legitimate if we're wrapping. Check the full open tag for href
      // Only flag if it's truly inside JSX (not a string)
      const checkHref = /\bhref\s*=/.test(openTag);
      if (!checkHref) {
        const lineNum = getLineNumber(lines, idx);
        const snippet = openTag.replace(/\n/g, " ").slice(0, 100);
        result.push({ line: lineNum, snippet });
      }
    } else if (!hasHref && isSelfClosing) {
      // Self-closing <Link /> without href — definitely broken
      const lineNum = getLineNumber(lines, idx);
      result.push({ line: lineNum, snippet: openTag.replace(/\n/g, " ").slice(0, 100) });
    }

    searchFrom = gtIdx + 1;
  }

  return result;
}

/**
 * Find `<Link>` wrapped components (no props at all).
 */
function findBareLinkWraps(content: string): { line: number; snippet: string }[] {
  const result: { line: number; snippet: string }[] = [];
  const lines = content.split("\n");
  const regex = /<Link>([\s\S]*?)<\/Link>/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Check we're not inside a string
    if (insideString(content, Math.max(0, match.index - 200), match.index)) continue;

    // Find the actual <Link tag that precedes this content
    const tagStart = content.lastIndexOf("<Link", match.index);
    const openTag = content.slice(tagStart, content.indexOf(">", tagStart) + 1);

    if (!/\bhref\s*=/.test(openTag)) {
      const lineNum = getLineNumber(lines, match.index);
      result.push({ line: lineNum, snippet: openTag.replace(/\n/g, " ").slice(0, 100) });
    }
  }

  return result;
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe("button audit — all buttons must be interactive", () => {
  const files: { filePath: string; relativePath: string }[] = [];

  for (const dir of SCAN_DIRS) {
    const absDir = path.join(PROJECT_ROOT, dir);
    if (!existsSync(absDir)) continue;
    files.push(...findTsxFiles(absDir, PROJECT_ROOT));
  }

  it("found presentation files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  // Group by directory for organised test output
  const byDir = new Map<string, typeof files>();
  for (const f of files) {
    const dir = path.dirname(f.relativePath);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir)!.push(f);
  }

  for (const [dir, dirFiles] of byDir) {
    describe(`in ${dir}/`, () => {
      for (const f of dirFiles) {
        it(`${path.basename(f.filePath)} has no orphan buttons`, () => {
          const content = readFileSync(f.filePath, "utf-8");
          const buttons = findButtons(content, f.filePath);

          const orphans: { line: number; snippet: string }[] = [];

          for (const btn of buttons) {
            const needsHandler =
              // Not disabled (disabled buttons don't need onClick)
              !/\bdisabled\b/.test(btn.snippet.slice(0, 80)) &&
              // Has no onClick
              !hasClickHandler(btn.snippet) &&
              // Not inside a <form> (form submit buttons)
              !findFormContext(content, btn.snippet ? content.indexOf(btn.snippet) : 0);

            if (needsHandler) {
              orphans.push({
                line: btn.line,
                snippet: btn.snippet.slice(0, 80).replace(/\n/g, " "),
              });
            }
          }

          if (orphans.length > 0) {
            const msg = orphans.map((o) => `  line ${o.line}: ${o.snippet}`).join("\n");
            expect.fail(`Found ${orphans.length} button(s) without click handler:\n${msg}`);
          }
        });
      }
    });
  }
});

describe("button audit — Link hrefs must be present", () => {
  const files: { filePath: string; relativePath: string }[] = [];

  for (const dir of SCAN_DIRS) {
    const absDir = path.join(PROJECT_ROOT, dir);
    if (!existsSync(absDir)) continue;
    files.push(...findTsxFiles(absDir, PROJECT_ROOT));
  }

  it("found files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  const byDir = new Map<string, typeof files>();
  for (const f of files) {
    const dir = path.dirname(f.relativePath);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir)!.push(f);
  }

  for (const [dir, dirFiles] of byDir) {
    describe(`links in ${dir}/`, () => {
      for (const f of dirFiles) {
        it(`${path.basename(f.filePath)} has no href-less Links`, () => {
          const content = readFileSync(f.filePath, "utf-8");

          // Check for <Link> without href in opening tag
          const orphanLinks = findOrphanLinks(content);
          // Check for bare <Link>wrapping</Link> without href
          const bareWraps = findBareLinkWraps(content);

          const allIssues = [...orphanLinks, ...bareWraps];

          if (allIssues.length > 0) {
            const msg = allIssues.map((o) => `  line ${o.line}: ${o.snippet}`).join("\n");
            expect.fail(
              `Found ${allIssues.length} <Link> component(s) without href attribute:\n${msg}`,
            );
          }
        });
      }
    });
  }
});
