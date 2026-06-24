import { CodeBlock } from "../components/CodeBlock";

export function Nodes() {
    return (
        <div>
            <div className="page-tag">Core</div>
            <h1 className="page-title">Nodes</h1>
            <p className="page-desc">
                Nodes are the building blocks of a FlowKit canvas. Each node has a <code>type</code> string that maps
                to a React component, plus position, connection handles, and an arbitrary <code>data</code> payload.
            </p>

            <div className="section">
                <h2 className="section-title">INode Interface</h2>
                <CodeBlock code={`import type { INode, IEndpoint } from "@flowkit";

/** Describes a draggable node and its endpoint definitions. */
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
                <h2 className="section-title">Defining a Node Component</h2>
                <div className="callout callout-warn">
                    FlowKit spreads <code>INode</code> fields directly as component props — there is no{" "}
                    <code>node</code> wrapper. Define a typed props interface that mirrors the fields you use.
                </div>
                <CodeBlock code={`import type { IEndpoint } from "@flowkit";

// 1. Type the data your node expects
interface ServiceData {
  label: string;
  version: string;
  healthy: boolean;
}

// 2. Build a props interface matching the INode fields FlowKit spreads
interface ServiceNodeProps {
  /** Application payload passed through to custom node renderers. */
  data: ServiceData;
  selected: boolean;
  /** Canvas-space position of the node's top-left corner. */
  offset: { x: number; y: number };
  /** Connection points rendered relative to this node. */
  endpoints: IEndpoint[];
}

// 3. Implement the component
function ServiceNode({ data, selected }: ServiceNodeProps) {
  return (
    <div className={\`service-node \${selected ? "service-node--selected" : ""}\`}>
      <span className="service-node__label">{data.label}</span>
      <span className="service-node__version">v{data.version}</span>
      {!data.healthy && (
        <span className="service-node__badge service-node__badge--warn">
          Unhealthy
        </span>
      )}
    </div>
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Registering Node Types</h2>
                <CodeBlock code={`import type { ComponentType } from "react";

// nodeTypes must be defined outside the render function to avoid
// unnecessary unmounts/remounts on every re-render.
const nodeTypes: Record<string, ComponentType<any>> = {
  service: ServiceNode,
  database: DatabaseNode,
  router: RouterNode,
};

export function App() {
  return (
    <FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Creating Nodes</h2>
                <CodeBlock code={`import type { INode } from "@flowkit";

interface ServiceData {
  label: string;
  version: string;
  healthy: boolean;
}

const nodes: INode<ServiceData, never>[] = [
  {
    key: "api",
    type: "service",
    offset: { x: 100, y: 80 },
    endpoints: [],           // required — use [] when no connection handles are needed
    data: { label: "API Gateway", version: "2.3.1", healthy: true },
  },
  {
    key: "auth",
    type: "service",
    offset: { x: 400, y: 80 },
    endpoints: [],
    data: { label: "Auth Service", version: "1.0.4", healthy: false },
  },
];`} />
            </div>

            <div className="section">
                <h2 className="section-title">Handling Node Changes</h2>
                <CodeBlock code={`import { useState } from "react";
import { FlowKit, applyNodeChanges } from "@flowkit";
import type { INode, NodeChange } from "@flowkit";

export function App() {
  const [nodes, setNodes] = useState<INode<ServiceData, never>[]>(initialNodes);

  return (
    <FlowKit
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={(changes: NodeChange[]) => {
        setNodes(prev => applyNodeChanges(changes, prev));
      }}
    />
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Updating Node Data</h2>
                <CodeBlock code={`// Update a single node's data immutably
function markUnhealthy(key: string) {
  setNodes((prev: INode<ServiceData, never>[]) =>
    prev.map(n =>
      n.key === key
        ? { ...n, data: { ...n.data!, healthy: false } }
        : n
    )
  );
}

// Add a node at runtime
function addNode(offset: { x: number; y: number }) {
  const newNode: INode<ServiceData, never> = {
    key: crypto.randomUUID(),
    type: "service",
    offset,
    endpoints: [],
    data: { label: "New Service", version: "0.0.1", healthy: true },
  };
  setNodes(prev => [...prev, newNode]);
}

// Remove a node
function removeNode(key: string) {
  setNodes(prev => prev.filter(n => n.key !== key));
}`} />
            </div>
        </div>
    );
}
