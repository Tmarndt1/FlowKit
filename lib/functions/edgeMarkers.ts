import { EdgeMarker, IEdge } from "../interfaces/IEdge";

export function hasSourceArrow(edge: IEdge<any>): boolean {
    if (edge.arrows == null || edge.arrows === "none") return false;
    if (edge.arrows === "source" || edge.arrows === "both") return true;
    if (typeof edge.arrows !== "object") return false;

    return edge.arrows.source === true;
}

export function hasTargetArrow(edge: IEdge<any>): boolean {
    if (edge.arrows == null || edge.arrows === "none") return false;
    if (edge.arrows === "target" || edge.arrows === "both") return true;
    if (typeof edge.arrows !== "object") return false;

    return edge.arrows.target === true;
}

const MARKER_IDS: Record<EdgeMarker, string | null> = {
    "arrow":           "flow-kit-marker-arrow",
    "open-arrow":      "flow-kit-marker-open-arrow",
    "hollow-triangle": "flow-kit-marker-hollow-triangle",
    "filled-diamond":  "flow-kit-marker-filled-diamond",
    "hollow-diamond":  "flow-kit-marker-hollow-diamond",
    "none":            null,
};

function markerUrl(marker: EdgeMarker | undefined, prefix?: string): string | undefined {
    if (marker == null) return undefined;
    const id = MARKER_IDS[marker];
    return id != null ? `url(#${prefix == null ? id : `${prefix}-${id}`})` : undefined;
}

/**
 * Resolves the SVG markerStart URL for an edge, preferring the explicit
 * `markerStart` field over the legacy `arrows` prop.
 */
export function resolveMarkerStart(edge: IEdge<any>, prefix?: string): string | undefined {
    if (edge.markerStart != null) return markerUrl(edge.markerStart, prefix);
    return hasSourceArrow(edge) ? markerUrl("arrow", prefix) : undefined;
}

/**
 * Resolves the SVG markerEnd URL for an edge, preferring the explicit
 * `markerEnd` field over the legacy `arrows` prop.
 */
export function resolveMarkerEnd(edge: IEdge<any>, prefix?: string): string | undefined {
    if (edge.markerEnd != null) return markerUrl(edge.markerEnd, prefix);
    return hasTargetArrow(edge) ? markerUrl("arrow", prefix) : undefined;
}
