import { INodeContainer } from "../interfaces/INodeContainer";
import { IOffset } from "../interfaces/IOffset";

export type ContainerChange =
    | { type: "move"; key: string; position: IOffset }
    | { type: "resize"; key: string; position: IOffset; width: number; height: number }
    | { type: "membership"; key: string; nodeKeys: string[] }
    | { type: "add"; container: INodeContainer }
    | { type: "remove"; key: string };
