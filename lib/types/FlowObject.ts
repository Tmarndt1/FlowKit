import { IEdge } from "../interfaces/IEdge";
import { INode } from "../interfaces/INode";
import { INodeContainer } from "../interfaces/INodeContainer";

/** Any selectable object rendered by FlowKit. */
export type FlowObject = INode<any, any> | IEdge<any> | INodeContainer;
