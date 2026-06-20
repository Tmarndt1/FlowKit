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

    const parallelOffset = routing?.parallelOffset ?? 0;

    if (parallelOffset !== 0) {
        const dx = targetPoint.x - sourcePoint.x;
        const dy = targetPoint.y - sourcePoint.y;
        const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const offsetX = (-dy / length) * parallelOffset;
        const offsetY = (dx / length) * parallelOffset;

        sourcePoint.x += offsetX;
        sourcePoint.y += offsetY;
        targetPoint.x += offsetX;
        targetPoint.y += offsetY;
    }

    return `M ${sourcePoint.x},${sourcePoint.y} L ${targetPoint.x},${targetPoint.y}`;
}
