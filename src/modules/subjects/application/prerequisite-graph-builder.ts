import { Concept } from "@/modules/subjects/domain/subject";

/**
 * Adjacency structure for the prerequisite graph derived from a set of
 * Concept objects.
 */
export interface PrerequisiteGraph {
  /**
   * Returns the concept IDs that must be mastered before `conceptId` can be
   * attempted.
   */
  getPrerequisites(conceptId: string): string[];

  /**
   * Returns the concept IDs that directly depend on `conceptId`.
   */
  getDependents(conceptId: string): string[];

  /**
   * Given a set of already-mastered concept IDs, returns the concept IDs that
   * are now available (all prerequisites satisfied).
   */
  getAvailableConcepts(masteredIds: Set<string>): string[];

  /** All concept IDs in the graph. */
  getAllConceptIds(): string[];
}

/**
 * Builds a directed graph from Concept.prerequisites fields and returns an
 * interface for querying it.
 */
export class PrerequisiteGraphBuilder {
  build(concepts: Concept[]): PrerequisiteGraph {
    const adjacency: Map<string, string[]> = new Map();
    const reverse: Map<string, string[]> = new Map();
    const allIds: string[] = [];

    for (const concept of concepts) {
      adjacency.set(concept.id, [...concept.prerequisites]);
      allIds.push(concept.id);

      // Build reverse map: for each prereq, add this concept as dependent
      for (const prereq of concept.prerequisites) {
        const deps = reverse.get(prereq) || [];
        deps.push(concept.id);
        reverse.set(prereq, deps);
      }

      // Ensure every concept has an entry in reverse even with no dependents
      if (!reverse.has(concept.id)) {
        reverse.set(concept.id, []);
      }
    }

    return {
      getPrerequisites(conceptId: string): string[] {
        return adjacency.get(conceptId) ?? [];
      },

      getDependents(conceptId: string): string[] {
        return reverse.get(conceptId) ?? [];
      },

      getAvailableConcepts(masteredIds: Set<string>): string[] {
        return allIds.filter((id) => {
          if (masteredIds.has(id)) return false;
          const prereqs = adjacency.get(id) ?? [];
          return prereqs.every((p) => masteredIds.has(p));
        });
      },

      getAllConceptIds(): string[] {
        return [...allIds];
      },
    };
  }
}
