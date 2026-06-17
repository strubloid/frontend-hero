import { Concept } from "@/modules/subjects/domain/subject";

/**
 * Result of a cycle detection check.
 */
export interface CycleCheckResult {
  hasCycle: boolean;
  cycle: string[]; // The detected cycle, empty if no cycle
}

/**
 * Adjacency structure for the prerequisite graph derived from a set of
 * Concept objects.
 */
export interface PrerequisiteGraph {
  /** Returns the concept IDs that must be mastered before `conceptId`. */
  getPrerequisites(conceptId: string): string[];

  /** Returns the concept IDs that directly depend on `conceptId`. */
  getDependents(conceptId: string): string[];

  /**
   * Given a set of already-mastered concept IDs, returns the concept IDs that
   * are now available (all prerequisites satisfied).
   */
  getAvailableConcepts(masteredIds: Set<string>): string[];

  /** All concept IDs in the graph. */
  getAllConceptIds(): string[];

  /** Returns the topological ordering of all concepts, or null if cyclic. */
  getTopologicalOrder(): string[] | null;

  /** Returns the depth (longest path from root) of a concept in the graph. */
  getDepth(conceptId: string): number;
}

/**
 * Builds a directed graph from Concept.prerequisites fields and returns an
 * interface for querying it.
 *
 * The graph is guaranteed to be acyclic when build() returns — if cycles are
 * detected they are reported via the returned cycle info.
 */
export class PrerequisiteGraphBuilder {
  /**
   * Build the prerequisite graph from a list of concepts.
   *
   * @throws {Error} if a cycle is detected, with the cycle path in the message.
   */
  build(concepts: Concept[]): PrerequisiteGraph {
    const adjacency: Map<string, string[]> = new Map();
    const reverse: Map<string, string[]> = new Map();
    const allIds: string[] = [];

    for (const concept of concepts) {
      adjacency.set(concept.id, [...concept.prerequisites]);
      allIds.push(concept.id);

      for (const prereq of concept.prerequisites) {
        const deps = reverse.get(prereq) || [];
        deps.push(concept.id);
        reverse.set(prereq, deps);
      }

      if (!reverse.has(concept.id)) {
        reverse.set(concept.id, []);
      }
    }

    // Detect cycles using DFS with three-colour marking
    const cycle = this.detectCycle(allIds, adjacency);
    if (cycle.length > 0) {
      throw new Error(`Prerequisite cycle detected: ${cycle.join(" → ")}`);
    }

    // Precompute topological order (Kahn's algorithm) and depths
    const topoOrder = this.computeTopologicalOrder(allIds, adjacency, reverse);

    // Compute depth of each concept: longest path from any root
    const depths = new Map<string, number>();
    // Roots are concepts with no prerequisites
    for (const id of allIds) {
      if ((adjacency.get(id) ?? []).length === 0) {
        depths.set(id, 0);
      }
    }
    // Propagate depths in topological order
    for (const id of topoOrder) {
      const currentDepth = depths.get(id) ?? 0;
      for (const dep of reverse.get(id) ?? []) {
        const existing = depths.get(dep) ?? 0;
        depths.set(dep, Math.max(existing, currentDepth + 1));
      }
    }
    // Ensure every concept has at least depth 0
    for (const id of allIds) {
      if (!depths.has(id)) {
        depths.set(id, 0);
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

      getTopologicalOrder(): string[] | null {
        return [...topoOrder];
      },

      getDepth(conceptId: string): number {
        return depths.get(conceptId) ?? 0;
      },
    };
  }

  /**
   * Runs cycle detection on a directed graph. Returns the cycle path if found.
   *
   * Uses three-colour DFS: WHITE=unvisited, GREY=in-progress, BLACK=done.
   */
  detectCycle(allIds: string[], adjacency: Map<string, string[]>): string[] {
    const WHITE = 0;
    const GREY = 1;
    const BLACK = 2;

    const colour = new Map<string, number>();
    const parent = new Map<string, string | null>();

    for (const id of allIds) {
      colour.set(id, WHITE);
      parent.set(id, null);
    }

    const findCycle = (start: string): string[] => {
      const path: string[] = [];
      let current: string | null = start;
      while (current !== null) {
        path.unshift(current);
        current = parent.get(current as string) ?? (null as string | null);
      }
      return path;
    };

    const dfs = (node: string): string[] | null => {
      colour.set(node, GREY);

      for (const neighbour of adjacency.get(node) ?? []) {
        if (colour.get(neighbour) === GREY) {
          // Back edge found — reconstruct cycle
          return findCycle(node).concat(neighbour);
        }
        if (colour.get(neighbour) === WHITE) {
          parent.set(neighbour, node);
          const result = dfs(neighbour);
          if (result !== null) return result;
        }
      }

      colour.set(node, BLACK);
      return null;
    };

    for (const id of allIds) {
      if (colour.get(id) === WHITE) {
        const result = dfs(id);
        if (result !== null) return result;
      }
    }

    return [];
  }

  /**
   * Computes a topological ordering using Kahn's algorithm (BFS-based).
   */
  private computeTopologicalOrder(
    allIds: string[],
    adjacency: Map<string, string[]>,
    reverse: Map<string, string[]>,
  ): string[] {
    // In-degree = number of prerequisites for each concept
    const inDegree = new Map<string, number>();
    for (const id of allIds) {
      inDegree.set(id, (adjacency.get(id) ?? []).length);
    }

    // Queue: concepts whose prerequisites are all satisfied
    const queue: string[] = [];
    for (const id of allIds) {
      if ((inDegree.get(id) ?? 0) === 0) {
        queue.push(id);
      }
    }

    const result: string[] = [];
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      // Reduce in-degree of every concept that depends on this one
      for (const dependent of reverse.get(node) ?? []) {
        const newDegree = (inDegree.get(dependent) ?? 1) - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    return result;
  }
}
