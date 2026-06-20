import { Position } from "../../lib/enums/Position";
import { IEndpoint } from "../../lib/index";
import {
  WorkflowCategory,
  WorkflowContainer,
  WorkflowEdge,
  WorkflowEndpointData,
  RuntimeVariable,
  WorkflowNode,
  WorkflowPreset,
} from "./types";

export const nodeWidth = 150;
const nodeBaseHeight = 92;
const endpointStartY = 48;
const endpointGap = 28;

export const presets: WorkflowPreset[] = [
  {
    category: "input",
    description: "Provides a numeric value",
    icon: "A",
    inputs: [],
    outputs: [{ label: "value", valueType: "number" }],
    title: "Number Input",
    type: "number-input",
  },
  {
    category: "input",
    description: "Provides a boolean value",
    icon: "B",
    inputs: [],
    outputs: [{ label: "value", valueType: "boolean" }],
    title: "Boolean Input",
    type: "boolean-input",
  },
  {
    category: "input",
    description: "Provides a text value",
    icon: "T",
    inputs: [],
    outputs: [{ label: "text", valueType: "text" }],
    title: "Text Input",
    type: "text-input",
  },
  {
    category: "input",
    description: "Outputs a constant value",
    icon: "C",
    inputs: [],
    outputs: [{ label: "value", valueType: "any" }],
    title: "Constant",
    type: "constant-input",
  },
  {
    category: "input",
    description: "Reads a variable value",
    icon: "V",
    inputs: [],
    outputs: [{ label: "value", valueType: "any" }],
    title: "Variable",
    type: "variable-input",
  },
  {
    category: "math",
    description: "Adds two numbers",
    icon: "+",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "sum", valueType: "number" }],
    title: "Add",
    type: "math-add",
  },
  {
    category: "math",
    description: "Subtracts two numbers",
    icon: "-",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "difference", valueType: "number" }],
    title: "Subtract",
    type: "math-subtract",
  },
  {
    category: "math",
    description: "Multiplies two numbers",
    icon: "x",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "product", valueType: "number" }],
    title: "Multiply",
    type: "math-multiply",
  },
  {
    category: "math",
    description: "Divides two numbers",
    icon: "/",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "quotient", valueType: "number" }],
    title: "Divide",
    type: "math-divide",
  },
  {
    category: "math",
    description: "Rounds a number",
    icon: "~",
    inputs: [{ label: "value", valueType: "number" }],
    outputs: [{ label: "rounded", valueType: "number" }],
    title: "Round",
    type: "math-round",
  },
  {
    category: "logic",
    description: "Checks if a > b",
    icon: ">",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "result", valueType: "boolean" }],
    title: "Greater Than",
    type: "logic-greater-than",
  },
  {
    category: "logic",
    description: "Checks if a < b",
    icon: "<",
    inputs: [
      { label: "a", valueType: "number" },
      { label: "b", valueType: "number" },
    ],
    outputs: [{ label: "result", valueType: "boolean" }],
    title: "Less Than",
    type: "logic-less-than",
  },
  {
    category: "logic",
    description: "Checks if a == b",
    icon: "==",
    inputs: [
      { label: "a", valueType: "any" },
      { label: "b", valueType: "any" },
    ],
    outputs: [{ label: "result", valueType: "boolean" }],
    title: "Equal",
    type: "logic-equal",
  },
  {
    category: "logic",
    description: "Logical AND",
    icon: "&&",
    inputs: [
      { label: "left", valueType: "boolean" },
      { label: "right", valueType: "boolean" },
    ],
    outputs: [{ label: "result", valueType: "boolean" }],
    title: "And",
    type: "logic-and",
  },
  {
    category: "logic",
    description: "Logical OR",
    icon: "||",
    inputs: [
      { label: "left", valueType: "boolean" },
      { label: "right", valueType: "boolean" },
    ],
    outputs: [{ label: "result", valueType: "boolean" }],
    title: "Or",
    type: "logic-or",
  },
  {
    category: "logic",
    description: "Logical NOT",
    icon: "!",
    inputs: [{ label: "value", valueType: "boolean" }],
    outputs: [{ label: "result", valueType: "boolean" }],
    title: "Not",
    type: "logic-not",
  },
  {
    category: "logic",
    description: "Routes based on condition",
    icon: "B",
    inputs: [{ label: "condition", valueType: "boolean" }],
    outputs: [
      { label: "true", valueType: "any" },
      { label: "false", valueType: "any" },
    ],
    title: "Branch",
    type: "logic-branch",
  },
  {
    category: "utility",
    description: "Formats any value",
    icon: "F",
    inputs: [{ label: "value", valueType: "any" }],
    outputs: [{ label: "text", valueType: "text" }],
    title: "Format",
    type: "utility-format",
  },
  {
    category: "utility",
    description: "Converts value type",
    icon: "C",
    inputs: [{ label: "value", valueType: "any" }],
    outputs: [{ label: "converted", valueType: "any" }],
    title: "Convert",
    type: "utility-convert",
  },
  {
    category: "utility",
    description: "Returns first non-null value",
    icon: "Co",
    inputs: [
      { label: "left", valueType: "any" },
      { label: "right", valueType: "any" },
    ],
    outputs: [{ label: "value", valueType: "any" }],
    title: "Coalesce",
    type: "utility-coalesce",
  },
  {
    category: "utility",
    description: "Delays execution",
    icon: "D",
    inputs: [{ label: "value", valueType: "any" }],
    outputs: [{ label: "value", valueType: "any" }],
    title: "Delay",
    type: "utility-delay",
  },
  {
    category: "output",
    description: "Outputs a final result",
    icon: "R",
    inputs: [{ label: "value", valueType: "any" }],
    outputs: [],
    title: "Result",
    type: "result-output",
  },
  {
    category: "output",
    description: "Logs a message",
    icon: "L",
    inputs: [{ label: "message", valueType: "any" }],
    outputs: [],
    title: "Log",
    type: "log-output",
  },
  {
    category: "output",
    description: "Shows an alert",
    icon: "A",
    inputs: [{ label: "message", valueType: "any" }],
    outputs: [],
    title: "Alert",
    type: "alert-output",
  },
];

export const categoryLabels: Record<WorkflowCategory, string> = {
  input: "Input",
  math: "Math",
  logic: "Logic",
  utility: "Utility",
  output: "Output",
};

export const presetByType = new Map(presets.map((preset) => [preset.type, preset]));

function getNodeHeight(preset: WorkflowPreset): number {
  return Math.max(
    nodeBaseHeight,
    endpointStartY + Math.max(preset.inputs.length, preset.outputs.length) * endpointGap
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

export function createEndpoints(nodeKey: string, preset: WorkflowPreset): WorkflowNode["endpoints"] {
  return [
    ...preset.inputs.map((endpoint, index) => ({
      id: `${nodeKey}-in-${index}`,
      offset: { x: 0, y: endpointStartY + index * endpointGap },
      position: Position.Left,
      data: endpoint,
    })),
    ...preset.outputs.map((endpoint, index) => ({
      id: `${nodeKey}-out-${index}`,
      offset: { x: nodeWidth, y: endpointStartY + index * endpointGap },
      position: Position.Right,
      data: endpoint,
    })),
  ];
}

export function createNode(
  presetType: string,
  key: string,
  offset: { x: number; y: number },
  options: Partial<WorkflowNode["data"]> = {}
): WorkflowNode {
  const preset = presetByType.get(presetType);

  if (preset == null) throw new Error(`Unknown workflow node preset: ${presetType}`);

  return {
    key,
    type: preset.type,
    offset,
    data: {
      category: preset.category,
      description: preset.description,
      icon: preset.icon,
      title: preset.title,
      ...options,
    },
    endpoints: createEndpoints(key, preset),
    style: {
      height: getNodeHeight(preset),
      width: nodeWidth,
    },
  };
}

export function createEdge(
  key: string,
  sourceId: string,
  targetId: string
): WorkflowEdge {
  return {
    key,
    type: "edge",
    sourceId,
    targetId,
  };
}

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
  createNode("logic-branch", "branch", { x: 980, y: 220 }),
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

export function groupPresets() {
  return presets.reduce<Record<WorkflowCategory, WorkflowPreset[]>>(
    (groups, preset) => {
      groups[preset.category].push(preset);
      return groups;
    },
    { input: [], math: [], logic: [], utility: [], output: [] }
  );
}

export function getNodeNumber(nodes: WorkflowNode[]): number {
  return nodes.filter((node) => node.key.startsWith("workflow-node-")).length + 1;
}
