import * as React from "react";
import { IOffset } from "./IOffset";
import { Position } from "../enums/Position";

/** Connection object emitted after a source endpoint is dropped onto a target endpoint. */
export interface IEndpointConnection {
    source: IEndpoint<any>;
    target: IEndpoint<any>;
}

/** Describes a rendered connection point on a node. */
export interface IEndpoint<T> {
    /** Stable endpoint id used by edge sourceId/targetId. */
    id: string;
    /** Position relative to the parent node. */
    offset: IOffset;
    /** Side/orientation used by built-in edge path algorithms. */
    position: Position;
    /** Application payload available to connection validation. */
    data?: T;
    /** Inline styles applied to the endpoint element. */
    style?: React.CSSProperties;
}
