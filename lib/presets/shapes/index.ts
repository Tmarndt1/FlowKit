import {
    ArrowRectangleNodeShape,
    CircleNodeShape,
    DiamondNodeShape,
    SquareNodeShape,
    TriangleNodeShape,
} from "../../components/presets/shapes";
import { NodeTypes } from "../../types/NodeTypes";

export { createShapeNode } from "./createShapeNode";
export { shapePresetByType, shapePresets } from "./definitions";
export type { ShapeNode, ShapeNodeData, ShapePreset, ShapePresetType } from "./types";

export const shapeNodeTypes: NodeTypes = {
    "arrow-rectangle": ArrowRectangleNodeShape,
    circle: CircleNodeShape,
    diamond: DiamondNodeShape,
    square: SquareNodeShape,
    triangle: TriangleNodeShape,
};
