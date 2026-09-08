import { describe, expect, it } from "vitest";
import { createNodeFlowSelectionStore } from "../stores/NodeFlowStore";
import type { IEdge } from "../interfaces/IEdge";
import type { INode } from "../interfaces/INode";
import type { INodeContainer } from "../interfaces/INodeContainer";

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

function container(key: string, label: string): INodeContainer {
    return {
        key,
        label,
        nodeKeys: [],
        position: { x: 0, y: 0 },
    };
}

describe("selection reconciliation", () => {
    it("replaces selected objects with the latest controlled instances", () => {
        const store = createNodeFlowSelectionStore();
        const originalNode = node("node", "old");
        const originalEdge = edge("edge", "old");
        const updatedNode = node("node", "new");
        const updatedEdge = edge("edge", "new");
        const originalContainer = container("container", "old");
        const updatedContainer = container("container", "new");

        store.getState().setSelection([originalNode], [originalEdge], [originalContainer]);
        store.getState().reconcileSelection([updatedNode], [updatedEdge], [updatedContainer]);

        expect(store.getState().selectedNode).toBe(updatedNode);
        expect(store.getState().selectedEdge).toBe(updatedEdge);
        expect(store.getState().selectedContainer).toBe(updatedContainer);
    });

    it("removes selections no longer present in controlled state", () => {
        const store = createNodeFlowSelectionStore();

        store.getState().setSelection(
            [node("removed", "node")],
            [edge("removed", "edge")],
            [container("removed", "container")]
        );
        store.getState().reconcileSelection([], [], []);

        expect(store.getState().selectedNodes).toEqual([]);
        expect(store.getState().selectedEdges).toEqual([]);
        expect(store.getState().selectedContainers).toEqual([]);
    });

    it("selects a container as the primary flow object and clears other selections", () => {
        const store = createNodeFlowSelectionStore();
        const selectedContainer = container("container", "Rack A");

        store.getState().setSelection([node("node", "Node")], [edge("edge", "Edge")]);
        store.getState().selectContainer(selectedContainer);

        expect(store.getState().selectedContainer).toBe(selectedContainer);
        expect(store.getState().selectedContainerKeys.has("container")).toBe(true);
        expect(store.getState().selectedNodes).toEqual([]);
        expect(store.getState().selectedEdges).toEqual([]);
    });
});
