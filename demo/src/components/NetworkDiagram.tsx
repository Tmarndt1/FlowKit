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
  FlowKitMiniMap,
  IEdge,
  INode,
  NodeTypes,
} from "../../../lib/index";

type NetworkNodeData = {
  accent: "blue" | "cyan" | "gray" | "green" | "orange" | "purple" | "red" | "yellow";
  cpu?: number;
  deviceType: "client" | "firewall" | "internet" | "phone" | "radio" | "router" | "server" | "storage" | "switch" | "vm" | "wireless";
  ip?: string;
  location?: string;
  memory?: number;
  metric: string;
  model?: string;
  role?: string;
  status: "critical" | "degraded" | "healthy" | "unknown";
  statusLabel: string;
  subtitle: string;
  temperature?: string;
  title: string;
  uptime?: string;
  vendor?: string;
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
    key: "network-internet",
    type: "network-node",
    offset: { x: 710, y: 20 },
    endpoints: [],
    data: {
      accent: "gray",
      deviceType: "internet",
      ip: "203.0.113.10",
      location: "ISP Edge",
      metric: "1.2 Gbps",
      model: "Transit",
      role: "Internet uplink",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "External WAN",
      title: "Internet",
      uptime: "30d 6h 11m",
      vendor: "Carrier",
    },
  },
  {
    key: "network-firewall",
    type: "network-node",
    offset: { x: 735, y: 155 },
    endpoints: [],
    data: {
      accent: "red",
      cpu: 68,
      deviceType: "firewall",
      ip: "10.0.0.254",
      location: "DC1 - Edge",
      memory: 61,
      metric: "99% WAN",
      model: "PA-3220",
      role: "Policy boundary",
      status: "degraded",
      statusLabel: "High utilization",
      subtitle: "Firewall",
      temperature: "43C",
      title: "FW-01",
      uptime: "12d 1h 02m",
      vendor: "Palo Alto",
    },
  },
  {
    key: "network-core-rtr-01",
    type: "network-node",
    offset: { x: 710, y: 310 },
    endpoints: [],
    data: {
      accent: "blue",
      cpu: 42,
      deviceType: "router",
      ip: "10.0.0.1",
      location: "DC1 - Core",
      memory: 58,
      metric: "42% CPU",
      model: "ASR-1001-X",
      role: "Core Router",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Router",
      temperature: "38C",
      title: "CORE-RTR-01",
      uptime: "15d 4h 32m",
      vendor: "Cisco",
    },
  },
  {
    key: "network-core-rtr-02",
    type: "network-node",
    offset: { x: 270, y: 310 },
    endpoints: [],
    data: {
      accent: "blue",
      cpu: 34,
      deviceType: "router",
      ip: "10.0.0.2",
      location: "DC1 - Core",
      memory: 44,
      metric: "34% CPU",
      model: "ASR-1001-X",
      role: "Core Router",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Router",
      temperature: "36C",
      title: "CORE-RTR-02",
      uptime: "15d 4h 28m",
      vendor: "Cisco",
    },
  },
  {
    key: "network-core-rtr-03",
    type: "network-node",
    offset: { x: 1150, y: 310 },
    endpoints: [],
    data: {
      accent: "blue",
      cpu: 31,
      deviceType: "router",
      ip: "10.0.0.3",
      location: "DC1 - Core",
      memory: 47,
      metric: "31% CPU",
      model: "ASR-1001-X",
      role: "Core Router",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Router",
      temperature: "37C",
      title: "CORE-RTR-03",
      uptime: "15d 3h 57m",
      vendor: "Cisco",
    },
  },
  {
    key: "network-dist-sw-01",
    type: "network-node",
    offset: { x: 435, y: 565 },
    endpoints: [],
    data: {
      accent: "green",
      cpu: 36,
      deviceType: "switch",
      ip: "10.0.8.11",
      location: "Rack B",
      memory: 48,
      metric: "10 Gbps",
      model: "Nexus 93180",
      role: "Distribution Switch",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Switch",
      temperature: "39C",
      title: "DIST-SW-01",
      uptime: "20d 9h 12m",
      vendor: "Cisco",
    },
  },
  {
    key: "network-dist-sw-02",
    type: "network-node",
    offset: { x: 985, y: 565 },
    endpoints: [],
    data: {
      accent: "green",
      cpu: 38,
      deviceType: "switch",
      ip: "10.0.8.12",
      location: "Rack C",
      memory: 52,
      metric: "10 Gbps",
      model: "Nexus 93180",
      role: "Distribution Switch",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Switch",
      temperature: "40C",
      title: "DIST-SW-02",
      uptime: "20d 8h 55m",
      vendor: "Cisco",
    },
  },
  {
    key: "network-acc-sw-01",
    type: "network-node",
    offset: { x: 200, y: 765 },
    endpoints: [],
    data: {
      accent: "green",
      deviceType: "switch",
      ip: "10.0.16.11",
      location: "Floor 1",
      metric: "1 Gbps",
      model: "Catalyst 9300",
      role: "Access Switch",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Switch",
      title: "ACC-SW-01",
      vendor: "Cisco",
    },
  },
  {
    key: "network-acc-sw-02",
    type: "network-node",
    offset: { x: 505, y: 785 },
    endpoints: [],
    data: {
      accent: "green",
      deviceType: "switch",
      ip: "10.0.16.12",
      location: "Floor 2",
      metric: "1 Gbps",
      model: "Catalyst 9300",
      role: "Access Switch",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Switch",
      title: "ACC-SW-02",
      vendor: "Cisco",
    },
  },
  {
    key: "network-acc-sw-03",
    type: "network-node",
    offset: { x: 915, y: 785 },
    endpoints: [],
    data: {
      accent: "green",
      deviceType: "switch",
      ip: "10.0.16.13",
      location: "Floor 3",
      metric: "1 Gbps",
      model: "Catalyst 9300",
      role: "Access Switch",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Switch",
      title: "ACC-SW-03",
      vendor: "Cisco",
    },
  },
  {
    key: "network-acc-sw-04",
    type: "network-node",
    offset: { x: 1220, y: 765 },
    endpoints: [],
    data: {
      accent: "green",
      deviceType: "switch",
      ip: "10.0.16.14",
      location: "Floor 4",
      metric: "100 Mbps",
      model: "Catalyst 9200",
      role: "Access Switch",
      status: "degraded",
      statusLabel: "Rate limited",
      subtitle: "Switch",
      title: "ACC-SW-04",
      vendor: "Cisco",
    },
  },
  {
    key: "network-srv-app-01",
    type: "network-node",
    offset: { x: 80, y: 1015 },
    endpoints: [],
    data: {
      accent: "purple",
      deviceType: "server",
      ip: "10.0.32.21",
      location: "Rack D",
      metric: "70%",
      model: "PowerEdge R650",
      role: "Application Server",
      status: "healthy",
      statusLabel: "Serving",
      subtitle: "Server",
      title: "SRV-APP-01",
      vendor: "Dell",
    },
  },
  {
    key: "network-srv-db-01",
    type: "network-node",
    offset: { x: 315, y: 1015 },
    endpoints: [],
    data: {
      accent: "purple",
      deviceType: "server",
      ip: "10.0.32.31",
      location: "Rack D",
      metric: "Disk latency",
      model: "PowerEdge R750",
      role: "Database Server",
      status: "critical",
      statusLabel: "Storage alert",
      subtitle: "Server",
      title: "SRV-DB-01",
      vendor: "Dell",
    },
  },
  {
    key: "network-ap-01",
    type: "network-node",
    offset: { x: 565, y: 1035 },
    endpoints: [],
    data: {
      accent: "yellow",
      deviceType: "wireless",
      ip: "10.0.48.41",
      location: "Floor 2",
      metric: "35%",
      model: "MR46",
      role: "Wireless AP",
      status: "degraded",
      statusLabel: "Channel busy",
      subtitle: "Wireless AP",
      title: "AP-01",
      vendor: "Meraki",
    },
  },
  {
    key: "network-ap-02",
    type: "network-node",
    offset: { x: 780, y: 1035 },
    endpoints: [],
    data: {
      accent: "yellow",
      deviceType: "wireless",
      ip: "10.0.48.42",
      location: "Floor 2",
      metric: "28%",
      model: "MR46",
      role: "Wireless AP",
      status: "healthy",
      statusLabel: "Online",
      subtitle: "Wireless AP",
      title: "AP-02",
      vendor: "Meraki",
    },
  },
  {
    key: "network-srv-web-01",
    type: "network-node",
    offset: { x: 915, y: 1015 },
    endpoints: [],
    data: {
      accent: "purple",
      deviceType: "server",
      ip: "10.0.32.41",
      location: "Rack E",
      metric: "66%",
      model: "PowerEdge R650",
      role: "Web Server",
      status: "healthy",
      statusLabel: "Serving",
      subtitle: "Server",
      title: "SRV-WEB-01",
      vendor: "Dell",
    },
  },
  {
    key: "network-srv-web-02",
    type: "network-node",
    offset: { x: 1145, y: 1015 },
    endpoints: [],
    data: {
      accent: "purple",
      deviceType: "server",
      ip: "10.0.32.42",
      location: "Rack E",
      metric: "62%",
      model: "PowerEdge R650",
      role: "Web Server",
      status: "healthy",
      statusLabel: "Serving",
      subtitle: "Server",
      title: "SRV-WEB-02",
      vendor: "Dell",
    },
  },
  {
    key: "network-phone-01",
    type: "network-node",
    offset: { x: 1375, y: 1035 },
    endpoints: [],
    data: {
      accent: "gray",
      deviceType: "phone",
      ip: "10.0.64.18",
      location: "Lobby",
      metric: "SIP down",
      model: "8845",
      role: "IP Phone",
      status: "critical",
      statusLabel: "Offline",
      subtitle: "IP Phone",
      title: "IP-PHONE-01",
      vendor: "Cisco",
    },
  },
];

const networkEdges: NetworkEdge[] = [
  {
    key: "network-edge-internet-firewall",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-down",
    label: "1.2 Gbps 99%",
    sourceId: "network-internet",
    targetId: "network-firewall",
    data: { label: "ISP uplink", latency: "18 ms", status: "down", throughput: "1.2 Gbps" },
  },
  {
    key: "network-edge-firewall-core",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-degraded",
    label: "10 Gbps 79%",
    sourceId: "network-firewall",
    targetId: "network-core-rtr-01",
    data: { label: "Firewall transit", latency: "12 ms", status: "degraded", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-core-left",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "10 Gbps 45%",
    sourceId: "network-core-rtr-01",
    targetId: "network-core-rtr-02",
    data: { label: "Core peer left", latency: "1 ms", status: "up", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-core-right",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "10 Gbps 42%",
    sourceId: "network-core-rtr-01",
    targetId: "network-core-rtr-03",
    data: { label: "Core peer right", latency: "1 ms", status: "up", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-core-dist-01",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "10 Gbps 36%",
    sourceId: "network-core-rtr-01",
    targetId: "network-dist-sw-01",
    data: { label: "Distribution left", latency: "1 ms", status: "up", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-core-dist-02",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "10 Gbps 38%",
    sourceId: "network-core-rtr-01",
    targetId: "network-dist-sw-02",
    data: { label: "Distribution right", latency: "1 ms", status: "up", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-rtr02-dist01",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "10 Gbps 34%",
    sourceId: "network-core-rtr-02",
    targetId: "network-dist-sw-01",
    data: { label: "Left aggregation", latency: "1 ms", status: "up", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-rtr03-dist02",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "10 Gbps 31%",
    sourceId: "network-core-rtr-03",
    targetId: "network-dist-sw-02",
    data: { label: "Right aggregation", latency: "1 ms", status: "up", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-dist-peer",
    type: "edge",
    anchorMode: "floating",
    arrows: "both",
    className: "network-link-degraded",
    label: "L3 52%",
    sourceId: "network-dist-sw-01",
    targetId: "network-dist-sw-02",
    data: { label: "L3 peer", latency: "3 ms", status: "degraded", throughput: "10 Gbps" },
  },
  {
    key: "network-edge-dist01-acc01",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "1 Gbps 65%",
    sourceId: "network-dist-sw-01",
    targetId: "network-acc-sw-01",
    data: { label: "Access uplink 01", latency: "2 ms", status: "up", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-dist01-acc02",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "1 Gbps 48%",
    sourceId: "network-dist-sw-01",
    targetId: "network-acc-sw-02",
    data: { label: "Access uplink 02", latency: "2 ms", status: "up", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-dist02-acc03",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "1 Gbps 52%",
    sourceId: "network-dist-sw-02",
    targetId: "network-acc-sw-03",
    data: { label: "Access uplink 03", latency: "2 ms", status: "up", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-dist02-acc04",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-degraded",
    label: "1 Gbps 47%",
    sourceId: "network-dist-sw-02",
    targetId: "network-acc-sw-04",
    data: { label: "Access uplink 04", latency: "11 ms", status: "degraded", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-acc01-app",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "1 Gbps 70%",
    sourceId: "network-acc-sw-01",
    targetId: "network-srv-app-01",
    data: { label: "App server", latency: "1 ms", status: "up", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-acc01-db",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-down",
    label: "1 Gbps down",
    sourceId: "network-acc-sw-01",
    targetId: "network-srv-db-01",
    data: { label: "Database server", latency: "timeout", status: "down", throughput: "0 bps" },
  },
  {
    key: "network-edge-acc02-ap01",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-degraded",
    label: "1 Gbps 35%",
    sourceId: "network-acc-sw-02",
    targetId: "network-ap-01",
    data: { label: "Wireless AP 01", latency: "9 ms", status: "degraded", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-acc02-ap02",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "1 Gbps 28%",
    sourceId: "network-acc-sw-02",
    targetId: "network-ap-02",
    data: { label: "Wireless AP 02", latency: "3 ms", status: "up", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-acc03-web01",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "1 Gbps 66%",
    sourceId: "network-acc-sw-03",
    targetId: "network-srv-web-01",
    data: { label: "Web server 01", latency: "1 ms", status: "up", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-acc03-web02",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-up",
    label: "1 Gbps 62%",
    sourceId: "network-acc-sw-03",
    targetId: "network-srv-web-02",
    data: { label: "Web server 02", latency: "1 ms", status: "up", throughput: "1 Gbps" },
  },
  {
    key: "network-edge-acc04-phone",
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: "network-link-down",
    label: "100 Mbps down",
    sourceId: "network-acc-sw-04",
    targetId: "network-phone-01",
    data: { label: "Voice endpoint", latency: "timeout", status: "down", throughput: "0 bps" },
  },
];

const networkNodeTypes: NodeTypes = {
  "network-node": NetworkNode,
};

function getEdgeNodeKey(edge: NetworkEdge, side: "source" | "target") {
  return side === "source"
    ? edge.sourceNodeId ?? edge.sourceId
    : edge.targetNodeId ?? edge.targetId;
}

function getDeviceTypeCounts(nodes: NetworkNodeType[]) {
  return nodes.reduce<Record<string, number>>((counts, node) => {
    const key = node.data?.deviceType ?? "unknown";

    counts[key] = (counts[key] ?? 0) + 1;

    return counts;
  }, {});
}

function NetworkSidebar({
  linkSummary,
  nodes,
}: {
  linkSummary: Record<NetworkEdgeData["status"], number>;
  nodes: NetworkNodeType[];
}) {
  const deviceCounts = React.useMemo(() => getDeviceTypeCounts(nodes), [nodes]);
  const deviceItems = [
    { key: "router", label: "Routers", color: "#179cff" },
    { key: "switch", label: "Switches", color: "#42c65a" },
    { key: "firewall", label: "Firewalls", color: "#ff6464" },
    { key: "server", label: "Servers", color: "#a477ff" },
    { key: "wireless", label: "Wireless", color: "#f2be24" },
    { key: "phone", label: "Others", color: "#7e8a9b" },
  ];
  const linkItems = [
    { key: "up", label: "Up", color: "#35cf68", value: linkSummary.up },
    { key: "degraded", label: "Degraded", color: "#f2be24", value: linkSummary.degraded },
    { key: "down", label: "Down", color: "#ff5f67", value: linkSummary.down },
    { key: "unknown", label: "Unknown", color: "#7e8a9b", value: linkSummary.unknown },
  ];

  return (
    <aside className="network-sidebar">
      <div className="network-sidebar-header">
        <strong>Topology</strong>
        <button type="button" aria-label="Add topology item">+</button>
      </div>
      <nav className="network-sidebar-nav" aria-label="Topology navigation">
        <button className="active" type="button">Overview</button>
        <button type="button">Layers</button>
      </nav>
      <section className="network-sidebar-section">
        <h3>Device Types</h3>
        {deviceItems.map((item) => (
          <div className="network-sidebar-row" key={item.key}>
            <span className="network-sidebar-device-icon" style={{ color: item.color }} />
            <span>{item.label}</span>
            <strong>{deviceCounts[item.key] ?? 0}</strong>
          </div>
        ))}
      </section>
      <section className="network-sidebar-section">
        <h3>Link Status</h3>
        {linkItems.map((item) => (
          <div className="network-sidebar-row" key={item.key}>
            <span className="network-sidebar-dot" style={{ color: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>
    </aside>
  );
}

function NetworkDeviceDetails({ edges, node }: { edges: NetworkEdge[]; node?: NetworkNodeType }) {
  const connectedEdges = React.useMemo(() => {
    if (node == null) return [];

    return edges
      .filter((edge) => getEdgeNodeKey(edge, "source") === node.key || getEdgeNodeKey(edge, "target") === node.key)
      .map((edge) => {
        const peerKey = getEdgeNodeKey(edge, "source") === node.key
          ? getEdgeNodeKey(edge, "target")
          : getEdgeNodeKey(edge, "source");

        return {
          edge,
          peer: networkNodes.find((networkNode) => networkNode.key === peerKey),
        };
      });
  }, [edges, node]);

  if (node == null) {
    return (
      <aside className="network-device-panel">
        <div className="network-device-empty">
          <strong>No device selected</strong>
          <span>Select a topology node to inspect health, metrics, and connected links.</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="network-device-panel">
      <div className="network-device-summary">
        <span className={`network-device-summary-icon network-node-${node.data?.accent ?? "blue"} network-device-${node.data?.deviceType ?? "client"}`}>
          <span />
        </span>
        <div>
          <strong>{node.data?.title}</strong>
          <span>{node.data?.subtitle}</span>
        </div>
        <em>{node.data?.statusLabel}</em>
      </div>

      <div className="network-device-tabs">
        <button className="active" type="button">Overview</button>
        <button type="button">Interfaces ({connectedEdges.length})</button>
        <button type="button">Alerts</button>
        <button type="button">Info</button>
      </div>

      <div className="network-device-section">
        <h3>Summary</h3>
        <dl className="network-detail-list">
          <div><dt>IP Address</dt><dd>{node.data?.ip ?? "Unknown"}</dd></div>
          <div><dt>Vendor</dt><dd>{node.data?.vendor ?? "Unknown"}</dd></div>
          <div><dt>Model</dt><dd>{node.data?.model ?? "Unknown"}</dd></div>
          <div><dt>Uptime</dt><dd>{node.data?.uptime ?? "Unknown"}</dd></div>
          <div><dt>Location</dt><dd>{node.data?.location ?? "Unknown"}</dd></div>
          <div><dt>Role</dt><dd>{node.data?.role ?? node.data?.deviceType}</dd></div>
        </dl>
      </div>

      <div className="network-device-section">
        <h3>Resource Utilization</h3>
        <div className="network-utilization-list">
          <div>
            <span>CPU</span>
            <i><b style={{ width: `${node.data?.cpu ?? 0}%` }} /></i>
            <strong>{node.data?.cpu ?? 0}%</strong>
          </div>
          <div>
            <span>Memory</span>
            <i><b style={{ width: `${node.data?.memory ?? 0}%` }} /></i>
            <strong>{node.data?.memory ?? 0}%</strong>
          </div>
          <div>
            <span>Temperature</span>
            <i><b style={{ width: "38%" }} /></i>
            <strong>{node.data?.temperature ?? "n/a"}</strong>
          </div>
        </div>
      </div>

      <div className="network-device-section">
        <h3>Links</h3>
        <div className="network-link-list">
          {connectedEdges.map(({ edge, peer }) => (
            <div
              className={`network-link-card network-link-card-${edge.data?.status ?? "unknown"}`}
              key={edge.key}
            >
              <div>
                <strong>{edge.data?.label}</strong>
                <span>{peer?.data?.title ?? "Unknown peer"}</span>
              </div>
              <dl>
                <div>
                  <dt>State</dt>
                  <dd>{edge.data?.status}</dd>
                </div>
                <div>
                  <dt>Latency</dt>
                  <dd>{edge.data?.latency}</dd>
                </div>
                <div>
                  <dt>Traffic</dt>
                  <dd>{edge.data?.throughput}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>

      <div className="network-device-section">
        <h3>Recent Alerts</h3>
        <div className="network-alert-list">
          {(node.data?.status === "healthy"
            ? ["No active alerts"]
            : node.data?.status === "critical"
              ? ["Interface Gi0/1 Down", "Device unreachable"]
              : ["High CPU Utilization", "Interface errors above baseline"]
          ).map((alert) => (
            <div className={`network-alert-row network-alert-${node.data?.status ?? "unknown"}`} key={alert}>
              <span />
              <strong>{alert}</strong>
              <em>{node.data?.status === "healthy" ? "OK" : node.data?.status === "critical" ? "Critical" : "Warning"}</em>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

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
  const [selectedDeviceKey, setSelectedDeviceKey] = React.useState<string | null>("network-core-rtr-01");
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
  const selectedDevice = React.useMemo(
    () => networkNodes.find((node) => node.key === selectedDeviceKey),
    [selectedDeviceKey]
  );
  const displayEdges = React.useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        animated: animatedEdges,
        label: collapsibleEdges ? undefined : edge.label,
      })),
    [animatedEdges, collapsibleEdges, edges]
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
      <NetworkSidebar linkSummary={linkSummary} nodes={networkNodes} />
      <div className="network-canvas">
        <FlowKit
          centerOnLoad
          collapsibleEdges={collapsibleEdges}
          edgePathType={edgePathType}
          edgeRouting={{ avoidNodes: true, parallelOffset: 18 }}
          edges={displayEdges}
          nodes={networkNodes}
          nodeTypes={networkNodeTypes}
          onEdgeCollapsedChange={({ collapsed, edge, mode }) => onEdgeCollapsedChange(edge.key, collapsed, mode)}
          zoomMax={1.35}
          zoomMin={0.45}
        >
          <FlowKitGrid size={28} color="rgba(88, 124, 168, .09)" />
          <FlowKitLegend
            className="network-legend"
            items={legendItems}
            position="top-right"
            title="Status"
          />
          <FlowKitMiniMap
            className="network-mini-map"
            height={150}
            nodes={networkNodes}
            position="bottom-left"
            width={190}
            nodeClassName={(node) => `network-mini-map-node-${node.data?.deviceType ?? "unknown"}`}
          />
          <FlowKitControls />
          <FlowKitEvents
            onSelectionChange={(element) => setSelectedDeviceKey(element?.type === "network-node" ? element.key : null)}
          />
          <FlowKitGridSnap size={20} />
        </FlowKit>
      </div>
      <NetworkDeviceDetails edges={edges} node={selectedDevice} />
    </section>
  );
}
