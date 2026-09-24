import { INodeContainer } from "../interfaces/INodeContainer";
import { IOffset } from "../interfaces/IOffset";

export type ContainerChange =
    | { type: "select"; key: string; selected: boolean }
    | { type: "move"; key: string; position: IOffset }
    /** Saves fixed bounds and disables resizeToFit when applied with applyContainerChanges. */
    | { type: "resize"; key: string; position: IOffset; width: number; height: number }
    | {
        type: "membership";
        key: string;
        nodeKeys: string[];
        position?: IOffset;
        width?: number;
        height?: number;
    }
    | { type: "add"; container: INodeContainer }
    | { type: "remove"; key: string };
