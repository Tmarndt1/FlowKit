import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNodeFlowStores } from "../stores/NodeFlowStore";
import type { INode } from "../interfaces/INode";
import type { INodeContainer } from "../interfaces/INodeContainer";
import type { IEdge } from "../interfaces/IEdge";

const harness = vi.hoisted(() => ({ stores: null as any }));

// Inspect renderer output against real stores without running DOM effects.
vi.mock("react", async (importOriginal) => ({
    ...await importOriginal<typeof import("react")>(),
    useContext: () => harness.stores,
    useRef: (current: unknown) => ({ current }),
    useState: (initial: unknown) => [initial, vi.fn()],
    useCallback: (callback: unknown) => callback,
    useEffect: () => {},
    useLayoutEffect: () => {},
}));
vi.mock("../contexts/NodeFlowContext", () => ({
    NodeFlowContext: {},
    useFlowKitViewportStore: (selector: (state: any) => unknown) => selector(harness.stores.viewport.getState()),
    useFlowKitSelectionStore: (selector: (state: any) => unknown) => selector(harness.stores.selection.getState()),
    useFlowKitRenderStore: (selector: (state: any) => unknown) => selector(harness.stores.render.getState()),
    useFlowKitInteractionStore: (selector: (state: any) => unknown) => selector(harness.stores.interaction.getState()),
}));
vi.mock("../contexts/FlowKitConfigContext", () => ({
    useFlowKitConfig: () => ({ getRootElement: () => null }),
}));
vi.mock("../components/edges/useEdgeFoldMetrics", () => ({
    useEdgeFoldMetrics: () => ({ measurePathRef: { current: null }, pathFoldMetrics: null }),
}));

import { Node } from "../components/nodes/Node";
import { NodeContainer } from "../components/nodes/NodeContainer";
import { Edge } from "../components/edges/Edge";

const Custom: React.FC<{ style?: React.CSSProperties }> = (props) => React.createElement("div", { style: props.style });

describe("object styles and custom renderers", () => {
    beforeEach(() => {
        harness.stores = createNodeFlowStores();
    });

    const node: INode<never, never> = {
        key: "node", offset: { x: 20, y: 30 }, endpoints: [],
        style: { background: "red", opacity: 0.5, padding: 12, width: 200, transform: "scale(2)", zIndex: 42 },
    };
    const container: INodeContainer = {
        key: "container", position: { x: 10, y: 15 }, nodeKeys: [], resizeToFit: false,
        style: { background: "blue", opacity: 0.4, padding: 16, width: 400, height: 300, transform: "scale(2)" },
    };
    const edge: IEdge<never> = {
        key: "edge", sourceId: "source", targetId: "target",
        style: { stroke: "red", opacity: 0.3, strokeWidth: 5 },
    };

    it("applies node styles to the default wrapper with canvas positioning", () => {
        const result = (Node as any).type({ node });
        expect(result.props.style).toEqual({ ...node.style, transform: "translate(20px, 30px)" });
    });

    it("keeps custom node styles on the custom component and preserves wrapper positioning", () => {
        const result = (Node as any).type({ node, customNode: Custom });
        expect(result.props.style).toEqual({ zIndex: 100, transform: "translate(20px, 30px)" });
        expect(result.props.children.type).toBe(Custom);
        expect(result.props.children.props.style).toBe(node.style);
    });

    it("applies container styles to the default wrapper with layout bounds", () => {
        const result = (NodeContainer as any).type({ container, nodes: [] });
        expect(result.props.style).toEqual({ ...container.style, transform: "translate(10px, 15px)" });
    });

    it("passes original container styles to the custom component without styling its wrapper", () => {
        const result = (NodeContainer as any).type({ container, nodes: [], customContainer: Custom });
        expect(result.props.style).toEqual({ width: 400, height: 300, transform: "translate(10px, 15px)" });
        expect(result.props.children.type).toBe(Custom);
        expect(result.props.children.props.style).toBe(container.style);
        expect(result.props.children.props.onCollapsedChange).toEqual(expect.any(Function));
    });

    it("preserves compact container bounds without changing the custom style prop", () => {
        const result = (NodeContainer as any).type({ container: { ...container, collapsed: true }, nodes: [], customContainer: Custom });
        expect(result.props.style).toEqual({ width: 240, height: 44, minWidth: 0, minHeight: 0, transform: "translate(10px, 15px)" });
        expect(result.props.children.props.style).toBe(container.style);
    });

    it("applies edge styles only to the default visible path", () => {
        const result = (Edge as any).type({ edge });
        const paths = React.Children.toArray(result.props.children) as React.ReactElement<any>[];
        expect(paths.find((child) => child.props.className === "flow-kit-edge-path")?.props.style).toMatchObject(edge.style!);
        expect(result.props.style).toBeUndefined();
        expect(paths.find((child) => child.props.className === "flow-kit-edge-hitbox")?.props.style).toBeUndefined();
    });

    it("passes edge styles to the custom component without styling its group or hitbox", () => {
        const result = (Edge as any).type({ edge, customEdge: Custom });
        const children = React.Children.toArray(result.props.children) as React.ReactElement<any>[];
        expect(result.props.style).toBeUndefined();
        expect(children[0].props.style).toBeUndefined();
        expect(children[1].type).toBe(Custom);
        expect(children[1].props.style).toBe(edge.style);
    });
});
