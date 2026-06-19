import { EdgeCollapseMode, IEdge } from "../interfaces/IEdge";
import { INode } from "../interfaces/INode";
import { INodeContainer } from "../interfaces/INodeContainer";

/** Collapse-preview input used by getFoldGraphState. */
export interface IFoldGraphPreview {
    /** Edge whose collapse mode is being previewed. */
    edge: IEdge<any>;
    /** Previewed collapse mode, or null when no preview is active. */
    mode: EdgeCollapseMode | null;
}

/** Derived graph state for rendering folded and previewed nodes/edges. */
export interface IFoldGraphState {
    /** State classes to apply to rendered edge groups, keyed by edge key. */
    edgeStateClassNames: Map<string, string>;
    /** Node keys hidden by currently collapsed edges. */
    hiddenNodeKeys: Set<string>;
    /** State classes to apply to rendered node wrappers, keyed by node key. */
    nodeStateClassNames: Map<string, string>;
    /** Edge keys affected by the current collapse preview. */
    previewEdgeKeys: Set<string>;
    /** Node keys affected by the current collapse preview. */
    previewNodeKeys: Set<string>;
    /** Containers with hidden node keys filtered out. */
    visibleContainers?: INodeContainer[];
    /** Edges remaining visible after collapsed graph sections are removed. */
    visibleEdges: IEdge<any>[];
}

function joinClassNames(...classNames: Array<string | undefined>): string {
    return classNames.filter(Boolean).join(" ");
}

function getNodeKeyByConnectionId(nodes: INode<any, any>[]): Map<string, string> {
    const map = new Map<string, string>();

    nodes.forEach((node) => {
        map.set(node.key, node.key);
        node.endpoints.forEach((endpoint) => map.set(endpoint.id, node.key));
    });

    return map;
}

function getEdgeNodeKeys(edge: IEdge<any>, nodeKeyByConnectionId: Map<string, string>): {
    sourceNodeKey?: string;
    targetNodeKey?: string;
} {
    const sourceNodeKey = edge.anchorMode === "floating"
        ? edge.sourceNodeId ?? nodeKeyByConnectionId.get(edge.sourceId)
        : nodeKeyByConnectionId.get(edge.sourceId);
    const targetNodeKey = edge.anchorMode === "floating"
        ? edge.targetNodeId ?? nodeKeyByConnectionId.get(edge.targetId)
        : nodeKeyByConnectionId.get(edge.targetId);

    return { sourceNodeKey, targetNodeKey };
}

function walkGraph(startKey: string, adjacency: Map<string, string[]>): Set<string> {
    const visited = new Set<string>();
    const queue = [startKey];

    while (queue.length > 0) {
        const nodeKey = queue.shift();

        if (nodeKey == null || visited.has(nodeKey)) continue;

        visited.add(nodeKey);

        adjacency.get(nodeKey)?.forEach((nextKey) => {
            if (!visited.has(nextKey)) queue.push(nextKey);
        });
    }

    return visited;
}

function addAffectedNodeKeys(
    affectedNodeKeys: Set<string>,
    edge: IEdge<any>,
    mode: EdgeCollapseMode,
    nodeKeyByConnectionId: Map<string, string>,
    outgoing: Map<string, string[]>,
    incoming: Map<string, string[]>
): void {
    const { sourceNodeKey, targetNodeKey } = getEdgeNodeKeys(edge, nodeKeyByConnectionId);

    if ((mode === "downstream" || mode === "both") && targetNodeKey != null) {
        walkGraph(targetNodeKey, outgoing).forEach((nodeKey) => affectedNodeKeys.add(nodeKey));
    }

    if ((mode === "upstream" || mode === "both") && sourceNodeKey != null) {
        walkGraph(sourceNodeKey, incoming).forEach((nodeKey) => affectedNodeKeys.add(nodeKey));
    }
}

/**
 * Derives fold visibility and preview classes from controlled edge collapse state.
 * Apps usually let FlowKit call this internally, but advanced renderers can use it
 * to mirror FlowKit's upstream/downstream/both traversal behavior.
 */
export function getFoldGraphState(
    nodes: INode<any, any>[],
    edges: IEdge<any>[],
    containers: INodeContainer[] | undefined,
    preview: IFoldGraphPreview | null
): IFoldGraphState {
    const nodeKeyByConnectionId = getNodeKeyByConnectionId(nodes);
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    const collapsedAnchorEdges = new Set<string>();
    const hiddenNodeKeys = new Set<string>();
    const previewNodeKeys = new Set<string>();
    const previewEdgeKeys = new Set<string>();

    nodes.forEach((node) => {
        outgoing.set(node.key, []);
        incoming.set(node.key, []);
    });

    edges.forEach((edge) => {
        const { sourceNodeKey, targetNodeKey } = getEdgeNodeKeys(edge, nodeKeyByConnectionId);

        if (sourceNodeKey == null || targetNodeKey == null) return;

        outgoing.get(sourceNodeKey)?.push(targetNodeKey);
        incoming.get(targetNodeKey)?.push(sourceNodeKey);
    });

    edges.forEach((edge) => {
        if (edge.collapsed !== true) return;

        collapsedAnchorEdges.add(edge.key);
        addAffectedNodeKeys(
            hiddenNodeKeys,
            edge,
            edge.collapseMode ?? "edge",
            nodeKeyByConnectionId,
            outgoing,
            incoming
        );
    });

    if (preview != null && preview.mode != null) {
        previewEdgeKeys.add(preview.edge.key);
        addAffectedNodeKeys(previewNodeKeys, preview.edge, preview.mode, nodeKeyByConnectionId, outgoing, incoming);
    }

    const nodeStateClassNames = new Map<string, string>();

    nodes.forEach((node) => {
        const hidden = hiddenNodeKeys.has(node.key);
        const previewed = previewNodeKeys.has(node.key);
        const className = joinClassNames(
            previewed && !hidden ? "flow-kit-node-fold-preview" : undefined,
            hidden ? "flow-kit-node-fold-hidden" : undefined
        );

        if (className.length > 0) nodeStateClassNames.set(node.key, className);
    });

    const visibleEdges = edges.filter((edge) => {
        if (collapsedAnchorEdges.has(edge.key)) return true;

        const { sourceNodeKey, targetNodeKey } = getEdgeNodeKeys(edge, nodeKeyByConnectionId);

        return (
            sourceNodeKey != null &&
            targetNodeKey != null &&
            !hiddenNodeKeys.has(sourceNodeKey) &&
            !hiddenNodeKeys.has(targetNodeKey)
        );
    });
    const edgeStateClassNames = new Map<string, string>();

    visibleEdges.forEach((edge) => {
        const { sourceNodeKey, targetNodeKey } = getEdgeNodeKeys(edge, nodeKeyByConnectionId);
        const previewed =
            previewEdgeKeys.has(edge.key) ||
            (sourceNodeKey != null && previewNodeKeys.has(sourceNodeKey)) ||
            (targetNodeKey != null && previewNodeKeys.has(targetNodeKey));

        if (previewed) edgeStateClassNames.set(edge.key, "flow-kit-edge-fold-preview");
    });

    return {
        edgeStateClassNames,
        hiddenNodeKeys,
        nodeStateClassNames,
        previewEdgeKeys,
        previewNodeKeys,
        visibleContainers: containers?.map((container) => ({
            ...container,
            nodeKeys: container.nodeKeys.filter((nodeKey) => !hiddenNodeKeys.has(nodeKey)),
        })),
        visibleEdges,
    };
}
