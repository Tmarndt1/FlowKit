import * as React from "react";

export type EdgeArrow = "both" | "none" | "source" | "target";
export type EdgePathType = "bezier" | "smooth-step" | "step";

export interface IEdge<T> {
    key: string;
    targetId: string;
    sourceId: string;
    type: string;
    arrows?: EdgeArrow | {
        source?: boolean;
        target?: boolean;
    };
    data?: T;
    pathType?: EdgePathType;
    style?: React.CSSProperties;
}
