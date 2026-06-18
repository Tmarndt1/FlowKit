import { Position } from "../enums/Position";
import { IOffset } from "./IOffset";

export interface IConnector {
    offset: IOffset;
    position: Position;
}