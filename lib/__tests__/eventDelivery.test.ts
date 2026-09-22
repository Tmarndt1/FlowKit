import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNodeFlowStores } from "../stores/NodeFlowStore";

const harness = vi.hoisted(() => ({
    stores: null as any,
    effects: [] as Array<() => void | (() => void)>,
}));

// Run the event bridge against real stores without requiring a browser renderer.
vi.mock("react", async (importOriginal) => ({
    ...await importOriginal<typeof import("react")>(),
    useContext: () => harness.stores,
    useRef: (current: unknown) => ({ current }),
    useLayoutEffect: (effect: () => void | (() => void)) => harness.effects.push(effect),
}));

import { FlowKitEvents } from "../components/FlowKitEvents";

describe("event bridge delivery", () => {
    const cleanups: Array<() => void> = [];

    beforeEach(() => {
        harness.stores = createNodeFlowStores();
        harness.effects = [];
    });

    afterEach(() => {
        cleanups.splice(0).forEach((cleanup) => cleanup());
    });

    function mount(props: Parameters<typeof FlowKitEvents>[0]) {
        FlowKitEvents(props);
        harness.effects.splice(0).forEach((effect) => {
            const cleanup = effect();
            if (cleanup) cleanups.push(cleanup);
        });
    }

    it("does not replay old node requests after a synchronous container callback", () => {
        const render = harness.stores.render;
        const onNodesChange = vi.fn();
        const first = [{ type: "position", key: "node", offset: { x: 1, y: 0 } }];
        const second = [{ type: "position", key: "node", offset: { x: 2, y: 0 } }];
        mount({
            onNodesChange,
            onContainersChange: () => render.getState().requestNodesChange(second),
        });

        render.getState().requestNodesChange(first);
        render.getState().requestContainersChange([{ type: "move", key: "container", position: { x: 1, y: 0 } }]);

        expect(onNodesChange.mock.calls).toEqual([[first], [second]]);
    });

    it("emits one selection change despite controlled object reconciliation and repeated clicks", () => {
        const onNodesChange = vi.fn();
        mount({ onNodesChange });
        const selection = harness.stores.selection;
        const node = { key: "node", endpoints: [], offset: { x: 0, y: 0 } };
        selection.getState().selectNode(node);
        selection.getState().reconcileSelection([{ ...node }], [], []);
        selection.getState().selectNode(node);

        expect(onNodesChange.mock.calls).toEqual([[[{ type: "select", key: "node", selected: true }]]]);
    });

    it("does not emit change callbacks for empty requests", () => {
        const onNodesChange = vi.fn();
        const onContainersChange = vi.fn();
        mount({ onNodesChange, onContainersChange });
        harness.stores.render.getState().requestNodesChange([]);
        harness.stores.render.getState().requestContainersChange([]);
        expect(onNodesChange).not.toHaveBeenCalled();
        expect(onContainersChange).not.toHaveBeenCalled();
    });
});
