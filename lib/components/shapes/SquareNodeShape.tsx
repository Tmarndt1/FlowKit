import * as React from "react";
import { NodeShapeProps } from "./NodeShapeProps";

export const SquareNodeShape: React.FC<NodeShapeProps> = (props) => (
    <div
        className={[
            "node-flow-shape",
            "node-flow-shape-square",
            props.showEndpoints ? "node-flow-shape-show-endpoints" : undefined,
            props.className,
        ].filter(Boolean).join(" ")}
        style={props.style}
    >
        <div className="node-flow-shape-surface" />
        <div className="node-flow-shape-content">{props.children}</div>
    </div>
);
