import {
  WorkflowCategory,
  WorkflowContainer,
  WorkflowDecisionBranch,
  WorkflowEdge,
  WorkflowEndpoint,
  WorkflowEndpointData,
  WorkflowNodeData,
  WorkflowPreset,
  WorkflowPresetNode,
  WorkflowValueType,
} from "../../lib/index";

export type {
  WorkflowCategory,
  WorkflowContainer,
  WorkflowDecisionBranch,
  WorkflowEdge,
  WorkflowEndpoint,
  WorkflowEndpointData,
  WorkflowNodeData,
  WorkflowPreset,
};

export type WorkflowShape = "arrow-rectangle" | "circle" | "diamond" | "square" | "triangle";
export type ValueType = WorkflowValueType;
export type WorkflowNode = WorkflowPresetNode;
export type DecisionBranch = WorkflowDecisionBranch;

export type ShapeNodeData = {
  description: string;
  shape: WorkflowShape;
  title: string;
};

export type RuntimeVariable = {
  description: string;
  key: string;
  query: string;
  value: string;
  valueType: ValueType;
};
