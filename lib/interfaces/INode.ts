import * as React from "react";
import { IEndpoint } from "./IEndpoint";
import { IOffset } from "./IOffset";

/** Describes a draggable node and its endpoint definitions. */
export interface INode<TData, TEndpoint> {
    /** Stable node identifier. Also used as the rendered DOM id. */
    key: string;
    /** Node renderer key. Use "node" for the built-in shape renderer. */
    type: string;
    /** Canvas-space position of the node's top-left corner. */
    offset: IOffset;
    /** Connection points rendered relative to this node. */
    endpoints: IEndpoint<TEndpoint>[];
    /** Additional class applied to the rendered node wrapper. */
    className?: string;
    /** Application payload passed through to custom node renderers. */
    data?: TData;
    /** Inline styles applied to the rendered node wrapper. */
    style?: React.CSSProperties;
}
