import * as React from "react";
import { useStore } from "zustand/react";
import { StoreApi } from "zustand/vanilla";
import { FlowObject } from "../types/FlowObject";
import { IEdge } from "../interfaces/IEdge";
import { INode } from "../interfaces/INode";
import { INodeContainer } from "../interfaces/INodeContainer";
import {
    NodeFlowInteractionState,
    NodeFlowRenderState,
    NodeFlowSelectionState,
    NodeFlowSnapState,
    NodeFlowStores,
    NodeFlowViewportState,
} from "../stores/NodeFlowStore";

export const NodeFlowContext = React.createContext<NodeFlowStores | null>(null);

function useFlowKitStore<TStoreState, T>(
    storeSelector: (stores: NodeFlowStores) => StoreApi<TStoreState>,
    selector: (state: TStoreState) => T
): T {
    const stores = React.useContext(NodeFlowContext);

    if (stores == null) {
        throw new Error("NodeFlow components must be rendered inside a NodeFlow.");
    }

    return useStore(storeSelector(stores), selector);
}

export function useFlowKitViewportStore<T>(selector: (state: NodeFlowViewportState) => T): T {
    return useFlowKitStore((stores) => stores.viewport, selector);
}

export function useFlowKitInteractionStore<T>(selector: (state: NodeFlowInteractionState) => T): T {
    return useFlowKitStore((stores) => stores.interaction, selector);
}

export function useFlowKitSelectionStore<T>(selector: (state: NodeFlowSelectionState) => T): T {
    return useFlowKitStore((stores) => stores.selection, selector);
}

export function useFlowKitRenderStore<T>(selector: (state: NodeFlowRenderState) => T): T {
    return useFlowKitStore((stores) => stores.render, selector);
}

export function useFlowKitSnapStore<T>(selector: (state: NodeFlowSnapState) => T): T {
    return useFlowKitStore((stores) => stores.snap, selector);
}

export function useFlowKitSelection(): FlowObject | null {
    return useFlowKitSelectionStore(
        (state) => state.selectedNode ?? state.selectedEdge ?? state.selectedContainer ?? null
    );
}

export function useFlowKitSelectedNodes(): INode<any, any>[] {
    return useFlowKitSelectionStore((state) => state.selectedNodes);
}

export function useFlowKitSelectedEdges(): IEdge<any>[] {
    return useFlowKitSelectionStore((state) => state.selectedEdges);
}

export function useFlowKitSelectedContainers(): INodeContainer[] {
    return useFlowKitSelectionStore((state) => state.selectedContainers);
}

/** @deprecated Use useFlowKitSelection instead. */
export const useNodeFlowSelection = useFlowKitSelection;
/** @deprecated Use useFlowKitSelectedNodes instead. */
export const useNodeFlowSelectedNodes = useFlowKitSelectedNodes;
/** @deprecated Use useFlowKitSelectedEdges instead. */
export const useNodeFlowSelectedEdges = useFlowKitSelectedEdges;
/** @deprecated Use useFlowKitSelectedContainers instead. */
export const useNodeFlowSelectedContainers = useFlowKitSelectedContainers;
