import { createStore, StoreApi } from "zustand/vanilla";
import { IEdge } from "../interfaces/IEdge";
import { IEndpoint } from "../interfaces/IEndpoint";
import { INode } from "../interfaces/INode";
import { INodeContainer } from "../interfaces/INodeContainer";
import { IOffset } from "../interfaces/IOffset";
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
    containers: INodeContainer[];
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
    draggingNode: boolean;
    draggedNode: INode<any, any> | null;
    sourceEndpoint: SourceEndpoint | null;
    endpointDropRequest: EndpointDropRequest | null;
    setDraggingNode: (draggingNode: boolean, node?: INode<any, any> | null) => void;
    setSourceEndpoint: (sourceEndpoint: SourceEndpoint | null) => void;
    dropEndpoint: (targetId: string) => void;
}

export interface NodeFlowSelectionState {
    selectedNode: INode<any, any> | null;
    selectedEdge: IEdge<any> | null;
    selectNode: (node: INode<any, any> | null) => void;
    selectEdge: (edge: IEdge<any> | null) => void;
    clearSelection: () => void;
}

export interface NodeFlowRenderState {
    containerChangeRequest: ContainerChangeRequest | null;
    endpointUpdate: EndpointUpdate | null;
    edgeRenderRequest: EdgeRenderRequest | null;
    hasContainerChangeListener: boolean;
    notifyEndpointsChanged: (endpoints: IEndpoint<any>[]) => void;
    requestContainersChange: (containers: INodeContainer[]) => void;
    requestEdgeRender: (edge: IEdge<any>) => void;
    setHasContainerChangeListener: (hasContainerChangeListener: boolean) => void;
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
        draggingNode: false,
        draggedNode: null,
        sourceEndpoint: null,
        endpointDropRequest: null,
        setDraggingNode: (draggingNode, node = null) => {
            const draggedNode = draggingNode ? node : null;

            if (get().draggingNode === draggingNode && get().draggedNode === draggedNode) return;

            set({ draggingNode, draggedNode });
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

export function createNodeFlowSelectionStore(): NodeFlowSelectionStore {
    return createStore<NodeFlowSelectionState>((set, get) => ({
        selectedNode: null,
        selectedEdge: null,
        selectNode: (node) => {
            if (get().selectedNode?.key === node?.key && get().selectedEdge == null) return;
            set({ selectedNode: node, selectedEdge: null });
        },
        selectEdge: (edge) => {
            if (get().selectedEdge?.key === edge?.key && get().selectedNode == null) return;
            set({ selectedEdge: edge, selectedNode: null });
        },
        clearSelection: () => {
            if (get().selectedNode == null && get().selectedEdge == null) return;
            set({ selectedNode: null, selectedEdge: null });
        },
    }));
}

export function createNodeFlowRenderStore(): NodeFlowRenderStore {
    return createStore<NodeFlowRenderState>((set, get) => ({
        containerChangeRequest: null,
        endpointUpdate: null,
        edgeRenderRequest: null,
        hasContainerChangeListener: false,
        notifyEndpointsChanged: (endpoints) =>
            set({
                endpointUpdate: {
                    endpoints,
                    version: (get().endpointUpdate?.version ?? 0) + 1,
                },
            }),
        requestContainersChange: (containers) =>
            set({
                containerChangeRequest: {
                    containers,
                    version: (get().containerChangeRequest?.version ?? 0) + 1,
                },
            }),
        requestEdgeRender: (edge) =>
            set({
                edgeRenderRequest: {
                    edgeKey: edge.key,
                    version: (get().edgeRenderRequest?.version ?? 0) + 1,
                },
            }),
        setHasContainerChangeListener: (hasContainerChangeListener) => {
            if (get().hasContainerChangeListener === hasContainerChangeListener) return;
            set({ hasContainerChangeListener });
        },
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
