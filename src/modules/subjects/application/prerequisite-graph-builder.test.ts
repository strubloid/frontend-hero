import { describe, it, expect } from "vitest";
import { PrerequisiteGraphBuilder } from "./prerequisite-graph-builder";

function makeConcept(id: string, prerequisites: string[]) {
  return {
    id,
    name: id.replace(/\./g, " "),
    domainName: "Test",
    subjectId: "test",
    level: "foundation" as const,
    difficulty: 1,
    prerequisites,
    tags: [],
    outcomes: [],
    knowledge: "",
    commonMisconceptions: [],
    examples: [],
    questionSeeds: [],
    practicalChallenges: [],
    interviewPrompts: [],
  };
}

describe("PrerequisiteGraphBuilder", () => {
  const builder = new PrerequisiteGraphBuilder();

  describe("build — acyclic graphs", () => {
    it("handles a single root concept", () => {
      const concepts = [makeConcept("a", [])];
      const graph = builder.build(concepts);
      expect(graph.getAllConceptIds()).toEqual(["a"]);
      expect(graph.getPrerequisites("a")).toEqual([]);
      expect(graph.getDependents("a")).toEqual([]);
      expect(graph.getAvailableConcepts(new Set())).toEqual(["a"]);
      expect(graph.getTopologicalOrder()).toEqual(["a"]);
    });

    it("handles a simple chain: a → b → c", () => {
      const concepts = [makeConcept("a", []), makeConcept("b", ["a"]), makeConcept("c", ["b"])];
      const graph = builder.build(concepts);
      expect(graph.getPrerequisites("c")).toEqual(["b"]);
      expect(graph.getDependents("c")).toEqual([]);
      expect(graph.getDependents("a")).toEqual(["b"]);
      expect(graph.getAvailableConcepts(new Set(["a"]))).toEqual(["b"]);
      expect(graph.getDepth("a")).toBe(0);
      expect(graph.getDepth("b")).toBe(1);
      expect(graph.getDepth("c")).toBe(2);
    });

    it("handles a diamond: a→b, a→c, b→d, c→d", () => {
      const concepts = [
        makeConcept("a", []),
        makeConcept("b", ["a"]),
        makeConcept("c", ["a"]),
        makeConcept("d", ["b", "c"]),
      ];
      const graph = builder.build(concepts);
      expect(graph.getPrerequisites("d")).toEqual(["b", "c"]);
      expect(graph.getAvailableConcepts(new Set())).toEqual(["a"]);
      expect(graph.getAvailableConcepts(new Set(["a"]))).toContain("b");
      expect(graph.getAvailableConcepts(new Set(["a"]))).toContain("c");
      expect(graph.getAvailableConcepts(new Set(["a", "b", "c"]))).toContain("d");
      expect(graph.getDepth("a")).toBe(0);
      expect(graph.getDepth("d")).toBe(2);
    });

    it("handles multiple roots", () => {
      const concepts = [makeConcept("x", []), makeConcept("y", []), makeConcept("z", ["x", "y"])];
      const graph = builder.build(concepts);
      expect(graph.getDepth("x")).toBe(0);
      expect(graph.getDepth("y")).toBe(0);
      expect(graph.getDepth("z")).toBe(1);
      const order = graph.getTopologicalOrder();
      expect(order).not.toBeNull();
      expect(order!.indexOf("x")).toBeLessThan(order!.indexOf("z"));
      expect(order!.indexOf("y")).toBeLessThan(order!.indexOf("z"));
    });

    it("topological order respects all dependencies", () => {
      const concepts = [
        makeConcept("a", []),
        makeConcept("b", ["a"]),
        makeConcept("c", ["a", "b"]),
        makeConcept("d", []),
        makeConcept("e", ["d", "c"]),
      ];
      const graph = builder.build(concepts);
      const order = graph.getTopologicalOrder()!;
      expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
      expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
      expect(order.indexOf("c")).toBeLessThan(order.indexOf("e"));
      expect(order.indexOf("d")).toBeLessThan(order.indexOf("e"));
    });
  });

  describe("cycle detection", () => {
    it("detects a trivial self-loop", () => {
      const concepts = [makeConcept("a", ["a"])];
      expect(() => builder.build(concepts)).toThrow(/cycle/i);
    });

    it("detects a simple 2-node cycle: a→b, b→a", () => {
      const concepts = [makeConcept("a", ["b"]), makeConcept("b", ["a"])];
      expect(() => builder.build(concepts)).toThrow(/cycle/i);
    });

    it("detects a 3-node cycle: a→b, b→c, c→a", () => {
      const concepts = [makeConcept("a", ["b"]), makeConcept("b", ["c"]), makeConcept("c", ["a"])];
      expect(() => builder.build(concepts)).toThrow(/cycle/i);
    });

    it("detects a diamond with a cross-cycle: a→b, a→c, c→b, b→c", () => {
      const concepts = [
        makeConcept("a", []),
        makeConcept("b", ["a"]),
        makeConcept("c", ["a", "b"]),
        makeConcept("d", ["b", "c"]),
      ];
      // b and c: b requires c, c requires b → cycle
      // Actually let me make this properly: b→c, c→b
      const concepts2 = [
        makeConcept("a", []),
        makeConcept("b", ["a", "c"]),
        makeConcept("c", ["a", "b"]),
        makeConcept("d", ["b", "c"]),
      ];
      expect(() => builder.build(concepts2)).toThrow(/cycle/i);
    });

    it("does not throw for a valid DAG", () => {
      const concepts = [
        makeConcept("html", []),
        makeConcept("css", []),
        makeConcept("js", []),
        makeConcept("react", ["js", "html"]),
        makeConcept("nextjs", ["react", "css"]),
      ];
      expect(() => builder.build(concepts)).not.toThrow();
    });

    it("cycle message includes the cycle path", () => {
      const concepts = [makeConcept("a", ["b"]), makeConcept("b", ["c"]), makeConcept("c", ["a"])];
      try {
        builder.build(concepts);
        expect.fail("Should have thrown");
      } catch (e) {
        const msg = (e as Error).message;
        expect(msg).toMatch(/cycle/i);
        // Should mention at least some of the cycle nodes
        expect(msg).toMatch(/a.*b.*c/);
      }
    });
  });

  describe("getAvailableConcepts", () => {
    it("starts with roots when nothing is mastered", () => {
      const concepts = [makeConcept("a", []), makeConcept("b", ["a"]), makeConcept("c", ["b"])];
      const graph = builder.build(concepts);
      expect(graph.getAvailableConcepts(new Set())).toEqual(["a"]);
    });

    it("unlocks next tier when prerequisites are mastered", () => {
      const concepts = [makeConcept("a", []), makeConcept("b", ["a"])];
      const graph = builder.build(concepts);
      expect(graph.getAvailableConcepts(new Set(["a"]))).toEqual(["b"]);
    });

    it("does not return already-mastered concepts", () => {
      const concepts = [makeConcept("a", []), makeConcept("b", ["a"])];
      const graph = builder.build(concepts);
      expect(graph.getAvailableConcepts(new Set(["a", "b"]))).toEqual([]);
    });

    it("handles concepts with missing prerequisites gracefully", () => {
      const concepts = [makeConcept("a", []), makeConcept("b", ["nonexistent"])];
      const graph = builder.build(concepts);
      // 'b' has an unsatisfied prereq so should NOT be available
      expect(graph.getAvailableConcepts(new Set())).toEqual(["a"]);
      // 'a' is already mastered, 'b' has unfulfilled prereq — nothing available
      expect(graph.getAvailableConcepts(new Set(["a"]))).toEqual([]);
    });
  });

  describe("getDepth", () => {
    it("returns 0 for roots", () => {
      const concepts = [makeConcept("a", []), makeConcept("b", [])];
      const graph = builder.build(concepts);
      expect(graph.getDepth("a")).toBe(0);
      expect(graph.getDepth("b")).toBe(0);
    });

    it("returns correct depth for chain", () => {
      const concepts = [
        makeConcept("a", []),
        makeConcept("b", ["a"]),
        makeConcept("c", ["b"]),
        makeConcept("d", ["c"]),
      ];
      const graph = builder.build(concepts);
      expect(graph.getDepth("a")).toBe(0);
      expect(graph.getDepth("b")).toBe(1);
      expect(graph.getDepth("c")).toBe(2);
      expect(graph.getDepth("d")).toBe(3);
    });

    it("returns longest path for diamond", () => {
      // a → b → d
      // a → c → d
      const concepts = [
        makeConcept("a", []),
        makeConcept("b", ["a"]),
        makeConcept("c", ["a"]),
        makeConcept("d", ["b", "c"]),
      ];
      const graph = builder.build(concepts);
      // Both b and c are depth 1, so d is depth 2
      expect(graph.getDepth("d")).toBe(2);
    });
  });
});
