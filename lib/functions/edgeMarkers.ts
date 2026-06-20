import { IEdge } from "../interfaces/IEdge";

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
