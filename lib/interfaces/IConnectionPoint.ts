import { Position } from "../enums/Position";
import { IOffset } from "./IOffset";

export interface IConnectionPoint
{
    offset: IOffset;
    position: Position;
    buffer?: number;
}
