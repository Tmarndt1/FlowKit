import { IEdge, INode, INodeContainer, Position } from "../../lib/index";

export type PerformanceNodeData = { label: string; load: number; color: string };
export type PerformanceNode = INode<PerformanceNodeData, never>;
export type PerformanceStats = { nodes: number; edges: number; containers: number };
export const PERFORMANCE_SIZES = [250, 1000, 2500, 5000] as const;
const GROUP_SIZE = 20;
const COLORS = ["#68e8ff", "#a477ff", "#43dc83", "#ffbe64"];

export function createPerformanceGraph(nodeCount: number) {
  const nodes: PerformanceNode[] = [];
  const edges: IEdge<never>[] = [];
  const containers: INodeContainer[] = [];
  const groupCount = Math.ceil(nodeCount / GROUP_SIZE);
  const columns = Math.ceil(Math.sqrt(groupCount * 0.65));

  function connect(source: number, target: number, bridge = false) {
    edges.push({
      key: `perf-edge-${source}-${target}`,
      sourceId: `perf-node-${source}-out`,
      targetId: `perf-node-${target}-in`,
      className: bridge ? "performance-bridge" : "performance-connection",
      collapsible: false,
    });
  }

  for (let group = 0; group < groupCount; group++) {
    const x = (group % columns) * 1060;
    const y = Math.floor(group / columns) * 510;
    const first = group * GROUP_SIZE;
    const end = Math.min(first + GROUP_SIZE, nodeCount);
    const color = COLORS[group % COLORS.length];
    const nodeKeys: string[] = [];

    for (let index = first; index < end; index++) {
      const local = index - first;
      const key = `perf-node-${index}`;
      nodeKeys.push(key);
      nodes.push({
        key,
        type: "performance",
        offset: { x: x + 30 + (local % 5) * 195, y: y + 65 + Math.floor(local / 5) * 100 },
        data: { label: `Worker ${String(index + 1).padStart(4, "0")}`, load: (index * 37) % 100, color },
        endpoints: [
          { id: `${key}-in`, position: Position.Left, offset: { x: -5, y: 31 } },
          { id: `${key}-out`, position: Position.Right, offset: { x: 155, y: 31 } },
        ],
      });
      if (index + 1 < end) connect(index, index + 1);
      if (index + 2 < end) connect(index, index + 2);
    }

    containers.push({
      key: `perf-group-${group}`,
      label: `Cluster ${String(group + 1).padStart(3, "0")} · ${nodeKeys.length} workers`,
      nodeKeys,
      position: { x, y },
      resizeToFit: false,
      style: { width: 1005, height: 460, borderColor: color },
      className: "performance-group",
    });
    if (group > 0) connect(first - 1, first, true);
  }

  return { nodes, edges, containers };
}

export function getPerformanceStats(nodeCount: number): PerformanceStats {
  const groups = Math.ceil(nodeCount / GROUP_SIZE);
  const remainder = nodeCount % GROUP_SIZE;
  const fullGroups = Math.floor(nodeCount / GROUP_SIZE);
  return {
    nodes: nodeCount,
    containers: groups,
    edges: fullGroups * 37 + (remainder > 0 ? Math.max(0, remainder - 1) + Math.max(0, remainder - 2) : 0) + Math.max(0, groups - 1),
  };
}
