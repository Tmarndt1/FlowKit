import * as React from "react";
import {
  EdgeCollapseMode,
  EdgePathType,
  FlowKit,
  FlowKitControls,
  FlowKitEvents,
  FlowKitGrid,
  FlowKitGridSnap,
  FlowKitLegend,
  FlowKitLegendItem,
  IEdge,
  INode,
  INodeContainer,
  NodeTypes,
} from "../../../lib/index";

type NetworkNodeData = {
  accent: "blue" | "cyan" | "green" | "orange" | "purple" | "red";
  deviceType: "client" | "firewall" | "radio" | "router" | "storage" | "switch" | "vm";
  metric: string;
  status: "critical" | "degraded" | "healthy" | "unknown";
  statusLabel: string;
  subtitle: string;
  title: string;
};

type NetworkNodeType = INode<NetworkNodeData, never>;
type NetworkEdgeData = {
  label: string;
  latency: string;
  status: "down" | "degraded" | "up" | "unknown";
  throughput: string;
};
type NetworkEdge = IEdge<NetworkEdgeData>;

const networkNodes: NetworkNodeType[] = [
  {
    key: "network-radio",
    type: "network-node",
    offset: { x: 70, y: 50 },
    endpoints: [],
    data: {
      accent: "cyan",
      deviceType: "radio",
      metric: "-18 dBm",
      status: "degraded",
      statusLabel: "High noise",
      subtitle: "Wireless backhaul",
      title: "Backhaul Radio",
    },
  },
  {
    key: "network-client",
    type: "network-node",
    offset: { x: 70, y: 390 },
    endpoints: [],
    data: {
      accent: "blue",
      deviceType: "client",
      metric: "219 clients",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Branch access",
      title: "Client VLAN",
    },
  },
  {
    key: "network-router",
    type: "network-node",
    offset: { x: 420, y: 220 },
    endpoints: [],
    data: {
      accent: "purple",
      deviceType: "router",
      metric: "42% CPU",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "WAN edge",
      title: "Edge Router",
    },
  },
  {
    key: "network-firewall",
    type: "network-node",
    offset: { x: 760, y: 86 },
    endpoints: [],
    data: {
      accent: "red",
      deviceType: "firewall",
      metric: "8 drops/s",
      status: "degraded",
      statusLabel: "Policy drift",
      subtitle: "Policy boundary",
      title: "Firewall",
    },
  },
  {
    key: "network-switch",
    type: "network-node",
    offset: { x: 1040, y: 320 },
    endpoints: [],
    data: {
      accent: "green",
      deviceType: "switch",
      metric: "40 GbE",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Core fabric",
      title: "Core Switch",
    },
  },
  {
    key: "network-vm-api",
    type: "network-node",
    offset: { x: 1380, y: 62 },
    endpoints: [],
    data: {
      accent: "orange",
      deviceType: "vm",
      metric: "18 ms p95",
      status: "healthy",
      statusLabel: "Serving",
      subtitle: "API workload",
      title: "VM App",
    },
  },
  {
    key: "network-vm-worker",
    type: "network-node",
    offset: { x: 1380, y: 430 },
    endpoints: [],
    data: {
      accent: "orange",
      deviceType: "vm",
      metric: "Queue stalled",
      status: "critical",
      statusLabel: "Unreachable",
      subtitle: "Worker pool",
      title: "VM Worker",
    },
  },
  {
    key: "network-storage",
    type: "network-node",
    offset: { x: 1720, y: 244 },
    endpoints: [],
    data: {
      accent: "blue",
      deviceType: "storage",
      metric: "3/4 replicas",
      status: "degraded",
      statusLabel: "Resyncing",
      subtitle: "Persistent data",
      title: "Storage",
    },
  },
];

const networkEdges: NetworkEdge[] = [
  {
    key: "network-edge-radio-router",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-degraded",
    label: "RF 37 ms",
    sourceId: "network-radio",
    targetId: "network-router",
    data: { label: "RF backhaul", latency: "37 ms", status: "degraded", throughput: "410 Mbps" },
  },
  {
    key: "network-edge-client-router",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-up",
    label: "Access 8.1G",
    sourceId: "network-client",
    targetId: "network-router",
    data: { label: "Access uplink", latency: "2 ms", status: "up", throughput: "8.1 Gbps" },
  },
  {
    key: "network-edge-router-firewall",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-up",
    label: "WAN 2.4G",
    sourceId: "network-router",
    targetId: "network-firewall",
    data: { label: "WAN handoff", latency: "5 ms", status: "up", throughput: "2.4 Gbps" },
  },
  {
    key: "network-edge-firewall-switch",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-degraded",
    label: "Inspect 22 ms",
    sourceId: "network-firewall",
    targetId: "network-switch",
    data: { label: "Inspection path", latency: "22 ms", status: "degraded", throughput: "1.1 Gbps" },
  },
  {
    key: "network-edge-switch-api",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-up",
    label: "App 6.3G",
    sourceId: "network-switch",
    targetId: "network-vm-api",
    data: { label: "App trunk", latency: "1 ms", status: "up", throughput: "6.3 Gbps" },
  },
  {
    key: "network-edge-switch-worker",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-down",
    label: "Worker down",
    sourceId: "network-switch",
    targetId: "network-vm-worker",
    data: { label: "Worker trunk", latency: "timeout", status: "down", throughput: "0 bps" },
  },
  {
    key: "network-edge-api-storage",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-up",
    label: "Read 940M",
    sourceId: "network-vm-api",
    targetId: "network-storage",
    data: { label: "Storage read", latency: "4 ms", status: "up", throughput: "940 Mbps" },
  },
  {
    key: "network-edge-worker-storage",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    className: "network-link-degraded",
    label: "Write 81 ms",
    sourceId: "network-vm-worker",
    targetId: "network-storage",
    data: { label: "Write path", latency: "81 ms", status: "degraded", throughput: "120 Mbps" },
  },
];

const networkContainers: INodeContainer[] = [
  {
    key: "network-rack-wan",
    label: "Rack A - WAN / Access",
    nodeKeys: ["network-radio", "network-client", "network-router"],
    padding: 24,
  },
  {
    key: "network-rack-core",
    label: "Rack B - Security / Core",
    nodeKeys: ["network-firewall", "network-switch"],
    padding: 24,
  },
  {
    key: "network-rack-compute",
    label: "Rack C - Compute / Storage",
    nodeKeys: ["network-vm-api", "network-vm-worker", "network-storage"],
    padding: 24,
  },
];

const networkNodeTypes: NodeTypes = {
  "network-node": NetworkNode,
};

function getTopologyLegendItems(
  nodeSummary: Record<NetworkNodeData["status"], number>,
  linkSummary: Record<NetworkEdgeData["status"], number>
): FlowKitLegendItem[] {
  return [
    {
      key: "healthy-devices",
      label: "Healthy devices",
      value: nodeSummary.healthy,
      color: "#57df84",
      marker: "dot",
    },
    {
      key: "degraded-devices",
      label: "Degraded devices",
      value: nodeSummary.degraded,
      color: "#f6bd4a",
      marker: "dot",
    },
    {
      key: "critical-devices",
      label: "Critical devices",
      value: nodeSummary.critical,
      color: "#ff6767",
      marker: "dot",
    },
    {
      key: "up-links",
      label: "Links up",
      value: linkSummary.up,
      color: "#57df84",
      marker: "line",
    },
    {
      key: "degraded-links",
      label: "Links degraded",
      value: linkSummary.degraded,
      color: "#f6bd4a",
      marker: "line",
    },
    {
      key: "down-links",
      label: "Links down",
      value: linkSummary.down,
      color: "#ff6767",
      marker: "line",
    },
  ];
}

function NetworkNode(props: NetworkNodeType) {
  const accent = props.data?.accent ?? "blue";
  const deviceType = props.data?.deviceType ?? "client";
  const status = props.data?.status ?? "unknown";

  return (
    <div className={`network-node network-node-${accent} network-device-${deviceType} network-status-${status}`}>
      <span className="network-node-icon" aria-hidden="true">
        <span />
      </span>
      <span className="network-node-status" />
      <small>{deviceType}</small>
      <strong>{props.data?.title}</strong>
      <span>{props.data?.subtitle}</span>
      <em>{props.data?.statusLabel} - {props.data?.metric}</em>
    </div>
  );
}

type NetworkDiagramProps = {
  animatedEdges: boolean;
  collapsibleEdges: boolean;
  edgePathType: EdgePathType;
};

export function NetworkDiagram({ animatedEdges, collapsibleEdges, edgePathType }: NetworkDiagramProps) {
  const [edges, setEdges] = React.useState<NetworkEdge[]>(networkEdges);
  const nodeSummary = React.useMemo(() => {
    const counts = { critical: 0, degraded: 0, healthy: 0, unknown: 0 };

    networkNodes.forEach((node) => {
      counts[node.data?.status ?? "unknown"] += 1;
    });

    return counts;
  }, []);
  const linkSummary = React.useMemo(() => {
    const counts = { degraded: 0, down: 0, unknown: 0, up: 0 };

    edges.forEach((edge) => {
      counts[edge.data?.status ?? "unknown"] += 1;
    });

    return counts;
  }, [edges]);
  const legendItems = React.useMemo(
    () => getTopologyLegendItems(nodeSummary, linkSummary),
    [linkSummary, nodeSummary]
  );

  React.useEffect(() => {
    if (collapsibleEdges) return;

    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        collapsed: false,
        collapseMode: undefined,
      }))
    );
  }, [collapsibleEdges]);

  const onEdgeCollapsedChange = React.useCallback((edgeKey: string, collapsed: boolean, mode: EdgeCollapseMode) => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.key === edgeKey
          ? {
              ...edge,
              collapsed,
              collapseMode: collapsed ? mode : undefined,
            }
          : edge
      )
    );
  }, []);

  return (
    <section className="network-panel">
      <div className="network-panel-header">
        <div className="network-title-block">
          <strong>Monitored Topology</strong>
          <span>Live device health and link state using floating edges.</span>
        </div>
      </div>
      <div className="network-canvas">
        <FlowKit
          animatedEdges={animatedEdges}
          centerOnLoad
          collapsibleEdges={collapsibleEdges}
          edgePathType={edgePathType}
          edges={edges.map((edge) => ({
            ...edge,
            label: collapsibleEdges ? undefined : edge.label,
          }))}
          containers={networkContainers}
          nodes={networkNodes}
          nodeTypes={networkNodeTypes}
          onEdgeCollapsedChange={({ collapsed, edge, mode }) => onEdgeCollapsedChange(edge.key, collapsed, mode)}
          zoomMax={1.6}
          zoomMin={0.55}
        >
          <FlowKitGrid size={28} color="rgba(123, 151, 189, .1)" />
          <FlowKitLegend
            className="network-legend"
            items={legendItems}
            position="top-right"
            title="Topology Status"
          />
          <FlowKitControls />
          <FlowKitEvents />
          <FlowKitGridSnap containers size={20} />
        </FlowKit>
      </div>
    </section>
  );
}
