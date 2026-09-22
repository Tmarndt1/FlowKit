import * as React from "react";
import { getBezier } from "../../functions/getBezier";
import { getOrthogonal } from "../../functions/getOrthogonal";
import { getSmoothStep } from "../../functions/getSmoothStep";
import { getStraight } from "../../functions/getStraight";
import { EdgeCollapseMode, IEdge } from "../../interfaces/IEdge";
import { ComputedEdgeRoutingOptions } from "../../functions/edgeRouting";
import {
    NodeFlowContext,
    useNodeFlowSelectionStore,
    useNodeFlowViewportStore
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";
import { EdgeFoldControl } from "./EdgeFoldControl";
import { resolveMarkerEnd, resolveMarkerStart } from "../../functions/edgeMarkers";
import { resolveEdgeAnchors } from "../../functions/edgeAnchors";
import { useEdgeFoldMetrics } from "./useEdgeFoldMetrics";

interface IProps {
    edge: IEdge<any>;
    markerIdPrefix?: string;
    routing?: ComputedEdgeRoutingOptions;
    stateClassName?: string;
    customEdge?: React.ComponentClass | React.FunctionComponent;
}

const EdgeComponent: React.FC<IProps> = (props) =>
{
    const {
        collapsibleEdges,
        edgePathType,
        multiSelect,
        onEdgeCollapsedChange,
        onEdgeCollapsePreviewChange,
        readOnly,
        getRootElement
    } = useFlowKitConfig();
    const stores = React.useContext(NodeFlowContext);
    
    const containerRect = useNodeFlowViewportStore((state) => state.containerRect);
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const selected = useNodeFlowSelectionStore((state) => state.selectedEdgeKeys.has(props.edge.key));
    const selectEdge = useNodeFlowSelectionStore((state) => state.selectEdge);
    const toggleEdge = useNodeFlowSelectionStore((state) => state.toggleEdge);

    const propsRef = React.useRef<IProps>(props);
    const containerRectRef = React.useRef<typeof containerRect>(containerRect);
    const scaleRef = React.useRef<number>(scale);
    const edgeGroupRef = React.useRef<SVGGElement>(null);

    const [path, setPath] = React.useState<string>("");
    const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
    const { measurePathRef, pathFoldMetrics } = useEdgeFoldMetrics(path);

    propsRef.current = props;
    containerRectRef.current = containerRect;
    scaleRef.current = scale;

    const draw = React.useCallback<() => void>((): void =>
    {
        const currentProps = propsRef.current;
        const currentContainerRect = containerRectRef.current;

        if (currentContainerRect == null)
        {
            return;
        }

        const anchors = resolveEdgeAnchors(currentProps.edge, getRootElement());

        if (anchors == null) return;

        const pathType = currentProps.edge.pathType ?? edgePathType ?? "bezier";
        const pathArgs = [
            {
                x: currentContainerRect.left,
                y: currentContainerRect.top
            },
            {
                offset: anchors.source.offset,
                position: anchors.source.position,
                buffer: anchors.source.buffer
            },
            {
                offset: anchors.target.offset,
                position: anchors.target.position,
                buffer: anchors.target.buffer
            },
            scaleRef.current
        ] as const;
        const nextPath =
            pathType === "smooth-step"
                ? getSmoothStep(...pathArgs, 32, 14, currentProps.routing)
                : pathType === "step"
                    ? getOrthogonal(...pathArgs, 32, currentProps.routing)
                    : pathType === "straight"
                        ? getStraight(...pathArgs, currentProps.routing)
                        : getBezier(...pathArgs, 80, currentProps.routing);

        if (nextPath != null)
        {
            setPath(nextPath);
        }
    }, [edgePathType, getRootElement]);

    const stopEdgeDrag = React.useCallback<(e: React.MouseEvent<SVGGElement, MouseEvent>) => void>((e: React.MouseEvent<SVGGElement, MouseEvent>): void =>
    {
        e.stopPropagation();
        e.preventDefault();
    }, []);

    const onSelect = React.useCallback<(e: React.MouseEvent<SVGGElement, MouseEvent>) => void>((e: React.MouseEvent<SVGGElement, MouseEvent>): void =>
    {
        e.stopPropagation();
        e.preventDefault();

        if (multiSelect !== false && (e.shiftKey || e.metaKey || e.ctrlKey)) {
            toggleEdge(propsRef.current.edge);
            return;
        }

        selectEdge(propsRef.current.edge);
    }, [multiSelect, selectEdge, toggleEdge]);

    const clearCollapsePreview = React.useCallback<() => void>((): void => {
        onEdgeCollapsePreviewChange?.({
            edge: propsRef.current.edge,
            mode: null
        });
    }, [onEdgeCollapsePreviewChange]);

    const toggleCollapsed = React.useCallback<(e: React.MouseEvent<SVGGElement, MouseEvent>) => void>((e: React.MouseEvent<SVGGElement, MouseEvent>): void => {
        e.stopPropagation();
        e.preventDefault();

        const edge = propsRef.current.edge;
        const collapsed = edge.collapsed ?? false;

        if (!collapsed) {
            setMenuOpen((current) => !current);
            return;
        }

        setMenuOpen(false);
        clearCollapsePreview();

        onEdgeCollapsedChange?.({
            collapsed: false,
            edge,
            mode: edge.collapseMode ?? "edge"
        });
    }, [clearCollapsePreview, onEdgeCollapsedChange]);

    const chooseCollapseMode = React.useCallback<(
        e: { stopPropagation: () => void; preventDefault: () => void },
        mode: EdgeCollapseMode
    ) => void>((
        e: { stopPropagation: () => void; preventDefault: () => void },
        mode: EdgeCollapseMode
    ): void => {
        e.stopPropagation();
        e.preventDefault();

        setMenuOpen(false);
        clearCollapsePreview();

        onEdgeCollapsedChange?.({
            collapsed: true,
            edge: propsRef.current.edge,
            mode
        });
    }, [clearCollapsePreview, onEdgeCollapsedChange]);

    const previewCollapseMode = React.useCallback<(mode: EdgeCollapseMode) => void>((mode: EdgeCollapseMode): void => {
        onEdgeCollapsePreviewChange?.({
            edge: propsRef.current.edge,
            mode
        });
    }, [onEdgeCollapsePreviewChange]);

    const onCollapseKeyDown = React.useCallback<(e: React.KeyboardEvent<SVGGElement>) => void>((e: React.KeyboardEvent<SVGGElement>): void => {
        if (e.key !== "Enter" && e.key !== " ") return;

        e.stopPropagation();
        e.preventDefault();

        const edge = propsRef.current.edge;
        const collapsed = edge.collapsed ?? false;

        if (!collapsed) {
            setMenuOpen((current) => !current);
            return;
        }

        setMenuOpen(false);
        clearCollapsePreview();

        onEdgeCollapsedChange?.({
            collapsed: false,
            edge,
            mode: edge.collapseMode ?? "edge"
        });
    }, [clearCollapsePreview, onEdgeCollapsedChange]);

    React.useEffect(() => {
        if (!menuOpen) return;

        const onDocumentPointerDown = (event: PointerEvent): void => {
            const target = event.target;

            if (!(target instanceof globalThis.Node)) return;
            if (edgeGroupRef.current?.contains(target)) return;
            if (target instanceof Element && target.closest(".flow-kit-edge-fold-menu-panel") != null) return;

            setMenuOpen(false);
            clearCollapsePreview();
        };

        document.addEventListener("pointerdown", onDocumentPointerDown, true);

        return () => {
            document.removeEventListener("pointerdown", onDocumentPointerDown, true);
        };
    }, [clearCollapsePreview, menuOpen]);

    React.useEffect(() =>
    {
        let count = 0;

        const interval = window.setInterval(() =>
        {
            count++;

            if (containerRectRef.current != null || count > 200)
            {
                draw();
                window.clearInterval(interval);
            }
        }, 20);

        return () =>
        {
            window.clearInterval(interval);
        };
    }, [draw]);

    React.useEffect(() =>
    {
        draw();
    }, [containerRect, draw, props.edge, props.routing, scale]);

    React.useEffect(() => {
        if (stores == null) return;

        let endpointVersion = stores.render.getState().endpointUpdate?.version ?? 0;
        let edgeRenderVersion = stores.render.getState().edgeRenderRequest?.version ?? 0;

        return stores.render.subscribe((state) => {
            const endpointUpdate = state.endpointUpdate;
            const edgeRenderRequest = state.edgeRenderRequest;
            const edge = propsRef.current.edge;
            let shouldDraw = false;

            if (endpointUpdate != null && endpointUpdate.version !== endpointVersion) {
                endpointVersion = endpointUpdate.version;
                shouldDraw = edge.anchorMode === "floating"
                    ? endpointUpdate.nodeKeys.includes(edge.sourceId) ||
                        endpointUpdate.nodeKeys.includes(edge.targetId)
                    : endpointUpdate.endpoints.some(
                        (endpoint) => endpoint.id === edge.sourceId || endpoint.id === edge.targetId
                    );
            }

            if (edgeRenderRequest != null && edgeRenderRequest.version !== edgeRenderVersion) {
                edgeRenderVersion = edgeRenderRequest.version;
                shouldDraw ||= edgeRenderRequest.edgeKey === edge.key;
            }

            if (shouldDraw) draw();
        });
    }, [draw, stores]);

    const edgeGroupProps = {
        id: props.edge.key,
        className: [
            "flow-kit-edge",
            selected ? "flow-kit-selected" : "",
            props.stateClassName ?? "",
            props.edge.className ?? ""
        ].filter(Boolean).join(" "),
        onClick: onSelect,
        onMouseDownCapture: stopEdgeDrag
    };
    const animated = props.edge.animated ?? false;
    const collapsible = !readOnly && (props.edge.collapsible ?? collapsibleEdges ?? false);
    const collapsed = props.edge.collapsed ?? false;
    const collapseMode = props.edge.collapseMode ?? "edge";
    const directionallyFolded = collapsed && (collapseMode === "downstream" || collapseMode === "upstream");
    const visualClassName = [
        "flow-kit-edge-path",
        selected ? "flow-kit-selected" : "",
        animated && !collapsed ? "flow-kit-animated" : "",
        directionallyFolded ? "flow-kit-fold-stub" : "",
        collapsed && !directionallyFolded ? "flow-kit-folded" : ""
    ].filter(Boolean).join(" ");
    // Directional folds keep the visible half of the original path by trimming
    // the measured SVG path with dash offsets instead of generating a new path.
    const strokeDasharray = (() => {
        if (directionallyFolded && pathFoldMetrics != null) {
            return `${pathFoldMetrics.midpointLength} ${pathFoldMetrics.length}`;
        }
        const style = props.edge.strokeStyle ?? "solid";
        if (style === "dashed") return "8 5";
        if (style === "dotted") return "2 4";
        return undefined;
    })();
    const visualStyle: React.CSSProperties = {
        ...(props.edge.style ?? {}),
        strokeDasharray,
        ...(directionallyFolded && pathFoldMetrics != null
            ? { strokeDashoffset: collapseMode === "upstream" ? -pathFoldMetrics.midpointLength : 0 }
            : {})
    };
    const markerStart =
        !(directionallyFolded && collapseMode === "upstream")
            ? resolveMarkerStart(props.edge, props.markerIdPrefix)
            : undefined;
    const markerEnd =
        !(directionallyFolded && collapseMode === "downstream")
            ? resolveMarkerEnd(props.edge, props.markerIdPrefix)
            : undefined;
    const foldMenuPortalPosition = containerRect != null && pathFoldMetrics != null
        ? {
            x: containerRect.left + pathFoldMetrics.midpoint.x * scale,
            y: containerRect.top + pathFoldMetrics.midpoint.y * scale
        }
        : null;

    if (props.customEdge)
    {
        const customProps = {
            ...props.edge,
            path,
            selected
        };

        return (
            <g {...edgeGroupProps}>
                <path
                    className="flow-kit-edge-hitbox"
                    d={path}
                />
                {React.createElement(props.customEdge, customProps as any)}
            </g>
        );
    }

    return (
        <g {...edgeGroupProps} ref={edgeGroupRef}>
            <path
                className="flow-kit-edge-measure"
                d={path}
                ref={measurePathRef}
            />

            <path
                className="flow-kit-edge-hitbox"
                d={path}
            />

            <path
                className={visualClassName}
                d={path}
                markerEnd={markerEnd}
                markerStart={markerStart}
                style={visualStyle}
            />

            {props.edge.label != null && !collapsed && pathFoldMetrics != null && (
                <g
                    className="flow-kit-edge-label"
                    transform={`translate(${pathFoldMetrics.midpoint.x}, ${pathFoldMetrics.midpoint.y})`}
                >
                    <rect className="flow-kit-edge-label-background" x={-54} y={-14} width={108} height={28} />
                    <text className="flow-kit-edge-label-text" dominantBaseline="middle" textAnchor="middle">
                        {props.edge.label}
                    </text>
                </g>
            )}

            {collapsible && pathFoldMetrics != null && (
                <EdgeFoldControl
                    collapsed={collapsed}
                    menuOpen={menuOpen}
                    onChooseMode={chooseCollapseMode}
                    onClearPreview={clearCollapsePreview}
                    onKeyDown={onCollapseKeyDown}
                    onPreviewMode={previewCollapseMode}
                    onToggle={toggleCollapsed}
                    pathFoldMetrics={pathFoldMetrics}
                    portalPosition={foldMenuPortalPosition}
                />
            )}
        </g>
    );
};

export const Edge = React.memo(
    EdgeComponent,
    (prevProps, nextProps) =>
        prevProps.edge === nextProps.edge &&
        prevProps.routing === nextProps.routing &&
        prevProps.stateClassName === nextProps.stateClassName &&
        prevProps.customEdge === nextProps.customEdge
);
