import { Position } from "../enums/Position";
import { IConnectionPoint } from "../interfaces/IConnectionPoint";
import { IOffset } from "../interfaces/IOffset";
import { getOffset } from "./getBezier";
import {
    avoidObstacles,
    ComputedEdgeRoutingOptions,
    offsetInteriorPoints,
    removeCollinearPoints,
    removeDuplicatePoints,
} from "./edgeRouting";

function move(point: IOffset, position: Position, amount: number): IOffset {
    switch (position) {
        case Position.Top:
            return { x: point.x, y: point.y - amount };
        case Position.Right:
            return { x: point.x + amount, y: point.y };
        case Position.Bottom:
            return { x: point.x, y: point.y + amount };
        case Position.Left:
            return { x: point.x - amount, y: point.y };
    }
}

function isHorizontal(position: Position): boolean {
    return position === Position.Left || position === Position.Right;
}

function getStepPoints(
    source: IOffset,
    target: IOffset,
    sourcePosition: Position,
    targetPosition: Position
): IOffset[] {
    const sourceHorizontal = isHorizontal(sourcePosition);
    const targetHorizontal = isHorizontal(targetPosition);

    if (sourceHorizontal && targetHorizontal) {
        const midX = source.x + (target.x - source.x) / 2;

        return [
            { x: midX, y: source.y },
            { x: midX, y: target.y }
        ];
    }

    if (!sourceHorizontal && !targetHorizontal) {
        const midY = source.y + (target.y - source.y) / 2;

        return [
            { x: source.x, y: midY },
            { x: target.x, y: midY }
        ];
    }

    return sourceHorizontal
        ? [{ x: target.x, y: source.y }]
        : [{ x: source.x, y: target.y }];
}

function getRoutePoints(
    sourcePoint: IOffset,
    targetPoint: IOffset,
    sourcePosition: Position,
    targetPosition: Position,
    offset: number
): IOffset[] {
    const sourceHorizontal = isHorizontal(sourcePosition);
    const targetHorizontal = isHorizontal(targetPosition);
    const sourceStub = move(sourcePoint, sourcePosition, offset);
    const targetStub = move(targetPoint, targetPosition, offset);

    if (sourceHorizontal && targetHorizontal) {
        const sourceDirection = sourcePosition === Position.Right ? 1 : -1;
        const targetAheadOfSource = (targetStub.x - sourceStub.x) * sourceDirection >= 0;

        if (targetAheadOfSource) {
            const midX = sourceStub.x + (targetStub.x - sourceStub.x) / 2;

            return [
                sourcePoint,
                sourceStub,
                { x: midX, y: sourceStub.y },
                { x: midX, y: targetStub.y },
                targetStub,
                targetPoint
            ];
        }

        const midY = sourceStub.y + (targetStub.y - sourceStub.y) / 2;

        return [
            sourcePoint,
            sourceStub,
            { x: sourceStub.x, y: midY },
            { x: targetStub.x, y: midY },
            targetStub,
            targetPoint
        ];
    }

    if (!sourceHorizontal && !targetHorizontal) {
        const sourceDirection = sourcePosition === Position.Bottom ? 1 : -1;
        const targetAheadOfSource = (targetStub.y - sourceStub.y) * sourceDirection >= 0;

        if (targetAheadOfSource) {
            const midY = sourceStub.y + (targetStub.y - sourceStub.y) / 2;

            return [
                sourcePoint,
                sourceStub,
                { x: sourceStub.x, y: midY },
                { x: targetStub.x, y: midY },
                targetStub,
                targetPoint
            ];
        }

        const midX = sourceStub.x + (targetStub.x - sourceStub.x) / 2;

        return [
            sourcePoint,
            sourceStub,
            { x: midX, y: sourceStub.y },
            { x: midX, y: targetStub.y },
            targetStub,
            targetPoint
        ];
    }

    return [
        sourcePoint,
        sourceStub,
        ...getStepPoints(sourceStub, targetStub, sourcePosition, targetPosition),
        targetStub,
        targetPoint
    ];
}

function shortenCorner(from: IOffset, corner: IOffset, radius: number): IOffset {
    const dx = corner.x - from.x;
    const dy = corner.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const amount = Math.min(radius, length / 2);

    if (length === 0) return corner;

    return {
        x: corner.x - (dx / length) * amount,
        y: corner.y - (dy / length) * amount
    };
}

function extendCorner(corner: IOffset, to: IOffset, radius: number): IOffset {
    const dx = to.x - corner.x;
    const dy = to.y - corner.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const amount = Math.min(radius, length / 2);

    if (length === 0) return corner;

    return {
        x: corner.x + (dx / length) * amount,
        y: corner.y + (dy / length) * amount
    };
}

function toRoundedPath(points: IOffset[], radius: number): string {
    const [start, ...rest] = points;
    const commands = [`M ${start.x},${start.y}`];

    rest.forEach((point, index) => {
        const previous = points[index];
        const next = points[index + 2];

        if (next == null) {
            commands.push(`L ${point.x},${point.y}`);
            return;
        }

        const before = shortenCorner(previous, point, radius);
        const after = extendCorner(point, next, radius);

        commands.push(`L ${before.x},${before.y}`);
        commands.push(`Q ${point.x},${point.y} ${after.x},${after.y}`);
    });

    return commands.join(" ");
}

export function getSmoothStep(
    containerOffset: IOffset,
    source: IConnectionPoint,
    target: IConnectionPoint,
    scale: number,
    offset = 32,
    radius = 14,
    routing?: ComputedEdgeRoutingOptions
): string | null {
    const sourcePoint = getOffset(containerOffset, source.offset, scale, source.buffer ?? 0);
    const targetPoint = getOffset(containerOffset, target.offset, scale, target.buffer ?? 0);

    if (sourcePoint == null || targetPoint == null) return null;

    const basePoints = removeCollinearPoints(removeDuplicatePoints(
        getRoutePoints(sourcePoint, targetPoint, source.position, target.position, offset)
    ));
    const offsetPoints = offsetInteriorPoints(basePoints, routing?.parallelOffset ?? 0);
    const points = removeCollinearPoints(removeDuplicatePoints(
        routing?.avoidNodes ? avoidObstacles(offsetPoints, routing.obstacles) : offsetPoints
    ));

    return toRoundedPath(points, routing?.avoidNodes ? Math.max(radius, 22) : radius);
}
