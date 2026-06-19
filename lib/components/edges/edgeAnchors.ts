import { Position } from "../../enums/Position";
import { getEndpointPosition } from "../../functions/getEndpointPosition";
import { IConnectionPoint } from "../../interfaces/IConnectionPoint";
import { IEdge } from "../../interfaces/IEdge";

/** Pair of concrete source/target anchors resolved from an edge definition. */
export interface IResolvedEdgeAnchors {
    /** Source anchor used by path builders. */
    source: IConnectionPoint;
    /** Target anchor used by path builders. */
    target: IConnectionPoint;
}

function getRectCenter(rect: DOMRect): { x: number; y: number } {
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function getFloatingAnchor(rect: DOMRect, toward: { x: number; y: number }): IConnectionPoint {
    const center = getRectCenter(rect);
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    const dx = toward.x - center.x;
    const dy = toward.y - center.y;

    if (dx === 0 && dy === 0) {
        return {
            offset: { x: center.x + halfWidth, y: center.y },
            position: Position.Right
        };
    }

    if (Math.abs(dx) / Math.max(halfWidth, 1) > Math.abs(dy) / Math.max(halfHeight, 1)) {
        const direction = dx >= 0 ? 1 : -1;

        return {
            offset: {
                x: center.x + direction * halfWidth,
                y: center.y + dy * (halfWidth / Math.max(Math.abs(dx), 1))
            },
            position: direction > 0 ? Position.Right : Position.Left
        };
    }

    const direction = dy >= 0 ? 1 : -1;

    return {
        offset: {
            x: center.x + dx * (halfHeight / Math.max(Math.abs(dy), 1)),
            y: center.y + direction * halfHeight
        },
        position: direction > 0 ? Position.Bottom : Position.Top
    };
}

// Floating edges attach to the side of each node that faces the other node.
// Endpoint edges keep using fixed endpoint elements and their declared positions.
export function resolveEdgeAnchors(edge: IEdge<any>): IResolvedEdgeAnchors | null {
    if (edge.anchorMode === "floating") {
        const sourceElement = document.getElementById(edge.sourceNodeId ?? edge.sourceId);
        const targetElement = document.getElementById(edge.targetNodeId ?? edge.targetId);

        if (sourceElement == null || targetElement == null) return null;

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const sourceCenter = getRectCenter(sourceRect);
        const targetCenter = getRectCenter(targetRect);

        return {
            source: getFloatingAnchor(sourceRect, targetCenter),
            target: getFloatingAnchor(targetRect, sourceCenter)
        };
    }

    const sourceElement = document.getElementById(edge.sourceId);
    const targetElement = document.getElementById(edge.targetId);

    if (sourceElement == null || targetElement == null) return null;

    const sourcePosition = getEndpointPosition(sourceElement);
    const targetPosition = getEndpointPosition(targetElement);

    if (sourcePosition == null || targetPosition == null) return null;

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    return {
        source: {
            offset: {
                x: sourceRect.left,
                y: sourceRect.top
            },
            position: sourcePosition,
            buffer: sourceRect.width
        },
        target: {
            offset: {
                x: targetRect.left,
                y: targetRect.top
            },
            position: targetPosition,
            buffer: targetRect.width
        }
    };
}
