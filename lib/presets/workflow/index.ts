import { NodeTypes } from "../../types/NodeTypes";
import { WorkflowNode } from "../../components/presets/workflow/WorkflowNode";
import { workflowPresets } from "./definitions";
import { WorkflowCategory } from "./types";

export { WorkflowNode };
export {
    createWorkflowEdge,
    createWorkflowEndpoints,
    createWorkflowNode,
    isWorkflowConnectionValid,
    updateWorkflowDecisionTableBranches,
    updateWorkflowThresholdBranches,
    validateWorkflowConnection,
} from "./createWorkflowNode";
export type { WorkflowConnectionValidationResult } from "./createWorkflowNode";
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
    WorkflowAnnotationNodeData,
    WorkflowBaseNodeData,
    WorkflowCategory,
    WorkflowContainer,
    WorkflowDataNodeData,
    WorkflowDecisionBranch,
    WorkflowDecisionTableNodeData,
    WorkflowEdge,
    WorkflowEdgeData,
    WorkflowEndpoint,
    WorkflowEndpointData,
    WorkflowFlowNodeData,
    WorkflowIfElseNodeData,
    WorkflowInputNodeData,
    WorkflowLogicNodeData,
    WorkflowMathNodeData,
    WorkflowNode as WorkflowPresetNode,
    WorkflowNodeData,
    WorkflowOutputNodeData,
    WorkflowSwitchNodeData,
    WorkflowTextNodeData,
    WorkflowThresholdPolicyNodeData,
    WorkflowPreset,
    WorkflowThresholdBranch,
    WorkflowTriggerNodeData,
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
        { input: [], math: [], logic: [], policy: [], utility: [], output: [], data: [], text: [], trigger: [], flow: [], annotation: [] } as Record<WorkflowCategory, typeof workflowPresets>
    );
}
