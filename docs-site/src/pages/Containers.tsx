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
   * Inline styles applied to the rendered container.
   * Use numeric or pixel width/height for fixed sizing; minWidth/minHeight also apply to auto-fit.
   */
  style?: React.CSSProperties;
}`} />
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
