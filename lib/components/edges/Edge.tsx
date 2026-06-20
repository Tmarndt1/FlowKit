import * as React from "react";
import { getBezier } from "../../functions/getBezier";
import { getOrthogonal } from "../../functions/getOrthogonal";
import { getSmoothStep } from "../../functions/getSmoothStep";
import { EdgeCollapseMode, IEdge } from "../../interfaces/IEdge";
import {
    useNodeFlowRenderStore,
    useNodeFlowSelectionStore,
    useNodeFlowViewportStore
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";
import { EdgeFoldControl } from "./EdgeFoldControl";
import { hasSourceArrow, hasTargetArrow } from "../../functions/edgeMarkers";
import { resolveEdgeAnchors } from "../../functions/edgeAnchors";
import { useEdgeFoldMetrics } from "./useEdgeFoldMetrics";

interface IProps {
    edge: IEdge<any>;
    stateClassName?: string;
    customEdge?: React.ComponentClass | React.FunctionComponent;
}

const EdgeComponent: React.FC<IProps> = (props) =>
{
    const {
        animatedEdges,
        collapsibleEdges,
        edgePathType,
        onEdgeCollapsedChange,
        onEdgeCollapsePreviewChange,
        readOnly
    } = useFlowKitConfig();
    
    const containerRect = useNodeFlowViewportStore((state) => state.containerRect);
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const selected = useNodeFlowSelectionStore((state) => state.selectedEdge?.key === props.edge.key);
    const endpointUpdate = useNodeFlowRenderStore((state) => state.endpointUpdate);
    const edgeRenderRequest = useNodeFlowRenderStore((state) => state.edgeRenderRequest);
    const selectEdge = useNodeFlowSelectionStore((state) => state.selectEdge);

    const propsRef = React.useRef(props);
    const containerRectRef = React.useRef(containerRect);
    const scaleRef = React.useRef(scale);
    const edgeGroupRef = React.useRef<SVGGElement>(null);

    const [path, setPath] = React.useState<string>("");
    const [menuOpen, setMenuOpen] = React.useState<boolean>(false);
    const { measurePathRef, pathFoldMetrics } = useEdgeFoldMetrics(path);

    propsRef.current = props;
    containerRectRef.current = containerRect;
    scaleRef.current = scale;

    const draw = React.useCallback((): void =>
    {
        const currentProps = propsRef.current;
        const currentContainerRect = containerRectRef.current;

        if (currentContainerRect == null)
        {
            return;
        }

        const anchors = resolveEdgeAnchors(currentProps.edge);

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
                ? getSmoothStep(...pathArgs)
                : pathType === "step"
                    ? getOrthogonal(...pathArgs)
                    : getBezier(...pathArgs);

        if (nextPath != null)
        {
            setPath(nextPath);
        }
    }, [edgePathType]);

    const stopEdgeDrag = React.useCallback((e: React.MouseEvent<SVGGElement, MouseEvent>): void =>
    {
        e.stopPropagation();
        e.preventDefault();
    }, []);

    const onSelect = React.useCallback((e: React.MouseEvent<SVGGElement, MouseEvent>): void =>
    {
        e.stopPropagation();
        e.preventDefault();

        selectEdge(propsRef.current.edge);
    }, [selectEdge]);

    const clearCollapsePreview = React.useCallback((): void => {
        onEdgeCollapsePreviewChange?.({
            edge: propsRef.current.edge,
            mode: null
        });
    }, [onEdgeCollapsePreviewChange]);

    const toggleCollapsed = React.useCallback((e: React.MouseEvent<SVGGElement, MouseEvent>): void => {
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

    const chooseCollapseMode = React.useCallback((
        e: React.MouseEvent<HTMLElement, MouseEvent>,
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

    const previewCollapseMode = React.useCallback((mode: EdgeCollapseMode): void => {
        onEdgeCollapsePreviewChange?.({
            edge: propsRef.current.edge,
            mode
        });
    }, [onEdgeCollapsePreviewChange]);

    const onCollapseKeyDown = React.useCallback((e: React.KeyboardEvent<SVGGElement>): void => {
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
    }, [containerRect, draw, scale]);

    React.useEffect(() =>
    {
        if (props.edge.anchorMode === "floating") {
            draw();
            return;
        }

        if (
            endpointUpdate?.endpoints.some(
                (endpoint) =>
                    endpoint.id === props.edge.sourceId ||
                    endpoint.id === props.edge.targetId
            )
        )
        {
            draw();
        }
    }, [draw, endpointUpdate, props.edge.anchorMode, props.edge.sourceId, props.edge.targetId]);

    React.useEffect(() =>
    {
        if (edgeRenderRequest?.edgeKey === props.edge.key)
        {
            draw();
        }
    }, [draw, edgeRenderRequest, props.edge.key]);

    const edgeGroupProps = {
        id: props.edge.key,
        className: [
            "flow-kit-edge",
            selected ? "selected" : "",
            props.stateClassName ?? "",
            props.edge.className ?? ""
        ].filter(Boolean).join(" "),
        onClick: onSelect,
        onMouseDownCapture: stopEdgeDrag
    };
    const animated = props.edge.animated ?? animatedEdges ?? false;
    const collapsible = !readOnly && (props.edge.collapsible ?? collapsibleEdges ?? false);
    const collapsed = props.edge.collapsed ?? false;
    const collapseMode = props.edge.collapseMode ?? "edge";
    const directionallyFolded = collapsed && (collapseMode === "downstream" || collapseMode === "upstream");
    const visualClassName = [
        "flow-kit-edge-path",
        selected ? "selected" : "",
        animated && !collapsed ? "animated" : "",
        directionallyFolded ? "fold-stub" : "",
        collapsed && !directionallyFolded ? "folded" : ""
    ].filter(Boolean).join(" ");
    // Directional folds keep the visible half of the original path by trimming
    // the measured SVG path with dash offsets instead of generating a new path.
    const visualStyle: React.CSSProperties = {
        ...(props.edge.style ?? {}),
        ...(directionallyFolded && pathFoldMetrics != null
            ? {
                strokeDasharray: `${pathFoldMetrics.midpointLength} ${pathFoldMetrics.length}`,
                strokeDashoffset: collapseMode === "upstream" ? -pathFoldMetrics.midpointLength : 0
            }
            : {})
    };
    const markerStart =
        hasSourceArrow(props.edge) && !(directionallyFolded && collapseMode === "upstream")
            ? "url(#flow-kit-edge-arrow)"
            : undefined;
    const markerEnd =
        hasTargetArrow(props.edge) && !(directionallyFolded && collapseMode === "downstream")
            ? "url(#flow-kit-edge-arrow)"
            : undefined;
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
                className="flow-kit-edge-measurement-path"
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
                />
            )}
        </g>
    );
};

export const Edge = React.memo(
    EdgeComponent,
    (prevProps, nextProps) =>
        prevProps.edge === nextProps.edge &&
        prevProps.stateClassName === nextProps.stateClassName &&
        prevProps.customEdge === nextProps.customEdge
);
