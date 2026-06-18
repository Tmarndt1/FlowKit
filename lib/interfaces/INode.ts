import * as React from "react";
import { IEndpoint } from "./IEndpoint";
import { IOffset } from "./IOffset";

export interface INode<TData, TEndpoint> {
    key: string;
    type: string;
    offset: IOffset;
    endpoints: IEndpoint<TEndpoint>[];
    data?: TData;
    style?: React.CSSProperties;
}