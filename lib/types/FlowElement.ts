import { IEdge } from "../interfaces/IEdge";
import { INode } from "../interfaces/INode";

/** Selection union emitted by FlowKit selection events. */
export declare type FlowElement = INode<any, any> | IEdge<any>;
