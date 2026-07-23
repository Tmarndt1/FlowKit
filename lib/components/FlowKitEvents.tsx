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
    /** Called with normalized change descriptors when containers are moved, resized, or have membership changes. */
    onContainersChange?: (changes: ContainerChange[]) => void;
    /** Called when built-in interactions connect or select edges. */
    onEdgesChange?: (changes: EdgeChange[]) => void;
    /** Called when built-in interactions reposition, resize, or select nodes. */
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

    onContainersChangeRef.current = props.onContainersChange;
    onEdgesChangeRef.current = props.onEdgesChange;
    onNodesChangeRef.current = props.onNodesChange;

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
