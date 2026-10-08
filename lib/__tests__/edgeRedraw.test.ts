import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createNodeFlowStores } from "../stores/NodeFlowStore";
import { Position } from "../enums/Position";
import { IEdge } from "../interfaces/IEdge";

const harness = vi.hoisted(() => ({
    stores: null as any,
    hooks: [] as any[],
    cursor: 0,
    effects: [] as Array<() => void>,
    getRootElement: () => null,
    resolveAnchors: vi.fn(),
}));

// Exercise the redraw effects and real store notifications using persistent hook
// state, as in eventDelivery.test.ts; DOM/SVG measurement is supplied separately.
vi.mock("react", async (importOriginal) => {
    const changed = (previous: unknown[] | undefined, next: unknown[] | undefined) =>
        previous == null || next == null || previous.length !== next.length ||
        next.some((value, index) => !Object.is(value, previous[index]));
    return {
        ...await importOriginal<typeof import("react")>(),
        useContext: () => harness.stores,
        useRef: (current: unknown) => {
            const index = harness.cursor++;
            return harness.hooks[index] ??= { current };
        },
        useState: (initial: unknown) => {
            const index = harness.cursor++;
            const hook = harness.hooks[index] ??= {
                value: initial,
                set: vi.fn((value: unknown) => { harness.hooks[index].value = value; }),
            };
            return [hook.value, hook.set];
        },
        useCallback: (callback: unknown, dependencies: unknown[]) => {
            const index = harness.cursor++;
            if (changed(harness.hooks[index]?.dependencies, dependencies)) {
                harness.hooks[index] = { callback, dependencies };
            }
            return harness.hooks[index].callback;
        },
        useEffect: (effect: () => void | (() => void), dependencies?: unknown[]) => {
            const index = harness.cursor++;
            if (!changed(harness.hooks[index]?.dependencies, dependencies)) return;
            harness.effects.push(() => {
                harness.hooks[index]?.cleanup?.();
                harness.hooks[index] = { dependencies, cleanup: effect() };
            });
        },
    };
});

vi.mock("../contexts/NodeFlowContext", () => ({
    NodeFlowContext: {},
    useFlowKitViewportStore: (selector: (state: any) => unknown) => selector(harness.stores.viewport.getState()),
    useFlowKitSelectionStore: (selector: (state: any) => unknown) => selector(harness.stores.selection.getState()),
}));
vi.mock("../contexts/FlowKitConfigContext", () => ({
    useFlowKitConfig: () => ({ getRootElement: harness.getRootElement }),
}));
vi.mock("../functions/edgeAnchors", () => ({ resolveEdgeAnchors: harness.resolveAnchors }));
vi.mock("../components/edges/useEdgeFoldMetrics", () => ({
    useEdgeFoldMetrics: () => ({ measurePathRef: { current: null }, pathFoldMetrics: null }),
}));

import { Edge } from "../components/edges/Edge";

describe("edge redraw scheduling", () => {
    const frames = new Map<number, FrameRequestCallback>();
    let nextFrame: number;
    let requestFrame: ReturnType<typeof vi.fn>;
    let targetX: number;
    const edge: IEdge<never> = { key: "edge", sourceId: "source", targetId: "target", pathType: "straight" };

    function render(currentEdge = edge, selectionEdges?: IEdge<any>[]) {
        harness.cursor = 0;
        // React.memo exposes the underlying component for this hook harness.
        const rendered = (Edge as any).type({ edge: currentEdge, selectionEdges });
        harness.effects.splice(0).forEach((effect) => effect());
        return rendered;
    }

    function flushFrame() {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((callback) => callback(0));
    }

    function pathUpdates() {
        return harness.hooks.find((hook) => hook.set != null && typeof hook.value === "string").set;
    }

    beforeEach(() => {
        vi.useFakeTimers();
        harness.stores = createNodeFlowStores();
        harness.stores.viewport.getState().setContainerRect({ left: 0, top: 0 } as DOMRect);
        harness.hooks = [];
        harness.effects = [];
        frames.clear();
        nextFrame = 0;
        targetX = 100;
        harness.resolveAnchors.mockReset().mockImplementation(() => ({
            source: { offset: { x: 0, y: 0 }, position: Position.Right },
            target: { offset: { x: targetX, y: 0 }, position: Position.Left },
        }));
        requestFrame = vi.fn((callback: FrameRequestCallback) => {
            frames.set(++nextFrame, callback);
            return nextFrame;
        });
        vi.stubGlobal("window", {
            requestAnimationFrame: requestFrame,
            cancelAnimationFrame: (id: number) => frames.delete(id),
            setInterval,
            clearInterval,
        });
    });

    afterEach(() => {
        harness.hooks.forEach((hook) => hook.cleanup?.());
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it("coalesces rapid controlled renders and layout requests using the latest geometry", () => {
        render();
        for (let index = 0; index < 100; index++) {
            targetX = 100 + index;
            render({ ...edge, style: { stroke: `rgb(${index}, 0, 0)` } });
            harness.stores.render.getState().notifyEndpointsChanged([{ id: "source" }]);
            harness.stores.render.getState().requestEdgeRender(edge);
        }
        vi.advanceTimersByTime(20);

        expect(requestFrame).toHaveBeenCalledTimes(1);
        expect(harness.resolveAnchors).not.toHaveBeenCalled();
        expect(pathUpdates()).not.toHaveBeenCalled();
        flushFrame();
        expect(harness.resolveAnchors).toHaveBeenCalledTimes(1);
        expect(pathUpdates().mock.calls).toEqual([["M 0,0 L 199,0"]]);
    });

    it("skips unchanged paths but redraws when geometry or scale changes", () => {
        render();
        flushFrame();
        vi.advanceTimersByTime(20);
        flushFrame();
        render({ ...edge, style: { stroke: "red" } });
        flushFrame();
        expect(pathUpdates()).toHaveBeenCalledTimes(1);

        targetX = 200;
        harness.stores.render.getState().requestEdgeRender(edge);
        flushFrame();
        expect(pathUpdates()).toHaveBeenLastCalledWith("M 0,0 L 200,0");

        harness.stores.viewport.getState().setScale(2);
        render();
        flushFrame();
        expect(pathUpdates()).toHaveBeenLastCalledWith("M 0,0 L 100,0");
    });

    it("ignores unrelated layout requests and cancels pending work on unmount", () => {
        render();
        flushFrame();
        vi.advanceTimersByTime(20);
        flushFrame();
        requestFrame.mockClear();
        harness.stores.render.getState().notifyEndpointsChanged([{ id: "other" }]);
        harness.stores.render.getState().requestEdgeRender({ ...edge, key: "other" });
        expect(requestFrame).not.toHaveBeenCalled();

        harness.stores.render.getState().requestEdgeRender(edge);
        harness.hooks.forEach((hook) => hook.cleanup?.());
        expect(frames.size).toBe(0);
        harness.stores.render.getState().requestEdgeRender(edge);
        flushFrame();
        expect(pathUpdates()).toHaveBeenCalledTimes(1);
    });

    it("redraws projected boundaries when a collapsed container moves its hidden members", () => {
        const projected: IEdge<never> = {
            ...edge,
            key: "summary",
            renderInfo: {
                source: { kind: "container", key: "A" },
                target: { kind: "container", key: "B" },
                originalEdgeKeys: [edge.key],
            },
        };
        render(projected, [edge]);
        flushFrame();
        targetX = 300;
        harness.stores.render.getState().notifyEndpointsChanged([], ["hidden-member"]);
        flushFrame();
        expect(pathUpdates()).toHaveBeenLastCalledWith("M 0,0 L 300,0");
    });

    it("selects and toggles the original edges rather than persisting a summary key", () => {
        const originals = [edge, { ...edge, key: "second" }];
        const projected: IEdge<never> = {
            ...edge, key: "summary", collapsible: false,
            renderInfo: {
                source: { kind: "container", key: "A" },
                target: { kind: "container", key: "B" },
                originalEdgeKeys: originals.map((edge) => edge.key),
            },
        };
        const click = { stopPropagation: vi.fn(), preventDefault: vi.fn(), shiftKey: false };
        render(projected, originals).props.onClick(click);
        expect(harness.stores.selection.getState().selectedEdges).toEqual(originals);
        expect(harness.stores.selection.getState().selectedEdgeKeys.has("summary")).toBe(false);
        const selected = render(projected, originals);
        expect(selected.props.className).toContain("flow-kit-selected");
        selected.props.onClick({ ...click, shiftKey: true });
        expect(harness.stores.selection.getState().selectedEdges).toEqual([]);
        selected.props.onClick({ ...click, shiftKey: true });
        expect(harness.stores.selection.getState().selectedEdges).toEqual(originals);
    });
});
