import { LayoutNode, LayoutResult } from "./types";

export interface PlacementOptions {
    /** Spacing to add around placed nodes when searching for a free position. Default 20. */
    padding?: number;
}

function overlaps(ax: number, ay: number, aw: number, ah: number, b: LayoutNode, padding: number): boolean {
    return (
        ax < b.x + b.width + padding &&
        ax + aw + padding > b.x &&
        ay < b.y + b.height + padding &&
        ay + ah + padding > b.y
    );
}

/**
 * Places `node` near a connected peer, offset by the node's dimensions + padding.
 * Returns null if no peers are present or their positions are unknown.
 */
export function placeConnected(
    node: LayoutNode,
    connectedKeys: string[],
    placed: Map<string, LayoutNode>
): LayoutResult | null {
    for (const key of connectedKeys) {
        const peer = placed.get(key);
        if (peer == null) continue;
        return { key: node.key, x: peer.x + peer.width + 60, y: peer.y };
    }
    return null;
}

/**
 * Finds the first free grid position that does not overlap any already-placed node.
 * Scans left-to-right, top-to-bottom in a configurable grid step.
 */
export function findFreePosition(
    node: LayoutNode,
    placed: Map<string, LayoutNode>,
    options: PlacementOptions = {}
): LayoutResult {
    const padding = options.padding ?? 20;
    const stepX = node.width + padding;
    const stepY = node.height + padding;

    for (let row = 0; row < 1000; row++) {
        for (let col = 0; col < 100; col++) {
            const cx = col * stepX;
            const cy = row * stepY;
            const free = ![...placed.values()].some((p) => overlaps(cx, cy, node.width, node.height, p, padding));
            if (free) return { key: node.key, x: cx, y: cy };
        }
    }

    return { key: node.key, x: 0, y: 0 };
}
