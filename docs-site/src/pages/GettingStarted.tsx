import { CodeBlock } from "../components/CodeBlock";

export function GettingStarted() {
    return (
        <div>
            <div className="page-tag">Overview</div>
            <h1 className="page-title">Getting Started</h1>
            <p className="page-desc">
                FlowKit is a local library — import it directly from the <code>lib/</code> directory during development
                or from the built <code>dist/</code> output in production.
            </p>

            <div className="section">
                <h2 className="section-title">Installation</h2>
                <p className="section-desc">Add FlowKit as a local dependency or copy the built output into your project.</p>
                <div className="install-block">
                    <span className="prompt">$</span>
                    <span>npm install ../FlowKit</span>
                </div>
                <p className="section-desc">Or, for Vite-based projects, resolve the library source directly:</p>
                <CodeBlock code={`// vite.config.ts
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@flowkit": path.resolve(__dirname, "../FlowKit/lib"),
    },
  },
});`} />
            </div>

            <div className="section">
                <h2 className="section-title">Required CSS</h2>
                <p className="section-desc">Import the FlowKit stylesheet before using any components.</p>
                <CodeBlock code={`import "@flowkit/index.css";`} />
            </div>

            <div className="section">
                <h2 className="section-title">Minimal Setup</h2>
                <p className="section-desc">
                    A FlowKit canvas requires three things: a <code>nodeTypes</code> map that links type strings to
                    React components, a <code>nodes</code> array, and an <code>edges</code> array.
                </p>
                <CodeBlock code={`import { useState } from "react";
import { FlowKit, Node } from "@flowkit";
import type { INode, IEdge, NodeComponentProps } from "@flowkit";

// 1. Define your node component
function MyNode({ node }: NodeComponentProps) {
  return (
    <div style={{ padding: "12px 20px", background: "#1c2030", borderRadius: 8 }}>
      {node.data?.label}
    </div>
  );
}

// 2. Map type strings to components
const nodeTypes = { default: MyNode };

// 3. Initial state
const initialNodes: INode[] = [
  { id: "a", type: "default", offset: { x: 100, y: 80 }, data: { label: "Node A" } },
  { id: "b", type: "default", offset: { x: 340, y: 80 }, data: { label: "Node B" } },
];

const initialEdges: IEdge[] = [
  { id: "e1", source: "a", target: "b" },
];

export function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <FlowKit
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
      />
    </div>
  );
}`} />
            </div>

            <div className="section">
                <h2 className="section-title">Key Concepts</h2>
                <div className="callout callout-tip">
                    Nodes are positioned by their top-left corner via the <code>offset</code> field —
                    <code>{"{ x, y }"}</code> in canvas coordinates. The canvas origin (0, 0) is the top-left.
                </div>
                <div className="callout callout-warn">
                    FlowKit is <strong>uncontrolled by default</strong> — you own the state.
                    Pass <code>onNodesChange</code> and <code>onEdgesChange</code> to receive updates when the user
                    moves, connects, or deletes elements.
                </div>
                <table className="props-table" style={{ marginTop: 16 }}>
                    <thead>
                        <tr>
                            <th>Concept</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span className="prop-name">INode</span></td>
                            <td className="prop-desc">The data model for a node — id, type, offset, width, height, data, style, etc.</td>
                        </tr>
                        <tr>
                            <td><span className="prop-name">IEdge</span></td>
                            <td className="prop-desc">A connection between two nodes identified by source/target id and optional endpoint ids.</td>
                        </tr>
                        <tr>
                            <td><span className="prop-name">INodeContainer</span></td>
                            <td className="prop-desc">A labeled region that groups nodes. Containers can be collapsed.</td>
                        </tr>
                        <tr>
                            <td><span className="prop-name">nodeTypes</span></td>
                            <td className="prop-desc">A map from type string → React component. Determines how each node is rendered.</td>
                        </tr>
                        <tr>
                            <td><span className="prop-name">EdgeLayer</span></td>
                            <td className="prop-desc">Wraps the canvas with proximity-based auto-connect capability.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
