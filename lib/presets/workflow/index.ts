import { NodeTypes } from "../../types/NodeTypes";
import { WorkflowNode } from "../../components/presets/workflow/WorkflowNode";
import { workflowPresets } from "./definitions";

export { WorkflowNode };
export {
    createWorkflowEdge,
    createWorkflowEndpoints,
    createWorkflowNode,
    isWorkflowConnectionValid,
    updateWorkflowDecisionTableBranches,
    updateWorkflowThresholdBranches,
} from "./createWorkflowNode";
export {
    defaultDecisionTableBranches,
    workflowCategoryLabels,
    defaultThresholdPolicyBranches,
    workflowEndpointGap,
    workflowEndpointStartY,
    workflowNodeBaseHeight,
    workflowNodeWidth,
    workflowPresetByType,
    workflowPresets,
} from "./definitions";
export type {
    WorkflowBaseNodeData,
    WorkflowCategory,
    WorkflowContainer,
    WorkflowDecisionBranch,
    WorkflowDecisionTableNodeData,
    WorkflowEdge,
    WorkflowEdgeData,
    WorkflowEndpoint,
    WorkflowEndpointData,
    WorkflowIfElseNodeData,
    WorkflowInputNodeData,
    WorkflowLogicNodeData,
    WorkflowMathNodeData,
    WorkflowNode as WorkflowPresetNode,
    WorkflowNodeData,
    WorkflowOutputNodeData,
    WorkflowSwitchNodeData,
    WorkflowThresholdPolicyNodeData,
    WorkflowPreset,
    WorkflowThresholdBranch,
    WorkflowUtilityNodeData,
    WorkflowVariableNodeData,
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
        { input: [], math: [], logic: [], policy: [], utility: [], output: [] } as Record<"input" | "math" | "logic" | "policy" | "utility" | "output", typeof workflowPresets>
    );
}
