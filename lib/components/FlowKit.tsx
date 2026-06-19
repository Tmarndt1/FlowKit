import * as React from "react";
import { EdgePathType, IEdge } from "../interfaces/IEdge";
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
import { getFoldGraphState, IFoldGraphPreview } from "../functions/getFoldGraphState";
import {
    CanConnect,
    FlowKitConfigContext,
    FlowKitConfigContextValue,
    IEdgeCollapsedChangeArgs,
    IEdgeCollapsePreviewChangeArgs
} from "./FlowKitConfigContext";

export { useNodeFlowSelection } from "./NodeFlowContext";
export { useNodeFlowSelectionChange } from "./FlowKitEvents";
export type {
    CanConnect,
    ICanConnectArgs,
    IEdgeCollapsedChangeArgs,
    IEdgeCollapsePreviewChangeArgs
} from "./FlowKitConfigContext";

function getTransformValue(x: number, y: number, scale: number): string {
    return `translate(${x}px, ${y}px) scale(${scale})`;
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
            ".flow-kit-node, .flow-kit-node-wrapper, .flow-kit-endpoint, .flow-kit-edge, .flow-kit-edge-path"
            + ", .flow-kit-node-container-header, .flow-kit-node-container-resize"
        ) != null
    );
}

function isPointInsideFlowNode(x: number, y: number): boolean {
    const nodes = document.querySelectorAll<HTMLElement>(".flow-kit-node, .flow-kit-node-wrapper");

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
        element?.classList.contains("flow-kit-viewport") === true ||
        element?.classList.contains("flow-kit-background") === true ||
        element?.classList.contains("flow-kit-content") === true ||
        element?.classList.contains("flow-kit-nodes-container") === true ||
        element?.classList.contains("flow-kit-edges-container") === true
    );
}

/** Props for the main FlowKit canvas component. */
export interface FlowKitProps {
    /** Nodes to render. FlowKit treats this array as controlled application state. */
    nodes: INode<any, any>[];
    /** Edges to render. FlowKit treats this array as controlled application state. */
    edges: IEdge<any>[];
    /** Optional group containers rendered behind nodes. */
    containers?: INodeContainer[];
    /** Custom node renderer map, keyed by node.type. */
    nodeTypes?: NodeTypes;
    /** Custom edge renderer map, keyed by edge.type. */
    edgeTypes?: EdgeTypes;
    /** Inline style for the root FlowKit element. */
    style?: React.CSSProperties;
    /** Maximum zoom scale. */
    zoomMax?: number;
    /** Minimum zoom scale. */
    zoomMin?: number;
    /** Centers the initial viewport around rendered content after mount. */
    centerOnLoad?: boolean;
    /** Enables endpoint proximity snapping while creating connections. */
    proximityConnect?: boolean | ProximityConnectOptions;
    /** Optional helper components such as grid, controls, events, minimap, and snap. */
    children?: React.ReactNode;
    /** Extra props passed to custom node renderers by node type. */
    customNodeProps?: NodeComponentProps;
    /** Enables animated edge paths by default. */
    animatedEdges?: boolean;
    /** Optional validator for new endpoint connections. */
    canConnect?: CanConnect
    /** Enables built-in edge fold controls by default. */
    collapsibleEdges?: boolean;
    /** Default built-in edge path algorithm. */
    edgePathType?: EdgePathType;
    /** Called when a built-in fold control requests collapsed state changes. */
    onEdgeCollapsedChange?: (args: IEdgeCollapsedChangeArgs) => void;
    /** Called when a fold menu option is previewed or cleared. */
    onEdgeCollapsePreviewChange?: (args: IEdgeCollapsePreviewChangeArgs) => void;
}

export const FlowKit: React.FC<FlowKitProps> = (props) => {
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
    const [collapsePreview, setCollapsePreview] = React.useState<IFoldGraphPreview | null>(null);

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

    const onEdgeCollapsePreviewChange = React.useCallback((args: IEdgeCollapsePreviewChangeArgs): void => {
        setCollapsePreview(args.mode == null ? null : args);
        propsRef.current.onEdgeCollapsePreviewChange?.(args);
    }, []);

    const config: FlowKitConfigContextValue = React.useMemo(
        () => ({
            animatedEdges: props.animatedEdges,
            collapsibleEdges: props.collapsibleEdges,
            edgePathType: props.edgePathType,
            onEdgeCollapsedChange: props.onEdgeCollapsedChange,
            onEdgeCollapsePreviewChange,
            canConnect: props.canConnect,
        }),
        [
            props.animatedEdges,
            props.canConnect,
            props.collapsibleEdges,
            props.edgePathType,
            props.onEdgeCollapsedChange,
            onEdgeCollapsePreviewChange
        ]
    );

    const foldGraphState = React.useMemo(
        () => getFoldGraphState(props.nodes, props.edges, props.containers, collapsePreview),
        [collapsePreview, props.containers, props.edges, props.nodes]
    );

    // FlowKit owns viewport transforms directly so panning and edge redraws can stay
    // synchronized without requiring consumers to manage viewport state.
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
                    <div className="flow-kit" style={props.style}>
                        <div
                            className="flow-kit-viewport"
                            onWheel={(event) => onZoom(event.deltaY > 0)}
                            ref={viewportRef}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onMouseMove={onMouseMove}
                            onPointerMove={onPointerMove}
                        >
                            {props.children}
                            <div className="flow-kit-content" ref={contentRef}>
                                <EdgeLayer
                                    ref={edgeLayerRef}
                                    edgeStateClassNames={foldGraphState.edgeStateClassNames}
                                    edges={foldGraphState.visibleEdges}
                                    edgeTypes={props.edgeTypes}
                                    nodes={props.nodes}
                                    proximityConnect={props.proximityConnect}
                                />
                                <NodesLayer
                                    ref={nodesLayerRef}
                                    containers={foldGraphState.visibleContainers}
                                    customNodeProps={props.customNodeProps}
                                    nodeStateClassNames={foldGraphState.nodeStateClassNames}
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
