import { describe, it, expect } from "vitest";
import { SubjectVersionMigrationService } from "./subject-version-migration-service";
import { lineNumberAt, getLine } from "@/modules/subjects/domain/parse-error";

describe("SubjectVersionMigrationService", () => {
  const service = new SubjectVersionMigrationService();

  it("returns current schema version from registered migrations", () => {
    expect(service.getCurrentSchemaVersion()).toBeGreaterThanOrEqual(2);
  });

  it("returns identity when from === to", () => {
    const data = { id: "test", schemaVersion: 2, domains: [] };
    const result = service.migrate(data, 2, 2);
    expect(result).toEqual(data);
  });

  it("migrates from version 1 to version 2", () => {
    const data = {
      id: "test",
      version: 1,
      schemaVersion: 1,
      domains: [
        {
          name: "Foundations",
          concepts: [{ id: "js.basics", name: "JS Basics" }],
        },
      ],
    };
    const result = service.migrate(data, 1, 2);
    expect(result.schemaVersion).toBe(2);
    expect(result.minimumGameVersion).toBe("1.0.0");
    const concept = (result.domains as any[])[0].concepts[0];
    expect(concept.tags).toEqual([]);
    expect(concept.commonMisconceptions).toEqual([]);
    expect(concept.examples).toEqual([]);
  });

  it("throws for downgrade migration", () => {
    const data = { id: "test", schemaVersion: 2 };
    expect(() => service.migrate(data, 2, 1)).toThrow(/cannot migrate down/i);
  });

  it("throws when no migration path exists", () => {
    const data = { id: "test", schemaVersion: 1 };
    expect(() => service.migrate(data, 1, 99)).toThrow(/missing migration/i);
  });

  it("canMigrate returns true for identity", () => {
    expect(service.canMigrate(1, 1)).toBe(true);
  });

  it("canMigrate returns false for downgrade", () => {
    expect(service.canMigrate(2, 1)).toBe(false);
  });

  it("canMigrate returns true for valid upgrade path", () => {
    expect(service.canMigrate(1, 2)).toBe(true);
  });

  it("canMigrate returns false for unknown target", () => {
    expect(service.canMigrate(1, 99)).toBe(false);
  });

  it("migrateSubject upgrades a full Subject object", () => {
    const subject = {
      id: "test",
      title: "Test",
      description: "",
      version: 1,
      schemaVersion: 1,
      minimumGameVersion: "1.0.0",
      domains: [],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };
    const result = service.migrateSubject(subject, 2);
    expect(result.schemaVersion).toBe(2);
  });

  it("migrateSubject returns the same object if already at target", () => {
    const subject = {
      id: "test",
      title: "Test",
      description: "",
      version: 1,
      schemaVersion: 2,
      minimumGameVersion: "1.0.0",
      domains: [],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };
    const result = service.migrateSubject(subject, 2);
    expect(result.schemaVersion).toBe(2);
  });
});

describe("parse error utilities", () => {
  describe("lineNumberAt", () => {
    it("returns 1 for position 0", () => {
      expect(lineNumberAt("hello", 0)).toBe(1);
    });

    it("counts lines correctly", () => {
      const text = "line1\nline2\nline3";
      expect(lineNumberAt(text, 0)).toBe(1); // 'l' of line1
      expect(lineNumberAt(text, 6)).toBe(2); // start of line2 (after \n)
      expect(lineNumberAt(text, 12)).toBe(3); // start of line3
    });

    it("handles empty text", () => {
      expect(lineNumberAt("", 0)).toBe(1);
    });
  });

  describe("getLine", () => {
    it("returns the nth line from text", () => {
      const text = "alpha\nbeta\ngamma";
      expect(getLine(text, 1)).toBe("alpha");
      expect(getLine(text, 2)).toBe("beta");
      expect(getLine(text, 3)).toBe("gamma");
    });

    it("returns empty string for out-of-bounds line", () => {
      expect(getLine("hello", 5)).toBe("");
    });
  });
});
