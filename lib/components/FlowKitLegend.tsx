import * as React from "react";

/** Corner placement for the built-in legend overlay. */
export type FlowKitLegendPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Visual marker shape for a legend item. */
export type FlowKitLegendMarker = "dot" | "line" | "square";

/** Item rendered by FlowKitLegend. */
export interface FlowKitLegendItem {
    /** Stable item id. */
    key: string;
    /** Text shown next to the marker. */
    label: string;
    /** Optional supporting value, such as a count or live metric. */
    value?: string | number;
    /** Marker color. */
    color?: string;
    /** Marker shape. Defaults to dot. */
    marker?: FlowKitLegendMarker;
    /** Optional class applied to this item. */
    className?: string;
    /** Optional inline style applied to this item. */
    style?: React.CSSProperties;
}

/** Props for the built-in legend overlay. */
export interface FlowKitLegendProps {
    /** Additional class for the legend wrapper. */
    className?: string;
    /** Optional heading rendered above the legend items. */
    title?: string;
    /** Legend items to render. */
    items: FlowKitLegendItem[];
    /** Corner placement. Defaults to top-right. */
    position?: FlowKitLegendPosition;
    /** Inline styles for the legend wrapper. */
    style?: React.CSSProperties;
}

/** Built-in overlay legend for topology status, link state, or custom graph semantics. */
export const FlowKitLegend: React.FC<FlowKitLegendProps> = (props) => {
    const position = props.position ?? "top-right";
    const className = [
        "flow-kit-legend",
        `flow-kit-legend-${position}`,
        props.className,
    ].filter(Boolean).join(" ");

    return (
        <aside
            aria-label={props.title ?? "Flow legend"}
            className={className}
            style={props.style}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            {props.title != null && <div className="flow-kit-legend-title">{props.title}</div>}
            <div className="flow-kit-legend-items">
                {props.items.map((item) => {
                    const itemClassName = [
                        "flow-kit-legend-item",
                        item.className,
                    ].filter(Boolean).join(" ");

                    return (
                        <div className={itemClassName} key={item.key} style={item.style}>
                            <span
                                aria-hidden="true"
                                className={`flow-kit-legend-marker flow-kit-legend-marker-${item.marker ?? "dot"}`}
                                style={{ color: item.color }}
                            />
                            <span className="flow-kit-legend-label">{item.label}</span>
                            {item.value != null && <span className="flow-kit-legend-value">{item.value}</span>}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};
