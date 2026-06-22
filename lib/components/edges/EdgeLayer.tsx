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
    useNodeFlowInteractionStore,
    useNodeFlowViewportStore
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";

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
    x: number,
    y: number,
    options: Required<ProximityConnectOptions>,
    sourceEndpointId?: string
): HTMLElement | null {
    const directHit = document
        .elementFromPoint(x, y)
        ?.closest<HTMLElement>(".flow-kit-endpoint");

    if (directHit != null && directHit.id !== sourceEndpointId) return directHit;
    if (!options.enabled || options.radius <= 0) return null;

    let closestEndpoint: HTMLElement | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    document.querySelectorAll<HTMLElement>(".flow-kit-endpoint").forEach((endpoint) => {
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

function getEdgeNodeKey(edge: IEdge<any>, connectionId: string, nodes: INode<any, any>[]): string {
    if (edge.anchorMode === "floating") return connectionId;

    return nodes.find((node) => node.endpoints.some((endpoint) => endpoint.id === connectionId))?.key ?? connectionId;
}

function getEdgePairKey(edge: IEdge<any>, nodes: INode<any, any>[]): string {
    const sourceKey = getEdgeNodeKey(edge, edge.sourceId, nodes);
    const targetKey = getEdgeNodeKey(edge, edge.targetId, nodes);

    return [sourceKey, targetKey].sort().join("::");
}

function getParallelEdgeOffsets(edges: IEdge<any>[], nodes: INode<any, any>[], spacing: number): Map<string, number> {
    const offsets = new Map<string, number>();

    if (spacing <= 0) return offsets;

    const groups = edges.reduce<Map<string, IEdge<any>[]>>((map, edge) => {
        const key = getEdgePairKey(edge, nodes);
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

function getNodeObstacles(
    edge: IEdge<any>,
    nodes: INode<any, any>[],
    containerRect: DOMRect | null,
    scale: number,
    margin = 24
): EdgeRoutingObstacle[] {
    if (containerRect == null || scale === 0) return [];

    const sourceNodeKey = getEdgeNodeKey(edge, edge.sourceId, nodes);
    const targetNodeKey = getEdgeNodeKey(edge, edge.targetId, nodes);

    return nodes
        .filter((node) => node.key !== sourceNodeKey && node.key !== targetNodeKey)
        .map((node) => {
            const rect = document.getElementById(node.key)?.getBoundingClientRect();

            if (rect == null) return null;

            return {
                x: (rect.left - containerRect.left) / scale - margin,
                y: (rect.top - containerRect.top) / scale - margin,
                width: rect.width / scale + margin * 2,
                height: rect.height / scale + margin * 2,
            };
        })
        .filter((obstacle): obstacle is EdgeRoutingObstacle => obstacle != null);
}

function mergeEdgeRouting(globalRouting: EdgeRoutingOptions | undefined, edge: IEdge<any>): EdgeRoutingOptions {
    return {
        ...(globalRouting ?? {}),
        ...(edge.routing ?? {}),
    };
}

export const EdgeLayer = React.forwardRef<EdgeLayerHandle, IProps>((props, ref) => {
    const { canConnect, edgePathType, edgeRouting, readOnly } = useFlowKitConfig();
    const containerRect = useNodeFlowViewportStore((state) => state.containerRect);
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const sourceEndpoint = useNodeFlowInteractionStore((state) => state.sourceEndpoint);
    const dropEndpoint = useNodeFlowInteractionStore((state) => state.dropEndpoint);
    const setSourceEndpoint = useNodeFlowInteractionStore((state) => state.setSourceEndpoint);
    const svgRef = React.useRef<SVGSVGElement>(null);
    const drawnEdgeRef = React.useRef<SVGPathElement>(null);
    const propsRef = React.useRef(props);
    const containerRectRef = React.useRef(containerRect);
    const scaleRef = React.useRef(scale);
    const sourceEndpointRef = React.useRef(sourceEndpoint);
    const dropEndpointRef = React.useRef(dropEndpoint);
    const proximityTargetRef = React.useRef<HTMLElement | null>(null);

    propsRef.current = props;
    containerRectRef.current = containerRect;
    scaleRef.current = scale;
    sourceEndpointRef.current = sourceEndpoint;
    dropEndpointRef.current = dropEndpoint;

    const getEndpointById = React.useCallback((endpointId: string): IEndpoint<any> | null => {
        for (const node of propsRef.current.nodes) {
            const endpoint = node.endpoints.find((item) => item.id === endpointId);

            if (endpoint != null) return endpoint;
        }

        return null;
    }, [edgeRouting]);

    const canCreateConnection = React.useCallback((
        source: IEndpoint<any>,
        target: IEndpoint<any>
    ): boolean => {
        return canConnect?.({
            source,
            target
        }) !== false;
    }, [canConnect]);

    const setDrawnEdgeVisible = React.useCallback((visible: boolean): void => {
        if (drawnEdgeRef.current == null) return;

        drawnEdgeRef.current.style.display = visible ? "" : "none";

        if (!visible) {
            drawnEdgeRef.current.setAttribute("d", "");
        }
    }, []);

    const startEdgeAtPoint = React.useCallback((x: number, y: number): void => {
        if (readOnly) return;
        if (sourceEndpointRef.current != null) return;

        const target = getEndpointElementAtPoint(
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
    }, [getEndpointById, readOnly, setDrawnEdgeVisible, setSourceEndpoint]);

    const setProximityTarget = React.useCallback((target: HTMLElement | null): void => {
        if (proximityTargetRef.current === target) return;

        proximityTargetRef.current?.classList.remove("flow-kit-endpoint-proximity-target");
        target?.classList.add("flow-kit-endpoint-proximity-target");
        proximityTargetRef.current = target;
    }, []);

    const getConnectionTarget = React.useCallback((x: number, y: number): HTMLElement | null => {
        const currentSourceEndpoint = sourceEndpointRef.current;
        const targetElement = getEndpointElementAtPoint(
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

    const handlePointerMove = React.useCallback((x: number, y: number): void => {
        const currentSourceEndpoint = sourceEndpointRef.current;
        const currentContainerRect = containerRectRef.current;

        if (drawnEdgeRef.current == null || currentSourceEndpoint == null) return;
        if (currentContainerRect == null) return;

        const sourceElement = document.getElementById(currentSourceEndpoint.endpoint.id);

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

    const handlePointerRelease = React.useCallback((x: number, y: number): void => {
        const currentSourceEndpoint = sourceEndpointRef.current;

        if (currentSourceEndpoint == null) return;

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
    }, [getConnectionTarget, setDrawnEdgeVisible, setProximityTarget, setSourceEndpoint]);

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

    React.useImperativeHandle(ref, () => ({
        element: svgRef.current,
        handlePointerMove,
        handlePointerRelease,
    }), [handlePointerMove, handlePointerRelease]);

    const getEdges = React.useCallback((): React.ReactElement[] => {
        const array: React.ReactElement[] = [];
        const currentProps = propsRef.current;
        const parallelOffsets = getParallelEdgeOffsets(
            currentProps.edges,
            currentProps.nodes,
            edgeRouting?.parallelOffset ?? 0
        );

        currentProps.edges.forEach((edge: IEdge<any>) => {
            const mergedRouting = mergeEdgeRouting(edgeRouting, edge);
            const routing: ComputedEdgeRoutingOptions = {
                avoidNodes: mergedRouting.avoidNodes,
                obstacles: mergedRouting.avoidNodes
                    ? getNodeObstacles(edge, currentProps.nodes, containerRectRef.current ?? null, scaleRef.current)
                    : undefined,
                parallelOffset: edge.routing?.parallelOffset ?? parallelOffsets.get(edge.key) ?? 0,
            };

            if (edge.type === "edge") {
                array.push(
                    <Edge
                        key={edge.key}
                        edge={edge as IEdge<any>}
                        routing={routing}
                        stateClassName={currentProps.edgeStateClassNames?.get(edge.key)}
                    />
                );
            } else if (
                currentProps.edgeTypes != null &&
                currentProps.edgeTypes[edge.type] != null
            ) {
                array.push(
                    <Edge
                        key={edge.key}
                        edge={edge as IEdge<any>}
                        routing={routing}
                        stateClassName={currentProps.edgeStateClassNames?.get(edge.key)}
                        customEdge={currentProps.edgeTypes[edge.type]}
                    />
                );
            } else if (edge.sourceId && edge.targetId) {
                array.push(
                    <Edge
                        key={edge.key}
                        edge={edge as IEdge<any>}
                        routing={routing}
                        stateClassName={currentProps.edgeStateClassNames?.get(edge.key)}
                    />
                );
            }
        });

        return array;
    }, []);

    return (
        <svg className="flow-kit-edges-container" ref={svgRef}>
            <defs>
                <marker
                    id="flow-kit-edge-arrow"
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
            </defs>
            {getEdges()}
            <path className="flow-kit-edge-path" ref={drawnEdgeRef} style={{ display: "none" }} />
        </svg>
    );
});

EdgeLayer.displayName = "EdgeLayer";
