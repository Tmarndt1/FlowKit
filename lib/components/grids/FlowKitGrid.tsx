import * as React from "react";

/** Props for the built-in square grid background. */
export interface FlowKitGridProps {
    /** Background fill behind grid lines. */
    backgroundColor?: string;
    /** Additional class for the grid element. */
    className?: string;
    /** Grid line color. */
    color?: string;
    /** Overall grid opacity. */
    opacity?: number;
    /** Grid cell size in pixels. */
    size?: number;
    /** Inline styles for the grid element. */
    style?: React.CSSProperties;
}

/** Non-interactive square grid background for the FlowKit viewport. */
export const FlowKitGrid: React.FC<FlowKitGridProps> = (props) => {
    const size = props.size ?? 24;
    const color = props.color ?? "rgba(255, 255, 255, .07)";
    const className = ["flow-kit-background", "flow-kit-grid-background", props.className]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={className}
            style={{
                backgroundColor: props.backgroundColor,
                backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
                backgroundSize: `${size}px ${size}px`,
                opacity: props.opacity,
                ...props.style,
            }}
        />
    );
};
