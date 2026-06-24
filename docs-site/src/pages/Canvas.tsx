import { CodeBlock } from "../components/CodeBlock";

export function Canvas() {
    return (
        <div>
            <div className="page-tag">Core</div>
            <h1 className="page-title">Canvas</h1>
            <p className="page-desc">
                <code>FlowKit</code> is the root canvas component. It manages the viewport, node rendering,
                edge drawing, and all user interactions.
            </p>

            <div className="section">
                <h2 className="section-title">Minimal Setup</h2>
                <CodeBlock code={`import { useState } from "react";
import { FlowKit, applyNodeChanges, applyEdgeChanges } from "@flowkit";
import type { INode, IEdge, NodeChange, EdgeChange } from "@flowkit";

const nodeTypes = { status: StatusNode };

const initialNodes: INode<{ label: string }, never>[] = [
  {
    key: "a",
    type: "status",
    offset: { x: 80, y: 80 },
    endpoints: [],
    data: { label: "Alpha" },
  },
];

export function App() {
  const [nodes, setNodes] = useState<INode<{ label: string }, never>[]>(initialNodes);
  const [edges, setEdges] = useState<IEdge<never>[]>([]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <FlowKit
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes: NodeChange[]) =>
          setNodes(prev => applyNodeChanges(changes, prev))
        }
        onEdgesChange={(changes: EdgeChange[]) =>
          setEdges(prev => applyEdgeChanges(changes, prev))
        }
      />
    </div>
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Node Component Props</h2>
                <div className="callout callout-warn">
                    FlowKit spreads each <code>INode</code> field directly as props onto your component — there is no
                    wrapping <code>node</code> object. Destructure <code>data</code>, <code>selected</code>,{" "}
                    <code>offset</code>, and <code>endpoints</code> directly.
                </div>
                <CodeBlock code={`import type { IEndpoint } from "@flowkit";

// Define a typed props interface for each node component.
// FlowKit spreads INode fields directly — no "node" wrapper prop.
interface StatusNodeProps {
  /** Application payload passed through to custom node renderers. */
  data: {
    label: string;
    status: "online" | "offline" | "warning";
    color: string;
  };
  selected: boolean;
  /** Canvas-space position of the node's top-left corner. */
  offset: { x: number; y: number };
  /** Connection points rendered relative to this node. */
  endpoints: IEndpoint[];
}

function StatusNode({ data, selected }: StatusNodeProps) {
  const { label, status, color } = data;
  return (
    <div className={\`status-node \${selected ? "status-node--selected" : ""}\`}>
      <span className="status-node__dot" style={{ background: color }} />
      <span className="status-node__label">{label}</span>
    </div>
  );
}

// Register all components by type string
const nodeTypes: Record<string, React.ComponentType<any>> = {
  status: StatusNode,
};`} />
            </div>

            <div className="section">
                <h2 className="section-title">INode Interface</h2>
                <CodeBlock code={`/** Describes a draggable node and its endpoint definitions. */
interface INode<TData, TEndpoint> {
  /** Stable node identifier. Also used as the rendered DOM id. */
  key: string;
  /** Node renderer key. Use "node" for the built-in shape renderer. */
  type: string;
  /** Canvas-space position of the node's top-left corner. */
  offset: { x: number; y: number };
  /** Connection points rendered relative to this node. */
  endpoints: IEndpoint<TEndpoint>[];
  /** Additional class applied to the rendered node wrapper. */
  className?: string;
  /** Application payload passed through to custom node renderers. */
  data?: TData;
  /** Inline styles applied to the rendered node wrapper. */
  style?: React.CSSProperties;
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">IEdge Interface</h2>
                <CodeBlock code={`/** Describes a connection between two endpoint elements or two node bounds. */
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
  routing?: { avoidNodes?: boolean; parallelOffset?: number };
  /** Inline styles applied to the built-in visible path. */
  style?: React.CSSProperties;
  /** Additional class applied to the rendered edge group. */
  className?: string;
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Imperative Handle</h2>
                <CodeBlock code={`import { useRef } from "react";
import { FlowKit } from "@flowkit";
import type { FlowKitHandle } from "@flowkit";

function App() {
  const ref = useRef<FlowKitHandle>(null);

  return (
    <>
      <button onClick={() => ref.current?.fitView({ padding: 40 })}>Fit View</button>
      <FlowKit ref={ref} nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
    </>
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">FlowKit Props</h2>
                <table className="props-table">
                    <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["nodes", "INode[]", "Controlled node array."],
                            ["edges", "IEdge[]", "Controlled edge array."],
                            ["nodeTypes", "Record<string, ComponentType>", "Map of type string → React component."],
                            ["containers", "INodeContainer[]", "Optional grouping containers."],
                            ["onNodesChange", "(changes: NodeChange[]) => void", "Apply with applyNodeChanges."],
                            ["onEdgesChange", "(changes: EdgeChange[]) => void", "Apply with applyEdgeChanges."],
                            ["onConnect", "(connection: Connection) => void", "User drag-connects two nodes."],
                            ["onContainersChange", "(changes: ContainerChange[]) => void", "Container position or collapse changes."],
                            ["defaultViewport", "{ x: number; y: number; zoom: number }", "Initial pan/zoom."],
                            ["minZoom", "number", "Minimum zoom level (default 0.1)."],
                            ["maxZoom", "number", "Maximum zoom level (default 4)."],
                            ["snapToGrid", "number", "Snap node positions to this grid size in px."],
                            ["fitView", "boolean", "Auto-fit on first render."],
                            ["fitViewOptions", "FitViewOptions", "Padding and node filter for fitView."],
                            ["style", "React.CSSProperties", "Inline styles for the canvas wrapper."],
                            ["className", "string", "CSS class for the canvas wrapper."],
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
