import { LayoutEdge, LayoutNode, LayoutResult } from "./types";
import { buildAdjacency, topoRanks } from "./graph";

export type HierarchicalDirection = "LR" | "TB";

export interface HierarchicalOptions {
    /** Distance between rank columns/rows. Default 200. */
    rankSpacing?: number;
    /** Distance between nodes within a rank. Default 80. */
    nodeSpacing?: number;
    /** Layout direction. Default "LR". */
    direction?: HierarchicalDirection;
}

function barycenterOrder(keys: string[], position: Map<string, number>): string[] {
    return [...keys].sort((a, b) => {
        const pa = position.get(a) ?? 0;
        const pb = position.get(b) ?? 0;
        return pa - pb;
    });
}

export function hierarchicalLayout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    options: HierarchicalOptions = {}
): LayoutResult[] {
    const rankSpacing = options.rankSpacing ?? 200;
    const nodeSpacing = options.nodeSpacing ?? 80;
    const direction = options.direction ?? "LR";
    const LR = direction === "LR";

    const ranks = topoRanks(nodes, edges);
    const { incoming } = buildAdjacency(nodes, edges);

    // Group keys by rank
    const byRank = new Map<number, string[]>();

    for (const node of nodes) {
        const rank = ranks.get(node.key) ?? 0;
        if (!byRank.has(rank)) byRank.set(rank, []);
        byRank.get(rank)!.push(node.key);
    }

    const sortedRanks = [...byRank.keys()].sort((a, b) => a - b);
    const position = new Map<string, number>();

    // Assign initial positions within each rank using barycenter heuristic
    for (const rank of sortedRanks) {
        const rankKeys = byRank.get(rank)!;
        const ordered = barycenterOrder(rankKeys, position);
        ordered.forEach((key, i) => position.set(key, i));
        byRank.set(rank, ordered);
    }

    // Compute per-rank max primary dimension for offset
    const nodeByKey = new Map(nodes.map((n) => [n.key, n]));
    const rankOffset: number[] = [];
    let cursor = 0;

    for (const rank of sortedRanks) {
        rankOffset[rank] = cursor;
        const maxPrimary = Math.max(
            ...byRank.get(rank)!.map((k) => {
                const n = nodeByKey.get(k);
                return LR ? (n?.width ?? 0) : (n?.height ?? 0);
            })
        );
        cursor += maxPrimary + rankSpacing;
    }

    // Place nodes
    const results: LayoutResult[] = [];

    for (const rank of sortedRanks) {
        const rankKeys = byRank.get(rank)!;
        const primary = rankOffset[rank];

        let secondary = 0;

        for (let i = 0; i < rankKeys.length; i++) {
            const key = rankKeys[i];
            const n = nodeByKey.get(key);
            const secondarySize = LR ? (n?.height ?? 0) : (n?.width ?? 0);

            results.push({
                key,
                x: LR ? primary : secondary,
                y: LR ? secondary : primary,
            });

            secondary += secondarySize + nodeSpacing;
        }

        // Center rank around y=0 (or x=0 for TB)
        const rankResults = results.slice(results.length - rankKeys.length);
        const mid = secondary / 2;
        for (const r of rankResults) {
            if (LR) r.y -= mid;
            else r.x -= mid;
        }
    }

    return results;
}
