import { Position } from "../enums/Position";
import { IOffset } from "../interfaces/IOffset";
import { IConnectionPoint } from "../interfaces/IConnectionPoint";

export function getOffset(
    containerOffset: IOffset | null | undefined,
    sourceOffset: IOffset | null | undefined,
    scale: number,
    buffer = 0
): IOffset | null
{
    if (!containerOffset || !sourceOffset || scale === 0)
    {
        return null;
    }

    return {
        x: (sourceOffset.x - containerOffset.x) / scale + buffer / 2,
        y: (sourceOffset.y - containerOffset.y) / scale + buffer / 2
    };
}

function getDirection(position: Position): IOffset
{
    switch (position)
    {
        case Position.Top:
            return { x: 0, y: -1 };

        case Position.Right:
            return { x: 1, y: 0 };

        case Position.Bottom:
            return { x: 0, y: 1 };

        case Position.Left:
            return { x: -1, y: 0 };
    }
}

function clamp(value: number, min: number, max: number): number
{
    return Math.min(Math.max(value, min), max);
}

function getAxisDistance(position: Position, dx: number, dy: number): number
{
    return position === Position.Left || position === Position.Right
        ? Math.abs(dx)
        : Math.abs(dy);
}

function getCrossAxisDistance(position: Position, dx: number, dy: number): number
{
    return position === Position.Left || position === Position.Right
        ? Math.abs(dy)
        : Math.abs(dx);
}

function getHandleLength(
    position: Position,
    oppositePosition: Position,
    direction: IOffset,
    dx: number,
    dy: number,
    distance: number,
    minCurve: number
): number
{
    const sameAxis =
        (position === Position.Left || position === Position.Right) ===
        (oppositePosition === Position.Left || oppositePosition === Position.Right);
    const axisDistance = getAxisDistance(position, dx, dy);
    const crossAxisDistance = getCrossAxisDistance(position, dx, dy);
    const forwardDistance = dx * direction.x + dy * direction.y;

    if (!sameAxis)
    {
        return clamp(distance * 0.32, minCurve, 180);
    }

    if (forwardDistance >= 0)
    {
        return clamp(axisDistance * 0.5 + crossAxisDistance * 0.12, minCurve, 220);
    }

    return clamp(minCurve + crossAxisDistance * 0.22, minCurve, 180);
}

export function getBezier(
    containerOffset: IOffset,
    source: IConnectionPoint,
    target: IConnectionPoint,
    scale: number,
    minCurve = 80
): string | null
{
    const sourcePoint = getOffset(
        containerOffset,
        source.offset,
        scale,
        source.buffer ?? 0
    );

    const targetPoint = getOffset(
        containerOffset,
        target.offset,
        scale,
        target.buffer ?? 0
    );

    if (!sourcePoint || !targetPoint)
    {
        return null;
    }

    const sourceDirection = getDirection(source.position);
    const targetDirection = getDirection(target.position);

    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const sourceCurve = getHandleLength(
        source.position,
        target.position,
        sourceDirection,
        dx,
        dy,
        distance,
        minCurve
    );
    const targetCurve = getHandleLength(
        target.position,
        source.position,
        targetDirection,
        -dx,
        -dy,
        distance,
        minCurve
    );

    const sourceControl = {
        x: sourcePoint.x + sourceDirection.x * sourceCurve,
        y: sourcePoint.y + sourceDirection.y * sourceCurve
    };

    const targetControl = {
        x: targetPoint.x + targetDirection.x * targetCurve,
        y: targetPoint.y + targetDirection.y * targetCurve
    };

    return `
        M ${sourcePoint.x},${sourcePoint.y}
        C ${sourceControl.x},${sourceControl.y}
          ${targetControl.x},${targetControl.y}
          ${targetPoint.x},${targetPoint.y}
    `;
}
