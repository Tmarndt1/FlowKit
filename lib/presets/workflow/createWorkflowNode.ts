import { Position } from "../../enums/Position";
import { IEndpoint } from "../../interfaces/IEndpoint";
import { workflowEndpointGap, workflowEndpointStartY, workflowNodeBaseHeight, workflowNodeWidth, workflowPresetByType } from "./definitions";
import { WorkflowEndpointData, WorkflowNode, WorkflowPreset } from "./types";

function getNodeHeight(preset: WorkflowPreset): number {
    return Math.max(
        workflowNodeBaseHeight,
        workflowEndpointStartY + Math.max(preset.inputs.length, preset.outputs.length) * workflowEndpointGap
    );
}

export function isWorkflowConnectionValid(connection: {
    source: IEndpoint<WorkflowEndpointData>;
    target: IEndpoint<WorkflowEndpointData>;
}): boolean {
    const sourceType = connection.source.data?.valueType;
    const targetType = connection.target.data?.valueType;

    if (connection.source.position !== Position.Right) return false;
    if (connection.target.position !== Position.Left) return false;
    if (sourceType == null || targetType == null) return true;
    if (sourceType === "any" || targetType === "any") return true;

    return sourceType === targetType;
}

export function createWorkflowEndpoints(nodeKey: string, preset: WorkflowPreset): WorkflowNode["endpoints"] {
    return [
        ...preset.inputs.map((endpoint, index) => ({
            id: `${nodeKey}-in-${index}`,
            offset: { x: 0, y: workflowEndpointStartY + index * workflowEndpointGap },
            position: Position.Left,
            data: endpoint,
        })),
        ...preset.outputs.map((endpoint, index) => ({
            id: `${nodeKey}-out-${index}`,
            offset: { x: workflowNodeWidth, y: workflowEndpointStartY + index * workflowEndpointGap },
            position: Position.Right,
            data: endpoint,
        })),
    ];
}

export function createWorkflowNode(
    presetType: string,
    key: string,
    offset: { x: number; y: number },
    options: Partial<WorkflowNode["data"]> = {}
): WorkflowNode {
    const preset = workflowPresetByType.get(presetType);

    if (preset == null) throw new Error(`Unknown workflow node preset: ${presetType}`);

    return {
        key,
        type: preset.type,
        offset,
        data: {
            category: preset.category,
            description: preset.description,
            icon: preset.icon,
            styleVariant: preset.styleVariant,
            switchCases: preset.styleVariant === "switch-case"
                ? [
                    { id: "case-1", label: "case 1", expression: "value === 'case-1'" },
                    { id: "case-2", label: "case 2", expression: "value === 'case-2'" },
                    { id: "default", label: "default", default: true },
                ]
                : undefined,
            title: preset.title,
            ...options,
        },
        endpoints: createWorkflowEndpoints(key, preset),
        style: {
            height: getNodeHeight(preset),
            width: workflowNodeWidth,
        },
    };
}

export function createWorkflowEdge(key: string, sourceId: string, targetId: string) {
    return {
        key,
        type: "edge",
        sourceId,
        targetId,
    };
}
