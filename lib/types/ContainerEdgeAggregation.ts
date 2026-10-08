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

export interface ContainerEdgeAggregateArgs<T> {
    sourceContainer: INodeContainer;
    targetContainer: INodeContainer;
    edges: readonly IEdge<T>[];
}

/** Presentation and payload overrides for a container-to-container summary. */
export type ContainerEdgeAggregateResult<T> = Pick<IEdge<T>,
    "data" | "style" | "className" | "label" | "type" | "animated" |
    "markerStart" | "markerEnd" | "strokeStyle" | "pathType" | "routing" | "arrows"
>;

export interface ContainerEdgeAggregationOptions<T = any> {
    /** Defaults to "hide", preserving existing container collapse behavior. */
    collapsedContainerEdges?: "hide" | "aggregate";
    /** Called for each directed pair of collapsed containers, even for a single edge. */
    aggregateContainerEdges?: (args: ContainerEdgeAggregateArgs<T>) => ContainerEdgeAggregateResult<T>;
}
