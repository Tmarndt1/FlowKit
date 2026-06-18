import * as React from "react";

interface IProps {
    backgroundColor?: string;
    className?: string;
    color?: string;
    opacity?: number;
    size?: number;
    style?: React.CSSProperties;
}

export const FlowKitGrid: React.FC<IProps> = (props) => {
    const size = props.size ?? 24;
    const color = props.color ?? "rgba(255, 255, 255, .07)";
    const className = ["node-flow-background", "node-flow-grid-background", props.className]
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
