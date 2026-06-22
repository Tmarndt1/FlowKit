import * as React from "react";
import { INode } from "../../interfaces/INode";
import { IOffset } from "../../interfaces/IOffset";
import { Endpoint } from "./Endpoint";
import {
    NodeFlowContext,
    useNodeFlowInteractionStore,
    useNodeFlowRenderStore,
    useNodeFlowSelectionStore,
    useNodeFlowSnapStore,
    useNodeFlowViewportStore,
} from "../../contexts/NodeFlowContext";
import { useFlowKitConfig } from "../../contexts/FlowKitConfigContext";

interface DragGroupItem {
    node: INode<any, any>;
    element: HTMLElement | null;
    startX: number;
    startY: number;
}

interface IProps {
    node: INode<any, any>;
    stateClassName?: string;
    customNode?: React.ComponentClass | React.FunctionComponent;
    customNodeProps?: object;
}

function snapValue(value: number, size: number): number {
    return Math.round(value / size) * size;
}

const NodeComponent: React.FC<IProps> = (props) => {
    const { readOnly, multiSelect } = useFlowKitConfig();
    const stores = React.useContext(NodeFlowContext);
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const snapEnabled = useNodeFlowSnapStore((state) => state.enabled);
    const snapSize = useNodeFlowSnapStore((state) => state.size);
    const selected = useNodeFlowSelectionStore((state) => state.selectedNodeKeys.has(props.node.key));
    const selectNode = useNodeFlowSelectionStore((state) => state.selectNode);
    const notifyEndpointsChanged = useNodeFlowRenderStore((state) => state.notifyEndpointsChanged);
    const notifyNodeDrag = useNodeFlowInteractionStore((state) => state.notifyNodeDrag);
    const setDraggingNode = useNodeFlowInteractionStore((state) => state.setDraggingNode);
    const nodeRef = React.useRef<HTMLDivElement>(null);
    const cursorPosRef = React.useRef<IOffset>({ x: 0, y: 0 });
    const originalPosRef = React.useRef<IOffset>({ x: 0, y: 0 });
    const mouseDownRef = React.useRef<boolean>(false);
    const dragGroupRef = React.useRef<DragGroupItem[]>([]);
    const widthRef = React.useRef<number>(0);
    const heightRef = React.useRef<number>(0);
    const propsRef = React.useRef(props);
    const scaleRef = React.useRef(scale);
    const snapRef = React.useRef({ enabled: snapEnabled, size: snapSize });
    const storesRef = React.useRef(stores);
    const multiSelectRef = React.useRef(multiSelect);
    const notifyEndpointsChangedRef = React.useRef(notifyEndpointsChanged);
    const notifyNodeDragRef = React.useRef(notifyNodeDrag);
    const setDraggingNodeRef = React.useRef(setDraggingNode);

    propsRef.current = props;
    scaleRef.current = scale;
    snapRef.current = { enabled: snapEnabled, size: snapSize };
    storesRef.current = stores;
    multiSelectRef.current = multiSelect;
    notifyEndpointsChangedRef.current = notifyEndpointsChanged;
    notifyNodeDragRef.current = notifyNodeDrag;
    setDraggingNodeRef.current = setDraggingNode;

    const onMouseMove = React.useCallback((e: MouseEvent): void => {
        if (!mouseDownRef.current) return;

        if (nodeRef.current == null) return;

        const dx: number = (e.clientX - cursorPosRef.current.x) / scaleRef.current;
        const dy: number = (e.clientY - cursorPosRef.current.y) / scaleRef.current;

        if (isNaN(dx) || isNaN(dy)) return;

        const snap = snapRef.current;
        const group = dragGroupRef.current;
        const movedEndpoints: typeof propsRef.current.node.endpoints = [];

        // A node drag moves every selected node together, so the whole group is
        // translated by the same canvas-space delta from where each node started.
        for (const item of group) {
            let x: number = item.startX + dx;
            let y: number = item.startY + dy;

            if (snap.enabled) {
                x = snapValue(x, snap.size);
                y = snapValue(y, snap.size);
            }

            item.node.offset.x = Math.round(x);
            item.node.offset.y = Math.round(y);

            if (item.element != null) {
                item.element.style.transform = `translate(${x}px, ${y}px)`;
            }

            for (const endpoint of item.node.endpoints) movedEndpoints.push(endpoint);
        }

        notifyNodeDragRef.current();
        notifyEndpointsChangedRef.current(movedEndpoints);
    }, []);

    const onMouseUp = React.useCallback((e: MouseEvent): void => {
        mouseDownRef.current = false;
        setDraggingNodeRef.current(false, null);
        e.stopPropagation();
        e.preventDefault();
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("mousemove", onMouseMove);
    }, [onMouseMove]);

    const buildDragGroup = React.useCallback((node: INode<any, any>): void => {
        const selectionState = storesRef.current?.selection.getState();
        const selectedNodes = selectionState?.selectedNodes ?? [];
        const group =
            selectedNodes.length > 1 && selectionState?.selectedNodeKeys.has(node.key)
                ? selectedNodes
                : [node];

        dragGroupRef.current = group.map((groupNode) => ({
            node: groupNode,
            element: document.getElementById(groupNode.key),
            startX: groupNode.offset.x,
            startY: groupNode.offset.y,
        }));
    }, []);

    const onMouseDown = React.useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
            const currentProps = propsRef.current;
            const target = e.target instanceof Element ? e.target : null;

            if (target?.closest(".flow-kit-endpoint") != null) return;

            const selectionState = storesRef.current?.selection.getState();
            const additive =
                multiSelectRef.current !== false && (e.shiftKey || e.metaKey || e.ctrlKey);

            // Modifier-click toggles a node in or out of the selection without
            // starting a drag, so users can build up a selection click by click.
            if (additive) {
                selectionState?.toggleNode(currentProps.node);
                e.stopPropagation();
                e.preventDefault();
                return;
            }

            const alreadySelected = selectionState?.selectedNodeKeys.has(currentProps.node.key) ?? false;

            // Clicking an unselected node selects only it; clicking a node that is
            // already part of a multi-selection keeps the group so it can be dragged.
            if (!alreadySelected) {
                selectNode(currentProps.node);
            }

            if (readOnly) {
                e.stopPropagation();
                e.preventDefault();
                return;
            }

            buildDragGroup(currentProps.node);

            mouseDownRef.current = true;
            setDraggingNodeRef.current(true, currentProps.node);
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            e.preventDefault();
            cursorPosRef.current = { x: e.clientX, y: e.clientY };
            originalPosRef.current = {
                x: currentProps.node.offset.x,
                y: currentProps.node.offset.y,
            };

            document.addEventListener("mouseup", onMouseUp);
            document.addEventListener("mousemove", onMouseMove);
        },
        [buildDragGroup, onMouseMove, onMouseUp, readOnly, selectNode]
    );

    React.useEffect(() => {
        const element = nodeRef.current;

        if (element == null || typeof ResizeObserver === "undefined") return;

        const resizeObserver = new ResizeObserver(() => {
            if (nodeRef.current?.clientWidth !== widthRef.current) {
                widthRef.current = nodeRef.current?.clientWidth ?? 0;
                notifyEndpointsChangedRef.current(propsRef.current.node.endpoints);
            } else if (nodeRef.current?.clientHeight !== heightRef.current) {
                heightRef.current = nodeRef.current?.clientHeight ?? 0;
                notifyEndpointsChangedRef.current(propsRef.current.node.endpoints);
            }
        });

        const timeout = window.setTimeout(() => {
            resizeObserver.observe(element);
        }, 500);

        widthRef.current = element.clientWidth;
        heightRef.current = element.clientHeight;

        return () => {
            window.clearTimeout(timeout);
            resizeObserver.unobserve(element);
        };
    }, []);

    React.useEffect(() => {
        return () => {
            setDraggingNodeRef.current(false, null);
            document.removeEventListener("mouseup", onMouseUp);
            document.removeEventListener("mousemove", onMouseMove);
        };
    }, [onMouseMove, onMouseUp]);

    if (props.node == null) return null;

    const position: IOffset = props.node.offset;

    const style: React.CSSProperties = {
        zIndex: selected ? 10000000000 : 100,
        ...(props.node?.style ?? {}),
        transform: `translate(${position.x}px, ${position.y}px)`,
    };

    if (props.customNode != null) {
        const className: string = [
            "flow-kit-node-custom",
            selected ? "flow-kit-selected" : "",
            props.stateClassName ?? "",
            props.node.className ?? ""
        ].filter(Boolean).join(" ");
        const customProps: any = {
            ...props.node,
            selected,
            key: props.node.key,
        };

        if (props.customNodeProps != null) {
            for (const property in props.customNodeProps) {
                customProps[property] = (props.customNodeProps as any)[property];
            }
        }

        return (
            <div
                id={props.node.key}
                className={className}
                style={style}
                onMouseDownCapture={onMouseDown}
                ref={nodeRef}
            >
                {React.createElement(props.customNode, customProps)}
            </div>
        );
    }

    const className: string = [
        "flow-kit-node",
        selected ? "flow-kit-selected" : "",
        props.stateClassName ?? "",
        props.node.className ?? ""
    ].filter(Boolean).join(" ");

    return (
        <div
            id={props.node.key}
            className={className}
            style={style}
            onMouseDownCapture={onMouseDown}
            ref={nodeRef}
        >
            {props.node.endpoints.map((endpoint) => {
                return <Endpoint 
                    key={endpoint.id} 
                    endpoint={endpoint}
                />;
            })}
        </div>
    );
};

export const Node = React.memo(
    NodeComponent,
    (prevProps, nextProps) =>
        prevProps.node === nextProps.node &&
        prevProps.stateClassName === nextProps.stateClassName &&
        prevProps.customNode === nextProps.customNode &&
        prevProps.customNodeProps === nextProps.customNodeProps
);
