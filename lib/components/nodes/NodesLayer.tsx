import * as React from "react";
import { INode } from "../../interfaces/INode";
import { INodeContainer } from "../../interfaces/INodeContainer";
import { NodeComponentProps } from "../../types/NodeComponentProps";
import { NodeTypes } from "../../types/NodeTypes";
import { Node } from "./Node";
import { NodeContainer } from "./NodeContainer";
import { useNodeFlowRenderStore } from "../NodeFlowContext";

interface LayerBounds {
    minTop: number;
    minLeft: number;
    maxRight: number;
    maxBottom: number;
}

interface IProps {
    containers?: INodeContainer[];
    customNodeProps?: NodeComponentProps;
    nodeTypes?: NodeTypes;
    nodes: INode<any, any>[];
}

export interface NodesLayerHandle {
    element: HTMLDivElement | null;
    getContentBounds: (scale: number) => LayerBounds | null;
    updateContainerMembership: (node: INode<any, any>) => void;
}

function getRenderedContainerBounds(container: INodeContainer): {
    x: number;
    y: number;
    width: number;
    height: number;
} | null {
    const element = document.querySelector<HTMLElement>(
        `.node-flow-node-container[data-container-key="${container.key}"]`
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
    const propsRef = React.useRef(props);
    const hasContainerChangeListenerRef = React.useRef(hasContainerChangeListener);
    const requestContainersChangeRef = React.useRef(requestContainersChange);
    const [, forceContainerRender] = React.useReducer((value: number) => value + 1, 0);
    const containers = props.containers ?? [];

    propsRef.current = props;
    hasContainerChangeListenerRef.current = hasContainerChangeListener;
    requestContainersChangeRef.current = requestContainersChange;

    const updateContainerMembership = React.useCallback((node: INode<any, any>): void => {
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
                `.node-flow-node-container[data-container-key="${container.key}"]`
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
        let changed = false;

        const nextContainers = currentContainers.map((container) => {
            const containsNode = container.nodeKeys.includes(node.key);
            const shouldContainNode = container.key === targetContainer?.key;

            if (containsNode === shouldContainNode) return container;

            changed = true;

            const bounds = getRenderedContainerBounds(container);
            const nodeKeys = shouldContainNode
                ? [...container.nodeKeys, node.key]
                : container.nodeKeys.filter((nodeKey) => nodeKey !== node.key);
            const nextContainer: INodeContainer = {
                ...container,
                nodeKeys,
            };

            if (nodeKeys.length < 1 && bounds != null) {
                nextContainer.position = { x: bounds.x, y: bounds.y };
                nextContainer.width = bounds.width;
                nextContainer.height = bounds.height;
            }

            return nextContainer;
        });

        if (!changed) return;

        requestContainersChangeRef.current(nextContainers);

        if (hasContainerChangeListenerRef.current) return;

        currentContainers.splice(0, currentContainers.length, ...nextContainers);
        forceContainerRender();
    }, []);

    const getContentBounds = React.useCallback((scale: number): LayerBounds | null => {
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

    React.useImperativeHandle(ref, () => ({
        element: layerRef.current,
        getContentBounds,
        updateContainerMembership,
    }), [getContentBounds, updateContainerMembership]);

    return (
        <div className="node-flow-nodes-container" ref={layerRef}>
            {containers.map((container) => (
                <NodeContainer
                    key={container.key}
                    container={container}
                    nodes={props.nodes}
                />
            ))}
            {props.nodes.map((node) => {
                if (node.type === "node") {
                    return (
                        <Node
                            key={node.key}
                            node={node}
                        />
                    );
                }

                const CustomNode = props.nodeTypes?.[node.type];

                if (CustomNode == null) return null;

                return (
                    <Node
                        key={node.key}
                        node={node}
                        customNode={CustomNode}
                        customNodeProps={props.customNodeProps?.[node.type]}
                    />
                );
            })}
        </div>
    );
});

NodesLayerComponent.displayName = "NodesLayer";

export const NodesLayer = React.memo(NodesLayerComponent);
