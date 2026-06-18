import * as React from "react";

interface IProps {
    backgroundColor?: string;
    className?: string;
    color?: string;
    opacity?: number;
    size?: number;
    spacing?: number;
    style?: React.CSSProperties;
}

export const FlowKitDots: React.FC<IProps> = (props) => {
    const dotSize = props.size ?? 1.5;
    const spacing = props.spacing ?? 22;
    const color = props.color ?? "rgba(255, 255, 255, .12)";
    const className = ["node-flow-background", "node-flow-dots-background", props.className]
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
