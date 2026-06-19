import * as React from "react";
import { INode } from "../interfaces/INode";
import {
    useNodeFlowRenderStore,
    useNodeFlowSelectionStore,
    useNodeFlowViewportStore,
} from "./NodeFlowContext";

/** Corner placement for the built-in minimap. */
export type MiniMapPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface MiniMapNode {
    key: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface MiniMapBounds {
    left: number;
    top: number;
    width: number;
    height: number;
}

/** Props for the built-in minimap overlay. */
export interface FlowKitMiniMapProps {
    /** Additional class for the minimap wrapper. */
    className?: string;
    /** Minimap height in pixels. */
    height?: number;
    /** Optional class resolver for each minimap node. */
    nodeClassName?: (node: INode<any, any>) => string | undefined;
    /** Optional style resolver for each minimap node. */
    nodeStyle?: (node: INode<any, any>) => React.CSSProperties | undefined;
    /** Nodes to show in the minimap. Usually the same nodes passed to FlowKit. */
    nodes: INode<any, any>[];
    /** Extra canvas-space padding around minimap bounds. */
    padding?: number;
    /** Corner placement. Defaults to bottom-right. */
    position?: MiniMapPosition;
    /** Inline styles for the minimap wrapper. */
    style?: React.CSSProperties;
    /** Minimap width in pixels. */
    width?: number;
}

function getNodeElementSize(node: INode<any, any>): { width: number; height: number } {
    const element = document.getElementById(node.key);

    return {
        width: element?.offsetWidth ?? 120,
        height: element?.offsetHeight ?? 56,
    };
}

function getMiniMapBounds(nodes: MiniMapNode[], padding: number): MiniMapBounds | null {
    if (nodes.length < 1) return null;

    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    nodes.forEach((node) => {
        left = Math.min(left, node.x);
        top = Math.min(top, node.y);
        right = Math.max(right, node.x + node.width);
        bottom = Math.max(bottom, node.y + node.height);
    });

    if (!isFinite(left) || !isFinite(top) || !isFinite(right) || !isFinite(bottom)) return null;

    return {
        left: left - padding,
        top: top - padding,
        width: right - left + padding * 2,
        height: bottom - top + padding * 2,
    };
}

function getViewportRect(element: HTMLElement | null): DOMRect | null {
    const flow = element?.closest(".flow-kit");

    return flow?.querySelector<HTMLElement>(".flow-kit-viewport")?.getBoundingClientRect() ?? null;
}

/** Built-in overview minimap that tracks node bounds and viewport position. */
export const FlowKitMiniMap: React.FC<FlowKitMiniMapProps> = (props) => {
    const width = props.width ?? 180;
    const height = props.height ?? 120;
    const padding = props.padding ?? 48;
    const position = props.position ?? "bottom-right";
    const offset = useNodeFlowViewportStore((state) => state.offset);
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const endpointUpdateVersion = useNodeFlowRenderStore((state) => state.endpointUpdate?.version ?? 0);
    const selectedNodeKey = useNodeFlowSelectionStore((state) => state.selectedNode?.key ?? null);
    const miniMapRef = React.useRef<HTMLDivElement>(null);
    const [viewportRect, setViewportRect] = React.useState<DOMRect | null>(null);
    const [measurementVersion, setMeasurementVersion] = React.useState(0);

    React.useLayoutEffect(() => {
        const updateViewportRect = (): void => {
            setViewportRect(getViewportRect(miniMapRef.current));
        };

        const updateMeasurements = (): void => {
            updateViewportRect();
            setMeasurementVersion((version) => version + 1);
        };

        updateViewportRect();

        const flow = miniMapRef.current?.closest(".flow-kit");
        const viewport = flow?.querySelector<HTMLElement>(".flow-kit-viewport");
        let frameId = window.requestAnimationFrame(updateMeasurements);

        if (typeof ResizeObserver === "undefined") {
            return () => {
                window.cancelAnimationFrame(frameId);
            };
        }

        const resizeObserver = new ResizeObserver(updateMeasurements);

        if (viewport != null) resizeObserver.observe(viewport);
        props.nodes.forEach((node) => {
            const nodeElement = document.getElementById(node.key);

            if (nodeElement != null) resizeObserver.observe(nodeElement);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
        };
    }, [props.nodes]);

    const miniMapNodes = React.useMemo<MiniMapNode[]>(
        () =>
            props.nodes.map((node) => {
                const size = getNodeElementSize(node);

                return {
                    key: node.key,
                    x: node.offset.x,
                    y: node.offset.y,
                    width: size.width,
                    height: size.height,
                };
            }),
        [endpointUpdateVersion, measurementVersion, props.nodes]
    );
    const bounds = React.useMemo(
        () => getMiniMapBounds(miniMapNodes, padding),
        [miniMapNodes, padding]
    );

    if (bounds == null) return null;

    const miniScale = Math.min(width / bounds.width, height / bounds.height);
    const contentWidth = bounds.width * miniScale;
    const contentHeight = bounds.height * miniScale;
    const contentX = (width - contentWidth) / 2;
    const contentY = (height - contentHeight) / 2;
    const viewportStyle: React.CSSProperties | undefined =
        viewportRect == null
            ? undefined
            : {
                height: (viewportRect.height / scale) * miniScale,
                transform: `translate(${contentX + ((-offset.x / scale) - bounds.left) * miniScale}px, ${contentY + ((-offset.y / scale) - bounds.top) * miniScale}px)`,
                width: (viewportRect.width / scale) * miniScale,
            };
    const className = [
        "flow-kit-mini-map",
        `flow-kit-mini-map-${position}`,
        props.className,
    ].filter(Boolean).join(" ");

    return (
        <div
            className={className}
            ref={miniMapRef}
            style={{ width, height, ...props.style }}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            <div
                className="flow-kit-mini-map-content"
                style={{
                    height: contentHeight,
                    transform: `translate(${contentX}px, ${contentY}px)`,
                    width: contentWidth,
                }}
            >
                {miniMapNodes.map((node) => {
                    const sourceNode = props.nodes.find((item) => item.key === node.key);
                    const nodeClassName = sourceNode == null ? undefined : props.nodeClassName?.(sourceNode);
                    const nodeStyle = sourceNode == null ? undefined : props.nodeStyle?.(sourceNode);
                    const className = [
                        "flow-kit-mini-map-node",
                        nodeClassName,
                        node.key === selectedNodeKey ? "flow-kit-mini-map-node-selected" : undefined,
                    ].filter(Boolean).join(" ");

                    return (
                        <div
                            className={className}
                            key={node.key}
                            style={{
                                height: Math.max(3, node.height * miniScale),
                                transform: `translate(${(node.x - bounds.left) * miniScale}px, ${(node.y - bounds.top) * miniScale}px)`,
                                width: Math.max(3, node.width * miniScale),
                                ...nodeStyle,
                            }}
                        />
                    );
                })}
            </div>
            {viewportStyle != null && (
                <div className="flow-kit-mini-map-viewport" style={viewportStyle} />
            )}
        </div>
    );
};
