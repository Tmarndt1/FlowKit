import * as React from "react";
import { IEdge } from "../interfaces/IEdge";
import { INode } from "../interfaces/INode";
import { INodeContainer } from "../interfaces/INodeContainer";
import { IOffset } from "../interfaces/IOffset";
import { NodeComponentProps } from "../types/NodeComponentProps";
import { EdgeTypes } from "../types/EdgeTypes";
import { NodeTypes } from "../types/NodeTypes";
import { EdgeLayer, EdgeLayerHandle, ProximityConnectOptions } from "./edges/EdgeLayer";
import { FlowKitControlsContext } from "./FlowKitControls";
import { NodeFlowContext } from "./NodeFlowContext";
import { NodesLayer, NodesLayerHandle } from "./nodes/NodesLayer";
import {
    createNodeFlowStores,
    NodeFlowStores,
} from "../stores/NodeFlowStore";
import { IEndpoint } from "../interfaces/IEndpoint";

export { useNodeFlowSelection } from "./NodeFlowContext";
export { useNodeFlowSelectionChange } from "./FlowKitEvents";

function getTransformValue(x: number, y: number, scale: number): string {
    return `translate(${x}px, ${y}px) scale(${scale})`;
}

export interface ICanConnectArgs {
    source: IEndpoint<any>;
    target: IEndpoint<any>;
}

export type CanConnect = (args: ICanConnectArgs) => boolean;

interface FlowKitConfigContextValue {
    canConnect?: CanConnect;
}

const FlowKitConfigContext =
    React.createContext<FlowKitConfigContextValue | null>(null);

export function useFlowKitConfig(): FlowKitConfigContextValue {
    const context = React.useContext(FlowKitConfigContext);

    if (context == null) {
        throw new Error("useFlowKitConfig must be used inside FlowKit.");
    }

    return context;
}

function setTransform(
    html: HTMLElement | null,
    x: number,
    y: number,
    scale: number
) {
    if (html == null) return;

    const transform = getTransformValue(x, y, scale);

    if (html.style.transform === transform) return;

    html.style.transform = transform;
}

function getElementFromEventTarget(target: EventTarget | null): Element | null {
    if (target instanceof Element) return target;
    if (target instanceof globalThis.Node) return target.parentElement;

    return null;
}

function isInteractiveFlowElement(element: Element | null): boolean {
    return (
        element?.closest(
            ".node-flow-node, .node-flow-node-wrapper, .node-flow-endpoint, .node-flow-edge, .node-flow-edge-path"
            + ", .node-flow-node-container-header, .node-flow-node-container-resize"
        ) != null
    );
}

function isPointInsideFlowNode(x: number, y: number): boolean {
    const nodes = document.querySelectorAll<HTMLElement>(".node-flow-node, .node-flow-node-wrapper");

    for (const node of nodes) {
        const rect = node.getBoundingClientRect();

        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return true;
        }
    }

    return false;
}

function isPanSurfaceElement(element: Element | null): boolean {
    return (
        element?.classList.contains("node-flow-viewport") === true ||
        element?.classList.contains("node-flow-background") === true ||
        element?.classList.contains("node-flow-content") === true ||
        element?.classList.contains("node-flow-nodes-container") === true ||
        element?.classList.contains("node-flow-edges-container") === true
    );
}

interface IProps {
    nodes: INode<any, any>[];
    edges: IEdge<any>[];
    containers?: INodeContainer[];
    nodeTypes?: NodeTypes;
    edgeTypes?: EdgeTypes;
    style?: React.CSSProperties;
    zoomMax?: number;
    zoomMin?: number;
    centerOnLoad?: boolean;
    proximityConnect?: boolean | ProximityConnectOptions;
    children?: React.ReactNode;
    customNodeProps?: NodeComponentProps;
    canConnect?: CanConnect
}

export const FlowKit: React.FC<IProps> = (props) => {
    const nodeFlowStoresRef = React.useRef<NodeFlowStores | null>(null);
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const nodesLayerRef = React.useRef<NodesLayerHandle>(null);
    const edgeLayerRef = React.useRef<EdgeLayerHandle>(null);
    const xPosRef = React.useRef<number>(0);
    const yPosRef = React.useRef<number>(0);
    const cursorPosRef = React.useRef<IOffset>({ x: 0, y: 0 });
    const originalPosRef = React.useRef<IOffset>({ x: 0, y: 0 });
    const mouseDownRef = React.useRef<boolean>(false);
    const panActiveRef = React.useRef<boolean>(false);
    const panButtonDownRef = React.useRef<boolean>(false);
    const panStartTokenRef = React.useRef<number>(0);
    const suppressPanUntilReleaseRef = React.useRef<boolean>(false);
    const panMouseMoveHandlerRef = React.useRef<((e: MouseEvent) => void) | null>(null);
    const panMouseUpHandlerRef = React.useRef<(() => void) | null>(null);
    const initializedViewRef = React.useRef<boolean>(false);
    const propsRef = React.useRef(props);
    const stateRef = React.useRef({ nodes: props.nodes, edges: props.edges });

    if (nodeFlowStoresRef.current == null) {
        nodeFlowStoresRef.current = createNodeFlowStores();
    }

    const stores = nodeFlowStoresRef.current;
    const viewportStore = stores.viewport;
    const interactionStore = stores.interaction;
    const selectionStore = stores.selection;
    const renderStore = stores.render;
    propsRef.current = props;
    stateRef.current = { nodes: props.nodes, edges: props.edges };

    const config = React.useMemo(
        () => ({
            canConnect: props.canConnect
        }),
        [props.canConnect]
    );

    const updateCanvasTransform = React.useCallback((x: number, y: number, scale: number): void => {
        setTransform(contentRef.current, x, y, scale);
        viewportStore.getState().setOffset({ x, y });
    }, [viewportStore]);

    const onZoom = React.useCallback((zoomIn: boolean): void => {
        const currentProps = propsRef.current;
        const currentState = viewportStore.getState();
        let scale: number = 1;

        if (!zoomIn) {
            scale = currentState.scale * 0.95;
            if (currentProps.zoomMin != null && currentProps.zoomMin > scale) return;
        } else if (zoomIn) {
            scale = currentState.scale / 0.95;
            if (currentProps.zoomMax != null && currentProps.zoomMax < scale) return;
        }

        currentState.setScale(scale);

        updateCanvasTransform(xPosRef.current, yPosRef.current, scale);

        currentState.setContainerRect(contentRef.current?.getBoundingClientRect());
    }, [updateCanvasTransform, viewportStore]);

    const stopCanvasPan = React.useCallback((commitPosition: boolean): void => {
        const wasPanning = panActiveRef.current;

        panStartTokenRef.current += 1;
        panButtonDownRef.current = false;
        panActiveRef.current = false;
        mouseDownRef.current = false;

        if (commitPosition) {
            suppressPanUntilReleaseRef.current = false;
        }

        if (commitPosition && wasPanning) {
            originalPosRef.current = { x: xPosRef.current, y: yPosRef.current };
            viewportStore.getState().setContainerRect(contentRef.current?.getBoundingClientRect());
        }

        if (panMouseUpHandlerRef.current != null) {
            document.removeEventListener("mouseup", panMouseUpHandlerRef.current);
        }

        if (panMouseMoveHandlerRef.current != null) {
            document.removeEventListener("mousemove", panMouseMoveHandlerRef.current);
        }
    }, [viewportStore]);

    const onPanMouseMove = React.useCallback((e: MouseEvent): void => {
        if (!mouseDownRef.current) return;

        const currentState = interactionStore.getState();

        if (suppressPanUntilReleaseRef.current) return;

        if (currentState.draggingNode || currentState.sourceEndpoint != null) {
            if (currentState.draggingNode) suppressPanUntilReleaseRef.current = true;
            stopCanvasPan(false);
            return;
        }

        if (!panActiveRef.current) {
            const dx = e.clientX - cursorPosRef.current.x;
            const dy = e.clientY - cursorPosRef.current.y;
            const target = document.elementFromPoint(e.clientX, e.clientY);

            if (isInteractiveFlowElement(target) || isPointInsideFlowNode(e.clientX, e.clientY)) {
                stopCanvasPan(false);
                return;
            }

            if (Math.hypot(dx, dy) < 3) return;

            panActiveRef.current = true;
            selectionStore.getState().clearSelection();
        }

        xPosRef.current = originalPosRef.current.x + e.clientX - cursorPosRef.current.x;
        yPosRef.current = originalPosRef.current.y + e.clientY - cursorPosRef.current.y;

        const scale = viewportStore.getState().scale;

        updateCanvasTransform(xPosRef.current, yPosRef.current, scale);
    }, [interactionStore, selectionStore, stopCanvasPan, updateCanvasTransform, viewportStore]);

    const onPanMouseUp = React.useCallback((): void => {
        stopCanvasPan(true);
    }, [stopCanvasPan]);

    panMouseMoveHandlerRef.current = onPanMouseMove;
    panMouseUpHandlerRef.current = onPanMouseUp;

    const onMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        const currentState = interactionStore.getState();

        if (currentState.draggingNode || currentState.sourceEndpoint != null) {
            if (currentState.draggingNode) suppressPanUntilReleaseRef.current = true;
            stopCanvasPan(false);
            return;
        }

        const target = getElementFromEventTarget(e.target);
        const pointTarget = document.elementFromPoint(e.clientX, e.clientY);

        if (
            isInteractiveFlowElement(target) ||
            isInteractiveFlowElement(pointTarget) ||
            isPointInsideFlowNode(e.clientX, e.clientY)
        ) {
            stopCanvasPan(false);
            return;
        }

        if (!isPanSurfaceElement(target) && !isPanSurfaceElement(pointTarget)) {
            stopCanvasPan(false);
            return;
        }

        selectionStore.getState().clearSelection();

        panStartTokenRef.current += 1;
        suppressPanUntilReleaseRef.current = false;
        panButtonDownRef.current = true;
        panActiveRef.current = false;
        mouseDownRef.current = true;
        cursorPosRef.current = { x: e.clientX, y: e.clientY };
        document.addEventListener("mouseup", onPanMouseUp);
        document.addEventListener("mousemove", onPanMouseMove);
    }, [interactionStore, onPanMouseMove, onPanMouseUp, selectionStore, stopCanvasPan]);

    const onMouseUp = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
            stopCanvasPan(true);
            edgeLayerRef.current?.handlePointerRelease(e.clientX, e.clientY);
        },
        [stopCanvasPan]
    );

    React.useEffect(() => {
        const onDocumentRelease = (e: MouseEvent | PointerEvent): void => {
            const draggedNode = interactionStore.getState().draggedNode;

            if (draggedNode != null) {
                nodesLayerRef.current?.updateContainerMembership(draggedNode);
            }

            stopCanvasPan(true);
            edgeLayerRef.current?.handlePointerRelease(e.clientX, e.clientY);
        };

        document.addEventListener("mouseup", onDocumentRelease, true);
        document.addEventListener("pointerup", onDocumentRelease, true);

        return () => {
            document.removeEventListener("mouseup", onDocumentRelease, true);
            document.removeEventListener("pointerup", onDocumentRelease, true);
        };
    }, [interactionStore, stopCanvasPan]);

    const onMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        const currentState = interactionStore.getState();

        if (currentState.sourceEndpoint != null) {
            edgeLayerRef.current?.handlePointerMove(e.clientX, e.clientY);
        }
    }, [interactionStore]);

    const onPointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>): void => {
        if (!panActiveRef.current) edgeLayerRef.current?.handlePointerMove(e.clientX, e.clientY);
    }, []);

    const recenter = React.useCallback((): void => {
        const currentState = stateRef.current;

        if (currentState.nodes.length < 1) return;
        if (contentRef.current == null) return;
        if (nodesLayerRef.current?.element == null) return;
        if (edgeLayerRef.current?.element == null) return;

        const containerRect = viewportRef.current?.getBoundingClientRect();

        if (containerRect == null) return;

        const scale = viewportStore.getState().scale;
        const bounds = nodesLayerRef.current.getContentBounds(scale);

        if (bounds == null) return;

        const height: number = bounds.maxBottom - bounds.minTop;
        const width: number = bounds.maxRight - bounds.minLeft;

        const cx: number = containerRect.width / 2 - ((bounds.minLeft + width / 2) * scale);
        const cy: number = containerRect.height / 2 - ((bounds.minTop + height / 2) * scale);

        xPosRef.current = cx;
        yPosRef.current = cy;
        originalPosRef.current = { x: xPosRef.current, y: yPosRef.current };

        updateCanvasTransform(xPosRef.current, yPosRef.current, scale);

        viewportStore.getState().setContainerRect(contentRef.current.getBoundingClientRect());

        window.setTimeout(() => {
            stateRef.current.edges.forEach((edge: IEdge<any>) => {
                if (edge.sourceId != null && edge.targetId != null) {
                    renderStore.getState().requestEdgeRender(edge);
                }
            });
        }, 0);
    }, [renderStore, updateCanvasTransform, viewportStore]);

    React.useEffect(() => {
        if (initializedViewRef.current) return;

        initializedViewRef.current = true;

        viewportStore.getState()
            .setContainerRect(contentRef.current?.getBoundingClientRect());

        updateCanvasTransform(0, 0, viewportStore.getState().scale);
    }, [recenter, updateCanvasTransform, viewportStore]);

    React.useEffect(() => {        
        return () => {
            if (panMouseUpHandlerRef.current != null) {
                document.removeEventListener("mouseup", panMouseUpHandlerRef.current);
            }

            if (panMouseMoveHandlerRef.current != null) {
                document.removeEventListener("mousemove", panMouseMoveHandlerRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!props.centerOnLoad)
            return;
         
        recenter();
    }, []);

    const controls = React.useMemo(() => ({
        recenter,
        zoomIn: () => onZoom(true),
        zoomOut: () => onZoom(false),
    }), [onZoom, recenter]);

    return (
        <NodeFlowContext.Provider value={stores}>
            <FlowKitConfigContext.Provider value={config}>
                <FlowKitControlsContext.Provider value={controls}>
                    <div className="node-flow" style={props.style}>
                        <div
                            className="node-flow-viewport"
                            onWheel={(event) => onZoom(event.deltaY > 0)}
                            ref={viewportRef}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onMouseMove={onMouseMove}
                            onPointerMove={onPointerMove}
                        >
                            {props.children}
                            <div className="node-flow-content" ref={contentRef}>
                                <EdgeLayer
                                    ref={edgeLayerRef}
                                    edges={props.edges}
                                    edgeTypes={props.edgeTypes}
                                    nodes={props.nodes}
                                    proximityConnect={props.proximityConnect}
                                />
                                <NodesLayer
                                    ref={nodesLayerRef}
                                    containers={props.containers}
                                    customNodeProps={props.customNodeProps}
                                    nodeTypes={props.nodeTypes}
                                    nodes={props.nodes}
                                />
                            </div>
                        </div>
                    </div>
                </FlowKitControlsContext.Provider>
            </FlowKitConfigContext.Provider>
        </NodeFlowContext.Provider>
    );
};
