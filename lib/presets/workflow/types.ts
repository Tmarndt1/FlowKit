import { IEdge } from "../../interfaces/IEdge";
import { IEndpoint } from "../../interfaces/IEndpoint";
import { INode } from "../../interfaces/INode";
import { INodeContainer } from "../../interfaces/INodeContainer";

export type WorkflowCategory = "input" | "math" | "logic" | "utility" | "output";

export type WorkflowValueType = "number" | "boolean" | "text" | "any";

export type WorkflowNodeData = {
    category: WorkflowCategory;
    switchCases?: Array<{ id: string; label: string; expression?: string; default?: boolean }>;
    description: string;
    icon: string;
    resolvedAt?: string;
    styleVariant?: "if-else" | "switch-case";
    subtitle?: string;
    title: string;
    value?: string;
    valueSource?: string;
    variant?: "success" | "warning";
    variableKey?: string;
    variableQuery?: string;
};

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
