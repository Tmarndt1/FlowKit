import * as React from "react";
import { NodeShapeProps } from "./NodeShapeProps";

export const ArrowRectangleNodeShape: React.FC<NodeShapeProps> = (props) => (
    <div
        className={[
            "flow-kit-shape",
            "flow-kit-shape-arrow-rectangle",
            props.showEndpoints ? "flow-kit-shape-show-endpoints" : undefined,
            props.className,
        ].filter(Boolean).join(" ")}
        style={props.style}
    >
        <div className="flow-kit-shape-surface" />
        <div className="flow-kit-shape-content">{props.children}</div>
    </div>
);
