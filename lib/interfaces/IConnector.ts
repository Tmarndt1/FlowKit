import { Position } from "../enums/Position";
import { IOffset } from "./IOffset";

/** Connector anchor used by shape helpers that expose connection positions. */
export interface IConnector {
    /** Canvas or node-relative connector coordinate. */
    offset: IOffset;
    /** Connector side/orientation. */
    position: Position;
}
