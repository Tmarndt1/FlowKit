import * as React from "react";
import { IOffset } from "./IOffset";

export interface INodeContainer {
    key: string;
    label?: string;
    position?: IOffset;
    nodeKeys: string[];
    padding?: number;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    style?: React.CSSProperties;
}
