import * as React from "react";
import { getBezier } from "../../functions/getBezier";
import { IEdge } from "../../interfaces/IEdge";
import {
    useNodeFlowRenderStore,
    useNodeFlowSelectionStore,
    useNodeFlowViewportStore
} from "../NodeFlowContext";
import { getEndpointPosition } from "../../functions/getEndpointPosition";

interface IProps {
    edge: IEdge<any>;
    customEdge?: React.ComponentClass | React.FunctionComponent;
}

function hasSourceArrow(edge: IEdge<any>): boolean {
    if (edge.arrows == null || edge.arrows === "none") return false;
    if (edge.arrows === "source" || edge.arrows === "both") return true;
    if (typeof edge.arrows !== "object") return false;

    return edge.arrows.source === true;
}

function hasTargetArrow(edge: IEdge<any>): boolean {
    if (edge.arrows == null || edge.arrows === "none") return false;
    if (edge.arrows === "target" || edge.arrows === "both") return true;
    if (typeof edge.arrows !== "object") return false;

    return edge.arrows.target === true;
}

const EdgeComponent: React.FC<IProps> = (props) =>
{
    const containerRect = useNodeFlowViewportStore((state) => state.containerRect);
    const scale = useNodeFlowViewportStore((state) => state.scale);
    const selected = useNodeFlowSelectionStore((state) => state.selectedEdge?.key === props.edge.key);
    const endpointUpdate = useNodeFlowRenderStore((state) => state.endpointUpdate);
    const edgeRenderRequest = useNodeFlowRenderStore((state) => state.edgeRenderRequest);
    const selectEdge = useNodeFlowSelectionStore((state) => state.selectEdge);

    const propsRef = React.useRef(props);
    const containerRectRef = React.useRef(containerRect);
    const scaleRef = React.useRef(scale);

    const [path, setPath] = React.useState<string>("");

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

        const sourceElement = document.getElementById(currentProps.edge.sourceId);
        const targetElement = document.getElementById(currentProps.edge.targetId);

        if (sourceElement == null || targetElement == null)
        {
            return;
        }

        const sourcePosition = getEndpointPosition(sourceElement);
        const targetPosition = getEndpointPosition(targetElement);

        if (sourcePosition == null || targetPosition == null)
        {
            return;
        }

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const nextPath = getBezier(
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
                    x: targetRect.left,
                    y: targetRect.top
                },
                position: targetPosition,
                buffer: targetRect.width
            },
            scaleRef.current
        );

        if (nextPath != null)
        {
            setPath(nextPath);
        }
    }, []);

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
    }, [draw, endpointUpdate, props.edge.sourceId, props.edge.targetId]);

    React.useEffect(() =>
    {
        if (edgeRenderRequest?.edgeKey === props.edge.key)
        {
            draw();
        }
    }, [draw, edgeRenderRequest, props.edge.key]);

    const edgeGroupProps = {
        id: props.edge.key,
        className: "node-flow-edge",
        onClick: onSelect,
        onMouseDownCapture: stopEdgeDrag
    };

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
                    className="node-flow-edge-hitbox"
                    d={path}
                />
                {React.createElement(props.customEdge, customProps as any)}
            </g>
        );
    }

    return (
        <g {...edgeGroupProps}>
            <path
                className="node-flow-edge-hitbox"
                d={path}
            />

            <path
                className="node-flow-edge-path node-flow-edge-flow"
                d={path}
                markerEnd={hasTargetArrow(props.edge) ? "url(#node-flow-edge-arrow)" : undefined}
                markerStart={hasSourceArrow(props.edge) ? "url(#node-flow-edge-arrow)" : undefined}
                strokeDasharray="8 4"
                style={selected ? { stroke: "white", ...(props.edge.style ?? {}) } : props.edge.style}
            />
        </g>
    );
};

export const Edge = React.memo(
    EdgeComponent,
    (prevProps, nextProps) =>
        prevProps.edge === nextProps.edge &&
        prevProps.customEdge === nextProps.customEdge
);
