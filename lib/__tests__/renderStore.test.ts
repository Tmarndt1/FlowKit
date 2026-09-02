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
});
