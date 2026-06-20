import { Position } from "../../enums/Position";
import { IEndpoint } from "../../interfaces/IEndpoint";
import {
    defaultThresholdPolicyBranches,
    workflowEndpointGap,
    workflowEndpointStartY,
    workflowNodeBaseHeight,
    workflowNodeWidth,
    workflowPresetByType,
} from "./definitions";
import { WorkflowEndpointData, WorkflowNode, WorkflowNodeData, WorkflowPreset, WorkflowThresholdBranch } from "./types";

function getNodeHeight(preset: WorkflowPreset): number {
    const outputCount = preset.styleVariant === "threshold-policy"
        ? defaultThresholdPolicyBranches.length
        : preset.outputs.length;

    return Math.max(
        workflowNodeBaseHeight,
        workflowEndpointStartY + Math.max(preset.inputs.length, outputCount) * workflowEndpointGap
    );
}

function createThresholdOutputEndpoints(
    nodeKey: string,
    branches: readonly WorkflowThresholdBranch[]
): WorkflowNode["endpoints"] {
    return branches.map((branch, index) => ({
        id: `${nodeKey}-threshold-${branch.id}`,
        offset: { x: workflowNodeWidth, y: workflowEndpointStartY + index * workflowEndpointGap },
        position: Position.Right,
        data: { label: branch.label, valueType: "any" as const },
    }));
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
    const outputEndpoints = preset.styleVariant === "threshold-policy"
        ? createThresholdOutputEndpoints(nodeKey, defaultThresholdPolicyBranches)
        : preset.outputs.map((endpoint, index) => ({
            id: `${nodeKey}-out-${index}`,
            offset: { x: workflowNodeWidth, y: workflowEndpointStartY + index * workflowEndpointGap },
            position: Position.Right,
            data: endpoint,
        }));

    return [
        ...preset.inputs.map((endpoint, index) => ({
            id: `${nodeKey}-in-${index}`,
            offset: { x: 0, y: workflowEndpointStartY + index * workflowEndpointGap },
            position: Position.Left,
            data: endpoint,
        })),
        ...outputEndpoints,
    ];
}

export function updateWorkflowThresholdBranches(
    node: WorkflowNode,
    branches: WorkflowThresholdBranch[]
): WorkflowNode {
    const inputEndpoints = node.endpoints.filter((endpoint) => endpoint.position !== Position.Right);
    const outputEndpoints = createThresholdOutputEndpoints(node.key, branches);
    const endpointCount = Math.max(inputEndpoints.length, outputEndpoints.length);

    return {
        ...node,
        data: {
            ...node.data!,
            thresholdPolicy: {
                branches,
                valueKey: node.data?.thresholdPolicy?.valueKey ?? "value",
            },
        } as WorkflowNodeData,
        endpoints: [...inputEndpoints, ...outputEndpoints],
        style: {
            ...node.style,
            height: Math.max(workflowNodeBaseHeight, workflowEndpointStartY + endpointCount * workflowEndpointGap),
            width: node.style?.width ?? workflowNodeWidth,
        },
    };
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
            thresholdPolicy: preset.styleVariant === "threshold-policy"
                ? {
                    branches: [...defaultThresholdPolicyBranches],
                    valueKey: "value",
                }
                : undefined,
            title: preset.title,
            ...options,
        } as WorkflowNodeData,
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
