import * as React from "react";
import { useStore } from "zustand/react";
import { StoreApi } from "zustand/vanilla";
import { FlowElement } from "../types/FlowElement";
import {
    NodeFlowInteractionState,
    NodeFlowRenderState,
    NodeFlowSelectionState,
    NodeFlowSnapState,
    NodeFlowStores,
    NodeFlowViewportState,
} from "../stores/NodeFlowStore";

export const NodeFlowContext = React.createContext<NodeFlowStores | null>(null);

function useNodeFlowStore<TStoreState, T>(
    storeSelector: (stores: NodeFlowStores) => StoreApi<TStoreState>,
    selector: (state: TStoreState) => T
): T {
    const stores = React.useContext(NodeFlowContext);

    if (stores == null) {
        throw new Error("NodeFlow components must be rendered inside a NodeFlow.");
    }

    return useStore(storeSelector(stores), selector);
}

export function useNodeFlowViewportStore<T>(selector: (state: NodeFlowViewportState) => T): T {
    return useNodeFlowStore((stores) => stores.viewport, selector);
}

export function useNodeFlowInteractionStore<T>(selector: (state: NodeFlowInteractionState) => T): T {
    return useNodeFlowStore((stores) => stores.interaction, selector);
}

export function useNodeFlowSelectionStore<T>(selector: (state: NodeFlowSelectionState) => T): T {
    return useNodeFlowStore((stores) => stores.selection, selector);
}

export function useNodeFlowRenderStore<T>(selector: (state: NodeFlowRenderState) => T): T {
    return useNodeFlowStore((stores) => stores.render, selector);
}

export function useNodeFlowSnapStore<T>(selector: (state: NodeFlowSnapState) => T): T {
    return useNodeFlowStore((stores) => stores.snap, selector);
}

export function useNodeFlowSelection(): FlowElement | null {
    return useNodeFlowSelectionStore((state) => state.selectedNode ?? state.selectedEdge ?? null);
}
