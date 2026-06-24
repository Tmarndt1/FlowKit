import { CodeBlock } from "../components/CodeBlock";

export function PresetNetwork() {
    return (
        <div>
            <div className="page-tag">Presets</div>
            <h1 className="page-title">Network Preset</h1>
            <p className="page-desc">
                The network preset provides ready-made node types for infrastructure diagrams — servers, routers,
                databases, firewalls, cloud services, and more.
            </p>

            <div className="section">
                <h2 className="section-title">Setup</h2>
                <CodeBlock code={`import { FlowKit, networkNodeTypes } from "@flowkit";
import type { INode, IEdge } from "@flowkit";

export function App() {
  const [nodes, setNodes] = useState<INode[]>(initialNodes);
  const [edges, setEdges] = useState<IEdge[]>(initialEdges);

  return (
    <FlowKit
      nodes={nodes}
      edges={edges}
      nodeTypes={networkNodeTypes}
      onNodesChange={changes => setNodes(prev => applyNodeChanges(changes, prev))}
      onEdgesChange={changes => setEdges(prev => applyEdgeChanges(changes, prev))}
    />
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Creating Nodes</h2>
                <CodeBlock code={`import { createNetworkNode, createNetworkEdge } from "@flowkit";
import type { INode, IEdge } from "@flowkit";

// createNetworkNode(type, key, offset, options?)
const server: INode = createNetworkNode("server", "srv-1", { x: 100, y: 100 }, {
  label: "Web Server",
  status: "online",
  sublabel: "10.0.0.1",
});

const db: INode = createNetworkNode("database", "db-1", { x: 400, y: 100 }, {
  label: "Postgres",
  status: "online",
  sublabel: "10.0.0.5",
});

// createNetworkEdge(key, sourceId, targetId, options?)
const link: IEdge = createNetworkEdge("e1", "srv-1", "db-1", {
  label: "5432",
  animated: true,
});`} />
            </div>

            <div className="section">
                <h2 className="section-title">Available Node Types</h2>
                <table className="props-table">
                    <thead><tr><th>Type string</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ['"server"', "Generic server node."],
                            ['"database"', "Database node."],
                            ['"router"', "Network router."],
                            ['"switch"', "Network switch."],
                            ['"firewall"', "Firewall node."],
                            ['"load-balancer"', "Load balancer."],
                            ['"cloud"', "Cloud provider / region."],
                            ['"internet"', "Internet / WAN node."],
                            ['"client"', "End-user client."],
                            ['"laptop"', "Laptop device."],
                            ['"mobile"', "Mobile device."],
                            ['"dns"', "DNS server."],
                            ['"storage"', "Storage / NAS node."],
                            ['"container"', "Container / Docker node."],
                        ].map(([t, d]) => (
                            <tr key={t}>
                                <td><span className="prop-name">{t}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Node Status</h2>
                <CodeBlock code={`import { setNetworkNodeStatus } from "@flowkit";
import type { INode, NetworkNodeStatus } from "@flowkit";

// NetworkNodeStatus = "online" | "offline" | "warning" | "error" | "unknown"
function markOffline(key: string) {
  setNodes((prev: INode[]) =>
    prev.map(n =>
      n.key === key
        ? setNetworkNodeStatus(n, "offline" satisfies NetworkNodeStatus)
        : n
    )
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">createNetworkNode Options</h2>
                <table className="props-table">
                    <thead><tr><th>Option</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["label", "string", "Primary display label beneath the icon."],
                            ["sublabel", "string", "Secondary label (IP address, hostname, etc.)."],
                            ["status", '"online" | "offline" | "warning" | "error" | "unknown"', "Status indicator color."],
                            ["icon", "React.ReactNode", "Override the default icon for this node type."],
                        ].map(([n, t, d]) => (
                            <tr key={n}>
                                <td><span className="prop-name">{n}</span></td>
                                <td><span className="prop-type">{t}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
