import * as React from "react";
import { FlowElement } from "../types/FlowElement";
import { ContainerChange } from "../types/ContainerChange";
import { EdgeChange } from "../types/EdgeChange";
import { NodeChange } from "../types/NodeChange";
import {
    useNodeFlowInteractionStore,
    useNodeFlowRenderStore,
    useNodeFlowSelection,
    useNodeFlowSelectionStore,
} from "../contexts/NodeFlowContext";

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
export function useNodeFlowSelectionChange(
    onSelected?: (element: FlowElement) => void,
    onUnselected?: (element: FlowElement) => void,
    onSelectionChange?: (selection: FlowElement | null, previousSelection: FlowElement | null) => void
): void {
    const selected = useNodeFlowSelection();
    const previousSelectionRef = React.useRef<FlowElement | null>(null);
    const onSelectedRef = React.useRef<typeof onSelected>(onSelected);
    const onUnselectedRef = React.useRef<typeof onUnselected>(onUnselected);
    const onSelectionChangeRef = React.useRef<typeof onSelectionChange>(onSelectionChange);

    onSelectedRef.current = onSelected;
    onUnselectedRef.current = onUnselected;
    onSelectionChangeRef.current = onSelectionChange;

    React.useEffect(() => {
        const previousSelection = previousSelectionRef.current;

        if (previousSelection === selected) return;

        if (previousSelection != null && selected == null) {
            onUnselectedRef.current?.(previousSelection);
        }

        if (selected != null && previousSelection !== selected) {
            onSelectedRef.current?.(selected);
        }

        if (previousSelection != null || selected != null) {
            onSelectionChangeRef.current?.(selected, previousSelection);
        }

        previousSelectionRef.current = selected;
    }, [selected]);
}

/** Non-visual component that forwards FlowKit interaction events to app callbacks. */
export const FlowKitEvents: React.FC<FlowKitEventsProps> = (props) => {
    const endpointDropRequest = useNodeFlowInteractionStore((state) => state.endpointDropRequest);
    const containerChangeRequest = useNodeFlowRenderStore((state) => state.containerChangeRequest);
    const nodesChangeRequest = useNodeFlowRenderStore((state) => state.nodesChangeRequest);
    const setChangeHandlerAvailability = useNodeFlowRenderStore(
        (state) => state.setChangeHandlerAvailability
    );
    const selectedNodeKeys = useNodeFlowSelectionStore((state) => state.selectedNodeKeys);
    const selectedEdgeKeys = useNodeFlowSelectionStore((state) => state.selectedEdgeKeys);
    const onContainersChangeRef = React.useRef<typeof props.onContainersChange>(props.onContainersChange);
    const onEdgesChangeRef = React.useRef<typeof props.onEdgesChange>(props.onEdgesChange);
    const onNodesChangeRef = React.useRef<typeof props.onNodesChange>(props.onNodesChange);
    const lastConnectionVersionRef = React.useRef<number>(0);
    const lastContainerChangeVersionRef = React.useRef<number>(0);
    const lastNodesChangeVersionRef = React.useRef<number>(0);
    const prevSelectedNodeKeysRef = React.useRef<Set<string>>(new Set());
    const prevSelectedEdgeKeysRef = React.useRef<Set<string>>(new Set());
    const canChangeNodes = props.onNodesChange != null;
    const canChangeEdges = props.onEdgesChange != null;
    const canChangeContainers = props.onContainersChange != null;

    onContainersChangeRef.current = props.onContainersChange;
    onEdgesChangeRef.current = props.onEdgesChange;
    onNodesChangeRef.current = props.onNodesChange;

    React.useEffect(() => {
        setChangeHandlerAvailability({
            nodes: canChangeNodes,
            edges: canChangeEdges,
            containers: canChangeContainers,
        });

        return () => {
            setChangeHandlerAvailability({ nodes: false, edges: false, containers: false });
        };
    }, [
        canChangeContainers,
        canChangeEdges,
        canChangeNodes,
        setChangeHandlerAvailability,
    ]);

    React.useEffect(() => {
        if (endpointDropRequest == null) return;
        if (endpointDropRequest.version === lastConnectionVersionRef.current) return;

        lastConnectionVersionRef.current = endpointDropRequest.version;
        onEdgesChangeRef.current?.([{
            type: "connect",
            sourceId: endpointDropRequest.sourceEndpoint.endpoint.id,
            targetId: endpointDropRequest.targetId,
        }]);
    }, [endpointDropRequest]);

    React.useEffect(() => {
        if (containerChangeRequest == null) return;
        if (containerChangeRequest.version === lastContainerChangeVersionRef.current) return;

        lastContainerChangeVersionRef.current = containerChangeRequest.version;
        onContainersChangeRef.current?.(containerChangeRequest.changes);
    }, [containerChangeRequest]);

    React.useEffect(() => {
        if (nodesChangeRequest == null) return;
        if (nodesChangeRequest.version === lastNodesChangeVersionRef.current) return;

        lastNodesChangeVersionRef.current = nodesChangeRequest.version;
        onNodesChangeRef.current?.(nodesChangeRequest.changes);
    }, [nodesChangeRequest]);

    React.useEffect(() => {
        const prev = prevSelectedNodeKeysRef.current;
        const changes: NodeChange[] = [];

        selectedNodeKeys.forEach((key) => {
            if (!prev.has(key)) changes.push({ type: "select", key, selected: true });
        });
        prev.forEach((key) => {
            if (!selectedNodeKeys.has(key)) changes.push({ type: "select", key, selected: false });
        });

        prevSelectedNodeKeysRef.current = selectedNodeKeys;

        if (changes.length > 0) onNodesChangeRef.current?.(changes);
    }, [selectedNodeKeys]);

    React.useEffect(() => {
        const prev = prevSelectedEdgeKeysRef.current;
        const changes: EdgeChange[] = [];

        selectedEdgeKeys.forEach((key) => {
            if (!prev.has(key)) changes.push({ type: "select", key, selected: true });
        });
        prev.forEach((key) => {
            if (!selectedEdgeKeys.has(key)) changes.push({ type: "select", key, selected: false });
        });

        prevSelectedEdgeKeysRef.current = selectedEdgeKeys;

        if (changes.length > 0) onEdgesChangeRef.current?.(changes);
    }, [selectedEdgeKeys]);

    return null;
};
