import * as React from "react";

/** Controls which arrow markers FlowKit renders on the edge path. */
export type EdgeArrow = "both" | "none" | "source" | "target";

/** Selects whether an edge connects fixed endpoints or floats against node bounds. */
export type EdgeAnchorMode = "endpoint" | "floating";

/** Determines what part of the graph is folded when a collapsible edge is collapsed. */
export type EdgeCollapseMode = "edge" | "downstream" | "upstream" | "both";

/** Built-in SVG path algorithms supported by default edges and drawn connection previews. */
export type EdgePathType = "bezier" | "smooth-step" | "step";

/** Built-in route shaping options for default edges. */
export interface EdgeRoutingOptions {
    /** Route orthogonal/smooth-step edges around rendered node bounds when possible. */
    avoidNodes?: boolean;
    /** Pixel spacing used to fan out multiple edges between the same node pair. */
    parallelOffset?: number;
}

/** Describes a connection between two endpoint elements or two node bounds. */
export interface IEdge<T> {
    /** Stable edge identifier. Also used as the rendered SVG group id. */
    key: string;
    /** Target endpoint id, or target node key when anchorMode is "floating". */
    targetId: string;
    /** Source endpoint id, or source node key when anchorMode is "floating". */
    sourceId: string;
    /** Edge renderer key. Use "edge" for the built-in renderer. */
    type: string;
    /**
     * Use "floating" to connect node bounds instead of fixed endpoint elements.
     * In floating mode, sourceId and targetId may be node keys, or sourceNodeId
     * and targetNodeId can be supplied explicitly.
     */
    anchorMode?: EdgeAnchorMode;
    /** Arrow placement for the built-in edge renderer. */
    arrows?: EdgeArrow | {
        source?: boolean;
        target?: boolean;
    };
    /** Overrides the global animatedEdges option for this edge. */
    animated?: boolean;
    /** Additional class applied to the rendered edge group. */
    className?: string;
    /** Optional text rendered near the midpoint of the built-in edge path. */
    label?: string;
    /** Controlled collapse state. Consumers persist this from onEdgeCollapsedChange. */
    collapsed?: boolean;
    /** Controlled collapse mode. Only meaningful when collapsed is true. */
    collapseMode?: EdgeCollapseMode;
    /** Overrides the global collapsibleEdges option for this edge. */
    collapsible?: boolean;
    /** Application payload passed through to custom edge renderers. */
    data?: T;
    /** Overrides the global edgePathType option for this edge. */
    pathType?: EdgePathType;
    /** Overrides global built-in route shaping for this edge. */
    routing?: EdgeRoutingOptions;
    /** Explicit source node key for floating edges whose sourceId is still an endpoint id. */
    sourceNodeId?: string;
    /** Inline styles applied to the built-in visible path. */
    style?: React.CSSProperties;
    /** Explicit target node key for floating edges whose targetId is still an endpoint id. */
    targetNodeId?: string;
}
