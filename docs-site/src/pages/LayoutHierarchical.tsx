import { CodeBlock } from "../components/CodeBlock";

export function LayoutHierarchical() {
    return (
        <div>
            <div className="page-tag">Layout</div>
            <h1 className="page-title">Hierarchical Layout</h1>
            <p className="page-desc">
                <code>hierarchicalLayout</code> arranges nodes in a directed tree — top-down, bottom-up, left-right, or
                right-left — using the Dagre algorithm under the hood.
            </p>

            <div className="section">
                <h2 className="section-title">Usage</h2>
                <CodeBlock code={`import {
  hierarchicalLayout,
  toLayoutNodes,
  toLayoutEdges,
  applyLayout,
} from "@flowkit";

function applyHierarchical(nodes: INode[], edges: IEdge[]) {
  const layoutNodes = toLayoutNodes(nodes, { width: 160, height: 60 });
  const layoutEdges = toLayoutEdges(edges);

  const result = hierarchicalLayout(layoutNodes, layoutEdges, {
    direction: "TB",   // "TB" | "BT" | "LR" | "RL"
    rankSep: 80,       // vertical gap between ranks (px)
    nodeSep: 40,       // horizontal gap between sibling nodes (px)
  });

  return applyLayout(result, nodes);
}

// Usage in a button handler:
const handleLayout = () => {
  setNodes(applyHierarchical(nodes, edges));
};`} />
            </div>

            <div className="section">
                <h2 className="section-title">Helper Functions</h2>
                <table className="props-table">
                    <thead><tr><th>Function</th><th>Signature</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["toLayoutNodes", "(nodes, dims?) => LayoutNode[]", "Converts INode[] to layout input. Optionally pass default { width, height }."],
                            ["toLayoutEdges", "(edges) => LayoutEdge[]", "Converts IEdge[] to layout input."],
                            ["hierarchicalLayout", "(nodes, edges, options?) => LayoutResult", "Runs the hierarchical algorithm and returns updated node positions."],
                            ["applyLayout", "(result, nodes) => INode[]", "Merges computed offsets back into your INode array."],
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
                <h2 className="section-title">Options</h2>
                <table className="props-table">
                    <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["direction", '"TB" | "BT" | "LR" | "RL"', '"TB"', "Flow direction: top-bottom, bottom-top, left-right, right-left."],
                            ["rankSep", "number", "80", "Gap between ranks (levels) in pixels."],
                            ["nodeSep", "number", "40", "Gap between nodes within the same rank."],
                            ["edgeSep", "number", "10", "Gap between edges within the same rank."],
                            ["marginX", "number", "20", "Horizontal canvas margin."],
                            ["marginY", "number", "20", "Vertical canvas margin."],
                        ].map(([n, t, def, d]) => (
                            <tr key={n}>
                                <td><span className="prop-name">{n}</span></td>
                                <td><span className="prop-type">{t}</span></td>
                                <td className="prop-desc">{def}</td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Animating Layout Transitions</h2>
                <CodeBlock code={`import { useState, useTransition } from "react";

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [, startTransition] = useTransition();

  const handleLayout = () => {
    const laid = applyHierarchical(nodes, edges);
    // smooth transition: defer the state update
    startTransition(() => setNodes(laid));
  };

  return (
    <>
      <button onClick={handleLayout}>Auto Layout</button>
      <FlowKit nodes={nodes} edges={edges} nodeTypes={nodeTypes} />
    </>
  );
}`} />
            </div>
        </div>
    );
}
