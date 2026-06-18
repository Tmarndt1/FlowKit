import { Position } from "../enums/Position";

export function getEndpointPosition(element: HTMLElement): Position | null
{
    const position = element.dataset.position;

    if (position == null)
    {
        return null;
    }

    const parsed = Number(position);

    return Number.isNaN(parsed)
        ? null
        : parsed as Position;
}

export function getOppositePosition(position: Position): Position
{
    switch (position)
    {
        case Position.Top:
            return Position.Bottom;

        case Position.Right:
            return Position.Left;

        case Position.Bottom:
            return Position.Top;

        case Position.Left:
            return Position.Right;
    }
}