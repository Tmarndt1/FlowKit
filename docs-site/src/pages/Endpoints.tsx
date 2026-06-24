import { CodeBlock } from "../components/CodeBlock";

export function Endpoints() {
    return (
        <div>
            <div className="page-tag">Core</div>
            <h1 className="page-title">Endpoints</h1>
            <p className="page-desc">
                Endpoints are typed connection handles placed on nodes. Users drag from an endpoint to start a
                connection. Each endpoint must be declared in the node's <code>endpoints</code> array
                <em> and </em> rendered as an <code>Endpoint</code> component inside the node.
            </p>

            <div className="section">
                <h2 className="section-title">IEndpoint Interface</h2>
                <CodeBlock code={`import type { IEndpoint } from "@flowkit";
import { Position } from "@flowkit";

/** Describes a rendered connection point on a node. */
interface IEndpoint<T = unknown> {
  /** Stable endpoint id used by edge sourceId/targetId. */
  id: string;
  /** Position relative to the parent node. */
  offset: { x: number; y: number };
  /** Side/orientation used by built-in edge path algorithms. */
  position: Position;
  /** Application payload available to connection validation. */
  data?: T;
  /** Inline styles applied to the endpoint element. */
  style?: React.CSSProperties;
}

enum Position {
  Top    = "top",
  Right  = "right",
  Bottom = "bottom",
  Left   = "left",
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Declaring & Rendering Endpoints</h2>
                <div className="callout callout-warn">
                    Both steps are required: declare each endpoint in <code>INode.endpoints</code> (so FlowKit
                    knows the connection geometry) and render an <code>Endpoint</code> component inside your
                    node (so the drag handle appears in the UI).
                </div>
                <CodeBlock code={`import { Endpoint, Position } from "@flowkit";
import type { IEndpoint, INode, IEdge } from "@flowkit";

interface ServerNodeProps {
  data: { label: string };
  selected: boolean;
  /** Canvas-space position of the node's top-left corner. */
  offset: { x: number; y: number };
  /** Connection points rendered relative to this node. */
  endpoints: IEndpoint[];
}

function ServerNode({ data, selected }: ServerNodeProps) {
  return (
    <div className={\`server-node \${selected ? "server-node--selected" : ""}\`}>
      <Endpoint
        id="out"
        nodeId="server"          // must match the parent INode key
        position={Position.Right}
        className="endpoint endpoint--out"
      />
      <Endpoint
        id="in"
        nodeId="server"
        position={Position.Left}
        className="endpoint endpoint--in"
      />
      <span>{data.label}</span>
    </div>
  );
}

// Declare matching endpoints in the node object
const nodes: INode<{ label: string }, never>[] = [
  {
    key: "server",
    type: "server",
    offset: { x: 100, y: 100 },
    endpoints: [
      // Stable endpoint id used by edge sourceId/targetId
      { id: "out", offset: { x: 160, y: 20 }, position: Position.Right },
      { id: "in",  offset: { x: 0,   y: 20 }, position: Position.Left },
    ],
    data: { label: "API Server" },
  },
];

// Edge references endpoint ids — anchorMode defaults to "endpoint"
const edges: IEdge<never>[] = [
  {
    key: "e1",
    type: "edge",
    sourceId: "out",   // stable endpoint id from the source node
    targetId: "in",    // stable endpoint id from the target node
  },
];`} />
            </div>

            <div className="section">
                <h2 className="section-title">Endpoint Component Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["id", "string", "Stable endpoint id used by edge sourceId/targetId."],
                            ["nodeId", "string", "The key of the parent node."],
                            ["position", "Position", "Side/orientation used by built-in edge path algorithms."],
                            ["style", "React.CSSProperties", "Inline styles applied to the endpoint element."],
                            ["className", "string", "CSS class for the handle element."],
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

            <div className="section">
                <h2 className="section-title">Multiple Endpoints Per Node</h2>
                <CodeBlock code={`import { Endpoint, Position } from "@flowkit";
import type { IEndpoint, INode } from "@flowkit";

interface RouterNodeProps {
  data: { label: string };
  selected: boolean;
  offset: { x: number; y: number };
  /** Connection points rendered relative to this node. */
  endpoints: IEndpoint[];
}

function RouterNode({ data, selected }: RouterNodeProps) {
  const nodeId = "rtr-1"; // must match the INode key
  return (
    <div className={\`router-node \${selected ? "router-node--selected" : ""}\`}>
      <Endpoint id="wan"  nodeId={nodeId} position={Position.Left}   className="ep ep--in" />
      <Endpoint id="lan1" nodeId={nodeId} position={Position.Right}  className="ep ep--out" />
      <Endpoint id="lan2" nodeId={nodeId} position={Position.Bottom} className="ep ep--out" />
      <Endpoint id="mgmt" nodeId={nodeId} position={Position.Top}    className="ep ep--mgmt" />
      <span>{data.label}</span>
    </div>
  );
}

const routerNode: INode<{ label: string }, never> = {
  key: "rtr-1",
  type: "router",
  offset: { x: 200, y: 150 },
  endpoints: [
    // Side/orientation used by built-in edge path algorithms
    { id: "wan",  offset: { x: 0,   y: 30 }, position: Position.Left },
    { id: "lan1", offset: { x: 120, y: 15 }, position: Position.Right },
    { id: "lan2", offset: { x: 60,  y: 60 }, position: Position.Bottom },
    { id: "mgmt", offset: { x: 60,  y: 0  }, position: Position.Top },
  ],
  data: { label: "Core Router" },
};`} />
            </div>

            <div className="section">
                <h2 className="section-title">Typed Endpoint Data</h2>
                <CodeBlock code={`// Application payload available to connection validation
interface PortData {
  protocol: "tcp" | "udp";
  port: number;
}

const node: INode<unknown, PortData> = {
  key: "srv",
  type: "server",
  offset: { x: 100, y: 100 },
  endpoints: [
    {
      id: "http",
      offset: { x: 160, y: 20 },
      position: Position.Right,
      data: { protocol: "tcp", port: 80 },
    },
    {
      id: "dns",
      offset: { x: 160, y: 50 },
      position: Position.Right,
      data: { protocol: "udp", port: 53 },
    },
  ],
  data: undefined,
};`} />
            </div>
        </div>
    );
}
