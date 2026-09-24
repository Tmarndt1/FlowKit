import * as React from "react";
import { ContainerLayout, getContainerLayout, getContainerStyle, getStyleDimension } from "../../functions/containerLayout";
import { IEndpoint } from "../../interfaces/IEndpoint";
import { INodeContainer } from "../../interfaces/INodeContainer";
import { INode } from "../../interfaces/INode";
import { IOffset } from "../../interfaces/IOffset";
import {
    NodeFlowContext,
    useFlowKitInteractionStore,
    useFlowKitRenderStore,
    useFlowKitSelectionStore,
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";
import { findElementById } from "../../functions/domScope";

interface IProps {
    container: INodeContainer;
    customContainer?: React.ComponentClass | React.FunctionComponent<any>;
    nodes: INode<any, any>[];
    onDragEnd?: (containerKey: string, nodeOffsets: ReadonlyMap<string, IOffset>) => void;
    onResizeEnd?: (containerKey: string) => void;
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function areStylesEqual(left: React.CSSProperties | undefined, right: React.CSSProperties | undefined): boolean {
    if (left === right) return true;
    if (left == null || right == null) return false;

    const leftKeys = Object.keys(left) as Array<keyof React.CSSProperties>;
    const rightKeys = Object.keys(right) as Array<keyof React.CSSProperties>;

    return leftKeys.length === rightKeys.length && leftKeys.every((key) => Object.is(left[key], right[key]));
}

function areContainersEqual(left: INodeContainer, right: INodeContainer): boolean {
    return (
        left.key === right.key &&
        left.type === right.type &&
        left.label === right.label &&
        left.padding === right.padding &&
        left.resizeToFit === right.resizeToFit &&
        left.className === right.className &&
        left.position?.x === right.position?.x &&
        left.position?.y === right.position?.y &&
        areStringArraysEqual(left.nodeKeys, right.nodeKeys) &&
        areStylesEqual(left.style, right.style)
    );
}

function areContainedNodesEqual(left: INode<any, any>[], right: INode<any, any>[]): boolean {
    return left.length === right.length && left.every((node, index) => node === right[index]);
}

function areNodeContainerPropsEqual(left: IProps, right: IProps): boolean {
    return (
        areContainersEqual(left.container, right.container) &&
        areContainedNodesEqual(left.nodes, right.nodes) &&
        left.customContainer === right.customContainer &&
        left.onDragEnd === right.onDragEnd &&
        left.onResizeEnd === right.onResizeEnd
    );
}

type ResizeDirection = "east" | "south" | "southeast";

function snapValue(value: number, size: number): number {
    return Math.round(value / size) * size;
}

const NodeContainerComponent: React.FC<IProps> = (props) => {
    const { getRootElement, readOnly } = useFlowKitConfig();
    const stores = React.useContext(NodeFlowContext);
    const notifyEndpointsChanged = useFlowKitRenderStore((state) => state.notifyEndpointsChanged);
    const canChangeContainers = useFlowKitRenderStore((state) => state.canChangeContainers);
    const canChangeNodes = useFlowKitRenderStore((state) => state.canChangeNodes);
    const selected = useFlowKitSelectionStore(
        (state) => state.selectedContainerKeys.has(props.container.key)
    );
    const selectContainer = useFlowKitSelectionStore((state) => state.selectContainer);
    const isDraggingOverContainer = useFlowKitRenderStore(
        (state) => state.containerDropTargetKeys.has(props.container.key)
    );
    const isDraggingOut = useFlowKitRenderStore(
        (state) => state.containerDraggingOutKeys.has(props.container.key)
    );
    const setDraggingNode = useFlowKitInteractionStore((state) => state.setDraggingNode);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const propsRef = React.useRef<IProps>(props);
    const scaleRef = React.useRef<number>(stores?.viewport.getState().scale ?? 1);
    const mouseDownRef = React.useRef<boolean>(false);
    const resizingRef = React.useRef<boolean>(false);
    const resizeDirectionRef = React.useRef<ResizeDirection>("southeast");
    const cursorPosRef = React.useRef<IOffset>({ x: 0, y: 0 });
    const layoutRef = React.useRef<ContainerLayout | null>(null);
    const originalNodePositionsRef = React.useRef<Map<string, IOffset>>(new Map());
    const transientNodePositionsRef = React.useRef<Map<string, IOffset>>(new Map());
    const originalBoundsRef = React.useRef<ContainerLayout["bounds"]>(null);
    const notifyEndpointsChangedRef = React.useRef<typeof notifyEndpointsChanged>(notifyEndpointsChanged);
    const onDragEndRef = React.useRef<typeof props.onDragEnd>(props.onDragEnd);
    const onResizeEndRef = React.useRef<typeof props.onResizeEnd>(props.onResizeEnd);
    const snapRef = React.useRef<{ containers: boolean; enabled: boolean; size: number }>({
        containers: stores?.snap.getState().containers ?? false,
        enabled: stores?.snap.getState().enabled ?? false,
        size: stores?.snap.getState().size ?? 24,
    });
    const setDraggingNodeRef = React.useRef<typeof setDraggingNode>(setDraggingNode);

    propsRef.current = props;
    notifyEndpointsChangedRef.current = notifyEndpointsChanged;
    onDragEndRef.current = props.onDragEnd;
    onResizeEndRef.current = props.onResizeEnd;
    setDraggingNodeRef.current = setDraggingNode;

    React.useEffect(() => {
        if (stores == null) return;

        const syncScale = (): void => {
            scaleRef.current = stores.viewport.getState().scale;
        };
        const syncSnap = (): void => {
            const snap = stores.snap.getState();
            snapRef.current = { containers: snap.containers, enabled: snap.enabled, size: snap.size };
        };

        syncScale();
        syncSnap();

        const unsubscribeViewport = stores.viewport.subscribe(syncScale);
        const unsubscribeSnap = stores.snap.subscribe(syncSnap);

        return () => {
            unsubscribeViewport();
            unsubscribeSnap();
        };
    }, [stores]);

    const moveContainedNodes = React.useCallback<(dx: number, dy: number) => void>((dx: number, dy: number): void => {
        const containedNodeKeys = new Set(propsRef.current.container.nodeKeys);
        const movedEndpoints: IEndpoint<any>[] = [];

        propsRef.current.nodes.forEach((node) => {
            if (!containedNodeKeys.has(node.key)) return;

            const originalPosition = originalNodePositionsRef.current.get(node.key);

            if (originalPosition == null) return;

            const x = Math.round(originalPosition.x + dx);
            const y = Math.round(originalPosition.y + dy);

            transientNodePositionsRef.current.set(node.key, { x, y });

            const element = findElementById(getRootElement(), node.key);

            if (element != null) {
                element.style.transform = `translate(${x}px, ${y}px)`;
            }

            movedEndpoints.push(...node.endpoints);
        });

        notifyEndpointsChangedRef.current(
            movedEndpoints,
            propsRef.current.nodes.map((node) => node.key)
        );
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

            containerRef.current.style.width = `${width}px`;
            containerRef.current.style.height = `${height}px`;
            return;
        }

        if (originalBounds != null && snapRef.current.enabled && snapRef.current.containers) {
            dx = snapValue(originalBounds.x + dx, snapRef.current.size) - originalBounds.x;
            dy = snapValue(originalBounds.y + dy, snapRef.current.size) - originalBounds.y;
        }

        if (originalBounds != null && containerRef.current != null) {
            containerRef.current.style.transform =
                `translate(${originalBounds.x + dx}px, ${originalBounds.y + dy}px)`;
        }

        moveContainedNodes(dx, dy);
    }, [moveContainedNodes]);

    const resizeStartSizeRef = React.useRef({ width: 0, height: 0 });

    const onMouseUp = React.useCallback<(e: MouseEvent) => void>((e: MouseEvent): void => {
        mouseDownRef.current = false;
        const wasResizing = resizingRef.current;
        resizingRef.current = false;
        setDraggingNodeRef.current(false);
        e.stopPropagation();
        e.preventDefault();
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);
        const original = originalBoundsRef.current;
        const element = containerRef.current;
        if (original == null || element == null) return;

        // Compare with the rendered starting bounds, including auto-sized containers.
        if (wasResizing) {
            const startSize = resizeStartSizeRef.current;
            if (element.offsetWidth !== startSize.width || element.offsetHeight !== startSize.height) {
                // Keep the preview as the fixed snapshot, even if the new size happens
                // to equal stale dimensions already stored in the controlled model.
                layoutRef.current = {
                    container: { ...propsRef.current.container, resizeToFit: false },
                    bounds: { ...original, width: element.offsetWidth, height: element.offsetHeight },
                };
                onResizeEndRef.current?.(propsRef.current.container.key);
            }
        } else if (element.style.transform !== `translate(${original.x}px, ${original.y}px)`) {
            onDragEndRef.current?.(
                propsRef.current.container.key,
                new Map(transientNodePositionsRef.current)
            );
        }
    }, [onMouseMove]);

    const onMouseDown = React.useCallback<(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void>((e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        const movesContainedNodes = propsRef.current.container.nodeKeys.length > 0;

        selectContainer(propsRef.current.container);

        if (readOnly || !canChangeContainers || (movesContainedNodes && !canChangeNodes)) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        const containedNodeKeys = new Set(propsRef.current.container.nodeKeys);
        const bounds = layoutRef.current?.bounds;

        if (bounds == null) return;

        originalNodePositionsRef.current = new Map(
            propsRef.current.nodes
                .filter((node) => containedNodeKeys.has(node.key))
                .map((node) => [node.key, { x: node.offset.x, y: node.offset.y }])
        );

        originalBoundsRef.current = bounds;
        transientNodePositionsRef.current = new Map(originalNodePositionsRef.current);
        cursorPosRef.current = { x: e.clientX, y: e.clientY };
        mouseDownRef.current = true;
        resizingRef.current = false;
        setDraggingNodeRef.current(true);
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        e.preventDefault();
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("mousemove", onMouseMove);
    }, [canChangeContainers, canChangeNodes, onMouseMove, onMouseUp, readOnly, selectContainer]);

    const onResizeMouseDown = React.useCallback<(direction: ResizeDirection) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void>(
        (direction: ResizeDirection) =>
            (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
                selectContainer(propsRef.current.container);

                if (readOnly || !canChangeContainers) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }

                const bounds = getContainerLayout(
                    propsRef.current.container, propsRef.current.nodes, getRootElement(), layoutRef.current
                ).bounds;

                if (bounds == null) return;
                resizeDirectionRef.current = direction;
                originalBoundsRef.current = bounds;
                resizeStartSizeRef.current = {
                    width: containerRef.current?.offsetWidth ?? bounds.width,
                    height: containerRef.current?.offsetHeight ?? bounds.height,
                };
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
        [canChangeContainers, onMouseMove, onMouseUp, readOnly, selectContainer]
    );

    React.useEffect(() => {
        return () => {
            setDraggingNodeRef.current(false);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
        };
    }, [onMouseMove, onMouseUp]);

    const layout = getContainerLayout(props.container, props.nodes, getRootElement(), layoutRef.current);
    React.useLayoutEffect(() => {
        const previous = layoutRef.current;
        layoutRef.current = layout;
        // Persist the displayed bounds when the consumer disables auto-fit.
        if (previous != null && previous.container.resizeToFit !== false &&
            props.container.resizeToFit === false && layout.bounds != null) {
            onResizeEndRef.current?.(props.container.key);
        }
    });

    const bounds = layout.bounds;
    if (bounds == null) return null;

    const style = getContainerStyle(props.container, bounds);
    const className = [
        "flow-kit-node-container",
        props.container.className ?? "",
        selected ? "flow-kit-selected" : "",
        isDraggingOverContainer ? "flow-kit-node-container-drop-target" : "",
        isDraggingOut ? "flow-kit-node-container-dragging-out" : "",
    ].filter(Boolean).join(" ");

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

NodeContainerComponent.displayName = "NodeContainer";

export const NodeContainer = React.memo(NodeContainerComponent, areNodeContainerPropsEqual);
