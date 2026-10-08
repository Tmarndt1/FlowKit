import { IConnectionPoint } from "../interfaces/IConnectionPoint";
import { IOffset } from "../interfaces/IOffset";
import { ComputedEdgeRoutingOptions } from "./edgeRouting";
import { getOffset } from "./getBezier";

/** Builds a direct line path between two connection points. */
export function getStraight(
    containerOffset: IOffset,
    source: IConnectionPoint,
    target: IConnectionPoint,
    scale: number,
    routing?: ComputedEdgeRoutingOptions
): string | null {
    const sourcePoint = getOffset(containerOffset, source.offset, scale, source.buffer ?? 0);
    const targetPoint = getOffset(containerOffset, target.offset, scale, target.buffer ?? 0);

    if (sourcePoint == null || targetPoint == null) return null;

    // A straight segment has no interior control points to offset. Translating
    // the whole segment detaches both ends from their resolved anchors, so keep
    // straight paths pinned; floating fan-out happens during anchor resolution.

    return `M ${sourcePoint.x},${sourcePoint.y} L ${targetPoint.x},${targetPoint.y}`;
}
