import { NodeTypes } from "../../types/NodeTypes";
import { WorkflowNode } from "../../components/presets/workflow/WorkflowNode";
import { workflowPresets } from "./definitions";

export { WorkflowNode };
export {
    createWorkflowEdge,
    createWorkflowEndpoints,
    createWorkflowNode,
    isWorkflowConnectionValid,
} from "./createWorkflowNode";
export {
    workflowCategoryLabels,
    workflowEndpointGap,
    workflowEndpointStartY,
    workflowNodeBaseHeight,
    workflowNodeWidth,
    workflowPresetByType,
    workflowPresets,
} from "./definitions";
export type {
    WorkflowCategory,
    WorkflowContainer,
    WorkflowEdge,
    WorkflowEdgeData,
    WorkflowEndpoint,
    WorkflowEndpointData,
    WorkflowNode as WorkflowPresetNode,
    WorkflowNodeData,
    WorkflowPreset,
    WorkflowValueType,
} from "./types";

export const workflowNodeTypes: NodeTypes = Object.fromEntries(
    workflowPresets.map((preset) => [preset.type, WorkflowNode])
) as NodeTypes;

export function groupWorkflowPresets() {
    return workflowPresets.reduce(
        (groups, preset) => {
            groups[preset.category].push(preset);
            return groups;
        },
        { input: [], math: [], logic: [], utility: [], output: [] } as Record<"input" | "math" | "logic" | "utility" | "output", typeof workflowPresets>
    );
}
