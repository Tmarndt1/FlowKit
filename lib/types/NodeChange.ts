import { INode } from "../interfaces/INode";
import { IOffset } from "../interfaces/IOffset";

export type NodeChange =
    | { type: "position"; key: string; offset: IOffset }
    | { type: "select"; key: string; selected: boolean }
    /** Consumer-created descriptor; current built-in interactions do not add or remove nodes. */
    | { type: "remove"; key: string }
    | { type: "add"; node: INode<any, any> }
    | { type: "dimensions"; key: string; width: number; height: number };
