import * as React from "react";

/** Props for the built-in dotted viewport background. */
export interface FlowKitDotsProps {
    /** Background fill behind dots. */
    backgroundColor?: string;
    /** Additional class for the dots element. */
    className?: string;
    /** Dot color. */
    color?: string;
    /** Overall dots opacity. */
    opacity?: number;
    /** Dot radius in pixels. */
    size?: number;
    /** Distance between dots in pixels. */
    spacing?: number;
    /** Inline styles for the dots element. */
    style?: React.CSSProperties;
}

/** Non-interactive dotted background for the FlowKit viewport. */
export const FlowKitDots: React.FC<FlowKitDotsProps> = (props) => {
    const dotSize = props.size ?? 1.5;
    const spacing = props.spacing ?? 22;
    const color = props.color ?? "rgba(255, 255, 255, .12)";
    const className = ["flow-kit-background", "flow-kit-dots-background", props.className]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={className}
            style={{
                backgroundColor: props.backgroundColor,
                backgroundImage: `radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px)`,
                backgroundSize: `${spacing}px ${spacing}px`,
                opacity: props.opacity,
                ...props.style,
            }}
        />
    );
};
