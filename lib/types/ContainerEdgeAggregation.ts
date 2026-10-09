import type { IEdge } from "../interfaces/IEdge";
import type { INodeContainer } from "../interfaces/INodeContainer";

/** Resolved visual anchor. Containers always attach to their boundary. */
export type RenderedEdgeAnchor =
    | { kind: "endpoint"; id: string }
    | { kind: "node"; key: string }
    | { kind: "container"; key: string };

/** Render-only metadata; original controlled edges are never rewritten. */
export interface EdgeRenderInfo {
    source: RenderedEdgeAnchor;
    target: RenderedEdgeAnchor;
    originalEdgeKeys: readonly string[];
}

export interface ContainerEdgeAggregateArgs<T extends IEdge<any> = IEdge<any>> {
    /** Canonical first container by key; summary sides do not imply original edge direction. */
    sourceContainer: INodeContainer;
    /** Canonical second container by key. */
    targetContainer: INodeContainer;
    /** All original connections in both directions, with original source/target IDs intact. */
    edges: readonly T[];
}

/** Presentation and payload overrides for a container-to-container summary. */
export type ContainerEdgeAggregateResult<T extends IEdge<any> = IEdge<any>> = Pick<IEdge<T["data"]>,
    "data" | "style" | "className" | "label" | "type" | "animated" |
    "markerStart" | "markerEnd" | "strokeStyle" | "pathType" | "routing" | "arrows"
>;

export interface ContainerEdgeAggregationOptions<T extends IEdge<any> = IEdge<any>> {
    /** Defaults to "hide", preserving existing container collapse behavior. */
    collapsedContainerEdges?: "hide" | "aggregate";
    /** Called once per unordered pair of collapsed containers, combining both directions. */
    aggregateContainerEdges?: (args: ContainerEdgeAggregateArgs<T>) => ContainerEdgeAggregateResult<T>;
}
