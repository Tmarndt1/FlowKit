import * as React from "react";

interface FlowKitControlsContextValue {
    recenter: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
}

interface IProps {
    className?: string;
    recenter?: boolean;
    style?: React.CSSProperties;
    zoom?: boolean;
}

export const FlowKitControlsContext = React.createContext<FlowKitControlsContextValue | null>(null);

export function useFlowKitControls(): FlowKitControlsContextValue {
    const controls = React.useContext(FlowKitControlsContext);

    if (controls == null) {
        throw new Error("FlowKit controls must be rendered inside a NodeFlow.");
    }

    return controls;
}

export const FlowKitControls: React.FC<IProps> = (props) => {
    const controls = useFlowKitControls();
    const showZoom = props.zoom ?? true;
    const showRecenter = props.recenter ?? true;
    const className = ["node-flow-controls", props.className].filter(Boolean).join(" ");

    return (
        <div
            className={className}
            style={props.style}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            {showZoom && (
                <>
                    <button aria-label="Zoom in" onClick={controls.zoomIn} type="button">
                        +
                    </button>
                    <button aria-label="Zoom out" onClick={controls.zoomOut} type="button">
                        -
                    </button>
                </>
            )}
            {showRecenter && (
                <button aria-label="Recenter" onClick={controls.recenter} type="button">
                    o
                </button>
            )}
        </div>
    );
};
