import * as React from "react";

export type EdgeArrow = "both" | "none" | "source" | "target";

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
    style?: React.CSSProperties;
}
