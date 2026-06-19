import { Position } from "../enums/Position";
import { IOffset } from "./IOffset";

/** Resolved anchor used internally by path builders. Public for custom edge helpers. */
export interface IConnectionPoint {
    /** Viewport-space anchor coordinate. */
    offset: IOffset;
    /** Side/orientation used to shape the edge path. */
    position: Position;
    /** Optional endpoint size buffer used by fixed endpoint anchors. */
    buffer?: number;
}
