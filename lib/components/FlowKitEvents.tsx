import * as React from "react";
import { IConnection } from "../interfaces/IConnection";
import { INodeContainer } from "../interfaces/INodeContainer";
import { FlowElement } from "../types/FlowElement";
import {
    useNodeFlowInteractionStore,
    useNodeFlowRenderStore,
    useNodeFlowSelection,
} from "./NodeFlowContext";

interface IProps {
    onConnect?: (connection: IConnection) => any;
    onContainersChange?: (containers: INodeContainer[]) => any;
    onSelected?: (element: FlowElement) => void;
    onSelectionChange?: (selection: FlowElement | null, previousSelection: FlowElement | null) => void;
    onUnselected?: (element: FlowElement) => void;
}

export function useNodeFlowSelectionChange(
    onSelected?: (element: FlowElement) => void,
    onUnselected?: (element: FlowElement) => void,
    onSelectionChange?: (selection: FlowElement | null, previousSelection: FlowElement | null) => void
): void {
    const selected = useNodeFlowSelection();
    const previousSelectionRef = React.useRef<FlowElement | null>(null);
    const onSelectedRef = React.useRef(onSelected);
    const onUnselectedRef = React.useRef(onUnselected);
    const onSelectionChangeRef = React.useRef(onSelectionChange);

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

export const FlowKitEvents: React.FC<IProps> = (props) => {
    const endpointDropRequest = useNodeFlowInteractionStore((state) => state.endpointDropRequest);
    const containerChangeRequest = useNodeFlowRenderStore((state) => state.containerChangeRequest);
    const setHasContainerChangeListener = useNodeFlowRenderStore(
        (state) => state.setHasContainerChangeListener
    );
    const onConnectRef = React.useRef(props.onConnect);
    const onContainersChangeRef = React.useRef(props.onContainersChange);
    const lastConnectionVersionRef = React.useRef<number>(0);
    const lastContainerChangeVersionRef = React.useRef<number>(0);

    useNodeFlowSelectionChange(props.onSelected, props.onUnselected, props.onSelectionChange);

    onConnectRef.current = props.onConnect;
    onContainersChangeRef.current = props.onContainersChange;

    React.useEffect(() => {
        const hasListener = props.onContainersChange != null;

        setHasContainerChangeListener(hasListener);

        return () => {
            setHasContainerChangeListener(false);
        };
    }, [props.onContainersChange, setHasContainerChangeListener]);

    React.useEffect(() => {
        if (endpointDropRequest == null) return;
        if (endpointDropRequest.version === lastConnectionVersionRef.current) return;

        lastConnectionVersionRef.current = endpointDropRequest.version;
        onConnectRef.current?.({
            sourceId: endpointDropRequest.sourceEndpoint.endpoint.id,
            targetId: endpointDropRequest.targetId,
        });
    }, [endpointDropRequest]);

    React.useEffect(() => {
        if (containerChangeRequest == null) return;
        if (containerChangeRequest.version === lastContainerChangeVersionRef.current) return;

        lastContainerChangeVersionRef.current = containerChangeRequest.version;
        onContainersChangeRef.current?.(containerChangeRequest.containers);
    }, [containerChangeRequest]);

    return null;
};
