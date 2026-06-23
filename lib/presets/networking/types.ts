import { IEdge } from "../../interfaces/IEdge";
import { IEndpoint } from "../../interfaces/IEndpoint";
import { INode } from "../../interfaces/INode";
import { INodeContainer } from "../../interfaces/INodeContainer";

export type NetworkCategory =
    | "infrastructure"
    | "security"
    | "server"
    | "endpoint"
    | "wireless"
    | "cloud";

export type NetworkStatus = "online" | "offline" | "warning" | "unknown";

export interface NetworkNodeData {
    category: NetworkCategory;
    description: string;
    hostname?: string;
    icon: string;
    ip?: string;
    label: string;
    model?: string;
    status?: NetworkStatus;
    vendor?: string;
}

export type NetworkEndpointData = Record<string, never>;
export type NetworkEdgeData = Record<string, never>;

export type NetworkNode = INode<NetworkNodeData, NetworkEndpointData>;
export type NetworkEndpoint = IEndpoint<NetworkEndpointData>;
export type NetworkEdge = IEdge<NetworkEdgeData>;
export type NetworkContainer = INodeContainer;

export type NetworkPreset = {
    category: NetworkCategory;
    description: string;
    icon: string;
    label: string;
    type: string;
};
