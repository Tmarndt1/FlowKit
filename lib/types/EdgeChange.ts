import { IEdge } from "../interfaces/IEdge";

export type EdgeChange =
    | { type: "connect"; sourceId: string; targetId: string }
    | { type: "select"; key: string; selected: boolean }
    | { type: "remove"; key: string }
    | { type: "add"; edge: IEdge<any> };
