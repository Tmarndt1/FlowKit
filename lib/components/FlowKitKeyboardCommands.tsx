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
    const selectedNodes = useNodeFlowSelectionStore((state) => state.selectedNodes);
    const selectedEdges = useNodeFlowSelectionStore((state) => state.selectedEdges);
    const copyRef = React.useRef<FlowElement | null>(null);
    const propsRef = React.useRef<FlowKitKeyboardCommandsProps>(props);
    const selectionRef = React.useRef<{ selectedEdge: typeof selectedEdge; selectedNode: typeof selectedNode; selectedNodes: typeof selectedNodes; selectedEdges: typeof selectedEdges }>({ selectedEdge, selectedNode, selectedNodes, selectedEdges });

    propsRef.current = props;
    selectionRef.current = { selectedEdge, selectedNode, selectedNodes, selectedEdges };

    const onKeyDown = React.useCallback<(e: KeyboardEvent) => void>((e: KeyboardEvent): void => {
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

            if (currentSelectionState.selectedNodes.length > 0) {
                const nodesToDelete = currentSelectionState.selectedNodes.filter(
                    (n) => currentProps.nodes.some((x) => x.key === n.key)
                );

                if (nodesToDelete.length === 0) return;

                for (const node of nodesToDelete) {
                    const connectedEdges: IEdge<any>[] = [];
                    const seenEdgeKeys = new Set<string>();

                    node.endpoints?.forEach((endpoint: IEndpoint<any>) => {
                        currentProps.edges
                            .filter((x) => x.sourceId === endpoint.id || x.targetId === endpoint.id)
                            .forEach((edge) => {
                                if (!seenEdgeKeys.has(edge.key)) {
                                    seenEdgeKeys.add(edge.key);
                                    connectedEdges.push(edge);
                                }
                            });
                    });
                    currentProps.edges
                        .filter(
                            (edge) =>
                                edge.anchorMode === "floating" &&
                                (edge.sourceId === node.key || edge.targetId === node.key)
                        )
                        .forEach((edge) => {
                            if (!seenEdgeKeys.has(edge.key)) {
                                seenEdgeKeys.add(edge.key);
                                connectedEdges.push(edge);
                            }
                        });

                    currentProps.onRemove(node, connectedEdges);
                }

                return;
            }

            if (currentSelectionState.selectedEdges.length > 0) {
                for (const edge of currentSelectionState.selectedEdges) {
                    currentProps.onRemove(null, [edge]);
                }
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
