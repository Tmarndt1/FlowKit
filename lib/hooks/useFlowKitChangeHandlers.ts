import * as React from "react";
import { IEdge } from "../interfaces/IEdge";
import { INode } from "../interfaces/INode";
import { INodeContainer } from "../interfaces/INodeContainer";
import { ContainerChange } from "../types/ContainerChange";
import { EdgeChange } from "../types/EdgeChange";
import { NodeChange } from "../types/NodeChange";
import { applyContainerChanges } from "../utils/applyContainerChanges";
import { ApplyEdgeChangesOptions, applyEdgeChanges } from "../utils/applyEdgeChanges";
import { applyNodeChanges } from "../utils/applyNodeChanges";

export interface UseFlowKitChangeHandlersOptions<
    TNode extends INode<any, any>,
    TEdge extends IEdge<any>,
    TContainer extends INodeContainer,
> {
    /** React state setter used to persist node mutations. Omit to keep nodes non-draggable. */
    setNodes?: React.Dispatch<React.SetStateAction<TNode[]>>;
    /** React state setter used to persist edge mutations. Omit to disable connection creation. */
    setEdges?: React.Dispatch<React.SetStateAction<TEdge[]>>;
    /** React state setter used to persist container mutations. Omit to disable container editing. */
    setContainers?: React.Dispatch<React.SetStateAction<TContainer[]>>;
    /** Creates application-specific edges for connect changes. */
    createEdge?: ApplyEdgeChangesOptions<TEdge>["createEdge"];
}

export interface FlowKitChangeHandlers {
    onNodesChange?: (changes: NodeChange[]) => void;
    onEdgesChange?: (changes: EdgeChange[]) => void;
    onContainersChange?: (changes: ContainerChange[]) => void;
}

/** Creates memoized FlowKitEvents callbacks backed by ordinary React state setters. */
export function useFlowKitChangeHandlers<
    TNode extends INode<any, any>,
    TEdge extends IEdge<any>,
    TContainer extends INodeContainer,
>({
    setNodes,
    setEdges,
    setContainers,
    createEdge,
}: UseFlowKitChangeHandlersOptions<TNode, TEdge, TContainer>): FlowKitChangeHandlers {
    const onNodesChange = React.useMemo(
        () => setNodes == null
            ? undefined
            : (changes: NodeChange[]) => {
                setNodes((current) => applyNodeChanges(current, changes));
            },
        [setNodes]
    );
    const onEdgesChange = React.useMemo(
        () => setEdges == null
            ? undefined
            : (changes: EdgeChange[]) => {
                setEdges((current) => applyEdgeChanges(current, changes, { createEdge }));
            },
        [createEdge, setEdges]
    );
    const onContainersChange = React.useMemo(
        () => setContainers == null
            ? undefined
            : (changes: ContainerChange[]) => {
                setContainers((current) => applyContainerChanges(current, changes));
            },
        [setContainers]
    );

    return React.useMemo(() => ({
        onNodesChange,
        onEdgesChange,
        onContainersChange,
    }), [onContainersChange, onEdgesChange, onNodesChange]);
}
