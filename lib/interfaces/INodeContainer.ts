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
    /** Hide member nodes and their edges, retaining a compact expandable header. Defaults to false. */
    collapsed?: boolean;
    /** Space between container bounds and contained nodes. */
    padding?: number;
    /**
     * Fit bounds to nodes and padding, respecting minimum dimensions. Defaults to true.
     * Disabling preserves displayed bounds; manual resizing switches to false.
     */
    resizeToFit?: boolean;
    /** Extra CSS class names applied to the rendered container element. */
    className?: string;
    /**
     * Inline styles applied to the built-in container; passed through for custom renderers to apply.
     * Numeric or pixel width/height still determine fixed layout bounds; minWidth/minHeight also apply to auto-fit.
     */
    style?: React.CSSProperties;
}
