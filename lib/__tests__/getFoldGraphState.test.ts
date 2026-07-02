import { describe, expect, it } from "vitest";
import { getFoldGraphState } from "../functions/getFoldGraphState";
import type { IEdge } from "../interfaces/IEdge";
import type { INode } from "../interfaces/INode";

function node(key: string): INode<unknown, unknown> {
    return { key, type: "node", offset: { x: 0, y: 0 }, endpoints: [] };
}

function edge(key: string, sourceId: string, targetId: string, extra?: Partial<IEdge<unknown>>): IEdge<unknown> {
    return { key, type: "edge", sourceId, targetId, anchorMode: "floating", ...extra };
}

describe("getFoldGraphState (no collapsed edges)", () => {
    it("returns all edges as visible when none are collapsed", () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b")];
        const state = getFoldGraphState(nodes, edges, undefined, null);
        expect(state.visibleEdges).toHaveLength(1);
        expect(state.hiddenNodeKeys.size).toBe(0);
    });

    it("has empty class name maps when there are no collapsed or previewed edges", () => {
        const state = getFoldGraphState([node("a"), node("b")], [edge("e1", "a", "b")], undefined, null);
        expect(state.nodeStateClassNames.size).toBe(0);
        expect(state.edgeStateClassNames.size).toBe(0);
    });
});

describe("getFoldGraphState — edge collapse mode", () => {
    it('does not hide any nodes when collapseMode is "edge" (only folds the edge visually)', () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b", { collapsed: true, collapseMode: "edge" })];
        const state = getFoldGraphState(nodes, edges, undefined, null);
        // "edge" mode only marks the edge path as folded — it does not hide nodes
        expect(state.hiddenNodeKeys.size).toBe(0);
    });

    it('keeps the collapsed anchor edge in visibleEdges', () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b", { collapsed: true, collapseMode: "edge" })];
        const state = getFoldGraphState(nodes, edges, undefined, null);
        expect(state.visibleEdges.map((e) => e.key)).toContain("e1");
    });

    it('hides downstream nodes when collapseMode is "downstream"', () => {
        // a → b → c; collapse a→b downstream
        const nodes = [node("a"), node("b"), node("c")];
        const edges = [
            edge("e1", "a", "b", { collapsed: true, collapseMode: "downstream" }),
            edge("e2", "b", "c"),
        ];
        const state = getFoldGraphState(nodes, edges, undefined, null);
        expect(state.hiddenNodeKeys.has("b")).toBe(true);
        expect(state.hiddenNodeKeys.has("c")).toBe(true);
        expect(state.hiddenNodeKeys.has("a")).toBe(false);
    });

    it("removes edges whose endpoints are hidden", () => {
        const nodes = [node("a"), node("b"), node("c")];
        const edges = [
            edge("e1", "a", "b", { collapsed: true, collapseMode: "downstream" }),
            edge("e2", "b", "c"),
        ];
        const state = getFoldGraphState(nodes, edges, undefined, null);
        // e2 connects hidden nodes, so it should be removed from visibleEdges
        expect(state.visibleEdges.map((e) => e.key)).not.toContain("e2");
    });

    it("applies hidden class name to downstream-hidden nodes", () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b", { collapsed: true, collapseMode: "downstream" })];
        const state = getFoldGraphState(nodes, edges, undefined, null);
        expect(state.nodeStateClassNames.get("b")).toContain("flow-kit-node-hidden");
    });
});

describe("getFoldGraphState — preview", () => {
    it("marks the preview edge in previewEdgeKeys", () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b")];
        const state = getFoldGraphState(nodes, edges, undefined, {
            edge: edges[0],
            mode: "downstream",
        });
        expect(state.previewEdgeKeys.has("e1")).toBe(true);
    });

    it("marks downstream nodes in previewNodeKeys for a downstream preview", () => {
        const nodes = [node("a"), node("b"), node("c")];
        const edges = [edge("e1", "a", "b"), edge("e2", "b", "c")];
        const state = getFoldGraphState(nodes, edges, undefined, {
            edge: edges[0],
            mode: "downstream",
        });
        expect(state.previewNodeKeys.has("b")).toBe(true);
        expect(state.previewNodeKeys.has("c")).toBe(true);
        expect(state.previewNodeKeys.has("a")).toBe(false);
    });

    it("applies fold-preview class to previewed visible edges", () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b")];
        const state = getFoldGraphState(nodes, edges, undefined, {
            edge: edges[0],
            mode: "downstream",
        });
        expect(state.edgeStateClassNames.get("e1")).toBe("flow-kit-edge-fold-preview");
    });

    it("ignores preview when mode is null", () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b")];
        const state = getFoldGraphState(nodes, edges, undefined, { edge: edges[0], mode: null });
        expect(state.previewEdgeKeys.size).toBe(0);
        expect(state.previewNodeKeys.size).toBe(0);
    });
});

describe("getFoldGraphState — containers", () => {
    it("filters hidden node keys from container nodeKeys", () => {
        const nodes = [node("a"), node("b")];
        const edges = [edge("e1", "a", "b", { collapsed: true, collapseMode: "downstream" })];
        const containers = [{ key: "grp", nodeKeys: ["a", "b"] }];
        const state = getFoldGraphState(nodes, edges, containers, null);
        expect(state.visibleContainers?.[0].nodeKeys).toEqual(["a"]);
    });

    it("returns undefined visibleContainers when containers is undefined", () => {
        const state = getFoldGraphState([node("a")], [], undefined, null);
        expect(state.visibleContainers).toBeUndefined();
    });
});
