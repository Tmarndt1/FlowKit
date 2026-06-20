import { Position } from "../../lib/enums/Position";
import {
  createWorkflowEdge,
  createWorkflowNode,
  groupWorkflowPresets,
  isWorkflowConnectionValid,
  workflowCategoryLabels,
  workflowPresetByType,
  workflowPresets,
} from "../../lib/index";
import { RuntimeVariable, WorkflowContainer, WorkflowEdge, WorkflowNode } from "./types";

export const presets = workflowPresets;
export const categoryLabels = workflowCategoryLabels;
export const presetByType = workflowPresetByType;
export const createNode = createWorkflowNode;
export const createEdge = createWorkflowEdge;
export { groupWorkflowPresets as groupPresets, isWorkflowConnectionValid };

export const initialNodes: WorkflowNode[] = [
  createNode("number-input", "number-a", { x: 60, y: 120 }, { subtitle: "A", value: "10" }),
  (() => {
    const node = createNode("variable-input", "runtime-multiplier", { x: 60, y: 340 }, {
      subtitle: "runtime.multiplier",
      value: "query on run",
      valueSource: "Execution variable",
      variableKey: "runtime.multiplier",
      variableQuery: "variables.get('runtime.multiplier')",
    });

    return {
      ...node,
      endpoints: node.endpoints.map((endpoint) =>
        endpoint.position === Position.Right
          ? { ...endpoint, data: { ...endpoint.data, valueType: "number" } }
          : endpoint
      ),
    };
  })(),
  createNode("math-multiply", "multiply", { x: 260, y: 220 }),
  createNode("math-add", "add", { x: 500, y: 240 }),
  createNode("logic-greater-than", "greater-than", { x: 740, y: 220 }),
  createNode("logic-if-else", "branch", { x: 980, y: 220 }),
  createNode("number-input", "number-c", { x: 320, y: 555 }, { subtitle: "C", value: "2" }),
  createNode("number-input", "limit", { x: 585, y: 590 }, { subtitle: "Limit", value: "10" }),
  createNode("result-output", "result-success", { x: 1230, y: 150 }, { variant: "success" }),
  createNode("result-output", "result-warning", { x: 1230, y: 430 }, { variant: "warning" }),
];

export const initialEdges: WorkflowEdge[] = [
  createEdge("edge-a-multiply", "number-a-out-0", "multiply-in-0"),
  createEdge("edge-runtime-multiply", "runtime-multiplier-out-0", "multiply-in-1"),
  createEdge("edge-multiply-add", "multiply-out-0", "add-in-0"),
  createEdge("edge-c-add", "number-c-out-0", "add-in-1"),
  createEdge("edge-add-greater", "add-out-0", "greater-than-in-0"),
  createEdge("edge-limit-greater", "limit-out-0", "greater-than-in-1"),
  createEdge("edge-greater-branch", "greater-than-out-0", "branch-in-0"),
  createEdge("edge-branch-success", "branch-out-0", "result-success-in-0"),
  createEdge("edge-branch-warning", "branch-out-1", "result-warning-in-0"),
];

export const initialContainers: WorkflowContainer[] = [
  {
    key: "business-logic",
    label: "Business Logic",
    nodeKeys: ["multiply", "add", "greater-than", "branch", "number-c", "limit"],
    resizeToFit: false,
  },
];

export const initialRuntimeVariables: RuntimeVariable[] = [
  {
    description: "Multiplier value fetched from runtime context when the workflow runs.",
    key: "runtime.multiplier",
    query: "variables.get('runtime.multiplier')",
    value: "4",
    valueType: "number",
  },
  {
    description: "Approval threshold available to branch and comparison nodes.",
    key: "runtime.limit",
    query: "variables.get('runtime.limit')",
    value: "10",
    valueType: "number",
  },
];

export function getNodeNumber(nodes: WorkflowNode[]): number {
  return nodes.filter((node) => node.key.startsWith("workflow-node-")).length + 1;
}
