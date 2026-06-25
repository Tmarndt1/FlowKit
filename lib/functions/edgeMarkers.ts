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

function markerUrl(marker: EdgeMarker | undefined): string | undefined {
    if (marker == null) return undefined;
    const id = MARKER_IDS[marker];
    return id != null ? `url(#${id})` : undefined;
}

/**
 * Resolves the SVG markerStart URL for an edge, preferring the explicit
 * `markerStart` field over the legacy `arrows` prop.
 */
export function resolveMarkerStart(edge: IEdge<any>): string | undefined {
    if (edge.markerStart != null) return markerUrl(edge.markerStart);
    return hasSourceArrow(edge) ? `url(#${MARKER_IDS["arrow"]})` : undefined;
}

/**
 * Resolves the SVG markerEnd URL for an edge, preferring the explicit
 * `markerEnd` field over the legacy `arrows` prop.
 */
export function resolveMarkerEnd(edge: IEdge<any>): string | undefined {
    if (edge.markerEnd != null) return markerUrl(edge.markerEnd);
    return hasTargetArrow(edge) ? `url(#${MARKER_IDS["arrow"]})` : undefined;
}
