#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", ".next", "node_modules", "coverage"]);
const sourceDirs = ["src", "docs", ".github", "scripts"];
const fileExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
]);

const findings = [];

function ext(path) {
  const idx = path.lastIndexOf(".");
  return idx >= 0 ? path.slice(idx) : "";
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignored.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    if (!fileExtensions.has(ext(full))) continue;
    inspectFile(full);
  }
}

function add(file, line, severity, message) {
  findings.push({ file: relative(root, file), line, severity, message });
}

function inspectFile(file) {
  const rel = relative(root, file);
  if (
    rel === "scripts/production-audit.mjs" ||
    rel.startsWith("scripts/") ||
    rel.includes("/__tests__/") ||
    rel.endsWith(".test.ts") ||
    rel.endsWith(".test.tsx")
  ) {
    return;
  }

  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    const n = index + 1;

    if (/NEXT_PUBLIC_.*(?:SECRET|TOKEN|KEY|PASSWORD)/i.test(line)) {
      add(file, n, "error", "Potential secret exposed through NEXT_PUBLIC_* variable");
    }

    if (/(api[_-]?key|secret|token|password)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}/i.test(line)) {
      add(file, n, "error", "Potential hardcoded credential-like value");
    }

    if (/console\.log\(/.test(line) && !file.endsWith("production-audit.mjs")) {
      add(
        file,
        n,
        "warn",
        "console.log found; prefer structured logging or remove before production",
      );
    }

    if (/<img\b(?![^>]*\balt=)/i.test(line)) {
      add(file, n, "warn", "img tag without alt text");
    }

    if (/<button[^>]*>\s*[×✕✖←→]?\s*<\/button>/i.test(line) && !/aria-label=/i.test(line)) {
      add(file, n, "warn", "icon-only button without aria-label");
    }
  });
}

for (const dir of sourceDirs) {
  const full = join(root, dir);
  try {
    if (statSync(full).isDirectory()) walk(full);
  } catch {
    // Directory is optional.
  }
}

const errors = findings.filter((f) => f.severity === "error");
const warnings = findings.filter((f) => f.severity === "warn");

if (findings.length > 0) {
  for (const finding of findings) {
    console.log(
      `${finding.severity.toUpperCase()} ${finding.file}:${finding.line} ${finding.message}`,
    );
  }
}

console.log(`Production audit complete: ${errors.length} error(s), ${warnings.length} warning(s).`);

if (errors.length > 0) {
  process.exit(1);
}
