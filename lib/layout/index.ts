export type { LayoutNode, LayoutEdge, LayoutResult } from "./types";
export type { HierarchicalDirection, HierarchicalOptions } from "./hierarchical";
export type { ForceOptions } from "./force";
export type { PlacementOptions } from "./placement";

export { hierarchicalLayout } from "./hierarchical";
export { forceLayout } from "./force";
export { placeConnected, findFreePosition } from "./placement";
export { buildAdjacency, topoRanks } from "./graph";

import { INode } from "../interfaces/INode";
import { IEdge } from "../interfaces/IEdge";
import { LayoutEdge, LayoutNode, LayoutResult } from "./types";

/**
 * Converts FlowKit nodes to LayoutNodes. Measures rendered size from the DOM
 * when width/height are not provided, falling back to 0.
 */
export function toLayoutNodes(nodes: INode<any, any>[]): LayoutNode[] {
    return nodes.map((node) => {
        const el = document.getElementById(node.key);
        return {
            key: node.key,
            x: node.x,
            y: node.y,
            width: el?.offsetWidth ?? 0,
            height: el?.offsetHeight ?? 0,
        };
    });
}

/** Converts FlowKit edges to LayoutEdges (floating edges use node keys directly). */
export function toLayoutEdges(edges: IEdge<any>[]): LayoutEdge[] {
    return edges.map((edge) => ({
        sourceId: edge.sourceId,
        targetId: edge.targetId,
    }));
}

/** Merges layout results back into a node array by updating x/y. */
export function applyLayout(
    nodes: INode<any, any>[],
    results: LayoutResult[]
): INode<any, any>[] {
    const resultMap = new Map(results.map((r) => [r.key, r]));
    return nodes.map((node) => {
        const r = resultMap.get(node.key);
        return r ? { ...node, x: r.x, y: r.y } : node;
    });
}
