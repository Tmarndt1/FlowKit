import { ShapePreset } from "./types";

export const shapePresets: ShapePreset[] = [
    { description: "Basic square node", title: "Square", type: "square" },
    { description: "Basic circle node", title: "Circle", type: "circle" },
    { description: "Decision diamond node", title: "Diamond", type: "diamond" },
    { description: "Directional arrow node", title: "Arrow Rectangle", type: "arrow-rectangle" },
    { description: "Basic triangle node", title: "Triangle", type: "triangle" },
];

export const shapePresetByType = new Map(shapePresets.map((preset) => [preset.type, preset]));
