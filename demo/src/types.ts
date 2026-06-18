import { IEdge, IEndpoint, INode, INodeContainer } from "../../lib/index";

export type WorkflowCategory = "input" | "math" | "logic" | "utility" | "output";

export type WorkflowShape = "arrow-rectangle" | "circle" | "diamond" | "square" | "triangle";

export type ValueType = "number" | "boolean" | "text" | "any";

export type WorkflowNodeData = {
  category: WorkflowCategory;
  description: string;
  icon: string;
  resolvedAt?: string;
  subtitle?: string;
  title: string;
  value?: string;
  valueSource?: string;
  variant?: "success" | "warning";
  variableKey?: string;
  variableQuery?: string;
};

export type ShapeNodeData = {
  description: string;
  shape: WorkflowShape;
  title: string;
};

export type WorkflowEndpointData = {
  label: string;
  valueType: ValueType;
};

export type WorkflowEdgeData = Record<string, never>;

export type WorkflowPreset = {
  category: WorkflowCategory;
  description: string;
  icon: string;
  inputs: WorkflowEndpointData[];
  outputs: WorkflowEndpointData[];
  title: string;
  type: string;
};

export type RuntimeVariable = {
  description: string;
  key: string;
  query: string;
  value: string;
  valueType: ValueType;
};

export type WorkflowNode = INode<WorkflowNodeData, WorkflowEndpointData>;
export type WorkflowEndpoint = IEndpoint<WorkflowEndpointData>;
export type WorkflowEdge = IEdge<WorkflowEdgeData>;
export type WorkflowContainer = INodeContainer;
