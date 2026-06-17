import { Subject } from "@/modules/subjects/domain/subject";

/**
 * Registry entry for a single schema version migration.
 */
export interface MigrationStep {
  /** Source schema version this migration applies to. */
  from: number;
  /** Target schema version after applying this migration. */
  to: number;
  /** Migration function that transforms a Subject in place. */
  migrate: (subject: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Service that applies sequential schema version upgrades to subject data.
 *
 * Subject files declare a `schemaVersion` in their frontmatter.
 * When the game engine expects a newer schemaVersion, this service
 * applies each intervening migration step to bring the subject data
 * up to the current version.
 */
export class SubjectVersionMigrationService {
  private migrations: MigrationStep[] = [];

  constructor() {
    // Register built-in migrations in order
    this.register({
      from: 1,
      to: 2,
      migrate: (raw) => {
        // v1 → v2: Add `minimumGameVersion` default, ensure tags array
        if (!raw.minimumGameVersion) {
          raw.minimumGameVersion = "1.0.0";
        }
        // Ensure every concept has a tags field
        const domains = raw.domains as Record<string, unknown>[] | undefined;
        if (domains) {
          for (const domain of domains) {
            const concepts = domain.concepts as Record<string, unknown>[] | undefined;
            if (concepts) {
              for (const concept of concepts) {
                if (!concept.tags) {
                  concept.tags = [];
                }
                if (!concept.commonMisconceptions) {
                  concept.commonMisconceptions = [];
                }
                if (!concept.examples) {
                  concept.examples = [];
                }
              }
            }
          }
        }
        return raw;
      },
    });
  }

  /**
   * Register a new migration step. Migrations are sorted by `from` version
   * and applied sequentially.
   */
  register(step: MigrationStep): void {
    this.migrations.push(step);
    this.migrations.sort((a, b) => a.from - b.from);
  }

  /**
   * Migrate raw parsed subject data to the target schemaVersion.
   *
   * @param rawData     The raw parsed subject record (e.g. from frontmatter + sections).
   * @param fromVersion The current schemaVersion of the data.
   * @param toVersion   The desired schemaVersion.
   * @returns The migrated data record.
   * @throws Error if no migration path exists between fromVersion and toVersion.
   */
  migrate(
    rawData: Record<string, unknown>,
    fromVersion: number,
    toVersion: number,
  ): Record<string, unknown> {
    if (fromVersion === toVersion) {
      return { ...rawData };
    }

    if (fromVersion > toVersion) {
      throw new Error(
        `Cannot migrate down: current schemaVersion ${fromVersion} > target ${toVersion}. ` +
          "Downgrade migrations are not supported.",
      );
    }

    let current = { ...rawData };
    let currentVersion = fromVersion;

    // Find and apply migrations in order
    const sorted = [...this.migrations].sort((a, b) => a.from - b.from);

    for (const step of sorted) {
      if (step.from < currentVersion) {
        continue; // Already past this version
      }
      if (step.from > currentVersion) {
        throw new Error(
          `Missing migration from schemaVersion ${currentVersion} to ${step.from}. ` +
            `No migration registered for version ${currentVersion}.`,
        );
      }
      current = step.migrate(current);
      current.schemaVersion = step.to;
      currentVersion = step.to;
    }

    if (currentVersion !== toVersion) {
      throw new Error(
        `Migration chain ended at schemaVersion ${currentVersion}, but target was ${toVersion}. ` +
          `Missing migration(s) from ${currentVersion} to ${toVersion}.`,
      );
    }

    return current;
  }

  /**
   * Migrate a fully-constructed Subject domain object.
   * Useful for on-disk cache upgrades.
   */
  migrateSubject(subject: Subject, targetSchemaVersion: number): Subject {
    if (subject.schemaVersion >= targetSchemaVersion) {
      return subject;
    }

    const raw = this.subjectToRecord(subject);
    const migrated = this.migrate(raw, subject.schemaVersion, targetSchemaVersion);

    return this.recordToSubject(migrated, subject.id);
  }

  /** Get the highest known schema version. */
  getCurrentSchemaVersion(): number {
    if (this.migrations.length === 0) return 1;
    return Math.max(...this.migrations.map((m) => m.to));
  }

  /**
   * Check whether a migration path exists between two versions.
   */
  canMigrate(from: number, to: number): boolean {
    if (from === to) return true;
    if (from > to) return false;

    const sorted = [...this.migrations].sort((a, b) => a.from - b.from);
    let currentVersion = from;

    for (const step of sorted) {
      if (step.from < currentVersion) continue;
      if (step.from > currentVersion) return false;
      currentVersion = step.to;
      if (currentVersion >= to) return true;
    }

    return currentVersion >= to;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private subjectToRecord(subject: Subject): Record<string, unknown> {
    return {
      id: subject.id,
      title: subject.title,
      description: subject.description,
      version: subject.version,
      schemaVersion: subject.schemaVersion,
      minimumGameVersion: subject.minimumGameVersion,
      domains: subject.domains.map((d) => ({
        name: d.name,
        concepts: d.concepts.map((c) => ({
          id: c.id,
          name: c.name,
          domainName: c.domainName,
          subjectId: c.subjectId,
          level: c.level,
          difficulty: c.difficulty,
          prerequisites: c.prerequisites,
          tags: c.tags,
          outcomes: c.outcomes,
          knowledge: c.knowledge,
          commonMisconceptions: c.commonMisconceptions,
          examples: c.examples,
          questionSeeds: c.questionSeeds,
          practicalChallenges: c.practicalChallenges,
          interviewPrompts: c.interviewPrompts,
        })),
      })),
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    };
  }

  private recordToSubject(raw: Record<string, unknown>, subjectId: string): Subject {
    const now = new Date();
    return {
      id: subjectId,
      title: (raw.title as string) ?? subjectId,
      description: (raw.description as string) ?? "",
      version: (raw.version as number) ?? 1,
      schemaVersion: (raw.schemaVersion as number) ?? 1,
      minimumGameVersion: (raw.minimumGameVersion as string) ?? "1.0.0",
      domains:
        (raw.domains as any[])?.map((d: any) => ({
          name: d.name,
          concepts: d.concepts?.map((c: any) => ({
            id: c.id,
            name: c.name,
            domainName: c.domainName,
            subjectId: c.subjectId,
            level: c.level ?? "foundation",
            difficulty: c.difficulty ?? 1,
            prerequisites: c.prerequisites ?? [],
            tags: c.tags ?? [],
            outcomes: c.outcomes ?? [],
            knowledge: c.knowledge ?? "",
            commonMisconceptions: c.commonMisconceptions ?? [],
            examples: c.examples ?? [],
            questionSeeds: c.questionSeeds ?? [],
            practicalChallenges: c.practicalChallenges ?? [],
            interviewPrompts: c.interviewPrompts ?? [],
          })),
        })) ?? [],
      createdAt: now,
      updatedAt: now,
    };
  }
}
