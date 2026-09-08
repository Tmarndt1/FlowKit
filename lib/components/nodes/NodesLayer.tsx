import * as React from "react";
import { INode } from "../../interfaces/INode";
import { INodeContainer } from "../../interfaces/INodeContainer";
import { ContainerTypes } from "../../types/ContainerTypes";
import { NodeComponentProps } from "../../types/NodeComponentProps";
import { NodeTypes } from "../../types/NodeTypes";
import { Node } from "./Node";
import { NodeContainer } from "./NodeContainer";
import { NodeFlowContext, useNodeFlowRenderStore } from "../../contexts/NodeFlowContext";
import { ContainerChange } from "../../types/ContainerChange";
import { findElementById, getFlowKitRoot } from "../../functions/domScope";

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

function findContainerElement(root: HTMLElement | null, key: string): HTMLElement | null {
    const containers = root?.querySelectorAll<HTMLElement>(".flow-kit-node-container") ?? [];

    for (const container of containers) {
        if (container.dataset.containerKey === key) return container;
    }

    return null;
}

function getRenderedContainerBounds(root: HTMLElement | null, container: INodeContainer): {
    x: number;
    y: number;
    width: number;
    height: number;
} | null {
    const element = findContainerElement(root, container.key);

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
    const stores = React.useContext(NodeFlowContext);
    const layerRef = React.useRef<HTMLDivElement>(null);
    const requestContainersChange = useNodeFlowRenderStore((state) => state.requestContainersChange);
    const requestNodesChange = useNodeFlowRenderStore((state) => state.requestNodesChange);
    const propsRef = React.useRef<IProps>(props);
    const requestContainersChangeRef = React.useRef<typeof requestContainersChange>(requestContainersChange);
    const requestNodesChangeRef = React.useRef<typeof requestNodesChange>(requestNodesChange);
    const containers = props.containers ?? [];
    const nodesByKey = React.useMemo(
        () => new Map(props.nodes.map((node) => [node.key, node])),
        [props.nodes]
    );

    propsRef.current = props;
    requestContainersChangeRef.current = requestContainersChange;
    requestNodesChangeRef.current = requestNodesChange;

    const updateContainerDragPreview = React.useCallback((): void => {
        if (stores == null) return;

        const renderState = stores.render.getState();
        const draggedNode = stores.interaction.getState().draggedNode;
        const root = getFlowKitRoot(layerRef.current);
        const containerElements = root?.querySelectorAll<HTMLElement>(".flow-kit-node-container") ?? [];
        const dropTargetKeys = new Set<string>();
        const draggingOutKeys = new Set<string>();

        if (renderState.canChangeContainers && draggedNode != null) {
            const nodeRect = findElementById(root, draggedNode.key)?.getBoundingClientRect();

            if (nodeRect != null) {
                const nodeCenter = {
                    x: nodeRect.left + nodeRect.width / 2,
                    y: nodeRect.top + nodeRect.height / 2,
                };
                const containersByKey = new Map(
                    (propsRef.current.containers ?? []).map((container) => [container.key, container])
                );

                containerElements.forEach((element) => {
                    const key = element.dataset.containerKey;
                    const container = key == null ? undefined : containersByKey.get(key);

                    if (key == null || container == null) return;

                    const rect = element.getBoundingClientRect();
                    const containsNode = container.nodeKeys.includes(draggedNode.key);
                    const containsCenter =
                        nodeCenter.x >= rect.left &&
                        nodeCenter.x <= rect.right &&
                        nodeCenter.y >= rect.top &&
                        nodeCenter.y <= rect.bottom;

                    if (!containsNode && containsCenter) dropTargetKeys.add(key);
                    if (containsNode && !containsCenter) draggingOutKeys.add(key);
                });
            }
        }

        renderState.setContainerDragPreview(dropTargetKeys, draggingOutKeys);
    }, [stores]);

    React.useEffect(() => {
        if (stores == null) return;

        let animationFrame: number | null = null;
        const schedulePreviewUpdate = (): void => {
            if (animationFrame != null) return;

            animationFrame = window.requestAnimationFrame(() => {
                animationFrame = null;
                updateContainerDragPreview();
            });
        };
        const unsubscribeInteraction = stores.interaction.subscribe((state, previous) => {
            if (
                state.dragUpdateVersion !== previous.dragUpdateVersion ||
                state.draggedNode !== previous.draggedNode
            ) schedulePreviewUpdate();
        });
        const unsubscribeRender = stores.render.subscribe((state, previous) => {
            if (state.canChangeContainers !== previous.canChangeContainers) schedulePreviewUpdate();
        });

        schedulePreviewUpdate();

        return () => {
            if (animationFrame != null) window.cancelAnimationFrame(animationFrame);
            unsubscribeInteraction();
            unsubscribeRender();
            stores.render.getState().setContainerDragPreview(new Set(), new Set());
        };
    }, [stores, updateContainerDragPreview]);

    React.useLayoutEffect(() => {
        updateContainerDragPreview();
    }, [containers, updateContainerDragPreview]);

    const updateContainerMembership = React.useCallback<(node: INode<any, any>) => void>((node: INode<any, any>): void => {
        const currentContainers = propsRef.current.containers ?? [];
        const root = getFlowKitRoot(layerRef.current);

        if (currentContainers.length < 1) return;

        const nodeElement = findElementById(root, node.key);
        const nodeRect = nodeElement?.getBoundingClientRect();
        const nodeCenter = {
            x: nodeRect == null ? 0 : nodeRect.left + nodeRect.width / 2,
            y: nodeRect == null ? 0 : nodeRect.top + nodeRect.height / 2,
        };
        const targetContainer = currentContainers.find((container) => {
            const element = findContainerElement(root, container.key);
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
        currentContainers.forEach((container) => {
            const containsNode = container.nodeKeys.includes(node.key);
            const shouldContainNode = container.key === targetContainer?.key;

            if (containsNode === shouldContainNode) return;

            const bounds = getRenderedContainerBounds(root, container);
            const nodeKeys = shouldContainNode
                ? [...container.nodeKeys, node.key]
                : container.nodeKeys.filter((nodeKey) => nodeKey !== node.key);
            changes.push({
                type: "membership",
                key: container.key,
                nodeKeys,
                ...(bounds != null && (nodeKeys.length < 1 || container.resizeToFit === false)
                    ? {
                        position: { x: bounds.x, y: bounds.y },
                        width: bounds.width,
                        height: bounds.height,
                    }
                    : {}),
            });
        });

        if (changes.length === 0) return;

        requestContainersChangeRef.current(changes);
    }, []);

    const onDragEnd = React.useCallback<(
        containerKey: string,
        nodeOffsets: ReadonlyMap<string, { x: number; y: number }>
    ) => void>((containerKey, nodeOffsets): void => {
        const currentContainers = propsRef.current.containers ?? [];
        const container = currentContainers.find((c) => c.key === containerKey);
        const root = getFlowKitRoot(layerRef.current);

        // A populated container may derive its initial position from its nodes.
        // Persist the rendered position on its first drag instead of requiring a resize first.
        if (container == null) return;

        const bounds = getRenderedContainerBounds(root, container);

        if (bounds == null) return;

        requestContainersChangeRef.current([{ type: "move", key: containerKey, position: { x: bounds.x, y: bounds.y } }]);

        const nodePositionChanges = (propsRef.current.nodes ?? [])
            .filter((n) => container.nodeKeys.includes(n.key))
            .map((n) => ({
                type: "position" as const,
                key: n.key,
                offset: nodeOffsets.get(n.key) ?? { x: n.offset.x, y: n.offset.y },
            }));

        if (nodePositionChanges.length > 0) requestNodesChangeRef.current(nodePositionChanges);
    }, []);

    const onResizeEnd = React.useCallback<(containerKey: string) => void>((containerKey: string): void => {
        const currentContainers = propsRef.current.containers ?? [];
        const container = currentContainers.find((c) => c.key === containerKey);
        const root = getFlowKitRoot(layerRef.current);

        if (container == null) return;

        const bounds = getRenderedContainerBounds(root, container);

        if (bounds == null) return;

        requestContainersChangeRef.current([{
            type: "resize",
            key: containerKey,
            position: { x: bounds.x, y: bounds.y },
            width: bounds.width,
            height: bounds.height,
        }]);

    }, []);

    const getContentBounds = React.useCallback<(scale: number) => LayerBounds | null>((scale: number): LayerBounds | null => {
        let minTop: number = Number.POSITIVE_INFINITY;
        let minLeft: number = Number.POSITIVE_INFINITY;
        let maxRight: number = Number.NEGATIVE_INFINITY;
        let maxBottom: number = Number.NEGATIVE_INFINITY;

        const includeBounds = (left: number, top: number, right: number, bottom: number): void => {
            if (top < minTop) minTop = top;
            if (bottom > maxBottom) maxBottom = bottom;
            if (left < minLeft) minLeft = left;
            if (right > maxRight) maxRight = right;
        };

        propsRef.current.nodes.forEach((node: INode<any, any>) => {
            const rect = findElementById(getFlowKitRoot(layerRef.current), node.key)?.getBoundingClientRect();

            if (rect == null) return;

            const top: number = node.offset.y;
            const bottom: number = node.offset.y + rect.height / scale;
            const left: number = node.offset.x;
            const right: number = node.offset.x + rect.width / scale;

            includeBounds(left, top, right, bottom);
        });

        (propsRef.current.containers ?? []).forEach((container: INodeContainer) => {
            const bounds = getRenderedContainerBounds(getFlowKitRoot(layerRef.current), container);

            if (bounds == null) return;

            includeBounds(
                bounds.x,
                bounds.y,
                bounds.x + bounds.width,
                bounds.y + bounds.height
            );
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
            {containers.map((container) => {
                const containedNodes = container.nodeKeys
                    .map((key) => nodesByKey.get(key))
                    .filter((node): node is INode<any, any> => node != null);

                return (
                    <NodeContainer
                        key={container.key}
                        container={container}
                        customContainer={container.type != null ? props.containerTypes?.[container.type] : undefined}
                        nodes={containedNodes}
                        onDragEnd={onDragEnd}
                        onResizeEnd={onResizeEnd}
                    />
                );
            })}
        </div>
        <div className="flow-kit-nodes-container" ref={layerRef}>
            {props.nodes.map((node) => {
                if (node.type == null || node.type === "node") {
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
