import * as React from "react";
import { IOffset } from "./IOffset";

/** Describes a visual group/container around a set of nodes. */
export interface INodeContainer {
    /** Stable container identifier. */
    key: string;
    /** Header text rendered in the built-in container header. */
    label?: string;
    /** Canvas-space top-left position. If omitted, FlowKit derives bounds from child nodes. */
    position?: IOffset;
    /** Node keys currently assigned to this container. */
    nodeKeys: string[];
    /** Space between container bounds and contained nodes. */
    padding?: number;
    /** Explicit width. Useful for empty containers. */
    width?: number;
    /** Explicit height. Useful for empty containers. */
    height?: number;
    /** Minimum rendered width. */
    minWidth?: number;
    /** Minimum rendered height. */
    minHeight?: number;
    /** Inline styles applied to the rendered container. */
    style?: React.CSSProperties;
}
