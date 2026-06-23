import { Position } from "../../enums/Position";
import { networkNodeHeight, networkNodeWidth, networkPresetByType } from "./definitions";
import { NetworkEdge, NetworkNode, NetworkNodeData, NetworkStatus } from "./types";

export function createNetworkNode(
    presetType: string,
    key: string,
    offset: { x: number; y: number },
    options: Partial<NetworkNodeData> = {}
): NetworkNode {
    const preset = networkPresetByType.get(presetType);

    if (preset == null) throw new Error(`Unknown network node preset: ${presetType}`);

    return {
        key,
        type: preset.type,
        offset,
        data: {
            category: preset.category,
            description: preset.description,
            icon: preset.icon,
            label: preset.label,
            status: "unknown",
            ...options,
        },
        endpoints: [
            { id: `${key}-top`,    offset: { x: networkNodeWidth / 2, y: 0 },               position: Position.Top },
            { id: `${key}-right`,  offset: { x: networkNodeWidth,     y: networkNodeHeight / 2 }, position: Position.Right },
            { id: `${key}-bottom`, offset: { x: networkNodeWidth / 2, y: networkNodeHeight },  position: Position.Bottom },
            { id: `${key}-left`,   offset: { x: 0,                    y: networkNodeHeight / 2 }, position: Position.Left },
        ],
        style: {
            height: networkNodeHeight,
            width: networkNodeWidth,
        },
    };
}

export function createNetworkEdge(key: string, sourceId: string, targetId: string): NetworkEdge {
    return { key, type: "edge", sourceId, targetId };
}

export function isNetworkConnectionValid(): boolean {
    return true;
}

export function setNetworkNodeStatus(node: NetworkNode, status: NetworkStatus): NetworkNode {
    return { ...node, data: { ...node.data!, status } };
}
