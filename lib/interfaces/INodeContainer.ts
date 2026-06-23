import * as React from "react";
import { IOffset } from "./IOffset";

/** Describes a visual group/container around a set of nodes. */
export interface INodeContainer {
    /** Stable container identifier. */
    key: string;
    /** Selects a custom renderer from containerTypes. Defaults to the built-in container. */
    type?: string;
    /** Header text rendered in the built-in container header. */
    label?: string;
    /** Canvas-space top-left position. If omitted, FlowKit derives bounds from child nodes. */
    position?: IOffset;
    /** Node keys currently assigned to this container. */
    nodeKeys: string[];
    /** Space between container bounds and contained nodes. */
    padding?: number;
    /** Recalculate bounds from contained nodes after membership changes. Defaults to true. */
    resizeToFit?: boolean;
    /** Extra CSS class names applied to the rendered container element. */
    className?: string;
    /** Inline styles applied to the rendered container. Use width/height/minWidth/minHeight here to set explicit dimensions. */
    style?: React.CSSProperties;
}
