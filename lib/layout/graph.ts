import { LayoutEdge, LayoutNode } from "./types";

export interface Adjacency {
    outgoing: Map<string, string[]>;
    incoming: Map<string, string[]>;
}

export function buildAdjacency(nodes: LayoutNode[], edges: LayoutEdge[]): Adjacency {
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    const keys = new Set(nodes.map((n) => n.key));

    for (const node of nodes) {
        outgoing.set(node.key, []);
        incoming.set(node.key, []);
    }

    for (const edge of edges) {
        if (!keys.has(edge.sourceId) || !keys.has(edge.targetId)) continue;
        outgoing.get(edge.sourceId)!.push(edge.targetId);
        incoming.get(edge.targetId)!.push(edge.sourceId);
    }

    return { outgoing, incoming };
}

/**
 * Assigns each node a rank equal to the length of the longest path from any
 * source node. Cycles are broken by ignoring back-edges (nodes in a cycle
 * that never reach in-degree 0 keep rank 0).
 */
export function topoRanks(nodes: LayoutNode[], edges: LayoutEdge[]): Map<string, number> {
    const { outgoing, incoming } = buildAdjacency(nodes, edges);
    const ranks = new Map(nodes.map((n) => [n.key, 0]));
    const remaining = new Map(nodes.map((n) => [n.key, (incoming.get(n.key) ?? []).length]));
    const queue = nodes.filter((n) => (remaining.get(n.key) ?? 0) === 0).map((n) => n.key);

    while (queue.length > 0) {
        const key = queue.shift()!;
        const rank = ranks.get(key) ?? 0;

        for (const neighbor of outgoing.get(key) ?? []) {
            ranks.set(neighbor, Math.max(ranks.get(neighbor) ?? 0, rank + 1));
            const rem = (remaining.get(neighbor) ?? 1) - 1;
            remaining.set(neighbor, rem);
            if (rem <= 0) queue.push(neighbor);
        }
    }

    return ranks;
}
