import * as React from "react";
import { EdgeTypes } from "../../types/EdgeTypes";
import { getBezier } from "../../functions/getBezier";
import { getOrthogonal } from "../../functions/getOrthogonal";
import { getSmoothStep } from "../../functions/getSmoothStep";
import { getStraight } from "../../functions/getStraight";
import { getEndpointPosition, getOppositePosition } from "../../functions/getEndpointPosition";
import { EdgeRoutingOptions, IEdge } from "../../interfaces/IEdge";
import { IEndpoint } from "../../interfaces/IEndpoint";
import { INode } from "../../interfaces/INode";
import { Edge } from "./Edge";
import { ComputedEdgeRoutingOptions, EdgeRoutingObstacle } from "../../functions/edgeRouting";
import {
    useFlowKitInteractionStore,
    useFlowKitRenderStore,
    useFlowKitViewportStore
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";
import { findElementById } from "../../functions/domScope";

/** Imperative hooks used by FlowKit to update in-progress edge drawing. */
export interface EdgeLayerHandle {
    /** Rendered SVG element containing edge paths. */
    element: SVGSVGElement | null;
    /** Updates the temporary connection path while dragging from an endpoint. */
    handlePointerMove: (x: number, y: number) => void;
    /** Attempts to complete the temporary connection path. */
    handlePointerRelease: (x: number, y: number) => void;
}

/** Options for snapping a dragged connection to nearby endpoints. */
export interface ProximityConnectOptions {
    /** Enable proximity connection behavior. Defaults to true when object form is used. */
    enabled?: boolean;
    /** Maximum pixel distance from the pointer to a nearby endpoint. */
    radius?: number;
}

interface IProps {
    edges: IEdge<any>[];
    edgeStateClassNames?: Map<string, string>;
    edgeTypes?: EdgeTypes;
    nodes: INode<any, any>[];
    proximityConnect?: boolean | ProximityConnectOptions;
}

function getProximityConnectOptions(
    proximityConnect: boolean | ProximityConnectOptions | undefined
): Required<ProximityConnectOptions> {
    if (proximityConnect === false || proximityConnect == null) {
        return { enabled: false, radius: 0 };
    }

    if (proximityConnect === true) {
        return { enabled: true, radius: 48 };
    }

    return {
        enabled: proximityConnect.enabled ?? true,
        radius: Math.max(0, proximityConnect.radius ?? 48),
    };
}

function getEndpointCenter(endpoint: HTMLElement): { x: number; y: number } {
    const rect = endpoint.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

function getEndpointElementAtPoint(
    root: HTMLElement | null,
    x: number,
    y: number,
    options: Required<ProximityConnectOptions>,
    sourceEndpointId?: string
): HTMLElement | null {
    const directHit = document
        .elementFromPoint(x, y)
        ?.closest<HTMLElement>(".flow-kit-endpoint");

    if (directHit != null && root?.contains(directHit) && directHit.id !== sourceEndpointId) return directHit;
    if (!options.enabled || options.radius <= 0) return null;

    let closestEndpoint: HTMLElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    root?.querySelectorAll<HTMLElement>(".flow-kit-endpoint").forEach((endpoint) => {
        if (endpoint.id === sourceEndpointId) return;

        const center = getEndpointCenter(endpoint);
        const distance = Math.hypot(center.x - x, center.y - y);

        if (distance < closestDistance && distance <= options.radius) {
            closestDistance = distance;
            closestEndpoint = endpoint;
        }
    });

    return closestEndpoint;
}

function getNodeKeyByConnectionId(nodes: INode<any, any>[]): Map<string, string> {
    const nodeKeyByConnectionId = new Map<string, string>();

    nodes.forEach((node) => {
        nodeKeyByConnectionId.set(node.key, node.key);
        node.endpoints.forEach((endpoint) => nodeKeyByConnectionId.set(endpoint.id, node.key));
    });

    return nodeKeyByConnectionId;
}

function getEdgeNodeKey(
    edge: IEdge<any>,
    connectionId: string,
    nodeKeyByConnectionId: ReadonlyMap<string, string>
): string {
    if (edge.anchorMode === "floating") return connectionId;

    return nodeKeyByConnectionId.get(connectionId) ?? connectionId;
}

function getEdgePairKey(edge: IEdge<any>, nodeKeyByConnectionId: ReadonlyMap<string, string>): string {
    const sourceKey = getEdgeNodeKey(edge, edge.sourceId, nodeKeyByConnectionId);
    const targetKey = getEdgeNodeKey(edge, edge.targetId, nodeKeyByConnectionId);

    return [sourceKey, targetKey].sort().join("::");
}

function getParallelEdgeOffsets(
    edges: IEdge<any>[],
    nodeKeyByConnectionId: ReadonlyMap<string, string>,
    spacing: number
): Map<string, number> {
    const offsets = new Map<string, number>();

    if (spacing <= 0) return offsets;

    const groups = edges.reduce<Map<string, IEdge<any>[]>>((map, edge) => {
        const key = getEdgePairKey(edge, nodeKeyByConnectionId);
        const group = map.get(key) ?? [];

        group.push(edge);
        map.set(key, group);

        return map;
    }, new Map());

    groups.forEach((group) => {
        if (group.length < 2) return;

        group.forEach((edge, index) => {
            offsets.set(edge.key, (index - (group.length - 1) / 2) * spacing);
        });
    });

    return offsets;
}

function getNodeObstaclesByKey(
    root: HTMLElement | null,
    nodes: INode<any, any>[],
    containerRect: DOMRect | null,
    scale: number,
    margin = 24
): Map<string, EdgeRoutingObstacle> {
    const obstacles = new Map<string, EdgeRoutingObstacle>();

    if (containerRect == null || scale === 0) return obstacles;

    nodes.forEach((node) => {
        const rect = findElementById(root, node.key)?.getBoundingClientRect();

        if (rect != null) {
            obstacles.set(node.key, {
                x: (rect.left - containerRect.left) / scale - margin,
                y: (rect.top - containerRect.top) / scale - margin,
                width: rect.width / scale + margin * 2,
                height: rect.height / scale + margin * 2,
            });
        }
    });

    return obstacles;
}

function mergeEdgeRouting(globalRouting: EdgeRoutingOptions | undefined, edge: IEdge<any>): EdgeRoutingOptions {
    return {
        ...(globalRouting ?? {}),
        ...(edge.routing ?? {}),
    };
}

export const EdgeLayer = React.forwardRef<EdgeLayerHandle, IProps>((props, ref) => {
    const { canConnect, edgePathType, edgeRouting, getRootElement, readOnly } = useFlowKitConfig();
    const containerRect = useFlowKitViewportStore((state) => state.containerRect);
    const scale = useFlowKitViewportStore((state) => state.scale);
    const sourceEndpoint = useFlowKitInteractionStore((state) => state.sourceEndpoint);
    const canChangeEdges = useFlowKitRenderStore((state) => state.canChangeEdges);
    const dropEndpoint = useFlowKitInteractionStore((state) => state.dropEndpoint);
    const setSourceEndpoint = useFlowKitInteractionStore((state) => state.setSourceEndpoint);
    const svgRef = React.useRef<SVGSVGElement>(null);
    const markerIdPrefix = React.useId().replace(/:/g, "");
    const drawnEdgeRef = React.useRef<SVGPathElement>(null);
    const propsRef = React.useRef<IProps>(props);
    const containerRectRef = React.useRef<typeof containerRect>(containerRect);
    const scaleRef = React.useRef<number>(scale);
    const readOnlyRef = React.useRef<boolean | undefined>(readOnly);
    const sourceEndpointRef = React.useRef<typeof sourceEndpoint>(sourceEndpoint);
    const dropEndpointRef = React.useRef<typeof dropEndpoint>(dropEndpoint);
    const proximityTargetRef = React.useRef<HTMLElement | null>(null);

    propsRef.current = props;
    containerRectRef.current = containerRect;
    scaleRef.current = scale;
    readOnlyRef.current = readOnly;
    sourceEndpointRef.current = sourceEndpoint;
    dropEndpointRef.current = dropEndpoint;

    const getEndpointById = React.useCallback<(endpointId: string) => IEndpoint<any> | null>((endpointId: string): IEndpoint<any> | null => {
        for (const node of propsRef.current.nodes) {
            const endpoint = node.endpoints.find((item) => item.id === endpointId);

            if (endpoint != null) return endpoint;
        }

        return null;
    }, [edgeRouting]);

    const canCreateConnection = React.useCallback<(source: IEndpoint<any>, target: IEndpoint<any>) => boolean>((
        source: IEndpoint<any>,
        target: IEndpoint<any>
    ): boolean => {
        return canConnect?.({
            source,
            target
        }) !== false;
    }, [canConnect]);

    const setDrawnEdgeVisible = React.useCallback<(visible: boolean) => void>((visible: boolean): void => {
        if (drawnEdgeRef.current == null) return;

        drawnEdgeRef.current.style.display = visible ? "" : "none";

        if (!visible) {
            drawnEdgeRef.current.setAttribute("d", "");
        }
    }, []);

    const startEdgeAtPoint = React.useCallback<(x: number, y: number) => void>((x: number, y: number): void => {
        if (readOnly || !canChangeEdges) return;
        if (sourceEndpointRef.current != null) return;

        const target = getEndpointElementAtPoint(
            getRootElement(),
            x,
            y,
            getProximityConnectOptions(false)
        );

        if (target?.id == null) return;

        const endpoint = getEndpointById(target.id);

        if (endpoint == null) return;

        const offset = target.getBoundingClientRect();

        setSourceEndpoint({ endpoint, offset });
        sourceEndpointRef.current = { endpoint, offset };
        setDrawnEdgeVisible(true);
    }, [canChangeEdges, getEndpointById, readOnly, setDrawnEdgeVisible, setSourceEndpoint]);

    const setProximityTarget = React.useCallback<(target: HTMLElement | null) => void>((target: HTMLElement | null): void => {
        if (proximityTargetRef.current === target) return;

        proximityTargetRef.current?.classList.remove("flow-kit-endpoint-proximity-target");
        target?.classList.add("flow-kit-endpoint-proximity-target");
        proximityTargetRef.current = target;
    }, []);

    const getConnectionTarget = React.useCallback<(x: number, y: number) => HTMLElement | null>((x: number, y: number): HTMLElement | null => {
        const currentSourceEndpoint = sourceEndpointRef.current;
        const targetElement = getEndpointElementAtPoint(
            getRootElement(),
            x,
            y,
            getProximityConnectOptions(propsRef.current.proximityConnect),
            currentSourceEndpoint?.endpoint.id
        );

        if (currentSourceEndpoint == null || targetElement?.id == null) return targetElement;

        const targetEndpoint = getEndpointById(targetElement.id);

        if (targetEndpoint == null) return null;

        return canCreateConnection(currentSourceEndpoint.endpoint, targetEndpoint)
            ? targetElement
            : null;
    }, [getEndpointById, canCreateConnection]);

    const handlePointerMove = React.useCallback<(x: number, y: number) => void>((x: number, y: number): void => {
        const currentSourceEndpoint = sourceEndpointRef.current;
        const currentContainerRect = containerRectRef.current;

        if (drawnEdgeRef.current == null || currentSourceEndpoint == null) return;
        if (currentContainerRect == null) return;

        const sourceElement = findElementById(getRootElement(), currentSourceEndpoint.endpoint.id);

        if (sourceElement == null) return;

        const sourcePosition = getEndpointPosition(sourceElement);

        if (sourcePosition == null) return;

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetEndpoint = getConnectionTarget(x, y);
        const targetOffset = targetEndpoint == null ? { x, y } : getEndpointCenter(targetEndpoint);

        setProximityTarget(targetEndpoint);

        const pathArgs = [
            {
                x: currentContainerRect.left,
                y: currentContainerRect.top
            },
            {
                offset: {
                    x: sourceRect.left,
                    y: sourceRect.top
                },
                position: sourcePosition,
                buffer: sourceRect.width
            },
            {
                offset: {
                    x: targetOffset.x,
                    y: targetOffset.y
                },
                position: getOppositePosition(sourcePosition),
                buffer: 0
            },
            scaleRef.current
        ] as const;
        const path =
            edgePathType === "smooth-step"
                ? getSmoothStep(...pathArgs)
                : edgePathType === "step"
                    ? getOrthogonal(...pathArgs)
                    : edgePathType === "straight"
                        ? getStraight(...pathArgs)
                        : getBezier(...pathArgs);

        if (path == null) return;

        setDrawnEdgeVisible(true);
        drawnEdgeRef.current.setAttribute("d", path);
    }, [edgePathType, getConnectionTarget, setDrawnEdgeVisible, setProximityTarget]);

    const handlePointerRelease = React.useCallback<(x: number, y: number) => void>((x: number, y: number): void => {
        const currentSourceEndpoint = sourceEndpointRef.current;

        if (currentSourceEndpoint == null) return;
        if (readOnlyRef.current || !canChangeEdges) {
            setProximityTarget(null);
            setDrawnEdgeVisible(false);
            setSourceEndpoint(null);
            sourceEndpointRef.current = null;
            return;
        }

        const target = getConnectionTarget(x, y);

        setProximityTarget(null);
        setDrawnEdgeVisible(false);

        if (target?.id == null) {
            setSourceEndpoint(null);
            sourceEndpointRef.current = null;
            return;
        }

        if (target.id === currentSourceEndpoint.endpoint.id) {
            setSourceEndpoint(null);
            sourceEndpointRef.current = null;
            return;
        }

        const alreadyConnected = propsRef.current.edges.some(
            (edge) =>
                edge.sourceId === currentSourceEndpoint.endpoint.id &&
                edge.targetId === target.id
        ) ||
            propsRef.current.edges.some(
                (edge) =>
                    edge.targetId === currentSourceEndpoint.endpoint.id &&
                    edge.sourceId === target.id
            );

        if (!alreadyConnected) {
            dropEndpointRef.current(target.id);
        }

        setSourceEndpoint(null);
        sourceEndpointRef.current = null;
    }, [canChangeEdges, getConnectionTarget, setDrawnEdgeVisible, setProximityTarget, setSourceEndpoint]);

    React.useEffect(() => {
        const onDocumentStart = (e: MouseEvent | PointerEvent): void => {
            startEdgeAtPoint(e.clientX, e.clientY);
        };

        document.addEventListener("mousedown", onDocumentStart, true);
        document.addEventListener("pointerdown", onDocumentStart, true);

        return () => {
            document.removeEventListener("mousedown", onDocumentStart, true);
            document.removeEventListener("pointerdown", onDocumentStart, true);
        };
    }, [startEdgeAtPoint]);

    React.useEffect(() => () => {
        setProximityTarget(null);
    }, [setProximityTarget]);

    React.useImperativeHandle<EdgeLayerHandle, EdgeLayerHandle>(ref, () => ({
        element: svgRef.current,
        handlePointerMove,
        handlePointerRelease,
    }), [handlePointerMove, handlePointerRelease]);

    const renderedEdges = React.useMemo<React.ReactElement[]>(() => {
        const array: React.ReactElement[] = [];
        const nodeKeyByConnectionId = getNodeKeyByConnectionId(props.nodes);
        const parallelOffsets = getParallelEdgeOffsets(
            props.edges,
            nodeKeyByConnectionId,
            edgeRouting?.parallelOffset ?? 0
        );
        const shouldMeasureObstacles =
            edgeRouting?.avoidNodes === true ||
            props.edges.some((edge) => edge.routing?.avoidNodes === true);
        const obstaclesByNodeKey = shouldMeasureObstacles
            ? getNodeObstaclesByKey(
                getRootElement(),
                props.nodes,
                containerRect ?? null,
                scale
            )
            : new Map<string, EdgeRoutingObstacle>();

        props.edges.forEach((edge: IEdge<any>) => {
            const mergedRouting = mergeEdgeRouting(edgeRouting, edge);
            const sourceNodeKey = getEdgeNodeKey(edge, edge.sourceId, nodeKeyByConnectionId);
            const targetNodeKey = getEdgeNodeKey(edge, edge.targetId, nodeKeyByConnectionId);
            const routing: ComputedEdgeRoutingOptions = {
                avoidNodes: mergedRouting.avoidNodes,
                obstacles: mergedRouting.avoidNodes
                    ? Array.from(obstaclesByNodeKey)
                        .filter(([nodeKey]) => nodeKey !== sourceNodeKey && nodeKey !== targetNodeKey)
                        .map(([, obstacle]) => obstacle)
                    : undefined,
                parallelOffset: edge.routing?.parallelOffset ?? parallelOffsets.get(edge.key) ?? 0,
            };

            if (edge.type == null || edge.type === "edge") {
                array.push(
                    <Edge
                        key={edge.key}
                        edge={edge as IEdge<any>}
                        markerIdPrefix={markerIdPrefix}
                        routing={routing}
                        stateClassName={props.edgeStateClassNames?.get(edge.key)}
                    />
                );
            } else if (
                props.edgeTypes != null &&
                props.edgeTypes[edge.type] != null
            ) {
                array.push(
                    <Edge
                        key={edge.key}
                        edge={edge as IEdge<any>}
                        markerIdPrefix={markerIdPrefix}
                        routing={routing}
                        stateClassName={props.edgeStateClassNames?.get(edge.key)}
                        customEdge={props.edgeTypes[edge.type]}
                    />
                );
            } else if (edge.sourceId && edge.targetId) {
                array.push(
                    <Edge
                        key={edge.key}
                        edge={edge as IEdge<any>}
                        markerIdPrefix={markerIdPrefix}
                        routing={routing}
                        stateClassName={props.edgeStateClassNames?.get(edge.key)}
                    />
                );
            }
        });

        return array;
    }, [
        containerRect,
        edgeRouting,
        getRootElement,
        markerIdPrefix,
        props.edgeStateClassNames,
        props.edgeTypes,
        props.edges,
        props.nodes,
        scale,
    ]);

    return (
        <svg className="flow-kit-edges-container" ref={svgRef}>
            <defs>
                {/* Legacy filled arrow — used by the arrows prop and markerStart/End: "arrow" */}
                <marker
                    id={`${markerIdPrefix}-flow-kit-marker-arrow`}
                    markerHeight={7}
                    markerUnits="strokeWidth"
                    markerWidth={7}
                    orient="auto-start-reverse"
                    refX={9}
                    refY={5}
                    viewBox="0 0 10 10"
                >
                    <path className="flow-kit-edge-arrow" d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
                {/* Keep legacy id for backward compat */}
                <marker
                    id={`${markerIdPrefix}-flow-kit-edge-arrow`}
                    markerHeight={7}
                    markerUnits="strokeWidth"
                    markerWidth={7}
                    orient="auto-start-reverse"
                    refX={9}
                    refY={5}
                    viewBox="0 0 10 10"
                >
                    <path className="flow-kit-edge-arrow" d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
                {/* Half-open chevron — navigability / dependency */}
                <marker
                    id={`${markerIdPrefix}-flow-kit-marker-open-arrow`}
                    markerHeight={8}
                    markerUnits="strokeWidth"
                    markerWidth={8}
                    orient="auto-start-reverse"
                    refX={8}
                    refY={5}
                    viewBox="0 0 10 10"
                >
                    <path className="flow-kit-edge-marker-open" d="M 0 0 L 10 5 L 0 10" fill="none" />
                </marker>
                {/* Unfilled triangle — inheritance / generalization */}
                <marker
                    id={`${markerIdPrefix}-flow-kit-marker-hollow-triangle`}
                    markerHeight={10}
                    markerUnits="strokeWidth"
                    markerWidth={10}
                    orient="auto-start-reverse"
                    refX={10}
                    refY={5}
                    viewBox="0 0 10 10"
                >
                    <path className="flow-kit-edge-marker-hollow" d="M 0 0 L 10 5 L 0 10 Z" fill="none" />
                </marker>
                {/* Filled diamond — composition */}
                <marker
                    id={`${markerIdPrefix}-flow-kit-marker-filled-diamond`}
                    markerHeight={8}
                    markerUnits="strokeWidth"
                    markerWidth={14}
                    orient="auto-start-reverse"
                    refX={14}
                    refY={4}
                    viewBox="0 0 14 8"
                >
                    <path className="flow-kit-edge-marker-filled" d="M 0 4 L 7 0 L 14 4 L 7 8 Z" />
                </marker>
                {/* Unfilled diamond — aggregation */}
                <marker
                    id={`${markerIdPrefix}-flow-kit-marker-hollow-diamond`}
                    markerHeight={8}
                    markerUnits="strokeWidth"
                    markerWidth={14}
                    orient="auto-start-reverse"
                    refX={14}
                    refY={4}
                    viewBox="0 0 14 8"
                >
                    <path className="flow-kit-edge-marker-hollow" d="M 0 4 L 7 0 L 14 4 L 7 8 Z" fill="none" />
                </marker>
            </defs>
            {renderedEdges}
            <path className="flow-kit-edge-path" ref={drawnEdgeRef} style={{ display: "none" }} />
        </svg>
    );
});

EdgeLayer.displayName = "EdgeLayer";
