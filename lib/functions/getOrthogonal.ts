import { Position } from "../enums/Position";
import { IOffset } from "../interfaces/IOffset";
import { IConnectionPoint } from "../interfaces/IConnectionPoint";
import {
    avoidObstacles,
    ComputedEdgeRoutingOptions,
    offsetInteriorPoints,
    removeCollinearPoints,
    removeDuplicatePoints,
} from "./edgeRouting";

export function getOrthogonal(
    containerOffset: IOffset | null | undefined,
    source: IConnectionPoint,
    target: IConnectionPoint,
    scale: number,
    offset = 32,
    routing?: ComputedEdgeRoutingOptions
): string | null
{
    if (containerOffset == null || scale === 0)
    {
        return null;
    }

    const sourcePoint = normalizePoint(containerOffset, source.offset, scale);
    const targetPoint = normalizePoint(containerOffset, target.offset, scale);

    const sourceStub = move(sourcePoint, source.position, offset);
    const targetStub = move(targetPoint, target.position, offset);

    const points: IOffset[] = [
        sourcePoint,
        sourceStub,
        ...getStepPoints(sourceStub, targetStub, source.position, target.position),
        targetStub,
        targetPoint
    ];
    const offsetPoints = offsetInteriorPoints(removeDuplicatePoints(points), routing?.parallelOffset ?? 0);
    const routedPoints = routing?.avoidNodes
        ? avoidObstacles(offsetPoints, routing.obstacles)
        : offsetPoints;

    return toPath(removeCollinearPoints(removeDuplicatePoints(routedPoints)));
}

function normalizePoint(
    containerOffset: IOffset,
    point: IOffset,
    scale: number
): IOffset
{
    return {
        x: (point.x - containerOffset.x) / scale,
        y: (point.y - containerOffset.y) / scale
    };
}

function move(
    point: IOffset,
    position: Position,
    amount: number
): IOffset
{
    switch (position)
    {
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

function getStepPoints(
    source: IOffset,
    target: IOffset,
    sourcePosition: Position,
    targetPosition: Position
): IOffset[]
{
    const sourceHorizontal = isHorizontal(sourcePosition);
    const targetHorizontal = isHorizontal(targetPosition);

    if (sourceHorizontal && targetHorizontal)
    {
        const midX = source.x + (target.x - source.x) / 2;

        return [
            { x: midX, y: source.y },
            { x: midX, y: target.y }
        ];
    }

    if (!sourceHorizontal && !targetHorizontal)
    {
        const midY = source.y + (target.y - source.y) / 2;

        return [
            { x: source.x, y: midY },
            { x: target.x, y: midY }
        ];
    }

    if (sourceHorizontal)
    {
        return [
            { x: target.x, y: source.y }
        ];
    }

    return [
        { x: source.x, y: target.y }
    ];
}

function isHorizontal(position: Position): boolean
{
    return position === Position.Left || position === Position.Right;
}

function toPath(points: IOffset[]): string
{
    const [start, ...rest] = points;

    return [
        `M ${start.x},${start.y}`,
        ...rest.map((point) => `L ${point.x},${point.y}`)
    ].join(" ");
}
