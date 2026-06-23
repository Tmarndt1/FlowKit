import { IEdge } from "../../interfaces/IEdge";
import { IEndpoint } from "../../interfaces/IEndpoint";
import { INode } from "../../interfaces/INode";
import { INodeContainer } from "../../interfaces/INodeContainer";

export type WorkflowCategory = "input" | "math" | "logic" | "policy" | "utility" | "output" | "data" | "text" | "trigger" | "flow" | "annotation";

export type WorkflowValueType = "number" | "boolean" | "text" | "any";

export type WorkflowThresholdBranch = {
    id: string;
    label: string;
    comparator?: ">" | ">=" | "<" | "<=" | "==" | "!=";
    threshold?: string;
    default?: boolean;
    valueType?: WorkflowValueType;
};

export type WorkflowDecisionBranch = WorkflowThresholdBranch;

export interface WorkflowBaseNodeData {
    category: WorkflowCategory;
    description: string;
    icon: string;
    subtitle?: string;
    title: string;
}

export interface WorkflowInputNodeData extends WorkflowBaseNodeData {
    category: "input";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: string;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowVariableNodeData extends WorkflowBaseNodeData {
    category: "input";
    resolvedAt?: string;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: string;
    valueSource?: string;
    variant?: never;
    variableKey: string;
    variableQuery?: string;
}

export interface WorkflowMathNodeData extends WorkflowBaseNodeData {
    category: "math";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowLogicNodeData extends WorkflowBaseNodeData {
    category: "logic";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowIfElseNodeData extends WorkflowBaseNodeData {
    category: "logic";
    resolvedAt?: never;
    styleVariant: "if-else";
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowSwitchNodeData extends WorkflowBaseNodeData {
    category: "logic";
    resolvedAt?: never;
    styleVariant: "switch-case";
    switchCases: Array<{ id: string; label: string; expression?: string; default?: boolean }>;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowThresholdPolicyNodeData extends WorkflowBaseNodeData {
    category: "policy";
    resolvedAt?: never;
    styleVariant: "threshold-policy";
    switchCases?: never;
    thresholdPolicy: {
        branches: WorkflowThresholdBranch[];
        valueKey?: string;
    };
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export type WorkflowDecisionTableNodeData = WorkflowThresholdPolicyNodeData;

export interface WorkflowUtilityNodeData extends WorkflowBaseNodeData {
    category: "utility";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowDataNodeData extends WorkflowBaseNodeData {
    category: "data";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowTextNodeData extends WorkflowBaseNodeData {
    category: "text";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowTriggerNodeData extends WorkflowBaseNodeData {
    category: "trigger";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowFlowNodeData extends WorkflowBaseNodeData {
    category: "flow";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowAnnotationNodeData extends WorkflowBaseNodeData {
    category: "annotation";
    content?: string;
    resolvedAt?: never;
    styleVariant: "annotation";
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: never;
    variableKey?: never;
    variableQuery?: never;
}

export interface WorkflowOutputNodeData extends WorkflowBaseNodeData {
    category: "output";
    resolvedAt?: never;
    styleVariant?: never;
    switchCases?: never;
    thresholdPolicy?: never;
    value?: never;
    valueSource?: never;
    variant?: "success" | "warning";
    variableKey?: never;
    variableQuery?: never;
}

export type WorkflowNodeData =
    | WorkflowInputNodeData
    | WorkflowVariableNodeData
    | WorkflowMathNodeData
    | WorkflowLogicNodeData
    | WorkflowIfElseNodeData
    | WorkflowSwitchNodeData
    | WorkflowThresholdPolicyNodeData
    | WorkflowUtilityNodeData
    | WorkflowDataNodeData
    | WorkflowTextNodeData
    | WorkflowTriggerNodeData
    | WorkflowFlowNodeData
    | WorkflowAnnotationNodeData
    | WorkflowOutputNodeData;

export type WorkflowEndpointData = {
    label: string;
    valueType: WorkflowValueType;
};

export type WorkflowEdgeData = Record<string, never>;

export type WorkflowPreset = {
    category: WorkflowCategory;
    description: string;
    icon: string;
    inputs: WorkflowEndpointData[];
    outputs: WorkflowEndpointData[];
    styleVariant?: WorkflowNodeData["styleVariant"];
    title: string;
    type: string;
};

export type WorkflowNode = INode<WorkflowNodeData, WorkflowEndpointData>;
export type WorkflowEndpoint = IEndpoint<WorkflowEndpointData>;
export type WorkflowEdge = IEdge<WorkflowEdgeData>;
export type WorkflowContainer = INodeContainer;
