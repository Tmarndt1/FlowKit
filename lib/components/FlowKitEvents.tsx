import * as React from "react";
import { FlowObject, FlowObjectType } from "../types/FlowObject";
import { ContainerChange } from "../types/ContainerChange";
import { EdgeChange } from "../types/EdgeChange";
import { NodeChange } from "../types/NodeChange";
import {
    NodeFlowContext,
    useFlowKitSelection,
} from "../contexts/NodeFlowContext";
import { getFlowObjectIdentity, getFlowObjectType } from "../functions/flowObjectIdentity";

/** Props for the event bridge component that exposes FlowKit interactions. */
export interface FlowKitEventsProps {
    /** Persists container edits and enables container drag/resize interactions. */
    onContainersChange?: (changes: ContainerChange[]) => void;
    /** Receives edge changes and enables built-in connection creation. */
    onEdgesChange?: (changes: EdgeChange[]) => void;
    /** Receives node changes and enables built-in node dragging. */
    onNodesChange?: (changes: NodeChange[]) => void;
}

/** Subscribes to selection changes for components rendered inside FlowKit. */
export function useFlowKitSelectionChange(
    onSelected?: (object: FlowObject, objectType: FlowObjectType) => void,
    onUnselected?: (object: FlowObject, objectType: FlowObjectType) => void,
    onSelectionChange?: (
        selection: FlowObject | null,
        previousSelection: FlowObject | null,
        objectType: FlowObjectType | null,
        previousObjectType: FlowObjectType | null
    ) => void
): void {
    const selected = useFlowKitSelection();
    const previousSelectionRef = React.useRef<FlowObject | null>(null);
    const previousSelectionIdentityRef = React.useRef<string | null>(null);
    const onSelectedRef = React.useRef<typeof onSelected>(onSelected);
    const onUnselectedRef = React.useRef<typeof onUnselected>(onUnselected);
    const onSelectionChangeRef = React.useRef<typeof onSelectionChange>(onSelectionChange);

    onSelectedRef.current = onSelected;
    onUnselectedRef.current = onUnselected;
    onSelectionChangeRef.current = onSelectionChange;

    React.useEffect(() => {
        const previousSelection = previousSelectionRef.current;
        const previousIdentity = previousSelectionIdentityRef.current;
        const selectedIdentity = getFlowObjectIdentity(selected);

        // Reconciliation may replace a selected controlled object with a newer
        // instance. Retain that instance without reporting another selection.
        previousSelectionRef.current = selected;
        previousSelectionIdentityRef.current = selectedIdentity;

        if (previousIdentity === selectedIdentity) return;

        if (previousSelection != null) {
            onUnselectedRef.current?.(previousSelection, getFlowObjectType(previousSelection));
        }

        if (selected != null) {
            onSelectedRef.current?.(selected, getFlowObjectType(selected));
        }

        if (previousSelection != null || selected != null) {
            onSelectionChangeRef.current?.(
                selected,
                previousSelection,
                selected == null ? null : getFlowObjectType(selected),
                previousSelection == null ? null : getFlowObjectType(previousSelection)
            );
        }
    }, [selected]);
}

/** @deprecated Use useFlowKitSelectionChange instead. */
export const useNodeFlowSelectionChange = useFlowKitSelectionChange;

/** Non-visual component that forwards FlowKit interaction events to app callbacks. */
export const FlowKitEvents: React.FC<FlowKitEventsProps> = (props) => {
    const stores = React.useContext(NodeFlowContext);
    const onContainersChangeRef = React.useRef<typeof props.onContainersChange>(props.onContainersChange);
    const onEdgesChangeRef = React.useRef<typeof props.onEdgesChange>(props.onEdgesChange);
    const onNodesChangeRef = React.useRef<typeof props.onNodesChange>(props.onNodesChange);
    const prevSelectedNodeKeysRef = React.useRef<Set<string>>(new Set());
    const prevSelectedEdgeKeysRef = React.useRef<Set<string>>(new Set());
    const prevSelectedContainerKeysRef = React.useRef<Set<string>>(new Set());
    const canChangeNodes = props.onNodesChange != null;
    const canChangeEdges = props.onEdgesChange != null;
    const canChangeContainers = props.onContainersChange != null;

    if (stores == null) {
        throw new Error("FlowKitEvents must be rendered inside FlowKit.");
    }

    onContainersChangeRef.current = props.onContainersChange;
    onEdgesChangeRef.current = props.onEdgesChange;
    onNodesChangeRef.current = props.onNodesChange;

    React.useLayoutEffect(() => {
        const renderStore = stores.render;
        const interactionStore = stores.interaction;
        const selectionStore = stores.selection;
        let lastConnectionVersion = interactionStore.getState().endpointDropRequest?.version ?? 0;
        let lastContainerChangeVersion = renderStore.getState().containerChangeRequest?.version ?? 0;
        let lastNodesChangeVersion = renderStore.getState().nodesChangeRequest?.version ?? 0;

        renderStore.getState().setChangeHandlerAvailability({
            nodes: canChangeNodes,
            edges: canChangeEdges,
            containers: canChangeContainers,
        });

        const unsubscribeInteraction = interactionStore.subscribe((state) => {
            const request = state.endpointDropRequest;

            if (request == null || request.version <= lastConnectionVersion) return;

            lastConnectionVersion = request.version;
            onEdgesChangeRef.current?.([{
                type: "connect",
                sourceId: request.sourceEndpoint.endpoint.id,
                targetId: request.targetId,
            }]);
        });
        const unsubscribeRender = renderStore.subscribe((state) => {
            const containerRequest = state.containerChangeRequest;
            const nodesRequest = state.nodesChangeRequest;

            if (containerRequest != null && containerRequest.version > lastContainerChangeVersion) {
                lastContainerChangeVersion = containerRequest.version;
                onContainersChangeRef.current?.(containerRequest.changes);
            }

            // Callbacks can synchronously publish newer requests. Never replay an
            // older snapshot when a nested store notification returns.
            if (nodesRequest != null && nodesRequest.version > lastNodesChangeVersion) {
                lastNodesChangeVersion = nodesRequest.version;
                onNodesChangeRef.current?.(nodesRequest.changes);
            }
        });
        const unsubscribeSelection = selectionStore.subscribe((state) => {
            const previousNodeKeys = prevSelectedNodeKeysRef.current;
            const previousEdgeKeys = prevSelectedEdgeKeysRef.current;
            const previousContainerKeys = prevSelectedContainerKeysRef.current;
            const nodeChanges: NodeChange[] = [];
            const edgeChanges: EdgeChange[] = [];
            const containerChanges: ContainerChange[] = [];

            state.selectedNodeKeys.forEach((key) => {
                if (!previousNodeKeys.has(key)) nodeChanges.push({ type: "select", key, selected: true });
            });
            previousNodeKeys.forEach((key) => {
                if (!state.selectedNodeKeys.has(key)) nodeChanges.push({ type: "select", key, selected: false });
            });
            state.selectedEdgeKeys.forEach((key) => {
                if (!previousEdgeKeys.has(key)) edgeChanges.push({ type: "select", key, selected: true });
            });
            previousEdgeKeys.forEach((key) => {
                if (!state.selectedEdgeKeys.has(key)) edgeChanges.push({ type: "select", key, selected: false });
            });
            state.selectedContainerKeys.forEach((key) => {
                if (!previousContainerKeys.has(key)) containerChanges.push({ type: "select", key, selected: true });
            });
            previousContainerKeys.forEach((key) => {
                if (!state.selectedContainerKeys.has(key)) containerChanges.push({ type: "select", key, selected: false });
            });

            prevSelectedNodeKeysRef.current = state.selectedNodeKeys;
            prevSelectedEdgeKeysRef.current = state.selectedEdgeKeys;
            prevSelectedContainerKeysRef.current = state.selectedContainerKeys;

            if (nodeChanges.length > 0) onNodesChangeRef.current?.(nodeChanges);
            if (edgeChanges.length > 0) onEdgesChangeRef.current?.(edgeChanges);
            if (containerChanges.length > 0) onContainersChangeRef.current?.(containerChanges);
        });

        return () => {
            unsubscribeInteraction();
            unsubscribeRender();
            unsubscribeSelection();
            renderStore.getState().setChangeHandlerAvailability({
                nodes: false,
                edges: false,
                containers: false,
            });
        };
    }, [
        canChangeContainers,
        canChangeEdges,
        canChangeNodes,
        stores,
    ]);

    return null;
};
