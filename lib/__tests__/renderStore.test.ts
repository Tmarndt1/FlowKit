import { describe, expect, it } from "vitest";
import { createNodeFlowRenderStore } from "../stores/NodeFlowStore";

describe("render store change handlers", () => {
    it("disables controlled mutations until matching handlers are registered", () => {
        const store = createNodeFlowRenderStore();

        expect(store.getState()).toMatchObject({
            canChangeNodes: false,
            canChangeEdges: false,
            canChangeContainers: false,
        });
    });

    it("tracks node, edge, and container handlers independently", () => {
        const store = createNodeFlowRenderStore();

        store.getState().setChangeHandlerAvailability({
            nodes: true,
            edges: false,
            containers: true,
        });

        expect(store.getState()).toMatchObject({
            canChangeNodes: true,
            canChangeEdges: false,
            canChangeContainers: true,
        });
    });

    it("publishes container drag previews only when highlighted keys change", () => {
        const store = createNodeFlowRenderStore();
        let updates = 0;
        const unsubscribe = store.subscribe(() => {
            updates += 1;
        });

        store.getState().setContainerDragPreview(new Set(["target"]), new Set(["source"]));
        store.getState().setContainerDragPreview(new Set(["target"]), new Set(["source"]));

        expect(updates).toBe(1);
        expect(store.getState().containerDropTargetKeys.has("target")).toBe(true);
        expect(store.getState().containerDraggingOutKeys.has("source")).toBe(true);

        unsubscribe();
    });
});
