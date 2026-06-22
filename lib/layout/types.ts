/** Minimal node descriptor consumed by layout algorithms. */
export interface LayoutNode {
    key: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Minimal edge descriptor consumed by layout algorithms. */
export interface LayoutEdge {
    sourceId: string;
    targetId: string;
}

/** Position result produced by a layout algorithm. */
export interface LayoutResult {
    key: string;
    x: number;
    y: number;
}
