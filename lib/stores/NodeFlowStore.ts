import { createStore, StoreApi } from "zustand/vanilla";
import { IEdge } from "../interfaces/IEdge";
import { IEndpoint } from "../interfaces/IEndpoint";
import { INode } from "../interfaces/INode";
import { INodeContainer } from "../interfaces/INodeContainer";
import { IOffset } from "../interfaces/IOffset";
import { ContainerChange } from "../types/ContainerChange";
import { NodeChange } from "../types/NodeChange";
import { Nullable } from "../types/Nullable";

export interface EndpointUpdate {
    endpoints: IEndpoint<any>[];
    version: number;
}

export interface EdgeRenderRequest {
    edgeKey: string;
    version: number;
}

export interface ContainerChangeRequest {
    changes: ContainerChange[];
    version: number;
}

export interface NodesChangeRequest {
    changes: NodeChange[];
    version: number;
}

export type SourceEndpoint = { endpoint: IEndpoint<any>; offset: IOffset };

export interface EndpointDropRequest {
    sourceEndpoint: SourceEndpoint;
    targetId: string;
    version: number;
}

export interface NodeFlowViewportState {
    containerRect: Nullable<DOMRect>;
    offset: IOffset;
    scale: number;
    setContainerRect: (containerRect: Nullable<DOMRect>) => void;
    setOffset: (offset: IOffset) => void;
    setScale: (scale: number) => void;
}

export interface NodeFlowInteractionState {
    dragUpdateVersion: number;
    draggingNode: boolean;
    draggedNode: INode<any, any> | null;
    sourceEndpoint: SourceEndpoint | null;
    endpointDropRequest: EndpointDropRequest | null;
    notifyNodeDrag: () => void;
    setDraggingNode: (draggingNode: boolean, node?: INode<any, any> | null) => void;
    setSourceEndpoint: (sourceEndpoint: SourceEndpoint | null) => void;
    dropEndpoint: (targetId: string) => void;
}

export interface NodeFlowSelectionState {
    /** Primary (most recently selected) node, or null. Kept for single-selection consumers. */
    selectedNode: INode<any, any> | null;
    /** Primary (most recently selected) edge, or null. Kept for single-selection consumers. */
    selectedEdge: IEdge<any> | null;
    /** All currently selected nodes, in selection order. */
    selectedNodes: INode<any, any>[];
    /** All currently selected edges, in selection order. */
    selectedEdges: IEdge<any>[];
    /** Fast membership lookup for selected node keys. */
    selectedNodeKeys: Set<string>;
    /** Fast membership lookup for selected edge keys. */
    selectedEdgeKeys: Set<string>;
    /** Replaces the selection with a single node (or clears it when null). */
    selectNode: (node: INode<any, any> | null) => void;
    /** Replaces the selection with a single edge (or clears it when null). */
    selectEdge: (edge: IEdge<any> | null) => void;
    /** Adds or removes a node from the current selection without affecting edges. */
    toggleNode: (node: INode<any, any>) => void;
    /** Adds or removes an edge from the current selection without affecting nodes. */
    toggleEdge: (edge: IEdge<any>) => void;
    /** Replaces the selection with the provided nodes and edges. */
    setSelection: (nodes: INode<any, any>[], edges?: IEdge<any>[]) => void;
    /** Merges the provided nodes and edges into the current selection. */
    addToSelection: (nodes: INode<any, any>[], edges?: IEdge<any>[]) => void;
    /** Refreshes selected objects from the latest controlled node and edge arrays. */
    reconcileSelection: (nodes: INode<any, any>[], edges: IEdge<any>[]) => void;
    /** Clears all selected nodes and edges. */
    clearSelection: () => void;
}

export interface NodeFlowRenderState {
    containerChangeRequest: ContainerChangeRequest | null;
    nodesChangeRequest: NodesChangeRequest | null;
    endpointUpdate: EndpointUpdate | null;
    edgeRenderRequest: EdgeRenderRequest | null;
    notifyEndpointsChanged: (endpoints: IEndpoint<any>[]) => void;
    requestContainersChange: (changes: ContainerChange[]) => void;
    requestNodesChange: (changes: NodeChange[]) => void;
    requestEdgeRender: (edge: IEdge<any>) => void;
}

export interface NodeFlowSnapState {
    containers: boolean;
    enabled: boolean;
    size: number;
    setSnapOptions: (options: Partial<Pick<NodeFlowSnapState, "containers" | "enabled" | "size">>) => void;
}

export type NodeFlowViewportStore = StoreApi<NodeFlowViewportState>;
export type NodeFlowInteractionStore = StoreApi<NodeFlowInteractionState>;
export type NodeFlowSelectionStore = StoreApi<NodeFlowSelectionState>;
export type NodeFlowRenderStore = StoreApi<NodeFlowRenderState>;
export type NodeFlowSnapStore = StoreApi<NodeFlowSnapState>;

export interface NodeFlowStores {
    viewport: NodeFlowViewportStore;
    interaction: NodeFlowInteractionStore;
    selection: NodeFlowSelectionStore;
    render: NodeFlowRenderStore;
    snap: NodeFlowSnapStore;
}

export function createNodeFlowViewportStore(): NodeFlowViewportStore {
    return createStore<NodeFlowViewportState>((set, get) => ({
        containerRect: null,
        offset: { x: 0, y: 0 },
        scale: 1,
        setContainerRect: (containerRect) => {
            if (get().containerRect === containerRect) return;
            set({ containerRect });
        },
        setOffset: (offset) => {
            const currentOffset = get().offset;

            if (currentOffset.x === offset.x && currentOffset.y === offset.y) return;

            set({ offset });
        },
        setScale: (scale) => {
            if (get().scale === scale) return;
            set({ scale });
        },
    }));
}

export function createNodeFlowInteractionStore(): NodeFlowInteractionStore {
    return createStore<NodeFlowInteractionState>((set, get) => ({
        dragUpdateVersion: 0,
        draggingNode: false,
        draggedNode: null,
        sourceEndpoint: null,
        endpointDropRequest: null,
        notifyNodeDrag: () => {
            set({ dragUpdateVersion: get().dragUpdateVersion + 1 });
        },
        setDraggingNode: (draggingNode, node = null) => {
            const draggedNode = draggingNode ? node : null;

            if (get().draggingNode === draggingNode && get().draggedNode === draggedNode) return;

            set({
                draggingNode,
                draggedNode,
                dragUpdateVersion: get().dragUpdateVersion + 1,
            });
        },
        setSourceEndpoint: (sourceEndpoint) => {
            if (get().sourceEndpoint === sourceEndpoint) return;
            set({ sourceEndpoint });
        },
        dropEndpoint: (targetId) => {
            const sourceEndpoint = get().sourceEndpoint;

            if (sourceEndpoint == null) return;

            set({
                sourceEndpoint: null,
                endpointDropRequest: {
                    sourceEndpoint,
                    targetId,
                    version: (get().endpointDropRequest?.version ?? 0) + 1,
                },
            });
        },
    }));
}

function buildSelection(
    nodes: INode<any, any>[],
    edges: IEdge<any>[]
): Pick<
    NodeFlowSelectionState,
    "selectedNode" | "selectedEdge" | "selectedNodes" | "selectedEdges" | "selectedNodeKeys" | "selectedEdgeKeys"
> {
    return {
        selectedNodes: nodes,
        selectedEdges: edges,
        selectedNodeKeys: new Set(nodes.map((node) => node.key)),
        selectedEdgeKeys: new Set(edges.map((edge) => edge.key)),
        selectedNode: nodes.length > 0 ? nodes[nodes.length - 1] : null,
        selectedEdge: edges.length > 0 ? edges[edges.length - 1] : null,
    };
}

function mergeByKey<T extends { key: string }>(existing: T[], additions: T[]): T[] {
    if (additions.length < 1) return existing;

    const byKey = new Map<string, T>();

    for (const item of existing) byKey.set(item.key, item);
    for (const item of additions) byKey.set(item.key, item);

    return Array.from(byKey.values());
}

export function createNodeFlowSelectionStore(): NodeFlowSelectionStore {
    return createStore<NodeFlowSelectionState>((set, get) => ({
        selectedNode: null,
        selectedEdge: null,
        selectedNodes: [],
        selectedEdges: [],
        selectedNodeKeys: new Set<string>(),
        selectedEdgeKeys: new Set<string>(),
        selectNode: (node) => {
            const current = get();

            if (
                current.selectedEdges.length === 0 &&
                current.selectedNodes.length === (node == null ? 0 : 1) &&
                (node == null || current.selectedNodeKeys.has(node.key))
            ) return;

            set(buildSelection(node == null ? [] : [node], []));
        },
        selectEdge: (edge) => {
            const current = get();

            if (
                current.selectedNodes.length === 0 &&
                current.selectedEdges.length === (edge == null ? 0 : 1) &&
                (edge == null || current.selectedEdgeKeys.has(edge.key))
            ) return;

            set(buildSelection([], edge == null ? [] : [edge]));
        },
        toggleNode: (node) => {
            const current = get();
            const nextNodes = current.selectedNodeKeys.has(node.key)
                ? current.selectedNodes.filter((selected) => selected.key !== node.key)
                : [...current.selectedNodes, node];

            set(buildSelection(nextNodes, current.selectedEdges));
        },
        toggleEdge: (edge) => {
            const current = get();
            const nextEdges = current.selectedEdgeKeys.has(edge.key)
                ? current.selectedEdges.filter((selected) => selected.key !== edge.key)
                : [...current.selectedEdges, edge];

            set(buildSelection(current.selectedNodes, nextEdges));
        },
        setSelection: (nodes, edges = []) => {
            set(buildSelection(nodes, edges));
        },
        addToSelection: (nodes, edges = []) => {
            const current = get();

            set(buildSelection(
                mergeByKey(current.selectedNodes, nodes),
                mergeByKey(current.selectedEdges, edges)
            ));
        },
        reconcileSelection: (nodes, edges) => {
            const current = get();
            const nodesByKey = new Map(nodes.map((node) => [node.key, node]));
            const edgesByKey = new Map(edges.map((edge) => [edge.key, edge]));
            const nextNodes = current.selectedNodes
                .map((node) => nodesByKey.get(node.key))
                .filter((node): node is INode<any, any> => node != null);
            const nextEdges = current.selectedEdges
                .map((edge) => edgesByKey.get(edge.key))
                .filter((edge): edge is IEdge<any> => edge != null);
            const unchanged =
                nextNodes.length === current.selectedNodes.length &&
                nextEdges.length === current.selectedEdges.length &&
                nextNodes.every((node, index) => node === current.selectedNodes[index]) &&
                nextEdges.every((edge, index) => edge === current.selectedEdges[index]);

            if (!unchanged) set(buildSelection(nextNodes, nextEdges));
        },
        clearSelection: () => {
            if (get().selectedNodes.length === 0 && get().selectedEdges.length === 0) return;
            set(buildSelection([], []));
        },
    }));
}

export function createNodeFlowRenderStore(): NodeFlowRenderStore {
    return createStore<NodeFlowRenderState>((set, get) => ({
        containerChangeRequest: null,
        nodesChangeRequest: null,
        endpointUpdate: null,
        edgeRenderRequest: null,
        notifyEndpointsChanged: (endpoints) =>
            set({
                endpointUpdate: {
                    endpoints,
                    version: (get().endpointUpdate?.version ?? 0) + 1,
                },
            }),
        requestContainersChange: (changes) =>
            set({
                containerChangeRequest: {
                    changes,
                    version: (get().containerChangeRequest?.version ?? 0) + 1,
                },
            }),
        requestNodesChange: (changes) =>
            set({
                nodesChangeRequest: {
                    changes,
                    version: (get().nodesChangeRequest?.version ?? 0) + 1,
                },
            }),
        requestEdgeRender: (edge) =>
            set({
                edgeRenderRequest: {
                    edgeKey: edge.key,
                    version: (get().edgeRenderRequest?.version ?? 0) + 1,
                },
            }),
    }));
}

export function createNodeFlowSnapStore(): NodeFlowSnapStore {
    return createStore<NodeFlowSnapState>((set, get) => ({
        containers: false,
        enabled: false,
        size: 24,
        setSnapOptions: (options) => {
            const current = get();
            const containers = options.containers ?? current.containers;
            const enabled = options.enabled ?? current.enabled;
            const size = Math.max(1, options.size ?? current.size);

            if (
                current.containers === containers &&
                current.enabled === enabled &&
                current.size === size
            ) return;

            set({ containers, enabled, size });
        },
    }));
}

export function createNodeFlowStores(): NodeFlowStores {
    return {
        viewport: createNodeFlowViewportStore(),
        interaction: createNodeFlowInteractionStore(),
        selection: createNodeFlowSelectionStore(),
        render: createNodeFlowRenderStore(),
        snap: createNodeFlowSnapStore(),
    };
}
