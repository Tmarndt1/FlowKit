import * as React from "react";
import {
  EdgeCollapseMode,
  EdgePathType,
  FlowKit,
  FlowKitControls,
  FlowKitEvents,
  FlowKitGrid,
  FlowKitGridSnap,
  IEdge,
  INode,
  NodeTypes,
} from "../../../lib/index";

type NetworkNodeData = {
  accent: "blue" | "cyan" | "green" | "orange" | "purple" | "red";
  deviceType: "client" | "firewall" | "radio" | "router" | "storage" | "switch" | "vm";
  metric: string;
  subtitle: string;
  title: string;
};

type NetworkNodeType = INode<NetworkNodeData, never>;
type NetworkEdge = IEdge<{ throughput: string }>;

const networkNodes: NetworkNodeType[] = [
  {
    key: "network-radio",
    type: "network-node",
    offset: { x: 36, y: 56 },
    endpoints: [],
    data: {
      accent: "cyan",
      deviceType: "radio",
      metric: "5.8 GHz",
      subtitle: "Wireless backhaul",
      title: "Radio Link",
    },
  },
  {
    key: "network-client",
    type: "network-node",
    offset: { x: 36, y: 224 },
    endpoints: [],
    data: {
      accent: "blue",
      deviceType: "client",
      metric: "24k req/min",
      subtitle: "Branch clients",
      title: "Users",
    },
  },
  {
    key: "network-router",
    type: "network-node",
    offset: { x: 272, y: 128 },
    endpoints: [],
    data: {
      accent: "purple",
      metric: "99.98%",
      deviceType: "router",
      subtitle: "WAN edge",
      title: "Router",
    },
  },
  {
    key: "network-firewall",
    type: "network-node",
    offset: { x: 500, y: 128 },
    endpoints: [],
    data: {
      accent: "red",
      deviceType: "firewall",
      metric: "184 rules",
      subtitle: "Policy boundary",
      title: "Firewall",
    },
  },
  {
    key: "network-switch",
    type: "network-node",
    offset: { x: 728, y: 128 },
    endpoints: [],
    data: {
      accent: "green",
      deviceType: "switch",
      metric: "40 GbE",
      subtitle: "Core fabric",
      title: "Switch",
    },
  },
  {
    key: "network-vm-api",
    type: "network-node",
    offset: { x: 956, y: 56 },
    endpoints: [],
    data: {
      accent: "orange",
      deviceType: "vm",
      metric: "18 ms p95",
      subtitle: "API workload",
      title: "VM App",
    },
  },
  {
    key: "network-vm-worker",
    type: "network-node",
    offset: { x: 956, y: 224 },
    endpoints: [],
    data: {
      accent: "orange",
      deviceType: "vm",
      metric: "68 jobs",
      subtitle: "Worker pool",
      title: "VM Worker",
    },
  },
  {
    key: "network-storage",
    type: "network-node",
    offset: { x: 1184, y: 140 },
    endpoints: [],
    data: {
      accent: "blue",
      deviceType: "storage",
      metric: "4 replicas",
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
    arrows: "target",
    sourceId: "network-radio",
    targetId: "network-router",
    data: { throughput: "backhaul" },
  },
  {
    key: "network-edge-client-router",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    sourceId: "network-client",
    targetId: "network-router",
    data: { throughput: "lan" },
  },
  {
    key: "network-edge-router-firewall",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    sourceId: "network-router",
    targetId: "network-firewall",
    data: { throughput: "north-south" },
  },
  {
    key: "network-edge-firewall-switch",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    sourceId: "network-firewall",
    targetId: "network-switch",
    data: { throughput: "inspection" },
  },
  {
    key: "network-edge-switch-api",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    sourceId: "network-switch",
    targetId: "network-vm-api",
    data: { throughput: "service" },
  },
  {
    key: "network-edge-switch-worker",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    sourceId: "network-switch",
    targetId: "network-vm-worker",
    data: { throughput: "jobs" },
  },
  {
    key: "network-edge-api-storage",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    sourceId: "network-vm-api",
    targetId: "network-storage",
    data: { throughput: "reads" },
  },
  {
    key: "network-edge-worker-storage",
    type: "edge",
    anchorMode: "floating",
    arrows: "none",
    sourceId: "network-vm-worker",
    targetId: "network-storage",
    data: { throughput: "writes" },
  },
];

const networkNodeTypes: NodeTypes = {
  "network-node": NetworkNode,
};

function NetworkNode(props: NetworkNodeType) {
  const accent = props.data?.accent ?? "blue";
  const deviceType = props.data?.deviceType ?? "client";

  return (
    <div className={`network-node network-node-${accent} network-device-${deviceType}`}>
      <span className="network-node-icon" aria-hidden="true">
        <span />
      </span>
      <span className="network-node-status" />
      <small>{deviceType}</small>
      <strong>{props.data?.title}</strong>
      <span>{props.data?.subtitle}</span>
      <em>{props.data?.metric}</em>
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
        <strong>Floating Edge Network</strong>
        <span>Router, switch, VM, radio, firewall, and storage devices all use floating edges.</span>
      </div>
      <div className="network-canvas">
        <FlowKit
          animatedEdges={animatedEdges}
          centerOnLoad
          collapsibleEdges={collapsibleEdges}
          edgePathType={edgePathType}
          edges={edges}
          nodes={networkNodes}
          nodeTypes={networkNodeTypes}
          onEdgeCollapsedChange={({ collapsed, edge, mode }) => onEdgeCollapsedChange(edge.key, collapsed, mode)}
          zoomMax={1.6}
          zoomMin={0.55}
        >
          <FlowKitGrid size={28} color="rgba(123, 151, 189, .1)" />
          <FlowKitControls />
          <FlowKitEvents />
          <FlowKitGridSnap size={20} />
        </FlowKit>
      </div>
    </section>
  );
}
