import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = resolve(__dirname, "../../");
const DEPCRUISE_CONFIG = resolve(PROJECT_ROOT, ".dependency-cruiser.cjs");

interface DependencyCruiserViolation {
  from: string;
  to: string;
  rule: {
    name: string;
    severity: "error" | "warn" | "info" | string;
  };
}

interface DependencyCruiserReport {
  summary?: {
    error?: number;
    warn?: number;
    totalCruised?: number;
  };
  violations?: DependencyCruiserViolation[];
}

describe("Module architecture boundaries", () => {
  it("must not have dependency violations with severity error", () => {
    const result = spawnSync(
      "npx",
      ["depcruise", "--config", DEPCRUISE_CONFIG, "src", "--output-type", "json"],
      {
        cwd: PROJECT_ROOT,
        timeout: 45000,
        encoding: "utf-8",
      },
    );

    if (result.error) {
      throw result.error;
    }

    const combinedOutput = [result.stdout, result.stderr].filter(Boolean).join("\n");
    let report: DependencyCruiserReport;
    try {
      report = JSON.parse(result.stdout) as DependencyCruiserReport;
    } catch (parseError) {
      throw new Error(
        [
          "dependency-cruiser did not return valid JSON.",
          `Exit status: ${result.status}`,
          `Parse error: ${(parseError as Error).message}`,
          combinedOutput,
        ].join("\n"),
      );
    }

    const errorViolations = (report.violations ?? []).filter(
      (violation) => violation.rule.severity === "error",
    );

    expect(
      errorViolations.map(
        (violation) => `${violation.rule.name}: ${violation.from} -> ${violation.to}`,
      ),
    ).toEqual([]);
    expect(report.summary?.error ?? 0).toBe(0);

    if (result.status !== 0 && errorViolations.length === 0) {
      throw new Error(
        [
          "dependency-cruiser exited non-zero without error-severity violations.",
          `Exit status: ${result.status}`,
          combinedOutput,
        ].join("\n"),
      );
    }
  });
});
