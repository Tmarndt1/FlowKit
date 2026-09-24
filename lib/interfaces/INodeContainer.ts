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
    /** Canvas-space top-left position for fixed or empty containers. Auto-fit derives it from nodes. */
    position?: IOffset;
    /** Node keys currently assigned to this container. */
    nodeKeys: string[];
    /** Space between container bounds and contained nodes. */
    padding?: number;
    /**
     * Fit bounds to nodes and padding, respecting minimum dimensions. Defaults to true.
     * Disabling preserves displayed bounds; manual resizing switches to false.
     */
    resizeToFit?: boolean;
    /** Extra CSS class names applied to the rendered container element. */
    className?: string;
    /** Inline styles applied to the rendered container. Use numeric or pixel width/height for fixed sizing; minWidth/minHeight also apply to auto-fit. */
    style?: React.CSSProperties;
}
