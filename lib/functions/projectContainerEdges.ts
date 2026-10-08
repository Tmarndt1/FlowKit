import type { IEdge } from "../interfaces/IEdge";
import type { INodeContainer } from "../interfaces/INodeContainer";
import type { ContainerEdgeAggregationOptions, RenderedEdgeAnchor } from "../types/ContainerEdgeAggregation";

/** Projects eligible original edges onto visible collapsed container boundaries. */
export function projectContainerEdges(
    edges: IEdge<any>[],
    containers: INodeContainer[] | undefined,
    nodeKeyByConnectionId: ReadonlyMap<string, string>,
    options: ContainerEdgeAggregationOptions
): IEdge<any>[] {
    const containerByNode = new Map<string, INodeContainer>();
    containers?.filter((container) => container.collapsed).forEach((container) => {
        container.nodeKeys.forEach((key) => {
            // Overlapping membership uses the first collapsed container in array order.
            if (!containerByNode.has(key)) containerByNode.set(key, container);
        });
    });
    const result: IEdge<any>[] = [];
    const groups = new Map<string, { source: INodeContainer; target: INodeContainer; edges: IEdge<any>[] }>();
    const usedKeys = new Set(edges.map((edge) => edge.key));

    for (const edge of edges) {
        const sourceContainer = containerByNode.get(nodeKeyByConnectionId.get(edge.sourceId) ?? "");
        const targetContainer = containerByNode.get(nodeKeyByConnectionId.get(edge.targetId) ?? "");
        if (sourceContainer == null && targetContainer == null) {
            result.push(edge);
            continue;
        }
        if (sourceContainer != null && sourceContainer === targetContainer) continue;
        if (sourceContainer != null && targetContainer != null) {
            const pair = JSON.stringify([sourceContainer.key, targetContainer.key]);
            const group = groups.get(pair) ?? { source: sourceContainer, target: targetContainer, edges: [] };
            group.edges.push(edge);
            groups.set(pair, group);
            continue;
        }
        const anchor = (id: string, container?: INodeContainer): RenderedEdgeAnchor => container != null
            ? { kind: "container", key: container.key }
            : edge.anchorMode === "floating" ? { kind: "node", key: id } : { kind: "endpoint", id };
        result.push({
            ...edge,
            renderInfo: {
                source: anchor(edge.sourceId, sourceContainer),
                target: anchor(edge.targetId, targetContainer),
                originalEdgeKeys: [edge.key],
            },
        });
    }
    groups.forEach(({ source, target, edges: originals }, pair) => {
        let key = `flow-kit-container-edge:${pair}`;
        while (usedKeys.has(key)) key += ":";
        usedKeys.add(key);
        result.push({
            type: "edge",
            label: `${originals.length} connection${originals.length === 1 ? "" : "s"}`,
            ...options.aggregateContainerEdges?.({ sourceContainer: source, targetContainer: target, edges: originals }),
            key,
            sourceId: source.key,
            targetId: target.key,
            collapsed: false,
            collapsible: false,
            renderInfo: {
                source: { kind: "container", key: source.key },
                target: { kind: "container", key: target.key },
                originalEdgeKeys: originals.map((edge) => edge.key),
            },
        });
    });
    return result;
}
