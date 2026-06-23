import * as React from "react";
import {
  applyContainerChanges,
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
  INodeContainer,
  NetworkNode,
  NetworkNodeIcon,
  NetworkCategory,
  NetworkPresetNode,
  NetworkStatus,
  createNetworkNode,
  networkNodeTypes,
} from "../../../lib/index";

type DemoEdgeData = {
  label: string;
  latency: string;
  linkStatus: "down" | "degraded" | "up" | "unknown";
  throughput: string;
};

type DemoEdge = IEdge<DemoEdgeData>;

function edge(
  key: string,
  sourceId: string,
  targetId: string,
  label: string,
  linkStatus: DemoEdgeData["linkStatus"],
  throughput: string,
  latency: string,
  edgeLabel: string
): DemoEdge {
  return {
    key,
    type: "edge",
    anchorMode: "floating",
    arrows: "target",
    className: `network-link-${linkStatus}`,
    label: edgeLabel,
    sourceId,
    targetId,
    data: { label, latency, linkStatus, throughput },
  };
}

// Horizontal column centres (subtract 55 for node left-edge since node is 110px wide)
//  col:  -360  -160   80   310   530   700   920  1140  1360  1580  1800
// Node positions use top-left corner

const networkNodes: NetworkPresetNode[] = [
  // ── WAN Edge (y = 30 / 240) — rack-wan-edge (615,-10,620,420) 2×2 grid ──────
  createNetworkNode("internet",    "network-internet",   { x:  710, y:  30 }, { hostname: "Internet",    ip: "203.0.113.10", vendor: "Carrier",   model: "Transit",       status: "online"  }),
  createNetworkNode("cloud",       "network-cloud-aws",  { x: 1020, y:  30 }, { hostname: "AWS-Cloud",                      vendor: "Amazon",    model: "us-east-1",     status: "online"  }),
  createNetworkNode("firewall",    "network-firewall",   { x:  710, y: 240 }, { hostname: "FW-01",       ip: "10.0.0.254",   vendor: "Palo Alto", model: "PA-3220",       status: "warning" }),
  createNetworkNode("vpn-gateway", "network-vpn-gw",    { x: 1020, y: 240 }, { hostname: "VPN-GW-01",   ip: "10.0.0.253",   vendor: "Cisco",     model: "ASA-5525",      status: "online"  }),

  // ── Core — rack-core (115,390,1380,200) 3 nodes ────────────────────────────
  createNetworkNode("router",      "network-core-rtr-02",{ x:  285, y: 425 }, { hostname: "CORE-RTR-02", ip: "10.0.0.2",     vendor: "Cisco",     model: "ASR-1001-X",    status: "online"  }),
  createNetworkNode("router",      "network-core-rtr-01",{ x:  745, y: 425 }, { hostname: "CORE-RTR-01", ip: "10.0.0.1",     vendor: "Cisco",     model: "ASR-1001-X",    status: "online"  }),
  createNetworkNode("router",      "network-core-rtr-03",{ x: 1205, y: 425 }, { hostname: "CORE-RTR-03", ip: "10.0.0.3",     vendor: "Cisco",     model: "ASR-1001-X",    status: "online"  }),

  // ── Distribution — rack-b/lb/c (340,620,238,200) each 1 node ──────────────
  createNetworkNode("switch",        "network-dist-sw-01", { x:  399, y: 655 }, { hostname: "DIST-SW-01", ip: "10.0.8.11",  vendor: "Cisco", model: "Nexus 93180",   status: "online"  }),
  createNetworkNode("load-balancer", "network-lb-01",      { x:  729, y: 655 }, { hostname: "LB-01",      ip: "10.0.8.50",  vendor: "F5",    model: "BIG-IP i4800",  status: "online"  }),
  createNetworkNode("switch",        "network-dist-sw-02", { x: 1064, y: 655 }, { hostname: "DIST-SW-02", ip: "10.0.8.12",  vendor: "Cisco", model: "Nexus 93180",   status: "online"  }),

  // ── Access (y = 900) ───────────────────────────────────────────────────────
  createNetworkNode("switch", "network-acc-sw-01", { x:   80, y: 900 }, { hostname: "ACC-SW-01", ip: "10.0.16.11", vendor: "Cisco", model: "Catalyst 9300", status: "online"  }),
  createNetworkNode("switch", "network-acc-sw-02", { x:  530, y: 900 }, { hostname: "ACC-SW-02", ip: "10.0.16.12", vendor: "Cisco", model: "Catalyst 9300", status: "online"  }),
  createNetworkNode("switch", "network-acc-sw-03", { x:  980, y: 900 }, { hostname: "ACC-SW-03", ip: "10.0.16.13", vendor: "Cisco", model: "Catalyst 9300", status: "online"  }),
  createNetworkNode("switch", "network-acc-sw-04", { x: 1430, y: 900 }, { hostname: "ACC-SW-04", ip: "10.0.16.14", vendor: "Cisco", model: "Catalyst 9200", status: "warning" }),

  // ── Servers / Wireless ─────────────────────────────────────────────────────
  // rack-d (-350,1105,800,200) 3 nodes; rack-e (900,1105,510,200) 2 nodes
  createNetworkNode("server-dns",      "network-srv-dns-01", { x: -277, y: 1140 }, { hostname: "SRV-DNS-01",  ip: "10.0.32.10", vendor: "Dell",   model: "PowerEdge R450", status: "online"  }),
  createNetworkNode("server-app",      "network-srv-app-01", { x:  -10, y: 1140 }, { hostname: "SRV-APP-01",  ip: "10.0.32.21", vendor: "Dell",   model: "PowerEdge R650", status: "online"  }),
  createNetworkNode("server-database", "network-srv-db-01",  { x:  257, y: 1140 }, { hostname: "SRV-DB-01",   ip: "10.0.32.31", vendor: "Dell",   model: "PowerEdge R750", status: "offline" }),
  createNetworkNode("access-point",    "network-ap-01",      { x:  530, y: 1170 }, { hostname: "AP-01",        ip: "10.0.48.41", vendor: "Meraki", model: "MR46",           status: "warning" }),
  createNetworkNode("access-point",    "network-ap-02",      { x:  760, y: 1170 }, { hostname: "AP-02",        ip: "10.0.48.42", vendor: "Meraki", model: "MR46",           status: "online"  }),
  createNetworkNode("server-web",      "network-srv-web-01", { x:  968, y: 1140 }, { hostname: "SRV-WEB-01",  ip: "10.0.32.41", vendor: "Dell",   model: "PowerEdge R650", status: "online"  }),
  createNetworkNode("server-web",      "network-srv-web-02", { x: 1223, y: 1140 }, { hostname: "SRV-WEB-02",  ip: "10.0.32.42", vendor: "Dell",   model: "PowerEdge R650", status: "online"  }),
  createNetworkNode("ip-phone",        "network-phone-01",   { x: 1430, y: 1150 }, { hostname: "IP-PHONE-01", ip: "10.0.64.18", vendor: "Cisco",  model: "8845",           status: "offline" }),
  createNetworkNode("radio",           "network-radio-01",   { x: 1660, y: 1150 }, { hostname: "RADIO-LINK-01", ip: "10.0.72.10", vendor: "Cambium", model: "PTP 550e",    status: "online"  }),

  // ── Endpoints — rack-f (-350,1375,1200,200) 4 nodes ───────────────────────
  createNetworkNode("laptop",      "network-laptop-01", { x: -260, y: 1410 }, { hostname: "LAPTOP-01",  ip: "10.0.64.21", vendor: "Lenovo",  model: "ThinkPad X1", status: "online" }),
  createNetworkNode("workstation", "network-ws-01",     { x:   40, y: 1410 }, { hostname: "WS-ENGG-01", ip: "10.0.64.22", vendor: "HP",      model: "Z4 G5",       status: "online" }),
  createNetworkNode("iot",         "network-iot-01",    { x:  340, y: 1410 }, { hostname: "SENSOR-01",  ip: "10.0.64.80", vendor: "Siemens", model: "S7-1200",     status: "online" }),
  createNetworkNode("ip-camera",   "network-cam-01",    { x:  640, y: 1410 }, { hostname: "CAM-LOBBY",  ip: "10.0.64.91", vendor: "Axis",    model: "P3245-V",     status: "online" }),
];

const networkEdges: DemoEdge[] = [
  // WAN
  edge("e-internet-cloud",    "network-internet",    "network-cloud-aws",    "Cloud uplink",      "up",       "100 Gbps", "5 ms",    "BGP 100G"),
  edge("e-internet-fw",       "network-internet",    "network-firewall",     "ISP uplink",        "down",     "1.2 Gbps", "18 ms",   "1.2 Gbps 99%"),
  edge("e-internet-vpn",      "network-internet",    "network-vpn-gw",       "VPN uplink",        "up",       "1 Gbps",   "22 ms",   "VPN 1 Gbps"),
  edge("e-fw-core",           "network-firewall",    "network-core-rtr-01",  "Firewall transit",  "degraded", "10 Gbps",  "12 ms",   "10 Gbps 79%"),
  edge("e-vpn-core",          "network-vpn-gw",      "network-core-rtr-01",  "VPN transit",       "up",       "1 Gbps",   "3 ms",    "VPN transit"),
  // Core mesh
  edge("e-core-left",         "network-core-rtr-01", "network-core-rtr-02",  "Core peer left",    "up",       "10 Gbps",  "1 ms",    "10 Gbps 45%"),
  edge("e-core-right",        "network-core-rtr-01", "network-core-rtr-03",  "Core peer right",   "up",       "10 Gbps",  "1 ms",    "10 Gbps 42%"),
  // Core → Distribution
  edge("e-core-dist01",       "network-core-rtr-01", "network-dist-sw-01",   "Distribution left", "up",       "10 Gbps",  "1 ms",    "10 Gbps 36%"),
  edge("e-core-lb",           "network-core-rtr-01", "network-lb-01",        "LB uplink",         "up",       "10 Gbps",  "1 ms",    "10 Gbps"),
  edge("e-core-dist02",       "network-core-rtr-01", "network-dist-sw-02",   "Distribution right","up",       "10 Gbps",  "1 ms",    "10 Gbps 38%"),
  edge("e-rtr02-dist01",      "network-core-rtr-02", "network-dist-sw-01",   "Left aggregation",  "up",       "10 Gbps",  "1 ms",    "10 Gbps 34%"),
  edge("e-rtr03-dist02",      "network-core-rtr-03", "network-dist-sw-02",   "Right aggregation", "up",       "10 Gbps",  "1 ms",    "10 Gbps 31%"),
  {
    key: "e-dist-peer",
    type: "edge", anchorMode: "floating", arrows: "both",
    className: "network-link-degraded", label: "L3 52%",
    sourceId: "network-dist-sw-01", targetId: "network-dist-sw-02",
    data: { label: "L3 peer", latency: "3 ms", linkStatus: "degraded", throughput: "10 Gbps" },
  },
  // Distribution → Access
  edge("e-dist01-acc01",      "network-dist-sw-01",  "network-acc-sw-01",    "Access uplink 01",  "up",       "1 Gbps",   "2 ms",    "1 Gbps 65%"),
  edge("e-dist01-acc02",      "network-dist-sw-01",  "network-acc-sw-02",    "Access uplink 02",  "up",       "1 Gbps",   "2 ms",    "1 Gbps 48%"),
  edge("e-dist02-acc03",      "network-dist-sw-02",  "network-acc-sw-03",    "Access uplink 03",  "up",       "1 Gbps",   "2 ms",    "1 Gbps 52%"),
  edge("e-dist02-acc04",      "network-dist-sw-02",  "network-acc-sw-04",    "Access uplink 04",  "degraded", "1 Gbps",   "11 ms",   "1 Gbps 47%"),
  // Access → Servers / Wireless / Endpoints
  edge("e-acc01-dns",         "network-acc-sw-01",   "network-srv-dns-01",   "DNS server",        "up",       "1 Gbps",   "1 ms",    "1 Gbps"),
  edge("e-acc01-app",         "network-acc-sw-01",   "network-srv-app-01",   "App server",        "up",       "1 Gbps",   "1 ms",    "1 Gbps 70%"),
  edge("e-acc01-db",          "network-acc-sw-01",   "network-srv-db-01",    "Database server",   "down",     "0 bps",    "timeout", "1 Gbps down"),
  edge("e-acc02-ap01",        "network-acc-sw-02",   "network-ap-01",        "Wireless AP 01",    "degraded", "1 Gbps",   "9 ms",    "1 Gbps 35%"),
  edge("e-acc02-ap02",        "network-acc-sw-02",   "network-ap-02",        "Wireless AP 02",    "up",       "1 Gbps",   "3 ms",    "1 Gbps 28%"),
  // Load balancer → Web tier
  edge("e-lb-web01",          "network-lb-01",       "network-srv-web-01",   "Web server 01",     "up",       "10 Gbps",  "1 ms",    "LB→WEB-01"),
  edge("e-lb-web02",          "network-lb-01",       "network-srv-web-02",   "Web server 02",     "up",       "10 Gbps",  "1 ms",    "LB→WEB-02"),
  edge("e-acc03-web01",       "network-acc-sw-03",   "network-srv-web-01",   "Web uplink 01",     "up",       "1 Gbps",   "1 ms",    "1 Gbps 66%"),
  edge("e-acc04-phone",       "network-acc-sw-04",   "network-phone-01",     "Voice endpoint",    "down",     "0 bps",    "timeout", "100 Mbps down"),
  edge("e-acc04-radio",       "network-acc-sw-04",   "network-radio-01",     "Radio backhaul",    "up",       "1 Gbps",   "4 ms",    "1 Gbps"),
  // Endpoints
  edge("e-acc01-laptop",      "network-acc-sw-01",   "network-laptop-01",    "Laptop link",       "up",       "1 Gbps",   "1 ms",    "1 Gbps"),
  edge("e-acc01-ws",          "network-acc-sw-01",   "network-ws-01",        "Workstation link",  "up",       "1 Gbps",   "1 ms",    "1 Gbps"),
  edge("e-acc01-iot",         "network-acc-sw-01",   "network-iot-01",       "IoT sensor",        "up",       "100 Mbps", "2 ms",    "100 Mbps"),
  edge("e-acc02-cam",         "network-acc-sw-02",   "network-cam-01",       "IP camera",         "up",       "100 Mbps", "1 ms",    "100 Mbps"),
];

const networkContainers: INodeContainer[] = [
  {
    key: "rack-wan-edge",
    label: "WAN Edge",
    nodeKeys: ["network-internet", "network-cloud-aws", "network-firewall", "network-vpn-gw"],
    resizeToFit: false,
    position: { x: 615, y: -10 },
    style: { width: 620, height: 420 },
    className: "network-rack network-rack-edge",
  },
  {
    key: "rack-core",
    label: "Core Backbone",
    nodeKeys: ["network-core-rtr-01", "network-core-rtr-02", "network-core-rtr-03"],
    resizeToFit: false,
    position: { x: 115, y: 390 },
    style: { width: 1380, height: 200 },
    className: "network-rack network-rack-core",
  },
  {
    key: "rack-b",
    label: "Rack B — Distribution",
    nodeKeys: ["network-dist-sw-01"],
    resizeToFit: false,
    position: { x: 340, y: 620 },
    style: { width: 238, height: 200 },
    className: "network-rack network-rack-dist",
  },
  {
    key: "rack-lb",
    label: "Load Balancer",
    nodeKeys: ["network-lb-01"],
    resizeToFit: false,
    position: { x: 670, y: 620 },
    style: { width: 238, height: 200 },
    className: "network-rack network-rack-dist",
  },
  {
    key: "rack-c",
    label: "Rack C — Distribution",
    nodeKeys: ["network-dist-sw-02"],
    resizeToFit: false,
    position: { x: 1005, y: 620 },
    style: { width: 238, height: 200 },
    className: "network-rack network-rack-dist",
  },
  {
    key: "rack-d",
    label: "Rack D — Compute",
    nodeKeys: ["network-srv-dns-01", "network-srv-app-01", "network-srv-db-01"],
    resizeToFit: false,
    position: { x: -350, y: 1105 },
    style: { width: 800, height: 200 },
    className: "network-rack network-rack-server",
  },
  {
    key: "rack-e",
    label: "Rack E — Web Tier",
    nodeKeys: ["network-srv-web-01", "network-srv-web-02"],
    resizeToFit: false,
    position: { x: 900, y: 1105 },
    style: { width: 510, height: 200 },
    className: "network-rack network-rack-server",
  },
  {
    key: "rack-f",
    label: "Rack F — Endpoints",
    nodeKeys: ["network-laptop-01", "network-ws-01", "network-iot-01", "network-cam-01"],
    resizeToFit: false,
    position: { x: -350, y: 1375 },
    style: { width: 1200, height: 200 },
    className: "network-rack network-rack-server",
  },
];

function getStatusLabel(status?: NetworkStatus): string {
  switch (status) {
    case "online":  return "Online";
    case "offline": return "Offline";
    case "warning": return "Warning";
    default:        return "Unknown";
  }
}

function getCategoryCounts(nodes: NetworkPresetNode[]) {
  return nodes.reduce<Record<string, number>>((counts, node) => {
    const key = node.data?.category ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function NetworkSidebar({
  linkSummary,
  nodes,
}: {
  linkSummary: Record<DemoEdgeData["linkStatus"], number>;
  nodes: NetworkPresetNode[];
}) {
  const categoryCounts = React.useMemo(() => getCategoryCounts(nodes), [nodes]);
  const categoryItems: { key: NetworkCategory; label: string; color: string }[] = [
    { key: "infrastructure", label: "Infrastructure", color: "#3d7eff" },
    { key: "security",       label: "Security",       color: "#ff5c5c" },
    { key: "server",         label: "Servers",        color: "#a477ff" },
    { key: "endpoint",       label: "Endpoints",      color: "#49d4e6" },
    { key: "wireless",       label: "Wireless",       color: "#26de81" },
    { key: "cloud",          label: "Cloud",          color: "#fd9644" },
  ];
  const linkItems = [
    { key: "up",       label: "Up",      color: "#35cf68", value: linkSummary.up },
    { key: "degraded", label: "Degraded", color: "#f2be24", value: linkSummary.degraded },
    { key: "down",     label: "Down",    color: "#ff5f67", value: linkSummary.down },
    { key: "unknown",  label: "Unknown", color: "#7e8a9b", value: linkSummary.unknown },
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
        {categoryItems.map((item) => (
          <div className="network-sidebar-row" key={item.key}>
            <span className="network-sidebar-device-icon" style={{ color: item.color }} />
            <span>{item.label}</span>
            <strong>{categoryCounts[item.key] ?? 0}</strong>
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

function NetworkDeviceDetails({ edges, node }: { edges: DemoEdge[]; node?: NetworkPresetNode }) {
  const connectedEdges = React.useMemo(() => {
    if (node == null) return [];

    return edges
      .filter((e) => e.sourceId === node.key || e.targetId === node.key)
      .map((e) => {
        const peerKey = e.sourceId === node.key ? e.targetId : e.sourceId;
        return { edge: e, peer: networkNodes.find((n) => n.key === peerKey) };
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

  const status = node.data?.status ?? "unknown";
  const title = node.data?.hostname ?? node.data?.label ?? node.key;

  return (
    <aside className="network-device-panel">
      <div className="network-device-summary">
        <span className={`network-device-summary-icon network-node-${node.data?.category ?? "infrastructure"}`}>
          <NetworkNodeIcon nodeType={node.type} />
        </span>
        <div>
          <strong>{title}</strong>
          <span>{node.data?.label}</span>
        </div>
        <em>{getStatusLabel(status)}</em>
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
          <div><dt>Category</dt><dd>{node.data?.category ?? "Unknown"}</dd></div>
          <div><dt>Description</dt><dd>{node.data?.description ?? "Unknown"}</dd></div>
        </dl>
      </div>

      <div className="network-device-section">
        <h3>Links</h3>
        <div className="network-link-list">
          {connectedEdges.map(({ edge: e, peer }) => (
            <div
              className={`network-link-card network-link-card-${e.data?.linkStatus ?? "unknown"}`}
              key={e.key}
            >
              <div>
                <strong>{e.data?.label}</strong>
                <span>{peer?.data?.hostname ?? peer?.data?.label ?? "Unknown peer"}</span>
              </div>
              <dl>
                <div><dt>State</dt><dd>{e.data?.linkStatus}</dd></div>
                <div><dt>Latency</dt><dd>{e.data?.latency}</dd></div>
                <div><dt>Traffic</dt><dd>{e.data?.throughput}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      </div>

      <div className="network-device-section">
        <h3>Recent Alerts</h3>
        <div className="network-alert-list">
          {(status === "online"
            ? ["No active alerts"]
            : status === "offline"
              ? ["Interface Gi0/1 Down", "Device unreachable"]
              : ["High utilization", "Interface errors above baseline"]
          ).map((alert) => (
            <div className={`network-alert-row network-alert-${status}`} key={alert}>
              <span />
              <strong>{alert}</strong>
              <em>{status === "online" ? "OK" : status === "offline" ? "Critical" : "Warning"}</em>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function getTopologyLegendItems(
  nodeSummary: Record<NetworkStatus, number>,
  linkSummary: Record<DemoEdgeData["linkStatus"], number>
): FlowKitLegendItem[] {
  return [
    { key: "online-devices",  label: "Online devices",  value: nodeSummary.online,  color: "#57df84", marker: "dot" },
    { key: "warning-devices", label: "Warning devices", value: nodeSummary.warning, color: "#f6bd4a", marker: "dot" },
    { key: "offline-devices", label: "Offline devices", value: nodeSummary.offline, color: "#ff6767", marker: "dot" },
    { key: "up-links",        label: "Links up",        value: linkSummary.up,       color: "#57df84", marker: "line" },
    { key: "degraded-links",  label: "Links degraded",  value: linkSummary.degraded, color: "#f6bd4a", marker: "line" },
    { key: "down-links",      label: "Links down",      value: linkSummary.down,     color: "#ff6767", marker: "line" },
  ];
}

type NetworkDiagramProps = {
  animatedEdges: boolean;
  collapsibleEdges: boolean;
  edgePathType: EdgePathType;
};

export function NetworkDiagram({ animatedEdges, collapsibleEdges, edgePathType }: NetworkDiagramProps) {
  const [nodes, setNodes] = React.useState<NetworkPresetNode[]>(networkNodes);
  const [containers, setContainers] = React.useState<INodeContainer[]>(networkContainers);
  const [edges, setEdges] = React.useState<DemoEdge[]>(networkEdges);
  const [selectedDeviceKey, setSelectedDeviceKey] = React.useState<string | null>("network-core-rtr-01");

  const nodeSummary = React.useMemo(() => {
    const counts: Record<NetworkStatus, number> = { online: 0, offline: 0, warning: 0, unknown: 0 };
    networkNodes.forEach((node) => { counts[node.data?.status ?? "unknown"] += 1; });
    return counts;
  }, []);

  const linkSummary = React.useMemo(() => {
    const counts = { degraded: 0, down: 0, unknown: 0, up: 0 };
    edges.forEach((e) => { counts[e.data?.linkStatus ?? "unknown"] += 1; });
    return counts;
  }, [edges]);

  const legendItems = React.useMemo(
    () => getTopologyLegendItems(nodeSummary, linkSummary),
    [linkSummary, nodeSummary]
  );

  const selectedDevice = React.useMemo(
    () => nodes.find((node) => node.key === selectedDeviceKey),
    [nodes, selectedDeviceKey]
  );

  const displayEdges = React.useMemo(
    () => edges.map((e) => ({
      ...e,
      animated: animatedEdges,
      label: collapsibleEdges ? undefined : e.label,
    })),
    [animatedEdges, collapsibleEdges, edges]
  );

  React.useEffect(() => {
    if (collapsibleEdges) return;
    setEdges((curr) => curr.map((e) => ({ ...e, collapsed: false, collapseMode: undefined })));
  }, [collapsibleEdges]);

  const onEdgeCollapsedChange = React.useCallback((edgeKey: string, collapsed: boolean, mode: EdgeCollapseMode) => {
    setEdges((curr) =>
      curr.map((e) =>
        e.key === edgeKey ? { ...e, collapsed, collapseMode: collapsed ? mode : undefined } : e
      )
    );
  }, []);

  return (
    <section className="network-panel">
      <NetworkSidebar linkSummary={linkSummary} nodes={nodes} />
      <div className="network-canvas">
        <FlowKit
          centerOnLoad
          collapsibleEdges={collapsibleEdges}
          containers={containers}
          edgePathType={edgePathType}
          edgeRouting={{ avoidNodes: true, parallelOffset: 18 }}
          edges={displayEdges}
          nodes={nodes}
          nodeTypes={networkNodeTypes}
          onEdgeCollapsedChange={({ collapsed, edge: e, mode }) => onEdgeCollapsedChange(e.key, collapsed, mode)}
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
            nodes={nodes}
            position="bottom-left"
            width={190}
            nodeClassName={(node) => `network-mini-map-node-${node.data?.category ?? "unknown"}`}
          />
          <FlowKitControls />
          <FlowKitEvents
            onContainersChange={(changes) => setContainers((c) => applyContainerChanges(c, changes))}
            onNodesChange={(changes) => {
              const selectChanges = changes.filter((c) => c.type === "select");
              const positiveSelect = selectChanges.find((c) => c.selected);
              if (positiveSelect) {
                setSelectedDeviceKey(positiveSelect.key);
              } else if (selectChanges.length > 0) {
                setSelectedDeviceKey(null);
              }
              setNodes((curr) => {
                let next = curr;
                changes.forEach((change) => {
                  if (change.type === "position") {
                    next = next.map((n) => n.key === change.key ? { ...n, offset: change.offset } : n);
                  }
                });
                return next;
              });
            }}
          />
          <FlowKitGridSnap size={20} />
        </FlowKit>
      </div>
      <NetworkDeviceDetails edges={edges} node={selectedDevice} />
    </section>
  );
}
