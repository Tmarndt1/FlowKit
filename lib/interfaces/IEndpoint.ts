import * as React from "react";
import { IOffset } from "./IOffset";
import { Position } from "../enums/Position";

export interface IEndpointConnection {
    source: IEndpoint<any>;
    target: IEndpoint<any>;
}

export interface IEndpoint<T> {
    id: string;
    offset: IOffset;
    position: Position;
    data?: T;
    style?: React.CSSProperties;
    isValidConnection?: (connection: IEndpointConnection) => boolean;
}
