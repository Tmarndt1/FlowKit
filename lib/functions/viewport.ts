import { IOffset } from "../interfaces/IOffset";

/** Calculates the viewport translation that centers a node at a requested scale. */
export function getPanToNodeOffset(
    viewport: { width: number; height: number },
    nodeOffset: IOffset,
    nodeSize: { width: number; height: number },
    scale: number
): IOffset {
    return {
        x: viewport.width / 2 - (nodeOffset.x + nodeSize.width / 2) * scale,
        y: viewport.height / 2 - (nodeOffset.y + nodeSize.height / 2) * scale,
    };
}
