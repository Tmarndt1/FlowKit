import * as React from "react";
import { IEdge } from "../interfaces/IEdge";
import { IEndpoint } from "../interfaces/IEndpoint";
import { INode } from "../interfaces/INode";
import { FlowElement } from "../types/FlowElement";
import { useNodeFlowSelectionStore } from "./NodeFlowContext";

interface IProps {
    copy?: boolean;
    deleteSelection?: boolean;
    edges: IEdge<any>[];
    nodes: INode<any, any>[];
    onCopy?: (element: FlowElement) => any;
    onPaste?: (element: FlowElement) => any;
    onRemove?: (node: INode<any, any> | null, edges: IEdge<any>[]) => any;
    paste?: boolean;
}

export const FlowKitKeyboardCommands: React.FC<IProps> = (props) => {
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

        if (key === 86 && ctrl && currentProps.paste !== false) {
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

        if (e.key?.toLocaleLowerCase() === "backspace" && currentProps.deleteSelection !== false) {
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

                currentProps.onRemove(selectedNode, connectedEdges);
                return;
            }

            if (currentSelectionState.selectedEdge != null) {
                currentProps.onRemove(null, [currentSelectionState.selectedEdge]);
            }
        }
    }, []);

    React.useEffect(() => {
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onKeyDown]);

    return null;
};
