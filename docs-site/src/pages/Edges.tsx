import { CodeBlock } from "../components/CodeBlock";

export function Edges() {
    return (
        <div>
            <div className="page-tag">Core</div>
            <h1 className="page-title">Edges</h1>
            <p className="page-desc">
                Edges connect nodes. FlowKit supports bezier, straight, step, and smooth-step path styles with
                configurable arrow markers, optional labels, and collapsible subgraphs.
            </p>

            <div className="section">
                <h2 className="section-title">IEdge Interface</h2>
                <CodeBlock code={`import type { IEdge } from "@flowkit";

/** Describes a connection between two endpoint elements or two node bounds. */
interface IEdge<T> {
  /** Stable edge identifier. Also used as the rendered SVG group id. */
  key: string;
  /** Edge renderer key. Use "edge" for the built-in renderer. */
  type: string;
  /** Source endpoint id, or source node key when anchorMode is "floating". */
  sourceId: string;
  /** Target endpoint id, or target node key when anchorMode is "floating". */
  targetId: string;
  /**
   * Use "floating" to connect node bounds instead of fixed endpoint elements.
   * In floating mode, sourceId and targetId are node keys.
   */
  anchorMode?: "endpoint" | "floating";
  /** Overrides the global edgePathType option for this edge. */
  pathType?: "bezier" | "smooth-step" | "step" | "straight";
  /** Arrow placement for the built-in edge renderer. */
  arrows?: "both" | "none" | "source" | "target";
  /** Optional text rendered near the midpoint of the built-in edge path. */
  label?: string;
  /** Enables animated styling for the built-in edge path. */
  animated?: boolean;
  /** Overrides the global collapsibleEdges option for this edge. */
  collapsible?: boolean;
  /** Controlled collapse state. Consumers persist this from onEdgeCollapsedChange. */
  collapsed?: boolean;
  /** Controlled collapse mode. Only meaningful when collapsed is true. */
  collapseMode?: "edge" | "downstream" | "upstream" | "both";
  /** Application payload passed through to custom edge renderers. */
  data?: T;
  /** Overrides global built-in route shaping for this edge. */
  routing?: {
    /** Route orthogonal/smooth-step edges around rendered node bounds when possible. */
    avoidNodes?: boolean;
    /** Pixel spacing used to fan out multiple edges between the same node pair. */
    parallelOffset?: number;
  };
  /** Inline styles applied to the built-in visible path. */
  style?: React.CSSProperties;
  /** Additional class applied to the rendered edge group. */
  className?: string;
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Anchor Modes</h2>
                <p className="section-desc">
                    <code>anchorMode</code> controls what <code>sourceId</code> and <code>targetId</code> refer to.
                </p>
                <table className="props-table">
                    <thead><tr><th>anchorMode</th><th>id resolves to</th><th>When to use</th></tr></thead>
                    <tbody>
                        <tr>
                            <td><span className="prop-name">"floating"</span></td>
                            <td><span className="prop-type">node key</span></td>
                            <td className="prop-desc">Connects node bounds. FlowKit attaches to the nearest boundary automatically.</td>
                        </tr>
                        <tr>
                            <td><span className="prop-name">"endpoint"</span></td>
                            <td><span className="prop-type">endpoint id</span></td>
                            <td className="prop-desc">Snaps to a specific Endpoint handle declared on the node. Default when anchorMode is omitted.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Floating Edges</h2>
                <CodeBlock code={`import type { IEdge } from "@flowkit";

const edges: IEdge<never>[] = [
  {
    key: "e1",
    type: "edge",
    // In floating mode, sourceId and targetId are node keys
    sourceId: "node-a",
    targetId: "node-b",
    anchorMode: "floating",
    pathType: "bezier",
    arrows: "target",
    label: "connects to",
  },
];`} />
            </div>

            <div className="section">
                <h2 className="section-title">Endpoint Edges</h2>
                <CodeBlock code={`import { Position } from "@flowkit";
import type { INode, IEdge } from "@flowkit";

const nodes: INode<{ label: string }, never>[] = [
  {
    key: "server",
    type: "server-node",
    offset: { x: 100, y: 100 },
    endpoints: [
      // Stable endpoint id used by edge sourceId/targetId
      { id: "server-out", offset: { x: 120, y: 20 }, position: Position.Right },
    ],
    data: { label: "API Server" },
  },
  {
    key: "db",
    type: "db-node",
    offset: { x: 320, y: 100 },
    endpoints: [
      { id: "db-in", offset: { x: 0, y: 20 }, position: Position.Left },
    ],
    data: { label: "Postgres" },
  },
];

// anchorMode defaults to "endpoint" — sourceId/targetId are endpoint ids
const edges: IEdge<never>[] = [
  {
    key: "e1",
    type: "edge",
    sourceId: "server-out",
    targetId: "db-in",
  },
];`} />
            </div>

            <div className="section">
                <h2 className="section-title">Path Types</h2>
                <table className="props-table">
                    <thead><tr><th>pathType</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ['"bezier"', "Smooth S-curve between nodes (default)."],
                            ['"smooth-step"', "Right-angle path with rounded corners."],
                            ['"step"', "Right-angle step path with sharp corners."],
                            ['"straight"', "Direct straight line."],
                        ].map(([v, d]) => (
                            <tr key={v}><td><span className="prop-name">{v}</span></td><td className="prop-desc">{d}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Handling Connections</h2>
                <CodeBlock code={`import { FlowKit } from "@flowkit";
import type { IEdge, Connection } from "@flowkit";

<FlowKit
  nodes={nodes}
  edges={edges}
  nodeTypes={nodeTypes}
  onConnect={(connection: Connection) => {
    const newEdge: IEdge<never> = {
      key: crypto.randomUUID(),
      type: "edge",
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      anchorMode: "floating",
    };
    setEdges(prev => [...prev, newEdge]);
  }}
/>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Collapsible Edges</h2>
                <CodeBlock code={`import type { IEdge } from "@flowkit";

const edges: IEdge<never>[] = [
  {
    key: "e1",
    type: "edge",
    sourceId: "gateway",
    targetId: "service-cluster",
    anchorMode: "floating",
    collapsible: true,
    // Controlled collapse state. Consumers persist this from onEdgeCollapsedChange.
    collapsed: false,
    // Determines what part of the graph is folded when collapsed
    collapseMode: "downstream",
  },
];

<FlowKit
  edges={edges}
  onEdgeCollapsedChange={({ key, collapsed }: { key: string; collapsed: boolean }) => {
    setEdges(prev =>
      prev.map(e => e.key === key ? { ...e, collapsed } : e)
    );
  }}
/>`} />
            </div>

            <div className="section">
                <h2 className="section-title">Typed Edge Data</h2>
                <CodeBlock code={`interface LinkData {
  bandwidth: string;
  latency: number;
  encrypted: boolean;
}

const edges: IEdge<LinkData>[] = [
  {
    key: "e1",
    type: "edge",
    sourceId: "dc-a",
    targetId: "dc-b",
    anchorMode: "floating",
    label: "10 Gbps",
    /** Application payload passed through to custom edge renderers. */
    data: { bandwidth: "10 Gbps", latency: 4, encrypted: true },
  },
];`} />
            </div>
        </div>
    );
}
