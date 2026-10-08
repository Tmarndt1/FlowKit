import { CodeBlock } from "../components/CodeBlock";

export function Containers() {
    return (
        <div>
            <div className="page-tag">Core</div>
            <h1 className="page-title">Containers</h1>
            <p className="page-desc">
                Containers group nodes into labelled regions on the canvas. The container automatically
                sizes itself to fit its assigned nodes. Set <code>resizeToFit: false</code> for fixed sizing.
            </p>

            <div className="section">
                <h2 className="section-title">INodeContainer Interface</h2>
                <CodeBlock code={`import type { INodeContainer } from "@flowkit";

/** Describes a visual group/container around a set of nodes. */
interface INodeContainer {
  /** Stable container identifier. */
  key: string;
  /** Selects a custom renderer from containerTypes. Defaults to the built-in container. */
  type?: string;
  /** Header text rendered in the built-in container header. */
  label?: string;
  /** Canvas-space top-left position for fixed or empty containers. Auto-fit derives it from nodes. */
  position?: { x: number; y: number };
  /** Node keys currently assigned to this container. */
  nodeKeys: string[];
  /** Hide member nodes and their edges while keeping an expandable header. */
  collapsed?: boolean;
  /** Space between container bounds and contained nodes. */
  padding?: number;
  /**
   * Fit bounds to nodes and padding, respecting minimum dimensions. Defaults to true.
   * Disabling preserves displayed bounds; manual resizing switches to false.
   */
  resizeToFit?: boolean;
  /** Extra CSS class names applied to the rendered container element. */
  className?: string;
  /**
   * Inline styles applied to the built-in container; passed through for custom renderers to apply.
   * Numeric or pixel width/height still determine fixed layout bounds; minWidth/minHeight also apply to auto-fit.
   */
  style?: React.CSSProperties;
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Collapsing Containers</h2>
                <p>
                    Set <code>collapsed: true</code> to hide every member node and its connected edges.
                    The compact header stays visible with a node count. Expanding restores the layout,
                    while nodes hidden by edge folding remain hidden. Moving a collapsed container also
                    moves its members; resizing and dropping nodes into it are disabled while collapsed.
                </p>
                <CodeBlock code={`const [containers, setContainers] = useState<INodeContainer[]>([
  { key: "validation", label: "Validation", nodeKeys: ["check", "verify"], collapsed: true },
]);

<FlowKit
  nodes={nodes}
  edges={edges}
  containers={containers}
>
  <FlowKitEvents
    onContainersChange={(changes) =>
      setContainers((current) => applyContainerChanges(current, changes))
    }
  />
</FlowKit>`} />
                <p>
                    Import <code>applyContainerChanges</code> from FlowKit. The header toggle emits
                    <code>{' { type: "collapse", key, collapsed }'}</code> through <code>onContainersChange</code>.
                    The toggle requires this handler and is disabled in read-only mode. Custom container
                    renderers receive <code>collapsed</code> and <code>onCollapsedChange(boolean)</code>
                    to render their own toggle.
                </p>
            </div>

            <div className="section">
                <h2 className="section-title">Connections on Collapsed Containers</h2>
                <p>
                    Set <code>collapsedContainerEdges="aggregate"</code> to keep external connections
                    visible when containers collapse. A collapsed side attaches to the container boundary;
                    the expanded side retains its original node endpoint. Connections internal to a collapsed
                    container disappear. When both sides collapse, FlowKit renders one summary per
                    container pair, combining connections in both directions without arrows by default.
                    Expanding restores the original edges and their data.
                </p>
                <p>
                    For connections between a fixed port and a floating node, set
                    <code>sourceAnchorMode</code> and <code>targetAnchorMode</code> independently.
                    Each side uses an endpoint ID for <code>"endpoint"</code> or a node key for
                    <code>"floating"</code>. Omitted side modes inherit <code>anchorMode</code>.
                </p>
                <CodeBlock code={`import type { ContainerEdgeAggregateArgs } from "@flowkit";

type Status = "green" | "yellow" | "red";
type EdgeData = { status: Status };
const severity = { green: 0, yellow: 1, red: 2 };
const statusColors = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };

function aggregateStatus({ edges }: ContainerEdgeAggregateArgs<EdgeData>) {
  const status = edges.reduce<Status>((worst, edge) => {
    const current = edge.data?.status ?? "green";
    return severity[current] > severity[worst] ? current : worst;
  }, "green");

  return {
    data: { status },
    style: { stroke: statusColors[status] },
    label: edges.length + " connections",
  };
}

<FlowKit
  nodes={nodes}
  edges={edges}
  containers={containers}
  collapsedContainerEdges="aggregate"
  aggregateContainerEdges={aggregateStatus}
/>`} />
                <p>
                    <code>aggregateContainerEdges</code> receives the original edges and both containers.
                    It runs only for connections between two collapsed containers, including single-edge
                    summaries, and recomputes when controlled edge data changes. Return presentation or
                    payload overrides such as <code>data</code>, <code>style</code>, <code>label</code>, or
                    a custom renderer <code>type</code>. Without a callback, summaries use the default
                    renderer with a connection-count label. Summary fold controls are disabled.
                </p>
                <p>
                    Custom edge renderers receive <code>renderInfo</code> containing resolved source and
                    target anchors plus <code>originalEdgeKeys</code>. This metadata is for rendering;
                    do not persist it into controlled edges. Selecting a summary selects its original
                    edges, so selection and deletion callbacks use real edge keys. Reverse-direction
                    connections contribute to the same summary. Callback source and target containers
                    are ordered by key for a stable identity; the original edges retain their directions.
                    Nodes hidden by edge folding remain hidden.
                    Keep each node in one container; overlapping memberships resolve to the first
                    collapsed container in array order. The default <code>"hide"</code> mode preserves
                    the existing collapse behavior.
                </p>
                <p>
                    To color summaries with CSS, return <code>className</code> instead of an inline
                    <code>style.stroke</code>. The class is applied to the edge group; set the edge color
                    variables on it so the path and hover state use the status color.
                </p>
                <CodeBlock code={`// In aggregateStatus, after computing status:
return {
  data: { status },
  className: "edge-status-" + status,
  label: edges.length + " connections",
};

/* Application CSS */
.edge-status-green { --flow-kit-edge-color: #22c55e; --flow-kit-edge-color-hover: #22c55e; }
.edge-status-yellow { --flow-kit-edge-color: #eab308; --flow-kit-edge-color-hover: #eab308; }
.edge-status-red { --flow-kit-edge-color: #ef4444; --flow-kit-edge-color-hover: #ef4444; }`} />
            </div>

            <div className="section">
                <h2 className="section-title">Basic Usage</h2>
                <CodeBlock code={`import { useState } from "react";
import { FlowKit, applyNodeChanges, applyEdgeChanges } from "@flowkit";
import type { INodeContainer, INode, IEdge, NodeChange, EdgeChange } from "@flowkit";

// Nodes are assigned to containers via nodeKeys — not by nesting in the tree
const nodes: INode<{ label: string }, never>[] = [
  {
    key: "app",
    type: "service",
    offset: { x: 40, y: 40 },
    endpoints: [],
    data: { label: "App" },
  },
  {
    key: "api",
    type: "service",
    offset: { x: 200, y: 40 },
    endpoints: [],
    data: { label: "API" },
  },
  {
    key: "db",
    type: "service",
    offset: { x: 40, y: 40 },
    endpoints: [],
    data: { label: "DB" },
  },
];

const containers: INodeContainer[] = [
  {
    key: "frontend",
    label: "Frontend",
    /** Node keys currently assigned to this container. */
    nodeKeys: ["app", "api"],
    padding: 24,
    style: {
      background: "rgba(79, 142, 247, 0.05)",
      border: "1.5px solid rgba(79, 142, 247, 0.25)",
    },
  },
  {
    key: "backend",
    label: "Backend",
    nodeKeys: ["db"],
    padding: 24,
    style: {
      background: "rgba(62, 207, 142, 0.05)",
      border: "1.5px solid rgba(62, 207, 142, 0.25)",
    },
  },
];

export function App() {
  const [nodes, setNodes] = useState<INode<{ label: string }, never>[]>(initialNodes);
  const [edges, setEdges] = useState<IEdge<never>[]>([]);
  const [containers, setContainers] = useState<INodeContainer[]>(initialContainers);

  return (
    <FlowKit
      nodes={nodes}
      edges={edges}
      containers={containers}
      nodeTypes={nodeTypes}
      onNodesChange={(changes: NodeChange[]) =>
        setNodes(prev => applyNodeChanges(changes, prev))
      }
      onEdgesChange={(changes: EdgeChange[]) =>
        setEdges(prev => applyEdgeChanges(changes, prev))
      }
    />
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Explicit Dimensions</h2>
                <p className="section-desc">
                    By default, containers resize to fit their <code>nodeKeys</code>. Pass explicit dimensions via
                    <code>style</code> and set <code>resizeToFit: false</code> to use fixed sizing.
                    Auto-fit ignores width and height, but respects minWidth and minHeight.
                    Disabling auto-fit preserves the displayed bounds; dragging a resize handle switches to fixed sizing.
                    Handle <code>onContainersChange</code> with <code>applyContainerChanges</code> to save these changes.
                </p>
                <CodeBlock code={`const container: INodeContainer = {
  key: "rack-a",
  label: "Rack A",
  nodeKeys: ["srv-1", "srv-2"],
  padding: 16,
  /**
   * Fit bounds to nodes and padding, respecting minimum dimensions. Defaults to true.
   * Disabling preserves displayed bounds; manual resizing switches to false.
   */
  resizeToFit: false,
  /**
   * Inline styles applied to the rendered container.
   * Use numeric or pixel width/height for fixed sizing; minWidth/minHeight also apply to auto-fit.
   */
  style: {
    width: 400,
    height: 300,
    background: "rgba(255,255,255,0.03)",
  },
};`} />
            </div>

            <div className="section">
                <h2 className="section-title">Moving Nodes Between Containers</h2>
                <CodeBlock code={`// Reassign a node to a different container
function moveNode(nodeKey: string, fromKey: string, toKey: string) {
  setContainers((prev: INodeContainer[]) =>
    prev.map(c => {
      if (c.key === fromKey) {
        return { ...c, nodeKeys: c.nodeKeys.filter(k => k !== nodeKey) };
      }
      if (c.key === toKey) {
        return { ...c, nodeKeys: [...c.nodeKeys, nodeKey] };
      }
      return c;
    })
  );
}`} />
            </div>
        </div>
    );
}
