import * as React from "react";
import { IEndpoint } from "../../interfaces/IEndpoint";
import { INodeContainer } from "../../interfaces/INodeContainer";
import { INode } from "../../interfaces/INode";
import { IOffset } from "../../interfaces/IOffset";
import {
    useNodeFlowInteractionStore,
    useNodeFlowRenderStore,
    useNodeFlowSnapStore,
    useNodeFlowViewportStore,
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";

interface ContainerBounds {
    x: number;
    y: number;
    width: number;
    height: number;
    contentWidth: number;
    contentHeight: number;
}

interface IProps {
    container: INodeContainer;
    customContainer?: React.ComponentClass | React.FunctionComponent<any>;
    nodes: INode<any, any>[];
    onDragEnd?: (containerKey: string) => void;
    onResizeEnd?: (containerKey: string) => void;
}

type ResizeDirection = "east" | "south" | "southeast";

function snapValue(value: number, size: number): number {
    return Math.round(value / size) * size;
}

function getNodeBounds(node: INode<any, any>): ContainerBounds {
    const element = document.getElementById(node.key);
    const width = element?.offsetWidth ?? 140;
    const height = element?.offsetHeight ?? 80;

    return {
        x: node.offset.x,
        y: node.offset.y,
        width,
        height,
        contentWidth: width,
        contentHeight: height,
    };
}

function getStyleDimension(value: React.CSSProperties[keyof React.CSSProperties]): number | undefined {
    return typeof value === "number" ? value : undefined;
}

// Returns the minimum width/height needed to fully enclose contained nodes,
// regardless of resizeToFit. Used to enforce a hard floor during user resize.
function getNodeContentSize(container: INodeContainer, nodes: INode<any, any>[]): { contentWidth: number; contentHeight: number } {
    const containedNodes = nodes.filter((node) => container.nodeKeys.includes(node.key));
    const padding = container.padding ?? 24;

    if (containedNodes.length === 0) {
        return { contentWidth: padding * 2, contentHeight: padding * 2 + 28 };
    }

    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    containedNodes.forEach((node) => {
        const b = getNodeBounds(node);
        left = Math.min(left, b.x);
        top = Math.min(top, b.y);
        right = Math.max(right, b.x + b.width);
        bottom = Math.max(bottom, b.y + b.height);
    });

    if (!isFinite(left)) return { contentWidth: padding * 2, contentHeight: padding * 2 + 28 };

    return {
        contentWidth: right - left + padding * 2,
        contentHeight: bottom - top + padding * 2 + 28,
    };
}

function getContainerBounds(container: INodeContainer, nodes: INode<any, any>[]): ContainerBounds | null {
    const containedNodes = nodes.filter((node) => container.nodeKeys.includes(node.key));
    const padding = container.padding ?? 24;
    const styleWidth = getStyleDimension(container.style?.width);
    const styleHeight = getStyleDimension(container.style?.height);
    const styleMinWidth = getStyleDimension(container.style?.minWidth);
    const styleMinHeight = getStyleDimension(container.style?.minHeight);

    if (container.resizeToFit === false && container.position != null && styleWidth != null && styleHeight != null) {
        return {
            x: container.position.x,
            y: container.position.y,
            width: Math.max(styleWidth, styleMinWidth ?? 80),
            height: Math.max(styleHeight, styleMinHeight ?? 44),
            contentWidth: padding * 2,
            contentHeight: padding * 2 + 28,
        };
    }

    if (containedNodes.length < 1) {
        if (container.position == null) return null;

        const width = Math.max(styleWidth ?? 160, styleMinWidth ?? 80);
        const height = Math.max(styleHeight ?? 120, styleMinHeight ?? 44);

        return {
            x: container.position.x,
            y: container.position.y,
            width,
            height,
            contentWidth: padding * 2,
            contentHeight: padding * 2 + 28,
        };
    }

    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    containedNodes.forEach((node) => {
        const bounds = getNodeBounds(node);

        left = Math.min(left, bounds.x);
        top = Math.min(top, bounds.y);
        right = Math.max(right, bounds.x + bounds.width);
        bottom = Math.max(bottom, bounds.y + bounds.height);
    });

    if (!isFinite(left) || !isFinite(top) || !isFinite(right) || !isFinite(bottom)) return null;

    const contentWidth = right - left + padding * 2;
    const contentHeight = bottom - top + padding * 2 + 28;

    return {
        x: left - padding,
        y: top - padding - 28,
        width: Math.max(contentWidth, styleWidth ?? contentWidth, styleMinWidth ?? 0),
        height: Math.max(contentHeight, styleHeight ?? contentHeight, styleMinHeight ?? 0),
        contentWidth,
        contentHeight,
    };
}

function isNodeCenterInsideElement(nodeKey: string, element: HTMLElement | null): boolean {
    const nodeElement = document.getElementById(nodeKey);
    const nodeRect = nodeElement?.getBoundingClientRect();
    const containerRect = element?.getBoundingClientRect();

    if (nodeRect == null || containerRect == null) return false;

    const nodeCenter = {
        x: nodeRect.left + nodeRect.width / 2,
        y: nodeRect.top + nodeRect.height / 2,
    };

    return (
        nodeCenter.x >= containerRect.left &&
        nodeCenter.x <= containerRect.right &&
        nodeCenter.y >= containerRect.top &&
        nodeCenter.y <= containerRect.bottom
    );
}

export const NodeContainer: React.FC<IProps> = (props) => {
    const { readOnly } = useFlowKitConfig();
    const draggedNode = useNodeFlowInteractionStore((state) => state.draggedNode);
    const dragUpdateVersion = useNodeFlowInteractionStore((state) => state.dragUpdateVersion);
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const snapContainers = useNodeFlowSnapStore((state) => state.containers);
    const snapEnabled = useNodeFlowSnapStore((state) => state.enabled);
    const snapSize = useNodeFlowSnapStore((state) => state.size);
    const notifyEndpointsChanged = useNodeFlowRenderStore((state) => state.notifyEndpointsChanged);
    const setDraggingNode = useNodeFlowInteractionStore((state) => state.setDraggingNode);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const propsRef = React.useRef<IProps>(props);
    const scaleRef = React.useRef<number>(scale);
    const mouseDownRef = React.useRef<boolean>(false);
    const resizingRef = React.useRef<boolean>(false);
    const resizeDirectionRef = React.useRef<ResizeDirection>("southeast");
    const cursorPosRef = React.useRef<IOffset>({ x: 0, y: 0 });
    const frozenDragBoundsRef = React.useRef<ContainerBounds | null>(null);
    const originalNodePositionsRef = React.useRef<Map<string, IOffset>>(new Map());
    const originalBoundsRef = React.useRef<ContainerBounds | null>(null);
    const notifyEndpointsChangedRef = React.useRef<typeof notifyEndpointsChanged>(notifyEndpointsChanged);
    const onDragEndRef = React.useRef<typeof props.onDragEnd>(props.onDragEnd);
    const onResizeEndRef = React.useRef<typeof props.onResizeEnd>(props.onResizeEnd);
    const snapRef = React.useRef<{ containers: boolean; enabled: boolean; size: number }>({ containers: snapContainers, enabled: snapEnabled, size: snapSize });
    const setDraggingNodeRef = React.useRef<typeof setDraggingNode>(setDraggingNode);

    propsRef.current = props;
    scaleRef.current = scale;
    notifyEndpointsChangedRef.current = notifyEndpointsChanged;
    onDragEndRef.current = props.onDragEnd;
    onResizeEndRef.current = props.onResizeEnd;
    snapRef.current = { containers: snapContainers, enabled: snapEnabled, size: snapSize };
    setDraggingNodeRef.current = setDraggingNode;

    const moveContainedNodes = React.useCallback<(dx: number, dy: number) => void>((dx: number, dy: number): void => {
        const containedNodeKeys = new Set(propsRef.current.container.nodeKeys);
        const movedEndpoints: IEndpoint<any>[] = [];

        propsRef.current.nodes.forEach((node) => {
            if (!containedNodeKeys.has(node.key)) return;

            const originalPosition = originalNodePositionsRef.current.get(node.key);

            if (originalPosition == null) return;

            const x = Math.round(originalPosition.x + dx);
            const y = Math.round(originalPosition.y + dy);

            node.offset.x = x;
            node.offset.y = y;

            const element = document.getElementById(node.key);

            if (element != null) {
                element.style.transform = `translate(${x}px, ${y}px)`;
            }

            movedEndpoints.push(...node.endpoints);
        });

        notifyEndpointsChangedRef.current(movedEndpoints);
    }, []);

    const onMouseMove = React.useCallback<(e: MouseEvent) => void>((e: MouseEvent): void => {
        if (!mouseDownRef.current) return;

        let dx = (e.clientX - cursorPosRef.current.x) / scaleRef.current;
        let dy = (e.clientY - cursorPosRef.current.y) / scaleRef.current;
        const originalBounds = originalBoundsRef.current;

        if (resizingRef.current) {
            if (originalBounds == null || containerRef.current == null) return;

            const currentContainer = propsRef.current.container;
            const minWidth = Math.max(originalBounds.contentWidth, getStyleDimension(currentContainer.style?.minWidth) ?? 0);
            const minHeight = Math.max(originalBounds.contentHeight, getStyleDimension(currentContainer.style?.minHeight) ?? 0);
            const width =
                resizeDirectionRef.current === "east" || resizeDirectionRef.current === "southeast"
                    ? Math.max(minWidth, Math.round(originalBounds.width + dx))
                    : originalBounds.width;
            const height =
                resizeDirectionRef.current === "south" || resizeDirectionRef.current === "southeast"
                    ? Math.max(minHeight, Math.round(originalBounds.height + dy))
                    : originalBounds.height;

            currentContainer.style = { ...currentContainer.style, width, height };
            containerRef.current.style.width = `${width}px`;
            containerRef.current.style.height = `${height}px`;
            return;
        }

        if (originalBounds != null && snapRef.current.enabled && snapRef.current.containers) {
            dx = snapValue(originalBounds.x + dx, snapRef.current.size) - originalBounds.x;
            dy = snapValue(originalBounds.y + dy, snapRef.current.size) - originalBounds.y;
        }

        if (originalBounds != null && containerRef.current != null) {
            propsRef.current.container.position = {
                x: Math.round(originalBounds.x + dx),
                y: Math.round(originalBounds.y + dy),
            };

            containerRef.current.style.transform =
                `translate(${originalBounds.x + dx}px, ${originalBounds.y + dy}px)`;
        }

        moveContainedNodes(dx, dy);
    }, [moveContainedNodes]);

    const onMouseUp = React.useCallback<(e: MouseEvent) => void>((e: MouseEvent): void => {
        mouseDownRef.current = false;
        const wasResizing = resizingRef.current;
        resizingRef.current = false;
        setDraggingNodeRef.current(false);
        e.stopPropagation();
        e.preventDefault();
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);
        if (wasResizing) onResizeEndRef.current?.(propsRef.current.container.key);
        else onDragEndRef.current?.(propsRef.current.container.key);
    }, [onMouseMove]);

    const onMouseDown = React.useCallback<(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void>((e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        if (readOnly) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        const containedNodeKeys = new Set(propsRef.current.container.nodeKeys);
        const bounds = getContainerBounds(propsRef.current.container, propsRef.current.nodes);

        if (bounds == null) return;

        originalNodePositionsRef.current = new Map(
            propsRef.current.nodes
                .filter((node) => containedNodeKeys.has(node.key))
                .map((node) => [node.key, { x: node.offset.x, y: node.offset.y }])
        );

        originalBoundsRef.current = bounds;
        cursorPosRef.current = { x: e.clientX, y: e.clientY };
        mouseDownRef.current = true;
        resizingRef.current = false;
        setDraggingNodeRef.current(true);
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        e.preventDefault();
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);
    }, [onMouseMove, onMouseUp, readOnly]);

    const onResizeMouseDown = React.useCallback<(direction: ResizeDirection) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void>(
        (direction: ResizeDirection) =>
            (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
                if (readOnly) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }

                const bounds = getContainerBounds(propsRef.current.container, propsRef.current.nodes);

                if (bounds == null) return;

                // Always measure actual node content so the resize floor accounts for
                // nodes even when resizeToFit is false (where getContainerBounds only
                // returns padding as contentWidth/contentHeight).
                const nodeContentSize = getNodeContentSize(propsRef.current.container, propsRef.current.nodes);

                resizeDirectionRef.current = direction;
                originalBoundsRef.current = { ...bounds, ...nodeContentSize };
                cursorPosRef.current = { x: e.clientX, y: e.clientY };
                mouseDownRef.current = true;
                resizingRef.current = true;
                setDraggingNodeRef.current(true);
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                e.preventDefault();
                document.addEventListener("mouseup", onMouseUp);
                document.addEventListener("mousemove", onMouseMove);
            },
        [onMouseMove, onMouseUp, readOnly]
    );

    React.useEffect(() => {
        return () => {
            setDraggingNodeRef.current(false);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
        };
    }, [onMouseMove, onMouseUp]);

    const currentBounds = getContainerBounds(props.container, props.nodes);
    const isDraggingContainedNode = draggedNode != null && props.container.nodeKeys.includes(draggedNode.key);

    if (draggedNode == null) {
        frozenDragBoundsRef.current = null;
    } else if (
        props.container.resizeToFit === false &&
        isDraggingContainedNode &&
        frozenDragBoundsRef.current == null &&
        currentBounds != null
    ) {
        frozenDragBoundsRef.current = currentBounds;
    }

    const bounds = props.container.resizeToFit === false && isDraggingContainedNode
        ? frozenDragBoundsRef.current ?? currentBounds
        : currentBounds;

    if (bounds == null) return null;

    const style: React.CSSProperties = {
        width: bounds.width,
        height: bounds.height,
        transform: `translate(${bounds.x}px, ${bounds.y}px)`,
        ...(props.container.style ?? {}),
    };
    const isDraggingOverContainer = draggedNode != null &&
        !isDraggingContainedNode &&
        isNodeCenterInsideElement(draggedNode.key, containerRef.current);
    const isDraggingOut = isDraggingContainedNode &&
        !isNodeCenterInsideElement(draggedNode.key, containerRef.current);
    const className = [
        "flow-kit-node-container",
        props.container.className ?? "",
        isDraggingOverContainer ? "flow-kit-node-container-drop-target" : "",
        isDraggingOut ? "flow-kit-node-container-dragging-out" : "",
    ].filter(Boolean).join(" ");

    void dragUpdateVersion;

    if (props.customContainer != null) {
        const customProps = { ...props.container, className, style };

        return (
            <div
                className={className}
                data-container-key={props.container.key}
                data-node-keys={props.container.nodeKeys.join(" ")}
                ref={containerRef}
                style={style}
                onMouseDownCapture={onMouseDown}
            >
                {React.createElement(props.customContainer, customProps)}
            </div>
        );
    }

    return (
        <div
            className={className}
            data-container-key={props.container.key}
            data-node-keys={props.container.nodeKeys.join(" ")}
            ref={containerRef}
            style={style}
        >
            <div className="flow-kit-node-container-header" onMouseDownCapture={onMouseDown}>
                {props.container.label ?? props.container.key}
            </div>
            <div
                className="flow-kit-node-container-resize flow-kit-node-container-resize-east"
                onMouseDownCapture={onResizeMouseDown("east")}
            />
            <div
                className="flow-kit-node-container-resize flow-kit-node-container-resize-south"
                onMouseDownCapture={onResizeMouseDown("south")}
            />
            <div
                className="flow-kit-node-container-resize flow-kit-node-container-resize-southeast"
                onMouseDownCapture={onResizeMouseDown("southeast")}
            />
        </div>
    );
};
