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
    nodes: INode<any, any>[];
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

function getContainerBounds(container: INodeContainer, nodes: INode<any, any>[]): ContainerBounds | null {
    const containedNodes = nodes.filter((node) => container.nodeKeys.includes(node.key));
    const padding = container.padding ?? 24;

    if (containedNodes.length < 1) {
        if (container.position == null) return null;

        const width = Math.max(container.width ?? 160, container.minWidth ?? 80);
        const height = Math.max(container.height ?? 120, container.minHeight ?? 44);

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
        width: Math.max(contentWidth, container.width ?? contentWidth, container.minWidth ?? 0),
        height: Math.max(contentHeight, container.height ?? contentHeight, container.minHeight ?? 0),
        contentWidth,
        contentHeight,
    };
}

export const NodeContainer: React.FC<IProps> = (props) => {
    const { readOnly } = useFlowKitConfig();
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const snapContainers = useNodeFlowSnapStore((state) => state.containers);
    const snapEnabled = useNodeFlowSnapStore((state) => state.enabled);
    const snapSize = useNodeFlowSnapStore((state) => state.size);
    const notifyEndpointsChanged = useNodeFlowRenderStore((state) => state.notifyEndpointsChanged);
    const setDraggingNode = useNodeFlowInteractionStore((state) => state.setDraggingNode);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const propsRef = React.useRef(props);
    const scaleRef = React.useRef(scale);
    const mouseDownRef = React.useRef<boolean>(false);
    const resizingRef = React.useRef<boolean>(false);
    const resizeDirectionRef = React.useRef<ResizeDirection>("southeast");
    const cursorPosRef = React.useRef<IOffset>({ x: 0, y: 0 });
    const originalNodePositionsRef = React.useRef<Map<string, IOffset>>(new Map());
    const originalBoundsRef = React.useRef<ContainerBounds | null>(null);
    const notifyEndpointsChangedRef = React.useRef(notifyEndpointsChanged);
    const snapRef = React.useRef({ containers: snapContainers, enabled: snapEnabled, size: snapSize });
    const setDraggingNodeRef = React.useRef(setDraggingNode);

    propsRef.current = props;
    scaleRef.current = scale;
    notifyEndpointsChangedRef.current = notifyEndpointsChanged;
    snapRef.current = { containers: snapContainers, enabled: snapEnabled, size: snapSize };
    setDraggingNodeRef.current = setDraggingNode;

    const moveContainedNodes = React.useCallback((dx: number, dy: number): void => {
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

    const onMouseMove = React.useCallback((e: MouseEvent): void => {
        if (!mouseDownRef.current) return;

        let dx = (e.clientX - cursorPosRef.current.x) / scaleRef.current;
        let dy = (e.clientY - cursorPosRef.current.y) / scaleRef.current;
        const originalBounds = originalBoundsRef.current;

        if (resizingRef.current) {
            if (originalBounds == null || containerRef.current == null) return;

            const currentContainer = propsRef.current.container;
            const minWidth = Math.max(originalBounds.contentWidth, currentContainer.minWidth ?? 0);
            const minHeight = Math.max(originalBounds.contentHeight, currentContainer.minHeight ?? 0);
            const width =
                resizeDirectionRef.current === "east" || resizeDirectionRef.current === "southeast"
                    ? Math.max(minWidth, Math.round(originalBounds.width + dx))
                    : originalBounds.width;
            const height =
                resizeDirectionRef.current === "south" || resizeDirectionRef.current === "southeast"
                    ? Math.max(minHeight, Math.round(originalBounds.height + dy))
                    : originalBounds.height;

            currentContainer.width = width;
            currentContainer.height = height;
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

    const onMouseUp = React.useCallback((e: MouseEvent): void => {
        mouseDownRef.current = false;
        resizingRef.current = false;
        setDraggingNodeRef.current(false);
        e.stopPropagation();
        e.preventDefault();
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);
    }, [onMouseMove]);

    const onMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
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

    const onResizeMouseDown = React.useCallback(
        (direction: ResizeDirection) =>
            (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
                if (readOnly) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }

                const bounds = getContainerBounds(propsRef.current.container, propsRef.current.nodes);

                if (bounds == null) return;

                resizeDirectionRef.current = direction;
                originalBoundsRef.current = bounds;
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

    const bounds = getContainerBounds(props.container, props.nodes);

    if (bounds == null) return null;

    const style: React.CSSProperties = {
        width: bounds.width,
        height: bounds.height,
        transform: `translate(${bounds.x}px, ${bounds.y}px)`,
        ...(props.container.style ?? {}),
    };

    return (
        <div
            className="flow-kit-node-container"
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
