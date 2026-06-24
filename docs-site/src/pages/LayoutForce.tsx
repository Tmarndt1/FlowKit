import { CodeBlock } from "../components/CodeBlock";

export function LayoutForce() {
    return (
        <div>
            <div className="page-tag">Layout</div>
            <h1 className="page-title">Force Layout</h1>
            <p className="page-desc">
                <code>forceLayout</code> positions nodes using a physics simulation — connected nodes attract,
                unconnected nodes repel — producing an organic, balanced arrangement.
            </p>

            <div className="section">
                <h2 className="section-title">Usage</h2>
                <CodeBlock code={`import {
  forceLayout,
  toLayoutNodes,
  toLayoutEdges,
  applyLayout,
} from "@flowkit";

function applyForce(nodes: INode[], edges: IEdge[]) {
  const layoutNodes = toLayoutNodes(nodes, { width: 140, height: 60 });
  const layoutEdges = toLayoutEdges(edges);

  const result = forceLayout(layoutNodes, layoutEdges, {
    iterations: 300,
    repulsion: 400,
    attraction: 0.1,
    gravity: 0.05,
  });

  return applyLayout(result, nodes);
}

const handleLayout = () => {
  setNodes(applyForce(nodes, edges));
};`} />
            </div>

            <div className="section">
                <h2 className="section-title">Options</h2>
                <table className="props-table">
                    <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["iterations", "number", "300", "Number of simulation ticks to run."],
                            ["repulsion", "number", "400", "Force pushing non-connected nodes apart."],
                            ["attraction", "number", "0.1", "Force pulling connected nodes together."],
                            ["gravity", "number", "0.05", "Pull toward canvas center (prevents drift)."],
                            ["linkDistance", "number", "120", "Ideal edge length in pixels."],
                            ["alphaDecay", "number", "0.0228", "How fast the simulation cools (0–1)."],
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
                <h2 className="section-title">Helper Reference</h2>
                <table className="props-table">
                    <thead><tr><th>Function</th><th>Description</th></tr></thead>
                    <tbody>
                        {[
                            ["toLayoutNodes(nodes, dims?)", "Converts INode[] to layout input with optional default dimensions."],
                            ["toLayoutEdges(edges)", "Converts IEdge[] to layout input."],
                            ["forceLayout(nodes, edges, options?)", "Runs force simulation and returns positioned nodes."],
                            ["applyLayout(result, nodes)", "Merges computed offsets back into INode[]."],
                        ].map(([n, d]) => (
                            <tr key={n}>
                                <td><span className="prop-name">{n}</span></td>
                                <td className="prop-desc">{d}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2 className="section-title">Choosing a Layout</h2>
                <div className="callout callout-info">
                    Use <strong>hierarchical layout</strong> when your graph has clear parent-child relationships
                    (trees, pipelines, org charts). Use <strong>force layout</strong> for peer-to-peer networks where
                    no single direction dominates (mesh networks, knowledge graphs, social graphs).
                </div>
            </div>
        </div>
    );
}
