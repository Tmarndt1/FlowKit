import type { INode, IEdge } from "../../../lib";

/** Create a plain node with no endpoints (floating edge connections). */
export function makeNode(key: string, type: string, x: number, y: number, data?: unknown): INode {
    return { key, type, offset: { x, y }, endpoints: [], data } as unknown as INode;
}

/** Create a floating edge connecting two nodes by key. */
export function makeEdge(key: string, sourceId: string, targetId: string, extra?: Partial<IEdge>): IEdge {
    return { key, type: "edge", sourceId, targetId, anchorMode: "floating", ...extra } as unknown as IEdge;
}
