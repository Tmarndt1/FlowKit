import * as React from "react";
import { INode } from "../../interfaces/INode";
import { INodeContainer } from "../../interfaces/INodeContainer";
import { ContainerTypes } from "../../types/ContainerTypes";
import { NodeComponentProps } from "../../types/NodeComponentProps";
import { NodeTypes } from "../../types/NodeTypes";
import { Node } from "./Node";
import { NodeContainer } from "./NodeContainer";
import { useNodeFlowRenderStore } from "../../contexts/NodeFlowContext";
import { ContainerChange } from "../../types/ContainerChange";

interface LayerBounds {
    minTop: number;
    minLeft: number;
    maxRight: number;
    maxBottom: number;
}

interface IProps {
    containerTypes?: ContainerTypes;
    containers?: INodeContainer[];
    customNodeProps?: NodeComponentProps;
    nodeStateClassNames?: Map<string, string>;
    nodeTypes?: NodeTypes;
    nodes: INode<any, any>[];
}

/** Imperative hooks used by FlowKit to measure content and update container membership. */
export interface NodesLayerHandle {
    /** Rendered nodes layer element. */
    element: HTMLDivElement | null;
    /** Returns canvas-space content bounds for recentering. */
    getContentBounds: (scale: number) => LayerBounds | null;
    /** Recomputes which container, if any, owns a dragged node. */
    updateContainerMembership: (node: INode<any, any>) => void;
}

function getRenderedContainerBounds(container: INodeContainer): {
    x: number;
    y: number;
    width: number;
    height: number;
} | null {
    const element = document.querySelector<HTMLElement>(
        `.flow-kit-node-container[data-container-key="${container.key}"]`
    );

    if (element == null) return null;

    const match = element.style.transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);

    return {
        x: match == null ? container.position?.x ?? 0 : Number(match[1]),
        y: match == null ? container.position?.y ?? 0 : Number(match[2]),
        width: element.offsetWidth,
        height: element.offsetHeight,
    };
}

const NodesLayerComponent = React.forwardRef<NodesLayerHandle, IProps>((props, ref) => {
    const layerRef = React.useRef<HTMLDivElement>(null);
    const hasContainerChangeListener = useNodeFlowRenderStore((state) => state.hasContainerChangeListener);
    const requestContainersChange = useNodeFlowRenderStore((state) => state.requestContainersChange);
    const requestNodesChange = useNodeFlowRenderStore((state) => state.requestNodesChange);
    const propsRef = React.useRef<IProps>(props);
    const hasContainerChangeListenerRef = React.useRef<boolean>(hasContainerChangeListener);
    const requestContainersChangeRef = React.useRef<typeof requestContainersChange>(requestContainersChange);
    const requestNodesChangeRef = React.useRef<typeof requestNodesChange>(requestNodesChange);
    const [, forceContainerRender] = React.useReducer((value: number) => value + 1, 0);
    const containers = props.containers ?? [];

    propsRef.current = props;
    hasContainerChangeListenerRef.current = hasContainerChangeListener;
    requestContainersChangeRef.current = requestContainersChange;
    requestNodesChangeRef.current = requestNodesChange;

    const updateContainerMembership = React.useCallback<(node: INode<any, any>) => void>((node: INode<any, any>): void => {
        const currentContainers = propsRef.current.containers ?? [];

        if (currentContainers.length < 1) return;

        const nodeElement = document.getElementById(node.key);
        const nodeRect = nodeElement?.getBoundingClientRect();
        const nodeCenter = {
            x: nodeRect == null ? 0 : nodeRect.left + nodeRect.width / 2,
            y: nodeRect == null ? 0 : nodeRect.top + nodeRect.height / 2,
        };
        const targetContainer = currentContainers.find((container) => {
            const element = document.querySelector<HTMLElement>(
                `.flow-kit-node-container[data-container-key="${container.key}"]`
            );
            const rect = element?.getBoundingClientRect();

            if (rect == null) return false;

            return (
                nodeCenter.x >= rect.left &&
                nodeCenter.x <= rect.right &&
                nodeCenter.y >= rect.top &&
                nodeCenter.y <= rect.bottom
            );
        });

        const changes: ContainerChange[] = [];
        const nextContainers = currentContainers.map((container) => {
            const containsNode = container.nodeKeys.includes(node.key);
            const shouldContainNode = container.key === targetContainer?.key;

            if (containsNode === shouldContainNode) return container;

            const bounds = getRenderedContainerBounds(container);
            const nodeKeys = shouldContainNode
                ? [...container.nodeKeys, node.key]
                : container.nodeKeys.filter((nodeKey) => nodeKey !== node.key);
            const nextContainer: INodeContainer = { ...container, nodeKeys };

            if ((nodeKeys.length < 1 || container.resizeToFit === false) && bounds != null) {
                nextContainer.position = { x: bounds.x, y: bounds.y };
                nextContainer.style = { ...nextContainer.style, width: bounds.width, height: bounds.height };
            }

            changes.push({ type: "membership", key: container.key, nodeKeys });
            return nextContainer;
        });

        if (changes.length === 0) return;

        requestContainersChangeRef.current(changes);

        if (hasContainerChangeListenerRef.current) return;

        currentContainers.splice(0, currentContainers.length, ...nextContainers);
        forceContainerRender();
    }, []);

    const onDragEnd = React.useCallback<(containerKey: string) => void>((containerKey: string): void => {
        const currentContainers = propsRef.current.containers ?? [];
        const container = currentContainers.find((c) => c.key === containerKey);

        if (container == null || container.position == null) return;

        const bounds = getRenderedContainerBounds(container);

        if (bounds == null) return;

        requestContainersChangeRef.current([{ type: "move", key: containerKey, position: { x: bounds.x, y: bounds.y } }]);

        const nodePositionChanges = (propsRef.current.nodes ?? [])
            .filter((n) => container.nodeKeys.includes(n.key))
            .map((n) => ({ type: "position" as const, key: n.key, offset: { x: n.offset.x, y: n.offset.y } }));

        if (nodePositionChanges.length > 0) requestNodesChangeRef.current(nodePositionChanges);

        if (hasContainerChangeListenerRef.current) return;

        const idx = currentContainers.findIndex((c) => c.key === containerKey);

        if (idx >= 0) currentContainers[idx] = { ...currentContainers[idx], position: { x: bounds.x, y: bounds.y } };

        forceContainerRender();
    }, []);

    const onResizeEnd = React.useCallback<(containerKey: string) => void>((containerKey: string): void => {
        const currentContainers = propsRef.current.containers ?? [];
        const container = currentContainers.find((c) => c.key === containerKey);

        if (container == null) return;

        const bounds = getRenderedContainerBounds(container);

        if (bounds == null) return;

        requestContainersChangeRef.current([{
            type: "resize",
            key: containerKey,
            position: { x: bounds.x, y: bounds.y },
            width: bounds.width,
            height: bounds.height,
        }]);

        if (hasContainerChangeListenerRef.current) return;

        const idx = currentContainers.findIndex((c) => c.key === containerKey);

        if (idx >= 0) {
            currentContainers[idx] = {
                ...currentContainers[idx],
                position: { x: bounds.x, y: bounds.y },
                style: { ...currentContainers[idx].style, width: bounds.width, height: bounds.height },
            };
        }

        forceContainerRender();
    }, []);

    const getContentBounds = React.useCallback<(scale: number) => LayerBounds | null>((scale: number): LayerBounds | null => {
        let minTop: number = Number.POSITIVE_INFINITY;
        let minLeft: number = Number.POSITIVE_INFINITY;
        let maxRight: number = Number.NEGATIVE_INFINITY;
        let maxBottom: number = Number.NEGATIVE_INFINITY;

        propsRef.current.nodes.forEach((node: INode<any, any>) => {
            const rect = document.getElementById(node.key)?.getBoundingClientRect();

            if (rect == null) return;

            const top: number = node.offset.y;
            const bottom: number = node.offset.y + rect.height / scale;
            const left: number = node.offset.x;
            const right: number = node.offset.x + rect.width / scale;

            if (top < minTop) minTop = top;
            if (bottom > maxBottom) maxBottom = bottom;
            if (left < minLeft) minLeft = left;
            if (right > maxRight) maxRight = right;
        });

        if (
            !isFinite(minTop) ||
            !isFinite(minLeft) ||
            !isFinite(maxRight) ||
            !isFinite(maxBottom)
        ) return null;

        return { minTop, minLeft, maxRight, maxBottom };
    }, []);

    React.useImperativeHandle<NodesLayerHandle, NodesLayerHandle>(ref, () => ({
        element: layerRef.current,
        getContentBounds,
        updateContainerMembership,
    }), [getContentBounds, updateContainerMembership]);

    return (
        <React.Fragment>
        <div className="flow-kit-containers-layer">
            {containers.map((container) => (
                <NodeContainer
                    key={container.key}
                    container={container}
                    customContainer={container.type != null ? props.containerTypes?.[container.type] : undefined}
                    nodes={props.nodes}
                    onDragEnd={onDragEnd}
                    onResizeEnd={onResizeEnd}
                />
            ))}
        </div>
        <div className="flow-kit-nodes-container" ref={layerRef}>
            {props.nodes.map((node) => {
                if (node.type === "node") {
                    return (
                        <Node
                            key={node.key}
                            node={node}
                            stateClassName={props.nodeStateClassNames?.get(node.key)}
                        />
                    );
                }

                const CustomNode = props.nodeTypes?.[node.type];

                if (CustomNode == null) return null;

                return (
                    <Node
                        key={node.key}
                        node={node}
                        stateClassName={props.nodeStateClassNames?.get(node.key)}
                        customNode={CustomNode}
                        customNodeProps={props.customNodeProps?.[node.type]}
                    />
                );
            })}
        </div>
        </React.Fragment>
    );
});

NodesLayerComponent.displayName = "NodesLayer";

export const NodesLayer = React.memo(NodesLayerComponent);
