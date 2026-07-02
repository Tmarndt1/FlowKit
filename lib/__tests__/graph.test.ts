import { describe, expect, it } from "vitest";
import { buildAdjacency, topoRanks } from "../layout/graph";
import type { LayoutEdge, LayoutNode } from "../layout/types";

function node(key: string): LayoutNode {
    return { key, x: 0, y: 0, width: 100, height: 40 };
}

function edge(sourceId: string, targetId: string): LayoutEdge {
    return { sourceId, targetId };
}

// ─── buildAdjacency ──────────────────────────────────────────────────────────

describe("buildAdjacency", () => {
    it("initialises empty lists for every node", () => {
        const { outgoing, incoming } = buildAdjacency(
            [node("a"), node("b")],
            []
        );
        expect(outgoing.get("a")).toEqual([]);
        expect(incoming.get("b")).toEqual([]);
    });

    it("populates outgoing and incoming for a simple edge", () => {
        const { outgoing, incoming } = buildAdjacency(
            [node("a"), node("b")],
            [edge("a", "b")]
        );
        expect(outgoing.get("a")).toEqual(["b"]);
        expect(incoming.get("b")).toEqual(["a"]);
    });

    it("ignores edges referencing unknown nodes", () => {
        const { outgoing, incoming } = buildAdjacency(
            [node("a")],
            [edge("a", "x")]
        );
        expect(outgoing.get("a")).toEqual([]);
        expect(incoming.size).toBe(1);
    });

    it("handles multiple outgoing edges from one node", () => {
        const { outgoing } = buildAdjacency(
            [node("a"), node("b"), node("c")],
            [edge("a", "b"), edge("a", "c")]
        );
        expect(outgoing.get("a")).toEqual(["b", "c"]);
    });

    it("handles diamond shape (two paths to one target)", () => {
        const { incoming } = buildAdjacency(
            [node("a"), node("b"), node("c"), node("d")],
            [edge("a", "b"), edge("a", "c"), edge("b", "d"), edge("c", "d")]
        );
        expect(incoming.get("d")).toEqual(["b", "c"]);
    });
});

// ─── topoRanks ───────────────────────────────────────────────────────────────

describe("topoRanks", () => {
    it("assigns rank 0 to all nodes with no edges", () => {
        const ranks = topoRanks([node("a"), node("b")], []);
        expect(ranks.get("a")).toBe(0);
        expect(ranks.get("b")).toBe(0);
    });

    it("assigns rank 1 to a direct child", () => {
        const ranks = topoRanks(
            [node("a"), node("b")],
            [edge("a", "b")]
        );
        expect(ranks.get("a")).toBe(0);
        expect(ranks.get("b")).toBe(1);
    });

    it("uses longest-path distance in a linear chain", () => {
        const ranks = topoRanks(
            [node("a"), node("b"), node("c"), node("d")],
            [edge("a", "b"), edge("b", "c"), edge("c", "d")]
        );
        expect(ranks.get("a")).toBe(0);
        expect(ranks.get("b")).toBe(1);
        expect(ranks.get("c")).toBe(2);
        expect(ranks.get("d")).toBe(3);
    });

    it("picks the longest path in a diamond", () => {
        // a→b→d and a→c→d — d should be rank 2
        const ranks = topoRanks(
            [node("a"), node("b"), node("c"), node("d")],
            [edge("a", "b"), edge("a", "c"), edge("b", "d"), edge("c", "d")]
        );
        expect(ranks.get("d")).toBe(2);
    });

    it("picks the longest incoming path when chains differ", () => {
        // a→c (rank 1) but b→b2→c (rank 2 from b2) — c should be rank 3
        const ranks = topoRanks(
            [node("a"), node("b"), node("b2"), node("c")],
            [edge("a", "c"), edge("b", "b2"), edge("b2", "c")]
        );
        expect(ranks.get("c")).toBe(2);
    });

    it("keeps nodes in a cycle at rank 0 (cycle-breaking)", () => {
        // a↔b cycle — neither ever reaches in-degree 0 so both stay at 0
        const ranks = topoRanks(
            [node("a"), node("b")],
            [edge("a", "b"), edge("b", "a")]
        );
        expect(ranks.get("a")).toBe(0);
        expect(ranks.get("b")).toBe(0);
    });
});
