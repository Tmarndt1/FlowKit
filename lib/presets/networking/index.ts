import { NodeTypes } from "../../types/NodeTypes";
import { NetworkNode } from "../../components/presets/networking/NetworkNode";
import { networkPresets } from "./definitions";

export { NetworkNode };
export { NetworkNodeIcon } from "../../components/presets/networking/NetworkNodeIcon";
export {
    createNetworkEdge,
    createNetworkNode,
    isNetworkConnectionValid,
    setNetworkNodeStatus,
} from "./createNetworkNode";
export {
    networkCategoryLabels,
    networkNodeHeight,
    networkNodeWidth,
    networkPresetByType,
    networkPresets,
} from "./definitions";
export type {
    NetworkCategory,
    NetworkContainer,
    NetworkEdge,
    NetworkEdgeData,
    NetworkEndpoint,
    NetworkEndpointData,
    NetworkNode as NetworkPresetNode,
    NetworkNodeData,
    NetworkPreset,
    NetworkStatus,
} from "./types";

export const networkNodeTypes: NodeTypes = Object.fromEntries(
    networkPresets.map((preset) => [preset.type, NetworkNode])
) as NodeTypes;

export function groupNetworkPresets() {
    return networkPresets.reduce(
        (groups, preset) => {
            groups[preset.category].push(preset);
            return groups;
        },
        { infrastructure: [], security: [], server: [], endpoint: [], wireless: [], cloud: [] } as Record<string, typeof networkPresets>
    );
}
