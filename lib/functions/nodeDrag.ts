import { IOffset } from "../interfaces/IOffset";

/** Calculates an immutable node preview position for a drag delta. */
export function getNodeDragOffset(
    start: IOffset,
    delta: IOffset,
    snap?: { enabled: boolean; size: number }
): IOffset {
    let x = start.x + delta.x;
    let y = start.y + delta.y;

    if (snap?.enabled && snap.size > 0) {
        x = Math.round(x / snap.size) * snap.size;
        y = Math.round(y / snap.size) * snap.size;
    }

    return { x: Math.round(x), y: Math.round(y) };
}
