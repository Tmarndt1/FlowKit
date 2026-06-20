import * as React from "react";

/** Imperative viewport actions exposed to controls rendered inside FlowKit. */
export interface FlowKitControlsContextValue {
    /** Fits all rendered nodes in view and centers the viewport around them. */
    recenter: () => void;
    /** Centers the viewport around a node by key. Returns false when the node cannot be found. */
    panToNode: (nodeKey: string, options?: PanToNodeOptions) => boolean;
    /** Zooms the viewport in one step. */
    zoomIn: () => void;
    /** Zooms the viewport out one step. */
    zoomOut: () => void;
}

/** Options for focusing a node from a control hook or FlowKit ref. */
export interface PanToNodeOptions {
    /** Optional scale to apply before centering the node. */
    scale?: number;
}

/** Props for the built-in zoom/recenter toolbar. */
export interface FlowKitControlsProps {
    /** Additional class for the controls wrapper. */
    className?: string;
    /** Show the recenter button. Defaults to true. */
    recenter?: boolean;
    /** Inline styles for the controls wrapper. */
    style?: React.CSSProperties;
    /** Show zoom in/out buttons. Defaults to true. */
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

/** Built-in control toolbar for zooming and recentering the viewport. */
export const FlowKitControls: React.FC<FlowKitControlsProps> = (props) => {
    const controls = useFlowKitControls();
    const showZoom = props.zoom ?? true;
    const showRecenter = props.recenter ?? true;
    const className = ["flow-kit-controls", props.className].filter(Boolean).join(" ");

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
                    <span aria-hidden="true" className="flow-kit-recenter-icon" />
                </button>
            )}
        </div>
    );
};
