import * as React from "react";
import { IEdge } from "../interfaces/IEdge";
import { IEndpoint } from "../interfaces/IEndpoint";
import { INode } from "../interfaces/INode";
import { FlowElement } from "../types/FlowElement";
import { useNodeFlowSelectionStore } from "../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../contexts/FlowKitConfigContext";

/** Props for built-in keyboard shortcuts scoped to the current FlowKit selection. */
export interface FlowKitKeyboardCommandsProps {
    /** Enable Ctrl/Cmd+C behavior. Defaults to true. */
    copy?: boolean;
    /** Enable Backspace deletion behavior. Defaults to true. */
    deleteSelection?: boolean;
    /** Current edges, used to discover edges connected to deleted nodes. */
    edges: IEdge<any>[];
    /** Current nodes, used to validate selected-node deletion. */
    nodes: INode<any, any>[];
    /** Called after a selected element is copied to the internal clipboard. */
    onCopy?: (element: FlowElement) => any;
    /** Called when paste is requested and an element exists in the internal clipboard. */
    onPaste?: (element: FlowElement) => any;
    /** Called when Backspace requests removal of a selected node or edge. */
    onRemove?: (node: INode<any, any> | null, edges: IEdge<any>[]) => any;
    /** Enable Ctrl/Cmd+V behavior. Defaults to true. */
    paste?: boolean;
}

/** Non-visual component that wires default copy, paste, and delete shortcuts. */
export const FlowKitKeyboardCommands: React.FC<FlowKitKeyboardCommandsProps> = (props) => {
    const { readOnly } = useFlowKitConfig();
    const selectedEdge = useNodeFlowSelectionStore((state) => state.selectedEdge);
    const selectedNode = useNodeFlowSelectionStore((state) => state.selectedNode);
    const copyRef = React.useRef<FlowElement | null>(null);
    const propsRef = React.useRef(props);
    const selectionRef = React.useRef({ selectedEdge, selectedNode });

    propsRef.current = props;
    selectionRef.current = { selectedEdge, selectedNode };

    const onKeyDown = React.useCallback((e: KeyboardEvent): void => {
        const currentProps = propsRef.current;
        const currentSelectionState = selectionRef.current;
        const key: number = e.which || e.keyCode;
        const ctrl: boolean = e.ctrlKey ? e.ctrlKey : key === 17 ? true : false;

        if (!readOnly && key === 86 && ctrl && currentProps.paste !== false) {
            if (currentProps.onPaste != null && copyRef.current != null) {
                currentProps.onPaste(copyRef.current);
            }

            return;
        }

        const selectedObj: FlowElement | null =
            currentSelectionState.selectedNode ?? currentSelectionState.selectedEdge ?? null;

        if (selectedObj == null) return;

        if (key === 67 && ctrl && currentProps.copy !== false) {
            copyRef.current = selectedObj;
            currentProps.onCopy?.(copyRef.current);
            return;
        }

        if (!readOnly && e.key?.toLocaleLowerCase() === "backspace" && currentProps.deleteSelection !== false) {
            if (typeof currentProps.onRemove !== "function") return;

            if (currentSelectionState.selectedNode != null) {
                const selectedNode = currentSelectionState.selectedNode;
                const index: number = currentProps.nodes.findIndex((x) => x.key === selectedNode.key);

                if (index === -1) return;

                const connectedEdges: IEdge<any>[] = [];

                selectedNode.endpoints?.forEach((endpoint: IEndpoint<any>) => {
                    connectedEdges.push(
                        ...currentProps.edges.filter(
                            (x) => x.sourceId === endpoint.id || x.targetId === endpoint.id
                        )
                    );
                });
                connectedEdges.push(
                    ...currentProps.edges.filter((edge) =>
                        edge.sourceNodeId === selectedNode.key ||
                        edge.targetNodeId === selectedNode.key ||
                        (edge.anchorMode === "floating" &&
                            (edge.sourceId === selectedNode.key || edge.targetId === selectedNode.key))
                    )
                );

                currentProps.onRemove(selectedNode, connectedEdges);
                return;
            }

            if (currentSelectionState.selectedEdge != null) {
                currentProps.onRemove(null, [currentSelectionState.selectedEdge]);
            }
        }
    }, [readOnly]);

    React.useEffect(() => {
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onKeyDown]);

    return null;
};
