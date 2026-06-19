import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const ROOT = resolve(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(resolve(ROOT, path), "utf8");
}

/** Extract `node-version` value from a GitHub Actions workflow YAML. */
function extractNodeVersionFromWorkflow(yaml: string): string | null {
  const match = yaml.match(/node-version:\s*["']?(\d+)["']?/);
  return match ? match[1] : null;
}

/** Check YAML for deprecated Node-20 actions (v4 checkout/setup-node). */
function hasDeprecatedNode20Actions(yaml: string): boolean {
  // v4 of these actions target Node 20 on the runner:
  const deprecatedPatterns = [/actions\/checkout@v4/, /actions\/setup-node@v4/];
  return deprecatedPatterns.some((re) => re.test(yaml));
}

/** Extract all `FROM node:XX-*` lines from a Dockerfile. */
function extractNodeImages(dockerfile: string): string[] {
  const lines: string[] = [];
  for (const line of dockerfile.split("\n")) {
    const m = line.match(/^FROM\s+node:(\d+)/);
    if (m) lines.push(m[1]);
  }
  return lines;
}

/** Minimum major Node version required. */
const MIN_NODE_MAJOR = 22;

/* ------------------------------------------------------------------ */
/*  Tests — CI configuration                                           */
/* ------------------------------------------------------------------ */

describe("GitHub Actions CI", () => {
  const ciYaml = read(".github/workflows/ci.yml");

  it("should use Node.js 22+ (not deprecated 20)", () => {
    const version = extractNodeVersionFromWorkflow(ciYaml);
    expect(version, "node-version not found in ci.yml").not.toBeNull();
    expect(Number(version)).toBeGreaterThanOrEqual(MIN_NODE_MAJOR);
  });

  it("should not use actions targeting Node 20 (checkout@v4, setup-node@v4)", () => {
    expect(hasDeprecatedNode20Actions(ciYaml)).toBe(false);
  });

  it("should exist at .github/workflows/ci.yml", () => {
    expect(existsSync(resolve(ROOT, ".github/workflows/ci.yml"))).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Tests — Dockerfile                                                 */
/* ------------------------------------------------------------------ */

describe("Dockerfile", () => {
  const dockerfile = read("Dockerfile");

  it("should use Node.js 22+ (not deprecated 20) in all FROM stages", () => {
    const versions = extractNodeImages(dockerfile);
    expect(versions.length).toBeGreaterThanOrEqual(2);
    for (const v of versions) {
      expect(Number(v)).toBeGreaterThanOrEqual(MIN_NODE_MAJOR);
    }
  });

  it("should exist at Dockerfile", () => {
    expect(existsSync(resolve(ROOT, "Dockerfile"))).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  Tests — package.json                                               */
/* ------------------------------------------------------------------ */

describe("package.json", () => {
  const pkg = JSON.parse(read("package.json"));

  it('should declare "engines.node" >= 22', () => {
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toBeDefined();
    const match = String(pkg.engines.node).match(/(\d+)/);
    expect(match, `engines.node "${pkg.engines.node}" has no version number`).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(MIN_NODE_MAJOR);
  });

  it("should use @types/node ^22 (not ^20)", () => {
    const dep = pkg.devDependencies?.["@types/node"];
    expect(dep).toBeDefined();
    expect(String(dep)).toMatch(/22/);
    expect(String(dep)).not.toMatch(/20/);
  });
});

/* ------------------------------------------------------------------ */
/*  Tests — .nvmrc                                                     */
/* ------------------------------------------------------------------ */

describe(".nvmrc", () => {
  it("should exist", () => {
    expect(existsSync(resolve(ROOT, ".nvmrc"))).toBe(true);
  });

  it("should specify Node.js 22", () => {
    const content = read(".nvmrc").trim();
    const num = Number(content);
    expect(num).toBeGreaterThanOrEqual(MIN_NODE_MAJOR);
  });
});

/* ------------------------------------------------------------------ */
/*  Tests — runtime Node version                                       */
/* ------------------------------------------------------------------ */

describe("Runtime Node.js version", () => {
  it("should be 22+", () => {
    const major = Number(process.version.slice(1).split(".")[0]);
    expect(major).toBeGreaterThanOrEqual(MIN_NODE_MAJOR);
  });
});
