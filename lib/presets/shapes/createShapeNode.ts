import { Position } from "../../enums/Position";
import { ShapeNode, ShapePresetType } from "./types";
import { shapePresetByType } from "./definitions";

export function createShapeNode(
    presetType: ShapePresetType,
    key: string,
    offset: { x: number; y: number }
): ShapeNode {
    const preset = shapePresetByType.get(presetType);

    if (preset == null) throw new Error(`Unknown shape preset: ${presetType}`);

    return {
        key,
        type: preset.type,
        offset,
        data: {
            description: preset.description,
            shape: preset.type,
            title: preset.title,
        },
        endpoints: [
            { id: `${key}-top`, offset: { x: 50, y: 0 }, position: Position.Top },
            { id: `${key}-right`, offset: { x: 100, y: 50 }, position: Position.Right },
            { id: `${key}-bottom`, offset: { x: 50, y: 100 }, position: Position.Bottom },
            { id: `${key}-left`, offset: { x: 0, y: 50 }, position: Position.Left },
        ],
        style: {
            height: 100,
            width: 100,
        },
    };
}
