import { describe, expect, it } from "vitest";
import { createNodeFlowSelectionStore } from "../stores/NodeFlowStore";
import type { IEdge } from "../interfaces/IEdge";
import type { INode } from "../interfaces/INode";

function node(key: string, label: string): INode<{ label: string }, never> {
    return {
        key,
        data: { label },
        endpoints: [],
        offset: { x: 0, y: 0 },
    };
}

function edge(key: string, label: string): IEdge<{ label: string }> {
    return {
        key,
        data: { label },
        sourceId: "source",
        targetId: "target",
    };
}

describe("selection reconciliation", () => {
    it("replaces selected objects with the latest controlled instances", () => {
        const store = createNodeFlowSelectionStore();
        const originalNode = node("node", "old");
        const originalEdge = edge("edge", "old");
        const updatedNode = node("node", "new");
        const updatedEdge = edge("edge", "new");

        store.getState().setSelection([originalNode], [originalEdge]);
        store.getState().reconcileSelection([updatedNode], [updatedEdge]);

        expect(store.getState().selectedNode).toBe(updatedNode);
        expect(store.getState().selectedEdge).toBe(updatedEdge);
    });

    it("removes selections no longer present in controlled state", () => {
        const store = createNodeFlowSelectionStore();

        store.getState().setSelection([node("removed", "node")], [edge("removed", "edge")]);
        store.getState().reconcileSelection([], []);

        expect(store.getState().selectedNodes).toEqual([]);
        expect(store.getState().selectedEdges).toEqual([]);
    });
});
