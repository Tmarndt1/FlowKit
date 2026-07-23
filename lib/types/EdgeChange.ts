import { IEdge } from "../interfaces/IEdge";

export type EdgeChange =
    | { type: "connect"; sourceId: string; targetId: string }
    | { type: "select"; key: string; selected: boolean }
    /** Consumer-created descriptor; current built-in interactions emit connect instead of add. */
    | { type: "remove"; key: string }
    | { type: "add"; edge: IEdge<any> };
