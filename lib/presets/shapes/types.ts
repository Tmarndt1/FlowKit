import { INode } from "../../interfaces/INode";

export type ShapePresetType = "arrow-rectangle" | "circle" | "diamond" | "square" | "triangle";

export type ShapeNodeData = {
    description: string;
    shape: ShapePresetType;
    title: string;
};

export type ShapeNode = INode<ShapeNodeData, never>;

export type ShapePreset = {
    description: string;
    title: string;
    type: ShapePresetType;
};
